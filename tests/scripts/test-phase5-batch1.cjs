// Phase 5 batch 1 verification script
// Verifies all 7 new K-2 MAP early-band skills generate properly.
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });

    // Note: numeric MC options are stripped post-generation by generate-question.js (text MC preserved).
    // So skills with numeric MC end up as `text` answerType at runtime.
    const NEW_SKILLS = [
        { id: 'add_5_pictures', expectedAnswerType: 'text', expectedFormat: 'add-5-pictures' },
        { id: 'sub_5_pictures', expectedAnswerType: 'text', expectedFormat: 'sub-5-pictures' },
        { id: 'heavier_lighter_visual', expectedAnswerType: 'multiple-choice', expectedFormat: 'heavier-lighter' },
        { id: 'pictograph_intro', expectedAnswerType: 'number', expectedFormat: 'pictograph-intro' },
        { id: 'tens_foundation_visual', expectedAnswerType: 'number', expectedFormat: 'tens-foundation' },
        { id: 'bar_graph_intro', expectedAnswerType: null /* number OR multiple-choice */, expectedFormat: 'bar-graph-intro' },
        { id: 'shape_corners_count', expectedAnswerType: 'number', expectedFormat: 'shape-corners' },
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
                if (q.ans === undefined || q.ans === null) { issues.push(`iter ${i}: missing ans`); allOk = false; }
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
                        // ans must match one option
                        if (!q.options.some(o => String(o) === String(q.ans))) {
                            issues.push(`iter ${i}: ans (${q.ans}) not in options [${q.options.join(',')}]`); allOk = false;
                        }
                    }
                } else if (q.answerType === 'number') {
                    if (Number.isNaN(Number(q.ans))) {
                        issues.push(`iter ${i}: ans not numeric`); allOk = false;
                    }
                }

                seenAnswers.add(String(q.ans));
                if (samples.length < 3) {
                    samples.push({
                        text: (q.text || '').substring(0, 80),
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

        // Verification step 5: skills are present in SKILLS so getMapSkillsForBands picks them up.
        // Inline simulation since getMapSkillsForBands isn't exposed on window.
        // The plan's RIT_BAND_SKILLS_K2['141-150'] includes the 4 lowest-band new skills,
        // and ['151-160'] includes the 3 mid-K new skills.
        const expected_141 = ['add_5_pictures', 'sub_5_pictures', 'heavier_lighter_visual', 'pictograph_intro'];
        const expected_151 = ['tens_foundation_visual', 'bar_graph_intro', 'shape_corners_count'];
        out._mapBands = {
            // For each expected ID, present means: (a) found in SKILLS via catMap, (b) generation works
            band_141_150_present: expected_141.filter(id => !!catMap[id] && out[id] && out[id].ok),
            band_141_150_missing: expected_141.filter(id => !catMap[id] || !(out[id] && out[id].ok)),
            band_151_160_present: expected_151.filter(id => !!catMap[id] && out[id] && out[id].ok),
            band_151_160_missing: expected_151.filter(id => !catMap[id] || !(out[id] && out[id].ok)),
        };
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
    console.log('\n=== OVERALL: ' + (allPassed ? 'PASS' : 'FAIL') + ' ===');

    await browser.close();
    process.exit(allPassed ? 0 : 1);
})();
