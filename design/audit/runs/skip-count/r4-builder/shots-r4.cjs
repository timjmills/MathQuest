// skip-count fix r4: the builder's screenshots. node design/audit/runs/skip-count/r4-builder/shots-r4.cjs
const path = require('path');
const ROOT = path.resolve(__dirname, '../../../../..');
const OUT = __dirname;
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
(async () => {
  const app = await open({ seed: 3, viewport: { width: 390, height: 844, deviceScaleFactor: 2, hasTouch: true } });
  const { page } = app;
  for (const seed of [8, 15, 18]) {
    await page.evaluate(async (seed) => {
      const st = window.state;
      window.clearSetOptions({ silent: true }); window.setSetOptions('patterns', 'skip_count_line', {}, { silent: true });
      st.category = 'patterns'; st.skill = 'skip_count_line'; st.isMixedMode = false; st.quizMode = false; st.hasAnswered = false;
      st.gameMode = 'practice'; window.showView('gameView');
      st.currentQ = window.generateQuestionFor({ category: 'patterns', skill: 'skip_count_line', seed, itemIndex: 0, opts: {} }); window.renderQuestion();
      await new Promise((r) => setTimeout(r, 1500));
    }, seed);
    const el = await page.$('#questionCard');
    await (el || page).screenshot({ path: `${OUT}/card-390-seed${seed}.png` });
  }
  const p2 = await app.browser.newPage();
  await p2.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
  const W7 = { rows: [{ step: 100000, start: 'custom', at: 1000000 }] };
  const jobs = [];
  for (const size of ['M', 'L']) for (const role of ['independent', 'scripted-model']) jobs.push(['multiplication', 'count_by_tables', W7, role, size, `cbt-7digit-${role}-${size}`]);
  jobs.push(['multiplication', 'count_by_tables', { rows: [{ step: 25000 }] }, 'independent', 'L', 'cbt-6digit-independent-L']);
  for (const size of ['M', 'L']) jobs.push(['addition', 'add_1k_regroup', {}, 'scripted-model', size, `other-add_1k_regroup-model-${size}`]);
  for (const [cat, skill, opts, role, size, name] of jobs) {
    const docs = await page.evaluate(async ({ cat, skill, opts, role, size }) => {
      const o = await window.buildSheet({ role, sections: [{ skills: [{ categoryId: cat, skillId: skill, opts }], count: role === 'scripted-model' ? 1 : 4 }], size, seed: 7 });
      return { html: window.sheetDocument(o.pupilHtml, 'P'), key: window.sheetDocument(o.keyHtml || '', 'K'), pages: o.pageCount };
    }, { cat, skill, opts, role, size });
    for (const [w, h] of [['pupil', docs.html], ['key', docs.key]]) {
      await p2.setContent(h, { waitUntil: 'domcontentloaded' }).catch(() => {});
      await p2.evaluate(() => document.fonts && document.fonts.ready); await new Promise((r) => setTimeout(r, 800));
      await p2.screenshot({ path: `${OUT}/${name}-${w}.png`, fullPage: true });
    }
    console.log(name, 'pages', docs.pages);
  }
  await app.close();
})().catch((e) => { console.error(e); process.exit(1); });
