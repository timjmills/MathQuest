// ws-lesson-render — render a NAMED lesson's pages to PNG for a critic, and refuse a render that is not that lesson (lane
// lf-vocab r10, critic r9 #6: the "identify lesson band" PNGs handed to the critic were blank pages titled "I Can write a
// number in expanded form" - the harness had rendered another lesson, and nothing checked).
//
//   node tests/scripts/ws-lesson-render.cjs --lesson placevalue:identify --out <dir> [--name identify] [--size L] [--seed 4242]
//        [--pages band|all]       band (default): only the pages that carry the lesson Warm-up vocabulary band (.mq-lvocab)
//   node tests/scripts/ws-lesson-render.cjs --lesson placevalue:identify --html <sheet-document.html> [--key <key.html>]
//        judge a stored sheet document instead of building one (the backtest fixtures)
//
// Builds the lesson as the app prints it (buildSheet role 'lesson', the skill's default options, practicePages 1, mixed) and
// writes <out>/<name>-<size>-pupil-<n>.png and -key-<n>.png. Checks, on every page it writes:
//   LR-TITLE  the page title (.ws-title) is the lesson's own "I Can" title (the skill provider's strings.iCan)
//   LR-BODY   the body (under the title, above the footer) is not nearly empty: >= 0.6 % of its pixels are ink, and ink lies
//             on >= 50 % of its height (a page of empty section headers inks its top quarter only - the r9 evidence)
//   LR-BAND   (--pages band) at least one page carries the vocabulary band, and the band holds ink (>= 1 % of its box)
// Prints one line per page and `ws-lesson-render: OK (n pages)` / `FAIL (n)`.
'use strict';
const fs = require('fs');
const path = require('path');
const { open } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const LESSON = arg('lesson', null);
const SIZE = arg('size', 'L');
const SEED = Number(arg('seed', 4242));
const PAGES = arg('pages', 'band');
const HTML = arg('html', null);
const KEYHTML = arg('key', null);
const OUT = arg('out', null);
const NAME = arg('name', LESSON ? LESSON.split(':')[1] : 'lesson');
const BODY_MIN = 0.006, ROWS_MIN = 0.5, BAND_MIN = 0.01;

