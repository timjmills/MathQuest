const path = require('path');
const { open } = require('/home/user/MathQuest/tests/lib/ws-harness.cjs');
(async () => {
  for (const [w, h] of [[340, 640], [390, 844], [1280, 800]]) for (const n of [23, 2]) {
    const app = await open({ seed: 1, viewport: { width: w, height: h, deviceScaleFactor: 1 } });
    const { page } = app;
    const errs = []; page.on('pageerror', e => errs.push(e.message));
    const r = await page.evaluate(async (n) => {
      const codes = Object.keys(window.CODE_TO_SKILL || {});
      const m = await import('/js/modules/gamification.js');
      const sc = await import('/js/modules/skill-codes.js').catch(() => null);
      return { codesAvail: codes.length };
    }, n);
    // build a code from the first n skill codes the app knows
    const code = await page.evaluate(async (n) => {
      const url = performance.getEntriesByType('resource').map(e => e.name).find(u => /\/js\/modules\/data\.js/.test(u));
      const d = await import(url);
      return Object.keys(d.CODE_TO_SKILL).filter(k => k.length === 2).slice(0, n).join('-');
    }, n);
    await page.evaluate((code) => {
      document.querySelectorAll('#studentLandingOverlay').forEach(e => e.remove());
      window.showStudentLandingModal({ skillsCode: code, settings: { timer: 0, problemCount: 0, decimals: 0 } });
    }, code);
    await new Promise(r => setTimeout(r, 400));
    const m = await page.evaluate(() => {
      const b = document.querySelector('.landing-start-btn').getBoundingClientRect();
      const md = document.querySelector('.landing-modal').getBoundingClientRect();
      return { title: document.querySelector('.landing-modal h2').textContent, pills: document.querySelectorAll('.landing-modal .landing-skills .landing-badge').length,
        startVisible: b.top >= 0 && b.bottom <= innerHeight, modalH: Math.round(md.height), vh: innerHeight, focused: document.activeElement && document.activeElement.classList.contains('landing-start-btn') };
    });
    await page.screenshot({ path: path.join(__dirname, `land-${w}-${n}.png`) });
    if (n === 23) { await page.click('.landing-skill-list summary'); await new Promise(r => setTimeout(r, 200));
      m.afterOpen = await page.evaluate(() => { const b = document.querySelector('.landing-start-btn'); b.scrollIntoView({ block: 'nearest' }); const r = b.getBoundingClientRect(); return { startReachable: r.top >= 0 && r.bottom <= innerHeight }; });
      await page.screenshot({ path: path.join(__dirname, `land-${w}-${n}-open.png`) }); }
    console.log(w, h, n, code.split('-').length, JSON.stringify(m), 'errors', errs.length);
    await app.close();
  }
})().catch(e => { console.error(e); process.exit(1); });
