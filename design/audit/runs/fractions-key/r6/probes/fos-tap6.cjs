// critic r6: count-graded lists on card, quiz and worksheet. Right-but-not-keyed taps, wrong counts, retry.
// node fos-tap6.cjs <repo> <outdir>
const path = require('path');
const ROOT = process.argv[2], OUT = process.argv[3];
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const FIND = (k, start) => { for (let sd = start; sd < start + 600; sd++) { const t = window.generateQuestionFor({ category: 'fractions', skill: k, seed: sd * 13, itemIndex: 0 }); if (t.printFormat === 'multi-select' && t.ans.length < t.options.length && t.ans.length > 1) return t; } return null; };
const STATE = () => ({ fb: ((document.querySelector('#feedback, .feedback-area') || {}).textContent || '').trim().slice(0, 80), green: document.querySelectorAll('.msc-opt.locked-correct, .msc-opt.correct-flash').length, wrong: document.querySelectorAll('.msc-opt.wrong-persistent, .msc-opt.wrong-flash').length, missed: document.querySelectorAll('.msc-opt.missed-correct').length, sel: document.querySelectorAll('.msc-opt.selected').length, score: window.state.score, streak: window.state.streak });
(async () => {
  const app = await open({ seed: 1, viewport: { width: 1366, height: 650, deviceScaleFactor: 1 } });
  const { page } = app;
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  for (const k of ['fraction_of_set', 'fraction_of_set_hard']) {
    // CARD: wrong count (n-1, from the end), Check, then add one more (a non-keyed right set), Check
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
    const info = await page.evaluate((k, FIND) => {
      const find = eval('(' + FIND + ')');
      window.state.quizMode = false; window.skillQueue.length = 0;
      window.skillQueue.push({ categoryId: 'fractions', skillId: k, skillLabel: k });
      window.playSelectedSkills('practice');
      const q = find(k, 1);
      const st = window.state; st.hasAnswered = false; st.currentQ = q; window.renderQuestion();
      return { text: q.text, n: q.ans.length, N: q.options.length, sc: q.selectCount };
    }, k, FIND.toString());
    await sleep(1500);
    const { n, N } = info;
    let opts = await page.$$('.msc-opt');
    for (let i = N - n + 1; i < N; i++) { await opts[i].click(); await sleep(100); }
    await page.evaluate(() => { const b = document.querySelector('#qcCheckBtn'); if (b) b.click(); });
    await sleep(1200);
    const s1 = await page.evaluate(STATE);
    await page.screenshot({ path: path.join(OUT, `${k}-card-tap-short-checked.png`) });
    opts = await page.$$('.msc-opt');
    await opts[N - n].click(); await sleep(150);
    await page.evaluate(() => { const b = document.querySelector('#qcCheckBtn'); if (b) b.click(); });
    await sleep(1200);
    const s2 = await page.evaluate(STATE);
    await page.screenshot({ path: path.join(OUT, `${k}-card-tap-last-checked.png`) });
    console.log(k, 'CARD', JSON.stringify(info), '\n  short(n-1 last):', JSON.stringify(s1), '\n  then +1 (last n):', JSON.stringify(s2));

    // CARD over-count: n+1
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
    await page.evaluate((k, FIND) => { const find = eval('(' + FIND + ')'); window.state.quizMode = false; window.skillQueue.length = 0; window.skillQueue.push({ categoryId: 'fractions', skillId: k, skillLabel: k }); window.playSelectedSkills('practice'); const q = find(k, 1); const st = window.state; st.hasAnswered = false; st.currentQ = q; window.renderQuestion(); }, k, FIND.toString());
    await sleep(1500);
    opts = await page.$$('.msc-opt');
    for (let i = 0; i < Math.min(N, n + 1); i++) { await opts[i].click(); await sleep(80); }
    await page.evaluate(() => { const b = document.querySelector('#qcCheckBtn'); if (b) b.click(); });
    await sleep(1200);
    console.log('  over(n+1 first):', JSON.stringify(await page.evaluate(STATE)));
    await page.screenshot({ path: path.join(OUT, `${k}-card-tap-over-checked.png`) });

    // QUIZ: three copies of the list: last n (right), last n-1 (wrong), middle n (right)
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
    await page.evaluate((k, FIND) => {
      const find = eval('(' + FIND + ')');
      const t = find(k, 1);
      const qs = [0, 1, 2].map(i => ({ id: i, skillId: k, points: 1, questionData: window.quizQuestionData(t) }));
      const test = { id: null, name: 'R6', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions: qs }],
        settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
      window.handleQuizURL(window.compressTestForURL(test));
      const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input'));
      window.startQuizTest();
    }, k, FIND.toString());
    await sleep(1500);
    const picks = [[...Array(n)].map((_, i) => N - n + i), [...Array(n - 1)].map((_, i) => N - n + 1 + i), [...Array(n)].map((_, i) => Math.floor((N - n) / 2) + i)];
    for (let qi = 0; qi < 3; qi++) {
      opts = await page.$$('#quizTakeView .msc-opt');
      for (const i of picks[qi]) { await opts[i].click(); await sleep(80); }
      await sleep(300);
      await page.screenshot({ path: path.join(OUT, `${k}-quiz-q${qi + 1}-tapped.png`) });
      await page.evaluate(() => { const b = Array.from(document.querySelectorAll('button')).find(b => /^\s*Next/i.test(b.textContent) && b.offsetParent); if (b) b.click(); });
      await sleep(900);
    }
    await page.evaluate(async () => { window.confirm = () => true; await window.submitQuiz(); });
    await sleep(2000);
    const res = await page.evaluate(() => { const v = document.getElementById('quizResultsView'); return v ? v.innerText.replace(/\s+/g, ' ').slice(0, 300) : 'no results view'; });
    await page.screenshot({ path: path.join(OUT, `${k}-quiz-results.png`), fullPage: true });
    console.log('  QUIZ last-n / last-(n-1) / middle-n:', res);
  }
  console.log('pageerrors', errs.length, errs.slice(0, 3).join(' | '));
  await app.close();
})().catch(e => { console.error(e); process.exit(1); });
