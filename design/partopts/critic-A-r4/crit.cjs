// critic A r4: drive the real Print screen by steps with PLAYWRIGHT (pre-installed Chromium), open the packet in a new tab
// as a teacher would, measure every page with ws-empty-band's measureCells / judge.
// node crit.cjs <scenarios.json> <outdir>
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const ROOT = '/home/user/MathQuest';
const { startServer, chromePath } = require(ROOT + '/tests/lib/ws-harness.cjs');
const { measureCells, judge } = require(ROOT + '/tests/scripts/ws-empty-band.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SC = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const OUT = process.argv[3];
fs.mkdirSync(OUT, { recursive: true });
const log = (...a) => { const s = a.join(' '); console.log(s); fs.appendFileSync(path.join(OUT, 'crit.log'), s + '\n'); };
const SEED = `(() => { let a = 1; Math.random = function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; try { localStorage.setItem('mathquest_onboarded', '1'); } catch (e) {} })();`;

(async () => {
    const { server, base } = await startServer();
    const browser = await chromium.launch({ headless: true, executablePath: chromePath(), args: ['--no-sandbox', '--font-render-hinting=none'] });
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
    await ctx.addInitScript(SEED);
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') log('  CONSOLE ERROR', m.text().slice(0, 200)); });
    page.on('pageerror', (e) => log('  PAGE ERROR', String(e).slice(0, 200)));
    await page.goto(base + '/index.html', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, null, { timeout: 30000 });
    await page.evaluate(() => Promise.all([window.__mqLoadDeferred, window.__mqLoadWorksheet].filter(Boolean).map((f) => f().then(() => true, () => false))));
    if (process.env.NOPARTS) await page.evaluate(() => { window.__noParts = true; });
    const idle = async () => { await sleep(500); await page.waitForFunction(() => { const s = document.querySelector('#tvStage'); return s && s.dataset.state !== 'building' && (window.__noParts || document.querySelector('.tv-parts')); }, null, { timeout: 240000, polling: 300 }); await sleep(500); await page.waitForFunction(() => { const s = document.querySelector('#tvStage'); return s && s.dataset.state !== 'building'; }, null, { timeout: 240000, polling: 300 }); await sleep(300); };
    // a real mouse click on the first visible, enabled match
    const click = async (sel) => {
        const loc = page.locator(sel);
        const n = await loc.count();
        for (let k = 0; k < n; k++) {
            const el = loc.nth(k);
            if (!(await el.isVisible())) continue;
            if (await el.isDisabled()) return false;
            await el.scrollIntoViewIfNeeded();
            await el.click();
            await sleep(200);
            return true;
        }
        return false;
    };
    const rows = (scope) => page.evaluate((scope) => [...document.querySelectorAll(`${scope}.tv-part[data-part-row], ${scope}.tv-part-group`)].filter((r) => r.offsetParent).map((r) => {
        const t = r.querySelector('[data-act="part-on"]');
        return { part: r.dataset.partRow || 'GROUP', val: (r.querySelector('.tv-step-val') || {}).textContent || '', text: r.textContent.replace(/\s+/g, ' ').trim(),
            tick: t ? (t.disabled ? 'LOCK' : t.getAttribute('aria-checked')) : 'none', lockTxt: !!r.querySelector('.tv-part-lock'),
            minus: r.querySelector('[data-dir="-1"]') ? (r.querySelector('[data-dir="-1"]').disabled ? 'x' : 'ok') : '', plus: r.querySelector('[data-dir="1"]') ? (r.querySelector('[data-dir="1"]').disabled ? 'x' : 'ok') : '' };
    }), scope);
    const previewPages = () => page.evaluate(() => { try { const d = document.querySelector('#tvPreviewFrame').contentDocument; return [...d.querySelectorAll('.ws-page')].map((p) => p.getAttribute('data-ws-sheet') || ''); } catch (e) { return []; } });
    const fmt = (R) => R.map((r) => `\n    ${r.part}=${r.val} [${r.tick}${r.lockTxt ? ' +lockText' : ''}] ${r.minus}${r.plus} "${r.text}"`).join('');
    const lint = (R, tag) => { for (const r of R) {
        if (r.lockTxt && (r.tick === 'none' || /Not on this lesson sheet|Not added/.test(r.text))) log(`  !! R1-LINT ${tag}: ${r.part} no tick / not printed but says "Needed to fill the sheet"`);
        if (/half full/.test(r.text) && /Rounded/.test(r.text)) log(`  .. note ${tag}: ${r.part} "${r.text}"`);
    } };
    const measure = async (doc) => {
        const sh = await ctx.newPage();
        await sh.setViewportSize({ width: 900, height: 1200 });
        await sh.goto(base + '/index.html', { waitUntil: 'domcontentloaded' });
        await sh.setContent(doc, { waitUntil: 'networkidle', timeout: 60000 });
        await sh.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', null, { timeout: 15000 }).catch(() => {});
        await sh.emulateMedia({ media: 'print' });
        const cells = await sh.evaluate(measureCells, 'body > section.ws-page, body > .ws-page');
        const pages = await sh.evaluate(() => [...document.querySelectorAll('body > section.ws-page, body > .ws-page')].map((pg) => {
            const pr = pg.getBoundingClientRect();
            const body = pg.querySelector('.ws-body') || pg; const br = body.getBoundingClientRect();
            const kids = [...body.children].filter((x) => x.getBoundingClientRect().height > 0 && !/ws-foot|ws-footer/.test(x.className));
            const last = kids.length ? Math.max(...kids.map((x) => x.getBoundingClientRect().bottom)) : br.top;
            const cs = [...pg.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]') && c.getBoundingClientRect().height > 0);
            const out = cs.filter((c) => c.getBoundingClientRect().bottom > pr.bottom + 1).length;
            const bx = cs.map((c) => c.getBoundingClientRect()); let ov = 0;
            for (let a = 0; a < bx.length; a++) for (let b = a + 1; b < bx.length; b++) { const A = bx[a], B = bx[b]; if (A.left < B.right - 1 && B.left < A.right - 1 && A.top < B.bottom - 1 && B.top < A.bottom - 1) ov++; }
            const strips = [...pg.querySelectorAll('.ws-strip > b')].map((x) => x.textContent.trim());
            return { sheet: pg.getAttribute('data-ws-sheet') || '', key: /key|answer/i.test(pg.className + ' ' + (pg.getAttribute('data-ws-key') || '') + (pg.querySelector('.ws-key-badge,.ws-key') ? ' key' : '')),
                over: pg.scrollHeight > pg.clientHeight + 2 || out > 0, ov, ncell: cs.length, empty: Math.round(Math.max(0, br.bottom - last) / br.height * 100), emptyMm: +(Math.max(0, br.bottom - last) / (96 / 25.4)).toFixed(1), strips, text: pg.textContent.replace(/\s+/g, ' ') };
        }));
        return { sh, cells, pages };
    };
    for (const s of SC) {
        const W = s.width || 1280;
        log(`\n=== ${s.tag} (${s.id}) size ${s.size} width ${W}`);
        await page.setViewportSize({ width: 1280, height: 900 });
        const sk = s.id.startsWith('skill:') ? { categoryId: s.id.split(':')[1], skillId: s.id.split(':')[2] } : null;
        await page.evaluate(({ id, sk }) => { try { localStorage.removeItem('mq_teacher_sets'); } catch (e) { /* */ } window.setUserRole('teacher'); window.tvOpenPrintWith(sk ? [sk] : [{ role: 'lesson', lessonId: id }]); }, { id: s.id, sk });
        await sleep(800);
        if (sk) { await click('[data-act="types"][data-sec="0"]'); await sleep(400); if (!await click('[data-act="role"][data-sec="0"][data-v="lesson"]')) log('  could not choose Lesson'); }
        await click(`[data-act="size"][data-v="${s.size}"]`);
        await idle();
        if (W !== 1280) { await page.setViewportSize({ width: W, height: 844 }); await sleep(1000); }
        const scope = W >= 1000 ? '#tvPartsWide ' : '.tv-section ';
        const R0 = await rows(scope);
        log('  START ' + fmt(R0)); lint(R0, 'start');
        for (const st of s.steps || []) {
            let ok;
            if (st[0] === 'step') ok = await click(`${scope}[data-act="part-step"][data-part="${st[1]}"][data-dir="${st[2]}"]`);
            else if (st[0] === 'tick') ok = await click(`${scope}[data-act="part-on"][data-part="${st[1]}"]`);
            else if (st[0] === 'new') ok = await click(`${scope}[data-act="part-new"][data-part="${st[1]}"]`);
            else if (st[0] === 'size') ok = await click(`[data-act="size"][data-v="${st[1]}"]`);
            else if (st[0] === 'max' || st[0] === 'min') {   // press + (or -) until it is disabled, settling after each click
                let k = 0; const dir = st[0] === 'max' ? 1 : -1;
                while (k < 12 && await click(`${scope}[data-act="part-step"][data-part="${st[1]}"][data-dir="${dir}"]`)) { k++; await idle(); }
                ok = `${k} clicks`;
            }
            await idle();
            const R = await rows(scope);
            const r = R.find((x) => x.part === st[1]);
            log(`  ${st.join(' ')} -> ${ok ? ok : 'NOT CLICKABLE'}${r ? ` | ${r.part}=${r.val} [${r.tick}] ${r.minus}${r.plus} "${r.text}"` : ''}`);
            lint(R, st.join(' '));
        }
        const R = await rows(scope);
        log('  END ' + fmt(R)); lint(R, 'end');
        const sub = await page.evaluate(() => { const h = document.querySelector('#tvSecH0'); return h && h.nextElementSibling ? h.nextElementSibling.textContent : ''; });
        log('  section sub: ' + sub);
        const pv = await previewPages(); log('  preview pages: ' + pv.join(','));
        const tabsL = await page.evaluate(() => [...document.querySelectorAll('#tvPageTabs > button')].map((b) => b.textContent.trim()));
        log(`  page tabs (${tabsL.length}): ${tabsL.join(' | ')}`);
        if (s.tabShot && W >= 1000) { const tb = page.locator('#tvPageTabs'); await tb.scrollIntoViewIfNeeded(); await tb.screenshot({ path: path.join(OUT, `${s.tag}-tabs.png`) }); }
        if (W >= 1000) {
            const el = page.locator('#tvPartsWide'); await el.scrollIntoViewIfNeeded();
            await el.screenshot({ path: path.join(OUT, `${s.tag}-ui.png`) });
        } else {
            const el = page.locator('.tv-section .tv-parts-wrap').first(); await el.scrollIntoViewIfNeeded();
            await el.screenshot({ path: path.join(OUT, `${s.tag}-ui.png`) });
            const wide = await page.evaluate(() => { window.scrollTo(2000, window.scrollY); const x = window.scrollX; window.scrollTo(0, window.scrollY); return { sw: document.documentElement.scrollWidth - window.innerWidth, sx: x, tabs: (document.querySelector('#tvPageTabs') || {}).scrollWidth || 0, tabsW: document.querySelector('#tvPageTabs') ? document.querySelector('#tvPageTabs').getBoundingClientRect().width : 0 }; });
            log(`  390 sideways: scrollWidth-innerWidth ${wide.sw} px, scrollX after scrollTo(2000) ${wide.sx} px, tabs ${wide.tabs}/${Math.round(wide.tabsW)} px`);
            if (s.fullShot) await page.screenshot({ path: path.join(OUT, `${s.tag}-page.png`), fullPage: true });
            const tb = page.locator('#tvPageTabs'); if (await tb.count() && await tb.isVisible()) { await tb.scrollIntoViewIfNeeded(); await tb.screenshot({ path: path.join(OUT, `${s.tag}-tabs.png`) }); }
        }
        if (s.noPrint) continue;
        await page.setViewportSize({ width: 1280, height: 900 });
        await sleep(400);
        const pop = ctx.waitForEvent('page', { timeout: 20000 }).catch(() => null);
        await click('[data-act="open-tab"]');
        const tp = await pop;
        if (!tp) { log('  NO TAB'); continue; }
        await sleep(1500);
        const doc = await tp.content();
        await tp.close();
        const m = await measure(doc);
        const finds = [];
        for (const c of m.cells) judge([c], `${s.tag}`, (rule, w, msg) => { if (['EB-BAND', 'EB-SIDE', 'EB-EDGE'].includes(rule)) finds.push(`${rule} p${c.page} ${(m.pages[c.page - 1] || {}).sheet} ${c.tmpl}: ${msg}`); }, 'lesson');
        const half = m.pages.length / 2;
        m.pages.forEach((p, i) => {
            const nx = m.pages[i + 1], pv2 = m.pages[i - 1];
            const lastOfMany = (!nx || nx.sheet !== p.sheet) && pv2 && pv2.sheet === p.sheet;
            const flag = (p.empty >= 30 ? ' FOOT>=30' : '') + (lastOfMany && p.empty >= 50 ? ' LAST<HALF' : '') + (p.over ? ' OVERFLOW' : '') + (p.ov ? ` OVERLAP${p.ov}` : '');
            const twin = i >= half ? m.pages[i - half] : null;
            const keyMatch = twin ? ((twin.sheet === p.sheet && twin.ncell === p.ncell) ? '' : ' KEY-MISMATCH') : '';
            log(`  page ${i + 1} ${p.sheet}${p.key ? ' KEY' : ''} cells ${p.ncell} empty ${p.empty}% (${p.emptyMm} mm) strips[${p.strips.join('|')}]${flag}${keyMatch}`);
        });
        if (s.remText) { const hits = m.pages.filter((p) => p.sheet === 'lesson-sheet' && p.text.includes(s.remText)); log(`  remember text "${s.remText}" on lesson-sheet pages: ${hits.length}`); }
        const g = {}; for (const f of finds) { const k = f.replace(/[\d.]+ mm/g, 'n mm').replace(/\([\d.]+ %/g, '(n %').replace(/ = [\d.]+ mm/, ''); g[k] = g[k] || [0, f]; g[k][0]++; } log(`  cell findings: ${finds.length}` + Object.values(g).map(([n, f]) => `\n    ${n}x ${f}`).join(''));
        const els = m.sh.locator('body > section.ws-page, body > .ws-page');
        const ne = await els.count();
        for (let i = 0; i < ne; i++) await els.nth(i).screenshot({ path: path.join(OUT, `${s.tag}-p${i + 1}.png`) });
        await m.sh.close();
    }
    await browser.close(); server.close();
    process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
