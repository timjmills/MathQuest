// critic r6: screenshot one card. node card-shot.cjs <repo> <out.png> <cat:skill> <seed> [WxH]
const path = require('path');
const { open } = require(path.join(process.argv[2], 'tests/lib/ws-harness.cjs'));
const [c, k] = process.argv[4].split(':'); const seed = Number(process.argv[5]);
const [w, h] = (process.argv[6] || '1280x600').split('x').map(Number);
(async () => {
  const app = await open({ seed: 1, viewport: { width: w, height: h, deviceScaleFactor: 1 } });
  const { page } = app;
  await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
  await page.evaluate((c, k) => { window.state.quizMode = false; window.skillQueue.length = 0; window.skillQueue.push({ categoryId: c, skillId: k, skillLabel: k }); window.playSelectedSkills('practice'); }, c, k);
  await new Promise(z => setTimeout(z, 800));
  await page.evaluate((c, k, seed) => { const q = window.generateQuestionFor({ category: c, skill: k, seed, itemIndex: 0 }); const st = window.state; st.hasAnswered = false; st.currentQ = q; window.renderQuestion(); }, c, k, seed);
  await new Promise(z => setTimeout(z, 1500));
  await page.screenshot({ path: process.argv[3] });
  await app.close();
})().catch(e => { console.error(e); process.exit(1); });
