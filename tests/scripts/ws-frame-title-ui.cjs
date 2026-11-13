// ws-frame-title-ui — screenshots of the page-title controls at 1280 px (lf-roles 2026-11-13): the teacher Print screen
// (Page title box with its cut warning, Title place beside Size / Look) and the simple print's More options.
//   node tests/scripts/ws-frame-title-ui.cjs --out design/status/lf-roles/title
// Prints `ws-frame-title-ui: OK` when both dialogs show the controls and the cut warning for a title past two lines.
const path = require('path');
const fs = require('fs');
const { open } = require('../lib/ws-harness.cjs');

const argv = process.argv.slice(2);
const OUT = argv.includes('--out') ? argv[argv.indexOf('--out') + 1] : 'design/status/lf-roles/title';
const LONG = 'I Can add and subtract two-digit numbers with and without regrouping, explain each step aloud to a partner, and check every single answer with the inverse operation before I hand it in';

(async () => {
    fs.mkdirSync(OUT, { recursive: true });
    const fails = [];
    const app = await open({ seed: 1, viewport: { width: 1280, height: 1000, deviceScaleFactor: 1 }, lock: 'ws-frame-title-ui' });
    const { page } = app;
    try {
        // 1. the teacher Print screen
        await page.evaluate(async (LONG) => {
            document.body.classList.add('teacher-mode');
            const tp = await import('./js/modules/teacher-print.js');
            const host = document.createElement('div');
            host.id = '__tp';
            host.style.cssText = 'position:absolute;left:0;top:0;width:1248px;z-index:2147483646;background:#fff;padding:16px';
            window.scrollTo(0, 0);
            document.body.appendChild(host);
            tp.printSkills([{ categoryId: 'addition', skillId: 'add_facts' }]);
            tp.renderPrintScreen(host);
            const inp = host.querySelector('#tvSheetTitle');
            inp.value = LONG;
            inp.dispatchEvent(new Event('input', { bubbles: true }));
            const above = host.querySelector('[data-act="title-pos"][data-v="above"]');
            if (above) above.click();
        }, LONG);
        await page.waitForFunction(() => { const c = document.querySelector('#tvTitleCap'); return c && c.dataset.tvWarn === 'title-cut'; }, { timeout: 60000 }).catch(() => fails.push('teacher Print screen: no cut warning under the Page title box'));
        await page.waitForFunction(() => { const st = document.querySelector('#tvStage'); return st && st.dataset.state !== 'building'; }, { timeout: 60000 }).catch(() => {});
        await new Promise((r) => setTimeout(r, 2500));
        const tpOk = await page.evaluate(() => ({ pos: !!document.querySelector('#__tp [data-act="title-pos"][data-v="above"][aria-checked="true"]'), cap: (document.querySelector('#tvTitleCap') || {}).textContent || '' }));
        if (!tpOk.pos) fails.push('teacher Print screen: Title place "Above name" is not selected after the click');
        const hb = await page.evaluate(() => Math.ceil(document.getElementById('__tp').getBoundingClientRect().height));
        await page.screenshot({ path: path.join(OUT, 'dialog-teacher-print-1280.png'), clip: { x: 0, y: 0, width: 1280, height: hb }, captureBeyondViewport: true });
        await page.evaluate(() => { const h = document.getElementById('__tp'); if (h) h.remove(); });
        // 2. the simple print, More options open
        await page.evaluate(async () => {
            const sp = await import('./js/modules/simple-print.js');
            sp.openSimplePrint([{ categoryId: 'addition', skillId: 'add_facts', label: 'Add facts' }], { from: 'tray' });
        });
        await page.waitForSelector('#spRoot .sp-more', { timeout: 30000 });
        await page.evaluate(() => { const d = document.querySelector('#spRoot .sp-more'); d.open = true; });
        await page.evaluate((LONG) => { const i = document.querySelector('#spPageTitle'); i.value = LONG; i.dispatchEvent(new Event('input', { bubbles: true })); }, LONG);
        await page.waitForFunction(() => !!document.querySelector('#spPageTitleCap[data-sp-warn="title-cut"]'), { timeout: 60000 }).catch(() => fails.push('simple print: no cut warning under Page title'));
        await page.evaluate(() => { const d = document.querySelector('#spRoot .sp-more'); if (d) { d.open = true; d.scrollIntoView(); } const b = document.querySelector('[data-sp="titlepos"][data-v="above"]'); if (b) b.click(); });
        await new Promise((r) => setTimeout(r, 1500));
        await page.evaluate(() => { const d = document.querySelector('#spRoot .sp-more'); if (d) { d.open = true; d.scrollIntoView({ block: 'center' }); } });
        await page.screenshot({ path: path.join(OUT, 'dialog-simple-print-1280.png'), fullPage: false });
        const req = await page.evaluate(async () => { const sp = await import('./js/modules/simple-print.js'); const l = (sp.lastSimpleRequests && sp.lastSimpleRequests()) || []; const r = l[l.length - 1]; return r ? r.header : null; });
        if (!req || !req.titleText || req.titlePos !== 'above') fails.push(`simple print: the last request header carries no title option (${JSON.stringify(req)})`);
        // (a preview frame replaced while its stylesheets load cancels them: ERR_ABORTED on css is not a missing file)
        for (const p of app.problems.filter((x) => !(x.type === 'requestfailed' && /\.css <net::ERR_ABORTED>/.test(x.text))).slice(0, 5)) fails.push(`console: ${p.type} ${p.text}`);
    } finally { await app.close(); }
    for (const f of fails) console.log(`  ${f}`);
    console.log(fails.length ? `ws-frame-title-ui: FAIL (${fails.length})` : 'ws-frame-title-ui: OK (both dialogs: Page title, Title place, cut warning; simple print request carries the option)');
    process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log(`ws-frame-title-ui: FAIL (${e && e.stack || e})`); process.exit(1); });
