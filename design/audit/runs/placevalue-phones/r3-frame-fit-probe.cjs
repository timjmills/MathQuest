// Critic r3: N3 (frameHTML line breaks) and Chromebook reach, on the card, the online worksheet and the quiz.
// For every .pv-frame on screen: no line starts with "=" / "≈", no number ends a line whose next line starts
// with a word, "=" never ends a line above its box, and the frame does not overflow its cell.
// On the card: the problem top, the answer box and Check are all inside the first viewport (no scroll).
// VIEWS=WxH[t touch|m phone]   SHOTS=1 writes r3-<host>-<view>-<tag>.png beside this file.
const T = process.env.MQ_TREE || require('path').resolve(__dirname, '../../../..');
const { open } = require(T + '/tests/lib/ws-harness.cjs');
const path = require('path');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const OUT = __dirname;
const SHOTS = !!process.env.SHOTS;

const frameCheck = () => {
    const out = [];
    const isNum = (s) => /^\d[\d,.]*$/.test(s);
    const isSign = (s) => /^[+−×÷=≈→<>-]$/.test(s);
    document.querySelectorAll('.pv-frame').forEach((fr) => {
        const fb = fr.getBoundingClientRect();
        if (!fb.width) return;
        const toks = [];
        fr.querySelectorAll('span, input').forEach((el) => {
            if (el.tagName === 'INPUT') { const r = el.getBoundingClientRect(); if (r.width) toks.push({ t: '[]', r }); return; }
            if (el.children.length) return;
            const t = el.textContent.trim(); if (!t) return;
            if (el.closest('[data-mq-cell], .mq-cellbox') && !el.closest('input')) { /* slot internals */ }
            const r = el.getBoundingClientRect(); if (r.width) toks.push({ t, r });
        });
        // slot elements without an input (print-like boxes) count as the box
        fr.querySelectorAll('.mq-cellbox').forEach((b) => { if (!b.querySelector('input')) { const r = b.getBoundingClientRect(); if (r.width) toks.push({ t: '[]', r }); } });
        toks.sort((a, b) => (Math.abs(a.r.bottom - b.r.bottom) > 12 ? a.r.top - b.r.top : a.r.left - b.r.left));
        const lines = [];
        for (const k of toks) {
            const L = lines[lines.length - 1];
            if (L && k.r.top < L.bottom - 6 && k.r.left >= L.right - 2) { L.items.push(k); L.bottom = Math.max(L.bottom, k.r.bottom); L.right = k.r.right; }
            else lines.push({ items: [k], bottom: k.r.bottom, right: k.r.right });
        }
        const text = lines.map((L) => L.items.map((k) => k.t).join(' ')).join(' / ');
        const bad = [];
        lines.forEach((L, i) => {
            const first = L.items[0].t, last = L.items[L.items.length - 1].t;
            if (i > 0 && /^[=≈]$/.test(first)) bad.push('line starts with ' + first);
            const nx = lines[i + 1];
            if (nx) {
                const n0 = nx.items[0].t;
                if (isNum(last) && !isNum(n0) && !isSign(n0) && n0 !== '[]') bad.push(`"${last}" split from "${n0}"`);
                if (/^[=≈]$/.test(last) && n0 === '[]') bad.push('= split from its box');
            }
        });
        const cell = fr.closest('.problem-card, .qt-question-card, #questionPaper, .ws-cell') || fr.parentElement;
        const cb = cell.getBoundingClientRect();
        if (fr.scrollWidth > fr.clientWidth + 1) bad.push(`frame scrolls (${fr.scrollWidth}>${fr.clientWidth})`);
        if (fb.right > cb.right + 1 || fb.left < cb.left - 1) bad.push('frame leaves its cell');
        toks.forEach((k) => { if (k.r.right > cb.right + 1) bad.push(`"${k.t}" past the cell edge`); });
        if (document.documentElement.scrollWidth > innerWidth + 1) bad.push('page scrolls sideways');
        out.push({ text, lines: lines.length, bad: [...new Set(bad)] });
    });
    return out;
};

