// ws-student-explorer — the pupil skill explorer (owner, 2026-11-05: "On the student side I also want a skill explorer by
// grade or by domain … so kids can pick the skills as well to play/print/send/add to quick start").
//
//   LAZY     js/modules/student-explorer.js and css/student-explorer.css are not loaded until "Explore skills" is pressed
//   OPEN     the pupil home has an "Explore skills" button; pressing it opens a dialog (aria-modal) with focus inside
//   GRADE    "By grade": every grade chip (K, 1-6, Mixed) lists skills, and every card on a grade shows that grade only
//   AREA     "By area": every area chip lists skills, grouped under that area's categories
//   LIVE     no tombstone (retired) skill is ever offered; every live skill is reachable from By grade
//   SEARCH   the search box ranks with skill-finder.js (its first hits match findSkills) and finds a skill by a concept
//            word its label does not contain ("take away" -> subtraction), never labels only
//   PICK     tapping 3 cards ticks them (aria-pressed) and "3 skills picked"; Done closes the explorer, the bottom row
//            reads "3 skills selected", Print lists exactly those 3, Play plays exactly those 3
//   KEYS     Esc closes; arrow keys move between the tabs
//   TARGETS  every control in the explorer and the Explore button >= 44 x 44 at 1366 / 820 / 390
//   NOSCROLL no horizontal scroll at 390 (the page and the explorer panel)
//   CONSOLE  no console errors or page errors
//
//   node tests/scripts/ws-student-explorer.cjs          prints ws-student-explorer: OK / FAIL
//   --shots <dir>   also save the screenshots (explorer by grade, by area, with picks; home with the bottom row)
'use strict';
const path = require('path');
const fs = require('fs');
const { open } = require('../lib/ws-harness.cjs');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const SHOTS = arg('shots', '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
    const app = await open({ seed: 7, viewport: { width: 1366, height: 900, deviceScaleFactor: 1 } });
    const { page } = app;
    page.on('dialog', (d) => { d.dismiss().catch(() => {}); });   // a confirm() never blocks the gate
    const fails = [];
    const F = (t) => fails.push(t);
    try {
        // the pupil home, nothing selected
        await page.evaluate(() => {
            document.body.classList.remove('teacher-mode'); document.body.classList.add('student-mode');
            if (window.state) { window.state.isPlaying = false; window.state.isMixedMode = false; }
            if (window.showView) window.showView('homeView');
            window.UnifiedSkills.clear();
        });
        await sleep(200);

        if (process.env.MQX_TRACE) console.log('step', '// LAZY');
        // LAZY
        const lazy = await page.evaluate(() => ({
            mod: performance.getEntriesByType('resource').some((e) => /student-explorer\.js/.test(e.name)),
            css: performance.getEntriesByType('resource').some((e) => /student-explorer\.css/.test(e.name)),
            stub: !!(window.openStudentExplorer && window.openStudentExplorer.__mqStub),
        }));
        if (lazy.mod || lazy.css) F(`LAZY the explorer loaded before it was opened (module ${lazy.mod}, css ${lazy.css})`);
        if (!lazy.stub) F('LAZY window.openStudentExplorer is not the lazy stub before first use');

        if (process.env.MQX_TRACE) console.log('step', '// OPEN');
        // OPEN
        const btn = await page.$('#studentExploreBtn');
        if (!btn) throw new Error('OPEN no #studentExploreBtn on the pupil home');
        await btn.click();
        await page.waitForFunction(() => { const r = document.getElementById('studentExplorer'); return r && !r.hidden && r.querySelectorAll('.mqx-card').length > 0; }, { timeout: 20000 });
        await sleep(300);
        const o = await page.evaluate(() => {
            const r = document.getElementById('studentExplorer');
            const d = r.querySelector('[role="dialog"]');
            return { modal: d && d.getAttribute('aria-modal') === 'true', label: !!(d && document.getElementById(d.getAttribute('aria-labelledby'))), focusIn: r.contains(document.activeElement),
                css: getComputedStyle(r).position === 'fixed' };
        });
        if (!o.modal || !o.label) F('OPEN the explorer is not a labelled aria-modal dialog');
        if (!o.focusIn) F('OPEN focus is not inside the explorer on open');
        if (!o.css) F('OPEN the explorer stylesheet did not apply');

        if (process.env.MQX_TRACE) console.log('step', '// GRADE + LIVE');
        // GRADE + LIVE
        const g = await page.evaluate(async () => {
            const out = { perGrade: {}, wrong: [], keys: [] };
            document.querySelector('.mqx-tab[data-tab="grade"]').click();
            await new Promise((r) => setTimeout(r, 50));
            const chips = [...document.querySelectorAll('.mqx-gchip')].map((c) => c.dataset.grade);
            out.chips = chips;
            for (const gr of chips) {
                document.querySelector(`.mqx-gchip[data-grade="${gr}"]`).click();
                await new Promise((r) => setTimeout(r, 30));
                const cards = [...document.querySelectorAll('#mqxBody .mqx-card')];
                out.perGrade[gr] = cards.length;
                for (const c of cards) {
                    out.keys.push(c.dataset.key);
                    const badge = c.querySelector('.mqx-grade').textContent.trim();
                    if (badge !== (gr === 'M' ? 'Mix' : gr)) out.wrong.push(`${c.dataset.key} shows ${badge} under ${gr}`);
                }
            }
            const live = [];
            const retired = [];
            for (const [cat, list] of Object.entries(window.SKILLS)) if (Array.isArray(list)) for (const s of list) (s.retired ? retired : live).push(`${cat}:${s.v}`);
            // a category id that is not in DOMAINS is not offered anywhere in the app
            const inDomains = new Set(Object.values(window.DOMAINS).flatMap((d) => d.categories.map((c) => c.id)));
            out.missing = live.filter((k) => inDomains.has(k.split(':')[0]) && !out.keys.includes(k));
            out.retiredShown = retired.filter((k) => out.keys.includes(k));
            return out;
        });
        if (JSON.stringify(g.chips) !== JSON.stringify(['K', '1', '2', '3', '4', '5', '6', 'M'])) F(`GRADE chips are ${g.chips}`);
        for (const [gr, n] of Object.entries(g.perGrade)) if (!n) F(`GRADE ${gr} lists no skills`);
        if (g.wrong.length) F(`GRADE ${g.wrong.length} cards under the wrong grade: ${g.wrong.slice(0, 3).join('; ')}`);
        if (g.retiredShown.length) F(`LIVE retired skills offered: ${g.retiredShown.slice(0, 5).join(', ')}`);
        if (g.missing.length) F(`LIVE ${g.missing.length} live skills not reachable By grade: ${g.missing.slice(0, 5).join(', ')}`);

        if (process.env.MQX_TRACE) console.log('step', '// AREA');
        // AREA
        const a = await page.evaluate(async () => {
            document.querySelector('.mqx-tab[data-tab="area"]').click();
            await new Promise((r) => setTimeout(r, 50));
            const out = { per: {}, wrongCat: [] };
            for (const chip of [...document.querySelectorAll('.mqx-dchip')].map((c) => c.dataset.domain)) {
                document.querySelector(`.mqx-dchip[data-domain="${chip}"]`).click();
                await new Promise((r) => setTimeout(r, 30));
                out.per[chip] = document.querySelectorAll('#mqxBody .mqx-card').length;
                const cats = new Set(window.DOMAINS[chip].categories.map((c) => c.id));
                for (const c of document.querySelectorAll('#mqxBody .mqx-card')) if (!cats.has(c.dataset.key.split(':')[0])) out.wrongCat.push(c.dataset.key + ' under ' + chip);
            }
            out.domains = Object.keys(window.DOMAINS);
            return out;
        });
        if (JSON.stringify(Object.keys(a.per)) !== JSON.stringify(a.domains)) F(`AREA chips ${Object.keys(a.per)} != DOMAINS ${a.domains}`);
        for (const [d, n] of Object.entries(a.per)) if (!n) F(`AREA ${d} lists no skills`);
        if (a.wrongCat.length) F(`AREA cards outside their area: ${a.wrongCat.slice(0, 3).join('; ')}`);
        if (SHOTS) {
            await page.evaluate(async () => { document.querySelector('.mqx-dchip[data-domain="number_operations"]').click(); });
            await sleep(900);
        }

        if (process.env.MQX_TRACE) console.log('step', '// SEARCH');
        // SEARCH
        const sr = await page.evaluate(async () => {
            const fin = await import('/js/modules/skill-finder.js');
            const input = document.getElementById('mqxSearch');
            const type = async (q) => { input.value = q; input.dispatchEvent(new Event('input', { bubbles: true })); await new Promise((r) => setTimeout(r, 400)); return [...document.querySelectorAll('#mqxBody .mqx-card')].map((c) => c.dataset.key); };
            const times = await type('times tables');
            const want = fin.findSkills('times tables').map((h) => h.key).slice(0, 5);
            const take = await type('take away');
            const labelOnly = take.filter((k) => !/take away/i.test(window.SKILLS[k.split(':')[0]].find((s) => s.v === k.split(':')[1]).l));
            await type('');
            return { times: times.slice(0, 5), want, take: take.length, sub: take.some((k) => k.startsWith('subtraction:')), labelOnly: labelOnly.length };
        });
        if (!sr.times.length || JSON.stringify(sr.times) !== JSON.stringify(sr.want)) F(`SEARCH "times tables" shows ${sr.times} but skill-finder ranks ${sr.want}`);
        if (!sr.sub || !sr.labelOnly) F(`SEARCH "take away" finds no subtraction skill by concept (${sr.take} hits) — label-only search`);

        if (process.env.MQX_TRACE) console.log('step', '// PICK');
        // PICK
        const pick = await page.evaluate(async () => {
            document.querySelector('.mqx-tab[data-tab="grade"]').click();
            await new Promise((r) => setTimeout(r, 50));
            document.querySelector('.mqx-gchip[data-grade="2"]').click();
            await new Promise((r) => setTimeout(r, 50));
            const cards = [...document.querySelectorAll('#mqxBody .mqx-card')];
            // three skills from different areas when there are
            const chosen = [];
            const seen = new Set();
            for (const c of cards) { const d = c.closest('.mqx-group').getAttribute('aria-labelledby'); if (!seen.has(d)) { seen.add(d); chosen.push(c); } if (chosen.length === 3) break; }
            for (const c of cards) { if (chosen.length >= 3) break; if (!chosen.includes(c)) chosen.push(c); }
            for (const c of chosen) c.click();
            await new Promise((r) => setTimeout(r, 100));
            return { keys: chosen.map((c) => c.dataset.key).sort(), pressed: chosen.every((c) => c.getAttribute('aria-pressed') === 'true' && c.classList.contains('is-on')),
                count: document.getElementById('mqxCount').textContent };
        });
        if (!pick.pressed) F('PICK the tapped cards are not ticked (aria-pressed)');
        if (!/^3 skills picked$/.test(pick.count)) F(`PICK the explorer count reads "${pick.count}"`);
        // untick and re-tick one: still 3
        await page.evaluate(async (k) => { const c = document.querySelector(`.mqx-card[data-key="${k}"]`); c.click(); await new Promise((r) => setTimeout(r, 30)); c.click(); }, pick.keys[0]);
        if (SHOTS) { await sleep(600); }
        await page.click('.mqx-done');
        await sleep(400);
        const after = await page.evaluate(() => ({ hidden: document.getElementById('studentExplorer').hidden, count: document.getElementById('studentSelCount').textContent,
            q: (window.skillQueue || []).map((s) => s.categoryId + ':' + s.skillId).sort(), focus: document.activeElement && document.activeElement.id,
            noLock: !document.documentElement.classList.contains('mqx-open') }));
        if (!after.hidden) F('PICK Done does not close the explorer');
        if (!after.noLock) F('PICK the page stays scroll-locked after Done');
        if (after.count !== '3 skills selected') F(`PICK the bottom row reads "${after.count}"`);
        if (JSON.stringify(after.q) !== JSON.stringify(pick.keys)) F(`PICK the selection is ${after.q}, picked ${pick.keys}`);
        if (after.focus !== 'studentSelPlayBtn') F(`PICK focus after Done is on #${after.focus}, not Play`);
        if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'home-bottom-row-1366.png') });

        if (process.env.MQX_TRACE) console.log('step', '// Print lists');
        // Print lists exactly those 3
        const pr = await page.evaluate(async () => {
            document.getElementById('studentSelPrintBtn').click();
            let st = null;
            for (let i = 0; i < 100 && !st; i++) { const m = await import('/js/modules/simple-print.js'); st = m.simplePrintState(); if (!st) await new Promise((r) => setTimeout(r, 150)); }
            const keys = st ? st.list.map((x) => x.key).sort() : null;
            if (window.closeSimplePrint) window.closeSimplePrint();
            return keys;
        });
        if (JSON.stringify(pr) !== JSON.stringify(pick.keys)) F(`PICK Print lists ${pr}, picked ${pick.keys}`);
        if (process.env.MQX_TRACE) console.log('step', '// Play plays');
        // Play plays exactly those 3
        const pl = await page.evaluate(async () => {
            window.playStudentSelection();
            await new Promise((r) => setTimeout(r, 500));
            const sel = (window.state.mixedModeSettings || {}).selectedSkills || {};
            const got = Object.entries(sel).flatMap(([c, l]) => l.map((k) => c + ':' + k)).sort();
            const r = { got, mixed: !!window.state.isMixedMode, view: (document.querySelector('.view.active') || {}).id };
            if (window.stopTimer) { try { window.stopTimer(); } catch (e) { /* */ } }
            window.state.isPlaying = false; window.state.isMixedMode = false;
            if (window.showView) window.showView('homeView');
            return r;
        });
        if (JSON.stringify(pl.got) !== JSON.stringify(pick.keys) || !pl.mixed) F(`PICK Play plays ${pl.got} (mixed ${pl.mixed})`);
        await sleep(300);
        await page.evaluate(() => { document.querySelectorAll('.modal-overlay, .modal').forEach((m) => { if (m.style) m.style.display = 'none'; }); if (window.showView) window.showView('homeView'); });

        if (process.env.MQX_TRACE) console.log('step', '// KEYS + TARGETS');
        // KEYS + TARGETS + NOSCROLL at each width
        for (const [w, h] of [[1366, 900], [820, 1180], [390, 844]]) {
            await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
            await page.evaluate(() => { document.body.classList.remove('teacher-mode'); document.body.classList.add('student-mode'); if (window.showView) window.showView('homeView'); });
            await sleep(250);
            const homeBtn = await page.evaluate(() => { const b = document.getElementById('studentExploreBtn'); const r = b.getBoundingClientRect(); return { w: r.width, h: r.height }; });
            if (homeBtn.w < 44 || homeBtn.h < 44) F(`TARGETS @${w} Explore button ${Math.round(homeBtn.w)}x${Math.round(homeBtn.h)}`);
            await page.evaluate(() => window.openStudentExplorer({ tab: 'grade', grade: '2' }));
            await sleep(400);
            const t = await page.evaluate(() => {
                const r = document.getElementById('studentExplorer');
                const small = [];
                for (const el of r.querySelectorAll('button, input')) {
                    if (el.offsetParent === null) continue;
                    const b = el.getBoundingClientRect();
                    const box = el.tagName === 'INPUT' ? el.closest('.mqx-search').getBoundingClientRect() : b;
                    if (box.width < 44 || box.height < 44) small.push(`${el.className || el.id} ${Math.round(box.width)}x${Math.round(box.height)}`);
                }
                const panel = r.querySelector('.mqx-panel');
                const body = r.querySelector('#mqxBody');
                return { small, docX: document.documentElement.scrollWidth - window.innerWidth, panelX: panel.scrollWidth - panel.clientWidth, bodyX: body.scrollWidth - body.clientWidth,
                    panelW: panel.getBoundingClientRect().width };
            });
            if (t.small.length) F(`TARGETS @${w} ${t.small.length} controls under 44 px: ${t.small.slice(0, 4).join('; ')}`);
            if (t.docX > 0 || t.panelX > 0 || t.bodyX > 0) F(`NOSCROLL @${w} horizontal overflow (page ${t.docX}, panel ${t.panelX}, list ${t.bodyX})`);
            if (SHOTS && (w === 1366 || w === 390)) {
                await sleep(900);
                await page.screenshot({ path: path.join(SHOTS, `explorer-by-grade-${w}.png`) });
                await page.evaluate(() => window.openStudentExplorer({ tab: 'area', domain: 'number_operations' }));
                await sleep(900);
                await page.screenshot({ path: path.join(SHOTS, `explorer-by-area-${w}.png`) });
                await page.evaluate(() => window.openStudentExplorer({ tab: 'grade', grade: '2' }));
                await sleep(300);
            }
            // KEYS: arrow on the tab switches, Esc closes
            const k = await page.evaluate(async () => {
                const tab = document.querySelector('.mqx-tab[data-tab="grade"]');
                tab.focus();
                tab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
                await new Promise((r) => setTimeout(r, 50));
                const sel = document.querySelector('.mqx-tab[aria-selected="true"]').dataset.tab;
                const foc = document.activeElement && document.activeElement.dataset.tab;
                document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
                await new Promise((r) => setTimeout(r, 300));
                return { sel, foc, closed: document.getElementById('studentExplorer').hidden };
            });
            if (k.sel !== 'area' || k.foc !== 'area') F(`KEYS @${w} ArrowRight on "By grade" gives ${k.sel} (focus ${k.foc})`);
            if (!k.closed) F(`KEYS @${w} Esc does not close the explorer`);
            if (SHOTS && (w === 1366 || w === 390)) {
                await page.evaluate(() => { const r = document.getElementById('studentSelActions'); r.scrollIntoView({ block: 'center' }); });
                await sleep(300);
                await page.screenshot({ path: path.join(SHOTS, `home-bottom-row-${w}.png`) });
            }
        }
        const homeX = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        if (homeX > 0) F(`NOSCROLL @390 the pupil home scrolls sideways by ${homeX}px`);

        // CONSOLE
        const errs = app.problems.filter((p) => !/favicon/.test(p.text));
        if (errs.length) F(`CONSOLE ${errs.length} errors: ${errs.slice(0, 3).map((p) => p.type + ' ' + p.text).join(' | ')}`);
        await page.evaluate(() => window.UnifiedSkills.clear());
    } catch (e) {
        F('ERROR ' + (e && e.stack || e));
    } finally {
        await app.close();
    }
    for (const f of fails) console.error('  FAIL ' + f);
    console.log(fails.length ? `ws-student-explorer: FAIL (${fails.length})` : 'ws-student-explorer: OK');
    process.exit(fails.length ? 1 : 0);
})();
