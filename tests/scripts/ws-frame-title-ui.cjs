// ws-frame-title-ui — the page-title controls of both print dialogs, driven with REAL keystrokes (lf-roles 2026-11-13; critic
// title r1: "a dialog field is tested by typing, not by setting .value").
//   node tests/scripts/ws-frame-title-ui.cjs [--width 1280] [--out design/status/lf-roles/title] [--only caret,off,width,shots]
//
// UI-CARET      in each title box (teacher Print screen #tvSheetTitle, simple print #spPageTitle): type a title, wait past the
//               debounce and the rebuild, put the cursor at 5 (Home + 5 x ArrowRight), type X, wait past the rebuild again,
//               type Y: "XY" must stand together at 5 (critic T1: the simple print's redraw put the cursor at the end)
// UI-TITLE-OFF  teacher Print screen: with the Header "Title" box unticked, the Page title box and Title place are disabled
//               and say why (critic T4)
// UI-WIDTH      simple print: the Page title box is at least 400 px wide and its label one line, at 1024 px and wider (T5)
// UI-WARN       both dialogs warn, with the words that print, for a title past two lines; the simple print request carries it
// Shots: dialog-teacher-print-<w>.png, dialog-simple-print-<w>.png in --out.
// Prints `ws-frame-title-ui: OK` / `FAIL (n)`.
const path = require('path');
const fs = require('fs');
const { open } = require('../lib/ws-harness.cjs');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && i + 1 < argv.length ? argv[i + 1] : d; };
const OUT = arg('out', 'design/status/lf-roles/title');
const W = Number(arg('width', '1280'));
const ONLY = new Set(arg('only', 'caret,off,width,shots').split(','));
const LONG = 'I Can add and subtract two-digit numbers with and without regrouping, explain each step aloud to a partner, and check every single answer with the inverse operation before I hand it in';
const BASE = 'Fractions and more words';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** UI-CARET on one input: real keys, a rebuild between them. Returns the failure text or ''. */
async function caretProbe(page, sel, where, settleMs) {
    await page.click(sel, { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.keyboard.type(BASE, { delay: 15 });
    await wait(settleMs);
    await page.focus(sel);
    await page.keyboard.press('Home');
    for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
    await page.keyboard.type('X');
    await wait(settleMs);
    await page.keyboard.type('Y');
    await wait(300);
    const v = await page.$eval(sel, (el) => el.value);
    const want = `${BASE.slice(0, 5)}XY${BASE.slice(5)}`;
    return v === want ? '' : `UI-CARET ${where}: typed X at 5, a rebuild, then Y: the box reads "${v}" (want "${want}")`;
}

(async () => {
    fs.mkdirSync(OUT, { recursive: true });
    const fails = [];
    const app = await open({ seed: 1, viewport: { width: W, height: 1000, deviceScaleFactor: 1 }, lock: 'ws-frame-title-ui' });
    const { page } = app;
    try {
        // 1. the teacher Print screen
        await page.evaluate(async () => {
            document.body.classList.add('teacher-mode');
            const tp = await import('./js/modules/teacher-print.js');
            const host = document.createElement('div');
            host.id = '__tp';
            host.style.cssText = `position:absolute;left:0;top:0;width:${window.innerWidth - 32}px;z-index:2147483646;background:#fff;padding:16px`;
            window.scrollTo(0, 0);
            document.body.appendChild(host);
            tp.printSkills([{ categoryId: 'addition', skillId: 'add_facts' }]);
            tp.renderPrintScreen(host);
        });
        const building = () => page.waitForFunction(() => { const st = document.querySelector('#tvStage'); return st && st.dataset.state !== 'building'; }, { timeout: 60000 }).catch(() => {});
        if (ONLY.has('caret')) { const f = await caretProbe(page, '#tvSheetTitle', 'teacher Print screen', 2500); if (f) fails.push(f); }
        if (ONLY.has('off')) {
            await page.evaluate(() => document.querySelector('#__tp [data-act="header"][data-v="title"]').click());
            await wait(300);
            const st = await page.evaluate(() => ({
                box: document.querySelector('#tvSheetTitle').disabled,
                pos: [...document.querySelectorAll('#__tp [data-act="title-pos"]')].every((b) => b.disabled || b.getAttribute('aria-disabled') === 'true'),
                why: /title is off/i.test((document.querySelector('#tvTitleCap') || {}).textContent || ''),
            }));
            if (!st.box || !st.pos || !st.why) fails.push(`UI-TITLE-OFF teacher Print screen: Header Title unticked, but the Page title box ${st.box ? 'is' : 'is NOT'} disabled, Title place ${st.pos ? 'is' : 'is NOT'} disabled, and the caption ${st.why ? 'says' : 'does NOT say'} the title is off`);
            await page.evaluate(() => document.querySelector('#__tp [data-act="header"][data-v="title"]').click());
            await wait(300);
        }
        // UI-WARN + the shot
        await page.evaluate((LONG) => {
            const inp = document.querySelector('#tvSheetTitle');
            inp.value = LONG;
            inp.dispatchEvent(new Event('input', { bubbles: true }));
            const above = document.querySelector('#__tp [data-act="title-pos"][data-v="above"]');
            if (above) above.click();
        }, LONG);
        await page.waitForFunction(() => { const c = document.querySelector('#tvTitleCap'); return c && c.dataset.tvWarn === 'title-cut'; }, { timeout: 60000 }).catch(() => fails.push('UI-WARN teacher Print screen: no cut warning under the Page title box'));
        await building();
        await wait(2500);
        const tpOk = await page.evaluate(() => !!document.querySelector('#__tp [data-act="title-pos"][data-v="above"][aria-checked="true"]'));
        if (!tpOk) fails.push('UI-WARN teacher Print screen: Title place "Above name" is not selected after the click');
        if (ONLY.has('shots')) {
            const hb = await page.evaluate(() => Math.ceil(document.getElementById('__tp').getBoundingClientRect().height));
            await page.screenshot({ path: path.join(OUT, `dialog-teacher-print-${W}.png`), clip: { x: 0, y: 0, width: W, height: hb }, captureBeyondViewport: true });
        }
        await page.evaluate(() => { const h = document.getElementById('__tp'); if (h) h.remove(); });

        // 2. the simple print, More options open
        await page.evaluate(async () => {
            const sp = await import('./js/modules/simple-print.js');
            sp.openSimplePrint([{ categoryId: 'addition', skillId: 'add_facts', label: 'Add facts' }], { from: 'tray' });
        });
        await page.waitForSelector('#spRoot .sp-more', { timeout: 30000 });
        await page.evaluate(() => { const d = document.querySelector('#spRoot .sp-more'); d.open = true; d.scrollIntoView({ block: 'center' }); });
        await wait(300);
        if (ONLY.has('width') && W >= 1024) {
            const g = await page.evaluate(() => {
                const i = document.querySelector('#spPageTitle'), l = document.querySelector('label[for="spPageTitle"]');
                const lh = parseFloat(getComputedStyle(l).lineHeight) || parseFloat(getComputedStyle(l).fontSize) * 1.3;
                return { w: i.getBoundingClientRect().width, lines: Math.round(l.getBoundingClientRect().height / lh) };
            });
            if (g.w < 400) fails.push(`UI-WIDTH simple print at ${W}: the Page title box is ${Math.round(g.w)} px wide (at least 400)`);
            if (g.lines > 1) fails.push(`UI-WIDTH simple print at ${W}: the "Page title" label wraps to ${g.lines} lines`);
        }
        // (the simple print redraws ~450 ms after a key, once its build is done: wait 3 s)
        if (ONLY.has('caret')) { const f = await caretProbe(page, '#spPageTitle', 'simple print', 3000); if (f) fails.push(f); }
        await page.evaluate((LONG) => { const i = document.querySelector('#spPageTitle'); i.value = LONG; i.dispatchEvent(new Event('input', { bubbles: true })); }, LONG);
        await page.waitForFunction(() => !!document.querySelector('#spPageTitleCap[data-sp-warn="title-cut"]'), { timeout: 60000 }).catch(() => fails.push('UI-WARN simple print: no cut warning under Page title'));
        await page.evaluate(() => { const b = document.querySelector('[data-sp="titlepos"][data-v="above"]'); if (b) b.click(); });
        await wait(2500);
        if (ONLY.has('shots')) {
            await page.evaluate(() => { const d = document.querySelector('#spRoot .sp-more'); if (d) { d.open = true; d.scrollIntoView({ block: 'center' }); } });
            await page.screenshot({ path: path.join(OUT, `dialog-simple-print-${W}.png`), fullPage: false });
        }
        const req = await page.evaluate(async () => { const sp = await import('./js/modules/simple-print.js'); const l = (sp.lastSimpleRequests && sp.lastSimpleRequests()) || []; const r = l[l.length - 1]; return r ? r.header : null; });
        if (!req || !req.titleText || req.titlePos !== 'above') fails.push(`UI-WARN simple print: the last request header carries no title option (${JSON.stringify(req)})`);
        // (a preview frame replaced while its stylesheets load cancels them: ERR_ABORTED on css is not a missing file)
        for (const p of app.problems.filter((x) => !(x.type === 'requestfailed' && /\.css <net::ERR_ABORTED>/.test(x.text))).slice(0, 5)) fails.push(`console: ${p.type} ${p.text}`);
    } finally { await app.close(); }
    for (const f of fails) console.log(`  ${f}`);
    console.log(fails.length ? `ws-frame-title-ui: FAIL (${fails.length})` : `ws-frame-title-ui: OK (at ${W} px: caret kept across the rebuild in both title boxes; title off disables its controls; box width; cut warnings; the request carries the option)`);
    process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log(`ws-frame-title-ui: FAIL (${e && e.stack || e})`); process.exit(1); });