(async () => {
    for (const V of (process.env.VIEWS || '1366x650,1280x602,390x780m').split(',')) {
        const [W, H] = V.replace(/[a-z]+$/, '').split('x').map(Number); const touch = /[tm]$/.test(V); const mob = /m$/.test(V);
        const app = await open({ seed: 7, viewport: { width: W, height: H, deviceScaleFactor: 1, isMobile: mob, hasTouch: touch } });
        const { page } = app;
        await page.waitForFunction(() => typeof window.generateQuestionFor === 'function' && !!window.SKILLS, { timeout: 30000 });
        // the items: both rename forms in each band, a standard 4-place item, disks (read + count), and every
        // other placevalue / number_sense skill whose cell is a pv frame (the frameHTML change touches them)
        const items = await page.evaluate(() => {
            const pick = (c, k, opts, test, tag) => { for (let s = 1; s < 4000; s++) { const q = window.generateQuestionFor({ category: c, skill: k, seed: s, itemIndex: s % 6, opts }); if (test(q)) return { c, k, opts, seed: s, itemIndex: s % 6, tag, text: q.text }; } return null; };
            const L = [];
            for (const band of [999, 9999]) {
                L.push(pick('placevalue', 'unit_form', { band, rename: 'more' }, (q) => q.pv && q.pv.rename && / = ___$/.test(q.text), `uf-rename-sum-${band}`));
                L.push(pick('placevalue', 'unit_form', { band, rename: 'more' }, (q) => q.pv && q.pv.rename && /tens \d/.test(q.text), `uf-rename-tens-${band}`));
            }
            L.push(pick('placevalue', 'unit_form', { band: 9999 }, (q) => q.pv && !q.pv.rename && q.pv.n > 999, 'uf-std-9999'));
            L.push(pick('placevalue', 'place_value_disks', { band: 9999, task: 'count' }, (q) => !!q.pv, 'pd-count-9999'));
            L.push(pick('placevalue', 'place_value_disks', { band: 999 }, (q) => !!q.pv, 'pd-read-999'));
            for (const c of ['placevalue', 'number_sense']) for (const k of (window.SKILLS[c] || []).map((s) => s.id || s)) {
                if (k === 'unit_form' || k === 'place_value_disks' || typeof k !== 'string') continue;
                let q = null; try { q = window.generateQuestionFor({ category: c, skill: k, seed: 11, itemIndex: 1 }); } catch (e) { continue; }
                const p = q && q.cell && q.cell.payload; const kind = p && (p.kind || (p.base && p.base.kind));
                if (kind === 'frame') L.push({ c, k, opts: undefined, seed: 11, itemIndex: 1, tag: `${k}`, text: q.text });
            }
            return L.filter(Boolean);
        });
        const fails = [];
        for (const it of items) {
            // ---- card
            await page.evaluate((it) => {
                const st = window.state; st.quizMode = false; st.category = it.c; st.skill = it.k; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false;
                st.skillOptions = it.opts || {};
                window.showView('gameView');
                st.currentQ = window.generateQuestionFor({ category: it.c, skill: it.k, seed: it.seed, itemIndex: it.itemIndex, opts: it.opts });
                window.renderQuestion(); window.scrollTo(0, 0);
            }, it);
            await sleep(700);
            const card = await page.evaluate(() => {
                const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
                const paper = document.getElementById('questionPaper');
                const box = [...paper.querySelectorAll('input')].filter(vis);
                const chk = [...document.querySelectorAll('button')].filter((b) => vis(b) && /submitAnswer/.test(b.getAttribute('onclick') || ''));
                const pr = paper.getBoundingClientRect();
                const bottoms = box.map((b) => b.getBoundingClientRect().bottom).concat(chk.map((b) => b.getBoundingClientRect().bottom));
                return { paperTop: Math.round(pr.top), lowest: Math.round(Math.max(0, ...bottoms)), boxes: box.length, check: chk.length, sy: Math.round(scrollY), vh: innerHeight, sw: document.documentElement.scrollWidth > innerWidth + 1 };
            });
            const cf = await page.evaluate(frameCheck);
            const reach = card.lowest <= card.vh && card.paperTop >= 0;
            const cardBad = cf.flatMap((f) => f.bad).concat(reach ? [] : [`not in first view: paper top ${card.paperTop}, lowest box/Check ${card.lowest} > ${card.vh}`]).concat(card.check ? [] : ['no Check']).concat(card.sw ? ['page scrolls sideways'] : []);
            console.log(`${V} card ${it.c}:${it.k} [${it.tag}] lines=${cf.map((f) => f.lines).join(',')} "${cf.map((f) => f.text).join(' | ')}" top=${card.paperTop} lowest=${card.lowest}/${card.vh} ${cardBad.length ? 'BAD ' + cardBad.join('; ') : 'ok'}`);
            if (cardBad.length) fails.push(`${V} card ${it.tag}: ${cardBad.join('; ')}`);
            if (SHOTS) await page.screenshot({ path: path.join(OUT, `r3-card-${V}-${it.tag}.png`) });
            // ---- quiz (4 items of the same spec, seeds it.seed..)
            await page.evaluate((it) => {
                const questions = [0, 1, 2, 3].map((i) => ({ id: i, skillId: it.k, points: 1, questionData: Object.assign(window.quizQuestionData(window.generateQuestionFor({ category: it.c, skill: it.k, seed: it.seed, itemIndex: it.itemIndex, opts: it.opts })), { categoryId: it.c, skillId: it.k }) }));
                const test = { id: null, name: 'P', sections: [{ id: 0, label: 'A', layout: { columns: 1, spacing: 'normal' }, instructions: '', questions }],
                    settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
                window.handleQuizURL(window.compressTestForURL(test));
                const nm = document.getElementById('qtStudentName'); nm.value = 'A'; nm.dispatchEvent(new Event('input')); window.startQuizTest(); window.scrollTo(0, 0);
            }, it);
            await sleep(900);
            const qf = await page.evaluate(frameCheck);
            const qr = await page.evaluate(() => {
                const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
                const card = document.querySelector('.qt-question-card');
                const box = [...card.querySelectorAll('input')].filter(vis);
                const nxt = [...document.querySelectorAll('button')].filter((b) => vis(b) && /next/i.test(b.textContent));
                return { lowest: Math.round(Math.max(0, ...box.map((b) => b.getBoundingClientRect().bottom), ...nxt.map((b) => b.getBoundingClientRect().bottom))), vh: innerHeight, sw: document.documentElement.scrollWidth > innerWidth + 1 };
            });
            const quizBad = qf.flatMap((f) => f.bad).concat(qr.lowest <= qr.vh ? [] : [`box/Next at ${qr.lowest} > ${qr.vh}`]).concat(qr.sw ? ['page scrolls sideways'] : []);
            console.log(`${V} quiz ${it.c}:${it.k} [${it.tag}] lines=${qf.map((f) => f.lines).join(',')} "${qf.map((f) => f.text).join(' | ')}" lowest=${qr.lowest}/${qr.vh} ${quizBad.length ? 'BAD ' + quizBad.join('; ') : 'ok'}`);
            if (quizBad.length) fails.push(`${V} quiz ${it.tag}: ${quizBad.join('; ')}`);
            if (SHOTS) await page.screenshot({ path: path.join(OUT, `r3-quiz-${V}-${it.tag}.png`) });
            await page.evaluate(() => { try { window.exitQuizTest && window.exitQuizTest(); } catch (e) { /* ignore */ } });
        }
        // ---- worksheet: 6 items of each unit_form / disks spec (the narrow cells)
        for (const it of items.filter((x) => /^uf-|^pd-/.test(x.tag))) {
            await page.reload({ waitUntil: 'networkidle2' });
            await page.waitForFunction(() => typeof window.initWorksheet === 'function', { timeout: 30000 });
            await page.evaluate((it) => {
                const st = window.state; st.category = it.c; st.skill = it.k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 6;
                st.skillOptions = it.opts || {};
                window.initWorksheet();
            }, it);
            await page.waitForFunction(() => { const g = document.getElementById('worksheetGrid'); return !!g && g.dataset.mqLaidOut === '1' && document.fonts.status === 'loaded'; }, { timeout: 30000 }).catch(() => {});
            await sleep(1200);
            const wf = await page.evaluate(frameCheck);
            const cols = await page.evaluate(() => { const c = [...document.querySelectorAll('#worksheetGrid .problem-card')]; return new Set(c.map((e) => Math.round(e.getBoundingClientRect().left))).size + ' cols, card w ' + (c[0] ? Math.round(c[0].getBoundingClientRect().width) : 0); });
            const wb = [...new Set(wf.flatMap((f) => f.bad))];
            console.log(`${V} worksheet ${it.c}:${it.k} [${it.tag}] ${cols} frames=${wf.length} lines=${wf.map((f) => f.lines).join(',')} ${wb.length ? 'BAD ' + wb.join('; ') + ' :: ' + wf.filter((f) => f.bad.length).map((f) => f.text).join(' | ') : 'ok'}`);
            if (wb.length) fails.push(`${V} worksheet ${it.tag}: ${wb.join('; ')}`);
            if (SHOTS) await page.screenshot({ path: path.join(OUT, `r3-worksheet-${V}-${it.tag}.png`), fullPage: true });
        }
        console.log(`${V}: ${fails.length ? fails.length + ' FAIL\n  ' + fails.join('\n  ') : 'all ok'}`);
        await app.close();
    }
})().catch((e) => { console.log('EXC', e.stack); process.exit(2); });
