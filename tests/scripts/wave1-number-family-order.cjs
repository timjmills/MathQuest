// Number families are right in any order: card / worksheet / quiz, mult + add + mixed, level 0 (all blank).
const { open } = require('/home/user/MathQuest/tests/lib/ws-harness.cjs');
const SK = [['multiplication', 'number_families_mult'], ['addition', 'number_families_add'], ['number_ops_mixed', 'number_families_mixed']];
const SEL = { card: '#questionCard', worksheet: '#worksheetView .problem-card.mq-active-problem', quiz: '.qt-question-card' };
(async () => {
  const app = await open({ seed: 5, viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
  const { page } = app;
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  let fail = 0;
  for (const host of ['card', 'worksheet', 'quiz']) for (const [c, k] of SK) for (const mode of ['swap', 'dup', 'swap', 'dup']) {
    await page.evaluate(({ c, k, host }) => {
      const st = window.state; st.category = c; st.skill = k; st.range = 100; st.skillOptions = { level: [0] }; st.isMixedMode = false;
      document.querySelectorAll('.zoom-overlay').forEach(e => e.remove());
      if (host === 'card') { st.gameMode = 'practice'; window.showView('gameView'); st.currentQ = window.generateQuestion(); st.hasAnswered = false; window.renderQuestion(); }
      else if (host === 'worksheet') { st.gameMode = 'worksheet'; st.problemCount = 2; window.initWorksheet(); }
      else {
        const q = window.generateQuestion();
        const test = { id: null, name: 'P', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions: [{ id: 0, skillId: k, points: 1, questionData: window.quizQuestionData(q) }] }],
          settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
        window.handleQuizURL(window.compressTestForURL(test));
        const n = document.getElementById('qtStudentName'); n.value = 'A'; n.dispatchEvent(new Event('input'));
        window.startQuizTest();
      }
    }, { c, k, host });
    await new Promise(r => setTimeout(r, 600));
    // the family each host is showing, and a swapped answer for each row
    const plan = await page.evaluate(({ sel, host, mode }) => {
      const root = document.querySelector(sel);
      const q = host === 'card' ? window.state.currentQ : host === 'worksheet' ? window.state.worksheetQs[Number((root.id || '').replace('ws_card_', ''))] : window.state.quizAllQuestions[0].question.questionData;
      const d = q && q.numberFamilyData;
      if (!d) return { err: 'no numberFamilyData' };
      // swap: rows of the same sign trade facts (row 0 gets row 1's fact ...); dup: row 1 repeats row 0
      const byOp = {}; d.equations.forEach((e, r) => (byOp[e.op] = byOp[e.op] || []).push(r));
      const fill = d.equations.map((e, r) => {
        const peers = byOp[e.op];
        if (mode === 'dup') return d.equations[peers[0]].nums;
        if (peers.length < 2) return e.nums;
        return d.equations[peers[(peers.indexOf(r) + 1) % peers.length]].nums;
      });
      return { fill, square: Object.values(byOp).every(v => v.every(r => d.equations[r].nums.join() === d.equations[v[0]].nums.join())), a: d.a, b: d.b, n: root.querySelectorAll('input.number-family-input').length, idx: root.id };
    }, { sel: SEL[host], host, mode });
    if (plan.err) { console.log(host, k, plan.err); fail++; continue; }
    const inputs = await page.$$(SEL[host] + ' input.number-family-input');
    for (const el of inputs) {
      const [r, p] = await el.evaluate(e => [Number(e.dataset.eq), Number(e.dataset.pos)]);
      await el.click(); await el.type(String(plan.fill[r][p]), { delay: 5 });
    }
    await page.keyboard.press('Tab');
    await new Promise(r => setTimeout(r, 900));
    const out = await page.evaluate(({ sel, host }) => {
      const root = document.querySelector(sel) || document;
      const ins = [...document.querySelectorAll(host === 'worksheet' ? '#worksheetView input.number-family-input' : sel + ' input.number-family-input')];
      const red = ins.filter(e => e.classList.contains('mq-live-wrong') || e.classList.contains('box-wrong')).length;
      const st = window.state;
      let right = null;
      if (host === 'card') right = st.lastAnswerCorrect === true || st.hasAnswered === true;
      else if (host === 'worksheet') right = /rgba\(6, 214, 160/.test(document.querySelector('#ws_card_0').style.background);
      else { window.qtGoTo && 0; right = null; }
      return { red, n: ins.length, right };
    }, { sel: SEL[host], host });
    if (host === 'quiz') {
      out.right = await page.evaluate(() => { try { window.submitQuizTest && 0; } catch (e) {} return null; });
      // grade the composed value as the quiz records it
      out.right = await page.evaluate(async () => { const m = await import('/js/modules/screen-cell.js'); const qd = window.state.quizAllQuestions[0].question.questionData; const v = [...document.querySelectorAll('.qt-question-card input.number-family-input')].map(e => e.value.trim()).join(', '); return m.slotAnswerMatches(v, qd); });
    }
    const want = mode === 'swap';
    const ok = mode === 'swap' || plan.square ? (out.red === 0 && out.right === true) : ((host === 'quiz' || out.red > 0) && out.right !== true);
    if (!ok) fail++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${host} ${k} ${mode}${plan.square ? ' (square)' : ''} boxes=${out.n} red=${out.red} right=${out.right}`);
  }
  console.log('page errors', errs.length, errs.slice(0, 3).join(' | '));
  console.log(fail ? `FAIL ${fail}` : 'ALL OK');
  await app.close();
})().catch(e => { console.error(e); process.exit(1); });
