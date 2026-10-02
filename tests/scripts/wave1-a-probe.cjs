// Wave 1 lane A probe + screenshots: student home, practice-card pulse, worksheet pulse, hint audio
// button, skip after N wrong tries. Run: flock /tmp/mq-browser.lock node tests/scripts/wave1-a-probe.cjs
const fs = require('fs');
const path = require('path');
const { open } = require('../lib/ws-harness.cjs');
const OUT = path.resolve(__dirname, '..', '..', 'design', 'audit', 'runs', 'wave1-A');
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fails = 0;
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };

(async () => {
  for (const w of [1280, 390]) {
    const { page, problems, close } = await open({ viewport: { width: w, height: 900, deviceScaleFactor: 1 } });
    page.on('dialog', (d) => d.accept().catch(() => {}));
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.evaluate(() => { document.body.classList.remove('teacher-mode'); document.body.classList.add('student-mode'); });
    await sleep(300);
    // student home
    const home = await page.evaluate(() => {
      const vis = (el) => !!el && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().width > 0;
      return {
        btns: Array.from(document.querySelectorAll('.student-start-btn')).map((b) => ({ t: b.textContent.trim(), v: vis(b), h: b.getBoundingClientRect().height })),
        startGame: vis(document.querySelector('.start-game-btn')),
        cards: Array.from(document.querySelectorAll('.mode-card')).filter(vis).length,
        map: Array.from(document.querySelectorAll('.map-launch-btn')).filter(vis).length,
      };
    });
    check(home.btns.length === 4 && home.btns.every((b) => b.v), `[${w}] four student start buttons visible ${JSON.stringify(home.btns.map((b) => b.t))}`);
    check(!home.startGame && home.cards === 0, `[${w}] old Start Game and mode cards hidden for students`);
    check(home.map === 3, `[${w}] MAP buttons still shown (${home.map})`);
    await page.screenshot({ path: path.join(OUT, `student-home-${w}.png`), fullPage: true });

    // practice: pick a skill, start practice via the button
    await page.evaluate(() => {
      window.state.category = 'addition'; window.state.skill = 'add_within_20';
    });
    const skill = await page.evaluate(() => {
      const cat = Object.keys(window.SKILLS)[0];
      return { cat, s: window.SKILLS[cat][0] };
    });
    console.log('first skill', JSON.stringify(skill).slice(0, 200));
    await page.evaluate(() => {
      const first = document.querySelector('#quickSkillsGrid .quick-skill-card, #quickSkillsGrid > *');
      if (first) first.click();
    });
    await sleep(300);
    await page.evaluate(() => window.startMode('practice'));
    await sleep(1200);
    await page.evaluate(() => { const d = document.getElementById('mqWorkedDismiss'); if (d) d.click(); });
    await sleep(500);
    const info = await page.evaluate(() => {
      const ae = document.activeElement;
      const vis = (el) => !!el && getComputedStyle(el).display !== 'none';
      const box = ae && (ae.closest('[data-mq-cell]') || ae);
      const cs = box ? getComputedStyle(box) : null;
      return {
        view: document.querySelector('.view.active') && document.querySelector('.view.active').id,
        active: ae && (ae.tagName + '#' + ae.id + '.' + ae.className),
        boxBg: cs && cs.backgroundColor, boxAnim: cs && cs.animationName,
        skip: vis(document.getElementById('skipQuestionBtn')),
        calc: vis(document.getElementById('calcBtn')),
        type: window.state.currentQ && window.state.currentQ.answerType,
      };
    });
    console.log('practice', JSON.stringify(info));
    check(/mq-active-pulse/.test(info.boxAnim || ''), `[${w}] practice answer box pulses (${info.boxAnim} ${info.boxBg})`);
    check(info.calc === false, `[${w}] calculator hidden by default`);
    await page.screenshot({ path: path.join(OUT, `practice-card-pulse-${w}.png`) });
    // reduced motion: steady
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    const rm = await page.evaluate(() => { const ae = document.activeElement; const b = ae && (ae.closest('[data-mq-cell]') || ae); const c = getComputedStyle(b); return { a: c.animationName, bg: c.backgroundColor }; });
    check(rm.a === 'none' && /255, 243, 160/.test(rm.bg), `[${w}] reduced motion: steady highlight ${JSON.stringify(rm)}`);
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
    // wrong tries: skip appears only at the 5th
    const seen = [];
    for (let k = 1; k <= 5; k++) {
      await page.evaluate(() => { const q = window.state.currentQ; window.checkAnswer(typeof q.ans === 'number' ? String(q.ans + 777) : 'zzz'); });
      await sleep(250);
      seen.push(await page.evaluate(() => { const b = document.getElementById('skipQuestionBtn'); return getComputedStyle(b).display !== 'none'; }));
      if (k === 1) {
        await page.evaluate(() => window.showHint());
        await sleep(200);
        const hint = await page.evaluate(() => { const b = document.getElementById('hintSpeakBtn'); if (!b) return null; const r = b.getBoundingClientRect(); return { w: r.width, h: r.height, label: b.getAttribute('aria-label') }; });
        check(hint && hint.w >= 44 && hint.h >= 44 && !!hint.label, `[${w}] hint box audio button 44px+ and labelled ${JSON.stringify(hint)}`);
        await page.screenshot({ path: path.join(OUT, `hint-audio-${w}.png`) });
        await page.evaluate(() => window.closeHintPopup());
      }
    }
    check(JSON.stringify(seen) === '[false,false,false,false,true]', `[${w}] skip hidden until 5th wrong try ${JSON.stringify(seen)}`);
    check(await page.evaluate(() => !document.getElementById('skipBtn')), `[${w}] no second Next button`);
    await page.screenshot({ path: path.join(OUT, `skip-after-5-${w}.png`) });
    // skip off for the skill (per-skill option skipAfter = 0)
    await page.evaluate(() => { window.state.currentQ.skillOptions = { skipAfter: 0 }; window.state.currentQAttempts = 9; window.updateSkipButton(); });
    check(await page.evaluate(() => getComputedStyle(document.getElementById('skipQuestionBtn')).display === 'none'), `[${w}] skipAfter 0 keeps Skip hidden`);
    await page.evaluate(() => { window.state.currentQ.skillOptions = { skipAfter: 2 }; window.state.currentQAttempts = 2; window.updateSkipButton(); });
    check(await page.evaluate(() => getComputedStyle(document.getElementById('skipQuestionBtn')).display !== 'none'), `[${w}] skipAfter 2 shows Skip after 2 tries`);
    // calculator option: off by default, on when the skill's option says so
    await page.evaluate(() => { window.state.skillOptions = { calculator: true }; window.goHome(); });
    await sleep(500);
    await page.evaluate(() => window.startMode('practice'));
    await sleep(1500);
    check(await page.evaluate(() => getComputedStyle(document.getElementById('calcBtn')).display !== 'none'), `[${w}] calculator option on shows the button`);
    // worksheet
    await page.evaluate(() => { window.state.skillOptions = null; window.goHome && window.goHome(); });
    await sleep(500);
    await page.evaluate(() => window.startMode('worksheet'));
    await sleep(2500);
    const ws = await page.evaluate(() => {
      const c = document.querySelector('.problem-card.mq-active-problem');
      return { id: c && c.id, anim: c && getComputedStyle(c).animationName, n: document.querySelectorAll('.mq-active-problem').length };
    });
    check(ws.id === 'ws_card_0' && /mq-active-card-pulse/.test(ws.anim) && ws.n === 1, `[${w}] worksheet current problem pulses ${JSON.stringify(ws)}`);
    await page.screenshot({ path: path.join(OUT, `worksheet-current-${w}.png`) });
    await page.evaluate(() => window.advanceToNextProblem(0));
    const ws2 = await page.evaluate(() => { const c = document.querySelector('.problem-card.mq-active-problem'); return c && c.id; });
    check(ws2 === 'ws_card_1', `[${w}] highlight moves to next problem (${ws2})`);
    console.log('problems', JSON.stringify(problems));
    await close();
  }
  console.log(fails ? 'wave1-a-probe: FAIL' : 'wave1-a-probe: OK');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
