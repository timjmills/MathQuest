// Critic r3: the app-wide "full box hands the caret on" (active-box.js advanceIfFull) on a spread of
// multi-box skills, on the card, the online worksheet and the quiz, at Chromebook size with mouse and touch.
// Per skill and host: click / tap the pulsing box, type a non-answer digit once per box (+1), then Backspace
// and one more digit (correction). After every key: which box has the caret and every box's value.
// Invariants: the caret never enters a box that already holds a digit; carry / regroup boxes stay empty;
// no key is lost while a fillable empty box remains (keys typed = characters held); the caret never leaves the
// problem (the worksheet may move to the next card once this one is full); a count-by row keeps its own rule;
// Backspace removes one character where the caret is and the next digit lands there.
// VIEWS=WxH[t]  SKILLS=id,id  HOSTS=card,worksheet,quiz  DIGIT=1
const T = process.env.MQ_TREE || require('path').resolve(__dirname, '../../../..');
const { open } = require(T + '/tests/lib/ws-harness.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SK = (process.env.SKILLS || 'add_2digit_regroup,add_3digit,sub_2digit_regroup,sub_3digit,multiply_2by1,area_model_mult,fact_families,number_families,count_by_tables,mult_missing_digit,long_div_2digit,div_remainders,box_division_easy,equivalent,improper_mixed,add_mixed_like,add_decimal,coordinate_q1,money_notation,elapsed_find_duration,expand,unit_form,place_value_disks,cloze_addition,add_wp_100,sub_wp_100,multi_step_word,function_table_easy,hundreds_chart_fill').split(',');
const HOSTS = (process.env.HOSTS || 'card,worksheet,quiz').split(',');
const DIG = process.env.DIGIT || '1';

const snapFn = (hostSel) => {
    const host = document.querySelector(hostSel);
    if (!host) return { err: 'no host ' + hostSel };
    const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    const all = [...host.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=button]), textarea')].filter(vis);
    all.forEach((b, i) => { if (!b.dataset.cr) b.dataset.cr = 'b' + Math.random().toString(36).slice(2, 8); });
    const ae = document.activeElement;
    return {
        boxes: all.map((b) => ({ id: b.dataset.cr, v: b.value, max: b.maxLength, opt: /carry|regroup/i.test(b.className) || /regroup|carry/i.test((b.closest('[data-mq-kind]') || b).getAttribute('data-mq-kind') || ''),
            swipe: !!b.closest('[data-mq-swiperow]'), blankWW: b.matches('input.mq-wwork') && b.getAttribute('data-mq-expect') === '', sign: b.matches('input.mq-wwork') && /sign|op/i.test(b.getAttribute('data-mq-kind') || b.className),
            ro: b.readOnly || b.disabled })),
        focus: ae && ae.dataset ? ae.dataset.cr || (host.contains(ae) ? 'in-host:' + ae.tagName : 'OUT:' + (ae.id || ae.className || ae.tagName)) : 'none',
        active: (host.querySelector('.mq-active-box') || {}).dataset ? host.querySelector('.mq-active-box').dataset.cr : null,
    };
};

