// teacher-pdf-preview.js — the full print preview of the teacher site (owner 2026-10-31: "we need to have fast pdf
// previews of printouts").
//
//   warmPdfPreview(paper)   make the (hidden) preview frame now, so its stylesheets and fonts are loaded before
//                           anyone presses Preview (the Print sheet calls it once page 1 is drawn)
//   openPdfPreview({ title, paper, first, load, print })
//     title  the printout's name (the PDF's file name when it is saved)
//     paper  'A4' | 'Letter'
//     first  page 1's HTML when it is already drawn (the sheet's side preview): shown at once
//     load   (onProgress) => Promise<{ doc }>   the WHOLE printout — the very string Print sends
//     print  (act) => Promise                  opens the browser's print dialog for that same document
//
// One document, never a re-render: the frame holds sheetDocument(…, { paper }) — the same call, paper and stylesheets
// Print uses — and its body is the printout's pages, so every page the preview shows is a page the printer runs (each
// `.ws-page` is one fixed paper-size sheet, overflow hidden; ws-pdf-preview checks the preview's pages against
// Chrome's own PDF of the document Print sends). Only screen presentation is added (grey desk, a gap between sheets,
// a zoom that fits the window), all inside @media screen.
//
// Fast: the frame is made once and kept (hidden) — its stylesheets and the Andika faces are loaded while the teacher
// is still choosing — so opening the preview only swaps the frame's body: page 1 at once (the sheet already drew
// it), the whole printout when the shared build is ready (usually already, built in the background).
//
// "Save as PDF" is the browser's own print path (no PDF library, no server): the same dialog as Print, with the
// printout named, and a one-line hint to choose "Save as PDF" — the same vector pages, not a picture of them.
import { sheetDocument } from './print-sheet.js';
import { icon, esc } from './teacher-ui.js';

const ID = 'tvPdfPreview';
let el = null;      // the overlay, made once
let frame = null;
let fr = { paper: '', ready: null, loaded: false };   // the frame's document: its paper and its load promise
let cur = null;     // the open preview: { o, t0, tFirst, tAll, keyDown, lastFocus }

// The frame's own screen styles. The frame is a separate document, so the teacher tokens are not visible in it: the
// desk is --surface-2 (#E5E1DB) and the page shadow --shadow-1 + a soft --shadow-2, written out.
const SCREEN_CSS = '<style data-mq-preview>@media screen{html,body{background:#E5E1DB!important}'
    + 'body.mq-sheet{padding:24px 0!important;zoom:var(--mq-z,1)}'
    + '.mq-sheet>.ws-page{margin:0 auto 24px!important;box-shadow:0 1px 2px rgba(26,22,20,.10),0 8px 24px rgba(26,22,20,.14);outline:0!important}}</style>';
// Loads the regular and bold Andika faces in an empty frame (the body is replaced by the pages before it is seen).
const WARM_BODY = '<div aria-hidden="true" style="position:absolute;left:-9999px;top:0;font-family:Andika,sans-serif">0123456789 <b>Aa 0123456789</b></div>';

const isLetter = (paper) => /letter/i.test(String(paper || ''));
const pageW = (paper) => (isLetter(paper) ? 816 : 794);   // 8.5 in / 210 mm at 96 px per inch

function ensureEl() {
    if (el && el.isConnected) return;
    const host = document.getElementById('teacherApp') || document.body;
    el = document.createElement('div');
    el.id = ID;
    el.className = 'tvpdf';
    el.hidden = true;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'tvPdfTitle');
    el.innerHTML = `<div class="tvpdf-bar">
  <div class="tvpdf-name">
    <h2 class="tvpdf-title" id="tvPdfTitle"></h2>
    <p class="tvpdf-meta" id="tvPdfMeta" aria-live="polite"></p>
  </div>
  <div class="tvpdf-acts">
    <button type="button" class="tvpdf-btn tvpdf-primary" data-pdf="print">${icon('print', 20)}<span>Print</span></button>
    <button type="button" class="tvpdf-btn" data-pdf="save">${icon('download', 20)}<span>Save as PDF</span></button>
    <button type="button" class="tvpdf-btn tvpdf-x" data-pdf="close" aria-label="Close the preview">${icon('x', 22)}</button>
  </div>
</div>
<p class="tvpdf-hint" id="tvPdfHint" hidden>In the print window, choose <b>Save as PDF</b> as the printer.</p>
<div class="tvpdf-stage"><iframe class="tvpdf-frame" id="tvPdfFrame" title="Print preview: every page as it will print"></iframe></div>`;
    host.appendChild(el);
    frame = el.querySelector('#tvPdfFrame');
    fr = { paper: '', ready: null, loaded: false };
    el.addEventListener('click', onClick);
    window.addEventListener('resize', () => { if (cur) fit(); });
}

