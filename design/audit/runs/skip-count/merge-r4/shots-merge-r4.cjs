// skip-count merge r4: the builder's screenshots on the merged tree.
// node design/audit/runs/skip-count/merge-r4/shots-merge-r4.cjs [outdir] [only-opener]   (MQ_ROOT=<tree> to shoot another checkout)
const path = require('path');
const ROOT = process.env.MQ_ROOT || path.resolve(__dirname, '../../../../..');
const OUT = process.argv[2] || __dirname;
const ONLY_OPENER = process.argv[3] === 'only-opener';
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const SK = [['multiplication', 'count_by_tables'], ['patterns', 'skip_count_grid'], ['patterns', 'skip_count_line']];
const W7 = { rows: [{ step: 100000, start: 'custom', at: 1000000 }] };
(async () => {
  const app = await open({ seed: 3, viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
  const { page } = app;
  if (!ONLY_OPENER) for (const w of [390, 683, 1280]) for (const [cat, skill] of SK) {
    await page.setViewport({ width: w, height: w === 390 ? 844 : 800, deviceScaleFactor: 1, hasTouch: w === 390, isMobile: w === 390 });
    await page.evaluate(async ({ cat, skill }) => {
      const st = window.state;
      window.clearSetOptions({ silent: true }); window.setSetOptions(cat, skill, {}, { silent: true });
      st.category = cat; st.skill = skill; st.isMixedMode = false; st.quizMode = false; st.hasAnswered = false;
      st.gameMode = 'practice'; window.showView('gameView');
      st.currentQ = window.generateQuestionFor({ category: cat, skill, seed: 7, itemIndex: 0, opts: {} }); window.renderQuestion();
      await new Promise((r) => setTimeout(r, 1500));
    }, { cat, skill });
    const el = await page.$('#questionCard');
    await (el || page).screenshot({ path: `${OUT}/card-${w}-${skill}.png` });
  }
  const p2 = await app.browser.newPage();
  await p2.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
  const jobs = [];
  for (const size of ['S', 'M', 'L']) {
    if (!ONLY_OPENER) {
      for (const [cat, skill] of SK) for (const role of ['scripted-model', 'independent']) jobs.push([cat, skill, {}, role, size, `${skill}-${role}-${size}`]);
      for (const role of ['scripted-model', 'independent']) jobs.push(['multiplication', 'count_by_tables', W7, role, size, `cbt-7digit-${role}-${size}`]);
    }
    jobs.push(['multiplication', 'count_by_tables', {}, 'opener', size, `opener-cbt-${size}`]);
    jobs.push(['multiplication', 'count_by_tables', W7, 'opener', size, `opener-cbt-7digit-${size}`]);
    jobs.push(['multiplication', 'count_by_tables', { rows: [{ step: 25000 }] }, 'opener', size, `opener-cbt-25000-${size}`]);
  }
  for (const [cat, skill, opts, role, size, name] of jobs) {
    const docs = await page.evaluate(async ({ cat, skill, opts, role, size }) => {
      const o = await window.buildSheet({ role, sections: [{ skills: [{ categoryId: cat, skillId: skill, opts }], count: role === 'scripted-model' ? 1 : 4 }], size, seed: 7 });
      return { html: window.sheetDocument(o.pupilHtml, 'P'), pages: o.pageCount };
    }, { cat, skill, opts, role, size });
    await p2.setContent(docs.html, { waitUntil: 'domcontentloaded' }).catch(() => {});
    await p2.evaluate(() => document.fonts && document.fonts.ready); await new Promise((r) => setTimeout(r, 600));
    await p2.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
    console.log(name, 'pages', docs.pages);
  }
  await app.close();
})().catch((e) => { console.error(e); process.exit(1); });
