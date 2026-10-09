// The long-division bracket hugs its dividend on screen, as it does on paper (owner 2026-10-09;
// critic div-facts-forms R4 nit c: "7)  28", "2)  8" drew a gap under the vinculum on the online
// worksheet because the quotient box's 64 px floor, and the >= 44 px work tracks, widened the
// dividend's column beyond its digits).
//
// For every screen host - the practice card at 390 and 1280, the online worksheet at 1280 and 390,
// the quiz at 1280 - and every bracket drawing:
//   fact bracket (.mq-ldiv: div_facts Long / Mix, every one-line division fact drawn as a bracket)
//   worked bracket (.ws-ops-division: long_div_2digit, long_division ... the kit twin with work rows)
// it measures, in units of the digit size (em), from the glyph boxes of the digits:
//   gap    the arc's outer edge to the dividend's first digit
//   over   the dividend's last digit to the vinculum's right end
//   space  the widest space between two dividend digits
// and holds each to the PAPER drawing of the same skill (the kit's Independent page at L, measured
// the same way in a printed sheetDocument): no more than paper + TOL. Every quotient input is a
// touch target (>= 40 x 40 px), and 1-, 2- and 3-digit dividends were all seen in a bracket.
//
//   node tests/scripts/ws-ldiv-hug.cjs                 # prints one line per bracket, then OK / FAIL
//   node tests/scripts/ws-ldiv-hug.cjs --shots <dir>   # also screenshots each host
const fs = require('fs');
const path = require('path');
const { open, hideOverlays } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const SHOTS = arg('shots', null);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const TOL = { gap: 0.1, over: 0.1, space: 0.05 }, BOX_MIN = 40;

const SKILLS = [
    { categoryId: 'division', skillId: 'div_facts', opts: { divForm: 'long' }, tag: 'div_facts-long' },
    { categoryId: 'division', skillId: 'div_facts', opts: { divForm: 'mix' }, tag: 'div_facts-mix' },
    { categoryId: 'division', skillId: 'long_div_2digit', opts: null, tag: 'long_div_2digit' },
    // a times-table fact prints across on paper, so its bracket is held to the div_facts Long bracket
    { categoryId: 'division', skillId: 'divide', opts: { notation: ['bracket'] }, tag: 'divide-facts', paperAs: { categoryId: 'division', skillId: 'div_facts', opts: { divForm: 'long' } } },
    { categoryId: 'division', skillId: 'divide', opts: { notation: ['bracket'], tiles: 21 }, tag: 'divide-21' },
    { categoryId: 'division', skillId: 'divide', opts: { notation: ['bracket'], tiles: 31 }, tag: 'divide-31' },
    { categoryId: 'division', skillId: 'divide', opts: { notation: ['bracket'], tiles: 31, regroup: 'always' }, tag: 'divide-31-R' },
];

