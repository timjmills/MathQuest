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
];

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
    } catch (e) {
        failures.push(`exception: ${e.message}`);
    } finally {
        await app.close();
    }
    const real = errors.filter((e) => !/favicon|\.woff2/.test(e));
    for (const e of real) failures.push(`console: ${e}`);
    console.log(`ws-search-order: ${CASES.length} queries x 2 views`);
    if (failures.length) { for (const f of failures) console.log('  ' + f); console.log('ws-search-order: FAIL'); process.exit(1); }
    console.log('ws-search-order: OK');
    process.exit(0);
})();
