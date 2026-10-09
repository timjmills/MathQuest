// ws-search-order — the on-screen order of the grouped skill pickers (critic r1 N4).
//   node tests/scripts/ws-search-order.cjs
// ws-search-terms checks findSkills and groupByRank in Node; this drives the real DOM reordering in
// the Skills Navigator (soOrderByRank) and the Quiz builder (qbOrderByRank): for each query the FIRST
// VISIBLE card must be the expected skill, and the named wrong skills must not be among the first 3.
// It also checks no console errors. Prints `ws-search-order: OK` / `FAIL`.
const { open } = require('../lib/ws-harness.cjs');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// [query, allowed first card(s), skills that must not be in the first 3 visible cards]
const CASES = [
    ['skip counting', ['multiplication:count_by_tables'], ['multiplication:mult_zeros']],
    ['column subtraction', ['subtraction:sub_100_regroup'], ['addition:add_column_multi', 'addition:add_20_regroup', 'addition:add_10_no_regroup']],
    ['factors and multiples', ['number_theory:factors_identify', 'number_theory:multiples'], ['multiplication:mult_zeros']],
    ['prime', ['number_theory:prime_composite'], ['multiplication:mult_zeros']],
    ['short multiplication', ['multiplication:multiply'], []],
    ['times tables', ['multiplication:mult_facts'], []],
    ['take away', ['subtraction:sub_facts'], []],
    ['plus', ['addition:add_facts'], []],
    ['divide by 2', ['patterns:halve', 'division:div_facts'], ['division:long_div_2digit']],
    ['round to the nearest hundred', ['number_sense:nearest_100'], ['number_sense:round_sort_hundredths']],
    ['subtracton', ['subtraction:sub_facts'], []],
    ['half past', ['measurement:time_half_hour'], []],
    ['perimeter', ['area_perimeter:perimeter'], []],
    // critic r2
    ['divided by 2', ['patterns:halve'], ['division:box_division_easy', 'division:area_model_div_2by1']],
    ['÷2', ['patterns:halve'], ['division:box_division_easy', 'division:area_model_div_2by1']],
    ['tile', ['area_perimeter:area_unit_squares', 'area_perimeter:area'], ['measurement:time_hour']],
    ['3*4', ['multiplication:mult_facts'], []],
    ['part whole model', ['composing:number_bonds'], []],
];
// [query, the SECOND visible card] (critic r3 R-C: Halving first, Division Facts second in every box)
const SECOND = [['divide by 2', 'division:div_facts'], ['divided by 2', 'division:div_facts'], ['÷2', 'division:div_facts'], ['÷ 2', 'division:div_facts']];
// [box id, query, the "Showing results for" text expected, or null for no notice] (critic r2 P-A)
const NOTICES = [['qbSearchInput', 'tme', 'time'], ['qbSearchInput', 'tile', null], ['qbSearchInput', 'compass', null],
    ['qbSearchInput', 'aera', 'area'], ['skillSearchInput', 'perimter', 'perimeter'], ['skillSearchInput', 'days', null]];

