// critic A r3: drive the real Print screen by steps, open the packet in a new tab as a teacher would, measure every page.
// node crit.cjs <scenarios.json> <outdir>
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = '/home/user/MathQuest';
const { open } = require(ROOT + '/tests/lib/ws-harness.cjs');
const { measureCells, judge } = require(ROOT + '/tests/scripts/ws-empty-band.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SC = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const OUT = process.argv[3];
fs.mkdirSync(OUT, { recursive: true });
const log = (...a) => { const s = a.join(' '); console.log(s); fs.appendFileSync(path.join(OUT, 'crit.log'), s + '\n'); };

(async () => {
    const app = await open({ seed: 1, viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
    const { page, browser } = app;
    page.on('console', (m) => { if (m.type() === 'error') log('  CONSOLE ERROR', m.text().slice(0, 200)); });
    page.on('pageerror', (e) => log('  PAGE ERROR', String(e).slice(0, 200)));
    const idle = async () => { await sleep(500); await page.waitForFunction(() => { const s = document.querySelector('#tvStage'); return s && s.dataset.state !== 'building' && document.querySelector('.tv-parts'); }, { timeout: 240000, polling: 300 }); await sleep(500); await page.waitForFunction(() => { const s = document.querySelector('#tvStage'); return s && s.dataset.state !== 'building'; }, { timeout: 240000, polling: 300 }); await sleep(300); };
    const click = async (sel) => { const ok = await page.evaluate((sel) => { const b = [...document.querySelectorAll(sel)].find((x) => x.offsetParent); if (!b || b.disabled) return false; b.scrollIntoView({ block: 'center' }); b.click(); return true; }, sel); await sleep(200); return ok; };
    const rows = () => page.evaluate(() => [...document.querySelectorAll('.tv-part[data-part-row], .tv-part-group')].filter((r) => r.offsetParent).map((r) => {
        const t = r.querySelector('[data-act="part-on"]');
        return { part: r.dataset.partRow || 'GROUP', val: (r.querySelector('.tv-step-val') || {}).textContent || '', text: r.textContent.replace(/\s+/g, ' ').trim(),
            tick: t ? (t.disabled ? 'LOCK' : t.getAttribute('aria-checked')) : 'none', minus: r.querySelector('[data-dir="-1"]') ? (r.querySelector('[data-dir="-1"]').disabled ? 'x' : 'ok') : '', plus: r.querySelector('[data-dir="1"]') ? (r.querySelector('[data-dir="1"]').disabled ? 'x' : 'ok') : '' };
    }));
    const previewPages = () => page.evaluate(() => { try { const d = document.querySelector('#tvPreviewFrame').contentDocument; return [...d.querySelectorAll('.ws-page')].map((p) => p.getAttribute('data-ws-sheet') || ''); } catch (e) { return []; } });
    const measure = async (doc) => {
        const sh = await browser.newPage();
        try {
            await sh.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
            await sh.goto(page.url(), { waitUntil: 'domcontentloaded' });
            await sh.setContent(doc, { waitUntil: 'networkidle0', timeout: 60000 });
            await sh.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', { timeout: 15000 }).catch(() => {});
            await sh.emulateMediaType('print');
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
        } catch (e) { await sh.close(); throw e; }
    };
    for (const s of SC) {
        log(`\n=== ${s.tag} (${s.id}) width ${s.width || 1280}`);
        await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
        const sk = s.id.startsWith('skill:') ? { categoryId: s.id.split(':')[1], skillId: s.id.split(':')[2] } : null;
        await page.evaluate(({ id, sk }) => { try { localStorage.removeItem('mq_teacher_sets'); } catch (e) { /* */ } window.setUserRole('teacher'); window.tvOpenPrintWith(sk ? [sk] : [{ role: 'lesson', lessonId: id }]); }, { id: s.id, sk });
        await sleep(800);
        if (sk) { await click('[data-act="types"][data-sec="0"]'); await sleep(400); if (!await click('[data-act="role"][data-sec="0"][data-v="lesson"]')) log('  could not choose Lesson'); }
        await click(`[data-act="size"][data-v="${s.size}"]`);
        await idle();
        if (s.width && s.width !== 1280) { await page.setViewport({ width: s.width, height: 844, deviceScaleFactor: 1 }); await sleep(1000); }
        const R0 = await rows();
        log('  START ' + R0.map((r) => `\n    ${r.part} [${r.tick}] ${r.minus}${r.plus} "${r.text}"`).join(''));
        const scope = (s.width || 1280) >= 1000 ? '#tvPartsWide ' : '.tv-section ';
        for (const st of s.steps || []) {
            let ok;
            if (st[0] === 'step') ok = await click(`${scope}[data-act="part-step"][data-part="${st[1]}"][data-dir="${st[2]}"]`);
            else if (st[0] === 'tick') ok = await click(`${scope}[data-act="part-on"][data-part="${st[1]}"]`);
            else if (st[0] === 'new') ok = await click(`${scope}[data-act="part-new"][data-part="${st[1]}"]`);
            else if (st[0] === 'size') ok = await click(`[data-act="size"][data-v="${st[1]}"]`);
            else if (st[0] === 'reset') ok = await click(`${scope}[data-act="parts-reset"]`);
            await idle();
            const R = await rows();
            const r = R.find((x) => x.part === st[1]);
            log(`  ${st.join(' ')} -> ${ok ? 'clicked' : 'NOT CLICKABLE'}${r ? ` | ${r.part}=${r.val} [${r.tick}] ${r.minus}${r.plus} "${r.text}"` : ''}`);
        }
        const R = await rows();
        log('  END ' + R.map((r) => `\n    ${r.part} [${r.tick}] ${r.minus}${r.plus} "${r.text}"`).join(''));
        const sub = await page.evaluate(() => { const h = document.querySelector('#tvSecH0'); return h && h.nextElementSibling ? h.nextElementSibling.textContent : ''; });
        log('  section sub: ' + sub);
        const pv = await previewPages(); log('  preview pages: ' + pv.join(','));
        // screenshot of the parts
        if ((s.width || 1280) >= 1000) {
            await page.evaluate(() => document.querySelector('#tvPartsWide').scrollIntoView({ block: 'start' }));
            const clip = await page.evaluate(() => { const r = document.querySelector('#tvPartsWide').getBoundingClientRect(); return { x: r.left, y: r.top + window.scrollY, width: r.width, height: r.height }; });
            await page.screenshot({ path: path.join(OUT, `${s.tag}-ui.png`), clip, captureBeyondViewport: true });
        } else {
            const box = await page.evaluate(() => { const e = document.querySelector('.tv-section .tv-parts-wrap'); e.scrollIntoView({ block: 'start' }); const r = e.getBoundingClientRect(); return { y: r.top + window.scrollY, h: r.height }; });
            await page.screenshot({ path: path.join(OUT, `${s.tag}-ui.png`), clip: { x: 0, y: Math.max(0, box.y - 8), width: s.width, height: Math.min(box.h + 16, 4000) }, captureBeyondViewport: true });
            const wide = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
            log('  390 sideways scroll px: ' + wide);
        }
        if (s.swap) {
            await click('[data-act="remove-skill"][data-sec="0"]'); await sleep(400);
            await click('[data-act="pick"][data-sec="0"]'); await sleep(400);
            const inp = await page.$('[data-pick="0"]');
            if (inp) { await inp.type(s.swap); await sleep(900); await sleep(800); log('  pick: ' + await click('[data-act="pick-skill"][data-sec="0"]')); }
            await sleep(800);
            const typesOk = await click('[data-act="types"][data-sec="0"]'); await sleep(300); await click('[data-act="role"][data-sec="0"][data-v="lesson"]');
            await idle();
            const RS = await rows();
            log('  AFTER SWAP ' + RS.map((r) => `\n    ${r.part} [${r.tick}] "${r.text}"`).join('') + `\n    reset link: ${!!(await page.$('.tv-parts-reset'))}`);
            await page.screenshot({ path: path.join(OUT, `${s.tag}-after-swap.png`), fullPage: false });
            continue;
        }
        if (s.noPrint) continue;
        // the teacher's "Open in a new tab"
        await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
        await sleep(400);
        const tgt = new Promise((res) => browser.once('targetcreated', res));
        await click('[data-act="open-tab"]');
        const t = await Promise.race([tgt, sleep(20000).then(() => null)]);
        if (!t) { log('  NO TAB'); continue; }
        const tp = await t.page();
        await sleep(1500);
        const doc = await tp.content();
        await tp.close();
        fs.writeFileSync(path.join(OUT, `${s.tag}.html`), doc);
        const m = await measure(doc);
        const finds = [];
        for (const c of m.cells) judge([c], `${s.tag}`, (rule, w, msg) => { if (['EB-BAND', 'EB-SIDE', 'EB-EDGE'].includes(rule)) finds.push(`${rule} p${c.page} ${(m.pages[c.page - 1] || {}).sheet} ${c.tmpl}: ${msg}`); }, 'lesson');
        m.pages.forEach((p, i) => {
            const nx = m.pages[i + 1], pv2 = m.pages[i - 1];
            const lastOfMany = (!nx || nx.sheet !== p.sheet) && pv2 && pv2.sheet === p.sheet;
            const flag = (p.empty >= 30 ? ' FOOT>=30' : '') + (lastOfMany && p.empty >= 50 ? ' LAST<HALF' : '') + (p.over ? ' OVERFLOW' : '') + (p.ov ? ` OVERLAP${p.ov}` : '');
            log(`  page ${i + 1} ${p.sheet}${p.key ? ' KEY' : ''} cells ${p.ncell} empty ${p.empty}% (${p.emptyMm} mm) strips[${p.strips.join('|')}]${flag}`);
        });
        if (s.remText) { const hits = m.pages.filter((p) => p.sheet === 'lesson-sheet' && p.text.includes(s.remText)); log(`  remember text "${s.remText}" on lesson-sheet pages: ${hits.length}`); }
        const g = {}; for (const f of finds) { const k = f.replace(/[\d.]+ mm/g, 'n mm').replace(/\([\d.]+ %/g, '(n %').replace(/ = [\d.]+ mm/, ''); g[k] = g[k] || [0, f]; g[k][0]++; } log(`  cell findings: ${finds.length}` + Object.values(g).map(([n, f]) => `\n    ${n}x ${f}`).join(''));
        // screenshots of every page
        const els = await m.sh.$$('body > section.ws-page, body > .ws-page');
        for (let i = 0; i < els.length; i++) await els[i].screenshot({ path: path.join(OUT, `${s.tag}-p${i + 1}.png`) });
        await m.sh.close();
    }
    await app.close();
    process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
