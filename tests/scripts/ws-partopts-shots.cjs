#!/usr/bin/env node
// ws-partopts-shots — screenshots and screen checks of lane lf-partopts (design/partopts/DESIGN.md §1.1-1.2, §8), device scale 1.
//
//   node tests/scripts/ws-partopts-shots.cjs [--lessons Y1.B2.S9,Y4.B1.S14,Y2.B2.S18] [--out design/partopts/shots-A2] [--no-packets]
//
// For each library lesson (a fact lesson, a rounding / place-value lesson and a multi-digit lesson by default):
//   <id>-1280.png    the real Print screen's Lesson parts at 1280 px (the full-width table under the preview, F9)
//   <id>-390.png     the same at phone width (one compact row per part, F5)
//   <id>-<M|L>-<min|max|combo>-p<k>.png   the packet with every part at its min / its max (the values the screen offers), and
//                   the critic's combination reached step by step (Vocabulary 0, Remember off, We Do one down), each page
//   critic A r2: N3 the lesson sheet caption names the preview's own lesson-sheet pages (M and L), a multi-page Practice / Mixed
//   says its pages; N5 a locked tick says why in visible text; N6 no "a page" on a total, "or 0 to leave it off" wherever the
//   stepper reaches 0, no lone word wrapped onto a line at 390
// It asserts what the screen must do (critic A r1, each finding's check):
//   F3  switching the section's skill clears its part settings: no Reset link, Vocabulary back at its default
//   F4  a stepper at 0 keeps + live, and stepping up ticks the part again; - is disabled at the stepper's first value
//   F5  inside every part row no two visible controls or texts overlap, at 390 and 1280; no sideways scroll at 390
//   F6  a fixed count is written once ("Fixed: ..."), never "15 · 15 a page"
//   F7  a part with no room ("Not on this lesson sheet") has no tick and no New numbers
//   F8  (step B) a Supports chip is a closed button reading Standard / Custom; a part with none says "None to choose"
//   F9  at 1280 the Parts are the full-width table, at most 700 px tall for a 7-part lesson; Remember shows no lone "-"
//   F10 the lesson sheet's parts share ONE New numbers
//   critic A r3: R1 a part that does not print (no tick, "Not on this lesson sheet", "Not added") shows no lock reason;
//   R2 Y4.B1.S14 Practice / Mixed at their max at M, then Size L: a clamped count's note gives no "half full" rounding reason
//   and says it is the most (fewest) at the size; R4 at 390 the whole page (not only the section) does not scroll sideways,
//   on the standard packet and after the largest packet
//   and every Parts control is at least 44 px (H6).
//
// Every check's message ends with the finding it comes from - (F3) ... (F10), (N3), (N5), (N6), (R1), (R2), (R4), (H6); a
// message with no tag is a setup failure (the screen could not be reached) and always counts.
//   --only F3,R1   count only those findings (setup failures still count) and skip the steps no listed finding needs: the
//                  narrow form the backtests use (tests/fixtures/precritic/backtests.json, rows partopts-*)
//   --no-shots     take no screenshots (ws-precritic's row)
//   MQ_ROOT=<tree> serve and judge another checkout (ws-backtest commit-pair rows); this script is always today's.
// A crash prints `ws-partopts-shots: ERROR (...)`, never FAIL: a check that could not run has not found anything.
'use strict';
const fs = require('fs');
const path = require('path');
const { open } = require('../lib/ws-harness.cjs');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const ROOT = process.env.MQ_ROOT ? path.resolve(process.env.MQ_ROOT) : path.resolve(__dirname, '..', '..');
const OUT = path.resolve(arg('out', path.join(ROOT, 'design', 'partopts', 'shots-A2')));
const NO_SHOTS = argv.includes('--no-shots');
// (the four lessons critic A r2 graded; `skill:<category>:<skill>` opens a skill's own lesson - a story lesson with no library id)
const LESSONS = arg('lessons', 'Y1.B2.S9,Y4.B1.S14,Y4.B2.S5,skill:addition:add_wp_10').split(',');
const skillOf = (id) => (id.startsWith('skill:') ? { categoryId: id.split(':')[1], skillId: id.split(':')[2] } : null);
const ONLY = arg('only') ? arg('only').split(',').map((s) => s.trim()).filter(Boolean) : null;
/** True when the run judges any of these findings (no --only: every one). */
const want = (...tags) => !ONLY || tags.some((t) => ONLY.includes(t));
const tagOf = (msg) => { const m = [...String(msg).matchAll(/[(, ]([FNR]\d+|H6)\)/g)]; return m.length ? m[m.length - 1][1] : null; };
const fails = [];
const check = (ok, msg) => { if (ok) return; const t = tagOf(msg); if (!t || want(t)) fails.push(msg); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
    if (!NO_SHOTS) fs.mkdirSync(OUT, { recursive: true });
    const app = await open({ seed: 1 });
    const { page, browser } = app;
    const idle = async () => { await sleep(400); await page.waitForFunction(() => { const s = document.querySelector('#tvStage'); return s && s.dataset.state !== 'building' && document.querySelector('.tv-parts'); }, { timeout: 180000, polling: 300 }); await sleep(300); };
    const rowsOf = () => page.evaluate(() => [...document.querySelectorAll('.tv-part[data-part-row]')].map((r) => ({
        part: r.dataset.partRow, val: (r.querySelector('.tv-part-many .tv-step-val') || {}).textContent || '', range: [...r.querySelectorAll('.tv-part-many .tv-part-range')].map((x) => x.textContent).join(' '),
        many: (r.querySelector('.tv-part-many') || {}).textContent.trim(), tick: !!r.querySelector('[data-act="part-on"]'), on: (r.querySelector('[data-act="part-on"]') || {}).getAttribute ? r.querySelector('[data-act="part-on"]').getAttribute('aria-checked') === 'true' : null,
        minus: !!(r.querySelector('.tv-part-many [data-dir="-1"]') || {}).disabled, plus: !!(r.querySelector('.tv-part-many [data-dir="1"]') || {}).disabled, hasStep: !!r.querySelector('.tv-part-many [data-dir="1"]'),
        refresh: !!r.querySelector('[data-act="part-new"]'),
        locked: !!r.querySelector('[data-act="part-on"][disabled]'),
        lockWhy: [...r.querySelectorAll('.tv-part-lock')].filter((x) => x.offsetParent).map((x) => x.textContent.trim()).join(' | '),
        note: [...r.querySelectorAll('.tv-part-note')].filter((x) => x.offsetParent).map((x) => x.textContent.replace(/\s+/g, ' ').trim()).join(' | '),
        tickOn: !!r.querySelector('[data-act="part-on"]:not([disabled])'),
        visText: [...r.querySelectorAll('.tv-part-range, .tv-part-note')].filter((x) => x.offsetParent && x.getBoundingClientRect().width > 0).map((x) => x.textContent.replace(/\s+/g, ' ').trim()).join(' | '),
    })));
    // (critic A r2 N3) the lesson sheet's caption against the preview's own lesson-sheet pages
    const captionCheck = async (where) => {
        const got = await page.evaluate(() => {
            const cap = [...document.querySelectorAll('.tv-part-group .tv-part-range')].filter((x) => x.offsetParent).map((x) => x.textContent.replace(/\s+/g, ' '))[0] || '';
            const fr = document.querySelector('#tvPreviewFrame');
            let sheet = -1, mixed = -1, practice = -1;
            try { const d = fr.contentDocument; sheet = d.querySelectorAll('.ws-page[data-ws-sheet="lesson-sheet"]').length; mixed = d.querySelectorAll('.ws-page[data-ws-sheet="lesson-mixed"]').length; practice = d.querySelectorAll('.ws-page[data-ws-sheet="lesson-practice"]').length; } catch (e) { /* */ }
            const txt = (p) => { const r = document.querySelector(`.tv-part[data-part-row="${p}"] .tv-part-many`); return r ? r.textContent.replace(/\s+/g, ' ') : ''; };
            return { cap, sheet, mixed, practice, mixedT: txt('mixed'), practiceT: txt('practice'), rowsT: txt('rows') };
        });
        const N = { one: 1, two: 2, three: 3 };
        const said = (t) => { const a = /\b(one|1) page\b/.exec(t); if (a) return 1; const b = /\b(\d+|two|three) pages\b/.exec(t); return b ? (N[b[1]] || Number(b[1])) : null; };
        check(got.sheet > 0 && said(got.cap) === got.sheet, `${where}: the lesson sheet caption "${got.cap}" - the preview has ${got.sheet} lesson-sheet page(s) (N3)`);
        if (/fills the page/.test(got.rowsT)) check(got.sheet === 1, `${where}: rows "${got.rowsT}" over a ${got.sheet}-page sheet (N3)`);
        for (const [k, n, t] of [['mixed', got.mixed, got.mixedT], ['practice', got.practice, got.practiceT]]) if (n > 1) check(said(t) === n, `${where}: ${k} prints ${n} pages, its row says "${t}" (N3)`);
        return got;
    };
    // (critic A r2 N5, N6) a locked tick says why in its row; one form of range text; no lone wrapped word
    const textLint = async (rows, where, phone) => {
        for (const r of rows) {
            if (r.locked) check(/needed|always/i.test(r.visText), `${where} ${r.part}: a locked tick with no visible reason ("${r.visText}") (N5)`);
            // (critic A r3 R1, the converse of N5: a part that does not print - no tick, or "Not on this lesson sheet" / "Not added" -
            // carries no lock reason; "Needed to fill the sheet" beside "Not on this lesson sheet (no room)" contradicts itself)
            if (!r.tick || /Not on this lesson sheet|Not added/.test(r.visText)) check(!r.lockWhy, `${where} ${r.part}: "${r.lockWhy}" on a part that does not print ("${r.visText}") (R1)`);
            check(!/\d+ a page\b/.test(r.visText), `${where} ${r.part}: "${r.visText}" ("a page" on a total, N6)`);
            if (['vocab', 'wedo', 'rows', 'practice', 'mixed'].includes(r.part) && r.hasStep && r.tickOn) check(/or 0 to leave it off/.test(r.visText), `${where} ${r.part}: its stepper reaches 0, the text "${r.visText}" does not say "or 0 to leave it off" (N6)`);
        }
        if (phone) {
            const lone = await page.evaluate(() => {
                const out = [];
                for (const el of document.querySelectorAll('.tv-section .tv-parts .tv-part-range, .tv-section .tv-parts .tv-part-note')) {
                    if (!el.offsetParent) continue;
                    const lines = new Map();
                    const walk = (n) => { for (const c of n.childNodes) { if (c.nodeType === 3) { const t = c.textContent; const re = /\S+/g; let m; while ((m = re.exec(t))) { const rg = document.createRange(); rg.setStart(c, m.index); rg.setEnd(c, m.index + m[0].length); const b = rg.getClientRects()[0]; if (b) { const k = Math.round(b.top); lines.set(k, (lines.get(k) || 0) + 1); } } } else walk(c); } };
                    walk(el);
                    const ks = [...lines.keys()].sort((a, b) => a - b);
                    if (ks.length > 1 && ks.slice(1).some((k) => lines.get(k) === 1)) out.push(el.textContent.replace(/\s+/g, ' ').trim());
                }
                return out;
            });
            check(!lone.length, `${where}: a lone word wrapped onto its own line: ${lone.slice(0, 3).map((x) => `"${x}"`).join(', ')} (N6)`);
        }
    };
    const shotEl = async (sel, file) => {
        if (NO_SHOTS) return;
        const clip = await page.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return null; e.scrollIntoView({ block: 'start' }); const r = e.getBoundingClientRect(); return { x: r.left, y: r.top + window.scrollY, width: r.width, height: r.height }; }, sel);
        if (clip && clip.width > 0 && clip.height > 0) await page.screenshot({ path: path.join(OUT, file), clip, captureBeyondViewport: true });
    };
    // (a DOM click: the Print screen re-renders its controls while a build lands, so a held handle can be detached)
    const click = async (sel) => { const ok = await page.evaluate((sel) => { const b = document.querySelector(sel); if (!b || b.disabled) return false; b.scrollIntoView({ block: 'center' }); b.click(); return true; }, sel); await sleep(150); return ok; };
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
            if (!r.hasStep) check(!/^(\d+)\s*·?\s*\1\b/.test(r.many.replace(/\s+/g, ' ')) && !/\d+ a page \(/.test(r.many) && (!/\d/.test(r.many) || /^(Fixed|Not on)/.test(r.many.trim())), `${where} ${r.part}: a fixed count not written once as "Fixed: n (why)" - "${r.many}" (F6)`);
            // (F9) no lone dash
            check(r.many !== '—' && r.many !== '-', `${where} ${r.part}: a lone dash (F9)`);
            // (F7)
            if (/Not on this lesson sheet|no room|No row fits/i.test(r.many)) check(!r.tick && !r.refresh, `${where} ${r.part}: no room, yet a tick or New numbers (F7)`);
            // (F10)
            if (['vocab', 'remember', 'wedo', 'rows'].includes(r.part)) check(!r.refresh, `${where} ${r.part}: its own New numbers (the lesson sheet has one) (F10)`);
        }
    };
    try {
        for (const id of LESSONS) {
            const tag = id.replace(/[^A-Za-z0-9]+/g, '_');
            await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
            const sk = skillOf(id);
            await page.evaluate(({ id, sk }) => { try { localStorage.removeItem('mq_teacher_sets'); } catch (e) { /* */ } window.setUserRole('teacher'); window.tvOpenPrintWith(sk ? [sk] : [{ role: 'lesson', lessonId: id }]); }, { id, sk });
            await sleep(500);
            if (sk) { await click('[data-act="types"][data-sec="0"]'); await sleep(300); check(await click('[data-act="role"][data-sec="0"][data-v="lesson"]'), `${id}: could not choose the Lesson page type`); }
            await click('[data-act="size"][data-v="M"]');
            await idle();
            // (F9) the full-width card
            const card = await page.$('#tvPartsWide:not([hidden]) .tv-parts');
            check(!!card, `${id} 1280: the Parts are not in the full-width card (F9)`);
            const rows0 = await rowsOf();
            console.log(`${id}\n` + rows0.map((r) => `  ${r.part}: ${r.val || '-'} | ${r.range}`).join('\n'));
            lint(rows0, `${id} 1280`);
            await textLint(rows0, `${id} 1280 M`, false);
            console.log('  M caption:', JSON.stringify(await captionCheck(`${id} 1280 M`)));
            // (N3 at L: the size the critic found "one page" over a two-page sheet)
            if (want('N3', 'N5', 'N6', 'R1')) {
                await click('[data-act="size"][data-v="L"]');
                await idle();
                await textLint(await rowsOf(), `${id} 1280 L`, false);
                console.log('  L caption:', JSON.stringify(await captionCheck(`${id} 1280 L`)));
                await shotEl('#tvPartsWide', `${tag}-1280-L.png`);
                await click('[data-act="size"][data-v="M"]');
                await idle();
            }
            const ph = await page.evaluate(() => { const e = document.querySelector('#tvPartsWide .tv-parts'); return e ? Math.round(e.getBoundingClientRect().height) : 0; });
            check(ph > 0 && ph <= 700, `${id} 1280: Parts ${ph} px tall (limit 700) (F9)`);
            // (F8, superseded by step B: the Supports cell is a chip that opens its panel - a button, closed, reading Standard - or plain text)
            check(await page.evaluate(() => [...document.querySelectorAll('.tv-part-chip')].every((c) => c.tagName === 'BUTTON' && c.getAttribute('aria-expanded') === 'false' && /^(Supports: )?(Standard|Custom)/.test(c.textContent.trim()))), `${id}: a Supports chip that is not a closed button reading Standard / Custom (F8)`);
            check((await page.$$('[data-act="part-new"][data-part="sheet"]')).length === 1, `${id}: not one New numbers for the lesson sheet (F10)`);
            const ov = await overlaps(); check(!ov.length, `${id} 1280 overlaps: ${ov.slice(0, 3).join('; ')} (F5)`);
            const sm = await small(false); check(!sm.length, `${id} 1280: controls under 44 px ${JSON.stringify(sm.slice(0, 3))} (H6)`);
            // (F4) Vocabulary down to 0: the tick clears, + stays live; + ticks it again
            const W = (await page.$('#tvPartsWide:not([hidden]) .tv-parts')) ? '#tvPartsWide ' : '';
            if (want('F4') && rows0.find((r) => r.part === 'vocab' && r.hasStep)) {
                for (let k = 0; k < 5; k++) if (!await click(`${W}.tv-part[data-part-row="vocab"] [data-dir="-1"]`)) break;
                await idle();
                let v = (await rowsOf()).find((r) => r.part === 'vocab');
                // (0 is offered only where the sheet still fills without the band: at the stepper's first value - is disabled,
                // + is live, and at 0 the tick is cleared)
                check(v.minus && !v.plus && (v.val !== '0' || v.on === false), `${id}: Vocabulary at its first value - ${JSON.stringify(v)} (F4)`);
                await shotEl('#tvPartsWide', `${tag}-1280-vocab0.png`);
                await click(`${W}.tv-part[data-part-row="vocab"] [data-dir="1"]`);
                await idle();
                v = (await rowsOf()).find((r) => r.part === 'vocab');
                check(v.on === true && Number(v.val) >= 1, `${id}: + from the first value did not step up (or tick Vocabulary again) - ${JSON.stringify(v)} (F4)`);
                lint(await rowsOf(), `${id} 1280 changed`);
            }
            await shotEl('#tvPartsWide', `${tag}-1280.png`);
            if (!NO_SHOTS) await page.screenshot({ path: path.join(OUT, `${tag}-1280-screen.png`) });

            // phone
            if (want('F5', 'F6', 'F7', 'F9', 'F10', 'H6', 'N5', 'N6', 'R1', 'R4')) {
            await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
            await sleep(900);
            check(!!(await page.$('.tv-section .tv-parts')), `${id} 390: the Parts are not in the section (F5)`);
            const wide = await page.evaluate(() => Math.max(0, ...[...document.querySelectorAll('.tv-section, .tv-section *')].filter((e) => e.offsetParent).map((e) => Math.round(e.getBoundingClientRect().right - window.innerWidth))));
            check(wide <= 0, `${id}: sideways scroll at 390: ${wide} px (F5)`);
            // (critic A r3 R4: the whole page, not only the section - the preview's page tabs widen with each page)
            const pageWide = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
            check(pageWide <= 0, `${id} 390: the page scrolls sideways by ${pageWide} px (R4)`);
            const ov3 = await overlaps(); check(!ov3.length, `${id} 390 overlaps: ${ov3.slice(0, 3).join('; ')} (F5)`);
            const sm3 = await small(true); check(!sm3.length, `${id} 390: controls under 44 px ${JSON.stringify(sm3.slice(0, 3))} (H6)`);
            lint(await rowsOf(), `${id} 390`);
            await textLint(await rowsOf(), `${id} 390`, true);
            const pw = await page.evaluate(() => { const e = document.querySelector('.tv-section .tv-parts'); return e ? Math.round(e.getBoundingClientRect().width) : 0; });
            console.log(`  390: Parts ${pw} px wide`);
            const box = await page.evaluate(() => { const s = document.querySelector('.tv-section .tv-parts-wrap') || document.querySelector('.tv-section .tv-parts'); if (!s) return null; s.scrollIntoView({ block: 'start' }); const r = s.getBoundingClientRect(); return { y: r.top + window.scrollY, h: r.height }; });
            if (box && !NO_SHOTS) await page.screenshot({ path: path.join(OUT, `${tag}-390.png`), clip: { x: 0, y: Math.max(0, box.y - 8), width: 390, height: Math.min(box.h + 16, 4000) }, captureBeyondViewport: true });
            }

            // (F3) switch the skill: the part settings go
            if (id === LESSONS[0] && want('F3')) {
                await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
                await sleep(600);
                await click('.tv-section .tv-part[data-part-row="vocab"] [data-dir="-1"]');
                await idle();
                check(!!(await page.$('.tv-parts-reset')), `${id}: no Reset link after a change (F3)`);
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

        // (critic A r3 R2 + R4) Y4.B1.S14 by steps: Practice and Mixed + to their last values at M (the largest packet); at 390 the
        // whole page must not scroll sideways (R4); then Size L - a count over the new maximum is a clamp: its note may say
        // "under half full" only when the asked count lay BETWEEN two offered values (it is then a rounding), never at the end
        // of the range (R2: "Rounded to 30 so no page is under half full" for Mixed 42 > 30, the most at L)
        if (want('R2', 'R4')) {
            const id = 'Y4.B1.S14';
            await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
            await page.evaluate(({ id }) => { try { localStorage.removeItem('mq_teacher_sets'); } catch (e) { /* */ } window.setUserRole('teacher'); window.tvOpenPrintWith([{ role: 'lesson', lessonId: id }]); }, { id });
            await sleep(500);
            await click('[data-act="size"][data-v="M"]');
            await idle();
            const asked = {};
            for (const p of ['practice', 'mixed']) {
                for (let k = 0; k < 12; k++) { if (!await click(`#tvPartsWide .tv-part[data-part-row="${p}"] [data-dir="1"]`)) break; await idle(); }
                asked[p] = Number((await rowsOf()).find((r) => r.part === p).val);
            }
            await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
            await sleep(900);
            await idle();
            const maxWide = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
            console.log(`R4 ${id} M Practice ${asked.practice} Mixed ${asked.mixed}: the page is ${maxWide} px wider than 390`);
            check(maxWide <= 0, `${id} 390 (Practice ${asked.practice}, Mixed ${asked.mixed}): the page scrolls sideways by ${maxWide} px (R4)`);
            await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
            await sleep(600);
            await click('[data-act="size"][data-v="L"]');
            await idle();
            const rows = await rowsOf();
            for (const p of ['practice', 'mixed']) {
                const r = rows.find((x) => x.part === p);
                const got = Number(r.val);
                // (the asked count left the new range when the stepper sits at its end in the asked direction)
                const outside = (asked[p] > got && r.plus) || (asked[p] < got && r.minus);
                console.log(`R2 ${id} M ${p} ${asked[p]} -> L ${got}: "${r.note}"`);
                if (outside) {
                    check(!/half full/.test(r.note), `${id} M -> L ${p} ${asked[p]} -> ${got} (outside the range at L): "${r.note}" gives a rounding reason (R2)`);
                    check(got === asked[p] || /\bmost\b|\bfewest\b/.test(r.note), `${id} M -> L ${p} ${asked[p]} -> ${got}: the note "${r.note}" does not say ${got} is the ${asked[p] > got ? 'most' : 'fewest'} at this size (R2)`);
                }
            }
            await textLint(rows, `${id} 1280 L after Practice / Mixed at their max at M`, false);
        }

        // packets at min and max, M and L - the values the screen offers (ws-partopts-unit's own loop: a value no longer
        // offered snaps), each pupil page
        const po = await page.evaluate(async () => import('./js/modules/sheet/part-opts.js'));
        void po;
        if (!argv.includes('--no-packets') && !ONLY) for (const id of LESSONS) for (const size of ['M', 'L']) for (const which of ['min', 'max', 'combo']) {
            const html = await page.evaluate(async ({ id, size, which, sk }) => {
                const P = await import('./js/modules/sheet/part-opts.js');
                const lib = await import('./js/modules/lessons/library.js');
                const ref = sk || lib.practiceRef(id);
                const req = Object.assign(sk ? {} : { lessonId: id }, { role: 'lesson', sections: [{ skills: [{ categoryId: ref.categoryId, skillId: ref.skillId, opts: ref.opts || {} }] }], size, paper: 'A4', seed: 4242, key: true, practicePages: 1, mixed: true });
                let r = await window.buildSheet(req);
                let lims = P.allPartLimits(r.lesson.partFit);
                const want = {};
                if (which === 'combo') {
                    // (the screen's steps: Vocabulary to 0 if offered, then Remember off if offered, then We Do one down if offered)
                    let cur = {};
                    const step = async (p, o) => { const lim = lims[p]; if (!lim) return; const nx = P.normalizePartOpts(Object.assign({}, cur, { [p]: o(lim) }), lims); if (JSON.stringify(nx) === JSON.stringify(cur)) return; cur = nx; r = await window.buildSheet(Object.assign({}, req, { partOpts: cur })); lims = P.allPartLimits(r.lesson.partFit); cur = P.normalizePartOpts(cur, lims); };
                    await step('vocab', (l) => (l.canOff !== false ? { on: false } : { n: P.offeredValues(l)[0] }));
                    await step('remember', () => ({ on: false }));
                    await step('wedo', (l) => { const v = P.offeredValues(l); const at = v.indexOf(l.dflt); return at > 0 ? { n: v[at - 1] } : (l.canOff !== false ? { on: false } : { n: l.dflt }); });
                    Object.assign(want, cur);
                } else {
                for (const [p, lim] of Object.entries(lims)) {
                    const vals = P.offeredValues(lim);
                    if (which === 'min') { if (['vocab', 'rows', 'wedo'].includes(p) && lim.canOff && !lim.none) want[p] = { on: false }; else if (lim.toggle && lim.canOff) want[p] = { on: false }; else if (vals.length) want[p] = { n: vals[0] }; }
                    else if (vals.length && !lim.toggle) want[p] = { n: vals[vals.length - 1] };
                }
                }
                let cur = P.normalizePartOpts(want, null);
                for (let k = 0; k < 4; k++) { r = await window.buildSheet(Object.assign({}, req, { partOpts: cur })); const nx = P.normalizePartOpts(cur, P.allPartLimits(r.lesson.partFit)); if (JSON.stringify(nx) === JSON.stringify(cur)) break; cur = nx; }
                window.__po = { cur, teach: r.lesson.teach && { guided: r.lesson.teach.guided, independent: r.lesson.teach.independent, fill: r.lesson.teach.fill }, pages: r.pageCount };
                return window.sheetDocument(r.pupilHtml, 'Lesson', { paper: 'A4' });
            }, { id, size, which, sk: skillOf(id) });
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
        if (!NO_SHOTS) console.log(`screenshots in ${path.relative(process.cwd(), OUT)}`);
    } finally { await app.close(); }
    for (const f of fails) console.log(`  ${f}`);
    if (ONLY) console.log(`(--only ${ONLY.join(',')}: other findings not judged)`);
    console.log(fails.length ? `ws-partopts-shots: FAIL (${fails.length})` : 'ws-partopts-shots: OK');
    process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); console.log(`ws-partopts-shots: ERROR (crashed: ${String((e && e.message) || e).split('\n')[0].slice(0, 160)})`); process.exit(2); });
