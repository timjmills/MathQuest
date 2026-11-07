// ws-thumb-measure — the pupil explorer's hover thumbnail, measured as a pupil sees it (ws-student-explorer THUMB legible).
'use strict';
// THUMB legibility (critic r1): installed in the page; measures a thumbnail plate as the pupil sees it. Independent of the
// module's own judge: rendered px = font size x the real on-screen scale (an element's box against its layout box; an SVG
// text against its viewBox), visible = checkVisibility (display / visibility).
//
// Round 2 (critic r2): a plate is 'cell' (the whole drawing, fitted), 'crop' (the question line over a legible window on
// the drawing's main figure) or 'text' (large-print words). PARITY replaces r1's flat "no text under 10 px": a text may be
// under 10 px only where the skill's own practice card (1366 wide) shows it that small, and never smaller than there.
// NOPICLESS: a skill whose question needs its drawing (a practice-card visual, or words that point at a picture) is never
// words-only at the L / W / B / M plates, and words-only text never points at a picture.
const POINTING = /\b(use the (time ?line|number line|graph|chart|box plot|line plot|model|picture|grid|bar|ruler|clock|table|array|tally|pictograph|diagram|fraction bars?|place.value chart)|(this|these|the) (shapes?|amount|angles?|figures?|graph|chart|model|picture|clocks?|arrays?|points?|grid|diagram|time ?line|number line|box plot|line plot|pictograph|tally chart|coins|counters|blocks|ten frames?|dots|bars?|spinner|net|prism|pizza)\b|what shape is this|each point|every coin|shown below|shaded|on the line)/i;
function installThumbMeasure(pointingSource) {
    const POINTING = new RegExp(pointingSource, "i");   // (this runs in the page: the regex comes in as its source)
    const norm = (t) => String(t || '').toLowerCase().replace(/<[^>]+>/g, ' ').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
    const vis = (n) => (typeof n.checkVisibility === 'function' ? n.checkVisibility({ visibilityProperty: true }) : n.offsetParent !== null);
    window.__mqxMeasure = (el, key) => {
        const out = { key, open: !!(el && !el.hidden), mode: el && el.dataset.mode || '', faults: [] };
        if (!out.open) return out;
        const r = el.getBoundingClientRect();
        out.rect = { x: Math.max(0, r.left), y: Math.max(0, r.top), width: Math.max(1, r.width), height: Math.max(1, r.height) };
        const frame = el.querySelector('.mqx-thumb-frame') || el;
        const fr = frame.getBoundingClientRect();
        const stage = frame.querySelector('.tvp-stage');
        out.scale = 1;
        if (stage) { const t = getComputedStyle(stage).transform; if (t && t !== 'none') { const m = new DOMMatrixReadOnly(t); out.scale = Math.round(Math.hypot(m.a, m.b) * 100) / 100; } }
        const pxOf = (n) => {
            const fs = parseFloat(getComputedStyle(n).fontSize) || 0;
            if (n instanceof SVGElement) {
                const svg = n.ownerSVGElement;
                if (!svg) return fs;
                const sb = svg.getBoundingClientRect();
                const vb = svg.viewBox && svg.viewBox.baseVal;
                const w = vb && vb.width ? vb.width : (svg.width && svg.width.baseVal && svg.width.baseVal.value) || sb.width;
                const hgt = vb && vb.height ? vb.height : (svg.height && svg.height.baseVal && svg.height.baseVal.value) || sb.height;
                return fs * Math.min(sb.width / (w || 1), sb.height / (hgt || 1));
            }
            const b = n.getBoundingClientRect();
            const k = n.offsetWidth > 0 ? b.width / n.offsetWidth : out.scale;
            return fs * k;
        };
        let minPx = 999, minTxt = '', qPx = null;
        const winEl = out.mode === 'crop' ? frame.querySelector('.mqx-thumb-window') : null;
        const clipRect = winEl ? winEl.getBoundingClientRect() : null;
        const small = [];
        const texts = [];
        let outside = '';
        for (const n of frame.querySelectorAll('*')) {
            if (!vis(n)) continue;
            const b = n.getBoundingClientRect();
            if (b.width > 0.5 && b.height > 0.5 && (b.left < fr.left - 1 || b.right > fr.right + 1 || b.top < fr.top - 1 || b.bottom > fr.bottom + 1) && !outside) {
                outside = `${n.tagName.toLowerCase()}.${String(n.className && n.className.baseVal != null ? n.className.baseVal : n.className).split(' ')[0]} ${Math.round(b.left - fr.left)},${Math.round(b.top - fr.top)} ${Math.round(b.width)}x${Math.round(b.height)} in ${Math.round(fr.width)}x${Math.round(fr.height)}`;
            }
            const tag = n.tagName.toLowerCase();
            if (n.closest('svg') && tag !== 'text' && tag !== 'tspan') continue;
            const own = [...n.childNodes].filter((c) => c.nodeType === 3 && c.textContent.trim()).map((c) => c.textContent).join(' ');
            if (!own) continue;
            if (!b.width || !b.height) continue;
            texts.push(own);
            const px = pxOf(n);
            if (px < minPx) { minPx = px; minTxt = own.trim().slice(0, 30); }
            if (qPx == null && n.closest('.mqx-thumb-crophead, .tvp-q, .tvp-instr, .mqx-thumb-text, .question-line')) qPx = px;
            // a crop clips its drawing to its window (under the question line): only what shows there is read
            const cr = clipRect || fr;
            const inFrame = b.right > cr.left && b.left < cr.right && b.bottom > cr.top && b.top < cr.bottom;
            if (px < 10 && inFrame && small.length < 40) small.push({ t: own.replace(/\s+/g, ' ').trim().slice(0, 40), px: Math.round(px * 10) / 10 });
        }
        if (qPx == null && texts.length) {   // no question line of its own: the first text the pupil reads
            for (const n of frame.querySelectorAll('*')) {
                if (!vis(n)) continue;
                if ([...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())) { qPx = pxOf(n); break; }
            }
        }
        // a bare text node in an overflowing row paints outside every element box: its own box counts too
        if (!outside && out.mode !== 'crop') {
            const range = document.createRange();
            const walker = document.createTreeWalker(frame, NodeFilter.SHOW_TEXT);
            for (let t = walker.nextNode(); t && !outside; t = walker.nextNode()) {
                if (!t.textContent.trim() || !t.parentElement || !vis(t.parentElement)) continue;
                range.selectNodeContents(t);
                const b = range.getBoundingClientRect();
                if (b.width > 0.5 && b.height > 0.5 && (b.left < fr.left - 1 || b.right > fr.right + 1 || b.top < fr.top - 1 || b.bottom > fr.bottom + 1)) {
                    outside = `text "${t.textContent.trim().slice(0, 20)}" ${Math.round(b.left - fr.left)},${Math.round(b.top - fr.top)} ${Math.round(b.width)}x${Math.round(b.height)} in ${Math.round(fr.width)}x${Math.round(fr.height)}`;
                }
            }
        }
        out.qPx = qPx == null ? null : Math.round(qPx * 10) / 10;
        out.minPx = minPx === 999 ? null : Math.round(minPx * 10) / 10;
        out.minTxt = minTxt;
        out.small = small;
        out.size = ((el.className || '').match(/mqx-thumb--(\w)/) || [])[1] || '';
        // a crop is clipped by design: what must hold is that its question line is whole and a figure shows in the window
        if (out.mode === 'crop') {
            const head = frame.querySelector('.mqx-thumb-crophead');
            const hb = head && head.getBoundingClientRect();
            const headIn = !!hb && hb.height > 0 && hb.top >= fr.top - 1 && hb.bottom <= fr.bottom + 1 && hb.left >= fr.left - 1 && hb.right <= fr.right + 1;
            const fig = [...frame.querySelectorAll('svg, img, canvas, table, [data-mq-blank], .k2-twin *, .tvp-visual *, .tvp-printed *')].some((x) => {
                if (!vis(x)) return false;
                const b = x.getBoundingClientRect();
                const w = Math.min(b.right, fr.right) - Math.max(b.left, fr.left), h = Math.min(b.bottom, fr.bottom) - Math.max(b.top, fr.top);
                return w > 24 && h > 24;
            });
            outside = headIn && fig ? '' : `crop: ${headIn ? '' : 'question line not whole in the frame; '}${fig ? '' : 'no figure in the window'}`;
        }
        out.outside = outside;
        const seen = norm(texts.join(' '));
        out.seen = seen.slice(0, 160);
        // the question, as the generator wrote it (seed 11 is the explorer's sample)
        let q = null;
        try { const [c, s] = key.split(':'); q = window.generateQuestionFor({ category: c, skill: s, seed: 11 }); } catch (e) { q = null; }
        const qn = norm(q && q.text);
        out.dup = false;
        if (qn.length >= 20) {
            const probe = qn.slice(0, 30);
            const first = seen.indexOf(probe);
            out.dup = first > -1 && seen.indexOf(probe, first + 1) > -1;
        }
        out.needsPic = !!(q && (String(q.visual || '').replace(/<[^>]*>/g, ' ').trim() || /<(svg|img|canvas|table)\b/i.test(String(q.visual || '')) || POINTING.test(String(q.text || '').replace(/<[^>]+>/g, ' '))));
        out.pointing = out.mode === 'text' ? ((texts.join(' ').match(POINTING) || [''])[0]) : '';
        out.teacher = /\bccss\b/.test(seen) || /\b\d\.[A-Z]{1,3}\.[A-Z]\.\d/.test(texts.join(' ')) ? 'CCSS code' : '';
        const ctl = [...frame.querySelectorAll('button, [role="button"]')].filter((b) => vis(b) && /hint|check|submit|reset|clear|undo|try again|show me|listen|read aloud/i.test(b.textContent || b.getAttribute('aria-label') || ''));
        if (ctl.length) out.teacher = out.teacher || `screen control "${(ctl[0].textContent || '').trim().slice(0, 24)}"`;
        const rows = [...frame.querySelectorAll('.tvp-answerrow')].filter(vis);
        if (rows.length) {
            const other = [...frame.querySelectorAll('[data-mq-blank], [data-mq-cell], [data-ws-slot], .mq-cellbox, .mq-kblank, input, select')].filter((x) => vis(x) && !x.closest('.tvp-answerrow'));
            const rest = texts.join(' ');
            out.extra = other.length > 0 || /_{3,}|=\s*\?/.test(rest) || /_{3,}|=\s*\?/.test(String(q && q.text || ''));
        } else out.extra = false;
        return out;
    };
    // the same item on its own practice card (1366 wide): every text's rendered px, smallest per string
    window.__mqxCardSizes = async (key) => {
        const [c, k] = key.split(':');
        const st = window.state;
        Object.assign(st, { quizMode: false, category: c, skill: k, gameMode: 'practice', isMixedMode: false, hasAnswered: false });
        st.currentQ = window.generateQuestionFor({ category: c, skill: k, seed: 11 });
        window.showView('gameView');
        window.renderQuestion();
        await new Promise((r) => setTimeout(r, 250));
        const root = document.getElementById('questionPaper') || document.getElementById('gameView');
        const sizes = {};
        for (const n of root.querySelectorAll('*')) {
            if (!vis(n)) continue;
            const tag = n.tagName.toLowerCase();
            if (n.closest('svg') && tag !== 'text' && tag !== 'tspan') continue;
            const own = [...n.childNodes].filter((x) => x.nodeType === 3 && x.textContent.trim()).map((x) => x.textContent).join(' ');
            if (!own) continue;
            const b = n.getBoundingClientRect();
            if (!b.width || !b.height) continue;
            let px;
            const fs = parseFloat(getComputedStyle(n).fontSize) || 0;
            if (n instanceof SVGElement) {
                const svg = n.ownerSVGElement;
                const sb = svg.getBoundingClientRect();
                const vb = svg.viewBox && svg.viewBox.baseVal;
                const w = vb && vb.width ? vb.width : (svg.width && svg.width.baseVal && svg.width.baseVal.value) || sb.width;
                const h = vb && vb.height ? vb.height : (svg.height && svg.height.baseVal && svg.height.baseVal.value) || sb.height;
                px = fs * Math.min(sb.width / (w || 1), sb.height / (h || 1));
            } else px = fs * (n.offsetWidth > 0 ? b.width / n.offsetWidth : 1);
            const t = own.replace(/\s+/g, ' ').trim().slice(0, 40);
            sizes[t] = Math.min(sizes[t] == null ? Infinity : sizes[t], Math.round(px * 10) / 10);
        }
        st.isPlaying = false;
        window.showView('homeView');
        return sizes;
    };
}
const PICTURE_SIZES = new Set(['L', 'W', 'B', 'M']);
/**
 * opts.size   the plate size the plate was drawn at (L / W / B / M / S; '' for a live hover, judged as L)
 * opts.card   { text: px } of the same item on its practice card (__mqxCardSizes); without it a text under 10 px fails
 */
