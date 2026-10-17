// critic r5: fraction_of_set(_hard) on card / quiz / worksheet, every task kind.
// node fos-screens.cjs <repo> <outdir> [skills] [sizes]
const path = require('path'), fs = require('fs');
const ROOT = process.argv[2], OUT = process.argv[3];
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SK = (process.argv[4] || 'fractions:fraction_of_set,fractions:fraction_of_set_hard').split(',');
const SIZES = (process.argv[5] || '1366x650,1280x600,390x844').split(',').map(s => { const [w, h] = s.split('x').map(Number); return { w, h }; });
const KINDS = ['list', 'of', 'missing', 'word'];
const kindOf = (t) => t.printFormat === 'multi-select' ? 'list' : (t.cell && t.cell.payload && t.cell.payload.task) || '?';
const MEAS = () => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const opts = Array.from(document.querySelectorAll('.msc-opt')).filter(vis).map(e => { const r = e.getBoundingClientRect(); const s = e.querySelector('svg'); const sr = s ? s.getBoundingClientRect() : null; return { w: Math.round(r.width), h: Math.round(r.height), shape: sr ? Math.round(sr.width) : 0, bottom: Math.round(r.bottom) }; });
  const inputs = Array.from(document.querySelectorAll('input')).filter(vis).filter(i => i.closest('#questionPaper, #worksheetGrid, #quizTakeView')).map(i => { const r = i.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), fs: parseFloat(getComputedStyle(i).fontSize), top: Math.round(r.top), bottom: Math.round(r.bottom) }; });
  const svgs = Array.from(document.querySelectorAll('svg.fos-groups')).filter(vis).map(s => { const r = s.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), bottom: Math.round(r.bottom) }; });
  const circ = Array.from(document.querySelectorAll('svg.fos-groups circle')).filter(vis).slice(0, 1).map(c => Math.round(c.getBoundingClientRect().width * 10) / 10);
  const fills = Array.from(new Set(Array.from(document.querySelectorAll('svg.fos-groups circle')).map(c => c.getAttribute('fill'))));
  const digits = Array.from(document.querySelectorAll('.fos-cell span')).filter(vis).filter(x => /^\d+$/.test(x.textContent.trim())).map(x => parseFloat(getComputedStyle(x).fontSize));
  const sw = document.documentElement.scrollWidth > innerWidth + 1;
  const check = Array.from(document.querySelectorAll('button')).filter(vis).filter(b => /^\s*(check|next|review)/i.test(b.textContent)).map(b => ({ t: b.textContent.trim().slice(0, 16), bottom: Math.round(b.getBoundingClientRect().bottom) }));
  const prompt = (document.querySelector('#questionText, .question-text, .qt-question-text') || {}).textContent;
  return { nopts: opts.length, opt: opts[0], inputs: inputs.slice(0, 2), svgs: svgs.slice(0, 2), circ, fills, digit: digits.length ? Math.max(...digits) : 0, hscroll: sw, H: innerHeight, check: check.slice(0, 2), prompt: (prompt || '').trim().slice(0, 90) };
};
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const app = await open({ seed: 1, viewport: { width: 1366, height: 650, deviceScaleFactor: 1 } });
  const { page } = app;
  page.on('dialog', d => d.accept().catch(() => {}));
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  for (const s of SK) {
    const [c, k] = s.split(':');
    for (const size of SIZES) {
      await page.setViewport({ width: size.w, height: size.h, deviceScaleFactor: 1 });
      const tag = `${k}-${size.w}x${size.h}`;
      for (const kind of KINDS) {
        await page.reload({ waitUntil: 'networkidle2' });
        await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
        const sd = await page.evaluate((c, k, kind) => {
          window.state.quizMode = false; window.skillQueue.length = 0;
          window.skillQueue.push({ categoryId: c, skillId: k, skillLabel: k });
          window.playSelectedSkills('practice');
          const kindOf = (t) => t.printFormat === 'multi-select' ? 'list' : (t.cell && t.cell.payload && t.cell.payload.task) || '?';
          let q = null, sd = 1;
          for (sd = 1; sd < 400; sd++) { const t = window.generateQuestionFor({ category: c, skill: k, seed: sd * 13, itemIndex: 0 }); if (kindOf(t) === kind) { q = t; break; } }
          const st = window.state; st.hasAnswered = false; st.currentQ = q; window.renderQuestion();
          return q ? sd * 13 : -1;
        }, c, k, kind);
        await sleep(1200); await page.evaluate(() => window.scrollTo(0, 0)); await sleep(200);
        const m = await page.evaluate(MEAS);
        await page.screenshot({ path: path.join(OUT, `${tag}-card-${kind}.png`) });
        console.log(`${tag} card ${kind} seed=${sd}`, JSON.stringify(m));
      }
      // quiz: one question per kind
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
      await page.evaluate((c, k, KINDS) => {
        const kindOf = (t) => t.printFormat === 'multi-select' ? 'list' : (t.cell && t.cell.payload && t.cell.payload.task) || '?';
        const got = {};
        for (let sd = 1; sd < 400 && Object.keys(got).length < KINDS.length; sd++) { const t = window.generateQuestionFor({ category: c, skill: k, seed: sd * 7, itemIndex: 0 }); const kk = kindOf(t); if (!got[kk]) got[kk] = t; }
        const qs = KINDS.map((kk, i) => ({ id: i, skillId: k, points: 1, questionData: window.quizQuestionData(got[kk]) }));
        const test = { id: null, name: 'R5', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions: qs }],
          settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
        window.handleQuizURL(window.compressTestForURL(test));
        const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input'));
        window.startQuizTest();
      }, c, k, KINDS);
      await sleep(1200);
      for (let i = 0; i < KINDS.length; i++) {
        const m = await page.evaluate(MEAS);
        await page.screenshot({ path: path.join(OUT, `${tag}-quiz-${KINDS[i]}.png`) });
        console.log(`${tag} quiz ${KINDS[i]}`, JSON.stringify(m));
        await page.evaluate(() => { const b = Array.from(document.querySelectorAll('button')).find(b => /^\s*Next/i.test(b.textContent) && b.offsetParent); if (b) b.click(); });
        await sleep(900);
      }
      // worksheet
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
      await page.evaluate((c, k) => {
        if (window.__wsReseed) window.__wsReseed(7919);
        const st = window.state; st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 6;
        window.showView && window.showView('worksheetView');
        window.initWorksheet();
      }, c, k);
      try { await page.waitForFunction(() => { const g = document.getElementById('worksheetGrid'); return !!g && g.dataset.mqLaidOut === '1'; }, { timeout: 20000 }); } catch (e) {}
      await sleep(1500);
      const wm = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('#worksheetGrid .problem-card')).map(p => { const r = p.getBoundingClientRect(); const cell = p.querySelector('.fos-cell'); return { w: Math.round(r.width), h: Math.round(r.height), task: cell ? cell.getAttribute('data-fos-task') : (p.querySelector('.msc-opt') ? 'list' : '?'), over: p.scrollWidth > p.clientWidth + 1 || p.scrollHeight > p.clientHeight + 1, text: (p.querySelector('.problem-text, .ws-prompt, .question-text') || p).textContent.trim().slice(0, 60) }; });
        return { cards, hscroll: document.documentElement.scrollWidth > innerWidth + 1 };
      });
      await page.evaluate(() => { const g = document.getElementById('worksheetGrid'); if (g) g.scrollIntoView({ block: 'start' }); });
      await sleep(300);
      await page.screenshot({ path: path.join(OUT, `${tag}-worksheet.png`) });
      await page.screenshot({ path: path.join(OUT, `${tag}-worksheet-full.png`), fullPage: true });
      console.log(`${tag} worksheet`, JSON.stringify(wm));
    }
  }
  console.log('pageerrors', errs.length, errs.slice(0, 3).join(' | '));
  await app.close();
})().catch(e => { console.error(e); process.exit(1); });
