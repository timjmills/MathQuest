// Boot smoke: the module tree loads, the window API exists, one skill renders on both
// surfaces, and nothing is written to the console as an error.
//   node tests/scripts/ws-boot-smoke.cjs
const { open, renderPrint, renderScreen } = require('../lib/ws-harness.cjs');

const REQUIRED = ['generateQuestion', 'renderQuestion', 'generateWorksheetFromSections', 'openPrintSettings', 'applySkillCode', 'showView', 'SKILLS', 'DOMAINS', 'state'];
const SKILL = { categoryId: 'addition', skillId: 'add_facts', label: 'Addition Facts' };

(async () => {
  const failures = [];
  const app = await open({ seed: 1 });
  try {
    const missing = await app.page.evaluate(names => names.filter(n => typeof window[n] === 'undefined'), REQUIRED);
    if (missing.length) failures.push(`missing on window: ${missing.join(', ')}`);

    const codes = await app.page.evaluate(() => ({ n: Object.keys(window.SKILL_CODES || {}).length, aa: (window.CODE_TO_SKILL || {}).AA }));
    if (!codes.n) failures.push('SKILL_CODES not built');
    if (!codes.aa || codes.aa.skillId !== 'count_objects') failures.push(`code AA decodes to ${JSON.stringify(codes.aa)}`);

    const printSel = await renderPrint(app.page, SKILL, { problemCount: 6 });
    const printed = await app.page.$eval(printSel, el => el.querySelectorAll('.worksheet-problem').length);
    if (printed < 6) failures.push(`print surface rendered ${printed} problems, expected 6`);

    const screen = await renderScreen(app.page, SKILL);
    const visible = await app.page.$eval(screen.selector, el => el.offsetHeight > 0 && el.textContent.trim().length > 0);
    if (!visible) failures.push('question card is empty or hidden');

    if (app.problems.length) failures.push(`console/page errors: ${app.problems.slice(0, 5).map(p => `[${p.type}] ${p.text}`).join(' | ')}`);
  } catch (e) {
    failures.push(e.message);
  } finally {
    await app.close();
  }
  if (failures.length) { console.error('ws-boot-smoke: FAIL'); failures.forEach(f => console.error('  - ' + f)); process.exit(1); }
  console.log('ws-boot-smoke: OK');
})();
