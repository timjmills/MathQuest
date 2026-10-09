// Small fixes item 1 (2026-10-09): in a count-by row the caret never moved on, so in the QUIZ typing "21" then "28"
// put "2128" in one box. A box holding its number's digit count now hands the caret to the next box, on every host
// (practice card, online worksheet, quiz), right or wrong digits alike, and the phone's swipe row still shows the
// box the caret lands in.
//
// The pupil taps the FIRST box once and then only types: every box must hold exactly its own number.
// Run: node tests/scripts/small-fixes-countrow-caret.cjs
const { open } = require('../lib/ws-harness.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fails = 0;
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };

const SIZES = [{ width: 1366, height: 650 }, { width: 1280, height: 600 }, { width: 390, height: 844 }];
// the default row (5 boxes) and a long row of 3-digit numbers (12 numbers: the phone row swipes)
const SKILLS = [['multiplication', 'count_by_tables', null], ['multiplication', 'count_by_tables', { rows: [{ step: 25, start: 'step', dir: 'up' }] }]];
const ONLY = process.env.SIZES ? process.env.SIZES.split(',').map(Number) : null;

async function boot(page) {
  await page.reload({ waitUntil: 'networkidle2' });
  await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
  await page.evaluate(() => { try { localStorage.setItem('mathquest_onboarded', '1'); } catch (e) { /* ignore */ } });
}

async function mount(page, host, c, k, seed, opts) {
  return page.evaluate(async (host, c, k, seed, opts) => {
    const st = window.state;
    st.range = 100; st.decimalPlaces = 0; st.isMixedMode = false; st.quizMode = false; st.hasAnswered = false; st.skillOptions = opts;
    const q = window.generateQuestionFor({ category: c, skill: k, seed, itemIndex: 0, opts: opts || undefined });
    if (host === 'quiz') {
      const questions = [{ id: 0, skillId: k, points: 1, questionData: window.quizQuestionData(Object.assign({ categoryId: c }, q)) }];
      const test = { id: null, name: 'caret', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }],
        settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
      window.handleQuizURL(window.compressTestForURL(test));
      const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input'));
      window.startQuizTest();
    } else if (host === 'card') {
      st.category = c; st.skill = k; st.gameMode = 'practice'; st.currentQAttempts = 0;
      window.showView('gameView');
      st.currentQ = q; window.renderQuestion();
    } else {
      st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.problemCount = 2;
      window.initWorksheet();
    }
    return true;
  }, host, c, k, seed, opts);
}

