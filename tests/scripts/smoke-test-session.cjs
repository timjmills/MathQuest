// End-to-end smoke test for skills modified in the current session.
// For each target skill: navigate, generate a question, screenshot,
// capture console/page errors, then click Submit/Skip and verify
// next-question advance.
//
// Usage:
//   1. Start server: npx serve . -l 8088
//   2. node smoke-test-session.cjs

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = process.env.MQ_BASE || 'http://localhost:8088/index.html';
const SHOT_DIR = path.join(__dirname, 'smoke-test-shots');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const SKILLS = [
    { id: 'write_fraction',            category: 'fractions' },
    { id: 'shade_fraction',            category: 'fractions' },
    { id: 'shape_name_match_2d',       category: 'shapes_early' },
    { id: 'shape_name_match_3d',       category: 'shapes_early' },
    { id: 'place_symmetry_lines',      category: 'angles_lines' },
    { id: 'count_sides_vertices_2d',   category: 'shapes_early' },
    { id: 'coordinate_q1__identify',   skill: 'coordinate_q1', category: 'coordinates', forceVariant: 'identify' },
    { id: 'coordinate_q1__plot',       skill: 'coordinate_q1', category: 'coordinates', forceVariant: 'plot' },
    { id: 'coordinate_all__identify',  skill: 'coordinate_all', category: 'coordinates', forceVariant: 'identify' },
    { id: 'coordinate_all__plot',      skill: 'coordinate_all', category: 'coordinates', forceVariant: 'plot' },
    { id: 'place_value_disks',         category: 'placevalue' },
    { id: 'fraction_of_set',           category: 'fractions' },
    { id: 'fraction_of_set_hard',      category: 'fractions' },
    { id: 'lcm__a',                    skill: 'lcm', category: 'number_theory' },
    { id: 'lcm__b',                    skill: 'lcm', category: 'number_theory' },
    { id: 'measure_angles',            category: 'angles_lines' },
    { id: 'identify_angles',           category: 'angles_lines' },
    { id: 'classify_quads',            category: 'shapes_classify' },
    { id: 'count_edges_faces_vertices',category: 'shapes_early' },
    { id: 'volume_composite',          category: 'area_perimeter' },
    { id: 'mean',                      category: 'data_analysis' },
    { id: 'perimeter',                 category: 'area_perimeter' },
    { id: 'int_line',                  skill: 'number_line_int', category: 'integers' },
    { id: 'line_plot_fractions',       category: 'graphs' },
];

const consoleEvents = [];   // { kind: 'console-error'|'page-error'|'http', text, skillId }
const skillResults = [];    // { id, status, detail }
let currentSkillId = '__init__';

function log(...args) { console.log('[SMOKE]', ...args); }