function thumbFaults(m, opts = {}) {
    const f = [];
    if (!m || !m.open) return ['no thumbnail'];
    if (m.qPx == null || m.qPx < 14) f.push(`TEXTSIZE question line ${m.qPx} px (want >= 14)`);
    for (const s of m.small || []) {
        const card = opts.card ? opts.card[s.t] : undefined;
        if (card == null) { f.push(`PARITY "${s.t}" at ${s.px} px (under 10 px and not on the practice card)`); break; }
        if (s.px < card - 0.3) { f.push(`PARITY "${s.t}" at ${s.px} px (the practice card shows it at ${card} px)`); break; }
    }
    if ((m.mode === 'cell' || m.mode === 'crop') && m.scale < 0.6) f.push(`SCALE ${m.scale} (want >= 0.6)`);
    if (m.outside) f.push(`INFRAME ${m.mode === 'crop' ? '' : 'cut off: '}${m.outside}`);
    if (m.dup) f.push('NODUP the question shows twice');
    if (m.teacher) f.push(`NOTEACHER ${m.teacher}`);
    if (m.extra) f.push('NOEXTRA a second answer line under an item with its own blank');
    const size = opts.size || m.size || 'L';
    if (m.mode === 'text' && m.needsPic && PICTURE_SIZES.has(size)) f.push(`NOPICLESS words only at ${size} for a skill whose question needs its drawing`);
    if (m.pointing) f.push(`NOPICLESS words-only text points at a picture ("${m.pointing}")`);
    return f;
}
module.exports = { installThumbMeasure, thumbFaults, POINTING };