(async () => {
for (const vp of SIZES) {
  for (const host of ['quiz', 'card', 'worksheet']) {
    for (const [c, k, opts] of SKILLS) {
      if (ONLY && !ONLY.includes(vp.width)) continue;
      for (const wrong of [false, true]) {
        const app = await open({ viewport: { ...vp, deviceScaleFactor: 1, isMobile: vp.width < 480, hasTouch: vp.width < 480 } });
        const { page } = app;
        const errs = [];
        page.on('pageerror', (e) => errs.push(String(e)));
        try {
          await boot(page);
          await mount(page, host, c, k, 11, opts);
          await sleep(900);
          await page.evaluate(() => { const d = document.getElementById('mqWorkedDismiss'); if (d) d.click(); });
          const root = host === 'quiz' ? '#quizTakeView' : host === 'card' ? '#questionCard' : '#ws_card_0';
          const info = await page.evaluate((root, host) => {
            const r = document.querySelector(root);
            const els = [...r.querySelectorAll('input.mq-cellslot:not(.mq-cellslot-host)')];
            els.forEach((e, i) => e.setAttribute('data-t', String(i)));
            const q = host === 'quiz' ? window.state.quizAllQuestions[0].question.questionData : host === 'card' ? window.state.currentQ : window.state.worksheetQs[0];
            // the number before each box in the row (printed or a box): a box moves on by itself only when its length matches it
            const vals = (q.cell && q.cell.payload && q.cell.payload.values) || [];
            const bl = ((q.cell && q.cell.payload && q.cell.payload.blanks) || []).map(Number);
            const prevLen = bl.map((i) => (i > 0 ? String(vals[i - 1]).replace(/\D/g, '').length : 0));
            return { n: els.length, ans: String(q.ans), full: els.map((e) => e.dataset.mqFull || ''), prevLen };
          }, root, host);
          const tag = `[${vp.width}x${vp.height} ${host} ${k}${opts ? ' by 25' : ''}${wrong ? ' wrong digits' : ''}]`;
          const exp = info.ans.split(/\s*,\s*/).slice(0, info.n);
          const wantFull = exp.map((e) => e.replace(/\D/g, '').length);
          check(info.n >= 2 && info.full.every((f, i) => (Number(f) || 0) === wantFull[i]), `${tag} ${info.n} boxes, each knows its number's digit count (${info.full.join('/')})`);
          // wrong: change the last digit of every number (same length), so nothing turns green to move the caret
          const typed = exp.map((e) => (wrong ? e.replace(/\d$/, (m) => String((Number(m) + 1) % 10)) : e).replace(/\D/g, ''));
          // the pupil taps the first box once, then just types
          const b0 = await page.$('[data-t="0"]');
          await b0.evaluate((el) => el.scrollIntoView({ block: 'center' }));
          if (vp.width < 480) await b0.tap(); else await b0.click();
          await sleep(150);
          let offView = 0, stayFails = 0;
          for (let i = 0; i < typed.length; i++) {
            await page.keyboard.type(typed[i], { delay: 20 });
            // the caret never moves by itself (it would tell the answer's length): it stays until the pupil's next number
            // (on the card and the worksheet a RIGHT number turns green and hands the caret on - owner 2026-10-04; that shows nothing new)
            await sleep(150);
            const stays = await page.evaluate((i) => document.activeElement === document.querySelector(`[data-t="${i}"]`), i);
            if (!stays && (wrong || host === 'quiz')) { stayFails++; console.log('   box', i, 'moved on by itself'); }
            await sleep(700);   // the pupil thinks of the next number
            await sleep(120);
            // the box the caret is now in is fully on screen and inside its row's window
            const ok = await page.evaluate(() => {
              const a = document.activeElement;
              if (!a || a.tagName !== 'INPUT') return true;
              const r = a.getBoundingClientRect();
              const w = a.closest('[data-mq-swiperow]');
              if (w && getComputedStyle(w).overflowX !== 'visible') { const v = w.getBoundingClientRect(); if (r.left < v.left - 1 || r.right > v.right + 1) return `x ${Math.round(r.left)}-${Math.round(r.right)} in ${Math.round(v.left)}-${Math.round(v.right)}`; }
              // a phone (basic check, STATUS 00): its emulated viewport rescales as the page settles - most of the box on screen is enough
              const slack = innerWidth < 480 ? r.height * 0.2 : 1;
              return r.top >= -slack && r.bottom <= innerHeight + slack ? true : `y ${Math.round(r.top)}-${Math.round(r.bottom)} of ${innerHeight}`;
            });
            if (ok !== true && i < typed.length - 1) { offView++; console.log('   off after box', i, ok); }
          }
          const vals = await page.evaluate(() => [...document.querySelectorAll('[data-t]')].map((e) => e.value));
          const want = typed.map((t, i) => (wrong ? t : exp[i].replace(/\D/g, '')));
          const got = vals.map((v) => v.replace(/\D/g, ''));
          check(JSON.stringify(got) === JSON.stringify(want), `${tag} every box holds its own number: ${got.join('|')} (want ${want.join('|')})`);
          check(offView === 0, `${tag} the box the caret moves to is in view each time (${offView} off)`);
          check(stayFails === 0, `${tag} a full box keeps the caret until the pupil's next number (${stayFails})`);
          // a number too long for its box, typed in one go, stays in that box (critic r1 D1, wave1-a3)
          const bi = 0;
          if (bi >= 0 && !wrong && host !== 'quiz') {
            await page.evaluate((i) => { const el = document.querySelector(`[data-t="${i}"]`); el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); el.focus(); el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); }, bi);
            await page.keyboard.type(exp[bi].replace(/\D/g, '') + '0', { delay: 20 });
            const v = await page.evaluate((i) => document.querySelector(`[data-t="${i}"]`).value.replace(/\D/g, ''), bi);
            check(v === exp[bi].replace(/\D/g, '') + '0', `${tag} a too-long number typed in one go stays in its box (${v})`);
          }
          if (host === 'quiz') {
            const hidden = await page.evaluate(() => document.getElementById('qtAnswerInput').value);
            check(hidden.split(/\s*,\s*/).map((v) => v.replace(/\D/g, '')).join('|') === want.join('|'), `${tag} the quiz answer composes one number per box (${hidden})`);
          }
          check(errs.length === 0, `${tag} no page errors ${errs.join(' ')}`);
        } catch (e) {
          check(false, `[${vp.width} ${host} ${k}] ${e.message}`);
        } finally { await app.close(); }
      }
    }
  }
}
console.log(fails ? `small-fixes-countrow-caret: FAIL (${fails})` : 'small-fixes-countrow-caret: OK');
process.exit(fails ? 1 : 0);
})();
