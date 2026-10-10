// Small fixes item 1 (2026-10-09; critic r1 D1, r2 N1/N2): in a count-by row the caret never moved on, so in the QUIZ typing
// "21" then "28" put "2128" in one box. The rule now, on every host (practice card, online worksheet, quiz):
//   - the caret never moves by itself on a pause or on a box's own answer (that would tell the answer's length);
//   - Space, a comma, Enter or Tab after a number moves on, and the row says so under it (a tap, on a touch screen);
//   - a box takes as many digits as the row's WIDEST number (the same for every box); a digit typed past that goes on to the
//     next box, never lost - so a row of same-length numbers typed straight on still lands one number per box.
// Run: node tests/scripts/small-fixes-countrow-caret.cjs     (SIZES=1366,390 to limit the viewports)
const { open } = require('../lib/ws-harness.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fails = 0;
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };

const SIZES = [{ width: 1366, height: 650 }, { width: 1280, height: 600 }, { width: 390, height: 844 }];
const ONLY = process.env.SIZES ? process.env.SIZES.split(',').map(Number) : null;
const ROWS = {
  default: null,
  by25: { rows: [{ step: 25, start: 'step', dir: 'up' }] },
  by25lines: { rows: [{ step: 25, start: 'step', dir: 'up' }], spaces: 'line' },
  by7: { rows: [{ step: 7, start: 'step', dir: 'up' }] },
};
const digits = (s) => String(s).replace(/\D/g, '');

async function mount(page, host, opts, seed) {
  return page.evaluate(async (host, opts, seed) => {
    const st = window.state;
    const c = 'multiplication', k = 'count_by_tables';
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
  }, host, opts, seed);
}

async function setup(app, host, opts, vp) {
  const { page } = app;
  await page.reload({ waitUntil: 'networkidle2' });
  await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
  await page.evaluate(() => { try { localStorage.setItem('mathquest_onboarded', '1'); } catch (e) { /* ignore */ } });
  await mount(page, host, opts, 11);
  await sleep(900);
  await page.evaluate(() => { const d = document.getElementById('mqWorkedDismiss'); if (d) d.click(); });
  const root = host === 'quiz' ? '#quizTakeView' : host === 'card' ? '#questionCard' : '#ws_card_0';
  return page.evaluate((root, host) => {
    const r = document.querySelector(root);
    const els = [...r.querySelectorAll('input.mq-cellslot:not(.mq-cellslot-host)')];
    els.forEach((e, i) => e.setAttribute('data-t', String(i)));
    const q = host === 'quiz' ? window.state.quizAllQuestions[0].question.questionData : host === 'card' ? window.state.currentQ : window.state.worksheetQs[0];
    const keys = r.querySelector('.k2-countrow-keys');
    const vis = (sel) => { const e = keys && keys.querySelector(sel); return !!e && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0; };
    return { n: els.length, ans: String(q.ans), max: els.map((e) => e.dataset.mqMax || ''), maxlength: els.map((e) => e.maxLength),
      values: (q.cell && q.cell.payload && q.cell.payload.values) || [], typeLine: vis('.k2-keys-type'), touchLine: vis('.k2-keys-touch') };
  }, root, host);
}

async function tapFirst(page, touch) {
  const b0 = await page.$('[data-t="0"]');
  await b0.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  if (touch) await b0.tap(); else await b0.click();
  await sleep(150);
}
const boxVals = (page) => page.evaluate(() => [...document.querySelectorAll('[data-t]')].map((e) => e.value));
const active = (page) => page.evaluate(() => Number((document.activeElement && document.activeElement.getAttribute('data-t')) ?? -1));

