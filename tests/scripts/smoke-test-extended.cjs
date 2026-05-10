// Extended smoke test covering all skills requested in the verification task.
// More defensive than v1 — handles dialogs, avoids goHome (which has caused
// detached-frame errors in headless mode), and refreshes the page if a frame
// goes stale.

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = process.env.MQ_BASE || 'http://localhost:8088/index.html';
const SHOT_DIR = path.join(__dirname, 'smoke-test-extended-shots');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const SKILLS = [
    { id: 'write_fraction',                category: 'fractions' },
    { id: 'shade_fraction',                category: 'fractions' },
    { id: 'shape_name_match_2d',           category: 'shapes_early' },
    { id: 'shape_name_match_3d',           category: 'shapes_early' },
    { id: 'place_symmetry_lines',          category: 'angles_lines' },
    { id: 'count_sides_vertices_2d',       category: 'shapes_early' },
    { id: 'pv_disks_build',                category: 'placevalue' },
    { id: 'coordinate_q1__identify',  skill: 'coordinate_q1', category: 'coordinates', forceVariant: 'identify' },
    { id: 'coordinate_all__identify', skill: 'coordinate_all', category: 'coordinates', forceVariant: 'identify' },
    { id: 'coordinate_q1__plot',      skill: 'coordinate_q1', category: 'coordinates', forceVariant: 'plot' },
    { id: 'coordinate_all__plot',     skill: 'coordinate_all', category: 'coordinates', forceVariant: 'plot' },
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
    { id: 'select_even_odd',               category: 'composing' },
    { id: 'select_equiv_frac',             category: 'fractions' },
    { id: 'balance_addsub',                category: 'algebra' },
    { id: 'remainder_interpret',           category: 'division' },
    { id: 'expand',                        category: 'placevalue' },
    { id: 'round_sort_10',                 category: 'rounding' },
    { id: 'round_sort_tenths',             category: 'rounding' },
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
    try { await page.screenshot({ path: file, fullPage: false }); }
    catch (e) { log(`  shot failed for ${name}: ${e.message}`); }
}

async function setupPage(browser) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    page.on('dialog', async d => { try { await d.accept(); } catch {} });
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
    await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.evaluate(() => {
        return new Promise(r => {
            const t = setInterval(() => {
                if (window.state && window.generateQuestion) { clearInterval(t); r(); }
            }, 50);
        });
    });
    await page.evaluate(() => {
        window.state.userRole = 'teacher';
        try { localStorage.setItem('mathquest_user_role', 'teacher'); } catch {}
        // Disable banner/timer/idle stuff
        try { window.stopBannerTimer && window.stopBannerTimer(); } catch {}
        try { window.stopSessionTimer && window.stopSessionTimer(); } catch {}
    });
    return page;
}

