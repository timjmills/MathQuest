// Extended smoke test covering all skills requested in the verification task.
// Reuses the runOneSkill pattern from smoke-test-session.cjs but with broader coverage.

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = process.env.MQ_BASE || 'http://localhost:8088/index.html';
const SHOT_DIR = path.join(__dirname, 'smoke-test-extended-shots');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const SKILLS = [
    // Original session list
    { id: 'write_fraction',                category: 'fractions' },
    { id: 'shade_fraction',                category: 'fractions' },
    { id: 'shape_name_match_2d',           category: 'shapes_early' },
    { id: 'shape_name_match_3d',           category: 'shapes_early' },
    { id: 'place_symmetry_lines',          category: 'angles_lines' },
    { id: 'count_sides_vertices_2d',       category: 'shapes_early' },
    { id: 'pv_disks_build',                category: 'placevalue' },
    { id: 'coordinate_q1__identify_single',  skill: 'coordinate_q1', category: 'coordinates', forceVariant: 'identify' },
    { id: 'coordinate_all__identify_single', skill: 'coordinate_all', category: 'coordinates', forceVariant: 'identify' },
    { id: 'coordinate_q1__plot',           skill: 'coordinate_q1', category: 'coordinates', forceVariant: 'plot' },
    { id: 'coordinate_all__plot',          skill: 'coordinate_all', category: 'coordinates', forceVariant: 'plot' },
    // LCM 4x to surface both variants
    { id: 'lcm__1', skill: 'lcm', category: 'number_theory' },
    { id: 'lcm__2', skill: 'lcm', category: 'number_theory' },
    { id: 'lcm__3', skill: 'lcm', category: 'number_theory' },
    { id: 'lcm__4', skill: 'lcm', category: 'number_theory' },
    { id: 'measure_angles',                category: 'angles_lines' },
    { id: 'identify_angles',               category: 'angles_lines' },
    { id: 'classify_quads',                category: 'shapes_classify' },
    { id: 'count_edges_faces_vertices',    category: 'shapes_early' },
    { id: 'volume_composite',              category: 'area_perimeter' },
    { id: 'mean',                          category: 'data_analysis' },
    { id: 'perimeter',                     category: 'area_perimeter' },
    { id: 'int_line',                      skill: 'number_line_int', category: 'integers' },
    { id: 'line_plot_fractions',           category: 'graphs' },
    // New ones requested
    { id: 'select_even_odd',               category: 'composing' },
    { id: 'select_equiv_frac',             category: 'fractions' },
    { id: 'balance_addsub',                category: 'algebra' },
    { id: 'remainder_interpret',           category: 'division' },
    { id: 'expand',                        category: 'placevalue' },
    // 2 random round_sort_*
    { id: 'round_sort_10',                 category: 'rounding' },
    { id: 'round_sort_tenths',             category: 'rounding' },
    // 2 random nearest_*
    { id: 'nearest_100',                   category: 'rounding' },
    { id: 'nearest_10000',                 category: 'rounding' },
];

const consoleEvents = [];
const skillResults = [];
let currentSkillId = '__init__';

function log(...args) { console.log('[X-SMOKE]', ...args); }

function recordSkill(id, status, detail) {
    skillResults.push({ id, status, detail: detail || '' });
    log(`  ${status} - ${id}${detail ? ' :: ' + detail : ''}`);
}

async function shot(page, name) {
    const file = path.join(SHOT_DIR, `${name}.png`);
    try {
        await page.screenshot({ path: file, fullPage: false });
    } catch (e) {
        log(`  shot failed for ${name}: ${e.message}`);
    }
}

async function waitFor(page, fn, timeout = 5000, label = 'condition') {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        try { if (await page.evaluate(fn)) return true; } catch {}
        await new Promise(r => setTimeout(r, 80));
    }
    throw new Error(`Timeout waiting for ${label}`);
}

async function submitAnyAnswer(page) {
    return await page.evaluate(() => {
        try {
            const q = window.state.currentQ;
            if (!q) return { kind: 'no-q' };
            if (q.options && q.options.length > 0 && typeof window.checkAnswer === 'function') {
                window.checkAnswer(q.options[0]);
                return { kind: 'mc-direct', submitted: q.options[0] };
            }
            if (typeof window.checkAnswer === 'function') {
                let val = q.ans;
                if (val == null) val = '0';
                if (typeof val === 'object') val = JSON.stringify(val);
                window.checkAnswer(val);
                return { kind: 'check-ans', submitted: String(val).slice(0, 80) };
            }
            return { kind: 'no-checkAnswer' };
        } catch (e) {
            return { kind: 'error', error: e.message };
        }
    });
}

