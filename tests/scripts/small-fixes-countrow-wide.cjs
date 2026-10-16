// Small fixes item 8 (critic r7 O9): on SCREEN a count-by row whose numbers are wide (by 100,000 from 1,000,000; by 25,000)
// wraps onto more lines instead of shrinking its digits under TY-10a. At desktop width (1366x650, 1280x600), on every host
// (practice card, online worksheet, quiz): the givens and the typed answers are at the host's digit size (>= 29 px on the
// online worksheet, >= 40 px on the card and the quiz), every input holds its widest answer (scrollWidth <= clientWidth),
// there is no "Swipe for more boxes" cue and the page never scrolls sideways. At 390 the TY-10b phone row (~29 px, swipes)
// still holds (the row swipes in its cell, unchanged), and a row that already fits (by 5) is not redrawn. Run: node tests/scripts/small-fixes-countrow-wide.cjs   (SHOTS=<dir> saves screenshots)
const path = require('path');
const { open } = require('../lib/ws-harness.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fails = 0;
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };
const SIZES = [{ width: 1366, height: 650 }, { width: 1280, height: 600 }, { width: 390, height: 844 }].filter((v) => !process.env.SIZES || process.env.SIZES.split(',').map(Number).includes(v.width));
const ROWS = {
  '100000': { rows: [{ step: 100000, start: 'custom', at: 1000000 }] },
  '25000': { rows: [{ step: 25000 }] },
  by5: { rows: [{ step: 5 }] },     // a row that already fits: it keeps its two lines of six, unchanged
};
const HOST_PX = { worksheet: 29, card: 40, quiz: 40 };
const SHOTS = process.env.SHOTS || '';
const MEASURE = !!process.env.MEASURE;   // print only, for before/after numbers of other rows
const EXTRA = MEASURE ? { by2: { rows: [{ step: 2 }] }, by10: { rows: [{ step: 10 }] }, by25: { rows: [{ step: 25, start: 'step', dir: 'up' }] } } : {};

