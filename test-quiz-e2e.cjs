/* eslint-disable no-console */
// MathQuest Quiz E2E test
// Full teacher flow: build -> save -> take -> results -> share-link round-trip
// Run: node test-quiz-e2e.cjs (server must be running at http://localhost:8080)

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SHOT_DIR = path.join(__dirname, 'test-quiz-e2e-shots');
const URL = 'http://localhost:8080/index.html';

if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const results = []; // { step, name, passed, details }

function record(step, name, passed, details = '') {
    results.push({ step, name, passed, details });
    const icon = passed ? 'PASS' : 'FAIL';
    console.log(`[${icon}] Step ${step} - ${name}${details ? ' :: ' + details : ''}`);
}

async function shot(page, fileName) {
    const p = path.join(SHOT_DIR, fileName);
    try { await page.screenshot({ path: p, fullPage: false }); } catch (e) { /* ignore */ }
}

(async () => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: { width: 1280, height: 900 },
        });

        const page = await browser.newPage();
        page.on('pageerror', (e) => console.log('[pageerror]', e.message));
        page.on('console', (msg) => {
            const t = msg.type();
            if (t === 'error' || t === 'warning') {
                const text = msg.text();
                if (!/favicon|404|net::ERR/i.test(text)) console.log(`[console.${t}]`, text);
            }
        });

        // Auto-confirm dialogs (delete confirms etc.)
        page.on('dialog', async (d) => { try { await d.accept(); } catch (_) { /* */ } });

        await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 });

        // Give bootstrap a beat to attach window functions
        await page.evaluate(() => new Promise(r => setTimeout(r, 600)));

        // Capture window.open for print test
        await page.evaluate(() => {
            window.__opens = [];
            const orig = window.open;
            window.open = function (url, name, features) {
                window.__opens.push({ url: String(url || ''), name: name || '', features: features || '' });
                // Return a stub that satisfies printQuizTest's doc.write/close calls
                return {
                    document: { write: () => {}, close: () => {} },
                    location: { href: '' },
                    focus: () => {},
                    close: () => {},
                };
            };
        });

        // Capture clipboard writes for share-link test
        await page.evaluate(() => {
            window.__clipboard = [];
            try {
                if (!navigator.clipboard) navigator.clipboard = {};
                navigator.clipboard.writeText = (s) => { window.__clipboard.push(String(s)); return Promise.resolve(); };
            } catch (_) { /* */ }
        });

        // Capture URL.createObjectURL / anchor downloads (CSV, exports)
        await page.evaluate(() => {
            window.__downloads = [];
            const origCreate = URL.createObjectURL;
            URL.createObjectURL = function (blob) {
                try {
                    if (blob && blob instanceof Blob) {
                        // Read blob text if possible (small)
                        blob.text().then(t => window.__downloads.push({ size: blob.size, type: blob.type, sample: t.slice(0, 500) })).catch(()=>{});
                    }
                } catch (_) { /* */ }
                return origCreate.call(this, blob);
            };
            // Intercept anchor.click() so we don't navigate away
            const origClick = HTMLAnchorElement.prototype.click;
            HTMLAnchorElement.prototype.click = function () {
                if (this.download) {
                    window.__downloads.push({ download: this.download, href: this.href });
                    return; // suppress navigation
                }
                return origClick.call(this);
            };
        });

        // ============================================================
        // STEP 1: Open quiz builder, switch to teacher mode, assert layout
        // ============================================================
        await page.evaluate(() => {
            // Force teacher mode
            const html = document.documentElement;
            const body = document.body;
            html.classList.remove('student-mode');
            html.classList.add('teacher-mode');
            body.classList.remove('student-mode');
            body.classList.add('teacher-mode');
            try { if (window.state) window.state.userRole = 'teacher'; } catch (_) {}
        });

        const builderOpened = await page.evaluate(() => {
            try {
                if (typeof window.openQuizBuilder !== 'function') return { ok: false, err: 'openQuizBuilder missing' };
                window.openQuizBuilder();
                return { ok: true };
            } catch (e) { return { ok: false, err: e.message }; }
        });

        await page.evaluate(() => new Promise(r => setTimeout(r, 400)));
        await shot(page, 'step1-builder.png');

        if (!builderOpened.ok) {
            record(1, 'Open quiz builder', false, builderOpened.err);
        } else {
            const layout = await page.evaluate(() => {
                const view = document.getElementById('quizBuilderView');
                const grid = document.getElementById('qbGridPanel');
                const preview = document.getElementById('qbPreviewContent');
                const list = document.getElementById('qbQuestionList');
                const builder = document.getElementById('qbBuilderContainer');
                const isActive = view && view.classList.contains('active');
                const builderShown = builder && builder.style.display !== 'none';
                const skillCardsCount = grid ? grid.querySelectorAll('.qb-skill-card').length : 0;
                return {
                    viewExists: !!view,
                    viewActive: isActive,
                    gridExists: !!grid,
                    previewExists: !!preview,
                    listExists: !!list,
                    builderShown,
                    skillCardsCount,
                };
            });
            const ok = layout.viewExists && layout.viewActive && layout.gridExists
                    && layout.previewExists && layout.listExists && layout.builderShown
                    && layout.skillCardsCount > 0;
            record(1, 'Open quiz builder + 3-panel layout', ok, JSON.stringify(layout));
        }

        // ============================================================
        // STEP 2: Build quiz with 5 questions across 2 skills
        // ============================================================
        // Pick two skills directly via DOMAINS to be robust (no UI search dependency)
        const skillsPicked = await page.evaluate(() => {
            // Find an "operations" addition skill and a different multiplication skill
            // by inspecting SKILLS via a known skill card or by reading data
            const cards = Array.from(document.querySelectorAll('.qb-skill-card'));
            // Prefer add_facts and mult_facts if present
            let s1 = cards.find(c => c.dataset.qbSkill === 'add_facts');
            let s2 = cards.find(c => c.dataset.qbSkill === 'mult_facts');
            if (!s1) s1 = cards.find(c => /add/i.test(c.dataset.qbSkill || ''));
            if (!s2) s2 = cards.find(c => c !== s1);
            if (!s1 || !s2) return { ok: false, err: 'Could not find two skill cards' };
            return {
                ok: true,
                skill1: { id: s1.dataset.qbSkill, cat: s1.dataset.qbCat },
                skill2: { id: s2.dataset.qbSkill, cat: s2.dataset.qbCat },
            };
        });

        let buildOk = false;
        let buildDetails = '';
        if (!skillsPicked.ok) {
            record(2, 'Build 5 questions across 2 skills', false, skillsPicked.err);
        } else {
            const buildResult = await page.evaluate((s1, s2) => {
                try {
                    // 3 questions of skill 1
                    if (typeof window.addMultipleQuestions === 'function') {
                        window.addMultipleQuestions(s1.id, 3);
                    } else if (typeof window.addQuizQuestion === 'function') {
                        for (let i = 0; i < 3; i++) window.addQuizQuestion(s1.id);
                    } else {
                        return { ok: false, err: 'No add API' };
                    }
                    // 2 questions of skill 2
                    if (typeof window.addMultipleQuestions === 'function') {
                        window.addMultipleQuestions(s2.id, 2);
                    } else {
                        for (let i = 0; i < 2; i++) window.addQuizQuestion(s2.id);
                    }
                    // Set quiz title
                    if (typeof window.updateQuizName === 'function') {
                        window.updateQuizName('E2E Test Quiz');
                        const nameInput = document.getElementById('quizNameInput');
                        if (nameInput) nameInput.value = 'E2E Test Quiz';
                    }
                    const countEl = document.getElementById('qbQuestionCount');
                    return { ok: true, displayedCount: countEl ? countEl.textContent : '?' };
                } catch (e) { return { ok: false, err: e.message }; }
            }, skillsPicked.skill1, skillsPicked.skill2);

            await page.evaluate(() => new Promise(r => setTimeout(r, 250)));
            await shot(page, 'step2-built.png');

            // Read the actual count of questions in builderTest via DOM (#qbQuestionCount) and skill spread
            const verify = await page.evaluate(() => {
                const cards = document.querySelectorAll('.qb-question-card');
                const skillNames = new Set();
                cards.forEach(c => {
                    const nameEl = c.querySelector('.qb-q-skill');
                    if (nameEl) skillNames.add(nameEl.textContent.trim());
                });
                const countEl = document.getElementById('qbQuestionCount');
                return { count: cards.length, displayedCount: countEl ? countEl.textContent : '?', skills: [...skillNames] };
            });

            buildOk = buildResult.ok && verify.count === 5 && verify.skills.length >= 2;
            buildDetails = `count=${verify.count} skills=${verify.skills.length} displayed=${verify.displayedCount}`;
            record(2, 'Build 5 questions across 2 skills', buildOk, buildDetails);
        }

        // ============================================================
        // STEP 3: Save quiz, assert IndexedDB persistence
        // ============================================================
        const saveResult = await page.evaluate(async () => {
            try {
                if (typeof window.saveQuiz !== 'function') return { ok: false, err: 'saveQuiz missing' };
                await window.saveQuiz();
                // Read all tests
                const tests = await window.listTests();
                const ours = tests.find(t => t.name === 'E2E Test Quiz');
                if (!ours) return { ok: false, err: 'Quiz not found in IDB after save' };
                const totalQ = window.getTotalQuestionCount(ours);
                return { ok: true, id: ours.id, name: ours.name, qCount: totalQ };
            } catch (e) { return { ok: false, err: e.message }; }
        });

        await shot(page, 'step3-saved.png');
        const step3Ok = saveResult.ok && saveResult.qCount === 5;
        record(3, 'Save quiz to IndexedDB', step3Ok, JSON.stringify(saveResult));
        const savedQuizId = saveResult.id || null;

        // ============================================================
        // STEP 4: Take the quiz
        // ============================================================
        // Open quizTakeView programmatically (simulate teacher Take/preview)
        const takeBootstrap = await page.evaluate(async (quizId) => {
            try {
                if (!quizId) return { ok: false, err: 'no quiz id' };
                const test = await window.loadTest(quizId);
                if (!test) return { ok: false, err: 'loadTest returned null' };
                window.state.currentQuiz = test;
                // Mimic showQuizLanding -> startQuizTest path by directly calling startQuizTest
                window.showView('quizTakeView');
                // Insert a stub student name field, since startQuizTest reads it
                const container = document.getElementById('quizTakeView');
                if (!container.querySelector('#qtStudentName')) {
                    container.innerHTML = '<input id="qtStudentName" value="Test Student"/>';
                }
                window.startQuizTest();
                return { ok: true, totalQs: window.getTotalQuestionCount(test) };
            } catch (e) { return { ok: false, err: e.message, stack: (e.stack || '').slice(0, 400) }; }
        }, savedQuizId);

        await page.evaluate(() => new Promise(r => setTimeout(r, 300)));
        await shot(page, 'step4a-take-start.png');

        if (!takeBootstrap.ok) {
            record(4, 'Open quiz take view', false, JSON.stringify(takeBootstrap));
        } else {
            // Verify we have the quizTakeView active and the question card present
            const inTake = await page.evaluate(() => {
                const view = document.getElementById('quizTakeView');
                const qCard = document.querySelector('.qt-question-card');
                const dots = document.querySelectorAll('.qt-q-dot');
                return {
                    active: view && view.classList.contains('active'),
                    hasQuestion: !!qCard,
                    dotCount: dots.length,
                };
            });

            // Get the correct answers for the 5 questions (so we can answer 3 correctly)
            const answers = await page.evaluate(() => {
                const allQs = window.state.quizAllQuestions || [];
                return allQs.map(item => ({ ans: String(item.question.questionData.ans) }));
            });

            // Q1: answer correctly + flag it
            await page.evaluate((ans) => {
                const input = document.getElementById('qtAnswerInput');
                if (input) input.value = ans;
                const flatIdx = window.state.quizOrder[window.state.quizQuestionIndex];
                window.flagQuizQuestion(flatIdx); // flag Q1
                window.submitQuizTextAnswer(flatIdx, ans);
            }, answers[0].ans);

            await page.evaluate(() => new Promise(r => setTimeout(r, 100)));

            // Navigate to Q2, answer correctly
            await page.evaluate((ans) => {
                window.navigateQuizQuestion(1);
                const flatIdx = window.state.quizOrder[window.state.quizQuestionIndex];
                window.submitQuizTextAnswer(flatIdx, ans);
            }, answers[1].ans);
            await page.evaluate(() => new Promise(r => setTimeout(r, 100)));

            // Navigate to Q3, answer correctly
            await page.evaluate((ans) => {
                window.navigateQuizQuestion(1);
                const flatIdx = window.state.quizOrder[window.state.quizQuestionIndex];
                window.submitQuizTextAnswer(flatIdx, ans);
            }, answers[2].ans);
            await page.evaluate(() => new Promise(r => setTimeout(r, 100)));

            // Navigate to Q4, leave blank
            await page.evaluate(() => {
                window.navigateQuizQuestion(1);
            });
            await page.evaluate(() => new Promise(r => setTimeout(r, 100)));

            // Navigate to Q5
            await page.evaluate(() => {
                window.navigateQuizQuestion(1);
            });
            await page.evaluate(() => new Promise(r => setTimeout(r, 100)));

            // Test back navigation
            await page.evaluate(() => {
                window.navigateQuizQuestion(-1);
            });
            await page.evaluate(() => new Promise(r => setTimeout(r, 100)));

            // Verify flag appears in navigator (dot for Q1 should have 'flagged')
            const navState = await page.evaluate(() => {
                const dots = document.querySelectorAll('.qt-q-dot');
                const flagged = Array.from(dots).filter(d => d.classList.contains('flagged')).length;
                const answered = Array.from(dots).filter(d => d.classList.contains('answered')).length;
                return { dotCount: dots.length, flagged, answered };
            });

            await shot(page, 'step4b-mid-quiz.png');

            // Forward to Q5 again then submit (skip review)
            await page.evaluate(() => {
                window.navigateQuizQuestion(1); // back to Q5
            });
            await page.evaluate(() => new Promise(r => setTimeout(r, 100)));
            const submitR = await page.evaluate(async () => {
                try {
                    await window.submitQuiz();
                    return { ok: true };
                } catch (e) { return { ok: false, err: e.message }; }
            });
            await page.evaluate(() => new Promise(r => setTimeout(r, 300)));
            await shot(page, 'step4c-submitted.png');

            const ok = inTake.active && inTake.hasQuestion && inTake.dotCount === 5
                && navState.flagged >= 1 && navState.answered >= 3 && submitR.ok;
            record(4, 'Take quiz (answer 3, blank 1, flag 1, navigate, submit)', ok,
                JSON.stringify({ inTake, navState, submit: submitR }));
        }

        // ============================================================
        // STEP 5: View results (post-submit) + CSV + Print
        // ============================================================
        // After submit, quiz-take.js renders the student-facing results inside #quizTakeView
        // (qt-results, qt-score-circle). Verify that.
        const studentResults = await page.evaluate(() => {
            const view = document.getElementById('quizTakeView');
            const results = view.querySelector('.qt-results');
            const scoreCircle = view.querySelector('.qt-score-circle');
            const breakdown = view.querySelector('.qt-result-breakdown');
            const correctIcons = view.querySelectorAll('.correct-icon').length;
            const incorrectIcons = view.querySelectorAll('.incorrect-icon').length;
            return {
                hasResults: !!results,
                scoreText: scoreCircle ? scoreCircle.textContent.trim() : '',
                hasBreakdown: !!breakdown,
                correctIcons,
                incorrectIcons,
                resultObj: window.state.currentQuizResult ? {
                    score: window.state.currentQuizResult.score,
                    total: window.state.currentQuizResult.totalPoints,
                    pct: window.state.currentQuizResult.percentage,
                } : null,
            };
        });

        await shot(page, 'step5a-student-results.png');

        // Now also open the teacher-facing quizResultsView and test CSV / print
        const teacherResults = await page.evaluate(async (qid) => {
            try {
                await window.showQuizResults(qid);
                await new Promise(r => setTimeout(r, 200));
                const view = document.getElementById('quizResultsView');
                const isActive = view && view.classList.contains('active');
                const table = view ? view.querySelector('.qr-table') : null;
                const rows = table ? table.querySelectorAll('tbody tr').length : 0;
                return { isActive, hasTable: !!table, rows };
            } catch (e) { return { ok: false, err: e.message }; }
        }, savedQuizId);

        await shot(page, 'step5b-teacher-results.png');

        // Trigger CSV export and check downloads
        const csvCheck = await page.evaluate(async (qid) => {
            const before = window.__downloads.length;
            try {
                await window.exportQuizCSV(qid);
            } catch (e) { return { ok: false, err: e.message }; }
            await new Promise(r => setTimeout(r, 250));
            const newDownloads = window.__downloads.slice(before);
            return { ok: true, downloads: newDownloads };
        }, savedQuizId);

        // Trigger print and check window.open was called with HTML payload
        const printCheck = await page.evaluate(async (qid) => {
            const before = window.__opens.length;
            try {
                const test = await window.loadTest(qid);
                window.printQuizTest(test, { includeAnswerKey: true });
            } catch (e) { return { ok: false, err: e.message }; }
            const newOpens = window.__opens.slice(before);
            return { ok: true, opens: newOpens.length };
        }, savedQuizId);

        const step5Ok = studentResults.hasResults && studentResults.scoreText.includes('%')
            && teacherResults.isActive
            && csvCheck.ok && csvCheck.downloads && csvCheck.downloads.length > 0
            && printCheck.ok && printCheck.opens > 0;
        record(5, 'View results + CSV export + Print', step5Ok,
            JSON.stringify({ studentResults, teacherResults, csv: csvCheck, print: printCheck }));

        // ============================================================
        // STEP 6: Share-link round-trip
        // ============================================================
        const shareRT = await page.evaluate(async (qid) => {
            try {
                const test = await window.loadTest(qid);
                if (!test) return { ok: false, err: 'loadTest null' };
                const compressed = window.compressTestForURL(test);
                if (!compressed || typeof compressed !== 'string') return { ok: false, err: 'compress returned non-string' };
                const decoded = window.decompressTestFromURL(compressed);
                if (!decoded) return { ok: false, err: 'decompress returned null' };
                const origCount = window.getTotalQuestionCount(test);
                const newCount = window.getTotalQuestionCount(decoded);
                return {
                    ok: true,
                    compressedLen: compressed.length,
                    origName: test.name,
                    newName: decoded.name,
                    origCount,
                    newCount,
                    nameMatch: test.name === decoded.name,
                    countMatch: origCount === newCount,
                };
            } catch (e) { return { ok: false, err: e.message }; }
        }, savedQuizId);

        // Also test generateQuizLink (clipboard-copy variant)
        const linkCheck = await page.evaluate(async () => {
            const before = window.__clipboard.length;
            try {
                if (typeof window.generateQuizLink !== 'function') return { ok: false, err: 'generateQuizLink missing' };
                await window.generateQuizLink();
            } catch (e) { return { ok: false, err: e.message }; }
            await new Promise(r => setTimeout(r, 200));
            const newClip = window.__clipboard.slice(before);
            return { ok: true, clip: newClip };
        });

        await shot(page, 'step6-share-link.png');

        const step6Ok = shareRT.ok && shareRT.nameMatch && shareRT.countMatch && shareRT.newCount === 5;
        record(6, 'Share-link round-trip', step6Ok,
            JSON.stringify({ shareRT, link: linkCheck }));

        // Cleanup: delete the test quiz
        await page.evaluate(async (qid) => {
            try { if (qid) await window.deleteTest(qid); } catch (_) { /* */ }
        }, savedQuizId);

    } catch (e) {
        console.error('FATAL', e);
        record(0, 'FATAL', false, e.message + '\n' + (e.stack || '').slice(0, 600));
    } finally {
        if (browser) await browser.close();

        // Print summary
        const passed = results.filter(r => r.passed).length;
        const total = results.length;
        console.log('\n========================================');
        console.log(`SUMMARY: ${passed}/${total} steps passed`);
        console.log('========================================');
        for (const r of results) {
            console.log(`  Step ${r.step} [${r.passed ? 'PASS' : 'FAIL'}] ${r.name}`);
            if (!r.passed && r.details) console.log('    >', r.details);
        }
        // Exit non-zero if any fail (but write a summary file regardless)
        process.exit(passed === total ? 0 : 1);
    }
})();
