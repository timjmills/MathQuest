// Wave 1 lane C: the ten-column hundred chart's screen metrics, MEASURED FROM THE LIVE PAGE.
//
// For composing:hundreds_chart_fill {grid:'whole', gaps:'row'} (gaps=row keeps the printed "100")
// it renders the practice card (1280 / 820 / 390), the online worksheet (1280 / 820 / 390) and the
// quiz (1280), waits for the screen-fit pass, and reads:
//   fontPx  getComputedStyle(td span).fontSize of the printed squares
//   minW/H  the smallest square (getBoundingClientRect of every td)
//   clear   the "100" text's own box (a Range over its text node) to its square's edges, left/right
//   pageHScroll  the page's sideways scroll (must be 0 everywhere)
// Targets (critic round 4, defect F; WORKSHEET_DESIGN_STANDARD SP-11a / SP-12a):
//   card + quiz >= 768 px host: digits >= 48 px, "100" clear >= 4 px each side
//   every host >= 1000 px: the ten squares fit (no swipe); 820: the chart may swipe inside its cell
//   worksheet  >= 768 px host: digits >= 29 px, squares >= 60 px wide
//   card 390: digits 40 px, worksheet 390: digits 29 px (the phone ruling; the chart swipes)
// Exit 1 when any target is missed. Run through /tmp/mq-browser-run.sh.
//   node tests/scripts/wave1-c-chart-metrics.cjs
const { open } = require('../lib/ws-harness.cjs');

const SKILL = { categoryId: 'composing', skillId: 'hundreds_chart_fill' };
const HOSTS = [
    ['card', 1280], ['card', 820], ['card', 390],
    ['worksheet', 1280], ['worksheet', 820], ['worksheet', 390],
    ['quiz', 1280],
];
// follow-up I (2026-10-02): the 3-row window (grid:'rows', two-digit numbers) on every host, gaps scatter and row.
// Targets: squares >= 44 px wide, inputs >= 44 px wide, every printed number >= 4 px clear each side.
const ALL_HOSTS = HOSTS.concat([['quiz', 820], ['quiz', 390]]);
const CONFIGS = [
    { name: 'whole/row', opts: { grid: 'whole', gaps: 'row' }, hosts: HOSTS, rows: false },
    { name: 'rows/scatter', opts: { grid: 'rows', gaps: 'scatter' }, hosts: ALL_HOSTS, rows: true },
    { name: 'rows/row', opts: { grid: 'rows', gaps: 'row' }, hosts: ALL_HOSTS, rows: true },
];

function target(host, w) {
    if (w <= 480) return host === 'worksheet' ? { font: 29 } : { font: 40 };
    if (host === 'worksheet') return { font: 29, squareW: 60, clear: 4 };
    return { font: 48, clear: 4 };
}