async function mount(page, host, opts, seed) {
  return page.evaluate(async (host, opts, seed) => {
    const st = window.state;
    const c = 'multiplication', k = 'count_by_tables';
    st.range = 100; st.decimalPlaces = 0; st.isMixedMode = false; st.quizMode = false; st.hasAnswered = false; st.skillOptions = opts;
    const q = window.generateQuestionFor({ category: c, skill: k, seed, itemIndex: 0, opts: opts || undefined });
    if (host === 'quiz') {
      const questions = [{ id: 0, skillId: k, points: 1, questionData: window.quizQuestionData(Object.assign({ categoryId: c }, q)) }];
      const test = { id: null, name: 'wide', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }],
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

(async () => {
  for (const vp of SIZES) {
    const phone = vp.width <= 480;
    for (const host of ['worksheet', 'card', 'quiz']) {
      for (const [rk, opts] of Object.entries(Object.assign({}, ROWS, EXTRA))) {
        const app = await open({ viewport: { ...vp, deviceScaleFactor: 1, isMobile: phone, hasTouch: phone } });
        const { page } = app;
        const errs = [];
        page.on('pageerror', (e) => errs.push(String(e)));
        const tag = `[${vp.width}x${vp.height} ${host} ${rk}]`;
        try {
          await page.reload({ waitUntil: 'networkidle2' });
          await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
          await page.evaluate(() => { try { localStorage.setItem('mathquest_onboarded', '1'); } catch (e) { /* ignore */ } });
          await mount(page, host, opts, 11);
          await sleep(1200);
          await page.evaluate(() => { const d = document.getElementById('mqWorkedDismiss'); if (d) d.click(); });
          await sleep(300);
          const root = host === 'quiz' ? '#quizTakeView' : host === 'card' ? '#questionCard' : '#ws_card_0';
          // type each box's own answer, so the width check reads a real answer in every box
          const m = await page.evaluate((root, host) => {
            const r = document.querySelector(root);
            const q = host === 'quiz' ? window.state.quizAllQuestions[0].question.questionData : host === 'card' ? window.state.currentQ : window.state.worksheetQs[0];
            const vals = (q.cell && q.cell.payload && q.cell.payload.values) || [];
            const blanks = (q.cell && q.cell.payload && q.cell.payload.blanks) || [];
            const ins = [...r.querySelectorAll('.k2-countrow-body input.mq-cellslot:not(.mq-cellslot-host)')];
            const widest = vals.reduce((a, v) => (String(v).length > a.length ? String(v) : a), '');
            ins.forEach((e) => { e.value = widest; });
            const fit = ins.map((e) => e.scrollWidth <= e.clientWidth + 0);
            ins.forEach((e) => { e.value = ''; });
            const givens = [...r.querySelectorAll('.k2-countrow-body .k2-given')];
            const fz = (e) => parseFloat(getComputedStyle(e).fontSize);
            const cue = [...r.querySelectorAll('.k2-swipe-cue')].some((e) => { const cs = getComputedStyle(e); const b = e.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && b.width > 0 && b.height > 0; });
            const sw = r.querySelector('[data-mq-swiperow]');
            const lines = new Set(ins.concat(givens).map((e) => Math.round(e.getBoundingClientRect().top / 10))).size;
            return { n: ins.length, blanks: blanks.length, widest, fit, inW: ins.map((e) => Math.round(e.getBoundingClientRect().width)),
              givenPx: givens.length ? Math.min(...givens.map(fz)) : 0, inputPx: ins.length ? Math.min(...ins.map(fz)) : 0,
              cue, swipeOver: sw ? sw.scrollWidth - sw.clientWidth : 0, lines, wrap: !!r.querySelector('.k2-countrow-body[data-mq-wrap]'),
              pageScroll: document.documentElement.scrollWidth - window.innerWidth };
          }, root, host);
          console.log(`  ${tag} widest ${m.widest} givens ${m.givenPx}px inputs ${m.inputPx}px boxes ${Math.min(...m.inW)}-${Math.max(...m.inW)}px lines ${m.lines} cue ${m.cue} swipeOver ${m.swipeOver} pageScroll ${m.pageScroll}`);
          if (SHOTS && rk === '100000' && (!phone ? true : host === 'worksheet')) {
            const el = await page.$(root);
            await el.evaluate((e) => e.scrollIntoView({ block: 'start' }));
            await page.screenshot({ path: path.join(SHOTS, `screen-${vp.width}-${host}-100000-O9-fixed.png`) });
          }
          if (MEASURE && !ROWS[rk]) continue;
          const px = HOST_PX[host];
          check(m.n >= 2, `${tag} ${m.n} answer boxes`);
          if (rk === 'by5') {
            // a row that fits is never redrawn as a wrapping line, on any screen (its look is unchanged)
            check(!m.wrap && (phone || m.lines === 2), `${tag} a fitting row is not redrawn (${m.lines} lines)`);
            if (phone) check(m.inputPx >= 28 && m.inputPx <= 30, `${tag} TY-10b phone digits ~29 px (${m.inputPx}px)`);
          } else if (!phone) {
            check(m.wrap, `${tag} the wide row wraps as one line onto more lines (${m.lines})`);
            check(m.givenPx >= px - 0.5 && m.inputPx >= px - 0.5, `${tag} givens ${m.givenPx}px and inputs ${m.inputPx}px >= ${px}px`);
            check(m.fit.every(Boolean), `${tag} every box holds "${m.widest}" (${m.fit.filter((f) => !f).length} too narrow)`);
            check(!m.cue && m.swipeOver <= 1, `${tag} no swipe cue (swipe overflow ${m.swipeOver}px)`);
          } else {
            // TY-10b on a phone: unchanged - the row keeps its geometry and swipes inside its cell (a number too wide for six boxes
            // still shrinks under TY-10a there), with the cue
            check(!m.wrap && m.swipeOver > 0 && m.cue, `${tag} TY-10b phone row swipes inside its cell with the cue (overflow ${m.swipeOver}px, ${m.inputPx}px digits)`);
          }
          check(m.pageScroll <= 0, `${tag} the page never scrolls sideways (${m.pageScroll}px)`);
          check(errs.length === 0, `${tag} no page errors ${errs.join(' ')}`);
        } catch (e) {
          check(false, `${tag} ${e.message}`);
        } finally { await app.close(); }
      }
    }
  }
  console.log(fails ? `small-fixes-countrow-wide: FAIL (${fails})` : 'small-fixes-countrow-wide: OK');
  process.exit(fails ? 1 : 0);
})();
