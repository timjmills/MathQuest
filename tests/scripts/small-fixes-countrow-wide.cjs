// Small fixes item 8 (critic r7 O9, critic r8 D1-D4): on SCREEN every count-by row is drawn at its host's digit size and wraps
// onto more lines where the cell is too narrow, instead of shrinking its digits under TY-10a or swiping. At desktop width
// (1366x650, 1280x600), on every host (practice card, online worksheet, quiz), for wide rows (by 100,000 from 1,000,000;
// by 25,000), fitting rows (by 2, 5, 10, 25) and a wide Lines row (100,000 + Answer spaces: Lines, SL-3a):
//   - the givens and the typed answers are at the host's digit size (29 px on the online worksheet, 40 px on the card / quiz)
//   - every input holds its widest answer (scrollWidth <= clientWidth)
//   - at least 3 numbers to every line (D1), and the right-hand empty band of the cell is under 30 % (H13)
//   - no "Swipe for more boxes" cue, no swipe overflow (SP-11a: count rows swipe only at 480 px and under), no page scroll
// A worksheet that mixes rows (by 5, by 100,000 from 1,000,000, by 25,000; 6 problems, D2): every card the same width, every
// row at 29 px, card heights even (tallest / shortest <= 1.35) and no card with a vertical empty band of 30 % or more.
// At 390 (phone, TY-10b) the rows are UNCHANGED: the measures are pinned to 810c0894 (PHONE_PIN).
// Run: node tests/scripts/small-fixes-countrow-wide.cjs   (SHOTS=<dir> saves screenshots; SIZES=1366,390 limits the viewports;
// PIN=1 prints the phone measures as a PHONE_PIN object)
const path = require('path');
const { open } = require('../lib/ws-harness.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fails = 0;
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };
const SIZES = [{ width: 1366, height: 650 }, { width: 1280, height: 600 }, { width: 820, height: 1180 }, { width: 768, height: 1024 }, { width: 390, height: 844 }].filter((v) => !process.env.SIZES || process.env.SIZES.split(',').map(Number).includes(v.width));
const WIDE = { rows: [{ step: 100000, start: 'custom', at: 1000000 }] };
const ROWS = {
  '100000': WIDE,
  '25000': { rows: [{ step: 25000 }] },
  '100000-lines': Object.assign({ spaces: 'line' }, WIDE),
  by2: { rows: [{ step: 2 }] },
  by5: { rows: [{ step: 5 }] },
  by10: { rows: [{ step: 10 }] },
  by25: { rows: [{ step: 25, start: 'step', dir: 'up' }] },
};
const MIXED = { rows: [{ step: 5 }, { step: 100000, start: 'custom', at: 1000000 }, { step: 25000 }] };
const HOST_PX = { worksheet: 29, card: 40, quiz: 40 };
const SHOTS = process.env.SHOTS || '';
const PIN = !!process.env.PIN;
// TY-10b: the phone rows as 810c0894 draws them (givens px, inputs px, swipe overflow px, cue shown), seed 11
const PHONE_PIN = {
  'worksheet 100000': [16.1, 16.1, 375, true], 'worksheet 25000': [18.8, 18.8, 398, true], 'worksheet 100000-lines': [29, 29, 933, true],
  'worksheet by2': [29, 29, 418, true], 'worksheet by5': [29, 29, 418, true], 'worksheet by10': [29, 29, 418, true], 'worksheet by25': [29, 29, 418, true],
  'card 100000': [14.6, 14.6, 410, true], 'card 25000': [17, 17, 423, true], 'card 100000-lines': [29, 29, 901, true],
  'card by2': [29, 29, 450, true], 'card by5': [29, 29, 450, true], 'card by10': [29, 29, 450, true], 'card by25': [29, 29, 450, true],
  'quiz 100000': [14.6, 14.6, 339, true], 'quiz 25000': [17, 17, 360, true], 'quiz 100000-lines': [29, 29, 933, true],
  'quiz by2': [29, 29, 418, true], 'quiz by5': [29, 29, 418, true], 'quiz by10': [29, 29, 418, true], 'quiz by25': [29, 29, 418, true],
};
const pinOut = {};

