// ws-thumb-measure — the pupil explorer's hover thumbnail, measured as a pupil sees it (ws-student-explorer THUMB legible).
'use strict';
// THUMB legibility (critic r1): installed in the page; measures a thumbnail plate as the pupil sees it. Independent of the
// module's own judge: rendered px = font size x the real on-screen scale (an element's box against its layout box; an SVG
// text against its viewBox), visible = checkVisibility (display / visibility).
function installThumbMeasure() {
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
            if (qPx == null && n.closest('.tvp-q, .tvp-instr, .mqx-thumb-text, .question-line')) qPx = px;
        }
        if (qPx == null && texts.length) {   // no question line of its own: the first text the pupil reads
            for (const n of frame.querySelectorAll('*')) {
                if (!vis(n)) continue;
                if ([...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())) { qPx = pxOf(n); break; }
            }
        }
        out.qPx = qPx == null ? null : Math.round(qPx * 10) / 10;
        out.minPx = minPx === 999 ? null : Math.round(minPx * 10) / 10;
        out.minTxt = minTxt;
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
}
function thumbFaults(m) {
    const f = [];
    if (!m || !m.open) return ['no thumbnail'];
    if (m.qPx == null || m.qPx < 14) f.push(`TEXTSIZE question line ${m.qPx} px (want >= 14)`);
    if (m.minPx != null && m.minPx < 10) f.push(`TEXTSIZE "${m.minTxt}" at ${m.minPx} px (want >= 10)`);
    if (m.mode === 'cell' && m.scale < 0.6) f.push(`SCALE ${m.scale} (want >= 0.6, or the fallback)`);
    if (m.outside) f.push(`INFRAME cut off: ${m.outside}`);
    if (m.dup) f.push('NODUP the question shows twice');
    if (m.teacher) f.push(`NOTEACHER ${m.teacher}`);
    if (m.extra) f.push('NOEXTRA a second answer line under an item with its own blank');
    return f;
}
module.exports = { installThumbMeasure, thumbFaults };
