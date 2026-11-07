// tests/lib/ws-cell-checks.cjs - the in-page cell checks of lane lf-ops critic r1 (build #4, 2026-11-07), shared by
// tests/scripts/ws-cell-checks.cjs (the fast gate: buildSheet -> sheetDocument -> these checks, every card role and
// option value) and tests/scripts/ws-grade-render.cjs --gate (the same findings on the critic's renders).
//
// `cellChecksInPage(opts)` runs IN the printed sheet document (page.evaluate) and returns
//   { problems: [...overflow, as ws-grade-render sheetCheck], findings: [{rule, page, cell, msg}], cells: [{page, tmpl, inkH, h}] }
// The finding rules (critic-r1.md "Automatic checks"):
//   TAGINK    check 9  an item tag (A / B / C on an error-analysis fix, .mq-slottag) whose ink meets the slot's own content
//                      (H2, CL-40; D-MP-5, D-AG-3).
//   KEYJOIN   check 8  (keys) one answer slot written with two joined answers ("15, 15") (H1; D-MP-6).
// Exempt everywhere: anchor / model cells ([data-ws-anchor], .mq-anchorgrid), the label tabs, hidden ink.
// Pure in-page code: the function is serialised whole, so it uses nothing from outside its body.

/* eslint-disable no-var */
function cellChecksInPage(opts) {
    opts = opts || {};
    var PX = 96 / 25.4;
    var mm = function (px) { return Math.round((px / PX) * 10) / 10; };
    var role = opts.role || '';
    var isKey = !!opts.key;
    var out = { problems: [], findings: [], cells: [] };
    var LABEL = '[data-ws-label], .ws-letter, .ws-tab, .ws-modeltab';
    var shownEl = function (el) {
        for (var e = el; e && e.nodeType === 1; e = e.parentElement) {
            var s = getComputedStyle(e);
            if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) return false;
        }
        return true;
    };
    var rectsOfText = function (root, skip) {
        var o = [];
        var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        for (var n = tw.nextNode(); n; n = tw.nextNode()) {
            if (!n.nodeValue.trim()) continue;
            var p = n.parentElement;
            if (!p || (skip && p.closest(skip)) || !shownEl(p)) continue;
            var rg = document.createRange();
            rg.selectNodeContents(n);
            var rs = rg.getClientRects();
            for (var i = 0; i < rs.length; i++) if (rs[i].width > 0 && rs[i].height > 0) o.push(rs[i]);
        }
        return o;
    };
    var inkRects = function (cell) {
        var o = rectsOfText(cell, LABEL);
        cell.querySelectorAll('svg').forEach(function (svg) {
            if (svg.closest(LABEL) || !shownEl(svg)) return;
            var shapes = svg.querySelectorAll('circle, ellipse, rect, path, line, polyline, polygon, text, use, image');
            if (!shapes.length) { var r0 = svg.getBoundingClientRect(); if (r0.width && r0.height) o.push(r0); return; }
            shapes.forEach(function (sh) {
                var cs = getComputedStyle(sh);
                if (cs.visibility === 'hidden' || cs.display === 'none') return;
                if ((sh.getAttribute('fill') === 'none' || cs.fill === 'none') && (cs.stroke === 'none' || !sh.getAttribute('stroke') && cs.stroke === 'none')) return;
                var r = sh.getBoundingClientRect();
                if (r.width > 0 || r.height > 0) o.push(r);
            });
        });
        cell.querySelectorAll('*').forEach(function (el) {
            if (el instanceof SVGElement || el.closest(LABEL)) return;
            var cs = getComputedStyle(el);
            var b = ['Top', 'Bottom', 'Left', 'Right'].filter(function (k) { return parseFloat(cs['border' + k + 'Width']) > 0 && cs['border' + k + 'Style'] !== 'none'; });
            if (!b.length || !shownEl(el)) return;
            var r = el.getBoundingClientRect();
            if (r.width > 0 && r.height > 0) o.push(r);
        });
        return o;
    };
    var pages = Array.prototype.slice.call(document.querySelectorAll('.ws-page'));
    pages.forEach(function (pg, pi) {
        var P = pi + 1;
        // ---- overflow (as ws-grade-render sheetCheck)
        if (pg.scrollHeight > pg.clientHeight + 1 || pg.scrollWidth > pg.clientWidth + 1) out.problems.push('page ' + P + ': content overflows the sheet');
        var body = pg.querySelector('.ws-body');
        if (body && body.scrollHeight > body.clientHeight + 1) out.problems.push('page ' + P + ': the body overflows by ' + mm(body.scrollHeight - body.clientHeight) + ' mm');
        var pr = pg.getBoundingClientRect();
        var cells = Array.prototype.slice.call(pg.querySelectorAll('[data-ws-cell]'));
        cells.forEach(function (c, k) {
            var cr = c.getBoundingClientRect();
            if (c.scrollHeight > c.clientHeight + 1 || c.scrollWidth > c.clientWidth + 1) out.problems.push('page ' + P + ' cell ' + (k + 1) + ': content overflows its cell');
            var els = c.querySelectorAll('*');
            for (var i = 0; i < els.length; i++) {
                var r = els[i].getBoundingClientRect();
                if (!r.width && !r.height) continue;
                if (r.right > cr.right + 1 || r.bottom > cr.bottom + 1 || r.left < cr.left - 1) { out.problems.push('page ' + P + ' cell ' + (k + 1) + ': <' + els[i].tagName.toLowerCase() + '> leaves the cell'); break; }
                if (r.left < pr.left - 1 || r.right > pr.right + 1) { out.problems.push('page ' + P + ' cell ' + (k + 1) + ': <' + els[i].tagName.toLowerCase() + '> leaves the page'); break; }
            }
        });
        var problemCells = cells.filter(function (c) {
            if (c.closest('.mq-anchorgrid') || c.querySelector('[data-ws-anchor]') || c.hasAttribute('data-ws-anchor')) return false;
            // a cell inside another cell (a Reason It panel, an error-analysis mat) is judged by its host
            var up = c.parentElement && c.parentElement.closest('[data-ws-cell]');
            return !up;
        });
        var tmplOf = function (c) {
            var t = c.getAttribute('data-ws-cell') || '';
            var inner = c.querySelector('[data-ws-cell]');
            return inner ? inner.getAttribute('data-ws-cell') || t : t;
        };
        problemCells.forEach(function (c) {
            var cr = c.getBoundingClientRect();
            var cs = getComputedStyle(c);
            var tmpl = tmplOf(c);
            var lab = c.querySelector(':scope > .ws-tab, :scope > .ws-letter, :scope > [data-ws-label]');
            var no = lab ? (lab.textContent || '').trim() : '?';
            var top = cr.top + (parseFloat(cs.borderTopWidth) || 0), bot = cr.bottom - (parseFloat(cs.borderBottomWidth) || 0);
            var H = bot - top;
            var ink = inkRects(c).filter(function (r) { return r.bottom > top && r.top < bot; });
            var inkH = 0;
            if (ink.length) {
                var iv = ink.map(function (r) { return [Math.max(r.top, top), Math.min(r.bottom, bot)]; }).sort(function (a, b) { return a[0] - b[0]; });
                inkH = iv[iv.length - 1][1] - iv[0][0];
            }
            out.cells.push({ page: P, tmpl: tmpl, inkH: mm(inkH), h: mm(H), w: mm(cr.width) });
            // ---- TAGINK: an item tag over its slot's own content
            c.querySelectorAll('.mq-slottag, [data-ws-tag]').forEach(function (t) {
                if (!shownEl(t)) return;
                var host = t.parentElement && (t.parentElement.closest('[data-ws-tagged], [data-ws-slot]'));
                if (!host) return;
                var tr = t.getBoundingClientRect();
                var hits = rectsOfText(host, '.mq-slottag, [data-ws-tag]').filter(function (r) {
                    var ix = Math.min(r.right, tr.right) - Math.max(r.left, tr.left), iy = Math.min(r.bottom, tr.bottom) - Math.max(r.top, tr.top);
                    return ix > 0.3 * PX && iy > 0.3 * PX;
                });
                if (hits.length) out.findings.push({ rule: 'TAGINK', page: P, cell: no, msg: 'page ' + P + ' cell ' + no + ': the tag "' + (t.textContent || '').trim() + '" prints over the answer in its box (H2, CL-40, critic lf-ops r1 check 9)' });
            });
            // ---- KEYJOIN: one slot, two answers
            if (isKey) {
                c.querySelectorAll('[data-ws-slot]').forEach(function (s) {
                    if (s.querySelector('[data-ws-slot]')) return;
                    var txt = rectsOfText(s, '.mq-slottag').length ? (s.textContent || '') : '';
                    if (/\d\s*,\s+\d/.test(txt)) out.findings.push({ rule: 'KEYJOIN', page: P, cell: no, msg: 'page ' + P + ' cell ' + no + ': the key writes "' + txt.trim().slice(0, 24) + '" into ONE answer slot (H1: one answer a slot, critic lf-ops r1 check 8)' });
                });
            }
        });
    });
    return out;
}

