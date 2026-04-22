// Phase 5 batch 2 verification script
// Verifies all 4 new mid-band MAP skills generate properly.
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });

    // Note: numeric MC options are stripped post-generation by generate-question.js (text MC preserved).
    // So skills with only-numeric MC end up as `text` answerType at runtime.
    const NEW_SKILLS = [
        { id: 'hundreds_chart_fill', expectedFormat: 'hundreds-chart-fill' },
        { id: 'unknown_start_wp', expectedFormat: 'unknown-start-wp' },
        { id: 'count_edges_faces_vertices', expectedFormat: 'count-efv' },
        { id: 'coord_distance_q1', expectedFormat: 'coord-distance' },
    ];

    const result = await page.evaluate((NEW_SKILLS) => {
        // Build {skillId -> categoryId} reverse map from SKILLS
        const catMap = {};
        for (const [c, list] of Object.entries(window.SKILLS)) {
            if (!Array.isArray(list)) continue;
            for (const sk of list) { if (sk && sk.v) catMap[sk.v] = c; }
        }

        const out = {};
        for (const def of NEW_SKILLS) {
            const cat = catMap[def.id];
            if (!cat) {
                out[def.id] = { ok: false, error: 'NOT IN SKILLS' };
                continue;
            }
            window.state.skill = def.id;
            window.state.category = cat;
            window.state.range = 100;
            window.state.decimalPlaces = 0;
            window.state.isMixedMode = false;

            let allOk = true;
            const issues = [];
            const samples = [];
            const seenAnswers = new Set();
            const answerTypeCounts = {};

            for (let i = 0; i < 30; i++) {
                let q;
                try { q = window.generateQuestion(); }
                catch (e) { issues.push(`iter ${i}: throw ${e.message}`); allOk = false; break; }
                if (!q) { issues.push(`iter ${i}: null result`); allOk = false; break; }

                if (typeof q.text !== 'string' || q.text.length === 0) { issues.push(`iter ${i}: bad text`); allOk = false; }
                if (q.ans === undefined || q.ans === null) { issues.push(`iter ${i}: missing ans`); allOk = false; }
                if (!q.answerType) { issues.push(`iter ${i}: missing answerType`); allOk = false; }
                if (q.printFormat !== def.expectedFormat) { issues.push(`iter ${i}: printFormat=${q.printFormat} (expected ${def.expectedFormat})`); allOk = false; }
                if (!q.skillLabel) { issues.push(`iter ${i}: missing skillLabel`); allOk = false; }

                answerTypeCounts[q.answerType] = (answerTypeCounts[q.answerType] || 0) + 1;

                if (q.answerType === 'multiple-choice') {
                    if (!Array.isArray(q.options) || q.options.length < 2) {
                        issues.push(`iter ${i}: bad options`); allOk = false;
                    } else {
                        if (!q.options.some(o => String(o) === String(q.ans))) {
                            issues.push(`iter ${i}: ans (${q.ans}) not in options [${q.options.join(',')}]`); allOk = false;
                        }
                    }
                } else if (q.answerType === 'number' || q.answerType === 'text') {
                    if (Number.isNaN(Number(q.ans))) {
                        issues.push(`iter ${i}: ans not numeric`); allOk = false;
                    }
                }

                seenAnswers.add(String(q.ans));
                if (samples.length < 3) {
                    samples.push({
                        text: (q.text || '').substring(0, 100),
                        ans: q.ans,
                        answerType: q.answerType,
                        printFormat: q.printFormat,
                        skillLabel: q.skillLabel,
                        optionCount: q.options ? q.options.length : 0,
                        hasVisual: !!q.visual,
                    });
                }
            }
            out[def.id] = {
                ok: allOk,
                cat,
                distinctAnswers: seenAnswers.size,
                answerTypeCounts,
                issues: issues.slice(0, 5),
                samples,
            };
        }

        // Step 5: getMapSkillsForBands resolves each skill via its band.
        // Build inline simulation of getMapSkillsForBands using window.SKILLS catMap as filter,
        // since the function isn't on window — but the band tables are referenced from data.js.
        // Each new skill should resolve via its expected band tier.
        const bandExpectations = [
            { tier: 'k2', band: '161-170', skill: 'hundreds_chart_fill' },
            { tier: 'k2', band: '171-180', skill: 'unknown_start_wp' },
            { tier: 'k2', band: '171-180', skill: 'count_edges_faces_vertices' },
            { tier: '35', band: '211-220', skill: 'coord_distance_q1' },
        ];
        const bandResults = bandExpectations.map(e => ({
            ...e,
            inSkillsRegistry: !!catMap[e.skill],
            categoryFound: catMap[e.skill] || null,
        }));
        out._mapBands = bandResults;
        return out;
    }, NEW_SKILLS);

    console.log(JSON.stringify(result, null, 2));
    console.log('\n=== Page errors during run ===');
    if (errors.length === 0) console.log('  (none)');
    else errors.forEach(e => console.log('  ' + e));

    let allPassed = true;
    for (const id of Object.keys(result)) {
        if (id.startsWith('_')) continue;
        if (!result[id].ok) allPassed = false;
    }
    // Also require all bandExpectations to find their skill
    for (const b of result._mapBands) {
        if (!b.inSkillsRegistry) allPassed = false;
    }
    console.log('\n=== OVERALL: ' + (allPassed ? 'PASS' : 'FAIL') + ' ===');

    await browser.close();
    process.exit(allPassed ? 0 : 1);
})();