async function mount(page, host, opts, seed, count) {
  return page.evaluate(async (host, opts, seed, count) => {
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
      st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.problemCount = count || 2;
      window.initWorksheet();
    }
  }, host, opts, seed, count);
}

// the measures of one count row (its body inside `root`)
async function measure(page, root, host, qi) {
  return page.evaluate((root, host, qi) => {
    const r = document.querySelector(root);
    const q = host === 'quiz' ? window.state.quizAllQuestions[0].question.questionData : host === 'card' ? window.state.currentQ : window.state.worksheetQs[qi];
    const vals = (q.cell && q.cell.payload && q.cell.payload.values) || [];
    const body = r.querySelector('.k2-countrow-body');
    const ins = [...r.querySelectorAll('.k2-countrow-body input.mq-cellslot:not(.mq-cellslot-host)')];
    const widest = vals.reduce((a, v) => (String(v).length > a.length ? String(v) : a), '');
    ins.forEach((e) => { e.value = widest; });
    const fit = ins.map((e) => e.scrollWidth <= e.clientWidth);
    ins.forEach((e) => { e.value = ''; });
    const givens = [...r.querySelectorAll('.k2-countrow-body .k2-given')];
    const fz = (e) => parseFloat(getComputedStyle(e).fontSize);
    const cue = [...r.querySelectorAll('.k2-swipe-cue')].some((e) => { const cs = getComputedStyle(e); const b = e.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && b.width > 0 && b.height > 0; });
    const sw = r.querySelector('[data-mq-swiperow]');
    // the numbers in reading order, grouped into lines by their top edge
    const nums = ins.concat(givens).map((e) => e.closest('.k2-shape, .k2-given') || e).map((e) => e.getBoundingClientRect()).filter((b) => b.width > 0).sort((a, b) => a.top - b.top || a.left - b.left);
    const lines = [];
    nums.forEach((b) => { const ln = lines.find((l) => Math.abs(l.top - b.top) < 8); if (ln) ln.items.push(b); else lines.push({ top: b.top, items: [b] }); });
    const perLine = lines.map((l) => l.items.length);
    const cell = body ? body.closest('.mq-scell') : null;
    let band = 1;
    if (cell && nums.length) {
      const cr = cell.getBoundingClientRect(), cs = getComputedStyle(cell);
      const left = cr.left + parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth), right = cr.right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth);
      band = (right - Math.max(...nums.map((b) => b.right))) / Math.max(1, right - left);
    }
    return { n: ins.length, widest, fit, inW: ins.map((e) => Math.round(e.getBoundingClientRect().width)),
      givenPx: givens.length ? Math.min(...givens.map(fz)) : 0, inputPx: ins.length ? Math.min(...ins.map(fz)) : 0,
      maxPx: Math.max(0, ...givens.concat(ins).map(fz)),
      cue, swipeOver: sw ? sw.scrollWidth - sw.clientWidth : 0, perLine, band: Math.round(band * 1000) / 10,
      cellW: cell ? Math.round(cell.getBoundingClientRect().width) : 0,
      pageScroll: document.documentElement.scrollWidth - window.innerWidth };
  }, root, host, qi);
}

async function boot(vp) {
  const phone = vp.width <= 480;
  const app = await open({ viewport: { ...vp, deviceScaleFactor: 1, isMobile: phone, hasTouch: phone } });
  const { page } = app;
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  await page.reload({ waitUntil: 'networkidle2' });
  await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
  await page.evaluate(() => { try { localStorage.setItem('mathquest_onboarded', '1'); } catch (e) { /* ignore */ } });
  return { app, page, errs };
}
const dismiss = (page) => page.evaluate(() => { const d = document.getElementById('mqWorkedDismiss'); if (d) d.click(); });

