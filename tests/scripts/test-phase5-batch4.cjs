// Phase 5 batch 4 verification script
// Verifies all 5 new geometry-heavy MAP skills generate properly.
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });

    // net_surface_area mixes 'multiple-choice' and 'number'; leave expectedAnswerType null.
    const NEW_SKILLS = [
        { id: 'area_distributive_visual',  expectedAnswerType: 'number', expectedFormat: 'area-distributive' },
        { id: 'area_triangle',             expectedAnswerType: 'number', expectedFormat: 'area-triangle' },
        { id: 'area_polygon_decompose',    expectedAnswerType: 'number', expectedFormat: 'area-polygon-decompose' },
        { id: 'coord_polygon',             expectedAnswerType: 'number', expectedFormat: 'coord-polygon' },
        { id: 'net_surface_area',          expectedAnswerType: null,     expectedFormat: 'net-surface-area' },
    ];

    const result = await page.evaluate((NEW_SKILLS) => {
        // Build a {skillId -> categoryId} reverse map from SKILLS
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
                if (q.ans === undefined || q.ans === null || q.ans === '') { issues.push(`iter ${i}: missing ans`); allOk = false; }
                if (!q.answerType) { issues.push(`iter ${i}: missing answerType`); allOk = false; }
                if (q.printFormat !== def.expectedFormat) { issues.push(`iter ${i}: printFormat=${q.printFormat} (expected ${def.expectedFormat})`); allOk = false; }
                if (!q.skillLabel) { issues.push(`iter ${i}: missing skillLabel`); allOk = false; }

                if (def.expectedAnswerType && q.answerType !== def.expectedAnswerType) {
                    issues.push(`iter ${i}: answerType=${q.answerType} (expected ${def.expectedAnswerType})`);
                    allOk = false;
                }
                answerTypeCounts[q.answerType] = (answerTypeCounts[q.answerType] || 0) + 1;
                if (q.answerType === 'multiple-choice') {
                    if (!Array.isArray(q.options) || q.options.length < 2) {
                        issues.push(`iter ${i}: bad options`); allOk = false;
                    } else {
                        if (!q.options.some(o => String(o) === String(q.ans))) {
                            issues.push(`iter ${i}: ans (${q.ans}) not in options [${q.options.join(',')}]`); allOk = false;
                        }
                    }
                } else if (q.answerType === 'number') {
                    if (Number.isNaN(Number(q.ans))) {
                        issues.push(`iter ${i}: ans not numeric (got ${q.ans})`); allOk = false;
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

        return out;
    }, NEW_SKILLS);

    // Verify getMapSkillsForBands lookups via dynamic import (function isn't on window)
    const bandCheck = await page.evaluate(async () => {
        try {
            const mod = await import('/js/modules/data.js');
            const _35_201_210 = mod.getMapSkillsForBands(['201-210'], '35');
            const _35_221_230 = mod.getMapSkillsForBands(['221-230'], '35');
            return {
                ok: true,
                results: { _35_201_210, _35_221_230 },
                checks: {
                    '35 201-210 includes area_distributive_visual': _35_201_210.includes('area_distributive_visual'),
                    '35 221-230 includes area_triangle': _35_221_230.includes('area_triangle'),
                    '35 221-230 includes area_polygon_decompose': _35_221_230.includes('area_polygon_decompose'),
                    '35 221-230 includes coord_polygon': _35_221_230.includes('coord_polygon'),
                    '35 221-230 includes net_surface_area': _35_221_230.includes('net_surface_area'),
                }
            };
        } catch (e) {
            return { ok: false, error: e.message };
        }
    });
    result._mapBands = bandCheck;

    console.log(JSON.stringify(result, null, 2));
    console.log('\n=== Page errors during run ===');
    if (errors.length === 0) console.log('  (none)');
    else errors.forEach(e => console.log('  ' + e));

    let allPassed = true;
    for (const id of Object.keys(result)) {
        if (id.startsWith('_')) continue;
        if (!result[id].ok) allPassed = false;
    }

    // Also check map band lookup checks
    if (!bandCheck.ok) {
        console.log(`MAP band lookup FAILED: ${bandCheck.error}`);
        allPassed = false;
    } else {
        for (const [k, v] of Object.entries(bandCheck.checks)) {
            if (v !== true) { console.log(`MAP band check FAILED: ${k}`); allPassed = false; }
        }
    }

    console.log('\n=== OVERALL: ' + (allPassed ? 'PASS' : 'FAIL') + ' ===');

    await browser.close();
    process.exit(allPassed ? 0 : 1);
})();
