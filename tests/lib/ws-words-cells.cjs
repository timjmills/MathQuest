// tests/lib/ws-words-cells.cjs - the in-page checks of the number-name cell (`words` template, composing:number_word_form),
// lane lf-placevalue critic nwf r1 (2026-11-12), run by tests/scripts/ws-cell-checks.cjs --words-rules (opt-in, --rule-skills).
//
// `wordsChecksInPage({role, key})` runs IN the printed sheet document (page.evaluate) and returns [{rule, msg}]:
//   CLAIM-INK    N2  on a True or False? / Reason It / error-analysis PUPIL page, every number-name cell shows the claimed
//                    number in its own answer place (the line, or every H T O box): an empty place is a claim the pupil
//                    cannot judge (the key marked 825 "False" over empty boxes).
//   MODEL-ANSWER N5  on a Scripted Model / Guided / opener PUPIL page, at least one number-name cell (the Model's last state)
//                    has its answer written: "Trace the answer" over an empty line has nothing to trace.
//   WORDS-TEXT   N7  every word space of a printed name is VISIBLE: between two words of the name's text the glyphs sit at
//                    least 0.15 em apart or on different lines ("one hundredthirteen": a flex box dropped the space between a
//                    text run and an underlined span; textContent still had it, so only the glyph geometry shows it).
//   WORDS-BREAK  N8  a name over two lines breaks after "hundred": line 1 ends with "hundred" ("seven / hundred eight" split
//                    the hundreds phrase the first step reads).
//   ROW-SLOT-Y   N4  on a grid page, the answer places of the number-name cells of one row sit within 1 mm of each other up
//                    and down ("one hundred" in a two-line box sat 5 mm under its row).
// Pure in-page code: serialised whole, so it uses nothing from outside its body.

/* eslint-disable no-var */
function wordsChecksInPage(opts) {
    opts = opts || {};
    var role = opts.role || '';
    var isKey = !!opts.key;
    var MM = 96 / 25.4;
    var out = [];
    var pages = Array.prototype.slice.call(document.querySelectorAll('body > section.ws-page, body > .ws-page'));
    if (!pages.length) pages = [document.body];
    var slotsOf = function (w) { return Array.prototype.slice.call(w.querySelectorAll('[data-ws-slot="answer"], [data-ws-slot^="pv-"]')); };
    var nameOf = function (w) { return w.querySelector('[data-ws-name]') || w.firstElementChild; };
    var norm = function (s) { return String(s || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim(); };
    // the glyphs of an element in reading order: [{ch, r}] (whitespace dropped)
    var glyphs = function (el) {
        var o = [];
        var tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        for (var n = tw.nextNode(); n; n = tw.nextNode()) {
            var t = n.nodeValue;
            for (var i = 0; i < t.length; i++) {
                if (/\s| /.test(t[i])) continue;
                var rg = document.createRange(); rg.setStart(n, i); rg.setEnd(n, i + 1);
                var rs = rg.getClientRects();
                if (rs.length && rs[0].width > 0) o.push({ ch: t[i], r: rs[0] });
            }
        }
        return o;
    };
    pages.forEach(function (pg, pi) {
        var words = Array.prototype.slice.call(pg.querySelectorAll('[data-ws-words]'));
        words.forEach(function (w, wi) {
            var where = 'p' + (pi + 1) + ' name ' + (wi + 1);
            var nm = nameOf(w);
            if (nm && w.getAttribute('data-ws-words') === 'to_number') {
                var ref = norm(nm.textContent);
                var gs = glyphs(nm);
                var fs = parseFloat(getComputedStyle(nm).fontSize) || 16;
                var refNoSp = ref.replace(/ /g, '');
                if (gs.length === refNoSp.length) {
                    // WORDS-TEXT: each space of the text, seen in the glyphs
                    var k = 0, lines = [[]], lineTop = gs.length ? gs[0].r.top : 0;
                    for (var i = 0; i < ref.length; i++) {
                        if (ref[i] === ' ') {
                            var a = gs[k - 1], b = gs[k];
                            if (a && b) {
                                var newLine = b.r.top > a.r.top + a.r.height * 0.5;
                                if (!newLine && b.r.left - a.r.right < 0.15 * fs) out.push({ rule: 'WORDS-TEXT', msg: where + ' "' + ref + '": no visible space between "' + ref.slice(0, i).split(' ').pop() + '" and "' + ref.slice(i + 1).split(' ')[0] + '"' });
                            }
                            continue;
                        }
                        var g = gs[k++];
                        if (g.r.top > lineTop + g.r.height * 0.5) { lines.push([]); lineTop = g.r.top; }
                        lines[lines.length - 1].push(i);
                    }
                    // WORDS-BREAK: line 1 of a two-line name ends with "hundred"
                    if (lines.length > 1) {
                        var l1 = ref.slice(lines[0][0], lines[0][lines[0].length - 1] + 1);
                        if (!/hundred$/.test(l1)) out.push({ rule: 'WORDS-BREAK', msg: where + ' "' + ref + '" breaks after "' + l1 + '" (line 1 ends with "hundred")' });
                    }
                }
            }
            var slots = slotsOf(w);
            var ink = slots.map(function (s) { return norm(s.textContent); });
            // CLAIM-INK
            if (!isKey && /^(true-false|reason-it|error-analysis)$/.test(role) && slots.length && ink.some(function (v) { return !v; })) {
                out.push({ rule: 'CLAIM-INK', msg: where + ' "' + norm(nm ? nm.textContent : '') + '": the claimed number is not printed (' + ink.filter(function (v) { return !v; }).length + ' of ' + slots.length + ' answer places empty)' });
            }
        });
        // MODEL-ANSWER
        if (!isKey && /^(scripted-model|guided|opener)$/.test(role) && words.length) {
            var written = words.filter(function (w) { var s = slotsOf(w); return s.length && s.every(function (x) { return norm(x.textContent); }); }).length;
            if (!written) out.push({ rule: 'MODEL-ANSWER', msg: 'p' + (pi + 1) + ': ' + words.length + ' number-name cell(s), none with its answer written - the Model never shows its answer' });
        }
        // ROW-SLOT-Y: grid cells of one row (same top within 1 mm), their answer places' bottoms within 1 mm
        if (/^(independent|more-practice|test|review|true-false|mixed-practice)$/.test(role)) {
            var cells = Array.prototype.slice.call(pg.querySelectorAll('[data-ws-cell]')).filter(function (c) { return !c.parentElement.closest('[data-ws-cell]') && c.querySelector('[data-ws-words="to_number"]'); });
            var rows = [];
            cells.forEach(function (c) {
                var t = c.getBoundingClientRect().top;
                var row = rows.filter(function (r) { return Math.abs(r.top - t) < MM; })[0];
                if (!row) { row = { top: t, ys: [] }; rows.push(row); }
                var s = slotsOf(c.querySelector('[data-ws-words="to_number"]'));
                if (s.length) row.ys.push(Math.max.apply(null, s.map(function (x) { return x.getBoundingClientRect().bottom; })));
            });
            rows.forEach(function (r, ri) {
                if (r.ys.length < 2) return;
                var d = (Math.max.apply(null, r.ys) - Math.min.apply(null, r.ys)) / MM;
                if (d > 1) out.push({ rule: 'ROW-SLOT-Y', msg: 'p' + (pi + 1) + ' row ' + (ri + 1) + ': answer places ' + d.toFixed(1) + ' mm apart up and down (limit 1 mm)' });
            });
        }
    });
    return out;
}

module.exports = { wordsChecksInPage };