(async () => {
    const allFails = [];
    for (const V of (process.env.VIEWS || '1366x650,1366x650t').split(',')) {
        const [W, H] = V.replace(/[a-z]+$/, '').split('x').map(Number); const touch = /t$/.test(V);
        const app = await open({ seed: 9, viewport: { width: W, height: H, deviceScaleFactor: 1, isMobile: false, hasTouch: touch } });
        const { page } = app;
        await page.waitForFunction(() => typeof window.generateQuestionFor === 'function' && !!window.SKILLS, { timeout: 30000 });
        const resolved = await page.evaluate((ids) => ids.map((id) => {
            if (id.includes(':')) return id;
            for (const c of Object.keys(window.SKILLS)) if ((window.SKILLS[c] || []).some((s) => (s.v || s.id || s) === id)) return c + ':' + id;
            return null;
        }), SK);
        SK.forEach((id, i) => { if (!resolved[i]) console.log(`${V} skip ${id}: no such skill`); });
        for (const s of resolved.filter(Boolean)) {
            const [c, k] = s.split(':');
            for (const host of HOSTS) {
                let hostSel;
                await page.reload({ waitUntil: 'networkidle2' });
                await page.waitForFunction(() => typeof window.generateQuestionFor === 'function' && !!window.SKILLS, { timeout: 30000 });
                try {
                    if (host === 'card') {
                        await page.evaluate((c, k) => { const st = window.state; st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false;
                            window.showView('gameView'); st.currentQ = window.generateQuestionFor({ category: c, skill: k, seed: 77, itemIndex: 2 }); window.renderQuestion(); }, c, k);
                        hostSel = '#questionCard'; await sleep(700);
                    } else if (host === 'worksheet') {
                        await page.evaluate((c, k) => { const st = window.state; st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 2; window.initWorksheet(); }, c, k);
                        await page.waitForFunction(() => { const g = document.getElementById('worksheetGrid'); return !!g && g.dataset.mqLaidOut === '1'; }, { timeout: 30000 }).catch(() => {});
                        await sleep(1500);
                        hostSel = '#ws_card_0';
                    } else {
                        await page.evaluate((c, k) => {
                            const questions = [0, 1].map((i) => ({ id: i, skillId: k, points: 1, questionData: Object.assign(window.quizQuestionData(window.generateQuestionFor({ category: c, skill: k, seed: 77 + i, itemIndex: 2 })), { categoryId: c, skillId: k }) }));
                            const test = { id: null, name: 'P', sections: [{ id: 0, label: 'A', layout: { columns: 1, spacing: 'normal' }, instructions: '', questions }],
                                settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
                            window.handleQuizURL(window.compressTestForURL(test));
                            const nm = document.getElementById('qtStudentName'); nm.value = 'A'; nm.dispatchEvent(new Event('input')); window.startQuizTest();
                        }, c, k);
                        hostSel = '.qt-question-card'; await sleep(900);
                    }
                    let snap = await page.evaluate(snapFn, hostSel);
                    if (snap.err) { console.log(`${V} ${s} ${host}: ${snap.err}`); continue; }
                    const fillable = snap.boxes.filter((b) => !b.opt && !b.blankWW && !b.ro && !b.sign);
                    if (fillable.length < 2) { console.log(`${V} ${s} ${host}: ${fillable.length} box(es), single-box item, skipped`); continue; }
                    const start = snap.active || fillable[0].id;
                    const sel = `[data-cr="${start}"]`;
                    await page.$eval(sel, (e) => e.scrollIntoView({ block: 'center' }));
                    if (touch) await page.tap(sel); else await page.click(sel);
                    await sleep(250);
                    const fails = [];
                    const trail = [];
                    const optIds = new Set(snap.boxes.filter((b) => b.opt).map((b) => b.id));
                    let typed = 0;
                    const held = (sn) => sn.boxes.filter((b) => !b.opt).reduce((n, b) => n + String(b.v).length, 0);
                    const base = held(snap);
                    const N = fillable.length + 1;
                    for (let i = 0; i < N; i++) {
                        const before = await page.evaluate(snapFn, hostSel);
                        await page.keyboard.type(DIG); typed++;
                        await sleep(180);
                        const after = await page.evaluate(snapFn, hostSel);
                        const fb = before.boxes.find((b) => b.id === after.focus);
                        if (after.focus !== before.focus && fb && String(fb.v) !== '') fails.push(`key ${i + 1}: caret moved into a filled box`);
                        if (/^OUT:/.test(after.focus) && !(host === 'worksheet')) fails.push(`key ${i + 1}: caret left the problem (${after.focus})`);
                        after.boxes.forEach((b) => { if (optIds.has(b.id) && b.v) fails.push(`key ${i + 1}: carry/regroup box got "${b.v}"`); });
                        const emptyLeft = before.boxes.some((b) => !b.opt && !b.blankWW && !b.ro && !b.sign && !b.swipe && b.v === '');
                        const lost = held(before) + 1 > held(after);
                        if (lost && emptyLeft) {
                            const fo = before.boxes.find((b) => b.id === before.focus);
                            if (!(fo && fo.swipe) && !(fo && fo.sign)) fails.push(`key ${i + 1}: digit lost with an empty box left (caret in ${fo ? `box max ${fo.max} "${fo.v}"` : before.focus})`);
                        }
                        trail.push(after.boxes.map((b) => (b.id === after.focus ? '*' : '') + (b.opt ? '(c)' : '') + (b.v || '_')).join('|'));
                        if (host === 'worksheet' && /^OUT:/.test(after.focus)) break;
                    }
                    // correction
                    const pre = await page.evaluate(snapFn, hostSel);
                    const fbox = pre.boxes.find((b) => b.id === pre.focus);
                    if (fbox && fbox.v) {
                        await page.keyboard.press('Backspace'); await sleep(150);
                        const bs = await page.evaluate(snapFn, hostSel);
                        const fb2 = bs.boxes.find((b) => b.id === fbox.id);
                        const okBs = (fb2 && fb2.v.length === fbox.v.length - 1 && bs.focus === fbox.id) || (fb2 && fb2.v === '' );
                        await page.keyboard.type('2'); await sleep(180);
                        const fx = await page.evaluate(snapFn, hostSel);
                        const fb3 = fx.boxes.find((b) => b.id === fbox.id);
                        const landed = fb3 && fb3.v.endsWith('2');
                        trail.push('BS+2: ' + fx.boxes.map((b) => (b.id === fx.focus ? '*' : '') + (b.v || '_')).join('|'));
                        if (!okBs) fails.push(`Backspace: box "${fbox.v}" -> "${fb2 ? fb2.v : '?'}", caret ${bs.focus === fbox.id ? 'stayed' : 'moved'}`);
                        if (!landed && !(fb2 && fb2.v === '' && fx.boxes.some((b) => b.v.endsWith('2')))) fails.push('correction digit did not land in the corrected box');
                    }
                    const res = fails.length ? 'FAIL ' + [...new Set(fails)].join('; ') : 'ok';
                    console.log(`${V} ${s} ${host} boxes=${snap.boxes.length} (opt ${optIds.size}) typed=${typed} ${res}\n    ${trail.join('\n    ')}`);
                    if (fails.length) allFails.push(`${V} ${s} ${host}: ${[...new Set(fails)].join('; ')}`);
                } catch (e) { console.log(`${V} ${s} ${host}: EXC ${e.message.slice(0, 120)}`); }
            }
        }
        await app.close();
    }
    console.log(allFails.length ? `caret-spread: ${allFails.length} FAIL\n  ` + allFails.join('\n  ') : 'caret-spread: OK');
})().catch((e) => { console.log('EXC', e.stack); process.exit(2); });
