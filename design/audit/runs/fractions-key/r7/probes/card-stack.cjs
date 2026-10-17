// critic r6: on the practice card, which prompts get stacked fractions? time / money / ratio / date-ish skills.
const path = require('path');
const { open } = require(path.join(process.argv[2], 'tests/lib/ws-harness.cjs'));
const SK = process.argv[3].split(',');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const app = await open({ seed: 1, viewport: { width: 1280, height: 800, deviceScaleFactor: 1 } });
  const { page } = app; const errs = []; page.on('pageerror', e => errs.push(String(e)));
  for (const s of SK) { const [c, k] = s.split(':');
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
    await page.evaluate((c, k) => { window.state.quizMode = false; window.skillQueue.length = 0; window.skillQueue.push({ categoryId: c, skillId: k, skillLabel: k }); window.playSelectedSkills('practice'); }, c, k);
    await sleep(800);
    for (let sd = 1; sd <= 6; sd++) {
      const r = await page.evaluate(async (c, k, sd) => {
        const q = window.generateQuestionFor({ category: c, skill: k, seed: sd * 977, itemIndex: 0 });
        const st = window.state; st.hasAnswered = false; st.currentQ = q; window.renderQuestion();
        await new Promise(z => setTimeout(z, 500));
        const root = document.getElementById('questionPaper') || document.getElementById('gameView');
        const fr = Array.from(root.querySelectorAll('.msc-frac')).filter(e => !e.closest('svg'));
        const qt = document.getElementById('questionText');
        return { src: String(q.text || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 110), stacked: fr.map(e => e.textContent.replace(/\s+/g, '/')).slice(0, 4), shown: qt ? qt.innerText.replace(/\s+/g, ' ').slice(0, 110) : '' };
      }, c, k, sd);
      if (/\d\/\d/.test(r.src) || r.stacked.length) console.log(k, 's' + sd, JSON.stringify(r));
      else if (sd === 1) console.log(k, 's1 (no n/d in prompt)', r.src.slice(0, 70));
    }
  }
  console.log('pageerrors', errs.length, errs.slice(0, 2).join(' | '));
  await app.close();
})().catch(e => { console.error(e); process.exit(1); });
