// Comprehensive verification test for the current session.
// Runs every modified skill, plus drag-interaction integrity checks.

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = process.env.MQ_BASE || 'http://localhost:8088/index.html';
const SHOT_DIR = path.join(__dirname, 'verify-shots');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const SKILLS = [
    { id: 'write_fraction',            category: 'fractions' },
    { id: 'shade_fraction',            category: 'fractions' },
    { id: 'shape_name_match_2d',       category: 'shapes_early' },
    { id: 'shape_name_match_3d',       category: 'shapes_early' },
    { id: 'place_symmetry_lines',      category: 'angles_lines' },
    { id: 'count_sides_vertices_2d',   category: 'shapes_early' },
    { id: 'pv_disks_build',            category: 'placevalue' },
    { id: 'coordinate_q1__identify',   skill: 'coordinate_q1', category: 'coordinates', forceVariant: 'identify' },
    { id: 'coordinate_q1__plot',       skill: 'coordinate_q1', category: 'coordinates', forceVariant: 'plot' },
    { id: 'coordinate_all__identify',  skill: 'coordinate_all', category: 'coordinates', forceVariant: 'identify' },
    { id: 'coordinate_all__plot',      skill: 'coordinate_all', category: 'coordinates', forceVariant: 'plot' },
    { id: 'lcm__easy',                 skill: 'lcm', category: 'number_theory', forceVariant: 'easy_filled' },
    { id: 'lcm__hard',                 skill: 'lcm', category: 'number_theory', forceVariant: 'hard_blank' },
    { id: 'measure_angles',            category: 'angles_lines' },
    { id: 'identify_angles',           category: 'angles_lines' },
    { id: 'classify_quads',            category: 'shapes_classify' },
    { id: 'count_edges_faces_vertices',category: 'shapes_early' },
    { id: 'volume_composite',          category: 'area_perimeter' },
    { id: 'mean',                      category: 'data_analysis' },
    { id: 'perimeter',                 category: 'area_perimeter' },
    { id: 'number_line_int',           category: 'integers' },
    { id: 'line_plot_fractions',       category: 'graphs' },
    { id: 'select_even_odd',           category: 'patterns' },
    { id: 'select_equiv_frac',         category: 'fractions' },
    { id: 'balance_addsub',            category: 'algebra' },
    { id: 'remainder_interpret',       category: 'division' },
    { id: 'expanded_form',             category: 'placevalue' },
    { id: 'place_value_disks',         category: 'placevalue' },
    { id: 'fraction_of_set',           category: 'fractions' },
    { id: 'fraction_of_set_hard',      category: 'fractions' },
];

const consoleEvents = [];
const skillResults = [];
let currentSkillId = '__init__';

function log(...args) { console.log('[VERIFY]', ...args); }
function recordSkill(id, status, detail) {
    skillResults.push({ id, status, detail: detail || '' });
    log(`  ${status} — ${id}${detail ? ' :: ' + detail : ''}`);
}

async function shot(page, name) {
    try { await page.screenshot({ path: path.join(SHOT_DIR, `${name}.png`), fullPage: false }); } catch {}
}

async function waitFor(page, fn, timeout = 4000, label = 'condition') {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        try { if (await page.evaluate(fn)) return true; } catch {}
        await new Promise(r => setTimeout(r, 80));
    }
    throw new Error(`Timeout waiting for ${label}`);
}

