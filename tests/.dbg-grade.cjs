const { open } = require('./lib/ws-harness.cjs');
(async () => {
  const app = await open({ seed: 1, viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
  const { page } = app;
  const out = await page.evaluate(async () => {
    const K = await import('/js/modules/sheet/index.js');
    const q = window.generateQuestionFor({ category: 'algebra', skill: 'two_step_estimate_check', seed: 2 });
    const k = K.cellAnswerKey(q);
    const q2 = window.generateQuestionFor({ category: 'algebra', skill: 'two_step_estimate_check', seed: 2 });
    return { ans: q.ans, ans2: q2.ans, est: q.cell.payload.check, est2: q2.cell.payload.check, slots: k.slots, g: K.gradeSlots(k, { answer: String(q.ans), 'es-r': String(q.cell.payload.check.est) }) };
  });
  console.log(JSON.stringify(out, null, 1).slice(0, 3000));
  const st = await page.evaluate(() => {
    const st = window.state; st.category = 'algebra'; st.skill = 'two_step_letter_equation'; st.gameMode = 'practice'; st.isMixedMode = false; window.showView('gameView');
    st.hasAnswered = false; st.currentQ = window.generateQuestionFor({ category: 'algebra', skill: 'two_step_letter_equation', seed: 1 }); window.renderQuestion();
    const a = document.getElementById('answerInput');
    return { v: a && a.value, cls: a && a.className, slots: document.querySelectorAll('#visualAid input.mq-cellslot').length, parts: document.querySelectorAll('#visualAid [data-mq-part]').length };
  });
  console.log(JSON.stringify(st));
  await app.close();
})();
