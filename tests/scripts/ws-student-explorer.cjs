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
//            "(MAP)", "(Match)", "(Easy)", "Denom", and since r3 R3 "OoO", "Parens", "Ops", "Coord", "Mult/Div", "- Easy", "Level N:",
//            "/10 as /100"), no two cards share a name,
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
//   QSVISIBLE  the Quick Start hard set (both Add Fractions like-denominator variants, both Two-Step Then Multiply /
//            Divide, the 10 longest pupil names, every pupil-name pair sharing a >= 20-character prefix): at 1366x768,
//            820x1180 and 390x844 no two cards SHOW the same text inside their clamp; names >= 13 px; no sideways overflow
//                                                                                                (check r3 R1)
//   SEARCHNAME every pupil name finds its own skill in the top 3; "numbers only" / "with pictures" / "like denominators"
//            find every skill whose pupil name carries them                                     (check r3 R2)
//   QSTYPE   a Quick Start name is >= 13 px and clamps at 3 lines                                (check r2 D2)
//   CHIPWIDTH  at 1366 a selection chip shows its whole name when the row has room (no 26ch cut) (check r2 D5)
//   TOPIC    no fraction skill is filed under Counting (By area, and inside Grade 3); they are under Fractions (r2 D6)
//   THUMB    hover thumbnails (owner 2026-11-05): at 1366x768 and 820x1180 a mouse on a card shows, within 1 s, a
//            role="tooltip" thumbnail holding the paper cell or the large-print question, and the pupil name, never the answer
//            (no filled box; no answer token the question itself does not carry), 260-490 px wide, inside the viewport,
//            off the pointer and off the card (its tick), no sideways scroll, aria-describedby on the card; 340-480 px wide (r1 D1); mouse leave,
//            Esc (the dialog stays; the next Esc closes it), a scroll of the list and a re-render each hide it.
//            Keyboard: Tab onto a card shows it without moving focus; the first Esc hides it, blur hides it.
//            Touch (390x844, hasTouch): a tap picks and no thumbnail appears, even on a mouse event.
//            Sweep: every live skill (716) draws a cell or the text fallback, no throw, no console error, no answer.
//            Legible (critic r1): TEXTSIZE (question line >= 14 px, no text < 10 px), SCALE (a drawn cell >= 0.6), INFRAME
//            (nothing painted outside the frame), NODUP (the question once, normalised compare), NOTEACHER (no CCSS code, no
//            Hint / Check control), NOEXTRA (no second answer line under an item's own blank): by real hover on the 13 skills
//            the critic found worst (1366x768, 820x1180), then every live skill at the L and S plates (studentExplorerThumbBatch).
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
// a card name split into head + tail (check r3 R1) reads the same words as the full name: compare the words only
const qsWords = (s) => String(s == null ? '' : s).replace(/[(),:]/g, ' ').replace(/\s+/g, ' ').trim();

