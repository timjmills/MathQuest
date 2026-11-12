// ws-next-box — owner O-1 (2026-11-10): the NEXT answer box on the three pupil screens (practice card, online worksheet,
// quiz) is a thick BLUE outline that pulses gently on a white fill, behind ONE switch (css/screen-cell.css, the
// --mq-next-* custom properties on :root; the class `mq-next-yellow` on <html> restores the 2026-10-04 yellow).
//
//   node tests/scripts/ws-next-box.cjs                    # prints ws-next-box: OK | FAIL
//   node tests/scripts/ws-next-box.cjs --skills addition:add,placevalue:unit_form
//
// NB1  on each host the next box's painted ring (its first box-shadow) is the switch's colour (--mq-next-color), at least
//      4 px, on a white fill, and it pulses (an animation runs)
// NB2  flipping the switch (html.mq-next-yellow) repaints the ring yellow (#f2c200): going back is a one-line change
// NB3  a wrong box (.mq-live-wrong) keeps its red: no blue ring, the red edge (R4-3)
// NB4  prefers-reduced-motion: no pulse, the same static blue ring
// NB5  yellow is kept for right-answer feedback only: the current worksheet problem's card carries no yellow ring
// NB6  (lf-vocab r9) the quiz, Match 3 answered wrong (instant feedback): every wrong letter box red, none with the blue ring
// NB7  (lf-vocab r9) 1 picture, 3 words: the answer LINE carries the next outline before an answer on every host, none after
const { open } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const SKILLS = (arg('skills', 'addition:add,addition:add_facts,placevalue:unit_form') || '').split(',').map((s) => s.trim()).filter(Boolean);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fails = [];

// (in the page) the painted state of the host's next box
function READ(sel) {
    const host = document.querySelector(sel);
    if (!host) return { error: `no host ${sel}` };
    const box = host.querySelector('.mq-active-box');
    if (!box) return { error: 'no .mq-active-box' };
    // an inline-blank input adopted into a kit box hands its highlight to the box (screen-cell.css SL-3)
    const el = box.matches('.mq-cellbox > input.ib-cell') ? box.parentElement : box;
    const cs = getComputedStyle(el);
    const probe = document.createElement('span');
    document.body.appendChild(probe);
    const norm = (c) => { probe.style.color = ''; probe.style.color = c; return getComputedStyle(probe).color; };
    const sw = norm(getComputedStyle(document.documentElement).getPropertyValue('--mq-next-color').trim() || 'transparent');
    probe.remove();
    const shadow = cs.boxShadow;
    const first = (shadow.match(/rgba?\([^)]*\)/) || [''])[0];
    const width = ((shadow.split(/,(?![^(]*\))/)[0] || '').match(/(-?[\d.]+)px/g) || []).map(parseFloat);
    const card = host.closest('.problem-card') || null;
    return {
        tag: el.tagName + '.' + String(el.className).split(/\s+/).slice(0, 3).join('.'),
        sw, shadow, first, spread: width.length >= 4 ? width[3] : (width[width.length - 1] || 0),
        bg: cs.backgroundColor, anim: cs.animationName, border: cs.borderTopColor,
        cardShadow: card ? getComputedStyle(card).boxShadow : '',
    };
}
const YELLOW = 'rgb(242, 194, 0)';