(async () => {
  for (const vp of SIZES) {
    if (ONLY && !ONLY.includes(vp.width)) continue;
    const touch = vp.width < 480;
    for (const host of ['quiz', 'card', 'worksheet']) {
      for (const [rk, opts] of Object.entries(ROWS)) {
        const app = await open({ viewport: { ...vp, deviceScaleFactor: 1, isMobile: touch, hasTouch: touch } });
        const { page } = app;
        const errs = [];
        page.on('pageerror', (e) => errs.push(String(e)));
        const tag = `[${vp.width}x${vp.height} ${host} ${rk}]`;
        try {
          let info = await setup(app, host, opts, vp);
          const exp = info.ans.split(/\s*,\s*/).slice(0, info.n).map(digits);
          const W = Math.max(...info.values.map((v) => digits(v).length));
          check(info.n >= 2 && info.max.every((m) => Number(m) === W) && info.maxlength.every((m) => m === W),
            `${tag} ${info.n} boxes, each takes the row's widest number: ${W} digits (${info.max.join('/')})`);
          check(touch ? info.touchLine && !info.typeLine : info.typeLine && !info.touchLine, `${tag} the row says how to move on (${touch ? 'tap' : 'Space'})`);
          if (touch) {
            // phone (basic): tapping each box and typing lands every number in its box
            for (let i = 0; i < exp.length; i++) {
              const b = await page.$(`[data-t="${i}"]`);
              await b.evaluate((el) => { const w = el.closest('[data-mq-swiperow]'); if (w) { const v = w.getBoundingClientRect(), r = el.getBoundingClientRect(); w.scrollLeft += r.left - v.left - 8; } el.scrollIntoView({ block: 'center' }); });
              await sleep(350); await b.tap(); await sleep(200);
              await page.keyboard.type(exp[i], { delay: 30 });
            }
            const got = (await boxVals(page)).map(digits);
            check(JSON.stringify(got) === JSON.stringify(exp), `${tag} tap + type: ${got.join('|')} (want ${exp.join('|')})`);
            check(errs.length === 0, `${tag} no page errors ${errs.join(' ')}`);
            continue;
          }
          // A. a SLOW pupil (750 ms between keys), Space after each number: the caret never moves inside a number
          await tapFirst(page, false);
          let moved = 0;
          for (let i = 0; i < exp.length; i++) {
            for (const ch of exp[i]) { await page.keyboard.type(ch); await sleep(750); if ((await active(page)) !== i && host === 'quiz') moved++; }
            if (i < exp.length - 1) await page.keyboard.press('Space');
            await sleep(150);
          }
          let got = (await boxVals(page)).map(digits);
          check(JSON.stringify(got) === JSON.stringify(exp), `${tag} slow typing, Space after each number: ${got.join('|')} (want ${exp.join('|')})`);
          if (host === 'quiz') check(moved === 0, `${tag} the caret never moved by itself inside a number (${moved})`);
          if (host === 'quiz') {
            const hidden = await page.evaluate(() => document.getElementById('qtAnswerInput').value);
            check(hidden.split(/\s*,\s*/).map(digits).join('|') === exp.join('|'), `${tag} the quiz answer composes one number per box (${hidden})`);
          }
          // B. comma after each number, fast; then C. no separator at all
          for (const mode of ['comma', 'none']) {
            info = await setup(app, host, opts, vp);
            await tapFirst(page, false);
            for (let i = 0; i < exp.length; i++) {
              await page.keyboard.type(exp[i], { delay: 30 });
              if (mode === 'comma' && i < exp.length - 1) await page.keyboard.type(',');
            }
            await sleep(200);
            got = (await boxVals(page)).map(digits);
            const typedDigits = exp.join('');
            if (mode === 'comma' || exp.every((e) => e.length === W)) {
              check(JSON.stringify(got) === JSON.stringify(exp), `${tag} ${mode === 'comma' ? 'commas between numbers' : 'numbers all ' + W + ' digits, typed straight on'}: ${got.join('|')}`);
            } else {
              // mixed lengths with no separator cannot be split by the screen without telling lengths: nothing may be lost
              check(got.join('') === typedDigits && got.every((g) => g.length <= W), `${tag} no separator, mixed lengths: no digit lost, no box over ${W} (${got.join('|')})`);
            }
          }
          // D. a number too long for the row, typed in one go: the extra digit goes to the next box, never dropped
          info = await setup(app, host, opts, vp);
          await tapFirst(page, false);
          const long = exp[0] + '0'.repeat(W - exp[0].length + 1);
          await page.keyboard.type(long, { delay: 30 });
          await sleep(150);
          got = (await boxVals(page)).map(digits);
          check(got.join('') === long && got.every((g) => g.length <= W), `${tag} a number longer than the row's widest keeps every digit (${got.join('|')})`);
          check(errs.length === 0, `${tag} no page errors ${errs.join(' ')}`);
        } catch (e) {
          check(false, `${tag} ${e.message}`);
        } finally { await app.close(); }
      }
    }
  }
  console.log(fails ? `small-fixes-countrow-caret: FAIL (${fails})` : 'small-fixes-countrow-caret: OK');
  process.exit(fails ? 1 : 0);
})();