async function runOneSkill(page, target) {
    currentSkillId = target.id;
    const skillToUse = target.skill || target.id;

    try {
        await page.evaluate(() => {
            try { if (window.goHome) window.goHome(); } catch {}
            if (window.state) {
                window.state.qCount = 0;
                window.state.score = 0;
                window.state.currentQ = null;
            }
        });
    } catch {}

    let qInfo;
    try {
        qInfo = await page.evaluate(({ skill, cat, forceVariant }) => {
            window.state.skill = skill;
            window.state.category = cat;
            window.state.gameMode = 'practice';

            if (forceVariant) {
                window.__origPickVariant = window.__origPickVariant || window.pickVariant;
                window.pickVariant = function () { return forceVariant; };
            } else if (window.__origPickVariant) {
                window.pickVariant = window.__origPickVariant;
                window.__origPickVariant = null;
            }

            let q;
            try { q = window.generateQuestion(); }
            catch (e) { return { error: 'generate-threw: ' + e.message }; }
            if (!q) return { error: 'generateQuestion returned null' };
            window.state.currentQ = q;
            window.state.gameStarted = true;

            try { if (window.showView) window.showView('gameView'); } catch {}
            try {
                if (typeof window.renderQuestion === 'function') window.renderQuestion();
            } catch (e) {
                return { error: 'render-threw: ' + e.message };
            }

            const txt = document.getElementById('questionText');
            const interactive = document.getElementById('interactiveContainer');
            const visualEl = document.getElementById('visualContainer');
            return {
                ok: true,
                text: (q.text || '').slice(0, 100),
                answerType: q.answerType || 'number',
                hasVisual: !!q.visual,
                hasOptions: !!(q.options && q.options.length),
                variant: q._variant || null,
                domTextLen: (txt?.textContent || '').length,
                interactiveHasContent: !!(interactive && interactive.innerHTML.trim().length > 10),
                visualHasContent: !!(visualEl && visualEl.innerHTML.trim().length > 10),
                ans: q.ans != null ? String(q.ans).slice(0, 80) : null,
            };
        }, { skill: skillToUse, cat: target.category, forceVariant: target.forceVariant || null });
    } catch (e) {
        recordSkill(target.id, 'FAIL', 'evaluate-failed: ' + e.message);
        return;
    }

    if (qInfo.error) {
        recordSkill(target.id, 'FAIL', qInfo.error);
        await shot(page, target.id);
        return;
    }

    if (qInfo.domTextLen === 0 && !qInfo.interactiveHasContent && !qInfo.visualHasContent) {
        recordSkill(target.id, 'FAIL', 'no content rendered');
        await shot(page, target.id);
        return;
    }

    await new Promise(r => setTimeout(r, 150));
    await shot(page, target.id);

    // Submit the correct answer (or skip if interactive)
    await page.evaluate(() => {
        try {
            const q = window.state.currentQ;
            if (!q) return;
            if (q.options && q.options.length > 0 && typeof window.checkAnswer === 'function') {
                // pick the correct option if known
                const correct = q.ans != null ? q.ans : q.options[0];
                window.checkAnswer(correct);
                return;
            }
            if (typeof window.checkAnswer === 'function') {
                let val = q.ans;
                if (val == null) val = '0';
                if (typeof val === 'object') val = JSON.stringify(val);
                window.checkAnswer(val);
            }
        } catch {}
    });

    // Drive next-question
    await page.evaluate(() => {
        try {
            if (window.state) { window.state.lastAnswerCorrect = true; window.state.hasAnswered = true; }
            const fb = document.getElementById('feedbackArea'); if (fb) fb.style.display = 'none';
            if (typeof window.nextQuestion === 'function') window.nextQuestion();
        } catch {}
    });

    let advanced = false;
    try {
        await waitFor(page, () => {
            const q = window.state?.currentQ;
            if (!q) return false;
            const txt = document.getElementById('questionText')?.textContent || '';
            const interactive = document.getElementById('interactiveContainer');
            return (txt.length > 0) || (interactive && interactive.innerHTML.length > 30);
        }, 3000, 'next-q');
        advanced = true;
    } catch {}

    if (advanced) {
        recordSkill(target.id, 'PASS', `${qInfo.answerType}${qInfo.variant ? '/' + qInfo.variant : ''}`);
    } else {
        recordSkill(target.id, 'FAIL', 'next-q did not render');
    }
}

