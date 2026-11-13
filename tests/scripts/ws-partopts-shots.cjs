#!/usr/bin/env node
// ws-partopts-shots — screenshots and screen checks of lane lf-partopts (design/partopts/DESIGN.md §1.1-1.2, §8), device scale 1.
//
//   node tests/scripts/ws-partopts-shots.cjs [--lessons Y1.B2.S9,Y4.B1.S14,Y2.B2.S18] [--out design/partopts/shots-A2]
//
// For each library lesson (a fact lesson, a rounding / place-value lesson and a multi-digit lesson by default):
//   <id>-1280.png    the real Print screen's Lesson parts at 1280 px (the full-width table under the preview, F9)
//   <id>-390.png     the same at phone width (one compact row per part, F5)
//   <id>-<M|L>-<min|max>-p<k>.png   the packet with every part at its min / its max (the values the screen offers), each page
// It asserts what the screen must do (critic A r1, each finding's check):
//   F3  switching the section's skill clears its part settings: no Reset link, Vocabulary back at its default
//   F4  a stepper at 0 keeps + live, and stepping up ticks the part again; - is disabled at the stepper's first value
//   F5  inside every part row no two visible controls or texts overlap, at 390 and 1280; no sideways scroll at 390
//   F6  a fixed count is written once ("Fixed: ..."), never "15 · 15 a page"
//   F7  a part with no room ("Not on this lesson sheet") has no tick and no New numbers
//   F8  no Supports pill: the standard is plain text until step B
//   F9  at 1280 the Parts are the full-width table, at most 700 px tall for a 7-part lesson; Remember shows no lone "-"
//   F10 the lesson sheet's parts share ONE New numbers
//   and every Parts control is at least 44 px.
'use strict';
const fs = require('fs');
const path = require('path');
const { open } = require('../lib/ws-harness.cjs');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const OUT = path.resolve(arg('out', path.join(__dirname, '..', '..', 'design', 'partopts', 'shots-A2')));
const LESSONS = arg('lessons', 'Y1.B2.S9,Y4.B1.S14,Y2.B2.S18').split(',');
const fails = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
    fs.mkdirSync(OUT, { recursive: true });
    const app = await open({ seed: 1 });
    const { page, browser } = app;
    const idle = async () => { await sleep(400); await page.waitForFunction(() => { const s = document.querySelector('#tvStage'); return s && s.dataset.state !== 'building' && document.querySelector('.tv-parts'); }, { timeout: 180000, polling: 300 }); await sleep(300); };
    const rowsOf = () => page.evaluate(() => [...document.querySelectorAll('.tv-part[data-part-row]')].map((r) => ({
        part: r.dataset.partRow, val: (r.querySelector('.tv-part-many .tv-step-val') || {}).textContent || '', range: [...r.querySelectorAll('.tv-part-many .tv-part-range')].map((x) => x.textContent).join(' '),
        many: (r.querySelector('.tv-part-many') || {}).textContent.trim(), tick: !!r.querySelector('[data-act="part-on"]'), on: (r.querySelector('[data-act="part-on"]') || {}).getAttribute ? r.querySelector('[data-act="part-on"]').getAttribute('aria-checked') === 'true' : null,
        minus: !!(r.querySelector('.tv-part-many [data-dir="-1"]') || {}).disabled, plus: !!(r.querySelector('.tv-part-many [data-dir="1"]') || {}).disabled, hasStep: !!r.querySelector('.tv-part-many [data-dir="1"]'),
        refresh: !!r.querySelector('[data-act="part-new"]'),
    })));
    const click = async (sel) => { const b = await page.$(sel); if (!b || await b.evaluate((x) => x.disabled)) return false; await b.click(); await sleep(150); return true; };
    // (F5) overlapping boxes inside a part row
    const overlaps = () => page.evaluate(() => {
        const out = [];
        for (const r of document.querySelectorAll('.tv-part')) {
            const els = [...r.querySelectorAll('button, output, .tv-part-range, .tv-part-name > span, .tv-part-sup-t, .tv-part-note')].filter((e) => e.offsetParent && e.getBoundingClientRect().width > 0);
            const bx = els.map((e) => e.getBoundingClientRect());
            for (let a = 0; a < els.length; a++) for (let b = a + 1; b < els.length; b++) {
                if (els[a].contains(els[b]) || els[b].contains(els[a])) continue;
                const A = bx[a], B = bx[b];
                if (A.left < B.right - 1 && B.left < A.right - 1 && A.top < B.bottom - 1 && B.top < A.bottom - 1) out.push(`${r.dataset.partRow || 'group'}: ${els[a].className || els[a].tagName} x ${els[b].className || els[b].tagName}`);
            }
        }
        return out;
    });
    const small = (both) => page.evaluate((both) => [...document.querySelectorAll('.tv-parts button, .tv-parts-reset')].filter((b) => b.offsetParent).map((b) => { const r = b.getBoundingClientRect(); return { a: b.dataset.act, part: b.dataset.part, w: Math.round(r.width), h: Math.round(r.height) }; }).filter((x) => x.h < 44 || (both && x.a !== 'parts-reset' && x.w < 44)), both);
    const lint = (rows, where) => {
        for (const r of rows) {
            // (F6) a fixed count written twice / "a page" as a phrase
            if (!r.hasStep) check(!/^(\d+)\s*·?\s*\1\b/.test(r.many.replace(/\s+/g, ' ')) && !/\d+ a page \(/.test(r.many) && (!/\d/.test(r.many) || /^(Fixed|Not on)/.test(r.many.trim())), `${where} ${r.part}: a fixed count not written once as "Fixed: n (why)" - "${r.many}"`);
            // (F9) no lone dash
            check(r.many !== '—' && r.many !== '-', `${where} ${r.part}: a lone dash`);
            // (F7)
            if (/Not on this lesson sheet/.test(r.many)) check(!r.tick && !r.refresh, `${where} ${r.part}: no room, yet a tick or New numbers`);
            // (F10)
            if (['vocab', 'remember', 'wedo', 'rows'].includes(r.part)) check(!r.refresh, `${where} ${r.part}: its own New numbers (the lesson sheet has one)`);
        }
    };
    try {
        for (const id of LESSONS) {
            const tag = id.replace(/[^A-Za-z0-9]+/g, '_');
            await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
            await page.evaluate((id) => { try { localStorage.removeItem('mq_teacher_sets'); } catch (e) { /* */ } window.setUserRole('teacher'); window.tvOpenPrintWith([{ role: 'lesson', lessonId: id }]); }, id);
            await idle();
            // (F9) the full-width card
            const card = await page.$('#tvPartsWide:not([hidden]) .tv-parts');
            check(!!card, `${id} 1280: the Parts are not in the full-width card`);
            const rows0 = await rowsOf();
            console.log(`${id}\n` + rows0.map((r) => `  ${r.part}: ${r.val || '-'} | ${r.range}`).join('\n'));
            lint(rows0, `${id} 1280`);
            const ph = await page.evaluate(() => { const e = document.querySelector('#tvPartsWide .tv-parts'); return e ? Math.round(e.getBoundingClientRect().height) : 0; });
            check(ph > 0 && ph <= 700, `${id} 1280: Parts ${ph} px tall (limit 700)`);
            check(!(await page.$('.tv-part-chip')), `${id}: a Supports pill (F8)`);
            check((await page.$$('[data-act="part-new"][data-part="sheet"]')).length === 1, `${id}: not one New numbers for the lesson sheet (F10)`);
            const ov = await overlaps(); check(!ov.length, `${id} 1280 overlaps: ${ov.slice(0, 3).join('; ')}`);
            const sm = await small(false); check(!sm.length, `${id} 1280: controls under 44 px ${JSON.stringify(sm.slice(0, 3))}`);
            // (F4) Vocabulary down to 0: the tick clears, + stays live; + ticks it again
            if (rows0.find((r) => r.part === 'vocab' && r.hasStep)) {
                for (let k = 0; k < 5; k++) if (!await click('#tvPartsWide .tv-part[data-part-row="vocab"] [data-dir="-1"]')) break;
                await idle();
                let v = (await rowsOf()).find((r) => r.part === 'vocab');
                // (0 is offered only where the sheet still fills without the band: at the stepper's first value - is disabled,
                // + is live, and at 0 the tick is cleared)
                check(v.minus && !v.plus && (v.val !== '0' || v.on === false), `${id}: Vocabulary at its first value - ${JSON.stringify(v)}`);
                await page.screenshot({ path: path.join(OUT, `${tag}-1280-vocab0.png`), clip: await page.evaluate(() => { const r = document.querySelector('#tvPartsWide').getBoundingClientRect(); return { x: r.left, y: r.top + window.scrollY, width: r.width, height: r.height }; }), captureBeyondViewport: true });
                await click('#tvPartsWide .tv-part[data-part-row="vocab"] [data-dir="1"]');
                await idle();
                v = (await rowsOf()).find((r) => r.part === 'vocab');
                check(v.on === true && Number(v.val) >= 1, `${id}: + from the first value did not step up (or tick Vocabulary again) - ${JSON.stringify(v)}`);
                lint(await rowsOf(), `${id} 1280 changed`);
            }
            await page.evaluate(() => document.querySelector('#tvPartsWide').scrollIntoView({ block: 'start' }));
            await page.screenshot({ path: path.join(OUT, `${tag}-1280.png`), clip: await page.evaluate(() => { const r = document.querySelector('#tvPartsWide').getBoundingClientRect(); return { x: r.left, y: r.top + window.scrollY, width: r.width, height: r.height }; }), captureBeyondViewport: true });
            await page.screenshot({ path: path.join(OUT, `${tag}-1280-screen.png`) });

            // phone
            await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
            await sleep(900);
            check(!!(await page.$('.tv-section .tv-parts')), `${id} 390: the Parts are not in the section`);
            const wide = await page.evaluate(() => Math.max(0, ...[...document.querySelectorAll('.tv-section, .tv-section *')].filter((e) => e.offsetParent).map((e) => Math.round(e.getBoundingClientRect().right - window.innerWidth))));
            check(wide <= 0, `${id}: sideways scroll at 390: ${wide} px`);
            const ov3 = await overlaps(); check(!ov3.length, `${id} 390 overlaps: ${ov3.slice(0, 3).join('; ')}`);
            const sm3 = await small(true); check(!sm3.length, `${id} 390: controls under 44 px ${JSON.stringify(sm3.slice(0, 3))}`);
            lint(await rowsOf(), `${id} 390`);
            const pw = await page.evaluate(() => Math.round(document.querySelector('.tv-section .tv-parts').getBoundingClientRect().width));
            console.log(`  390: Parts ${pw} px wide`);
            const box = await page.evaluate(() => { const s = document.querySelector('.tv-section .tv-parts-wrap'); s.scrollIntoView({ block: 'start' }); const r = s.getBoundingClientRect(); return { y: r.top + window.scrollY, h: r.height }; });
            await page.screenshot({ path: path.join(OUT, `${tag}-390.png`), clip: { x: 0, y: box.y - 8, width: 390, height: Math.min(box.h + 16, 4000) }, captureBeyondViewport: true });

            // (F3) switch the skill: the part settings go
            if (id === LESSONS[0]) {
                await click('.tv-section .tv-part[data-part-row="vocab"] [data-dir="-1"]');
                await idle();
                check(!!(await page.$('.tv-parts-reset')), `${id}: no Reset link after a change`);
                await click('[data-act="remove-skill"][data-sec="0"]');
                await sleep(300);
                await click('[data-act="pick"][data-sec="0"]');
                await sleep(300);
                const inp = await page.$('[data-pick="0"]');
                if (inp) {
                    await inp.type('round to the nearest 10');
                    await sleep(1200);
                    await click('[data-act="pick-skill"][data-sec="0"]');
                    await idle();
                    const after = await page.evaluate(() => ({ reset: !!document.querySelector('.tv-parts-reset'), vocab: (document.querySelector('.tv-part[data-part-row="vocab"] .tv-step-val') || {}).textContent }));
                    check(!after.reset, `${id}: after switching the skill the Reset link still shows (F3)`);
                    console.log('  after switch:', JSON.stringify(after));
                } else check(false, `${id}: could not reach the skill search to switch skills`);
            }
        }

        // packets at min and max, M and L - the values the screen offers (ws-partopts-unit's own loop: a value no longer
        // offered snaps), each pupil page
        const po = await page.evaluate(async () => import('./js/modules/sheet/part-opts.js'));
        void po;
        for (const id of LESSONS) for (const size of ['M', 'L']) for (const which of ['min', 'max']) {
            const html = await page.evaluate(async ({ id, size, which }) => {
                const P = await import('./js/modules/sheet/part-opts.js');
                const lib = await import('./js/modules/lessons/library.js');
                const ref = lib.practiceRef(id);
                const req = { role: 'lesson', lessonId: id, sections: [{ skills: [{ categoryId: ref.categoryId, skillId: ref.skillId, opts: ref.opts || {} }] }], size, paper: 'A4', seed: 4242, key: true, practicePages: 1, mixed: true };
                let r = await window.buildSheet(req);
                const lims = P.allPartLimits(r.lesson.partFit);
                const want = {};
                for (const [p, lim] of Object.entries(lims)) {
                    const vals = P.offeredValues(lim);
                    if (which === 'min') { if (['vocab', 'rows', 'wedo'].includes(p) && lim.canOff && !lim.none) want[p] = { on: false }; else if (lim.toggle && lim.canOff) want[p] = { on: false }; else if (vals.length) want[p] = { n: vals[0] }; }
                    else if (vals.length && !lim.toggle) want[p] = { n: vals[vals.length - 1] };
                }
                let cur = P.normalizePartOpts(want, null);
                for (let k = 0; k < 4; k++) { r = await window.buildSheet(Object.assign({}, req, { partOpts: cur })); const nx = P.normalizePartOpts(cur, P.allPartLimits(r.lesson.partFit)); if (JSON.stringify(nx) === JSON.stringify(cur)) break; cur = nx; }
                window.__po = { cur, teach: r.lesson.teach && { guided: r.lesson.teach.guided, independent: r.lesson.teach.independent, fill: r.lesson.teach.fill }, pages: r.pageCount };
                return window.sheetDocument(r.pupilHtml, 'Lesson', { paper: 'A4' });
            }, { id, size, which });
            console.log(`packet ${id} ${size} ${which}:`, JSON.stringify(await page.evaluate(() => window.__po)));
            const sh = await browser.newPage();
            await sh.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
            await sh.goto(page.url(), { waitUntil: 'domcontentloaded' });
            await sh.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
            await sh.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', { timeout: 15000 }).catch(() => {});
            await sh.emulateMediaType('print');
            const pages = await sh.$$('body > section.ws-page, body > .ws-page');
            // (the lesson sheet and the first page of every other sheet: enough to see each part)
            const keep = await sh.evaluate(() => [...document.querySelectorAll('body > section.ws-page, body > .ws-page')].map((p, i, a) => i === 0 || p.getAttribute('data-ws-sheet') !== a[i - 1].getAttribute('data-ws-sheet') || p.getAttribute('data-ws-sheet') === 'lesson-sheet' || i === a.length - 1));
            for (const [k, pg] of pages.entries()) if (keep[k]) await pg.screenshot({ path: path.join(OUT, `${id.replace(/[^A-Za-z0-9]+/g, '_')}-${size}-${which}-p${k + 1}.png`) });
            await sh.close();
        }
        console.log(`screenshots in ${path.relative(process.cwd(), OUT)}`);
    } finally { await app.close(); }
    for (const f of fails) console.log(`  ${f}`);
    console.log(fails.length ? `ws-partopts-shots: FAIL (${fails.length})` : 'ws-partopts-shots: OK');
    process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); console.log('ws-partopts-shots: FAIL'); process.exit(1); });