(async () => {
    const app = await open({ seed: 1 });
    const { page } = app;
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));
    let fail = 0;
    for (const CFG of CONFIGS) for (const [host, W] of CFG.hosts) {
        const OPTS = CFG.opts;
        await page.setViewport({ width: W, height: 900, deviceScaleFactor: 1 });
        await new Promise((r) => setTimeout(r, 150));
        const r = await page.evaluate(async ({ host, SKILL, OPTS }) => {
            const wait = (ms) => new Promise((res) => setTimeout(res, ms));
            const st = window.state;
            try { st.quizMode = false; } catch (e) {}
            window.clearSetOptions({ silent: true });
            window.setSetOptions(SKILL.categoryId, SKILL.skillId, OPTS, { silent: true });
            st.category = SKILL.categoryId; st.skill = SKILL.skillId; st.isMixedMode = false;
            let rootSel;
            if (host === 'card') {
                st.gameMode = 'practice';
                window.showView('gameView');
                const q = window.generateQuestion(); st.currentQ = q; window.renderQuestion();
                rootSel = '#questionCard';
            } else if (host === 'worksheet') {
                st.gameMode = 'worksheet'; st.problemCount = 2;
                window.initWorksheet();
                rootSel = '#worksheetGrid .problem-card';
            } else {
                const questions = [];
                for (let i = 0; i < 2; i++) {
                    const q = window.generateQuestionFor({ category: SKILL.categoryId, skill: SKILL.skillId, opts: OPTS, seed: 11 + i, itemIndex: i });
                    const qd = window.quizQuestionData ? window.quizQuestionData(q) : { text: q.text, ans: q.ans, answerType: q.answerType, visual: q.visual };
                    questions.push({ id: i, skillId: SKILL.skillId, points: 1, questionData: qd });
                }
                const test = { id: null, name: 'Probe', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }],
                    settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
                window.handleQuizURL(window.compressTestForURL(test));
                const name = document.getElementById('qtStudentName');
                name.value = 'Probe'; name.dispatchEvent(new Event('input'));
                window.startQuizTest();
                rootSel = '#quizTakeView .qt-question-card';
            }
            await wait(1500);   // the fit pass runs on rAF / resize; read after it
            window.scrollTo(0, 0);
            const root = document.querySelector(rootSel);
            if (!root) return { err: 'no host ' + rootSel };
            const t = root.querySelector('.k2-chart.k2-chart-ten');
            if (!t) return { err: 'no ten-column chart' };
            const tds = [...t.querySelectorAll('td')];
            const rs = tds.map((d) => d.getBoundingClientRect());
            const printedTds = tds.filter((d) => !d.querySelector('input') && d.textContent.trim());
            const printed = printedTds[0];
            const fontEl = (printed && (printed.querySelector('span') || printed)) || tds[0];
            let clearL = null, clearR = null;
            for (const d of printedTds) {
                const tn = [...d.querySelectorAll('*'), d].map((e) => [...e.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim()))
                    .find(Boolean);
                if (!tn) continue;
                const rg = document.createRange(); rg.selectNodeContents(tn);
                const tr = rg.getBoundingClientRect(), lr = d.getBoundingClientRect();
                const l = +(tr.left - lr.left).toFixed(1), r2 = +(lr.right - tr.right).toFixed(1);
                if (clearL === null || l < clearL) clearL = l;
                if (clearR === null || r2 < clearR) clearR = r2;
            }
            const ins = [...t.querySelectorAll('input')].map((i) => i.getBoundingClientRect());
            const inputW = ins.length ? +Math.min(...ins.map((x) => x.width)).toFixed(1) : null;
            const wrap = t.closest('.k2-chartwindow') || t.parentElement;
            const hostBox = (t.closest('#questionCard, .problem-card, .qt-question-card') || root).getBoundingClientRect();
            return {
                fontPx: parseFloat(getComputedStyle(fontEl).fontSize),
                minW: +Math.min(...rs.map((x) => x.width)).toFixed(1),
                minH: +Math.min(...rs.map((x) => x.height)).toFixed(1),
                clearL, clearR, inputW,
                chartW: Math.round(t.getBoundingClientRect().width), hostW: Math.round(hostBox.width),
                swipes: wrap.scrollWidth > wrap.clientWidth + 1,
                wrapW: Math.round(wrap.clientWidth),
                chain: (() => { const o = []; for (let e = wrap; e && e !== document.body && o.length < 9; e = e.parentElement) o.push((e.id || e.className.toString().split(' ')[0]) + ':' + Math.round(e.getBoundingClientRect().width)); return o.join(' < '); })(),
                pageHScroll: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            };
        }, { host, SKILL, OPTS });
        const tg = Object.assign({}, target(host, W));
        if (CFG.rows) { tg.squareW = 44; tg.inputW = 44; tg.clear = 4; }
        const miss = [];
        if (r.err) miss.push(r.err);
        else {
            if (r.fontPx < tg.font - 0.01) miss.push(`digits ${r.fontPx} < ${tg.font}`);
            if (tg.squareW && r.minW < tg.squareW) miss.push(`squares ${r.minW} < ${tg.squareW}`);
            if (tg.inputW && (r.inputW == null || r.inputW < tg.inputW)) miss.push(`input ${r.inputW} < ${tg.inputW}`);
            if (tg.clear && (r.clearL == null || r.clearL < tg.clear || r.clearR < tg.clear)) miss.push(`printed number clear ${r.clearL}/${r.clearR} < ${tg.clear}`);
            if (W >= 1000 && r.swipes) miss.push('chart swipes at a desktop width (ten squares must fit)');
            if (r.pageHScroll > 0) miss.push(`page scrolls sideways ${r.pageHScroll}`);
        }
        if (miss.length) fail++;
        console.log(`${miss.length ? 'FAIL' : 'ok  '} ${CFG.name.padEnd(12)} ${host.padEnd(9)} ${String(W).padStart(4)}  ${JSON.stringify(r)}${miss.length ? '  <- ' + miss.join('; ') : ''}`);
    }
    if (errors.length) { fail++; console.log('console errors:', errors.slice(0, 5).join(' | ')); }
    await app.close();
    console.log(fail ? `wave1-c-chart-metrics: FAIL (${fail})` : 'wave1-c-chart-metrics: OK');
    process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); console.log('wave1-c-chart-metrics: FAIL'); process.exit(1); });