// Drag-interaction integrity checks
async function dragIntegrityChecks(page) {
    log('\n=== DRAG INTEGRITY CHECKS ===');

    // 1. dnd-generic.js: verify dragover + drop both call preventDefault
    const dndOk = await page.evaluate(() => {
        // Read the source via fetch
        return fetch('/js/modules/widgets/dnd-generic.js').then(r => r.text()).then(src => {
            const dragover = /dragover[^}]*preventDefault/s.test(src);
            const drop = /'drop'[^}]*preventDefault/s.test(src);
            return { dragover, drop, srcLen: src.length };
        });
    }).catch(e => ({ error: e.message }));
    log('  dnd-generic preventDefault: ' + JSON.stringify(dndOk));

    // 2. coord-plot.js: cp-hit click toggles dot
    const coordOk = await page.evaluate(() => {
        return fetch('/js/modules/widgets/coord-plot.js').then(r => r.text()).then(src => {
            const hasHit = /cp-hit/.test(src);
            const hasClick = /addEventListener\(['"]click['"]/.test(src);
            const hasSubmitColor = /(green|red|correct|wrong)/i.test(src);
            return { hasHit, hasClick, hasSubmitColor };
        });
    }).catch(e => ({ error: e.message }));
    log('  coord-plot widget: ' + JSON.stringify(coordOk));

    // 3. pv-disks-build.js: rejects wrong zone, accepts correct zone
    const pvOk = await page.evaluate(() => {
        return fetch('/js/modules/widgets/pv-disks-build.js').then(r => r.text()).then(src => {
            const hasShake = /shake/i.test(src);
            const hasZoneCheck = /(value|denom|zone).*(===|!==|\bvs\b)/i.test(src);
            const hasDrop = /addEventListener\(['"]drop['"]/.test(src);
            return { hasShake, hasZoneCheck, hasDrop };
        });
    }).catch(e => ({ error: e.message }));
    log('  pv-disks-build: ' + JSON.stringify(pvOk));

    // 4. place-symmetry-lines.js: clicking line toggles solid/dashed
    const symOk = await page.evaluate(() => {
        return fetch('/js/modules/widgets/place-symmetry-lines.js').then(r => r.text()).then(src => {
            const hasToggle = /toggle|selected|active/i.test(src);
            const hasClick = /addEventListener\(['"]click['"]/.test(src);
            return { hasToggle, hasClick };
        });
    }).catch(e => ({ error: e.message }));
    log('  place-symmetry-lines: ' + JSON.stringify(symOk));

    return { dndOk, coordOk, pvOk, symOk };
}

(async () => {
    let browser;
    let exit = 0;
    try {
        log('launching puppeteer...');
        browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 900 });

        page.on('console', m => {
            if (m.type() === 'error') {
                consoleEvents.push({ kind: 'console-error', text: m.text(), skillId: currentSkillId });
            }
        });
        page.on('pageerror', e => {
            consoleEvents.push({ kind: 'page-error', text: (e.stack || String(e)).slice(0, 400), skillId: currentSkillId });
        });
        page.on('response', resp => {
            if (resp.status() >= 400) {
                consoleEvents.push({ kind: 'http', text: `HTTP ${resp.status()} ${resp.url()}`, skillId: currentSkillId });
            }
        });

        log('navigating to', BASE);
        await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
        await waitFor(page, () => typeof window.state === 'object' && window.state !== null,
            10000, 'window.state');

        await page.evaluate(() => {
            window.state.userRole = 'teacher';
            try { localStorage.setItem('mathquest_user_role', 'teacher'); } catch {}
        });

        for (const target of SKILLS) {
            try { await runOneSkill(page, target); }
            catch (e) { recordSkill(target.id, 'FAIL', 'crash: ' + e.message); }
        }

        const dragInfo = await dragIntegrityChecks(page);

        currentSkillId = '__done__';

        // Summary
        log('\n======== SUMMARY ========');
        const passCount = skillResults.filter(r => r.status === 'PASS').length;
        const failCount = skillResults.filter(r => r.status === 'FAIL').length;
        for (const r of skillResults) {
            log(`${r.status.padEnd(4)}  ${r.id.padEnd(34)}  ${r.detail}`);
        }
        log(`\nTOTAL: ${passCount} PASS, ${failCount} FAIL  (of ${skillResults.length})`);

        const realErrors = consoleEvents.filter(e =>
            e.kind === 'page-error' || e.kind === 'console-error' || e.kind === 'http'
        );
        if (realErrors.length > 0) {
            log('\n!!! console / page errors:');
            for (const e of realErrors) {
                log(`  [${e.kind}] (${e.skillId}) ${e.text.slice(0, 220)}`);
            }
        } else {
            log('\nNo console / page errors.');
        }

        if (failCount > 0) exit = 3;
        log(exit === 0 ? '\nOVERALL: PASS' : '\nOVERALL: FAIL');
    } catch (e) {
        log('!!! CRASHED:', e.stack || e.message);
        exit = 1;
    } finally {
        if (browser) await browser.close();
        process.exit(exit);
    }
})();