/** Load the frame's document for this paper (once; again only when the paper changes). Resolves when it is usable. */
function loadFrame(paper) {
    ensureEl();
    const p = isLetter(paper) ? 'Letter' : 'A4';
    if (fr.paper === p && fr.ready) return fr.ready;
    fr = { paper: p, loaded: false, ready: null };
    const mine = fr;
    fr.ready = new Promise((resolve) => {
        frame.onload = () => {
            if (fr !== mine) return;
            mine.loaded = true;
            const d = frame.contentDocument;
            // Esc pressed while the pages have focus (a click on a page) closes the preview too
            try { d.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePdfPreview(); }); } catch (e) { /* preview only */ }
            const fonts = (() => { try { return d.fonts && d.fonts.ready ? d.fonts.ready : null; } catch (e) { return null; } })();
            (fonts || Promise.resolve()).then(() => resolve(d), () => resolve(d));
        };
    });
    frame.srcdoc = sheetDocument(WARM_BODY, 'Preview', { paper: p }).replace('</head>', SCREEN_CSS + '</head>');
    return fr.ready;
}

/** Make the preview frame now (hidden), so Preview opens without loading anything. */
export function warmPdfPreview(paper = 'A4') {
    try { loadFrame(paper); } catch (e) { /* a warm-up only */ }
}

/** Close the preview (Esc, the close button). The frame is kept, warm, for next time. */
export function closePdfPreview() {
    if (!cur) return;
    const c = cur; cur = null;
    document.removeEventListener('keydown', c.keyDown, true);
    el.hidden = true;
    el.querySelector('#tvPdfHint').hidden = true;
    try { if (c.lastFocus && c.lastFocus.isConnected) c.lastFocus.focus(); } catch (e) { /* focus is a courtesy */ }
}

export function openPdfPreview(o) {
    closePdfPreview();
    ensureEl();
    const c = { o, t0: performance.now(), tFirst: 0, tAll: 0, pages: 0, keyPages: 0, lastFocus: document.activeElement, full: false };
    cur = c;
    el.querySelector('#tvPdfTitle').textContent = o.title || 'Worksheet';
    meta(c, 'Drawing the pages…');
    setActs(false);
    el.dataset.state = 'loading';
    ['tFirst', 'tAll', 'pages'].forEach((k) => { delete el.dataset[k]; });
    c.keyDown = (e) => {
        if (cur !== c) return;
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closePdfPreview(); return; }
        if (e.key === 'Tab') {   // keep focus inside the dialog
            const f = [...el.querySelectorAll('button:not([disabled]), iframe')];
            const i = f.indexOf(document.activeElement);
            if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
            else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
        }
    };
    document.addEventListener('keydown', c.keyDown, true);
    const ready = loadFrame(o.paper);
    // what the frame showed last time is not this printout: blank it before the overlay is seen
    if (fr.loaded) { try { frame.contentDocument.body.innerHTML = ''; } catch (e) { /* preview only */ } }
    el.hidden = false;
    el.querySelector('[data-pdf="close"]').focus();

    // Page 1 at once (already drawn by the sheet), then the whole printout in its place.
    if (o.first) ready.then(() => { if (cur === c && !c.full) put(c, o.first, false); });
    Promise.resolve()
        .then(() => o.load((i, n) => { if (cur === c && !c.full) meta(c, `Drawing the pages… ${i} of ${n}`); }))
        .then((b) => ready.then(() => b))
        .then((b) => {
            if (cur !== c) return;
            if (!b || !b.doc) { meta(c, 'These pages could not be built.'); el.dataset.state = 'error'; return; }
            put(c, b.doc, true);
        }, (e) => {
            if (cur !== c) return;
            console.warn('[pdf-preview] build failed', e);
            meta(c, 'These pages could not be built.');
            el.dataset.state = 'error';
        });
    return c;
}