(async () => {
    const app = await open({ seed: 1, viewport: { width: 390, height: 844, deviceScaleFactor: 1 } });
    const { page } = app;
    const hosts = [
        ['card-390', '#questionCard', 390, async (c, k) => page.evaluate((c, k) => {
            const st = window.state; st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false;
            window.showView('gameView'); st.currentQ = window.generateQuestionFor({ category: c, skill: k, seed: 11 }); window.renderQuestion();
            document.activeElement && document.activeElement.blur && document.activeElement.blur();
        }, c, k)],
        ['worksheet-1280', '#worksheetView .problem-card.mq-active-problem', 1280, async (c, k) => page.evaluate((c, k) => {
            const st = window.state; st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 3; window.initWorksheet();
        }, c, k)],
        ['quiz-1280', '#quizTakeView .qt-question-card', 1280, async (c, k) => page.evaluate((c, k) => {
            const q = window.generateQuestionFor({ category: c, skill: k, seed: 12 });
            const test = { id: null, name: 'Next', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions: [{ id: 0, skillId: k, points: 1, questionData: window.quizQuestionData(q) }] }],
                settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
            window.handleQuizURL(window.compressTestForURL(test));
            const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input'));
            window.startQuizTest();
        }, c, k)],
    ];
    let judged = 0;
    try {
        for (const s of SKILLS) {
            const [c, k] = s.split(':');
            for (const [hn, sel, w, setup] of hosts) {
                const tag = `${s} ${hn}`;
                await page.reload({ waitUntil: 'networkidle2' });
                await page.waitForFunction(() => typeof window.generateQuestionFor === 'function' && !!window.SKILLS, { timeout: 30000 });
                await page.setViewport({ width: w, height: w > 500 ? 900 : 844, deviceScaleFactor: 1 });
                await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
                await setup(c, k);
                await sleep(900);
                const a = await page.evaluate(READ, sel);
                if (a.error) { fails.push(`NB1 ${tag}: ${a.error}`); continue; }
                judged++;
                if (!/^rgb/.test(a.sw) || a.sw === 'rgba(0, 0, 0, 0)') fails.push(`NB1 ${tag}: no switch (--mq-next-color on :root)`);
                else if (a.first !== a.sw) fails.push(`NB1 ${tag}: the next box's ring is ${a.first || 'none'}, not the switch's ${a.sw} (${a.tag}: ${a.shadow})`);
                if (a.spread < 4) fails.push(`NB1 ${tag}: the ring is ${a.spread} px (want >= 4 px)`);
                if (a.bg !== 'rgb(255, 255, 255)') fails.push(`NB1 ${tag}: the next box's fill is ${a.bg} (want white)`);
                if (!a.anim || a.anim === 'none') fails.push(`NB1 ${tag}: the next box does not pulse`);
                if (/242, 194, 0/.test(a.cardShadow)) fails.push(`NB5 ${tag}: the current problem's card keeps a yellow ring (${a.cardShadow})`);
                // NB2: the one switch
                await page.evaluate(() => document.documentElement.classList.add('mq-next-yellow'));
                await sleep(50);
                const y = await page.evaluate(READ, sel);
                if (y.error || y.first !== YELLOW) fails.push(`NB2 ${tag}: html.mq-next-yellow paints ${y.first || y.error}, want ${YELLOW}`);
                await page.evaluate(() => document.documentElement.classList.remove('mq-next-yellow'));
                // NB4: reduced motion
                await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
                await sleep(50);
                const r = await page.evaluate(READ, sel);
                if (r.error || (r.anim && r.anim !== 'none')) fails.push(`NB4 ${tag}: reduced motion still animates (${r.anim || r.error})`);
                if (!r.error && r.first !== a.sw) fails.push(`NB4 ${tag}: reduced motion ring ${r.first}, want the static ${a.sw}`);
                await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
                // NB3: a wrong box keeps its red
                const wr = await page.evaluate((sel, R) => {
                    const box = document.querySelector(sel).querySelector('.mq-active-box');
                    box.classList.add('mq-live-wrong');
                    const out = (0, eval)('(' + R + ')')(sel);
                    box.classList.remove('mq-live-wrong');
                    return out;
                }, sel, READ.toString());
                if (wr.error) fails.push(`NB3 ${tag}: ${wr.error}`);
                else {
                    if (wr.first === a.sw) fails.push(`NB3 ${tag}: a wrong box shows the blue ring (${wr.shadow})`);
                    if (!/^rgb\((1[5-9]\d|2\d\d), (\d|[1-6]\d), (\d|[1-6]\d)\)$/.test(wr.border) && !/^rgb\((2[3-5]\d), 2[0-3]\d, 2[0-3]\d\)$/.test(wr.bg)) fails.push(`NB3 ${tag}: a wrong box is not red (border ${wr.border}, fill ${wr.bg})`);
                }
                console.log(`${tag.padEnd(44)} ring ${a.first} ${a.spread}px fill ${a.bg} anim ${a.anim}`);
            }
        }
        // NB6 (critic lf-vocab r7 #1, lf-vocab r9): the quiz, Match 3 answered wrong with instant feedback - EVERY wrong letter
        // box is red (box-wrong: .mq-live-wrong, a red edge) and none of them carries the blue next ring.
        // NB7 (lead default for critic r7 note 2, lf-vocab r9): 1 picture, 3 words takes its answer on the LINE - before an
        // answer the line carries the switch's next outline on every host; after a tap it carries none.
        if (!arg('skills', null) || SKILLS.some((s) => /^vocabulary:/.test(s))) {
            await page.reload({ waitUntil: 'networkidle2' });
            await page.waitForFunction(() => typeof window.generateQuestionFor === 'function' && !!window.SKILLS, { timeout: 30000 });
            await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
            await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
            const want = await page.evaluate(() => {
                const q = window.generateQuestionFor({ category: 'vocabulary', skill: 'vocab_grade_pictures', seed: 12 });
                const test = { id: null, name: 'Next', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions: [{ id: 0, skillId: 'vocab_grade_pictures', points: 1, questionData: window.quizQuestionData(q) }] }],
                    settings: { timeLimit: null, randomOrder: false, showFeedback: 'instant', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
                window.handleQuizURL(window.compressTestForURL(test));
                const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input'));
                window.startQuizTest();
                const p = q.cell.payload; const order = p.order || [0, 1, 2];
                return order.map((wi) => 'ABC'[wi]);
            });
            await sleep(600);
            const boxes = await page.$$('#quizTakeView .qt-question-card .mq-vm-box input');
            if (boxes.length !== 3) fails.push(`NB6 quiz Match 3: ${boxes.length} letter box(es), want 3`);
            else {
                // every box wrong: the next letter round
                const wrong = want.map((l) => 'ABC'[('ABC'.indexOf(l) + 1) % 3]);
                for (let i = 0; i < 3; i++) { await boxes[i].click(); await page.keyboard.type(wrong[i]); }
                await page.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur(); document.body.click(); });
                await sleep(1500);
                const st = await page.evaluate(() => {
                    const sw = getComputedStyle(document.documentElement).getPropertyValue('--mq-next-color').trim();
                    const probe = document.createElement('span'); document.body.appendChild(probe); probe.style.color = sw; const swc = getComputedStyle(probe).color; probe.remove();
                    return [...document.querySelectorAll('#quizTakeView .qt-question-card .mq-vm-box input')].map((el) => {
                        const cs = getComputedStyle(el);
                        return { v: el.value, wrong: el.classList.contains('mq-live-wrong'), border: cs.borderTopColor, first: (cs.boxShadow.match(/rgba?\([^)]*\)/) || [''])[0], swc, active: el.classList.contains('mq-active-box') };
                    });
                });
                st.forEach((b, i) => {
                    if (!b.wrong) fails.push(`NB6 quiz Match 3 box ${i + 1} ("${b.v}", wrong): not marked wrong (no .mq-live-wrong)`);
                    else if (!/^rgb\((1[5-9]\d|2\d\d), (\d|[1-6]\d), (\d|[1-6]\d)\)$/.test(b.border)) fails.push(`NB6 quiz Match 3 box ${i + 1}: its edge is ${b.border}, not red`);
                    if (b.first && b.first === b.swc) fails.push(`NB6 quiz Match 3 box ${i + 1}${b.active ? ' (the next box)' : ''}: a wrong box carries the blue next ring`);
                });
                judged++;
                console.log(`${'vocabulary:vocab_grade_pictures quiz-wrong'.padEnd(44)} ${st.map((b) => `${b.v}:${b.wrong ? 'red' : 'plain'}`).join(' ')}`);
            }
            const lineRead = (sel) => page.evaluate((sel) => {
                const line = document.querySelector(`${sel} .mq-vp-line`);
                if (!line) return { error: 'no .mq-vp-line' };
                const sw = getComputedStyle(document.documentElement).getPropertyValue('--mq-next-color').trim();
                const probe = document.createElement('span'); document.body.appendChild(probe); probe.style.color = sw; const swc = getComputedStyle(probe).color; probe.remove();
                const cs = getComputedStyle(line);
                return { first: (cs.boxShadow.match(/rgba?\([^)]*\)/) || [''])[0], swc, pills: [...document.querySelectorAll(`${sel} button[data-mq-choice]`)].map((b) => (getComputedStyle(b).boxShadow.match(/rgba?\([^)]*\)/) || [''])[0]) };
            }, sel);
            for (const [hn, sel, w, setup] of hosts) {
                const tag = `vocabulary:vocab_pick3_words ${hn}`;
                await page.reload({ waitUntil: 'networkidle2' });
                await page.waitForFunction(() => typeof window.generateQuestionFor === 'function' && !!window.SKILLS, { timeout: 30000 });
                await page.setViewport({ width: w, height: w > 500 ? 900 : 844, deviceScaleFactor: 1 });
                await setup('vocabulary', 'vocab_pick3_words');
                await sleep(900);
                const a = await lineRead(sel);
                if (a.error) { fails.push(`NB7 ${tag}: ${a.error}`); continue; }
                judged++;
                if (a.first !== a.swc) fails.push(`NB7 ${tag}: before an answer the line's outline is ${a.first || 'none'}, not the switch's ${a.swc}`);
                if (a.pills.some((c) => c === a.swc)) fails.push(`NB7 ${tag}: a word pill carries the next outline (the pills stay plain)`);
                // (the tapped problem is read again, not the host's next one: the worksheet moves on to the next problem)
                await page.evaluate((sel) => { const h = document.querySelector(sel); if (h) h.setAttribute('data-nb7', '1'); }, sel);
                const btn = await page.$(`${sel} button[data-mq-choice]`);
                if (btn) { await btn.click(); await sleep(900); }
                const b = await lineRead('[data-nb7="1"]');
                if (!b.error && b.first === b.swc) fails.push(`NB7 ${tag}: after a tap the line still carries the next outline`);
                console.log(`${tag.padEnd(44)} line before ${a.first} after ${b.first || 'none'}`);
            }
        }
    } finally { await app.close(); }
    console.log(`ws-next-box: ${judged} host(s) judged`);
    for (const f of fails.slice(0, 40)) console.log(`  - ${f}`);
    console.log(`ws-next-box: ${fails.length ? `FAIL (${fails.length})` : 'OK'}`);
    process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); console.log('ws-next-box: FAIL'); process.exit(1); });
