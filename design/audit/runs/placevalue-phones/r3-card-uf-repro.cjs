// Critic r3 (Chromebook-first re-run of the r2 probe; VIEWS=WxH[t touch|m phone])
// Critic r2 D1-card: on the PRACTICE CARD a unit-form place box still takes 4 digits, so after a WRONG
// digit the next digit joins the same box (the caret moves on only when a digit is right).
const T = process.env.MQ_TREE || require('path').resolve(__dirname, '../../../..');
const { open } = require(T + '/tests/lib/ws-harness.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  for (const V of (process.env.VIEWS || '1366x650t,1366x650,1280x602,390x780m').split(',')) {
    const [W, H] = V.replace(/[a-z]+$/, '').split('x').map(Number); const touch = /[tm]$/.test(V); const mob = /m$/.test(V);
    const app = await open({ seed: 4, viewport: { width: W, height: H, deviceScaleFactor: 1, isMobile: mob, hasTouch: touch } });
    const { page } = app;
    for (const [n, typed] of [[730, '730'], [730, '830'], [7026, '7126'], [405, '415']]) {
      await page.evaluate((n) => {
        const st = window.state; st.quizMode = false; st.category = 'placevalue'; st.skill = 'unit_form'; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false;
        window.showView('gameView');
        let q = null;
        for (let s = 1; s < 3000 && !q; s++) { const c = window.generateQuestionFor({ category: 'placevalue', skill: 'unit_form', seed: s, itemIndex: s % 6, opts: { band: n > 999 ? 9999 : 999 } }); if (c.pv && c.pv.n === n && !c.pv.rename) q = c; }
        st.currentQ = q || window.generateQuestionFor({ category: 'placevalue', skill: 'unit_form', seed: 1, opts: { band: 999 } });
        window.renderQuestion();
      }, n);
      await sleep(700);
      const sel = '#questionPaper input.mq-cellslot';
      if (touch) await page.tap(sel); else await page.click(sel);
      for (const d of typed) { await page.keyboard.type(d); await sleep(150); }
      const r = await page.evaluate(() => ({ n: window.state.currentQ.pv.n, max: [...document.querySelectorAll('#questionPaper input.mq-cellslot')].map((b) => b.maxLength), vals: [...document.querySelectorAll('#questionPaper input.mq-cellslot')].map((b) => b.value + (b.classList.contains('mq-live-wrong') ? '(red)' : b.classList.contains('mq-live-correct') ? '(green)' : '')) }));
      console.log(`${V} card n=${r.n} typed ${typed} -> [${r.vals.join(' | ')}] maxlength ${r.max.join(',')}`);
    }
    await app.close();
  }
})().catch((e) => { console.log('EXC', e.stack); process.exit(2); });