/** Cross-size rule (check 4, L1 "Size S ignored", D-AG-2): a practice role whose S page places the same count in the same
 *  columns as M while its drawings measure smaller at S. `runs` = [{role, size, perPage, cols, cells: [{tmpl, inkH}]}]. */
function sizeSFindings(runs) {
    const out = [];
    const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor((s.length - 1) / 2)] : 0; };
    const PIC = new Set(['arrays', 'arrays-turn']);
    for (const r of runs.filter((x) => x.size === 'S' && /^(independent|more-practice|test)$/.test(x.role))) {
        const m = runs.find((x) => x.size === 'M' && x.role === r.role && x.optsKey === r.optsKey && x.skill === r.skill);
        if (!m || !r.perPage || r.perPage !== m.perPage || r.cols !== m.cols) continue;
        const pick = (x) => x.cells.filter((c) => PIC.has(c.tmpl)).map((c) => c.inkH);
        const s = med(pick(r)), mm = med(pick(m));
        if (s > 0 && mm > 0 && s < 0.92 * mm) out.push({ rule: 'SIZE-S', msg: `${r.skill} ${r.role}${r.optsKey ? ' ' + r.optsKey : ''}: S places ${r.perPage} in ${r.cols} column(s) as M does, with drawings ${s} mm against ${mm} mm tall: S only adds white space (L1, DN-1a, critic lf-ops r1 check 4)` });
    }
    return out;
}

module.exports = { cellChecksInPage, sizeSFindings };