async function onClick(e) {
    const b = e.target.closest('[data-pdf]');
    if (!b || !cur) return;
    const act = b.dataset.pdf;
    if (act === 'close') { closePdfPreview(); return; }
    if (b.disabled) return;
    el.querySelector('#tvPdfHint').hidden = act !== 'save';
    b.setAttribute('aria-busy', 'true');
    try { await cur.o.print(act); } catch (err) { console.warn('[pdf-preview] print', err); } finally { b.removeAttribute('aria-busy'); }
}

function setActs(on) { el.querySelectorAll('[data-pdf="print"], [data-pdf="save"]').forEach((b) => { b.disabled = !on; }); }
function meta(c, t) { if (cur === c) el.querySelector('#tvPdfMeta').textContent = t; }

function fit() {
    try {
        const d = frame.contentDocument;
        const w = frame.clientWidth || 800;
        // the page and its 24 px gutters fit the frame; never larger than real size
        const z = Math.max(0.2, Math.min(1, (w - 48) / pageW(fr.paper)));
        d.documentElement.style.setProperty('--mq-z', String(Math.round(z * 1000) / 1000));
    } catch (e) { /* preview only */ }
}

/** The pages of `html` as sheetDocument writes them into its body (its font-ready script left out). */
function bodyOf(html) {
    const m = /<body[^>]*>([\s\S]*)<\/body>/.exec(sheetDocument(html, 'Preview', { paper: fr.paper }));
    return (m ? m[1] : html).replace(/<script>[\s\S]*?<\/script>\s*$/, '');
}

function put(c, html, full) {
    const d = frame.contentDocument;
    d.body.innerHTML = bodyOf(html);
    try { frame.contentWindow.scrollTo(0, 0); } catch (e) { /* preview only */ }
    fit();
    if (!full) {
        el.dataset.state = 'first';
        c.firstPage = (d.querySelector('.mq-sheet > .ws-page') || {}).outerHTML || '';
        if (!c.tFirst) { c.tFirst = performance.now() - c.t0; el.dataset.tFirst = String(Math.round(c.tFirst)); }
        // let page 1 paint before the shared build takes the page again
        if (c.o.onFirst) requestAnimationFrame(() => setTimeout(() => c.o.onFirst(), 0));
        return;
    }
    c.full = true;
    if (c.o.onFirst) c.o.onFirst();
    const pages = [...d.querySelectorAll('.mq-sheet > .ws-page')];
    const key = pages.filter((p) => /Answer Key/.test(p.textContent || '')).length;
    c.pages = pages.length; c.keyPages = key;
    const done = () => {
        if (cur !== c) return;
        c.tAll = performance.now() - c.t0;
        if (!c.tFirst) { c.tFirst = c.tAll; el.dataset.tFirst = String(Math.round(c.tFirst)); }
        el.dataset.tAll = String(Math.round(c.tAll));
        el.dataset.pages = String(pages.length);
        el.dataset.state = 'ready';
        const pupil = pages.length - key;
        meta(c, `${pages.length} page${pages.length === 1 ? '' : 's'} to print${key ? ` · ${pupil} for pupils + ${key} answer key${key === 1 ? '' : 's'}` : ''} · ${fr.paper}`);
        setActs(true);
    };
    // ready = the pages laid out in their real fonts (the same wait Print makes before the dialog)
    try { (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(done, done); } catch (e) { done(); }
}

/** For checks: the open preview's state. */
export function pdfPreviewState() {
    if (!cur) return { open: false };
    const d = frame.contentDocument;
    return {
        open: true, state: el.dataset.state || 'loading', paper: fr.paper,
        pages: d ? d.querySelectorAll('.mq-sheet > .ws-page').length : 0,
        keyPages: cur.keyPages, tFirst: cur.tFirst || null, tAll: cur.tAll || null,
        // the instant page 1 is the printout's page 1 (no visible swap when the whole set lands)
        firstSame: cur.firstPage ? cur.firstPage === ((d && d.querySelector('.mq-sheet > .ws-page')) || {}).outerHTML : null,
        meta: el.querySelector('#tvPdfMeta').textContent || '',
    };
}

if (typeof window !== 'undefined') {
    window.tvPdfPreview = { open: openPdfPreview, close: closePdfPreview, warm: warmPdfPreview, state: pdfPreviewState };
}
