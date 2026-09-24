// Regression: the worked-example overlay (.mq-worked-preview-overlay) must not outlive
// the game it belongs to. It shows on the first question of a new skill; leaving the game
// (exitGame, goHome, any showView) must remove it, and Escape must close it.
//   node tests/scripts/ws-worked-preview.cjs
const { open, waitFor } = require('../lib/ws-harness.cjs');

const SEL = '.mq-worked-preview-overlay';

// Start a fresh practice game on add_facts the way a pupil does (skill queue, then
// startGame), and wait for the worked preview to appear.
async function startWithPreview(page, label) {
  // A fresh page per case: a previous game's end-of-session state must not decide this one.
  await page.reload({ waitUntil: 'networkidle2' });
  await waitFor(page, () => typeof window.startGame === 'function' && !!window.SKILLS, 30000, 'app boot');
  await page.evaluate(() => {
    window.clearPreviewShown();
    window.skillQueue.length = 0;
    const st = window.state;
    st.isMixedMode = false; st.gameMode = 'practice'; st.mapMode = false;
    window.addToSkillQueue('number_ops', 'addition', 'add_facts', 'Addition Facts');
    window.startGame();
  });
  await waitFor(page, () => !!document.querySelector('.mq-worked-preview-overlay'), 10000, `worked preview to show (${label})`);
}

const count = page => page.evaluate(s => document.querySelectorAll(s).length, SEL);

(async () => {
  const failures = [];
  const app = await open({ seed: 1 });
  app.page.on('dialog', d => d.accept());
  try {
    for (const [label, leave] of [
      ['exitGame', () => window.exitGame()],
      ['goHome', () => window.goHome()],
      ['showView', () => window.showView('dashboardView')],
    ]) {
      await startWithPreview(app.page, label);
      await app.page.evaluate(leave);
      const n = await count(app.page);
      if (n) failures.push(`${label}: ${n} overlay(s) still in the DOM`);
    }

    await startWithPreview(app.page, 'Escape');
    await app.page.keyboard.press('Escape');
    const n = await count(app.page);
    if (n) failures.push(`Escape: ${n} overlay(s) still in the DOM`);
    await app.page.evaluate(() => window.exitGame());

    if (app.problems.length) failures.push(`console/page errors: ${app.problems.slice(0, 5).map(p => `[${p.type}] ${p.text}`).join(' | ')}`);
  } catch (e) {
    failures.push(e.message);
  } finally {
    await app.close();
  }
  if (failures.length) { console.error('ws-worked-preview: FAIL'); failures.forEach(f => console.error('  - ' + f)); process.exit(1); }
  console.log('ws-worked-preview: OK');
})();
