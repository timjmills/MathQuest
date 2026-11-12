#!/usr/bin/env node
// ws-partopts-shots — screenshots of lane lf-partopts (design/partopts/DESIGN.md §1.1-1.2) for the critic, device scale 1:
//   design/partopts/shots-A/print-lesson-1280.png   the real Print screen with a Lesson section, its Parts table (desktop)
//   design/partopts/shots-A/print-lesson-390.png    the same at phone width (one card per part)
//   design/partopts/shots-A/packet-nondefault-p<k>.png  a lesson packet printed at non-default counts (We Do 2, Practice min,
//                                                    Prerequisite Check 2), each pupil page
// It also asserts what the screen must do: no sideways scroll at 390, every Parts control at least 44 px, the steppers never
// offer a value outside the range (- disabled at min, + at max), and the prerequisite warning under 3 questions.
//   node tests/scripts/ws-partopts-shots.cjs [--lesson <library lesson id>] [--out dir]
'use strict';
const fs = require('fs');
const path = require('path');
const { open } = require('../lib/ws-harness.cjs');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const OUT = path.resolve(arg('out', path.join(__dirname, '..', '..', 'design', 'partopts', 'shots-A')));
const fails = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };

(async () => {
    fs.mkdirSync(OUT, { recursive: true });
    const app = await open({ seed: 1 });
    const { page, browser } = app;
    const ready = () => page.waitForFunction(() => { const s = document.querySelector('#tvStage'); return s && s.dataset.state !== 'building' && document.querySelector('.tv-parts'); }, { timeout: 180000, polling: 300 });
    try {
        // a lesson WITH a Prerequisite Check (its record's prereqs, switch live), else the first lesson
        const lessonId = arg('lesson') || await page.evaluate(async () => {
            const lib = await import('./js/modules/lessons/library.js');
            const all = (lib.lessonList ? lib.lessonList() : lib.LESSONS || []);
            const list = Array.isArray(all) ? all : Object.values(all);
            const hit = list.find((l) => l && Array.isArray(l.prereqs) && l.prereqs.length >= 3 && l.prereqsLive !== false) || list[0];
            return hit && hit.id;
        });
        console.log(`lesson: ${lessonId}`);
        await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
        await page.evaluate((id) => { try { localStorage.removeItem('mq_teacher_sets'); } catch (e) { /* */ } window.setUserRole('teacher'); window.tvOpenPrintWith([{ role: 'lesson', lessonId: id }]); }, lessonId);
        await ready();
        await new Promise((r) => setTimeout(r, 600));
        const parts = await page.$('.tv-parts');
        await parts.evaluate((el) => el.closest('.tv-section').scrollIntoView({ block: 'start' }));
        const rowsOf = () => page.evaluate(() => [...document.querySelectorAll('.tv-part')].map((r) => ({
            part: r.dataset.partRow, val: (r.querySelector('.tv-part-many .tv-step-val') || {}).textContent || '', range: (r.querySelector('.tv-part-many .tv-part-range') || {}).textContent || '',
            minus: !!(r.querySelector('.tv-part-many [data-dir="-1"]') || {}).disabled, plus: !!(r.querySelector('.tv-part-many [data-dir="1"]') || {}).disabled,
        })));
        const rows0 = await rowsOf();
        console.log(rows0.map((r) => `${r.part}: ${r.val || '-'} (${r.range})`).join('\n'));
        check(rows0.length >= 4, `only ${rows0.length} part rows`);
        // + at the default (the max) is disabled for every part whose default is its max
        for (const r of rows0) if (r.val && /to (\d+)/.test(r.range) && Number(r.val) === Number(/to (\d+)/.exec(r.range)[1])) check(r.plus, `${r.part}: + is offered at the max ${r.val}`);
        // step the Prerequisite Check down to its min: - is then disabled, the warning shows
        const prereq = rows0.find((r) => r.part === 'prereq');
        if (prereq && prereq.val) {
            for (let k = 0; k < 6; k++) {
                const b = await page.$('.tv-part[data-part-row="prereq"] [data-dir="-1"]');
                if (!b || await b.evaluate((x) => x.disabled)) break;
                await b.click();
            }
            const r = (await rowsOf()).find((x) => x.part === 'prereq');
            check(r.minus && Number(r.val) === Number(/^(\d+)/.exec(r.range)[1]), `prereq: - still offered at ${r.val} (${r.range})`);
            check(!!(await page.$('.tv-part[data-part-row="prereq"] .tv-part-warn')), 'prereq: no warning under 3 questions');
            // back up to 2 for the packet shot
            await page.click('.tv-part[data-part-row="prereq"] [data-dir="1"]');
        }
        // We Do 2, Practice at its min
        const stepTo = async (part, want) => {
            for (let k = 0; k < 20; k++) {
                const r = (await rowsOf()).find((x) => x.part === part);
                if (!r || !r.val || r.val === String(want)) return;
                const dir = Number(r.val) > want ? -1 : 1;
                const b = await page.$(`.tv-part[data-part-row="${part}"] .tv-part-many [data-dir="${dir}"]`);
                if (!b || await b.evaluate((x) => x.disabled)) return;
                await b.click();
            }
        };
        await stepTo('wedo', 2);
        const pr = (await rowsOf()).find((x) => x.part === 'practice');
        if (pr && pr.range && /^(\d+)/.test(pr.range)) await stepTo('practice', Number(/^(\d+)/.exec(pr.range)[1]));
        await new Promise((r) => setTimeout(r, 500));
        await page.waitForFunction(() => document.querySelector('#tvStage').dataset.state !== 'building', { timeout: 180000, polling: 300 });
        await new Promise((r) => setTimeout(r, 1500));
        await page.waitForFunction(() => document.querySelector('#tvStage').dataset.state !== 'building', { timeout: 180000, polling: 300 });
        check(!!(await page.$('.tv-parts-reset')), 'no "Reset all parts to the standard" after changes');
        await (await page.$('.tv-parts')).evaluate((el) => el.closest('.tv-section').scrollIntoView({ block: 'start' }));
        const sec = await page.$('.tv-section');
        await sec.screenshot({ path: path.join(OUT, 'print-lesson-1280.png') });
        // targets: every Parts control at least 44 px (the small pages stepper is 36 px wide, 36 tall: excluded by design? no - checked)
        const small = await page.evaluate(() => [...document.querySelectorAll('.tv-parts button, .tv-parts-reset')].filter((b) => b.offsetParent).map((b) => { const r = b.getBoundingClientRect(); return { a: b.dataset.act, part: b.dataset.part, w: Math.round(r.width), h: Math.round(r.height) }; }).filter((x) => x.h < 44));
        check(!small.length, `Parts controls under 44 px at 1280: ${JSON.stringify(small.slice(0, 4))}`);

        // phone
        await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
        await new Promise((r) => setTimeout(r, 800));
        const wide = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        check(wide <= 0, `sideways scroll at 390: ${wide} px`);
        const over = await page.evaluate(() => [...document.querySelectorAll('.tv-part')].filter((r) => r.scrollWidth > r.clientWidth + 1).map((r) => r.dataset.partRow));
        check(!over.length, `part cards wider than their box at 390: ${over.join(', ')}`);
        const small390 = await page.evaluate(() => [...document.querySelectorAll('.tv-parts button')].filter((b) => b.offsetParent).map((b) => { const r = b.getBoundingClientRect(); return { a: b.dataset.act, w: Math.round(r.width), h: Math.round(r.height) }; }).filter((x) => (x.h < 44 || x.w < 44)));
        check(!small390.length, `Parts controls under 44 px at 390: ${JSON.stringify(small390.slice(0, 4))}`);
        const box = await (await page.$('.tv-parts')).evaluate((el) => { const s = el.closest('.tv-divided'); s.scrollIntoView({ block: 'start' }); const r = s.getBoundingClientRect(); return { x: 0, y: r.top + window.scrollY, w: 390, h: r.height }; });
        await page.screenshot({ path: path.join(OUT, 'print-lesson-390.png'), clip: { x: 0, y: box.y - 8, width: 390, height: Math.min(box.h + 16, 4000) }, captureBeyondViewport: true });

        // the packet at these counts, each pupil page
        const docHtml = await page.evaluate(async (id) => {
            const lib = await import('./js/modules/lessons/library.js');
            const ref = lib.practiceRef(id);
            const fitReq = { role: 'lesson', lessonId: id, sections: [{ skills: [{ categoryId: ref.categoryId, skillId: ref.skillId, opts: ref.opts || {} }] }], size: 'M', paper: 'A4', seed: 4242, key: true, practicePages: 1, mixed: false };
            const r0 = await window.buildSheet(fitReq);
            const f = r0.lesson.partFit;
            const prac = f.practice ? Math.max(f.practice.minRows * f.practice.cols, 1) : undefined;
            const r = await window.buildSheet(Object.assign({}, fitReq, { partOpts: { wedo: { n: 2 }, prereq: f.prereq ? { n: 2 } : undefined, practice: prac !== undefined ? { n: prac } : undefined } }));
            window.__po = { fit: f, got: { prereq: r.lesson.prereqCheck && r.lesson.prereqCheck.length, wedo: r.lesson.teach.guided, practice: (r.items || []).filter((it) => it.part === 'practice').length } };
            return window.sheetDocument(r.pupilHtml, 'Lesson', { paper: 'A4' });
        }, lessonId);
        console.log('packet:', JSON.stringify(await page.evaluate(() => window.__po)));
        const sh = await browser.newPage();
        await sh.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
        await sh.goto(page.url(), { waitUntil: 'domcontentloaded' });
        await sh.setContent(docHtml, { waitUntil: 'networkidle0', timeout: 60000 });
        await sh.emulateMediaType('print');
        const pages = await sh.$$('body > section.ws-page, body > .ws-page');
        for (const [k, pg] of pages.entries()) await pg.screenshot({ path: path.join(OUT, `packet-nondefault-p${k + 1}.png`) });
        await sh.close();
        console.log(`wrote ${pages.length + 2} screenshots to ${path.relative(process.cwd(), OUT)}`);
    } finally { await app.close(); }
    for (const f of fails) console.log(`  ${f}`);
    console.log(fails.length ? `ws-partopts-shots: FAIL (${fails.length})` : 'ws-partopts-shots: OK');
    process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); console.log('ws-partopts-shots: FAIL'); process.exit(1); });