const { installThumbMeasure, thumbFaults, POINTING } = require('../lib/ws-thumb-measure.cjs');

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
        const teacherWords = nameList.filter(([, n]) => /\((?:[^)]*\b)?(visuals?|no visuals?|no pictures|b&w|mc|map|match|easy)\b[^)]*\)/i.test(n) || /\bdenom\b/i.test(n)
            // check r3 R3: OoO, Parens, Ops, Coord, Mult/Div, "- Easy", "Level N:", "/10 as /100"
            || /\bOoO\b|\bParens?\b|\bOps\b|\bCoord\b|Mult\/Div|\s-\s+(Easy|Medium|Hard)\b|^Level \d|(^|\s)\/1?0?0\b/.test(n));
        if (teacherWords.length) F(`WORDS ${teacherWords.length} cards show teacher wording: ${teacherWords.slice(0, 3).map(([k, n]) => `${k} "${n}"`).join('; ')}`);
        const seenName = new Map();
        const dupes = [];
        for (const [k, n] of nameList) { if (seenName.has(n)) dupes.push(`"${n}" (${seenName.get(n)}, ${k})`); else seenName.set(n, k); }
        // check r4 D2: two names that differ only by "a" / "an" / "the" read the same to a pupil
        const loose = new Map();
        const near = [];
        for (const [k, n] of nameList) { const l = n.toLowerCase().replace(/\b(a|an|the)\b/g, ' ').replace(/[^a-z0-9÷×=/+−-]+/g, ' ').trim(); if (loose.has(l)) near.push(`"${n}" / "${g.names[loose.get(l)]}"`); else loose.set(l, k); }
        if (near.length) F(`WORDS ${near.length} card names differ only by a/an/the or punctuation: ${near.slice(0, 3).join('; ')}`);
        // check r4 D5: the last shorthand
        const short = nameList.filter(([, n]) => /\bFDP\b|\bLCD\b|\bIQR\b/.test(n));
        if (short.length) F(`WORDS ${short.length} cards keep FDP / LCD / IQR: ${short.slice(0, 3).map(([, n]) => n).join('; ')}`);
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
            // check r3 R1: a split name is the head + its tail sub-line
            const all = cards.map((c) => { const n = c.querySelector('.qs-name-text') || c.querySelector('.skill-name'); const t = c.querySelector('.qs-name-tail'); return { text: n.textContent.trim() + (t ? ' ' + t.textContent.trim() : ''), title: n.getAttribute('title') }; });
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
            if (qsWords(m.got) !== qsWords(m.want)) F(`QUICKSTART the card for ${m.key} reads "${m.got}", want the full name "${m.want}"`);
            else if (m.title !== m.want) F(`QUICKSTART the card for ${m.key} has title "${m.title}"`);
        }
        const qsDupes = qs.names.filter((n, i) => qs.names.indexOf(n) !== i);
        if (qsDupes.length) F(`QUICKSTART two cards read the same: ${[...new Set(qsDupes)].join('; ')}`);
        const chipTexts = qs.chips.map((c) => c.text).sort();
        if (JSON.stringify(chipTexts) !== JSON.stringify([...qs.chipWant].sort())) F(`QUICKSTART the selection chips read ${JSON.stringify(chipTexts)}, want the full names`);
        if (qs.chips.some((c) => c.title !== c.text)) F('QUICKSTART a selection chip has no title with its full name');

        if (process.env.MQX_TRACE) console.log('step', '// QSVISIBLE');
        // QSVISIBLE (check r3 R1, root cause: the gate compared the FULL text, a clamp showed the same text for two
        // skills). The hard set goes onto Quick Start: both "Add Fractions (like denominators …)" variants, both Two-Step
        // "Then Multiply" / "Then Divide", the 10 longest pupil names, and every pupil-name pair that shares a long prefix
        // (>= 20 characters), 16 cards to a grid. At 1366x768, 820x1180 and 390x844 it reads the text each card SHOWS
        // (a character counts only when its box sits inside the box that clips it) and fails when two cards show the
        // same text. Names are >= 13 px and no card name overflows sideways.
        const QS_PREFIX = 20;
        const hard = await page.evaluate(async (P) => {
            const pn = await import('/js/modules/pupil-names.js');
            const map = pn.pupilNameMap();
            const all = [...map.entries()];
            const named = all.filter(([, n]) => /^Add Fractions \(like denominators\b/i.test(n) || /^Two-Step Word Problems: Add or Take Away, Then (Multiply|Divide)$/i.test(n)).map(([k]) => k);
            const longest = [...all].sort((a, b) => b[1].length - a[1].length).slice(0, 10).map(([k]) => k);
            const sorted = [...all].sort((a, b) => a[1].localeCompare(b[1]));
            const cp = (a, b) => { let i = 0; while (i < a.length && a[i] === b[i]) i++; return i; };
            const pairs = new Set();
            for (let i = 1; i < sorted.length; i++) if (cp(sorted[i - 1][1], sorted[i][1]) >= P) { pairs.add(sorted[i - 1][0]); pairs.add(sorted[i][0]); }
            const first = [...new Set([...named, ...longest])];
            const rest = [...pairs].filter((k) => !first.includes(k));   // already in name order: siblings share a grid
            const batches = [first.slice(0, 16)];
            for (let i = 0; i < rest.length; i += 16) batches.push(rest.slice(i, i + 16));
            // the first word where each hard-set name parts from its nearest neighbour (check r4 D1)
            const diffWord = {}, diffFrom = {};
            for (const k of [...first, ...rest]) {
                const n = map.get(k);
                let best = 0, from = '';
                for (const [k2, n2] of all) { if (k2 === k) continue; const c = cp(n, n2); if (c > best) { best = c; from = k2; } }
                if (best < 16 || best >= n.length) continue;
                let a = best, b = best;
                const W = /[A-Za-z0-9,÷=/]/;
                while (a > 0 && W.test(n[a - 1])) a--;
                while (b < n.length && W.test(n[b])) b++;
                const word = n.slice(a, b).replace(/,$/, '');
                if (word) { diffWord[k] = word; diffFrom[k] = from; }
            }
            return { named, nLongest: longest.length, nPairs: pairs.size, batches, names: Object.fromEntries(all), diffWord, diffFrom };
        }, QS_PREFIX);
        if (hard.named.length !== 4) F(`QSVISIBLE the hard set found ${hard.named.length} of the 4 named skills (Add Fractions like denominators x2, Two-Step Then Multiply / Divide)`);
        const qsSaved = await page.evaluate(() => JSON.stringify(window.customQuickSkills || []));
        for (const [w, h] of [[1366, 768], [1024, 768], [820, 1180], [390, 844], [360, 740]]) {
            await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
            await page.evaluate(() => { document.body.classList.remove('teacher-mode'); document.body.classList.add('student-mode'); if (window.showView) window.showView('homeView'); window.UnifiedSkills.clear(); });
            await sleep(200);
            const seen = new Map();
            for (let b = 0; b < hard.batches.length; b++) {
                const vis = await page.evaluate(async (keys) => {
                    const inDomains = new Map(Object.values(window.DOMAINS).flatMap((d) => d.categories.map((c) => [c.id, c])));
                    window.customQuickSkills = keys.map((k) => {
                        const [cat, sk] = k.split(':');
                        const s = window.SKILLS[cat].find((x) => x.v === sk);
                        const c = inDomains.get(cat);
                        return { categoryId: cat, skillId: sk, skillLabel: s.l, categoryIcon: c.icon, categoryName: c.name, shortName: String(s.l).replace(/^[\s\u{1F300}-\u{1FAFF}☀-➿⬀-⯿️‍½]+/u, '').trim(), source: 'student' };
                    });
                    window.renderQuickSkillsGrid();
                    for (let i = 0; i < 3; i++) await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 40)));
                    const clipOf = (el, stop) => { for (let e = el; e && e !== stop.parentElement; e = e.parentElement) { const o = getComputedStyle(e).overflow; if (/hidden|clip/.test(o)) return e; } return stop; };
                    const shown = (nameEl) => {
                        let out = '';
                        const walker = document.createTreeWalker(nameEl, NodeFilter.SHOW_TEXT);
                        const range = document.createRange();
                        for (let t = walker.nextNode(); t; t = walker.nextNode()) {
                            const box = clipOf(t.parentElement, nameEl).getBoundingClientRect();
                            let cut = false;
                            for (let i = 0; i < t.data.length; i++) {
                                range.setStart(t, i); range.setEnd(t, i + 1);
                                const rs = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
                                const ch = t.data[i];
                                // a glyph box is taller than the line (Andika's ascent + descent), so a character counts when its centre is
                                // inside the clip box and it is not cut by the box's right edge
                                const inside = rs.length && rs.every((r) => { const cy = (r.top + r.bottom) / 2; return r.left >= box.left - 1 && r.right <= box.right + 1 && cy >= box.top && cy <= box.bottom; });
                                if (inside) { if (cut) { out += '…'; cut = false; } out += ch; } else if (!/\s/.test(ch)) cut = true;
                            }
                            if (cut) out += '…';
                            out += ' | ';
                        }
                        return out.replace(/\s+/g, ' ').replace(/( \| )+$/, '').trim();
                    };
                    const cards = [...document.querySelectorAll('#quickSkillsGrid .quick-skill-card')];
                    return cards.map((c, i) => {
                        const nameEl = c.querySelector('.skill-name');
                        const small = [...nameEl.querySelectorAll('*')].concat(nameEl).filter((e) => e.textContent.trim() && e.children.length === 0 && parseFloat(getComputedStyle(e).fontSize) < 13).map((e) => e.className);
                        // sideways: a line of the name runs past the card's text box (scrollWidth counts a clamp's ellipsis room, so the
                        // line boxes are read instead)
                        const nb = nameEl.getBoundingClientRect();
                        const sideways = [...nameEl.children].concat(nameEl.children.length ? [] : [nameEl]).map((e) => { const r = document.createRange(); r.selectNodeContents(e); const over = [...r.getClientRects()].filter((x) => x.width > 0 && (x.left < nb.left - 1 || x.right > nb.right + 1)); return over.length ? `${e.className} ${over.map((x) => `${Math.round(x.left - nb.left)}..${Math.round(x.right - nb.left)}`).join(' ')} in ${Math.round(nb.width)}` : ''; }).filter(Boolean).join(', ');
                        const cardOver = c.getBoundingClientRect().right > document.documentElement.clientWidth + 1;
                        // the pupil's star sits under the name, never on its last line
                        const star = c.querySelector('.qs-star');
                        let onStar = false;
                        if (star) { const sb = star.getBoundingClientRect(); const r = document.createRange(); r.selectNodeContents(nameEl); onStar = [...r.getClientRects()].some((x) => x.width > 0 && (x.top + x.bottom) / 2 <= nameEl.getBoundingClientRect().bottom && x.bottom - 3 > sb.top && x.left < sb.right && x.right > sb.left); }
                        return { key: keys[i], shown: shown(nameEl), small, sideways, cardOver, onStar };
                    });
                }, hard.batches[b]);
                if (SHOTS && b === 0) {
                    await page.evaluate(() => document.getElementById('quickSkillsGrid').scrollIntoView({ block: 'start' }));
                    await sleep(200);
                    await page.screenshot({ path: path.join(SHOTS, `qs-hardset-${w}x${h}.png`) });
                }
                for (const v of vis) {
                    const prev = seen.get(v.shown);
                    if (prev) F(`QSVISIBLE @${w}x${h} two Quick Start cards SHOW the same text "${v.shown}": "${hard.names[prev]}" and "${hard.names[v.key]}"`);
                    else seen.set(v.shown, v.key);
                    // check r4 D1: "(N…" and "…" count as different text, yet a pupil sees two alike cards. The first word
                    // where a name parts from its nearest family member (>= 16 shared characters) must be SHOWN whole.
                    const dw = hard.diffWord[v.key];
                    if (dw && !(' ' + v.shown.replace(/ \| /g, ' ').replace(/…/g, ' … ') + ' ').includes(dw)) F(`QSVISIBLE @${w}x${h} the card "${hard.names[v.key]}" hides "${dw}", the word that tells it from "${hard.names[hard.diffFrom[v.key]]}" (shows "${v.shown}")`);
                    if (v.small.length) F(`QSVISIBLE @${w}x${h} the card "${hard.names[v.key]}" has text under 13 px (${v.small.join(', ')})`);
                    if (v.onStar) F(`QSVISIBLE @${w}x${h} the card "${hard.names[v.key]}": its name runs into the star`);
                    if (v.sideways || v.cardOver) F(`QSVISIBLE @${w}x${h} the card "${hard.names[v.key]}" overflows sideways (${v.sideways || 'past the page'})`);
                }
            }
            const docX = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
            if (docX > 0) F(`QSVISIBLE @${w}x${h} the pupil home scrolls sideways by ${docX}px with the hard set on Quick Start`);
        }
        await page.evaluate((saved) => { window.customQuickSkills = JSON.parse(saved); window.renderQuickSkillsGrid(); }, qsSaved);
        await page.setViewport({ width: 1366, height: 900, deviceScaleFactor: 1 });
        await sleep(200);

        if (process.env.MQX_TRACE) console.log('step', '// SEARCHNAME');
        // SEARCHNAME (check r3 R2): every pupil name, typed into the search, finds its own skill in the top 3
        const sn = await page.evaluate(async () => {
            const pn = await import('/js/modules/pupil-names.js');
            const fin = await import('/js/modules/skill-finder.js');
            await fin.warmSkillSearch();
            const miss = [];
            let n = 0;
            for (const [k, name] of pn.pupilNameMap()) {
                n++;
                const top = fin.findSkills(name).slice(0, 3).map((h) => h.key);
                if (!top.includes(k)) miss.push(`"${name}" (${k}) -> ${top.join(', ') || 'nothing'}`);
            }
            // the words the renaming adds find the skills that carry them
            const counts = {};
            for (const phrase of ['numbers only', 'with pictures', 'like denominators']) {
                const want = [...pn.pupilNameMap()].filter(([, nm]) => new RegExp(`(^|[^a-z])${phrase}`).test(nm.toLowerCase())).map(([k]) => k);
                const got = new Set(fin.findSkills(phrase).map((h) => h.key));
                counts[phrase] = { want: want.length, missing: want.filter((k) => !got.has(k)) };
            }
            return { n, miss, counts };
        });
        if (sn.miss.length) F(`SEARCHNAME ${sn.miss.length} of ${sn.n} pupil names do not find their own skill in the top 3: ${sn.miss.slice(0, 4).join('; ')}`);
        for (const [phrase, c] of Object.entries(sn.counts)) if (c.missing.length) F(`SEARCHNAME "${phrase}" misses ${c.missing.length} of the ${c.want} skills whose pupil name carries it: ${c.missing.slice(0, 3).join(', ')}`);

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
            const tl = nm && nm.parentElement.querySelector('.qs-name-tail');
            out.card = nm ? nm.textContent.trim() + (tl ? ' ' + tl.textContent.trim() : '') : null;
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
            const tl2 = nm2 && nm2.parentElement.querySelector('.qs-name-tail');
            out.saved = nm2 ? nm2.textContent.trim() + (tl2 ? ' ' + tl2.textContent.trim() : '') : null;
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
                else if (/\(visual\)/i.test(got) || qsWords(got) !== qsWords(want)) F(`PUPILNAME the ${where} reads "${got}", want the explorer's pupil name "${want}" (raw "${pn.raw}")`);
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

        if (process.env.MQX_TRACE) console.log('step', '// THUMB mouse');
        // THUMB (owner 2026-11-05: "give a thumbnail of the skill when mousing over"). At 1366x768 and 820x1180 with a mouse:
        // hovering a card shows a thumbnail within 1 s; it holds the paper cell (.ws-cell / .mq-scell), never the answer; it
        // sits inside the viewport, off the pointer and off the card's tick, with no sideways scroll; mouse leave, Esc
        // (the dialog stays open; the next Esc closes it), a scroll of the list and a re-render each hide it.
        const thumbState = () => page.evaluate(() => (window.studentExplorerState() || {}).thumb || {});
        const waitThumb = async (want, ms) => {
            const t0 = Date.now();
            for (;;) {
                const st = await thumbState();
                if (!!st.open === want) return { st, ms: Date.now() - t0 };
                if (Date.now() - t0 > ms) return { st, ms: Date.now() - t0, timeout: true };
                await sleep(40);
            }
        };
        const probe = (key) => page.evaluate(async (k) => {
            const m = await import('./js/modules/student-explorer.js');
            return m.studentExplorerThumbProbe(k);
        }, key);
        // a drawn answer: the answer's token in the thumbnail that the question itself (its text and visual) does not carry
        const leaks = (p) => {
            if (!p || !p.ans || p.hasOptions) return false;
            const a = p.ans.trim();
            if (!a || a.length > 24) return false;
            const re = new RegExp(`(^|[^0-9A-Za-z.,/])${a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^0-9A-Za-z.,/])`);
            const norm = (t) => String(t || '').replace(/\s+/g, ' ').replace(/\s+([,.;:])/g, '$1');
            return re.test(norm(p.text)) && !re.test(norm(p.qText)) && !re.test(norm(p.qVisual));
        };
        const mouseHome = async () => {   // the dialog's title: off every card
            const r = await page.evaluate(() => { const b = document.getElementById('mqxTitle').getBoundingClientRect(); return { x: b.left + 10, y: b.top + b.height / 2 }; });
            await page.mouse.move(r.x, r.y);
        };
        for (const [w, h] of [[1366, 768], [820, 1180]]) {
            await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
            await page.evaluate(() => { document.body.classList.remove('teacher-mode'); document.body.classList.add('student-mode'); if (window.showView) window.showView('homeView'); window.UnifiedSkills.clear(); });
            await sleep(200);
            await page.evaluate(() => window.openStudentExplorer({ tab: 'grade', grade: '2' }));
            await sleep(400);
            // headless Chrome reports no pointer at all (hover: none, pointer: none); it must not read as a touch screen
            const touchy = await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches);
            if (touchy) F(`THUMB @${w}x${h} the mouse test page reports a touch screen (pointer: coarse)`);
            // the first card (left column) and the last card of the first row (right column): both sides get tried
            const targets = await page.evaluate(() => {
                const cards = [...document.querySelectorAll('#mqxBody .mqx-card')];
                const top0 = Math.round(cards[0].getBoundingClientRect().top);
                const row = cards.filter((c) => Math.round(c.getBoundingClientRect().top) === top0);
                return [...new Set([0, cards.indexOf(row[row.length - 1])])];
            });
            let shot = false;
            let cellsSeen = 0;
            for (const idx of targets) {
                await mouseHome();
                await sleep(500);
                const pt = await page.evaluate((i) => { const c = document.querySelectorAll('#mqxBody .mqx-card')[i]; const b = c.getBoundingClientRect(); return { x: Math.round(b.left + b.width * 0.4), y: Math.round(b.top + b.height * 0.5), key: c.dataset.key }; }, idx);
                await page.mouse.move(pt.x, pt.y, { steps: 3 });
                const shown = await waitThumb(true, 1000);
                if (shown.timeout) { F(`THUMB @${w}x${h} hovering ${pt.key} shows no thumbnail within 1 s`); continue; }
                await sleep(1000);   // the cell's mono pass settles (~0.9 s) and the thumbnail re-places
                const g2 = await page.evaluate((i, p) => {
                    const el = document.getElementById('mqxThumb');
                    const card = document.querySelectorAll('#mqxBody .mqx-card')[i];
                    const r = el.getBoundingClientRect(), tick = card.querySelector('.mqx-tick').getBoundingClientRect(), cr = card.getBoundingClientRect();
                    const over = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
                    return { role: el.getAttribute('role'), cell: !!el.querySelector('.ws-cell, .mq-scell'), mode: el.dataset.mode, w: Math.round(r.width), h: Math.round(r.height),
                        inside: r.left >= 0 && r.top >= 0 && r.right <= document.documentElement.clientWidth && r.bottom <= window.innerHeight,
                        onPointer: p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom, onTick: over(r, tick), onCard: over(r, cr),
                        x: document.documentElement.scrollWidth - window.innerWidth, described: (card.getAttribute('aria-describedby') || '').includes('mqxThumb'),
                        cap: (el.querySelector('.mqx-thumb-cap') || {}).textContent || '', name: card.querySelector('.mqx-name').firstChild.textContent,
                        filled: [...el.querySelectorAll('input, textarea')].filter((x) => (x.type === 'checkbox' || x.type === 'radio' ? x.checked : x.value)).length,
                        bigText: (() => { const t = el.querySelector('.mqx-thumb-text'); return !!t && parseFloat(getComputedStyle(t).fontSize) >= 16 && !!t.textContent.trim(); })() };
                }, idx, pt);
                const what = `@${w}x${h} card ${pt.key}`;
                if (g2.role !== 'tooltip') F(`THUMB ${what}: the thumbnail is not role="tooltip"`);
                // the paper cell, or (critic r1 D1) the large-print question when the drawing would be too small to read
                if (g2.cell) cellsSeen++;
                else if (g2.mode !== 'text' || !g2.bigText) F(`THUMB ${what}: the thumbnail holds neither a paper cell (.ws-cell / .mq-scell) nor the large-print question (mode ${g2.mode})`);
                if (!g2.inside) F(`THUMB ${what}: the thumbnail leaves the viewport`);
                if (g2.onPointer) F(`THUMB ${what}: the thumbnail covers the pointer`);
                if (g2.onTick || g2.onCard) F(`THUMB ${what}: the thumbnail covers the card${g2.onTick ? "'s tick" : ''}`);
                if (g2.x > 0) F(`THUMB ${what}: the page scrolls sideways by ${g2.x}px`);
                if (g2.w < 260 || g2.w > 490) F(`THUMB ${what}: the thumbnail is ${g2.w}px wide (want 260-490: S 340 up to L 480, critic r1 D1)`);
                if (!g2.described) F(`THUMB ${what}: the card has no aria-describedby to the thumbnail`);
                if (g2.cap.trim() !== g2.name.trim()) F(`THUMB ${what}: the caption "${g2.cap}" is not the pupil name "${g2.name}"`);
                if (g2.filled) F(`THUMB ${what}: ${g2.filled} answer boxes are filled`);
                if (SHOTS && !shot) { shot = true; await page.screenshot({ path: path.join(SHOTS, `explorer-thumb-${w}.png`) }); }
                // mouse leave
                await mouseHome();
                const gone = await waitThumb(false, 400);
                if (gone.timeout) F(`THUMB ${what}: the thumbnail stays after the mouse leaves`);
                const desc = await page.evaluate((i) => document.querySelectorAll('#mqxBody .mqx-card')[i].getAttribute('aria-describedby'), idx);
                if (desc && desc.includes('mqxThumb')) F(`THUMB ${what}: aria-describedby stays after it hides`);
                // the answer is never drawn
                const pr = await probe(pt.key);
                if (leaks(pr)) F(`THUMB ${what}: the thumbnail shows the answer ${pr.ans}`);
            }
            if (!cellsSeen) F(`THUMB @${w}x${h} no hovered card drew its paper cell (every one fell back to text)`);
            // Esc: the first hides the thumbnail and the dialog stays; the next closes the dialog
            await mouseHome(); await sleep(500);
            let pt = await page.evaluate(() => { const b = document.querySelector('#mqxBody .mqx-card').getBoundingClientRect(); return { x: Math.round(b.left + b.width * 0.4), y: Math.round(b.top + b.height / 2) }; });
            await page.mouse.move(pt.x, pt.y, { steps: 3 });
            if ((await waitThumb(true, 1000)).timeout) F(`THUMB @${w}x${h} (Esc) no thumbnail to hide`);
            else {
                await page.keyboard.press('Escape');
                await sleep(150);
                const e1 = await page.evaluate(() => ({ thumb: window.studentExplorerState().thumb.open, open: !document.getElementById('studentExplorer').hidden }));
                if (e1.thumb) F(`THUMB @${w}x${h} the first Esc does not hide the thumbnail`);
                if (!e1.open) F(`THUMB @${w}x${h} the first Esc closes the explorer (it should only hide the thumbnail)`);
                await page.keyboard.press('Escape');
                await sleep(200);
                if (!(await page.evaluate(() => document.getElementById('studentExplorer').hidden))) F(`THUMB @${w}x${h} the second Esc does not close the explorer`);
                await page.evaluate(() => window.openStudentExplorer({ tab: 'grade', grade: '2' }));
                await sleep(300);
            }
            // a scroll of the list hides it
            await mouseHome(); await sleep(500);
            pt = await page.evaluate(() => { const b = document.querySelector('#mqxBody .mqx-card').getBoundingClientRect(); return { x: Math.round(b.left + b.width * 0.4), y: Math.round(b.top + b.height / 2) }; });
            await page.mouse.move(pt.x, pt.y, { steps: 3 });
            if ((await waitThumb(true, 1000)).timeout) F(`THUMB @${w}x${h} (scroll) no thumbnail to hide`);
            else {
                const sc = await page.evaluate(async () => {
                    const b = document.getElementById('mqxBody');
                    b.scrollTop += 120;
                    await new Promise((r) => setTimeout(r, 60));
                    return window.studentExplorerState().thumb.open;
                });
                if (sc) F(`THUMB @${w}x${h} a scroll of the list does not hide the thumbnail`);
                await page.evaluate(() => { document.getElementById('mqxBody').scrollTop = 0; });
            }
            // a re-render (a grade chip) hides it
            await mouseHome(); await sleep(500);
            pt = await page.evaluate(() => { const b = document.querySelector('#mqxBody .mqx-card').getBoundingClientRect(); return { x: Math.round(b.left + b.width * 0.4), y: Math.round(b.top + b.height / 2) }; });
            await page.mouse.move(pt.x, pt.y, { steps: 3 });
            if ((await waitThumb(true, 1000)).timeout) F(`THUMB @${w}x${h} (re-render) no thumbnail to hide`);
            else {
                const rr = await page.evaluate(() => { document.querySelector('.mqx-gchip[data-grade="3"]').click(); const st = window.studentExplorerState().thumb; return st.open || st.pending; });
                if (rr) F(`THUMB @${w}x${h} the list re-rendered under the thumbnail and it stayed`);
            }
            await mouseHome();
            await sleep(300);

            if (process.env.MQX_TRACE) console.log('step', '// THUMB keyboard', w);
            // Keyboard: Tab onto a card shows the thumbnail (focus stays on the card); the first Esc hides it and keeps the dialog
            await page.evaluate(() => window.openStudentExplorer({ tab: 'grade', grade: '1' }));
            await sleep(300);
            await page.evaluate(() => document.querySelector('.mqx-gchip[aria-checked="true"]').focus());
            let onCard = false;
            for (let i = 0; i < 12 && !onCard; i++) {
                await page.keyboard.press('Tab');
                onCard = await page.evaluate(() => !!(document.activeElement && document.activeElement.classList.contains('mqx-card')));
            }
            if (!onCard) F(`THUMB @${w}x${h} Tab never reaches a card`);
            else {
                const k = await waitThumb(true, 1000);
                if (k.timeout) F(`THUMB @${w}x${h} keyboard focus on a card shows no thumbnail within 1 s`);
                else {
                    const kf = await page.evaluate(() => {
                        const a = document.activeElement;
                        const r = document.getElementById('mqxThumb').getBoundingClientRect();
                        return { card: a.classList.contains('mqx-card'), key: a.dataset.key, st: window.studentExplorerState().thumb, described: (a.getAttribute('aria-describedby') || '').includes('mqxThumb'),
                            inside: r.left >= 0 && r.top >= 0 && r.right <= document.documentElement.clientWidth && r.bottom <= window.innerHeight };
                    });
                    if (!kf.card || kf.st.key !== kf.key) F(`THUMB @${w}x${h} keyboard: focus moved, or the thumbnail is for another card (${kf.st.key} vs ${kf.key})`);
                    if (!kf.described) F(`THUMB @${w}x${h} keyboard: the focused card has no aria-describedby to the thumbnail`);
                    if (!kf.inside) F(`THUMB @${w}x${h} keyboard: the thumbnail leaves the viewport`);
                    await page.keyboard.press('Escape');
                    await sleep(150);
                    const ke = await page.evaluate(() => ({ thumb: window.studentExplorerState().thumb.open, open: !document.getElementById('studentExplorer').hidden, onCard: document.activeElement.classList.contains('mqx-card') }));
                    if (ke.thumb) F(`THUMB @${w}x${h} keyboard: the first Esc does not hide the thumbnail`);
                    if (!ke.open) F(`THUMB @${w}x${h} keyboard: the first Esc closes the explorer`);
                    if (!ke.onCard) F(`THUMB @${w}x${h} keyboard: Esc moved focus off the card`);
                    // the next card by Tab: blur of the first hides, the next one's thumbnail follows
                    await page.keyboard.press('Tab');
                    await sleep(60);
                    const kb = await page.evaluate(() => window.studentExplorerState().thumb);
                    if (kb.open) F(`THUMB @${w}x${h} keyboard: the thumbnail of the card left behind stays on blur`);
                    await page.keyboard.press('Escape');
                    await sleep(200);
                    if (!(await page.evaluate(() => document.getElementById('studentExplorer').hidden))) F(`THUMB @${w}x${h} keyboard: Esc with no thumbnail does not close the explorer`);
                }
            }
            await page.evaluate(() => window.closeStudentExplorer && window.closeStudentExplorer());
            await sleep(200);
        }

        if (process.env.MQX_TRACE) console.log('step', '// THUMB sweep');
        // THUMB sweep: every live skill draws a thumbnail (the paper cell, or the text example when its generator throws or is
        // slow) with no throw and no console error, and none shows its answer
        {
            await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
            await page.evaluate(() => window.openStudentExplorer({ tab: 'grade', grade: 'K' }));
            await sleep(300);
            const keys = await page.evaluate(async () => {
                const set = new Set();
                for (const g of [...document.querySelectorAll('.mqx-gchip')].map((c) => c.dataset.grade)) {
                    document.querySelector(`.mqx-gchip[data-grade="${g}"]`).click();   // the chips are drawn again on each click
                    await new Promise((r) => setTimeout(r, 20));
                    for (const k of document.querySelectorAll('#mqxBody .mqx-card')) set.add(k.dataset.key);
                }
                return [...set];
            });
            const tally = { cell: 0, text: 0, slow: 0, err: 0 };
            const bad = [];
            for (const key of keys) {
                const before = app.problems.length;
                let pr;
                try { pr = await probe(key); } catch (e) { pr = { err: String(e && e.message || e) }; }
                if (!pr || typeof pr.err === 'string') { bad.push(`${key} threw: ${pr && pr.err}`); continue; }
                if (pr.mode === 'cell' || pr.mode === 'crop') { tally[pr.mode] = (tally[pr.mode] || 0) + 1; if (!pr.cell) bad.push(`${key} ${pr.mode} mode without a .ws-cell`); } else if (pr.mode === 'text') tally.text++; else bad.push(`${key} drew nothing (${pr.mode})`);
                if (pr.err) tally.err++;
                if (pr.ms > 50) tally.slow++;
                if (pr.filled) bad.push(`${key} ${pr.filled} answer boxes filled`);
                if (leaks(pr)) bad.push(`${key} shows its answer ${pr.ans}`);
                const errs = app.problems.slice(before).filter((p) => !/favicon/.test(p.text));
                if (errs.length) bad.push(`${key} console: ${errs[0].type} ${errs[0].text.slice(0, 120)}`);
            }
            if (keys.length < 700) F(`THUMB sweep reached only ${keys.length} skills`);
            if (bad.length) F(`THUMB sweep ${bad.length} of ${keys.length} skills fail: ${bad.slice(0, 6).join(' | ')}`);
            for (const b of bad.slice(6, 40)) console.error(`    THUMB sweep: ${b}`);
            console.log(`  THUMB sweep: ${keys.length} skills — ${tally.cell} cells, ${tally.crop || 0} crops, ${tally.text} text (${tally.slow} slow, ${tally.err} generator errors)`);

            if (process.env.MQX_TRACE) console.log('step', '// THUMB legible (hard set, real hover)');
            // THUMB legibility (critic r1 D1-D6, r2 R2-D1). Measured on what a pupil sees after the thumbnail settles
            // (tests/lib/ws-thumb-measure.cjs):
            //   TEXTSIZE  the question line renders >= 14 px
            //   PARITY    a text renders under 10 px only where the skill's own practice card (1366) shows it that small,
            //             and never smaller than there (r2: an axis tick the card shows at 7 px may stay 7 px)
            //   SCALE     a drawn cell or crop is scaled >= 0.6
            //   INFRAME   a fitted cell paints nothing outside the frame; a crop keeps its question line whole and a figure
            //             in its window
            //   NODUP     the question is not shown twice (normalised text compare, so a story split over lines counts)
            //   NOTEACHER no "CCSS:" code, no Hint / Check button, no screen-only control
            //   NOEXTRA   no extra answer line under an item that already has its own blank ("___", "= ?", a box)
            //   NOPICLESS a skill whose question needs its drawing (a practice-card visual, or words that point at a picture)
            //             is never words-only at the L, W, B or M plates, and words-only text never points at a picture
            //   WORDSONLY the count of words-only plates per size stays under its ceiling (WORDS_CEILING, below)
            // First a REAL HOVER on the skills the critics found worst (this half runs on any build), then every live skill
            // at every plate size. 1024 x 768: the middle grid column gets an L, W or B plate, never S (r2 fix 4).
            await page.evaluate(installThumbMeasure, POINTING.source);
            const cardCache = new Map();
            const cardSizes = async (key) => {
                if (!cardCache.has(key)) {
                    const sizes = await page.evaluate((k) => window.__mqxCardSizes(k), key);
                    await page.evaluate(() => { document.body.classList.remove('teacher-mode'); document.body.classList.add('student-mode'); if (window.state) { window.state.isPlaying = false; } });
                    cardCache.set(key, sizes);
                }
                return cardCache.get(key);
            };
            const HARD = ['graphs:bar_graph', 'coordinates:coordinate_all', 'fractions:mixed_improper_visual', 'addition:add_word_problems',
                'subtraction:sub_wp_20', 'graphs:line_plot', 'graphs:pie_chart', 'coordinates:geo_reflect', 'area_perimeter:area',
                'area_perimeter:area_perimeter', 'probability:probability_basic', 'multiplication:mult_chart_easy', 'counting:count_objects',
                'coordinates:coordinate_q1', 'data_analysis:box_plot_intro', 'fractions:fraction_of_set', 'measurement:elapsed_hour',
                'addition:nl_add', 'area_perimeter:perimeter_grid', 'number_theory:factor_tchart_easy'];
            const hovered = [];
            for (const [w, h] of [[1366, 768], [820, 1180]]) {
                await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
                await sleep(200);
                for (const key of HARD) {
                    const g = await page.evaluate(async (k) => {
                        for (const gr of ['K', '1', '2', '3', '4', '5', '6', 'M']) {
                            await window.openStudentExplorer({ tab: 'grade', grade: gr });
                            const c = document.querySelector(`#mqxBody .mqx-card[data-key="${k}"]`);
                            if (c) { c.scrollIntoView({ block: 'center' }); return gr; }
                        }
                        return null;
                    }, key);
                    if (!g) { F(`THUMB legible: ${key} is not in the explorer`); continue; }
                    await mouseHome(); await sleep(450);
                    const pt = await page.evaluate((k) => { const b = document.querySelector(`#mqxBody .mqx-card[data-key="${k}"]`).getBoundingClientRect(); return { x: Math.round(b.left + b.width * 0.4), y: Math.round(b.top + b.height * 0.35) }; }, key);
                    await page.mouse.move(pt.x, pt.y, { steps: 3 });
                    if ((await waitThumb(true, 1000)).timeout) { F(`THUMB legible @${w}: hovering ${key} shows no thumbnail`); continue; }
                    await sleep(1200);   // settled: the mono pass let go and the refit ran
                    const m = await page.evaluate((k) => window.__mqxMeasure(document.getElementById('mqxThumb'), k), key);
                    if (SHOTS && w === 1366) await page.screenshot({ path: path.join(SHOTS, `thumb-hard-${key.replace(/\W+/g, '_')}.png`) }).catch(() => {});   // no clip: a clipped shot resizes the page, which hides the thumbnail
                    hovered.push({ w, key, m });
                }
            }
            await mouseHome();
            for (const { w, key, m } of hovered) {
                const card = m.small && m.small.length ? await cardSizes(key) : null;
                for (const f of thumbFaults(m, { card })) F(`THUMB legible @${w} hover ${key}: ${f}`);
            }
            // 1024 x 768: the middle column of the grid (no room beside it for a large plate) gets L, W or B above / below
            {
                await page.setViewport({ width: 1024, height: 768, deviceScaleFactor: 1 });
                await sleep(200);
                const small1024 = [];
                for (const gr of ['K', '3']) {
                    await page.evaluate((g) => window.openStudentExplorer({ tab: 'grade', grade: g }), gr);
                    await sleep(300);
                    const mids = await page.evaluate(() => {
                        const cards = [...document.querySelectorAll('#mqxBody .mqx-card')];
                        const lefts = [...new Set(cards.map((c) => Math.round(c.getBoundingClientRect().left)))].sort((a, b) => a - b);
                        if (lefts.length < 3) return [];
                        const body = document.getElementById('mqxBody').getBoundingClientRect();
                        return cards.filter((c) => Math.round(c.getBoundingClientRect().left) === lefts[1]).map((c) => c.getBoundingClientRect()).filter((b) => b.top > body.top && b.bottom < body.bottom - 60)
                            .slice(0, 3).map((b) => ({ x: Math.round(b.left + b.width * 0.4), y: Math.round(b.top + b.height * 0.35) }));
                    });
                    if (!mids.length) F(`THUMB @1024 grade ${gr}: no middle grid column to test`);
                    for (const pt of mids) {
                        await mouseHome(); await sleep(450);
                        await page.mouse.move(pt.x, pt.y, { steps: 3 });
                        if ((await waitThumb(true, 1000)).timeout) { F(`THUMB @1024 grade ${gr}: a middle-column card shows no thumbnail`); continue; }
                        const sz = await page.evaluate(() => ((document.getElementById('mqxThumb').className || '').match(/mqx-thumb--(\w)/) || [])[1] || '?');
                        if (!['L', 'W', 'B'].includes(sz)) small1024.push(`${gr}@${pt.x},${pt.y}=${sz}`);
                    }
                }
                if (small1024.length) F(`THUMB @1024x768 middle-column cards get a small plate (want L / W / B): ${small1024.join(', ')}`);
                await mouseHome();
                await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
                await sleep(200);
            }

            if (process.env.MQX_TRACE) console.log('step', '// THUMB legible sweep');
            // WORDS_CEILING: words-only plates per size (the full sweeps, L and S). Words-only is allowed only for an item
            // with no drawing on its practice card: a build widget ("Build a bar graph showing: Mon=7 ...") or a text-only
            // item too long to fit. On 2026-11-07 that is 2 at L (both build widgets) and 25 at S; the ceilings add room for
            // a seeded item changing (+2 / +5) and no more, so a figure skill falling back to words shows up at once. At
            // L, W, B and M no figure skill may be words-only at all (NOPICLESS). W, B and M are each swept on a third of
            // the skills (a different third each, so together they cover all 716) to keep the gate under 10 minutes.
            const WORDS_CEILING = { L: 4, S: 30 };
            const hasBatch = await page.evaluate(async () => typeof (await import('./js/modules/student-explorer.js')).studentExplorerThumbBatch === 'function');
            if (!hasBatch) F('THUMB legible sweep: student-explorer.js has no studentExplorerThumbBatch (the sweep cannot draw the plates)');
            else {
                const all = [];
                for (const size of ['L', 'W', 'B', 'M', 'S']) {
                    const tl = { cell: 0, crop: 0, text: 0 };
                    const third = { W: 0, B: 1, M: 2 }[size];
                    const sk = third == null ? keys : keys.filter((_, k) => k % 3 === third);
                    for (let i = 0; i < sk.length; i += 60) {
                        const batch = sk.slice(i, i + 60);
                        const before = app.problems.length;
                        const ms = await page.evaluate(async (b, sz) => {
                            const m = await import('./js/modules/student-explorer.js');
                            await m.studentExplorerThumbBatch(b, { size: sz });
                            return [...document.querySelectorAll('.mqx-thumb-probe')].map((el) => window.__mqxMeasure(el, el.dataset.key));
                        }, batch, size);
                        await page.evaluate(async () => (await import('./js/modules/student-explorer.js')).studentExplorerThumbBatch([]));
                        for (const m of ms) { tl[m.mode] = (tl[m.mode] || 0) + 1; all.push({ size, m }); }
                        const errs = app.problems.slice(before).filter((p) => !/favicon/.test(p.text));
                        if (errs.length) F(`THUMB legible sweep (${size}) batch ${i}: console ${errs[0].text.slice(0, 120)}`);
                    }
                    console.log(`  THUMB legible sweep (${size}${third == null ? '' : ', a third'}): ${tl.cell} cells, ${tl.crop || 0} crops, ${tl.text} words-only`);
                    if (WORDS_CEILING[size] != null && tl.text > WORDS_CEILING[size]) F(`THUMB WORDSONLY (${size}): ${tl.text} words-only plates (ceiling ${WORDS_CEILING[size]})`);
                }
                // PARITY needs the practice card of every skill that has a text under 10 px in any plate
                const faults = {};
                for (const { size, m } of all) {
                    const card = m.small && m.small.length ? await cardSizes(m.key) : null;
                    for (const f of thumbFaults(m, { size, card })) (faults[size] = faults[size] || []).push(`${m.key}: ${f}`);
                }
                await page.evaluate(() => { if (window.showView) window.showView('homeView'); });
                for (const [size, list] of Object.entries(faults)) {
                    F(`THUMB legible sweep (${size}): ${list.length} faults: ${list.slice(0, 5).join(' | ')}`);
                    for (const f of list.slice(5, 25)) console.error(`    THUMB legible ${size}: ${f}`);
                }
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

        if (process.env.MQX_TRACE) console.log('step', '// THUMB touch');
        // THUMB touch: at 390x844 with touch emulation (hover: none), no hover thumbnail ever appears; a tap still picks
        {
            await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });   // reloads the page
            await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS && !!window.openStudentExplorer, { timeout: 30000 });
            await page.evaluate(() => { document.body.classList.remove('teacher-mode'); document.body.classList.add('student-mode'); if (window.state) { window.state.isPlaying = false; window.state.isMixedMode = false; } if (window.showView) window.showView('homeView'); window.UnifiedSkills.clear(); });
            await sleep(300);
            await page.evaluate(() => window.openStudentExplorer({ tab: 'grade', grade: '2' }));
            await page.waitForFunction(() => { const r = document.getElementById('studentExplorer'); return r && !r.hidden && r.querySelectorAll('.mqx-card').length > 0; }, { timeout: 20000 });
            await sleep(400);
            const media = await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(any-hover: hover)').matches);
            if (!media) F('THUMB @390 touch emulation does not report (pointer: coarse) without hover: the touch check cannot judge');
            const pt = await page.evaluate(() => { const c = document.querySelector('#mqxBody .mqx-card'); const b = c.getBoundingClientRect(); return { x: Math.round(b.left + b.width * 0.4), y: Math.round(b.top + b.height / 2), key: c.dataset.key }; });
            await page.touchscreen.tap(pt.x, pt.y);
            await sleep(1100);
            const t1 = await page.evaluate((k) => ({ st: window.studentExplorerState().thumb, picked: document.querySelector(`#mqxBody .mqx-card[data-key="${k}"]`).getAttribute('aria-pressed') }), pt.key);
            if (t1.st.open || t1.st.pending) F('THUMB @390 touch: a tap on a card opens a hover thumbnail');
            if (t1.picked !== 'true') F('THUMB @390 touch: a tap no longer picks the skill');
            await page.mouse.move(pt.x + 5, pt.y + 5);   // even a mouse event on a hover-less screen shows none
            await sleep(1100);
            const t2 = await page.evaluate(() => window.studentExplorerState().thumb);
            if (t2.open || t2.pending) F('THUMB @390 touch: a hover thumbnail appears on a hover-less screen');
            const tx = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
            if (tx > 0) F(`THUMB @390 touch: the page scrolls sideways by ${tx}px`);
            if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'explorer-thumb-none-390.png') });
            await page.evaluate(() => { window.closeStudentExplorer && window.closeStudentExplorer(); window.UnifiedSkills.clear(); });
        }

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