// In the page: measure every bracket under `rootSel`.
function MEASURE(rootSel, frameSel) {
    const doc = frameSel ? document.querySelector(frameSel).contentDocument : document;
    const root = doc.querySelector(rootSel);
    if (!root) return { error: 'no root ' + rootSel };
    const getComputedStyle = doc.defaultView.getComputedStyle.bind(doc.defaultView);
    const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const textRect = (el) => {
        const rg = doc.createRange();
        rg.selectNodeContents(el);
        const rs = Array.from(rg.getClientRects()).filter((r) => r.width > 0);
        if (!rs.length) return null;
        return { left: Math.min(...rs.map((r) => r.left)), right: Math.max(...rs.map((r) => r.right)) };
    };
    const out = [];
    root.querySelectorAll('.mq-ldiv').forEach((g) => {
        if (!vis(g)) return;
        const em = parseFloat(getComputedStyle(g).fontSize);
        const arc = g.querySelector('.mq-ldiv-arc'), dvd = g.querySelector('.mq-ldiv-dvd');
        const t = textRect(dvd);
        if (!arc || !t) return;
        const a = arc.getBoundingClientRect(), d = dvd.getBoundingClientRect();
        const boxes = Array.from(g.querySelectorAll('.mq-ldiv-q input')).filter(vis).map((i) => i.getBoundingClientRect());
        // the arc path is M1 1 Q11 24 1 47 in a 12-wide box: its outer edge is at x = 6 / 12
        out.push({ kind: 'fact', text: (dvd.textContent || '').trim(), em,
            gap: (t.left - (a.left + a.width * 0.5)) / em, over: (d.right - t.right) / em, space: 0,
            box: boxes.length ? Math.min(...boxes.map((r) => Math.min(r.width, r.height))) : 0,
            boxOffset: boxes.length ? ((boxes[0].left + boxes[0].right) / 2 - (t.left + t.right) / 2) / em : 0 });
    });
    root.querySelectorAll('.ws-ops-division [role="group"]').forEach((g) => {
        if (!vis(g)) return;
        const em = parseFloat(getComputedStyle(g).fontSize);
        const pos = (el) => {
            const st = el.getAttribute('style') || '';
            const c = st.match(/grid-column:\s*(\d+)/), r = st.match(/grid-row:\s*(\d+)/);
            return c && r ? { col: Number(c[1]), row: Number(r[1]) } : null;
        };
        const kids = Array.from(g.children).map((el) => ({ el, p: pos(el) })).filter((x) => x.p && x.p.row === 2);
        const arcSpan = kids.find((x) => x.el.querySelector('svg'));
        const digits = kids.filter((x) => /border-top/.test(x.el.getAttribute('style') || '') && /\d/.test(x.el.textContent || '') && x.el.getBoundingClientRect().height > 0).sort((p, q) => p.p.col - q.p.col);
        const bar = Array.from(g.children).find((el) => /height:\s*0/.test(el.getAttribute('style') || '') && /border-top/.test(el.getAttribute('style') || ''));
        if (!arcSpan || !digits.length || !bar) return;
        const a = arcSpan.el.getBoundingClientRect();
        const ts = digits.map((x) => textRect(x.el)).filter(Boolean);
        const spaces = ts.slice(1).map((r, i) => (r.left - ts[i].right) / em);
        const boxes = Array.from(g.querySelectorAll('input')).filter((i) => vis(i) && !i.classList.contains('mq-opswork')).map((i) => i.getBoundingClientRect());
        // the kit's arc path is M1.5 0 Q9 20 1.5 40 in a 10-wide box: outer edge at x = 5.25 / 10
        out.push({ kind: 'worked', text: digits.map((x) => x.el.textContent.trim()).join(''), em,
            gap: (ts[0].left - (a.left + a.width * 0.525)) / em, over: (bar.getBoundingClientRect().right - ts[ts.length - 1].right) / em,
            space: spaces.length ? Math.max(...spaces) : 0,
            box: boxes.length ? Math.min(...boxes.map((r) => Math.min(r.width, r.height))) : 0, boxOffset: 0 });
    });
    return { brackets: out };
}

async function viewport(page, w, h) { await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 }); await sleep(150); }

async function card(page, s, w, seed) {
    await viewport(page, w, 900);
    await hideOverlays(page);
    const r = await page.evaluate(({ s, seed }) => {
        const st = window.state;
        st.category = s.categoryId; st.skill = s.skillId; st.gameMode = 'practice'; st.isMixedMode = false;
        window.showView('gameView');
        const q = window.generateQuestionFor({ category: s.categoryId, skill: s.skillId, opts: s.opts || undefined, seed, itemIndex: 0 });
        if (!q) return { error: 'no item' };
        st.currentQ = q;
        window.renderQuestion();
        window.scrollTo(0, 0);
        return {};
    }, { s, seed });
    if (r.error) return r;
    await sleep(250);
    return page.evaluate(MEASURE, '#questionCard');
}

async function worksheet(page, s, w) {
    await viewport(page, w, 900);
    await hideOverlays(page);
    const r = await page.evaluate((s) => {
        const st = window.state;
        st.category = s.categoryId; st.skill = s.skillId; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 6;
        st.skillOptions = s.opts ? { ...s.opts } : {};
        if (window.__wsReseed) window.__wsReseed(7);
        window.initWorksheet();
        window.scrollTo(0, 0);
        return {};
    }, s);
    if (r.error) return r;
    await sleep(400);
    return page.evaluate(MEASURE, '#worksheetGrid');
}

async function quiz(page, s) {
    await viewport(page, 1280, 900);
    await hideOverlays(page);
    const r = await page.evaluate((s) => {
        const questions = [];
        for (let i = 0; i < 6; i++) {
            const q = window.generateQuestionFor({ category: s.categoryId, skill: s.skillId, opts: s.opts || undefined, seed: 300 + i, itemIndex: i });
            if (!q) continue;
            const qd = window.quizQuestionData ? window.quizQuestionData(q) : { text: q.text, ans: q.ans, answerType: q.answerType, visual: q.visual };
            questions.push({ id: i, skillId: s.skillId, points: 1, questionData: qd });
        }
        const test = { id: null, name: 'Bracket quiz', createdAt: null, updatedAt: null,
            sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }],
            settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
        window.handleQuizURL(window.compressTestForURL(test));
        const name = document.getElementById('qtStudentName');
        if (!name) return { error: 'quiz landing did not render' };
        name.value = 'Audit'; name.dispatchEvent(new Event('input'));
        window.startQuizTest();
        window.scrollTo(0, 0);
        return {};
    }, s);
    if (r.error) return r;
    await sleep(400);
    return page.evaluate(MEASURE, '#quizTakeView');
}

