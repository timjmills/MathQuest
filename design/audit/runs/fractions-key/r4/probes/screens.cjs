// critic r4 screens: card / worksheet / quiz with a choose-all list and a production item.
const path = require('path'), fs = require('fs');
const ROOT = process.argv[2], OUT = process.argv[3];
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SK = (process.argv[4] || 'fraction_operations:add_fractions_like,fraction_operations:sub_fractions_like,fraction_operations:add_frac_unlike').split(',');
const SIZES = (process.argv[5] || '1366x650,1280x600,1280x900,820x1180,390x844').split(',').map(s => { const [w, h] = s.split('x').map(Number); return { w, h }; });
const MEAS = () => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const opts = Array.from(document.querySelectorAll('.msc-opt')).filter(vis);
  const o = opts.map(e => {
    const r = e.getBoundingClientRect();
    let fs = 0; e.querySelectorAll('*').forEach(x => { if (x.childNodes.length && Array.from(x.childNodes).some(n => n.nodeType === 3 && /\d/.test(n.textContent))) fs = Math.max(fs, parseFloat(getComputedStyle(x).fontSize)); });
    if (!fs) fs = parseFloat(getComputedStyle(e).fontSize);
    return { w: Math.round(r.width), h: Math.round(r.height), fs, top: Math.round(r.top), bottom: Math.round(r.bottom) };
  });
  const inputs = Array.from(document.querySelectorAll('input')).filter(vis).filter(i => i.closest('#questionPaper, #worksheetGrid, #quizTakeView, .qt-question, #qtQuestionArea'));
  const ins = inputs.map(i => { const r = i.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), fs: parseFloat(getComputedStyle(i).fontSize), bottom: Math.round(r.bottom) }; });
  const sw = document.documentElement.scrollWidth > innerWidth + 1;
  const check = Array.from(document.querySelectorAll('#qcCheckBtn, #qtNextBtn, .qt-next, #checkAllBtn, button')).filter(vis).filter(b => /check|next|review/i.test(b.textContent)).map(b => ({ t: b.textContent.trim().slice(0, 20), bottom: Math.round(b.getBoundingClientRect().bottom) }));
  return { opts: o, inputs: ins, hscroll: sw, H: innerHeight, check: check.slice(0, 3) };
};
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const app = await open({ seed: 1, viewport: { width: 1366, height: 650, deviceScaleFactor: 1 } });
  const { page } = app;
  page.on('dialog', d => d.accept().catch(() => {}));
  for (const s of SK) {
    const [c, k] = s.split(':');
    for (const size of SIZES) {
      await page.setViewport({ width: size.w, height: size.h, deviceScaleFactor: 1 });
      const tag = `${k}-${size.w}x${size.h}`;
      // ---- card: list item then production item
      for (const kind of ['list', 'prod']) {
        await page.reload({ waitUntil: 'networkidle2' });
        await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
        await page.evaluate((c, k, kind) => {
          window.state.quizMode = false; window.skillQueue.length = 0;
          window.skillQueue.push({ categoryId: c, skillId: k, skillLabel: k });
          window.playSelectedSkills('practice');
          let q = null;
          for (let sd = 1; sd < 400; sd++) { const t = window.generateQuestionFor({ category: c, skill: k, seed: sd, itemIndex: 0 }); if ((t.printFormat === 'multi-select') === (kind === 'list')) { q = t; break; } }
          const st = window.state; st.hasAnswered = false; st.currentQ = q; window.renderQuestion();
        }, c, k, kind);
        await sleep(1200);
        await page.evaluate(() => window.scrollTo(0, 0));
        await sleep(200);
        const m = await page.evaluate(MEAS);
        await page.screenshot({ path: path.join(OUT, `${tag}-card-${kind}.png`) });
        console.log(`${tag} card ${kind}`, JSON.stringify({ opts: m.opts.slice(0, 2), nopts: m.opts.length, inputs: m.inputs.slice(0, 3), hscroll: m.hscroll, H: m.H, check: m.check }));
      }
      // ---- quiz: list q first, then production
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
      await page.evaluate((c, k) => {
        const qs = []; let L = null, P = null;
        for (let sd = 1; sd < 400 && !(L && P); sd++) { const t = window.generateQuestionFor({ category: c, skill: k, seed: sd, itemIndex: 0 }); if (t.printFormat === 'multi-select') L = L || t; else P = P || t; }
        [L, P].forEach((q, i) => qs.push({ id: i, skillId: k, points: 1, questionData: window.quizQuestionData(q) }));
        const test = { id: null, name: 'R4', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions: qs }],
          settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
        window.handleQuizURL(window.compressTestForURL(test));
        const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input'));
        window.startQuizTest();
      }, c, k);
      await sleep(1200);
      let m = await page.evaluate(MEAS);
      await page.screenshot({ path: path.join(OUT, `${tag}-quiz-q1.png`) });
      console.log(`${tag} quiz q1`, JSON.stringify({ opts: m.opts.slice(0, 2), nopts: m.opts.length, hscroll: m.hscroll, check: m.check }));
      await page.evaluate(() => { const b = Array.from(document.querySelectorAll('button')).find(b => /^\s*Next/i.test(b.textContent) && b.offsetParent); if (b) b.click(); });
      await sleep(900);
      m = await page.evaluate(MEAS);
      await page.screenshot({ path: path.join(OUT, `${tag}-quiz-q2.png`) });
      console.log(`${tag} quiz q2`, JSON.stringify({ inputs: m.inputs.slice(0, 3), hscroll: m.hscroll, check: m.check }));
      // ---- worksheet: seeds until a list card shows
      let got = false;
      for (let seed = 1; seed < 12 && !got; seed++) {
        await page.reload({ waitUntil: 'networkidle2' });
        await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
        await page.evaluate((c, k, seed) => {
          if (window.__wsReseed) window.__wsReseed(seed);
          const st = window.state; st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 6;
          window.showView && window.showView('worksheetView');
          window.initWorksheet();
        }, c, k, seed * 7919);
        try { await page.waitForFunction(() => { const g = document.getElementById('worksheetGrid'); return !!g && g.dataset.mqLaidOut === '1'; }, { timeout: 20000 }); } catch (e) {}
        await sleep(1500);
        got = await page.evaluate(() => !!document.querySelector('#worksheetGrid .msc-opt'));
        if (got || seed === 11) {
          await page.evaluate(() => { const o = document.querySelector('#worksheetGrid .msc-opt'); if (o) o.closest('.problem-card').scrollIntoView({ block: 'center' }); });
          await sleep(300);
          m = await page.evaluate(MEAS);
          await page.screenshot({ path: path.join(OUT, `${tag}-worksheet.png`) });
          console.log(`${tag} worksheet list=${got}`, JSON.stringify({ opts: m.opts.slice(0, 2), nopts: m.opts.length, inputs: m.inputs.slice(0, 3), hscroll: m.hscroll }));
        }
      }
    }
  }
  await app.close();
})().catch(e => { console.error(e); process.exit(1); });
