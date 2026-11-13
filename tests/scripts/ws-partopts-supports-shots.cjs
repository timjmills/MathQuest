#!/usr/bin/env node
// ws-partopts-supports-shots — the screenshots of lane lf-partopts step B (design/partopts/DESIGN.md §1, §2, §B), device scale 1.
//
//   node tests/scripts/ws-partopts-supports-shots.cjs [--out design/partopts/shots-B]
//
//   panel-1280.png / panel-390.png   the Print screen's Parts with the Lesson sheet's Supports panel open and the regroup boxes
//                                    ticked off (the needs warning), sub_100_regroup at M
//   quiz-1280.png                    the Quiz sheet's Supports row for add_facts, its panel open, a hint ticked (the hints line)
//   <lesson>-<M|L>-<std|off|on>-<sheet>.png   the first page of the anchor chart, the lesson sheet and Practice, built with the
//                                    standard supports, with every declared role support and band turned off, and with the
//                                    Support option's first hint turned on (where the lesson declares one)
//   paper-screen-<std|off>.png       the same subtraction item on paper (the Practice page's cell) and on screen (the stack the
//                                    practice card, the online worksheet and the quiz draw: screen-cell.js kindHTML with the
//                                    item's own `off`), default and with the regroup boxes off
'use strict';
const fs = require('fs');
const path = require('path');
const { open } = require('../lib/ws-harness.cjs');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.resolve(arg('out', path.join(ROOT, 'design', 'partopts', 'shots-B')));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
    fs.mkdirSync(OUT, { recursive: true });
    const app = await open({ seed: 1, viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
    const { page, browser } = app;
    const shotEl = async (sel, file) => { const el = await page.$(sel); if (el) { await el.screenshot({ path: path.join(OUT, file) }); console.log('wrote', file); } else console.log('missing', sel, file); };
    const click = async (sel) => { const r = await page.evaluate((s) => { const b = document.querySelector(s); if (!b || b.disabled) return false; b.scrollIntoView({ block: 'center' }); b.click(); return true; }, sel); await sleep(250); return r; };
    const idle = async () => { await sleep(400); await page.waitForFunction(() => { const s = document.querySelector('#tvStage'); return s && s.dataset.state !== 'building' && document.querySelector('.tv-parts'); }, { timeout: 180000, polling: 300 }).catch(() => {}); await sleep(400); };
    try {
        /* the Print screen's panel at 1280 and 390 */
        for (const width of [1280, 390]) {
            await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
            await page.evaluate(() => { try { localStorage.removeItem('mq_teacher_sets'); } catch (e) { /* */ } window.setUserRole('teacher'); window.tvOpenPrintWith([{ categoryId: 'subtraction', skillId: 'sub_100_regroup' }]); });
            await sleep(500);
            await click('[data-act="types"][data-sec="0"]');
            await click('[data-act="role"][data-sec="0"][data-v="lesson"]');
            await click('[data-act="size"][data-v="M"]');
            await idle();
            await click('.tv-part-group .tv-part-chip');
            await click('.tv-sup-panel [data-act="sup-tick"][data-sup="regroup"]');
            await idle();
            if (width === 1280) await shotEl('#tvPartsWide', 'panel-1280.png');
            else { await page.evaluate(() => { const e = document.querySelector('.tv-section .tv-parts-wrap'); if (e) e.scrollIntoView({ block: 'start' }); }); await shotEl('.tv-section .tv-parts-wrap', 'panel-390.png'); }
            // the We Do row's panel too (the hint)
            await click('[data-act="sup-open"][data-part="wedo"]');
            if (width === 1280) await shotEl('#tvPartsWide', 'panel-wedo-1280.png');
        }
        /* the Quiz sheet */
        await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
        await page.evaluate(async () => {
            const TU = await import('./js/modules/teacher-ui.js');
            const U = TU.currentSet(); while (U.length) U.pop();
            TU.addToCurrentSet('addition', 'add_facts');
            TU.addToCurrentSet('subtraction', 'sub_100_regroup');
            window.tvOpenSheet('quiz');
            await new Promise((r) => setTimeout(r, 800));
            const chip = document.querySelector('.tvs-sup-row .tv-part-chip'); if (chip) chip.click();
            await new Promise((r) => setTimeout(r, 300));
            const h = document.querySelector('.tv-sup-panel [data-sup-kind="hint"]'); if (h) h.click();
            await new Promise((r) => setTimeout(r, 500));
            const row = document.querySelector('.tvs-sup-rows'); if (row) row.scrollIntoView({ block: 'center' });
        });
        await sleep(400);
        await shotEl('.tvs-sup-rows', 'quiz-1280.png');
        await page.evaluate(() => { try { window.tvCloseSheet(); } catch (e) { /* */ } });

        /* packets: standard, supports off, a hint on */
        for (const lid of ['subtraction:sub_100_regroup', 'addition:add_facts', 'placevalue:identify']) for (const size of ['M', 'L']) {
            const skill = { categoryId: lid.split(':')[0], skillId: lid.split(':')[1] };
            const docs = await page.evaluate(async ({ skill, size }) => {
                const P = await import('./js/modules/sheet/part-opts.js');
                const req = (partOpts) => ({ role: 'lesson', sections: [{ skills: [skill] }], size, paper: 'A4', seed: 4242, key: true, practicePages: 1, mixed: true, partOpts });
                const std = await window.buildSheet(req(undefined));
                const sup = std.lesson.partSup || {};
                const off = {}, on = {};
                for (const [p, list] of Object.entries(sup)) {
                    const roleOff = list.filter((x) => x.from === 'role').map((x) => x.id);
                    const bands = Object.fromEntries(list.filter((x) => x.kind === 'band').map((x) => [x.id, false]));
                    if (roleOff.length || Object.keys(bands).length) off[p] = Object.assign(roleOff.length ? { opts: { off: roleOff } } : {}, Object.keys(bands).length ? { bands } : {});
                    const hint = list.find((x) => x.from && typeof x.from === 'object');
                    if (hint) on[p] = { opts: { support: [hint.from.value] } };
                }
                const out = { std: std.pupilHtml, decl: Object.fromEntries(Object.entries(sup).map(([p, l]) => [p, l.map((x) => x.id)])) };
                out.off = (await window.buildSheet(req(P.normalizePartOpts(off, null)))).pupilHtml;
                if (Object.keys(on).length) out.on = (await window.buildSheet(req(P.normalizePartOpts(on, null)))).pupilHtml;
                for (const k of ['std', 'off', 'on']) if (out[k]) out[k] = window.sheetDocument(out[k], 'Lesson', { paper: 'A4' });
                return out;
            }, { skill, size });
            console.log(lid, size, JSON.stringify(docs.decl));
            for (const which of ['std', 'off', 'on']) {
                if (!docs[which]) continue;
                const sh = await browser.newPage();
                try {
                    await sh.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
                    await sh.goto(page.url(), { waitUntil: 'domcontentloaded' });
                    await sh.setContent(docs[which], { waitUntil: 'networkidle0', timeout: 60000 });
                    await sh.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', { timeout: 15000 }).catch(() => {});
                    await sh.emulateMediaType('print');
                    for (const sheet of ['lesson-chart', 'lesson-sheet', 'lesson-practice']) {
                        const el = await sh.$(`body > section.ws-page[data-ws-sheet="${sheet}"], body > .ws-page[data-ws-sheet="${sheet}"]`);
                        if (!el) continue;
                        const f = `${skill.skillId}-${size}-${which}-${sheet.replace('lesson-', '')}.png`;
                        await el.screenshot({ path: path.join(OUT, f) });
                        console.log('wrote', f);
                    }
                } finally { await sh.close(); }
            }
        }

        /* paper = screen */
        for (const [name, opts] of [['std', {}], ['off', { off: ['regroup'] }]]) {
            const html = await page.evaluate(async (opts) => {
                const SC = await import('./js/modules/screen-cell.js');
                const G = await import('./js/modules/generate-question.js');
                const b = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId: 'subtraction', skillId: 'sub_100_regroup', opts }], count: 1 }], size: 'L', paper: 'A4', seed: 901, key: false });
                const m = /<div class="ws-cell[\s\S]*?<\/div><\/div>/.exec(b.pupilHtml);
                const q = G.generateQuestionFor({ category: 'subtraction', skill: 'sub_100_regroup', opts, seed: 901 });
                q.skillOptions = Object.assign({}, q.skillOptions || {}, opts);
                const k = SC.cellKindFor(q);
                const card = SC.kindHTML(k, { regroup: SC.regroupFor('sub_100_regroup'), off: SC.screenOffFor(q) });
                const quiz = SC.kindHTML(k, { regroup: SC.regroupFor('sub_100_regroup'), answerClass: 'mq-qt-digit', off: SC.screenOffFor(q) });
                const style = [...document.querySelectorAll('style, link[rel="stylesheet"]')].map((x) => x.outerHTML).join('');
                return `<!doctype html><html><head><meta charset="utf-8">${style}<style>body{background:#fff;font-family:Andika,sans-serif;padding:16px}.row{display:flex;gap:24px;align-items:flex-start}.box{border:1px solid #999;padding:12px;min-width:220px}.box h3{font:600 14px system-ui;margin:0 0 8px}</style></head><body><div class="row"><div class="box"><h3>Paper (Practice page cell): ${JSON.stringify(opts)}</h3>${b.pupilHtml.includes('ws-cell') ? b.pupilHtml : ''}</div></div><div class="row"><div class="box"><h3>Screen: practice card / online worksheet</h3>${card}</div><div class="box"><h3>Screen: quiz</h3>${quiz}</div></div><p style="font:12px system-ui">${q.text || ''}</p></body></html>`;
            }, opts);
            const sh = await browser.newPage();
            try {
                await sh.setViewport({ width: 900, height: 1300, deviceScaleFactor: 1 });
                await sh.goto(page.url(), { waitUntil: 'domcontentloaded' });
                await sh.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
                await sleep(500);
                await sh.screenshot({ path: path.join(OUT, `paper-screen-${name}.png`), fullPage: true });
                console.log('wrote', `paper-screen-${name}.png`);
            } finally { await sh.close(); }
        }
        console.log('ws-partopts-supports-shots: OK');
    } catch (e) {
        console.log('ws-partopts-supports-shots: ERROR', String((e && e.stack) || e).split('\n').slice(0, 3).join(' '));
        process.exitCode = 2;
    } finally { await app.close(); }
})();