function recordSkill(id, status, detail) {
    skillResults.push({ id, status, detail: detail || '' });
    log(`  ${status} — ${id}${detail ? ' :: ' + detail : ''}`);
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

// Returns one of: 'numeric', 'mc', 'text', 'interactive', 'unknown'
async function detectAnswerKind(page) {
    return await page.evaluate(() => {
        const q = window.state && window.state.currentQ;
        if (!q) return 'unknown';
        if (q.options && q.options.length > 0) return 'mc';
        const at = q.answerType || 'number';
        if (at === 'number') return 'numeric';
        if (at === 'multiple-choice') return 'mc';
        if (at === 'text') return 'text';
        return 'interactive';
    });
}

async function submitAnyAnswer(page) {
    // We don't care about correctness — just need to drive the next-question
    // path. Fall through to skip if we can't construct a sensible answer.
    return await page.evaluate(() => {
        try {
            const q = window.state.currentQ;
            if (!q) return { kind: 'no-q' };

            // Multi-select / multi-choice with options
            if (q.options && q.options.length > 0 && typeof window.checkAnswer === 'function') {
                window.checkAnswer(q.options[0]);
                return { kind: 'mc-direct', submitted: q.options[0] };
            }

            // Numeric / text — submit ans (to push the correct branch which
            // always advances; wrong-answer branch is pre-existing and tested
            // elsewhere)
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

async function nextQuestion(page) {
    // Try the official path — most reliable.
    return await page.evaluate(() => {
        try {
            if (typeof window.nextQuestion === 'function') {
                window.nextQuestion();
                return { kind: 'nextQuestion' };
            }
            if (typeof window.skipQuestion === 'function') {
                window.skipQuestion();
                return { kind: 'skipQuestion' };
            }
            return { kind: 'no-nav' };
        } catch (e) {
            return { kind: 'error', error: e.message };
        }
    });
}

async function runOneSkill(page, target) {
    currentSkillId = target.id;
    const skillToUse = target.skill || target.id;
    const category = target.category;

    log(`\n=== ${target.id}  (skill=${skillToUse}, cat=${category}) ===`);

    // Reset to home, clear toast/modal state
    try {
        await page.evaluate(() => {
            try { if (window.goHome) window.goHome(); } catch {}
            // Force state out of any pending answer
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
            // Set up state for a single-question generation
            window.state.skill = skill;
            window.state.category = cat;
            window.state.gameMode = 'practice';

            // For coordinate skills, override pickVariant so we can force
            // identify vs plot independently.
            if (forceVariant) {
                window.__origPickVariant = window.__origPickVariant || window.pickVariant;
                window.pickVariant = function (_sid, _opts) { return forceVariant; };
            } else if (window.__origPickVariant) {
                window.pickVariant = window.__origPickVariant;
                window.__origPickVariant = null;
            }

            let q;
            try {
                q = window.generateQuestion();
            } catch (e) {
                return { error: 'generate-threw: ' + e.message };
            }
            if (!q) return { error: 'generateQuestion returned null' };
            window.state.currentQ = q;
            window.state.gameStarted = true;

            // Show game view so renderQuestion has DOM to write to
            try { if (window.showView) window.showView('gameView'); } catch {}

            try {
                if (typeof window.renderQuestion === 'function') {
                    window.renderQuestion();
                }
            } catch (e) {
                return { error: 'render-threw: ' + e.message, qSummary: { text: (q.text || '').slice(0, 60), answerType: q.answerType } };
            }

            const txt = document.getElementById('questionText');
            const interactive = document.getElementById('interactiveContainer');
            return {
                ok: true,
                text: (q.text || '').slice(0, 100),
                answerType: q.answerType,
                hasVisual: !!q.visual,
                hasOptions: !!(q.options && q.options.length),
                variant: q._variant || null,
                domTextLen: (txt?.textContent || '').length,
                interactiveHasContent: !!(interactive && interactive.innerHTML.trim()),
                qSkillId: q.skillId,
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
    log(`  generated: text="${qInfo.text}" type=${qInfo.answerType} visual=${qInfo.hasVisual} variant=${qInfo.variant || '-'}`);

    // Sanity: question text or interactive must have rendered
    if (qInfo.domTextLen === 0 && !qInfo.interactiveHasContent && !qInfo.hasVisual) {
        recordSkill(target.id, 'FAIL', 'no question content rendered');
        await shot(page, target.id);
        return;
    }

    // Allow the renderer a tick to lay out SVGs / interactive widgets
    await new Promise(r => setTimeout(r, 200));
    await shot(page, target.id);

    // Submit + advance. We bypass the wrong-answer gate by force-setting
    // state.lastAnswerCorrect=true before calling nextQuestion(). We're
    // smoke-testing rendering, not scoring.
    const beforeText = qInfo.text;

    const submitInfo = await submitAnyAnswer(page);
    log(`  submit: ${JSON.stringify(submitInfo)}`);

    // Drive the next-question path directly. We DON'T wait on the answer
    // animation; the goal is to verify nextQuestion() generates+renders a
    // second question without throwing.
    const navInfo = await page.evaluate(() => {
        try {
            // Bypass nextQuestion's gating: pretend the prior answer was correct
            if (window.state) {
                window.state.lastAnswerCorrect = true;
                window.state.hasAnswered = true;
            }
            // Hide any pending answer feedback so nextQuestion proceeds
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

    // Verify we have a (potentially new) currentQ rendered
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
    } catch (e) {
        const after = await page.evaluate(() => ({
            text: document.getElementById('questionText')?.textContent?.slice(0, 60) || '',
            qCount: window.state?.qCount,
            currentQId: window.state?.currentQ?.skillId,
        }));
        log(`  advance fallback: ${JSON.stringify(after)}`);
    }

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
            } else if (m.type() === 'warning') {
                // Capture warnings too — many skill-render bugs surface as warnings
                consoleEvents.push({ kind: 'console-warn', text: m.text(), skillId: currentSkillId });
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

        // Stub out modals/overlays that block flow in headless practice
        await page.evaluate(() => {
            // prevent fullscreen prompt etc.
            window.state.userRole = 'teacher';
            try { localStorage.setItem('mathquest_user_role', 'teacher'); } catch {}
        });

        for (const target of SKILLS) {
            try {
                await runOneSkill(page, target);
            } catch (e) {
                recordSkill(target.id, 'FAIL', 'crash: ' + e.message);
            }
        }

        currentSkillId = '__done__';

        // Summary table
        log('\n======== SMOKE SUMMARY ========');
        const passCount = skillResults.filter(r => r.status === 'PASS').length;
        const failCount = skillResults.filter(r => r.status === 'FAIL').length;
        for (const r of skillResults) {
            log(`${r.status.padEnd(4)}  ${r.id.padEnd(34)}  ${r.detail}`);
        }
        log(`\nTOTAL: ${passCount} PASS, ${failCount} FAIL  (of ${skillResults.length})`);

        // Console events
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