async function runOneSkill(page, target) {
    currentSkillId = target.id;
    const skillToUse = target.skill || target.id;
    const category = target.category;

    log(`\n=== ${target.id} (skill=${skillToUse}, cat=${category}) ===`);

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
            const answerArea = document.getElementById('answerInput') || document.getElementById('mcButtons');
            return {
                ok: true,
                text: (q.text || '').slice(0, 100),
                answerType: q.answerType,
                hasVisual: !!q.visual,
                hasOptions: !!(q.options && q.options.length),
                variant: q._variant || q.variant || null,
                domTextLen: (txt?.textContent || '').length,
                interactiveHasContent: !!(interactive && interactive.innerHTML.trim()),
                hasAnswerArea: !!(answerArea && answerArea.innerHTML.trim()),
                qSkillId: q.skillId,
                ans: typeof q.ans === 'object' ? JSON.stringify(q.ans).slice(0, 80) : String(q.ans).slice(0, 80),
            };
        }, { skill: skillToUse, cat: category, forceVariant: target.forceVariant || null });
    } catch (e) {
        recordSkill(target.id, 'FAIL', 'evaluate-failed: ' + e.message);
        return;
    }

    if (qInfo.error) {
        recordSkill(target.id, 'FAIL', qInfo.error);
        await shot(page, target.id);
        return;
    }
    log(`  generated: text="${qInfo.text}" type=${qInfo.answerType} visual=${qInfo.hasVisual} variant=${qInfo.variant || '-'} ans=${qInfo.ans}`);

    if (qInfo.domTextLen === 0 && !qInfo.interactiveHasContent && !qInfo.hasVisual) {
        recordSkill(target.id, 'FAIL', 'no question content rendered');
        await shot(page, target.id);
        return;
    }

    await new Promise(r => setTimeout(r, 200));
    await shot(page, target.id);

    const submitInfo = await submitAnyAnswer(page);
    log(`  submit: ${JSON.stringify(submitInfo)}`);

    const navInfo = await page.evaluate(() => {
        try {
            if (window.state) {
                window.state.lastAnswerCorrect = true;
                window.state.hasAnswered = true;
            }
            const fb = document.getElementById('feedbackArea');
            if (fb) fb.style.display = 'none';
            if (typeof window.nextQuestion === 'function') {
                window.nextQuestion();
                return { kind: 'nextQuestion', ok: true };
            }
            return { kind: 'no-nav' };
        } catch (e) {
            return { kind: 'error', error: e.message };
        }
    });
    log(`  nextQ: ${JSON.stringify(navInfo)}`);

    let advanced = false;
    try {
        await waitFor(page, () => {
            const q = window.state?.currentQ;
            if (!q) return false;
            const txt = document.getElementById('questionText')?.textContent || '';
            const interactive = document.getElementById('interactiveContainer');
            return (txt.length > 0) || (interactive && interactive.innerHTML.length > 30);
        }, 3000, 'next-question rendered');
        advanced = true;
    } catch (e) {}

    if (advanced) {
        recordSkill(target.id, 'PASS', `${qInfo.answerType}${qInfo.variant ? '/' + qInfo.variant : ''}`);
    } else {
        recordSkill(target.id, 'FAIL', 'next-question did not render');
    }
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
            10000, 'window.state to exist');

        await page.evaluate(() => {
            window.state.userRole = 'teacher';
            try { localStorage.setItem('mathquest_user_role', 'teacher'); } catch {}
        });

        for (const target of SKILLS) {
            try { await runOneSkill(page, target); }
            catch (e) { recordSkill(target.id, 'FAIL', 'crash: ' + e.message); }
        }

        currentSkillId = '__done__';

        log('\n======== EXTENDED SMOKE SUMMARY ========');
        const passCount = skillResults.filter(r => r.status === 'PASS').length;
        const failCount = skillResults.filter(r => r.status === 'FAIL').length;
        for (const r of skillResults) {
            log(`${r.status.padEnd(4)}  ${r.id.padEnd(36)}  ${r.detail}`);
        }
        log(`\nTOTAL: ${passCount} PASS, ${failCount} FAIL  (of ${skillResults.length})`);

        const realErrors = consoleEvents.filter(e =>
            e.kind === 'page-error' || e.kind === 'console-error' || e.kind === 'http'
        );
        if (realErrors.length > 0) {
            log('\n!!! console / page errors observed:');
            for (const e of realErrors) {
                log(`  [${e.kind}] (${e.skillId}) ${e.text.slice(0, 200)}`);
            }
            exit = 2;
        } else {
            log('\nNo console / page errors.');
        }
        if (failCount > 0 && exit === 0) exit = 3;
        log(exit === 0 ? '\nOVERALL: PASS' : '\nOVERALL: FAIL');
    } catch (e) {
        log('!!! TEST CRASHED:', e.stack || e.message);
        exit = 1;
    } finally {
        if (browser) await browser.close();
        process.exit(exit);
    }
})();