(async () => {
  for (const vp of SIZES) {
    const phone = vp.width <= 480;
    for (const host of ['worksheet', 'card', 'quiz']) {
      for (const [rk, opts] of Object.entries(ROWS)) {
        const tag = `[${vp.width}x${vp.height} ${host} ${rk}]`;
        let app;
        try {
          const b = await boot(vp); app = b.app; const { page, errs } = b;
          await mount(page, host, opts, 11);
          await sleep(1200); await dismiss(page); await sleep(300);
          const root = host === 'quiz' ? '#quizTakeView' : host === 'card' ? '#questionCard' : '#ws_card_0';
          const m = await measure(page, root, host, 0);
          console.log(`  ${tag} widest ${m.widest} givens ${m.givenPx}px inputs ${m.inputPx}px boxes ${Math.min(...m.inW)}-${Math.max(...m.inW)}px cell ${m.cellW}px per line ${m.perLine.join('+')} band ${m.band}% cue ${m.cue} swipeOver ${m.swipeOver} pageScroll ${m.pageScroll}`);
          if (SHOTS && !phone && (rk === '100000' || (rk === '100000-lines' && host !== 'worksheet') || (rk === 'by5' && host === 'card'))) {
            const el = await page.$(root);
            await el.evaluate((e) => e.scrollIntoView({ block: 'start' }));
            await page.screenshot({ path: path.join(SHOTS, `screen-${vp.width}-${host}-${rk}.png`) });
          }
          if (SHOTS && phone && host === 'worksheet' && rk === '100000') {
            const el = await page.$(root);
            await el.evaluate((e) => e.scrollIntoView({ block: 'start' }));
            await page.screenshot({ path: path.join(SHOTS, `screen-390-worksheet-100000.png`) });
          }
          check(m.n >= 2, `${tag} ${m.n} answer boxes`);
          if (!phone) {
            const px = HOST_PX[host];
            check(m.givenPx >= px - 0.5 && m.inputPx >= px - 0.5 && m.maxPx <= px + 0.5, `${tag} givens ${m.givenPx}px and inputs ${m.inputPx}px at the host's ${px}px`);
            check(m.fit.every(Boolean), `${tag} every box holds "${m.widest}" (${m.fit.filter((f) => !f).length} too narrow)`);
            check(Math.min(...m.perLine) >= 3, `${tag} at least 3 numbers to every line (${m.perLine.join('+')})`);
            check(m.band < 30, `${tag} right-hand empty band ${m.band}% < 30%`);
            const half = m.perLine.reduce((a, b) => a + b, 0) >= 13 ? 5 : Math.ceil(m.perLine.reduce((a, b) => a + b, 0) / 2);
            check(Math.max(...m.perLine) <= half, `${tag} no screen line holds more than half the row (${m.perLine.join('+')}, at most ${half}) (TY-10a, SL-3a)`);
            check(!m.cue && m.swipeOver <= 1, `${tag} no desktop swipe (cue ${m.cue}, overflow ${m.swipeOver}px)`);
          } else {
            const key = `${host} ${rk}`;
            pinOut[key] = [Math.round(m.givenPx * 10) / 10, Math.round(m.inputPx * 10) / 10, m.swipeOver, m.cue];
            const pin = PHONE_PIN[key];
            check(!!pin && Math.abs(pin[0] - pinOut[key][0]) <= 0.2 && Math.abs(pin[1] - pinOut[key][1]) <= 0.2 && Math.abs(pin[2] - m.swipeOver) <= 2 && pin[3] === m.cue,
              `${tag} TY-10b phone row unchanged (${JSON.stringify(pinOut[key])} vs pin ${JSON.stringify(pin)})`);
          }
          check(m.pageScroll <= 0, `${tag} the page never scrolls sideways (${m.pageScroll}px)`);
          check(errs.length === 0, `${tag} no page errors ${errs.join(' ')}`);
        } catch (e) {
          check(false, `${tag} ${e.message}`);
        } finally { if (app) await app.close(); }
      }
    }
    if (phone) continue;
    // D2: a worksheet that mixes rows
    const tag = `[${vp.width}x${vp.height} worksheet mixed]`;
    let app;
    try {
      const b = await boot(vp); app = b.app; const { page, errs } = b;
      await mount(page, 'worksheet', MIXED, 11, 6);
      await sleep(1500); await dismiss(page); await sleep(300);
      const ms = [];
      for (let i = 0; i < 6; i++) ms.push(await measure(page, `#ws_card_${i}`, 'worksheet', i));
      const cards = await page.evaluate(() => [...document.querySelectorAll('#worksheetGrid > .problem-card')].map((c) => {
        const cell = c.querySelector('.ws-card-visual');
        const cr = cell.getBoundingClientRect();
        const kids = [...cell.children].filter((k) => getComputedStyle(k).display !== 'none').map((k) => k.getBoundingClientRect()).filter((b) => b.height > 0);
        const content = kids.length ? Math.max(...kids.map((k) => k.bottom)) - Math.min(...kids.map((k) => k.top)) : 0;
        return { w: Math.round(c.getBoundingClientRect().width), h: Math.round(c.getBoundingClientRect().height), vband: Math.round((1 - content / Math.max(1, cr.height)) * 1000) / 10 };
      }));
      console.log(`  ${tag} cards ${cards.map((c) => `${c.w}x${c.h} (v-band ${c.vband}%)`).join(', ')}`);
      ms.forEach((m, i) => console.log(`  ${tag} #${i} givens ${m.givenPx}px inputs ${m.inputPx}px per line ${m.perLine.join('+')} band ${m.band}% cue ${m.cue}`));
      if (SHOTS) {
        await page.evaluate(() => document.getElementById('ws_card_0').scrollIntoView({ block: 'start' }));
        await page.screenshot({ path: path.join(SHOTS, `screen-${vp.width}-worksheet-mixed.png`), fullPage: true });
      }
      const ws = cards.map((c) => c.w), hs = cards.map((c) => c.h);
      check(cards.length === 6 && Math.max(...ws) - Math.min(...ws) <= 1, `${tag} every card the same width (${ws.join(', ')})`);
      check(Math.max(...hs) / Math.min(...hs) <= 1.35, `${tag} card heights even (${hs.join(', ')})`);
      check(cards.every((c) => c.vband < 30), `${tag} no card stretched with a vertical empty band >= 30% (${cards.map((c) => c.vband).join(', ')})`);
      check(ms.every((m) => Math.abs(m.givenPx - 29) <= 0.5 && Math.abs(m.inputPx - 29) <= 0.5 && m.maxPx <= 29.5), `${tag} every row at 29 px (${ms.map((m) => m.inputPx).join(', ')})`);
      check(ms.every((m) => Math.min(...m.perLine) >= 3 && m.band < 30 && !m.cue && m.swipeOver <= 1), `${tag} every row 3+ to a line, band < 30%, no swipe`);
      check(ms.every((m) => Math.max(...m.perLine) <= 6), `${tag} no line holds more than half a row (${ms.map((m) => m.perLine.join('+')).join(', ')})`);
      check(errs.length === 0, `${tag} no page errors ${errs.join(' ')}`);
    } catch (e) {
      check(false, `${tag} ${e.message}`);
    } finally { if (app) await app.close(); }
  }
  // critic r9 E3: a row balances the same on a fresh load and after a resize to the same width
  for (const host of ['worksheet', 'card', 'quiz']) {
    if (process.env.SIZES && !process.env.SIZES.split(',').includes('768')) break;
    const tag = `[768 ${host} 100000 load vs resize]`;
    let app;
    try {
      const b = await boot({ width: 768, height: 1024 }); app = b.app; const { page } = b;
      await mount(page, host, WIDE, 11);
      await sleep(1200); await dismiss(page); await sleep(300);
      const root = host === 'quiz' ? '#quizTakeView' : host === 'card' ? '#questionCard' : '#ws_card_0';
      const m0 = await measure(page, root, host, 0);
      for (const v of [{ width: 1366, height: 650 }, { width: 1100, height: 700 }, { width: 768, height: 800 }]) { await page.setViewport(Object.assign({ deviceScaleFactor: 1 }, v)); await sleep(700); }
      const m1 = await measure(page, root, host, 0);
      check(m0.perLine.join('+') === m1.perLine.join('+'), `${tag} ${m0.perLine.join('+')} on load, ${m1.perLine.join('+')} after resizing back`);
    } catch (e) { check(false, `${tag} ${e.message}`); } finally { if (app) await app.close(); }
  }
  if (PIN) console.log('PHONE_PIN = ' + JSON.stringify(pinOut));
  console.log(fails ? `small-fixes-countrow-wide: FAIL (${fails})` : 'small-fixes-countrow-wide: OK');
  process.exit(fails ? 1 : 0);
})();
