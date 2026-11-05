// ws-student-explorer — the pupil skill explorer (owner, 2026-11-05: "On the student side I also want a skill explorer by
// grade or by domain … so kids can pick the skills as well to play/print/send/add to quick start").
//
//   LAZY     a request log (from a reload): student-explorer.js and its css are not requested until "Explore skills" is
//            pressed, and are requested then (check D6: resource timing could not fail). pupil-names.js is NOT lazy since
//            check r2 D1: the pupil home's Quick Start cards and chips read their names from it on the first paint
//   OPEN     the pupil home has an "Explore skills" button; pressing it opens a dialog (aria-modal) with focus inside
//   GRADE    "By grade": every grade chip (K, 1-6, Mixed) lists skills, and every card on a grade shows that grade only
//   AREA     "By area": every area chip lists skills, grouped under that area's categories
//   LIVE     no tombstone (retired) skill is ever offered; every live skill is reachable from By grade
//   SEARCH   the search box ranks with skill-finder.js (its first hits match findSkills) and finds a skill by a concept
//            word its label does not contain ("take away" -> subtraction), never labels only
//   PICK     tapping 3 cards ticks them (aria-pressed) and "3 skills picked"; Done closes the explorer, the bottom row
//            reads "3 skills selected", Print lists exactly those 3, Play plays exactly those 3
//   WORDS    pupil card names carry no teacher wording ("(Visual)", "(No Visuals)", "(B&W)", "MC", and since r2 D4
//            "(MAP)", "(Match)", "(Easy)", "Denom"), no two cards share a name,
//            the category caption is >= 15 px, every area chip has its own picture                     (check D5)
//   FILTER   grades 3 and 4 have an area row inside the grade tab; an area narrows the list, "All" restores it (check D5)
//   CAP      a search with more than 60 hits says "Showing 60 of N" and "Show more" adds the next 60     (check D3)
//   SEND     the Send link, opened in a fresh page, lands on "Practice set: 3 skills" with exactly those 3 (check D6)
//   QUICKSTART  Add to Quick Start: every card shows the skill's full name (3 long names + both "Add within 20"),
//            all card names distinct, title = full name; the selection chips carry the full name     (check D1)
//   ROOM     at 390 x 844, 1366 x 768 and 820 x 1180 the chip rows (and a grade's area row) are one line and the list
//            keeps >= 60 % of the height                                                     (check D4, r2 D3)
//   PUPILNAME  pick "Subtract Within 5 with Pictures (Visual)" in the explorer: the selection chip, "Your skill:", the
//            Quick Start card, a card saved earlier with the raw label, and the Print list all show the pupil name
//            the explorer shows, and none says "(Visual)"                                       (check r2 D1)
//   QSTYPE   a Quick Start name is >= 13 px and clamps at 3 lines                                (check r2 D2)
//   CHIPWIDTH  at 1366 a selection chip shows its whole name when the row has room (no 26ch cut) (check r2 D5)
//   TOPIC    no fraction skill is filed under Counting (By area, and inside Grade 3); they are under Fractions (r2 D6)
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
        // LAZY reads a request log (check D6: resource timing never listed the module, so that half could not fail).
        // The log starts before a reload, so a request made during boot is in it too.
        const reqs = [];
        page.on('request', (r) => reqs.push(r.url()));
        await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
        await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
        await page.evaluate(() => Promise.all([window.__mqLoadDeferred, window.__mqLoadWorksheet].filter(Boolean).map((f) => f().then(() => true, () => false))));
        await sleep(300);
        const asked = (re) => reqs.some((u) => re.test(u));
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
        const lazy = await page.evaluate(() => ({ stub: !!(window.openStudentExplorer && window.openStudentExplorer.__mqStub) }));
        lazy.mod = asked(/student-explorer\.js/); lazy.css = asked(/student-explorer\.css/); lazy.names = asked(/pupil-names\.js/);
        if (!reqs.some((u) => /globals\.js/.test(u))) F('LAZY the request log missed the page load (it cannot judge laziness)');
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
        if (!asked(/student-explorer\.js/) || !asked(/student-explorer\.css/)) F(`LAZY the first press did not request the explorer (module ${asked(/student-explorer\.js/)}, css ${asked(/student-explorer\.css/)})`);

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
                // check D5: a long grade has an area row; "All" lists every card, an area lists only that area's cards
                const row = document.querySelector('#mqxBody .mqx-arearow');
                out.areaRow = out.areaRow || {};
                if (row) {
                    const aChips = [...row.querySelectorAll('[data-garea]')].filter((b) => b.dataset.garea !== 'all');
                    const pickA = aChips[1] || aChips[0];
                    const want = Number(pickA.querySelector('.mqx-cn').textContent);
                    pickA.click();
                    await new Promise((r) => setTimeout(r, 30));
                    const narrowed = [...document.querySelectorAll('#mqxBody .mqx-card')];
                    const cats = new Set(window.DOMAINS[pickA.dataset.garea].categories.map((c) => c.id));
                    const areaOf = (c) => c.dataset.area || ([...Object.entries(window.DOMAINS)].find(([, d]) => d.categories.some((x) => x.id === c.dataset.key.split(':')[0])) || [''])[0];
                    out.areaRow[gr] = { n: narrowed.length, want, inArea: narrowed.every((c) => areaOf(c) === pickA.dataset.garea || (!c.dataset.area && cats.has(c.dataset.key.split(':')[0]))), checked: document.querySelector(`[data-garea="${pickA.dataset.garea}"]`).getAttribute('aria-checked') };
                    document.querySelector('#mqxBody [data-garea="all"]').click();
                    await new Promise((r) => setTimeout(r, 30));
                    out.areaRow[gr].back = document.querySelectorAll('#mqxBody .mqx-card').length === cards.length;
                }
                // TOPIC (check r2 D6): the Counting group inside a grade holds no fraction skill
                out.topic = out.topic || [];
                for (const c of document.querySelectorAll('#mqxBody #mqxHgcounting_cardinality ~ .mqx-grid .mqx-card')) {
                    if (/fraction/i.test(c.dataset.key + ' ' + c.querySelector('.mqx-name').textContent)) out.topic.push(`grade ${gr} Counting: ${c.dataset.key}`);
                }
                for (const c of document.querySelectorAll('#mqxBody .mqx-card')) {   // re-read: the area row re-rendered the list
                    out.keys.push(c.dataset.key);
                    out.names = out.names || {};
                    out.names[c.dataset.key] = c.querySelector('.mqx-name').firstChild.textContent;
                    const cap = parseFloat(getComputedStyle(c.querySelector('.mqx-area')).fontSize);
                    if (!(out.minCap <= cap)) out.minCap = cap;
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
        // WORDS (check D5): pupil names carry no teacher wording, every name is distinct, the caption is >= 15 px
        const nameList = Object.entries(g.names || {});
        const teacherWords = nameList.filter(([, n]) => /\((?:[^)]*\b)?(visuals?|no visuals?|no pictures|b&w|mc|map|match|easy)\b[^)]*\)/i.test(n) || /\bdenom\b/i.test(n));
        if (teacherWords.length) F(`WORDS ${teacherWords.length} cards show teacher wording: ${teacherWords.slice(0, 3).map(([k, n]) => `${k} "${n}"`).join('; ')}`);
        const seenName = new Map();
        const dupes = [];
        for (const [k, n] of nameList) { if (seenName.has(n)) dupes.push(`"${n}" (${seenName.get(n)}, ${k})`); else seenName.set(n, k); }
        if (dupes.length) F(`WORDS ${dupes.length} skills share a card name: ${dupes.slice(0, 3).join('; ')}`);
        if (!(g.minCap >= 15)) F(`WORDS the category caption is ${g.minCap} px (< 15)`);
        if ((g.topic || []).length) F(`TOPIC ${g.topic.length} fraction skills filed under Counting By grade: ${g.topic.slice(0, 3).join('; ')}`);
        for (const gr of ['3', '4']) {
            const r = (g.areaRow || {})[gr];
            if (!r) { F(`FILTER grade ${gr} (${g.perGrade[gr]} skills) has no area filter row`); continue; }
            if (!r.n || r.n !== r.want || !r.inArea || r.checked !== 'true') F(`FILTER grade ${gr}: an area chip shows ${r.n} cards (chip says ${r.want}, all in area ${r.inArea}, checked ${r.checked})`);
            if (!r.back) F(`FILTER grade ${gr}: "All" does not bring every card back`);
        }

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
                // a card is in the area the explorer files it under (data-area, check r2 D6), else its category's area
                for (const c of document.querySelectorAll('#mqxBody .mqx-card')) if (c.dataset.area ? c.dataset.area !== chip : !cats.has(c.dataset.key.split(':')[0])) out.wrongCat.push(c.dataset.key + ' under ' + chip);
                out.keysBy = out.keysBy || {};
                out.keysBy[chip] = [...document.querySelectorAll('#mqxBody .mqx-card')].map((c) => ({ key: c.dataset.key, name: c.querySelector('.mqx-name').textContent }));
            }
            out.domains = Object.keys(window.DOMAINS);
            // check D5: every area chip has its own picture (Counting and Numbers both had 🔢)
            out.icons = [...document.querySelectorAll('.mqx-dchip')].map((c) => c.querySelector('[aria-hidden="true"]').textContent.trim());
            return out;
        });
        if (JSON.stringify(Object.keys(a.per)) !== JSON.stringify(a.domains)) F(`AREA chips ${Object.keys(a.per)} != DOMAINS ${a.domains}`);
        for (const [d, n] of Object.entries(a.per)) if (!n) F(`AREA ${d} lists no skills`);
        if (a.wrongCat.length) F(`AREA cards outside their area: ${a.wrongCat.slice(0, 3).join('; ')}`);
        // TOPIC (check r2 D6): Counting holds no fraction skill; the three Number Sense fraction skills sit under Fractions
        const fracUnderCounting = ((a.keysBy || {}).counting_cardinality || []).filter((c) => /fraction/i.test(c.key + ' ' + c.name));
        if (fracUnderCounting.length) F(`TOPIC ${fracUnderCounting.length} fraction skills filed under Counting By area: ${fracUnderCounting.slice(0, 3).map((c) => c.key).join(', ')}`);
        const fracKeys = new Set(((a.keysBy || {}).fractions_decimals || []).map((c) => c.key));
        for (const k of ['composing:fraction_number_line', 'composing:whole_as_fraction', 'composing:compose_whole']) if (!fracKeys.has(k)) F(`TOPIC ${k} is not under Fractions By area`);
        if (new Set(a.icons).size !== a.icons.length) F(`WORDS two area chips share a picture: ${a.icons.join(' ')}`);
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
            // CAP (check D3): a long result list says how many there are and offers "Show more"; it never stops silently
            let cap = null;
            for (const q of ['subtract', 'add', 'numbers', 'fractions']) {
                const n = fin.findSkills(q).length;
                if (n <= 60) continue;
                const first = await type(q);
                const note = (document.getElementById('mqxMoreNote') || {}).textContent || '';
                const head = (document.querySelector('#mqxBody .mqx-h .mqx-n') || {}).textContent || '';
                const more = document.querySelector('#mqxBody .mqx-more');
                if (more) { more.click(); await new Promise((r) => setTimeout(r, 200)); }
                const after = document.querySelectorAll('#mqxBody .mqx-card').length;
                cap = { q, n, first: first.length, note, head, more: !!more, after, focusCard: !!(document.activeElement && document.activeElement.classList.contains('mqx-card')) };
                break;
            }
            await type('');
            return { times: times.slice(0, 5), want, take: take.length, sub: take.some((k) => k.startsWith('subtraction:')), labelOnly: labelOnly.length, cap };
        });
        if (!sr.cap) F('CAP no search word finds more than 60 skills to test the cap with');
        else {
            const c = sr.cap;
            // skill-finder may also rank skills the explorer does not offer; the note's total is what the pupil can reach
            const m = /Showing (\d+) of (\d+)/.exec(c.note);
            const total = m ? Number(m[2]) : c.first;
            if (!m || Number(m[1]) !== c.first || total <= c.first) F(`CAP "${c.q}" (${c.n} finder hits) shows ${c.first} skills without saying how many there are (note "${c.note}", heading count "${c.head}")`);
            if (!c.more) F(`CAP "${c.q}" offers no "Show more"`);
            if (c.more && c.after !== Math.min(total, c.first + 60)) F(`CAP "Show more" on "${c.q}" lists ${c.after}, want ${Math.min(total, c.first + 60)}`);
            if (c.more && !c.focusCard) F('CAP after "Show more" focus is not on a card');
        }
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

        if (process.env.MQX_TRACE) console.log('step', '// SEND');
        // SEND (check D6): the Send link, opened in a fresh page, lands on "Practice set: 3 skills" with exactly those 3
        const link = await page.evaluate(async () => {
            document.getElementById('studentSelSendBtn').click();
            await new Promise((r) => setTimeout(r, 300));
            const v = (document.getElementById('studentSendLink') || {}).value || '';
            if (window.closeStudentSend) window.closeStudentSend();
            return v;
        });
        if (!/[?&]c(ode)?=/.test(link) || !/from=pupil/.test(link)) F(`SEND the link is "${link}"`);
        else {
            const p2 = await app.browser.newPage();
            const pr2 = [];
            p2.on('pageerror', (e) => pr2.push(e.message));
            p2.on('console', (m) => { if (m.type() === 'error') pr2.push(m.text()); });
            await p2.evaluateOnNewDocument(() => { try { localStorage.setItem('mathquest_onboarded', '1'); } catch (e) { /* */ } });
            await p2.setViewport({ width: 1366, height: 900 });
            await p2.goto(link.replace(/^https?:\/\/[^/]+(\/[^?]*)?/, app.base + '/index.html'), { waitUntil: 'networkidle2', timeout: 60000 });
            await p2.waitForFunction(() => !!document.querySelector('#studentLandingOverlay h2'), { timeout: 20000 }).catch(() => {});
            const land = await p2.evaluate(() => {
                const h = document.querySelector('#studentLandingOverlay h2');
                const code = (window.state && window.state.landingSettings && window.state.landingSettings.skillsCode) || '';
                const keys = code.split('-').filter((p) => p.length >= 2).map((p) => { const s = window.CODE_TO_SKILL && window.CODE_TO_SKILL[p.substring(0, 2).toUpperCase()]; return s ? s.categoryId + ':' + s.skillId : '?' + p; }).sort();
                return { h: h ? h.textContent.trim() : null, keys };
            });
            await p2.close();
            if (land.h !== 'Practice set: 3 skills') F(`SEND the link opens with "${land.h}"`);
            if (JSON.stringify(land.keys) !== JSON.stringify(pick.keys)) F(`SEND the link carries ${land.keys}, picked ${pick.keys}`);
            if (pr2.length) F(`SEND the linked page logged ${pr2.length} errors: ${pr2.slice(0, 2).join(' | ')}`);
        }
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

        if (process.env.MQX_TRACE) console.log('step', '// QUICKSTART');
        // QUICKSTART (check D1): Add to Quick Start makes one card per skill whose name is the skill's FULL cleaned label
        // (it used to be cut to 12 characters: "Add within 2" twice), every card name distinct, the full name in a title;
        // the selection chips carry the full name too (they were cut at 20). 3 long-named skills + the two Add within 20.
        const qs = await page.evaluate(async () => {
            document.body.classList.remove('teacher-mode'); document.body.classList.add('student-mode');
            if (window.showView) window.showView('homeView');
            window.UnifiedSkills.clear();
            const clean = (l) => String(l).replace(/^[\s\u{1F300}-\u{1FAFF}☀-➿⬀-⯿️‍½]+/u, '').trim();
            const inDomains = new Map(Object.values(window.DOMAINS).flatMap((d) => d.categories.map((c) => [c.id, c])));
            const live = [];
            for (const [cat, list] of Object.entries(window.SKILLS)) if (Array.isArray(list) && inDomains.has(cat)) for (const s of list) if (!s.retired) live.push({ cat, s });
            const already = new Set((window.customQuickSkills || []).map((c) => c.categoryId + ':' + c.skillId));
            const long = live.filter((x) => !already.has(x.cat + ':' + x.s.v)).sort((a, b) => clean(b.s.l).length - clean(a.s.l).length).slice(0, 3);
            const a20 = live.filter((x) => /^Add within 20 \((No|With) Regrouping\)$/i.test(clean(x.s.l)));
            const chosen = [...long, ...a20];
            for (const x of chosen) { const c = inDomains.get(x.cat); window.UnifiedSkills.add({ categoryId: x.cat, skillId: x.s.v, skillLabel: x.s.l, categoryIcon: c.icon, categoryName: c.name }); }
            for (let i = 0; i < 3; i++) await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 50)));   // the chips redraw on a frame
            const chips = [...document.querySelectorAll('#studentSkillsList .sel-chip')].map((c) => ({ title: c.getAttribute('title'), text: (c.querySelector('.sel-chip-name') || c).textContent.trim() }));
            const before = (window.customQuickSkills || []).length;
            document.getElementById('studentSelAddBtn').click();
            await new Promise((r) => setTimeout(r, 300));
            const cards = [...document.querySelectorAll('#quickSkillsGrid .quick-skill-card')];
            const all = cards.map((c) => { const n = c.querySelector('.qs-name-text') || c.querySelector('.skill-name'); return { text: n.textContent.trim(), title: n.getAttribute('title') }; });
            const mine = chosen.map((x) => {
                const i = (window.customQuickSkills || []).findIndex((q) => q.categoryId === x.cat && q.skillId === x.s.v);
                return { key: x.cat + ':' + x.s.v, want: clean(x.s.l), got: i > -1 && all[i] ? all[i].text : null, title: i > -1 && all[i] ? all[i].title : null };
            });
            // tidy: take the test's cards back out
            window.customQuickSkills = (window.customQuickSkills || []).filter((q) => !chosen.some((x) => x.cat === q.categoryId && x.s.v === q.skillId));
            if (window.saveQuickSkills) window.saveQuickSkills();
            if (window.renderQuickSkillsGrid) window.renderQuickSkillsGrid();
            window.UnifiedSkills.clear();
            return { n: chosen.length, a20: a20.length, before, mine, names: all.map((x) => x.text), chips, chipKeys: chosen.map((x) => x.cat + ':' + x.s.v) };
        });
        // check r2 D1: a pupil card and chip show the PUPIL name, the one the explorer card shows
        for (const m of qs.mine) m.want = (g.names || {})[m.key] || m.want;
        qs.chipWant = qs.chipKeys.map((k) => (g.names || {})[k]);
        if (qs.a20 !== 2) F(`QUICKSTART found ${qs.a20} "Add within 20 (No/With Regrouping)" skills, want 2`);
        for (const m of qs.mine) {
            if (m.got !== m.want) F(`QUICKSTART the card for ${m.key} reads "${m.got}", want the full name "${m.want}"`);
            else if (m.title !== m.want) F(`QUICKSTART the card for ${m.key} has title "${m.title}"`);
        }
        const qsDupes = qs.names.filter((n, i) => qs.names.indexOf(n) !== i);
        if (qsDupes.length) F(`QUICKSTART two cards read the same: ${[...new Set(qsDupes)].join('; ')}`);
        const chipTexts = qs.chips.map((c) => c.text).sort();
        if (JSON.stringify(chipTexts) !== JSON.stringify([...qs.chipWant].sort())) F(`QUICKSTART the selection chips read ${JSON.stringify(chipTexts)}, want the full names`);
        if (qs.chips.some((c) => c.title !== c.text)) F('QUICKSTART a selection chip has no title with its full name');

        if (process.env.MQX_TRACE) console.log('step', '// PUPILNAME + QSTYPE + CHIPWIDTH');
        // PUPILNAME (check r2 D1): a "(Visual)" skill picked in the explorer keeps its pupil name on every pupil surface
        const VKEY = 'subtraction:sub_5_pictures';
        const pn = await page.evaluate(async (vkey) => {
            const out = {};
            document.body.classList.remove('teacher-mode'); document.body.classList.add('student-mode');
            if (window.showView) window.showView('homeView');
            window.UnifiedSkills.clear();
            const [cat, sk] = vkey.split(':');
            out.raw = (window.SKILLS[cat].find((s) => s.v === sk) || {}).l || '';
            await window.openStudentExplorer({ tab: 'grade', grade: '1' });
            const input = document.getElementById('mqxSearch');
            input.value = 'subtract within 5'; input.dispatchEvent(new Event('input', { bubbles: true }));
            await new Promise((r) => setTimeout(r, 500));
            const card = document.querySelector(`#mqxBody .mqx-card[data-key="${vkey}"]`);
            if (!card) { out.err = 'no explorer card for ' + vkey; return out; }
            out.explorer = card.querySelector('.mqx-name').firstChild.textContent.trim();
            card.click();
            document.querySelector('.mqx-done').click();
            for (let i = 0; i < 3; i++) await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 50)));
            const chip = document.querySelector('#studentSkillsList .sel-chip');
            out.chip = chip ? (chip.querySelector('.sel-chip-name') || chip).textContent.trim() : null;
            out.chipTitle = chip ? chip.getAttribute('title') : null;
            out.chipRemove = chip ? (chip.querySelector('button[aria-label]') || {}).getAttribute?.('aria-label') : null;
            out.yourSkill = (document.getElementById('studentStartSkillName') || {}).textContent || '';
            // QSTYPE (check r2 D2) on the card this adds
            const had = (window.customQuickSkills || []).some((q) => q.categoryId === cat && q.skillId === sk);
            document.getElementById('studentSelAddBtn').click();
            await new Promise((r) => setTimeout(r, 300));
            const i = (window.customQuickSkills || []).findIndex((q) => q.categoryId === cat && q.skillId === sk);
            const cards = [...document.querySelectorAll('#quickSkillsGrid .quick-skill-card')];
            const nm = i > -1 && cards[i] ? cards[i].querySelector('.qs-name-text') : null;
            out.card = nm ? nm.textContent.trim() : null;
            out.cardTitle = nm ? nm.getAttribute('title') : null;
            if (nm) { const cs = getComputedStyle(nm); out.cardPx = parseFloat(cs.fontSize); out.clamp = cs.webkitLineClamp || cs.getPropertyValue('-webkit-line-clamp'); }
            // a card saved earlier (before r2): raw label and shortName = the cleaned raw label, reloaded from storage
            if (i > -1) { const c = window.customQuickSkills[i]; c.skillLabel = out.raw; c.shortName = out.raw.replace(/^[\s\u{1F300}-\u{1FAFF}☀-➿⬀-⯿️‍½]+/u, '').trim(); }
            if (window.saveQuickSkills) window.saveQuickSkills();
            if (window.loadQuickSkills) window.loadQuickSkills();
            if (window.renderQuickSkillsGrid) window.renderQuickSkillsGrid();
            for (let k = 0; k < 3; k++) await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 50)));
            const j = (window.customQuickSkills || []).findIndex((q) => q.categoryId === cat && q.skillId === sk);
            const cards2 = [...document.querySelectorAll('#quickSkillsGrid .quick-skill-card')];
            const nm2 = j > -1 && cards2[j] ? cards2[j].querySelector('.qs-name-text') : null;
            out.saved = nm2 ? nm2.textContent.trim() : null;
            // the Print list
            document.getElementById('studentSelPrintBtn').click();
            let li = null;
            for (let k = 0; k < 100 && !li; k++) { li = document.querySelector('.sp-skill .sp-skill-name'); if (!li) await new Promise((r) => setTimeout(r, 150)); }
            out.print = li ? li.firstChild.textContent.trim() : null;
            if (window.closeSimplePrint) window.closeSimplePrint();
            // tidy
            if (!had) window.customQuickSkills = (window.customQuickSkills || []).filter((q) => !(q.categoryId === cat && q.skillId === sk));
            if (window.saveQuickSkills) window.saveQuickSkills();
            if (window.renderQuickSkillsGrid) window.renderQuickSkillsGrid();
            window.UnifiedSkills.clear();
            return out;
        }, VKEY);
        if (pn.err) F(`PUPILNAME ${pn.err}`);
        else {
            const want = pn.explorer;
            if (/\(visual\)/i.test(want)) F(`PUPILNAME the explorer card itself reads "${want}"`);
            for (const [where, got] of [['selection chip', pn.chip], ['chip title', pn.chipTitle], ['"Your skill:"', pn.yourSkill], ['Quick Start card', pn.card], ['card title', pn.cardTitle], ['card saved earlier', pn.saved], ['Print list', pn.print]]) {
                if (got == null) F(`PUPILNAME no ${where} to read`);
                else if (/\(visual\)/i.test(got) || got !== want) F(`PUPILNAME the ${where} reads "${got}", want the explorer's pupil name "${want}" (raw "${pn.raw}")`);
            }
            if (pn.chipRemove && /\(visual\)/i.test(pn.chipRemove)) F(`PUPILNAME the chip's remove button says "${pn.chipRemove}"`);
            if (!(pn.cardPx >= 13)) F(`QSTYPE a Quick Start name is ${pn.cardPx} px (want >= 13)`);
            if (String(pn.clamp) !== '3') F(`QSTYPE a Quick Start name clamps at ${pn.clamp} lines (want 3)`);
        }
        // CHIPWIDTH (check r2 D5): at 1366 a 34-character name fits its chip whole (it was cut at 26ch)
        const cw = await page.evaluate(async () => {
            window.UnifiedSkills.clear();
            const key = Object.entries(window.SKILLS).flatMap(([c, l]) => (Array.isArray(l) ? l : []).filter((s) => !s.retired && /^Subtract within 20 \(No Regrouping\)$/i.test(String(s.l).replace(/^[^A-Za-z]+/, ''))).map((s) => [c, s]))[0];
            if (!key) return { err: 'no "Subtract within 20 (No Regrouping)" skill' };
            window.UnifiedSkills.add({ categoryId: key[0], skillId: key[1].v, skillLabel: key[1].l, categoryIcon: '', categoryName: key[0] });
            for (let i = 0; i < 3; i++) await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 50)));
            const n = document.querySelector('#studentSkillsList .sel-chip .sel-chip-name');
            const row = document.getElementById('studentSkillsList');
            const r = n ? { text: n.textContent, cut: n.scrollWidth > n.clientWidth + 1, rowW: Math.round(row.getBoundingClientRect().width), chipW: Math.round(n.closest('.sel-chip').getBoundingClientRect().width) } : { err: 'no chip' };
            window.UnifiedSkills.clear();
            return r;
        });
        if (cw.err) F(`CHIPWIDTH ${cw.err}`);
        else if (cw.cut) F(`CHIPWIDTH at 1366 the chip "${cw.text}" is cut (${cw.chipW} px chip in a ${cw.rowW} px row)`);

        if (process.env.MQX_TRACE) console.log('step', '// ROOM wide');
        // ROOM (check r2 D3): a Chromebook (1366 x 768) and a tablet (820 x 1180) — one-line chip rows (the grade's area
        // row too), and the list keeps >= 60 % of the height
        for (const [w, h] of [[1366, 768], [820, 1180]]) {
            await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
            await page.evaluate(() => { document.body.classList.remove('teacher-mode'); document.body.classList.add('student-mode'); if (window.showView) window.showView('homeView'); });
            await sleep(250);
            for (const view of [{ tab: 'grade', grade: '3' }, { tab: 'area', domain: 'number_operations' }, { tab: 'grade', grade: 'K' }]) {
                await page.evaluate((v) => window.openStudentExplorer(v), view);
                await sleep(250);
                const room = await page.evaluate(() => {
                    const lines = (row) => (row ? new Set([...row.querySelectorAll('.mqx-chip')].map((c) => Math.round(c.getBoundingClientRect().top))).size : 0);
                    const body = document.getElementById('mqxBody');
                    const area = document.querySelector('#mqxBody .mqx-arearow');
                    return { head: lines(document.querySelector('#mqxChips .mqx-chiprow')), area: area ? lines(area) : 0, body: Math.round(body.getBoundingClientRect().height), vh: window.innerHeight,
                        x: document.documentElement.scrollWidth - window.innerWidth, bodyX: body.scrollWidth - body.clientWidth };
                });
                const what = view.tab === 'area' ? `By area ${view.domain}` : `By grade ${view.grade}`;
                if (room.head > 1) F(`ROOM @${w}x${h} ${what}: the chips wrap onto ${room.head} lines`);
                if (room.area > 1) F(`ROOM @${w}x${h} ${what}: the area row wraps onto ${room.area} lines`);
                if (room.body < 0.6 * room.vh) F(`ROOM @${w}x${h} ${what}: the list gets ${room.body} of ${room.vh} px (${Math.round(100 * room.body / room.vh)} %, want >= 60 %)`);
                if (room.x > 0 || room.bodyX > 0) F(`NOSCROLL @${w}x${h} ${what}: horizontal overflow (page ${room.x}, list ${room.bodyX})`);
                if (SHOTS && view.grade === '3') await page.screenshot({ path: path.join(SHOTS, `explorer-grade3-${w}x${h}.png`) });
            }
            await page.evaluate(() => window.closeStudentExplorer && window.closeStudentExplorer());
            await sleep(200);
        }

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
            if (w === 390) {
                // ROOM (check D4): on a phone the chips are one sideways-scrolling line and the list keeps >= 60 % of the height
                for (const view of [{ tab: 'area', domain: 'number_operations' }, { tab: 'area', domain: 'vocabulary' }, { tab: 'grade', grade: '3' }, { tab: 'grade', grade: 'M' }]) {
                    await page.evaluate((v) => window.openStudentExplorer(v), view);
                    await sleep(200);
                    const room = await page.evaluate(() => {
                        const row = document.querySelector('#mqxChips .mqx-chiprow');
                        const body = document.getElementById('mqxBody');
                        const chips = [...row.querySelectorAll('.mqx-chip')].map((c) => Math.round(c.getBoundingClientRect().top));
                        return { rowH: Math.round(row.getBoundingClientRect().height), lines: new Set(chips).size, body: Math.round(body.getBoundingClientRect().height), vh: window.innerHeight, onSeen: (() => { const on = row.querySelector('[aria-checked="true"]'); const a = on.getBoundingClientRect(), b = row.getBoundingClientRect(); return a.left >= b.left - 1 && a.right <= b.right + 1; })() };
                    });
                    const what = view.tab === 'area' ? `By area ${view.domain}` : `By grade ${view.grade}`;
                    if (room.lines > 1) F(`ROOM @390 ${what}: the chips wrap onto ${room.lines} lines (${room.rowH} px)`);
                    if (!room.onSeen) F(`ROOM @390 ${what}: the chosen chip is scrolled out of sight`);
                    if (room.body < 0.6 * room.vh) F(`ROOM @390 ${what}: the list gets ${room.body} of ${room.vh} px (${Math.round(100 * room.body / room.vh)} %, want >= 60 %)`);
                }
                await page.evaluate(() => window.openStudentExplorer({ tab: 'grade', grade: '2' }));
                await sleep(200);
            }
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