async function runOneSkill(page, target) {
    currentSkillId = target.id;
    const skillToUse = target.skill || target.id;
    const category = target.category;
    log(`\n=== ${target.id} (skill=${skillToUse}, cat=${category}) ===`);

    // Reset state lightly without invoking goHome (which can navigate / open dialogs)
    try {
        await page.evaluate(() => {
            if (window.state) {
                window.state.qCount = 0;
                window.state.score = 0;
                window.state.currentQ = null;
                window.state.hasAnswered = false;
                window.state.lastAnswerCorrect = false;
                window.state.gameStarted = false;
            }
            // Hide any visible feedback / modal
            document.querySelectorAll('.modal-overlay.active, .modal.active').forEach(el => el.classList.remove('active'));
            const fb = document.getElementById('feedbackArea');
            if (fb) { fb.style.display = 'none'; fb.className = 'feedback-area'; }
        });
    } catch (e) {
        return recordSkill(target.id, 'FAIL', 'reset-failed: ' + e.message);
    }

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
            } catch (e) { return { error: 'render-threw: ' + e.message }; }
            const txt = document.getElementById('questionText');
            const interactive = document.getElementById('interactiveContainer');
            const visualAid = document.getElementById('visualAid');
            const answerInputArea = document.getElementById('answerInputArea');
            const answerOptions = document.getElementById('answerOptions');
            return {
                ok: true,
                text: (q.text || '').slice(0, 100),
                answerType: q.answerType,
                hasVisual: !!q.visual,
                hasOptions: !!(q.options && q.options.length),
                variant: q._variant || q.variant || null,
                domTextLen: (txt?.textContent || '').length,
                interactiveHasContent: !!(interactive && interactive.innerHTML.trim().length > 30),
                visualHasContent: !!(visualAid && visualAid.innerHTML.trim().length > 10),
                hasAnswerArea: !!((answerInputArea && answerInputArea.innerHTML.trim()) || (answerOptions && answerOptions.innerHTML.trim())),
                qSkillId: q.skillId,
                ans: typeof q.ans === 'object' ? JSON.stringify(q.ans).slice(0, 80) : String(q.ans).slice(0, 80),
            };
        }, { skill: skillToUse, cat: category, forceVariant: target.forceVariant || null });
    } catch (e) {
        return recordSkill(target.id, 'FAIL', 'evaluate-failed: ' + e.message);
    }

    if (qInfo.error) {
        recordSkill(target.id, 'FAIL', qInfo.error);
        await shot(page, target.id);
        return;
    }
    log(`  generated: text="${qInfo.text}" type=${qInfo.answerType} visual=${qInfo.hasVisual} variant=${qInfo.variant || '-'} ans=${qInfo.ans} answerArea=${qInfo.hasAnswerArea}`);

    if (qInfo.domTextLen === 0 && !qInfo.interactiveHasContent && !qInfo.visualHasContent) {
        recordSkill(target.id, 'FAIL', 'no question content rendered');
        await shot(page, target.id);
        return;
    }
    // Common-gap warning: answerType but no answer area + no visual
    if (qInfo.answerType && !qInfo.hasAnswerArea && !qInfo.interactiveHasContent && !qInfo.visualHasContent) {
        log(`  WARN: answerType=${qInfo.answerType} but no answer area or interactive/visual content`);
    }

    await new Promise(r => setTimeout(r, 100));
    await shot(page, target.id);

    // Try to advance via nextQuestion (with state.lastAnswerCorrect spoofed)
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

    let advanced = false;
    const start = Date.now();
    while (Date.now() - start < 2000) {
        try {
            const ok = await page.evaluate(() => {
                const q = window.state?.currentQ;
                if (!q) return false;
                const txt = document.getElementById('questionText')?.textContent || '';
                const interactive = document.getElementById('interactiveContainer');
                return (txt.length > 0) || (interactive && interactive.innerHTML.length > 30);
            });
            if (ok) { advanced = true; break; }
        } catch (e) {
            // detached frame — bail
            log(`  navInfo wait: ${e.message.slice(0, 80)}`);
            break;
        }
        await new Promise(r => setTimeout(r, 80));
    }

    if (advanced) {
        recordSkill(target.id, 'PASS', `${qInfo.answerType}${qInfo.variant ? '/' + qInfo.variant : ''}`);
    } else {
        recordSkill(target.id, 'FAIL', `next-question did not render (nav=${JSON.stringify(navInfo).slice(0, 80)})`);
    }
}

(async () => {
    let browser;
    let exit = 0;
    try {
        log('launching puppeteer...');
        browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
        let page = await setupPage(browser);

        for (const target of SKILLS) {
            try { await runOneSkill(page, target); }
            catch (e) {
                recordSkill(target.id, 'FAIL', 'crash: ' + e.message);
                // If the page crashed, recreate
                if (/detached|Target closed|Frame|Session closed/i.test(e.message)) {
                    log('  recreating page after frame crash...');
                    try { await page.close(); } catch {}
                    page = await setupPage(browser);
                }
            }
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