(async () => {
    const failures = [];
    const app = await open({ seed: 7 });
    const { page } = app;
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e.message || e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    // the first visible cards of a grouped view, in on-screen (document) order
    const firstCards = (sel, cat, skill) => page.evaluate((s, c, k) => [...document.querySelectorAll(s)]
        .filter((el) => el.offsetParent !== null || el.getClientRects().length)
        .slice(0, 3).map((el) => `${el.dataset[c]}:${el.dataset[k]}`), sel, cat, skill);
    try {
        // wait for the standards / WRM terms (the index the views rank with)
        await sleep(3500);   // init.js warms the standards / WRM search terms 2.5 s after boot

        // Skills Navigator (the pupil-side view)
        await page.evaluate(() => { window.setUserRole && window.setUserRole('student'); });
        await page.evaluate(() => { if (window.soInitialize) window.soInitialize(); window.showView('skillsOrganizerView'); });
        await sleep(400);
        const soCount = await page.$$eval('.so-skill-card', (c) => c.length);
        if (soCount < 400) failures.push(`navigator: only ${soCount} cards built`);
        for (const [q, want, never] of CASES) {
            await page.evaluate((v) => { const i = document.getElementById('soSearchInput'); i.value = v; window.soSearchInput(v); }, q);
            await sleep(120);
            const got = await firstCards('.so-skill-card', 'soCat', 'soSkill');
            if (!want.includes(got[0])) failures.push(`navigator "${q}": first card ${got[0]}, want ${want.join(' or ')}`);
            const bad = never.filter((k) => got.includes(k));
            if (bad.length) failures.push(`navigator "${q}": ${bad.join(', ')} in the first 3 (${got.join(', ')})`);
        }
        for (const [q, second] of SECOND) {
            await page.evaluate((v) => { const i = document.getElementById('soSearchInput'); if (i) i.value = v; window.soSearchInput(v); }, q);
            await sleep(120);
            const got = await firstCards('.so-skill-card', 'soCat', 'soSkill');
            if (got[1] !== second) failures.push(`navigator "${q}": second card ${got[1]}, want ${second}`);
        }
        await page.evaluate(() => window.soSearchInput(''));

        // Quiz builder
        await page.evaluate(() => { window.setUserRole && window.setUserRole('teacher'); });
        await page.evaluate(() => { window.openQuizBuilder(); if (window.showView) window.showView('quizBuilderView'); });
        await sleep(600);
        const qbCount = await page.$$eval('.qb-skill-card', (c) => c.length);
        if (qbCount < 400) failures.push(`quiz builder: only ${qbCount} cards built`);
        for (const [q, want, never] of CASES) {
            await page.evaluate((v) => { const i = document.getElementById('qbSearchInput'); if (i) i.value = v; window.qbSearchInput(v); }, q);
            await sleep(120);
            const got = await firstCards('.qb-skill-card', 'qbCat', 'qbSkill');
            if (!want.includes(got[0])) failures.push(`quiz builder "${q}": first card ${got[0]}, want ${want.join(' or ')}`);
            const bad = never.filter((k) => got.includes(k));
            if (bad.length) failures.push(`quiz builder "${q}": ${bad.join(', ')} in the first 3 (${got.join(', ')})`);
        }
        for (const [q, second] of SECOND) {
            await page.evaluate((v) => { const i = document.getElementById('qbSearchInput'); if (i) i.value = v; window.qbSearchInput(v); }, q);
            await sleep(120);
            const got = await firstCards('.qb-skill-card', 'qbCat', 'qbSkill');
            if (got[1] !== second) failures.push(`quiz builder "${q}": second card ${got[1]}, want ${second}`);
        }
        // the "Showing results for" line: typed into the real box (an input event, as a keyboard does)
        for (const [id, q, want] of NOTICES) {
            if (id === 'skillSearchInput') await page.evaluate(() => { window.goHome && window.goHome(); });
            const got = await page.evaluate((i, v) => {
                const el = document.getElementById(i);
                if (!el) return 'NO BOX';
                el.value = v;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                const n = document.getElementById(i + 'Fix');
                if (!n || n.hidden) return null;
                // VISIBLE, not just present (critic r4 U-B): the topmost element at the notice's centre is the notice
                if (el.offsetParent) {
                    n.scrollIntoView({ block: 'center' });
                    const r = n.getBoundingClientRect();
                    const pe = n.style.pointerEvents; n.style.pointerEvents = 'auto';
                    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
                    n.style.pointerEvents = pe;
                    if (!r.width || !r.height || !hit || !(hit === n || n.contains(hit))) return `HIDDEN under ${hit ? hit.id || hit.className || hit.tagName : 'nothing'}`;
                }
                return n.textContent;
            }, id, q);
            const exp = want ? `Showing results for ${want}` : null;
            if (got !== exp) failures.push(`notice ${id} "${q}": ${JSON.stringify(got)}, want ${JSON.stringify(exp)}`);
        }
        // the notice never moves the box or its filter row (critic r3 U-A)
        const rects = () => page.evaluate(() => ['qbSearchInput', 'qbCategorySelect'].map((i) => {
            const r = document.getElementById(i).getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width)].join(','); }));
        await page.evaluate(() => { const el = document.getElementById('qbSearchInput'); el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); });
        const before = await rects();
        await page.evaluate(() => { const el = document.getElementById('qbSearchInput'); el.value = 'tme'; el.dispatchEvent(new Event('input', { bubbles: true })); });
        const after = await rects();
        if (before.join('|') !== after.join('|')) failures.push(`notice moved the quiz builder filter row: ${before.join('|')} -> ${after.join('|')}`);
        // critic r4 U-B / U-C, r5 U-D / U-E / U-F: in EVERY box, at every Chromebook size, the corrected-search line
        //   - is VISIBLE: the topmost element at its left, centre and right, on its first AND last line, is the line
        //     (probed with pointer-events on), and it lies inside the window;
        //   - is READ IN FULL: the exact text, no ellipsis, scrollWidth <= clientWidth and scrollHeight <= clientHeight
        //     (a long word may run wider than the box or wrap, never be cut off);
        //   - in the student box and the print picker is the results list's FIRST row (never on the list's border);
        //   - in the Sets picker never covers the Level label, and the Level row never moves (the line is reserved).
        const WORDS = [['tme', 'time'], ['multiplcation', 'multiplication'], ['probabilty', 'probability'], ['perimter', 'perimeter']];
        const BOXES = [
            ['skillSearchInput', async () => { await page.evaluate(() => { window.setUserRole && window.setUserRole('student'); window.goHome && window.goHome(); }); }],
            ['soSearchInput', async () => { await page.evaluate(() => { window.soInitialize && window.soInitialize(); window.showView('skillsOrganizerView'); }); }],
            ['qbSearchInput', async () => { await page.evaluate(() => { window.setUserRole('teacher'); window.openQuizBuilder(); window.showView('quizBuilderView'); }); }],
            ['tvlSearch', async () => { await page.evaluate(() => { window.setUserRole('teacher'); window.tvGo('library'); }); }],
            ['tvSkillSearch', async () => { await page.evaluate(() => { window.setUserRole('teacher'); window.tvGo('sets'); }); }],
            ['tvPick0', async () => { await page.evaluate(() => { window.setUserRole('teacher'); window.tvGo('print'); window.tvOpenPrintWith(window.skillQueue);
                const b = document.querySelector('#teacherMain [data-screen="print"] [data-act="pick"]'); if (b && !document.getElementById('tvPick0')) b.click(); }); }],
        ];
        const LIST = { skillSearchInput: 'skillSearchResults', tvPick0: 'tvPickRes0' };
        const probe = (id, want, list) => page.evaluate((i, w, l) => {
            const box = document.getElementById(i);
            if (!box || !box.offsetParent) return 'NO BOX';
            const n = document.getElementById(i + 'Fix');
            if (!n || n.hidden) return 'NO NOTICE';
            if (n.textContent !== `Showing results for ${w}`) return `TEXT ${JSON.stringify(n.textContent)}`;
            if (l) {
                const ls = document.getElementById(l);
                if (!ls || ls.firstElementChild !== n) return `NOT the first row of ${l} (first: ${ls && ls.firstElementChild ? ls.firstElementChild.id || ls.firstElementChild.className || ls.firstElementChild.tagName : 'none'})`;
            }
            n.scrollIntoView({ block: 'nearest' });
            const cs = getComputedStyle(n);
            if (cs.textOverflow === 'ellipsis') return 'ELLIPSIS';
            if (n.scrollWidth > n.clientWidth) return `TRUNCATED scrollWidth ${n.scrollWidth} > clientWidth ${n.clientWidth}`;
            if (n.scrollHeight > n.clientHeight + 1) return `CLIPPED scrollHeight ${n.scrollHeight} > clientHeight ${n.clientHeight}`;
            const r = n.getBoundingClientRect();
            if (!r.width || !r.height) return 'ZERO SIZE';
            if (r.left < 0 || r.right > window.innerWidth || r.top < 0 || r.bottom > window.innerHeight) return `OUT OF WINDOW ${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}`;
            // the bold corrected word itself is inside the line's box (not cut by an ancestor)
            const strong = n.querySelector('strong');
            const sr = strong && strong.getBoundingClientRect();
            if (!sr || sr.right > r.right + 0.5 || sr.bottom > r.bottom + 0.5) return 'WORD OUTSIDE THE LINE';
            const pe = n.style.pointerEvents; n.style.pointerEvents = 'auto';
            const ys = [r.top + 4, r.bottom - 4];
            const pts = [];
            for (const y of ys) pts.push([r.left + 4, y], [r.left + r.width / 2, y], [r.right - 4, y]);
            pts.push([(sr.left + sr.right) / 2, (sr.top + sr.bottom) / 2]);
            const bad = pts.map(([x, y]) => document.elementFromPoint(x, y)).find((hit) => !hit || !(hit === n || n.contains(hit)));
            n.style.pointerEvents = pe;
            if (bad !== undefined) return `HIDDEN under ${bad ? bad.id || bad.className || bad.tagName : 'nothing'}`;
            if (l) {
                // inside the list's border box: never on (or over) its border
                const ls = document.getElementById(l), lr = ls.getBoundingClientRect();
                const inL = lr.left + ls.clientLeft, inT = lr.top + ls.clientTop, inR = lr.right - parseFloat(getComputedStyle(ls).borderRightWidth || '0');
                if (r.top < inT - 0.5 || r.left < inL - 0.5 || r.right > inR + 0.5) return `ON THE LIST BORDER ${Math.round(r.top)}/${Math.round(inT)} ${Math.round(r.left)}/${Math.round(inL)} ${Math.round(r.right)}/${Math.round(inR)}`;
            }
            if (i === 'tvSkillSearch') {
                const lv = document.getElementById('tvLevelL').getBoundingClientRect();
                if (lv.top < r.bottom && lv.bottom > r.top && lv.left < r.right && lv.right > r.left) return 'COVERS the Level label';
            }
            return 'OK';
        }, id, want, list);
        const levelTop = () => page.evaluate(() => { const l = document.getElementById('tvLevelL'); return l ? Math.round(l.getBoundingClientRect().top + window.scrollY) : null; });
        let checked = 0;
        for (const [w, h] of [[1366, 768], [1280, 720], [1366, 650]]) {
            await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
            for (const [id, go] of BOXES) {
                await go();
                await sleep(400);
                for (const [typo, want] of WORDS) {
                    await page.focus('#' + id).catch(() => {});
                    await page.evaluate((i) => { const el = document.getElementById(i); if (el) { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); } }, id);
                    const lv0 = id === 'tvSkillSearch' ? await levelTop() : null;
                    await page.type('#' + id, typo).catch(() => {});
                    await sleep(250);
                    const res = await probe(id, want, LIST[id]);
                    checked++;
                    if (res !== 'OK') failures.push(`notice ${id} "${typo}" at ${w}x${h}: ${res}`);
                    if (id === 'tvSkillSearch') {
                        const lv1 = await levelTop();
                        if (lv0 !== lv1) failures.push(`Sets: the Level row moved ${lv0} -> ${lv1} when "${typo}" was corrected at ${w}x${h}`);
                    }
                }
                await page.evaluate((i) => { const el = document.getElementById(i); if (el) { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); } }, id);
            }
        }
        // critic r5 U-D: the student box keeps its notice as the list's first row whenever the list is rebuilt:
        // after "+" on a result, and after a blur and a refocus (real clicks and keystrokes)
        for (const [w, h] of [[1366, 650], [1280, 720]]) {
            await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
            await BOXES[0][1]();
            await sleep(400);
            await page.evaluate(() => { const el = document.getElementById('skillSearchInput'); el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); });
            await page.click('#skillSearchInput');
            await page.type('#skillSearchInput', 'tme');
            await sleep(300);
            let res = await probe('skillSearchInput', 'time', 'skillSearchResults');
            if (res !== 'OK') failures.push(`student "tme" at ${w}x${h}: ${res}`);
            const plus = await page.evaluateHandle(() => [...document.querySelectorAll('#skillSearchResults button')].find((b) => /addToSkillQueue/.test(b.getAttribute('onclick') || '')));
            if (!plus || !(await plus.evaluate((b) => !!b))) failures.push(`student at ${w}x${h}: no "+" button in the results`);
            else {
                await plus.click();
                await sleep(700);
                res = await probe('skillSearchInput', 'time', 'skillSearchResults');
                if (res !== 'OK') failures.push(`student after "+" at ${w}x${h}: ${res}`);
                // take it back off the queue (the list was rebuilt, so find its "+" again)
                await page.evaluate(() => { const b = [...document.querySelectorAll('#skillSearchResults button')].find((x) => /addToSkillQueue/.test(x.getAttribute('onclick') || '')); if (b) b.click(); });
                await sleep(500);
            }
            // blur (a real click on empty page space), then refocus with a real click
            await page.mouse.click(5, h - 5);
            await sleep(500);
            await page.click('#skillSearchInput');
            await sleep(400);
            res = await probe('skillSearchInput', 'time', 'skillSearchResults');
            if (res !== 'OK') failures.push(`student after blur and refocus at ${w}x${h}: ${res}`);
            // a rebuild by the app's own code (handleSkillSearch without typing)
            await page.evaluate(() => window.handleSkillSearch(document.getElementById('skillSearchInput').value));
            await sleep(200);
            res = await probe('skillSearchInput', 'time', 'skillSearchResults');
            if (res !== 'OK') failures.push(`student after a handleSkillSearch rebuild at ${w}x${h}: ${res}`);
            await page.evaluate(() => { const el = document.getElementById('skillSearchInput'); el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); el.blur(); });
        }
        console.log(`ws-search-order: ${checked} notice checks (6 boxes x 4 corrections x 3 Chromebook sizes) + student rebuild checks`);
    } catch (e) {
        failures.push(`exception: ${e.message}`);
    } finally {
        await app.close();
    }
    const real = errors.filter((e) => !/favicon|\.woff2/.test(e));
    for (const e of real) failures.push(`console: ${e}`);
    console.log(`ws-search-order: ${CASES.length} queries x 2 views, ${NOTICES.length} correction notices`);
    if (failures.length) { for (const f of failures) console.log('  ' + f); console.log('ws-search-order: FAIL'); process.exit(1); }
    console.log('ws-search-order: OK');
    process.exit(0);
})();
