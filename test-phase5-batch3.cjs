// Phase 5 batch 3 verification script
// Verifies all 7 new mid-to-high band MAP skills generate properly.
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });

    // Note: numeric MC options are stripped post-generation by generate-question.js (text MC preserved).
    // Box-plot-intro and histogram-read use both numeric and MC paths so we leave expectedAnswerType null.
    const NEW_SKILLS = [
        { id: 'perimeter_intro',       expectedAnswerType: 'number', expectedFormat: 'perimeter-intro' },
        { id: 'unit_conversion_word',  expectedAnswerType: 'number', expectedFormat: 'unit-conversion-word' },
        { id: 'box_plot_intro',        expectedAnswerType: null,     expectedFormat: 'box-plot-intro' },
        { id: 'histogram_read',        expectedAnswerType: null,     expectedFormat: 'histogram-read' },
        { id: 'ratio_intro',           expectedAnswerType: 'text',   expectedFormat: 'ratio-intro' },
        { id: 'unit_rate_intro',       expectedAnswerType: 'number', expectedFormat: 'unit-rate-intro' },
        { id: 'double_num_line',       expectedAnswerType: 'number', expectedFormat: 'double-num-line' },
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
            const k2_161_170 = mod.getMapSkillsForBands(['161-170'], 'k2');
            const _35_201_210 = mod.getMapSkillsForBands(['201-210'], '35');
            const _35_211_220 = mod.getMapSkillsForBands(['211-220'], '35');
            const _35_221_230 = mod.getMapSkillsForBands(['221-230'], '35');
            return {
                ok: true,
                results: { k2_161_170, _35_201_210, _35_211_220, _35_221_230 },
                checks: {
                    'k2 161-170 includes perimeter_intro': k2_161_170.includes('perimeter_intro'),
                    '35 201-210 includes unit_conversion_word': _35_201_210.includes('unit_conversion_word'),
                    '35 211-220 includes box_plot_intro': _35_211_220.includes('box_plot_intro'),
                    '35 221-230 includes ratio_intro': _35_221_230.includes('ratio_intro'),
                    '35 221-230 includes unit_rate_intro': _35_221_230.includes('unit_rate_intro'),
                    '35 221-230 includes double_num_line': _35_221_230.includes('double_num_line'),
                    '35 221-230 includes histogram_read': _35_221_230.includes('histogram_read'),
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
