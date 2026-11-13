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
const ONLY = arg('only', '');   // (--only panel,quiz,packets,screen: take only those shots)
const take = (k) => !ONLY || ONLY.split(',').includes(k);

(async () => {
    fs.mkdirSync(OUT, { recursive: true });
    const app = await open({ seed: 1, viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
    const { page, browser } = app;
    const shotEl = async (sel, file) => { const el = await page.$(sel); if (el) { await el.screenshot({ path: path.join(OUT, file) }); console.log('wrote', file); } else console.log('missing', sel, file); };
    const click = async (sel) => { const r = await page.evaluate((s) => { const b = document.querySelector(s); if (!b || b.disabled) return false; b.scrollIntoView({ block: 'center' }); b.click(); return true; }, sel); await sleep(250); return r; };
    const idle = async () => { await sleep(400); await page.waitForFunction(() => { const s = document.querySelector('#tvStage'); return s && s.dataset.state !== 'building' && document.querySelector('.tv-parts'); }, { timeout: 180000, polling: 300 }).catch(() => {}); await sleep(400); };
    try {
        /* the Print screen's panel at 1280 and 390 */
        if (take('panel')) for (const width of [1280, 390]) {
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
        if (take('quiz')) {   // the Quiz sheet
        await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
        await page.evaluate(async () => {
            try { window.setUserRole('teacher'); } catch (e) { /* */ }
            const TU = await import('./js/modules/teacher-ui.js');
            const U = TU.currentSet(); while (U.length) U.pop();
            TU.addToCurrentSet('addition', 'add_facts');
            TU.addToCurrentSet('subtraction', 'sub_100_regroup');
            window.tvOpenSheet('quiz');
            await new Promise((r) => setTimeout(r, 800));
            const chip = document.querySelector('.tvs-sup-row .tv-part-chip'); if (chip) chip.click();
            await new Promise((r) => setTimeout(r, 300));
            const h = document.querySelector('.tv-sup-panel [data-sup-kind="hint"]'); if (h) h.click();
            await new Promise((r) => setTimeout(r, 1200));
            window.__supShot = { ticked: [...document.querySelectorAll('.tv-sup-panel [data-sup-kind="hint"]')].map((b) => b.getAttribute('aria-checked')), line: !!document.querySelector('.tv-sup-quizline') };
            await new Promise((r) => setTimeout(r, 500));
            const row = document.querySelector('.tvs-sup-rows'); if (row) row.scrollIntoView({ block: 'center' });
        });
        await sleep(400);
        console.log('quiz panel', JSON.stringify(await page.evaluate(() => window.__supShot)));
        await shotEl('.tvs-sup-rows', 'quiz-1280.png');
        await page.evaluate(() => { try { window.tvCloseSheet(); } catch (e) { /* */ } });
        }

        /* packets: standard, supports off, a hint on */
        if (take('packets')) for (const lid of ['subtraction:sub_100_regroup', 'addition:add_facts', 'placevalue:identify']) for (const size of ['M', 'L']) {
            const skill = { categoryId: lid.split(':')[0], skillId: lid.split(':')[1] };
            const docs = await page.evaluate(async ({ skill, size }) => {
                const P = await import('./js/modules/sheet/part-opts.js');
                const req = (partOpts) => ({ role: 'lesson', sections: [{ skills: [skill] }], size, paper: 'A4', seed: 4242, key: true, practicePages: 1, mixed: true, partOpts });
                const std = await window.buildSheet(req(undefined));
                const sup = std.lesson.partSup || {};
                const off = {}, on = {};
                for (const [p, list] of Object.entries(sup)) {
                    const roleOff = list.filter((x) => x.from === 'role').map((x) => x.id);
                    const bands = Object.fromEntries(list.filter((x) => x.kind === 'band' && !x.locked).map((x) => [x.id, false]));
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

        /* paper = screen: the REAL practice card (question-render.js) and the REAL quiz (quiz-take.js), each with the skill's
           options carrying `off`, beside the same item on paper (the Practice page built with those options, seed 905) */
        if (take('screen')) for (const [name, opts] of [['std', {}], ['off', { off: ['regroup'] }]]) {
            await page.setViewport({ width: 900, height: 1000, deviceScaleFactor: 1 });
            const doc = await page.evaluate(async (opts) => {
                const b = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId: 'subtraction', skillId: 'sub_100_regroup', opts }], count: 4 }], size: 'L', paper: 'A4', seed: 905, key: false });
                return window.sheetDocument(b.pupilHtml, 'Paper', { paper: 'A4' });
            }, opts);
            const sh = await browser.newPage();
            try {
                await sh.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
                await sh.goto(page.url(), { waitUntil: 'domcontentloaded' });
                await sh.setContent(doc, { waitUntil: 'networkidle0', timeout: 60000 });
                await sh.emulateMediaType('print');
                const el = await sh.$('body > section.ws-page, body > .ws-page');
                if (el) { await el.screenshot({ path: path.join(OUT, `paper-${name}.png`) }); console.log('wrote', `paper-${name}.png`); }
            } finally { await sh.close(); }
            // the practice card
            const card = await page.evaluate(async (opts) => {
                try {
                    const G = await import('./js/modules/generate-question.js');
                    const st = window.state;
                    st.category = 'subtraction'; st.skill = 'sub_100_regroup'; st.gameMode = 'practice'; st.isMixedMode = false;
                    if (window.showView) window.showView('gameView');
                    const q = G.generateQuestionFor({ category: 'subtraction', skill: 'sub_100_regroup', opts, seed: 905 });
                    q.skillOptions = Object.assign({}, q.skillOptions || {}, opts);
                    st.currentQ = q;
                    window.renderQuestion();
                    return { text: q.text, carries: document.querySelectorAll('#questionCard input.mq-carry').length };
                } catch (e) { return { error: String(e) }; }
            }, opts);
            await sleep(400);
            console.log('card', name, JSON.stringify(card));
            await shotEl('#questionCard', `card-${name}.png`);
            // the quiz
            const quiz = await page.evaluate(async (opts) => {
                try {
                    const G = await import('./js/modules/generate-question.js');
                    const QT = await import('./js/modules/quiz-take.js');
                    const q = G.generateQuestionFor({ category: 'subtraction', skill: 'sub_100_regroup', opts, seed: 905 });
                    const qd = QT.quizQuestionData(q);
                    qd.skillOptions = Object.assign({}, qd.skillOptions || {}, opts);
                    window.state.currentQuiz = { id: 'supshot', title: 'Supports', settings: { sectionMode: 'sequential' }, sections: [{ name: 'A', questions: [{ skillId: 'sub_100_regroup', questionData: qd, points: 1 }] }] };
                    if (window.showView) window.showView('quizTakeView');
                    const inp = document.getElementById('qtStudentName');
                    if (inp) inp.value = 'Shot';
                    QT.startQuizTest();
                    await new Promise((r) => setTimeout(r, 500));
                    return { carries: document.querySelectorAll('#quizTakeView input.mq-carry').length };
                } catch (e) { return { error: String(e) }; }
            }, opts);
            console.log('quiz', name, JSON.stringify(quiz));
            await shotEl('#quizTakeView', `quiz-screen-${name}.png`);
        }
        console.log('ws-partopts-supports-shots: OK');
    } catch (e) {
        console.log('ws-partopts-supports-shots: ERROR', String((e && e.stack) || e).split('\n').slice(0, 3).join(' '));
        process.exitCode = 2;
    } finally { await app.close(); }
})();
