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
//   H13-ABS   OPT-IN (opts.h13abs; critic lf-placevalue r2 N6): print-lint's H13-ABS band under the lowest ink, per cell.
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
            // ---- H13-ABS (OPT-IN, opts.h13abs; critic lf-placevalue r2 N6): print-lint's H13-ABS measure, ported whole -
            // the band under the LOWEST INK of the cell (own text, an svg / img / canvas, a stroked box; labels and absolute
            // pieces out) or of an EMPTY answer slot, inside the bottom pad, against 30 % of the full cell (lead ruling
            // 2026-11-08, replacing T1's 35 % of the cell less Hw) (unit_form rename=more S 57 %, value band 9999 L 43 %)
            if (opts.h13abs && !isKey && !c.classList.contains('blankrun') && cr.height >= 12 * PX && cr.width >= 12 * PX) {
                var vis = function (el) { if (typeof el.checkVisibility === 'function') return el.checkVisibility({ checkVisibilityCSS: true }); return shownEl(el); };
                var inkBot = -Infinity;
                c.querySelectorAll('*').forEach(function (d) {
                    if (!vis(d) || d.closest('[data-ws-label], .ws-letter, .ws-tab, .ws-modeltab, .ws-legacy-answer')) return;
                    var ds = getComputedStyle(d);
                    if (ds.position === 'absolute') return;
                    var own = Array.prototype.some.call(d.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); });
                    var inkEl = own || /^(svg|img|canvas)$/i.test(d.tagName) || ['Top', 'Bottom', 'Left', 'Right'].some(function (k) { return parseFloat(ds['border' + k + 'Width']) > 0 && ds['border' + k + 'Style'] !== 'none'; });
                    if (!inkEl) return;
                    var r = d.getBoundingClientRect();
                    if (!r.width && !r.height) return;
                    inkBot = Math.max(inkBot, r.bottom);
                });
                if (inkBot > -Infinity) {
                    var low = inkBot;
                    c.querySelectorAll('[data-ws-slot]').forEach(function (sl) { if (!vis(sl) || sl.closest('[data-ws-label]') || sl.textContent.trim()) return; var r = sl.getBoundingClientRect(); if (r.height) low = Math.max(low, r.bottom); });
                    var hw = 0;
                    var hv = cs.getPropertyValue('--ws-hw').trim();
                    if (hv) { var probe = document.createElement('div'); probe.style.cssText = 'position:absolute;visibility:hidden;height:' + hv; c.appendChild(probe); hw = probe.getBoundingClientRect().height; probe.remove(); }
                    if (!(hw > 0)) { var pgc = c.closest('.ws-page'); var szmm = pgc && (pgc.classList.contains('ws-S') ? 6 : pgc.classList.contains('ws-M') ? 8 : pgc.classList.contains('ws-L') ? 10 : 0); hw = (szmm || 8) * PX; }
                    var innerB = cr.bottom - (parseFloat(cs.paddingBottom) || 0);
                    var below = Math.max(innerB - low, 0);
                    var lim = 0.30 * cr.height;   // lead ruling 2026-11-08: RUBRIC H13, 30 % of the full cell (as print-lint H13-ABS / ws-empty-band EB-BAND)
                    if (lim > 0 && below >= lim) out.findings.push({ rule: 'H13-ABS', page: P, cell: no, msg: 'page ' + P + ' cell ' + no + ': an empty band ' + mm(below) + ' mm under the lowest ink of a ' + mm(cr.height) + ' mm cell (' + Math.round((below / cr.height) * 100) + '%; limit 30 % of the cell = ' + mm(lim) + ' mm): size the row to the item (RUBRIC H13, H13-ABS; critic lf-placevalue r2 N6)' });
                }
            }
            // ---- SIGNMATCH (lf-builds via the lead, 2026-11-13): a shown number sentence "a +/- b = c" whose c is what the OTHER sign
            // gives (11 - 2 = 13: an "added" wrong answer printed under the minus sign) - the shown work must keep its own operation
            if (role === 'reason-it' || role === 'error-analysis') {
                var panes = c.querySelectorAll('.mq-abbox, .mq-judge-work');
                [].forEach.call(panes.length ? panes : [c], function (pn) {
                    var t = (pn.textContent || '').replace(/\s+/g, ' ').replace(/[\u2212\u2013]/g, '-');
                    var re = /(\d+) ?([+-]) ?(\d+) ?= ?(\d+)/g, m;
                    while ((m = re.exec(t))) {
                        var a = +m[1], b = +m[3], r = +m[4], here = m[2] === '+' ? a + b : a - b, other = m[2] === '+' ? a - b : a + b;
                        if (r !== here && r === other) out.findings.push({ rule: 'SIGNMATCH', page: P, cell: no, msg: 'page ' + P + ' cell ' + no + ': "' + m[0] + '" - the answer is the other sign\'s (the wrong answer printed under the item\'s own sign; pass the wrong answer\'s slots)' });
                    }
                });
            }
            // ---- RI-DISTINCT (word-stories critic r1 F2, lead 2026-11-13): Reason It's A and B panels show DIFFERENT work - the
            // same drawing in both (the template ignored the shown answer) asks the pupil to pick between two identical solutions
            if (role === 'reason-it') {
                var boxes = c.querySelectorAll('.mq-abbox');
                if (boxes.length === 2) {
                    var sig = function (b) { var k = b.cloneNode(true); [].forEach.call(k.querySelectorAll('.mq-abtag'), function (t) { t.remove(); }); return k.innerHTML.replace(/\s+/g, ' ').trim(); };
                    if (sig(boxes[0]) === sig(boxes[1])) out.findings.push({ rule: 'RI-DISTINCT', page: P, cell: no, msg: 'page ' + P + ' cell ' + no + ': panels A and B show the same work (PT-RSN-4: two different worked solutions)' });
                }
            }
            // ---- PUPILTAG (lead ruling N10, 2026-11-13, PT-ERR-4): grey pupil work always sits under its "<Name> wrote:" label,
            // so the single grey never reads as "trace me"
            if (c.querySelector('.mq-pupil') && !/\b(wrote|chose|drew|marked):/.test(((c.querySelector('.mq-pupiltag') || {}).textContent) || '')) {
                out.findings.push({ rule: 'PUPILTAG', page: P, cell: no, msg: 'page ' + P + ' cell ' + no + ': grey pupil work with no "<Name> wrote:" label (PT-ERR-4: the grey must never read as trace)' });
            }
            // ...and right over it: a label left at the cell's top while the work centres lower reads as a page note (lf-roles r5)
            var tg = c.querySelector('.mq-pupiltag');
            var sib = tg && tg.parentElement ? [].filter.call(tg.parentElement.children, function (e) { return e !== tg && e.getBoundingClientRect().height > 0; }) : [];
            if (tg && c.querySelector('.mq-pupil') && sib.length) {
                // measured on INK (lead 2026-11-13, critic r4 n1): the top of the first text or drawing in the work, not its box (a
                // stack's box starts with padding: the label floated 8 mm over the T O heads), from the label's text foot
                var inkTop = Infinity;
                // a text box's ink: its capitals (0.7 em) centred in the line box, not the line box's top (leading)
                var capTop = function (node) {
                    var o = [], tw = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
                    for (var n = tw.nextNode(); n; n = tw.nextNode()) {
                        if (!n.nodeValue.trim() || !n.parentElement || n.parentElement.closest('.mq-pupiltag') || !shownEl(n.parentElement)) continue;
                        var fs = parseFloat(getComputedStyle(n.parentElement).fontSize) || 0, rg = document.createRange();
                        rg.selectNodeContents(n);
                        [].forEach.call(rg.getClientRects(), function (r) { if (r.height > 0 && r.width > 0) o.push(r.top + Math.max(0, (r.height - 0.7 * fs) / 2)); });
                    }
                    return o;
                };
                sib.forEach(function (e) {
                    capTop(e).forEach(function (t) { if (t < inkTop) inkTop = t; });
                    e.querySelectorAll('svg, img, .ws-box, .ws-line, .ws-check').forEach(function (g) { var r = g.getBoundingClientRect(); if (r.height > 0 && shownEl(g) && r.top < inkTop) inkTop = r.top; });
                    // a drawn box edge is ink too (a count row's train boxes are bordered divs)
                    e.querySelectorAll('*').forEach(function (g) { var cs = getComputedStyle(g); if (cs.borderTopStyle !== 'none' && parseFloat(cs.borderTopWidth) > 0) { var r = g.getBoundingClientRect(); if (r.width > 0 && r.height > 0 && shownEl(g) && r.top < inkTop) inkTop = r.top; } });
                });
                var tfs = parseFloat(getComputedStyle(tg).fontSize) || 0;
                // the label's foot: its baseline, about 0.2 em over the line box's bottom
                var tagFoot = Math.max.apply(null, rectsOfText(tg).map(function (r) { return r.bottom - Math.max(0, (r.height - 0.7 * tfs) / 2); }).concat([tg.getBoundingClientRect().top]));
                var top = isFinite(inkTop) ? inkTop : Math.min.apply(null, sib.map(function (e) { return e.getBoundingClientRect().top; }));
                // 2-4 mm (lead) with 0.5 mm for the cap-height estimate of the ink edge
                var gap = top - tagFoot;
                if (gap > 4.5 * PX || gap < 1.8 * PX) out.findings.push({ rule: 'PUPILTAG', page: P, cell: no, msg: 'page ' + P + ' cell ' + no + ': the "<Name> wrote:" label sits ' + mm(gap) + ' mm from the work it names (PT-ERR-4: right over its ink, 2-4 mm +/- 0.5; critic r3 D6 / r4 n1)' });
            }
            // ---- KEYFIT (lf-roles r10): a key's written answer stays inside its slot - "hundreds" on a 2-digit line ran past it
            if (isKey) {
                c.querySelectorAll('[data-ws-slot]').forEach(function (s) {
                    if (s.querySelector('[data-ws-slot]') || s.getAttribute('data-ws-shape') === 'open' || !shownEl(s)) return;
                    var sr = s.getBoundingClientRect();
                    if (!sr.width) return;
                    var tr = rectsOfText(s, '.mq-slottag');
                    var wide = tr.some(function (r) { return r.left < sr.left - 1.5 || r.right > sr.right + 1.5; });
                    if (wide) out.findings.push({ rule: 'KEYFIT', page: P, cell: no, msg: 'page ' + P + ' cell ' + no + ': the key writes "' + (s.textContent || '').trim().slice(0, 20) + '" past its slot (an answer never leaves its line or box)' });
                });
            }
            // ---- KEYJOIN: one slot, two answers
            if (isKey) {
                c.querySelectorAll('[data-ws-slot]').forEach(function (s) {
                    if (s.querySelector('[data-ws-slot]')) return;
                    // an OPEN slot is a zone (a judgement row, an Error Analysis redraw of the item), not one answer (lf-roles)
                    if (s.getAttribute('data-ws-shape') === 'open') return;
                    var txt = rectsOfText(s, '.mq-slottag').length ? (s.textContent || '') : '';
                    if (/\d\s*,\s+\d/.test(txt)) out.findings.push({ rule: 'KEYJOIN', page: P, cell: no, msg: 'page ' + P + ' cell ' + no + ': the key writes "' + txt.trim().slice(0, 24) + '" into ONE answer slot (H1: one answer a slot, critic lf-ops r1 check 8)' });
                });
            }
        });
    });
    // ---- EA-PAD (critic r5 D1, CL-8): an Error Analysis cell keeps its 3 mm padding - no label, work or fix box within 2.5 mm of
    // the cell's left or right rule (the number tag excepted)
    if (role === 'error-analysis') {
        pages.forEach(function (pg, pi) {
            [].forEach.call(pg.querySelectorAll('.ws-cell'), function (c, ci) {
                var j = c.querySelector('.mq-judge'); if (!j) return;
                var cr = c.getBoundingClientRect(), lo = Infinity, hi = -Infinity;
                [].forEach.call(j.querySelectorAll('*'), function (e) { var r = e.getBoundingClientRect(); if (!r.width || !r.height || !shownEl(e) || e.closest(LABEL)) return; if (r.left < lo) lo = r.left; if (r.right > hi) hi = r.right; });
                if (isFinite(lo) && (lo - cr.left < 2.5 * PX || cr.right - hi < 2.5 * PX)) out.findings.push({ rule: 'EA-PAD', page: pi + 1, cell: ci + 1, msg: 'page ' + (pi + 1) + ' cell ' + (ci + 1) + ': the work / judgement comes ' + mm(Math.min(lo - cr.left, cr.right - hi)) + ' mm from the cell rule (CL-8: 3 mm padding)' });
            });
        });
    }
    // ---- EA-ROWX (critic r1-r3 R15): on an Error Analysis page every cell of one grid column starts its Correct / Fix it judgement at
    // the same x (within 4 mm: a work a few mm wider shifts its centred group by half that - word forms drift 3.5 mm; R15 was a
    // 31 mm jump between judgement modes) - the same task in two places reads as two tasks (AX-4, C1)
    if (role === 'error-analysis') {
        pages.forEach(function (pg, pi) {
            var cols = {};
            [].forEach.call(pg.querySelectorAll('.ws-cell'), function (c) {
                var j = c.querySelector('[data-ws-slot="ea-judge"]');
                if (!j) return;
                var cr = c.getBoundingClientRect(), jr = j.getBoundingClientRect();
                var key = Math.round(cr.left / PX);
                (cols[key] = cols[key] || []).push(jr.left - cr.left);
            });
            Object.keys(cols).forEach(function (k) {
                var xs = cols[k]; if (xs.length < 2) return;
                var lo = Math.min.apply(null, xs), hi = Math.max.apply(null, xs);
                if (hi - lo > 4 * PX) out.findings.push({ rule: 'EA-ROWX', page: pi + 1, cell: 0, msg: 'page ' + (pi + 1) + ': the Correct / Fix it judgement starts at ' + mm(lo) + '-' + mm(hi) + ' mm into the cells of one column (one place a page, critic R15)' });
            });
        });
    }
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
