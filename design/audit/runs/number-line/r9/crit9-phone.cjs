// Critic r9: why does q1 on the phone (390x844 touch) not take the typed answer? Line on and off.
// Usage: MQ_ROOT=<tree> node crit9-phone.cjs
const { open } = require('/home/user/mq-numberline/tests/lib/ws-harness.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const h = await open({ viewport: { width: 390, height: 844, deviceScaleFactor: 1 } });
  const { page } = h;
  const base = page.url().split('?')[0];
  for (const [cat, skill] of [['multiplication', 'nl_mult'], ['subtraction', 'sub_100_regroup'], ['addition', 'add_facts']]) for (const line of [true, false]) {
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
    await page.goto(base, { waitUntil: 'networkidle2' });
    await page.waitForFunction(() => typeof window.playSelectedSkills === 'function' && window.UnifiedSkills, { timeout: 30000 });
    await page.evaluate((cat, skill, line) => { window.clearSetOptions && window.clearSetOptions({ silent: true }); const U = window.UnifiedSkills; U.clear(); U.add({ categoryId: cat, skillId: skill, skillLabel: skill, opts: line ? { nlOn: true } : {} }); }, cat, skill, line);
    await page.evaluate(() => window.playSelectedSkills('practice'));
    await sleep(1600);
    const st = () => page.evaluate(() => { const ae = document.activeElement; const r = ae.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { sy: Math.round(scrollY), ae: ae.id || String(ae.className).slice(0, 40) || ae.tagName, aeY: Math.round(r.top), coveredBy: top && top !== ae && !ae.contains(top) ? (top.id || String(top.className).slice(0, 40) || top.tagName) : '', vals: [...document.querySelectorAll('#questionCard input')].filter((e) => e.offsetParent).map((e) => e.value).join('|'), hasAns: window.state.hasAnswered, ans: String(window.state.currentQ.ans), notify: [...document.querySelectorAll('.mq-notify')].filter((e) => e.offsetParent || getComputedStyle(e).position === 'fixed').map((e) => { const q = e.getBoundingClientRect(); return Math.round(q.top) + '-' + Math.round(q.bottom) + ' ' + getComputedStyle(e).opacity + ' ' + e.textContent.trim().slice(0, 30); }).join(','), overlays: [...document.querySelectorAll('.modal, .mq-notify, [class*=toast], [class*=overlay]')].filter((e) => e.offsetParent && getComputedStyle(e).display !== 'none').map((e) => (e.id || String(e.className)).slice(0, 30)).join(',') }; });
    const s0 = await st();
    const pt = await page.evaluate(() => { const ae = document.activeElement; const el = ae && /INPUT/.test(ae.tagName) ? ae : document.querySelector('#questionCard input, #answerInput'); const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await page.touchscreen.tap(pt.x, pt.y); await sleep(400);
    const s1 = await st();
    const ans = s0.ans; const rtl = /column-answer-input/.test(s1.ae);
    await page.keyboard.type(rtl ? ans.split('').reverse().join('') : ans, { delay: 20 }); await sleep(200);
    const s2 = await st();
    await page.evaluate(() => window.submitAnswer()); await sleep(400);
    const s3 = await st();
    console.log(`${skill} ${line ? 'line' : 'OFF'}\n  start ${JSON.stringify(s0)}\n  tap@${Math.round(pt.y)} ${JSON.stringify(s1)}\n  typed ${JSON.stringify(s2)}\n  submit ${JSON.stringify(s3)}`);
  }
  await h.close();
})();
