const { open } = require('./lib/ws-harness.cjs');
(async () => {
  const app = await open({ seed: 1, viewport: { width: 390, height: 844, deviceScaleFactor: 1 } });
  const { page } = app;
  await page.evaluateOnNewDocument(() => { window.__sl = []; const o = Element.prototype.scrollIntoView; Element.prototype.scrollIntoView = function (a) { window.__sl.push('SIV ' + (this.className || this.tagName) + ' ' + JSON.stringify(a) + ' ' + new Error().stack.split('\n').slice(2, 4).join(' | ')); return o.call(this, a); }; const f = HTMLElement.prototype.focus; HTMLElement.prototype.focus = function (a) { window.__sl.push('FOC ' + this.className + ' ' + JSON.stringify(a) + ' y' + scrollY + ' ' + new Error().stack.split('\n').slice(2, 3).join(' | ')); return f.call(this, a); }; addEventListener('scroll', () => window.__sl.push('scroll ' + scrollY), true); });
  const k = process.argv[2] || 'multi_step_word_plain';
  const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  for (let it = 0; it < 3; it++) {
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForFunction(() => typeof window.playSelectedSkills === 'function' && !!window.SKILLS);
    await page.evaluate((k, seed) => { window.__wsReseed(seed); window.setUserRole('student', { persist: false }); window.state.quizMode = false; window.skillQueue.length = 0; window.skillQueue.push({ categoryId: 'algebra', skillId: k, skillLabel: k }); window.playSelectedSkills('practice'); }, k, hash(`algebra:${k}:phone:${it}`));
    await new Promise((r) => setTimeout(r, 1300));
    console.log(await page.evaluate(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); const q = document.getElementById('questionCard').getBoundingClientRect(); return `scrollY ${scrollY} box top ${r.top} card top ${q.top} docH ${document.documentElement.scrollHeight}`; }));
    console.log(await page.evaluate(() => { const c = document.getElementById('questionCard'); const a = document.activeElement; return [...c.querySelectorAll('input')].filter((e) => e.offsetParent).slice(0, 8).map((e) => `${e === a ? '*' : ' '}${e.className.split(' ').slice(0, 2).join('.')}[${e.dataset.mqKind || ''}|${e.getAttribute('data-mq-expect')}|${e.getAttribute('aria-label')}]`).join('\n'); }));
    console.log((await page.evaluate(() => window.__sl.slice(-25))).join('\n'));
    console.log('---');
  }
  await app.close();
})();