// The paper reference: the kit's Independent page at L, printed (sheetDocument) in an iframe.
async function paper(page, s) {
    const ok = await page.evaluate(async (s) => {
        const res = await window.buildSheet({ role: 'independent', size: 'L', seed: 4242, key: false,
            sections: [{ skills: [{ categoryId: s.categoryId, skillId: s.skillId, opts: s.opts || {} }], count: 6 }] });
        let f = document.getElementById('mqHugPaper');
        if (!f) {
            f = document.createElement('iframe');
            f.id = 'mqHugPaper';
            f.style.cssText = 'position:fixed;left:0;top:0;width:900px;height:1300px;border:0;z-index:-1;visibility:hidden';
            document.body.appendChild(f);
        }
        await new Promise((r) => { f.onload = r; f.srcdoc = window.sheetDocument(res.pupilHtml, 'paper'); });
        await f.contentDocument.fonts.ready;
        return true;
    }, s);
    if (!ok) return { error: 'paper did not build' };
    await sleep(200);
    return page.evaluate(MEASURE, 'body', '#mqHugPaper');
}

async function shot(page, sel, file) {
    if (!SHOTS) return;
    fs.mkdirSync(SHOTS, { recursive: true });
    const el = await page.$(sel);
    await (el || page).screenshot({ path: path.join(SHOTS, file) });
}

(async () => {
    const app = await open({ seed: 1, viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
    const { page } = app;
    let fails = 0, n = 0;
    const lens = new Set();
    let ref = null;
    const judge = (host, tag, res) => {
        if (!res || res.error) { console.log(`FAIL ${host} ${tag}: ${res ? res.error : 'no result'}`); fails++; return; }
        for (const b of res.brackets) {
            n++;
            lens.add(b.text.length);
            const bad = [];
            for (const k of ['gap', 'over', 'space']) if (b[k] > ref[k] + TOL[k]) bad.push(`${k} ${b[k].toFixed(2)} > paper ${ref[k].toFixed(2)} + ${TOL[k]}`);
            if (b.box < BOX_MIN) bad.push(`box ${b.box.toFixed(0)}px`);
            if (bad.length) fails++;
            console.log(`${bad.length ? 'FAIL' : 'PASS'} ${host} ${tag} ${b.kind} ${b.text} @${b.em.toFixed(0)}px: gap ${b.gap.toFixed(2)} over ${b.over.toFixed(2)} space ${b.space.toFixed(2)} box ${b.box.toFixed(0)}px centre ${b.boxOffset.toFixed(2)}${bad.length ? '  <- ' + bad.join(', ') : ''}`);
        }
    };
    try {
        for (const s of SKILLS) {
            const pr = await paper(page, s.paperAs || s);
            if (!pr || pr.error || !pr.brackets.length) { console.log(`FAIL paper ${s.tag}: ${pr && pr.error ? pr.error : 'no bracket'}`); fails++; continue; }
            ref = { gap: Math.max(...pr.brackets.map((b) => b.gap)), over: Math.max(...pr.brackets.map((b) => b.over)), space: Math.max(...pr.brackets.map((b) => b.space)) };
            console.log(`---- ${s.tag}: paper (${pr.brackets.length} brackets) gap ${ref.gap.toFixed(2)} over ${ref.over.toFixed(2)} space ${ref.space.toFixed(2)}`);
            for (const w of [390, 1280]) {
                for (const seed of [11, 12, 13, 14]) {
                    judge(`card-${w}`, s.tag, await card(page, s, w, seed));
                    if (seed === 11) await shot(page, '#gameView', `${s.tag}-card-${w}.png`);
                }
                judge(`worksheet-${w}`, s.tag, await worksheet(page, s, w));
                await shot(page, '#worksheetView', `${s.tag}-worksheet-${w}.png`);
            }
            judge('quiz-1280', s.tag, await quiz(page, s));
            await shot(page, '#quizTakeView', `${s.tag}-quiz-1280.png`);
        }
        for (const L of [1, 2, 3]) {
            const ok = lens.has(L);
            if (!ok) fails++;
            console.log(`${ok ? 'PASS' : 'FAIL'} a ${L}-digit dividend was drawn in a bracket on screen`);
        }
        const errs = app.problems.filter((p) => p.type !== 'requestfailed');
        if (errs.length) { fails++; errs.slice(0, 5).forEach((e) => console.log(`FAIL console: ${e.text}`)); }
        console.log(`${n} brackets measured`);
    } catch (e) {
        console.log('FAIL ' + (e.stack || e.message));
        fails++;
    } finally {
        await app.close();
    }
    console.log(fails ? `ws-ldiv-hug: FAIL (${fails})` : 'ws-ldiv-hug: OK');
    process.exit(fails ? 1 : 0);
})();