(async () => {
    if (!LESSON || !/^[\w]+:[\w]+$/.test(LESSON)) { console.log('ws-lesson-render: --lesson <category:skill> is required'); console.log('ws-lesson-render: FAIL'); process.exit(1); }
    if (!HTML && !OUT) { console.log('ws-lesson-render: --out <dir> is required'); console.log('ws-lesson-render: FAIL'); process.exit(1); }
    const [categoryId, skillId] = LESSON.split(':');
    const app = await open({ seed: 1 });
    const { page } = app;
    const fails = [];
    let written = 0;
    try {
        const built = await page.evaluate(async (a) => {
            const C = await import('./js/modules/sheet/index.js');
            const pr = C.getProvider(a.categoryId, a.skillId);
            // (the provider's strings may read the item: ask with a dealt item of the skill's default options)
            const q = window.generateQuestionFor({ category: a.categoryId, skill: a.skillId, seed: a.seed });
            let s = pr && pr.strings;
            try { if (typeof s === 'function') s = s(q); } catch (e) { s = null; }
            const iCan = s ? String(typeof s.iCan === 'function' ? s.iCan(q) : s.iCan || '') : '';
            if (a.html) return { iCan, pupil: null };
            const r = await window.buildSheet({ role: 'lesson', sections: [{ skills: [{ categoryId: a.categoryId, skillId: a.skillId }] }], size: a.size, paper: 'A4', seed: a.seed, key: true, practicePages: 1, mixed: true });
            return { iCan, pupil: window.sheetDocument(r.pupilHtml, 'pupil', { paper: 'A4' }), key: window.sheetDocument(r.keyHtml || '', 'key', { paper: 'A4' }) };
        }, { categoryId, skillId, size: SIZE, seed: SEED, html: !!HTML });
        const want = String(built.iCan || '').trim();
        if (!want) fails.push(`LR-TITLE ${LESSON}: the skill has no provider "I Can" title to check against`);
        const docs = [['pupil', HTML ? fs.readFileSync(HTML, 'utf8') : built.pupil], ['key', KEYHTML ? fs.readFileSync(KEYHTML, 'utf8') : (HTML ? null : built.key)]].filter((d) => d[1]);
        let bandIdx = null;
        // (a stored document names the server it was built on: point its stylesheets at this run's server)
        const origin = new URL(page.url()).origin + '/';
        for (const d of docs) d[1] = String(d[1]).replace(/http:\/\/(127\.0\.0\.1|localhost):\d+\//g, origin);
        for (const [kind, doc] of docs) {
            const tab = await app.browser.newPage();
            try {
                await tab.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
                await tab.goto(page.url(), { waitUntil: 'domcontentloaded' });
                await tab.emulateMediaType('print');
                await tab.setContent(doc, { waitUntil: 'networkidle0', timeout: 60000 });
                await tab.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', { timeout: 15000 }).catch(() => {});
                await tab.evaluate(() => document.fonts && document.fonts.ready);
                await new Promise((r) => setTimeout(r, 300));
                const geo = await tab.evaluate(() => {
                    const R = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }; };
                    return [...document.querySelectorAll('section.ws-page')].map((pg) => {
                        const t = pg.querySelector('.ws-title'), f = pg.querySelector('.ws-foot'), b = pg.querySelector('.mq-lvocab');
                        const tt = t ? (t.firstChild && t.firstChild.nodeType === 3 ? t.firstChild.textContent : t.textContent) : '';
                        return { page: R(pg), title: String(tt).replace(/\s+/g, ' ').trim(), titleBottom: t ? R(t).y + R(t).h : R(pg).y, footTop: f ? R(f).y : R(pg).y + R(pg).h, band: b ? R(b) : null };
                    });
                });
                const shot = await tab.screenshot({ fullPage: true, encoding: 'base64' });
                const ink = await tab.evaluate(async ({ shot, geo }) => {
                    const img = new Image();
                    await new Promise((ok, no) => { img.onload = ok; img.onerror = no; img.src = 'data:image/png;base64,' + shot; });
                    const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
                    const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0);
                    const data = cx.getImageData(0, 0, cv.width, cv.height).data;
                    const frac = (x0, y0, x1, y1) => {
                        x0 = Math.max(0, Math.ceil(x0)); y0 = Math.max(0, Math.ceil(y0)); x1 = Math.min(cv.width, Math.floor(x1)); y1 = Math.min(cv.height, Math.floor(y1));
                        let n = 0, k = 0;
                        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = (y * cv.width + x) * 4; n++; if ((data[i] + data[i + 1] + data[i + 2]) / 3 < 140) k++; }
                        return n ? k / n : 0;
                    };
                    // the share of the body's height that holds ink away from the page's side rules (60 px in): a page of
                    // empty section headers inks its top quarter only
                    const rowsInked = (x0, y0, x1, y1) => {
                        x0 = Math.max(0, Math.ceil(x0)); y0 = Math.max(0, Math.ceil(y0)); x1 = Math.min(cv.width, Math.floor(x1)); y1 = Math.min(cv.height, Math.floor(y1));
                        let n = 0, k = 0;
                        for (let y = y0; y < y1; y++) { n++; for (let x = x0; x < x1; x++) { const i = (y * cv.width + x) * 4; if ((data[i] + data[i + 1] + data[i + 2]) / 3 < 140) { k++; break; } } }
                        return n ? k / n : 0;
                    };
                    return geo.map((g) => ({ body: frac(g.page.x + 4, g.titleBottom + 2, g.page.x + g.page.w - 4, g.footTop - 2),
                        rows: rowsInked(g.page.x + 60, g.titleBottom + 2, g.page.x + g.page.w - 60, g.footTop - 2),
                        band: g.band ? frac(g.band.x, g.band.y, g.band.x + g.band.w, g.band.y + g.band.h) : null }));
                }, { shot, geo });
                // the pages to write: the band pages (their indexes taken from the pupil document, so the key pairs with them)
                if (kind === 'pupil') bandIdx = PAGES === 'all' ? geo.map((_, i) => i) : geo.map((g, i) => (g.band ? i : -1)).filter((i) => i >= 0);
                if (kind === 'pupil' && PAGES !== 'all' && !bandIdx.length) fails.push(`LR-BAND ${LESSON} ${kind}: no page carries the vocabulary band (.mq-lvocab)`);
                // (no band page: every page is judged, so a render of the wrong lesson still shows its title and body)
                const idx = (bandIdx && bandIdx.length ? bandIdx : geo.map((_, i) => i)).filter((i) => i < geo.length);
                if (kind === 'pupil' && !geo.length) fails.push(`LR-BODY ${LESSON} ${kind}: no page`);
                const els = await tab.$$('section.ws-page');
                idx.forEach((i, n) => {
                    const g = geo[i], k = ink[i];
                    const tag = `${LESSON} ${kind} page ${i + 1}`;
                    if (want && g.title !== want) fails.push(`LR-TITLE ${tag}: titled "${g.title}", not the lesson's "${want}"`);
                    if (k.body < BODY_MIN || k.rows < ROWS_MIN) fails.push(`LR-BODY ${tag}: the body is nearly empty (${(k.body * 100).toFixed(2)} % ink, ink on ${(k.rows * 100).toFixed(0)} % of its height; want >= ${BODY_MIN * 100} % and >= ${ROWS_MIN * 100} %)`);
                    if (PAGES !== 'all' && (!g.band || k.band < BAND_MIN)) fails.push(`LR-BAND ${tag}: the vocabulary band holds no ink (${g.band ? (k.band * 100).toFixed(2) + ' %' : 'none'})`);
                    console.log(`${tag.padEnd(46)} title "${g.title}" body ink ${(k.body * 100).toFixed(2)} % on ${(k.rows * 100).toFixed(0)} % of its height, band ${g.band ? (k.band * 100).toFixed(2) + ' %' : '-'}`);
                    void n;
                });
                if (OUT) {
                    fs.mkdirSync(OUT, { recursive: true });
                    for (let n = 0; n < idx.length; n++) {
                        const file = path.join(OUT, `${NAME}-${SIZE}-${kind}-${n + 1}.png`);
                        await els[idx[n]].screenshot({ path: file });
                        written++; console.log(`  wrote ${file}`);
                    }
                }
            } finally { await tab.close(); }
        }
    } finally { await app.close(); }
    for (const f of fails) console.log(`  - ${f}`);
    console.log(`ws-lesson-render: ${fails.length ? `FAIL (${fails.length})` : `OK (${written} pages)`}`);
    process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); console.log('ws-lesson-render: FAIL'); process.exit(1); });
