// Wave 1 lane A probe + screenshots: student home, practice-card pulse, worksheet pulse, hint audio
// button, skip after N wrong tries. Run: flock /tmp/mq-browser.lock node tests/scripts/wave1-a-probe.cjs
const fs = require('fs');
const path = require('path');
const { open } = require('../lib/ws-harness.cjs');
const OUT = path.resolve(__dirname, '..', '..', 'design', 'audit', 'runs', 'wave1-A-fix');
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
    const lay = await page.evaluate(() => {
      const sec = Array.from(document.querySelectorAll('#homeView .section')).find((x) => /choose\s*mode/i.test((x.querySelector('.section-title') || {}).textContent || ''));
      const bs = Array.from(document.querySelectorAll('.student-start-btn'));
      const card = (m) => document.querySelector(`.mode-card[data-mode="${m}"]`);
      const sr = sec.getBoundingClientRect();
      const maps = Array.from(document.querySelectorAll('.map-launch-btn'));
      return {
        inside: bs.every((b) => sec.contains(b)), skillInside: sec.contains(document.getElementById('studentStartSkill')),
        cols: bs.map((b) => { const c = getComputedStyle(b); const k = getComputedStyle(card(b.dataset.mode)); return { m: b.dataset.mode, bg: c.backgroundImage, border: c.borderTopColor, cardBorder: k.borderTopColor, cardBg: k.backgroundImage }; }),
        minH: Math.min(...bs.map((b) => b.getBoundingClientRect().height)), minW: Math.min(...bs.map((b) => b.getBoundingClientRect().width)),
        secBottom: sr.bottom, mapTop: Math.min(...maps.map((m) => m.getBoundingClientRect().top)),
        btnTop: Math.min(...bs.map((b) => b.getBoundingClientRect().top)), btnBottom: Math.max(...bs.map((b) => b.getBoundingClientRect().bottom)),
        secTop: sr.top,
      };
    });
    check(lay.inside && lay.skillInside, `[${w}] four Start buttons and "Your skill" inside the Choose Mode box`);
    check(lay.btnTop >= lay.secTop && lay.btnBottom <= lay.secBottom && lay.btnBottom - lay.btnTop > 100, `[${w}] Choose Mode box is filled by the buttons (${Math.round(lay.btnTop - lay.secTop)}..${Math.round(lay.btnBottom - lay.secTop)} of ${Math.round(lay.secBottom - lay.secTop)})`);
    check(new Set(lay.cols.map((c) => c.border)).size === 4 && new Set(lay.cols.map((c) => c.bg)).size === 4, `[${w}] each Start button has its own colour`);
    for (const c of lay.cols) check(c.border === c.cardBorder && (c.m === 'practice' ? /181, 216, 255/.test(c.bg) && c.border === 'rgb(90, 157, 238)' : c.bg === c.cardBg), `[${w}] ${c.m} button matches its mode-card colour (${c.border})`);
    check(lay.minH >= 44 && lay.minW >= 44, `[${w}] Start buttons >= 44 px (${Math.round(lay.minW)}x${Math.round(lay.minH)})`);
    const shape = await page.evaluate(() => {
      const pg = document.getElementById('mqHomeMascot'); const pc = getComputedStyle(pg); const pr = pg.getBoundingClientRect();
      return { peng: { r: pc.borderTopLeftRadius, bw: pc.borderTopWidth, h: pr.height, top: pr.top },
        btns: Array.from(document.querySelectorAll('.student-start-btn')).map((b) => { const c = getComputedStyle(b); const r = b.getBoundingClientRect(); const i = b.querySelector('.mode-icon').getBoundingClientRect(); const n = b.querySelector('.mode-name').getBoundingClientRect();
          return { r: c.borderTopLeftRadius, bw: c.borderTopWidth, h: r.height, top: Math.round(r.top), iconAbove: i.bottom <= n.top + 1, iconTop: Math.round(i.top) }; }) };
    });
    check(shape.btns.every((b) => b.r === shape.peng.r && b.bw === shape.peng.bw), `[${w}] Start cards share the penguin card radius/border (${shape.peng.r}, ${shape.peng.bw})`);
    check(shape.btns.every((b) => b.iconAbove), `[${w}] each Start card has its icon above its name`);
    if (w === 1280) {
      check(new Set(shape.btns.map((b) => b.top)).size === 1, `[${w}] four Start cards in one row`);
      check(shape.btns.every((b) => Math.abs(b.h - shape.peng.h) <= 6), `[${w}] Start cards as tall as the penguin card (${shape.btns.map((b) => Math.round(b.h))} vs ${Math.round(shape.peng.h)})`);
    } else {
      check(new Set(shape.btns.map((b) => b.top)).size === 2, `[${w}] Start cards in a 2x2 grid`);
      check([[0,1],[2,3]].every(([a, b]) => Math.abs(shape.btns[a].iconTop - shape.btns[b].iconTop) <= 1), `[${w}] icons line up per row (${shape.btns.map((b) => b.iconTop)})`);
      check(shape.btns.every((b) => b.h >= 120), `[${w}] Start cards are tall tiles (${shape.btns.map((b) => Math.round(b.h))})`);
    }
    // dark theme: tile labels and the penguin bubble keep >= 4.5:1
    await page.evaluate(() => { document.documentElement.classList.add('dark', 'dark-theme'); }); await sleep(300);
    const dk = await page.evaluate(() => {
      const rgb = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
      const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
      const stops = (bg) => (bg.match(/rgba?\([^)]*\)|#[0-9a-f]{6}/gi) || []).map((c) => c[0] === '#' ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) : rgb(c));
      const out = Array.from(document.querySelectorAll('.student-start-btn')).map((b) => { const c = getComputedStyle(b); const fg = rgb(c.color); const st = stops(c.backgroundImage); return { m: b.dataset.mode, min: Math.min(...st.map((s) => cr(fg, s))) }; });
      const bub = document.querySelector('#mqHomeMascot .mq-mascot-bubble'); const bc = getComputedStyle(bub);
      out.push({ m: 'bubble', min: cr(rgb(bc.color), rgb(bc.backgroundColor)) });
      return out;
    });
    for (const d of dk) check(d.min >= 4.5, `[${w}] dark: ${d.m} label contrast ${d.min.toFixed(2)}:1 >= 4.5`);
    await page.screenshot({ path: path.join(OUT, `student-home-dark-${w}.png`), fullPage: true });
    await page.evaluate(() => { document.documentElement.classList.remove('dark', 'dark-theme'); }); await sleep(200);
    check(lay.mapTop >= lay.secBottom, `[${w}] MAP buttons below Choose Mode (${Math.round(lay.mapTop)} >= ${Math.round(lay.secBottom)})`);
    check(!home.startGame && home.cards === 0, `[${w}] old Start Game and mode cards hidden for students`);
    check(home.map === 3, `[${w}] MAP buttons still shown (${home.map})`);
    const startName = await page.evaluate(() => (document.getElementById('studentStartSkillName') || {}).textContent || '');
    check(startName.length > 2, `[${w}] student home names the chosen skill beside Start ("${startName}")`);
    await page.screenshot({ path: path.join(OUT, `student-home-${w}.png`), fullPage: true });
    if (w === 1280) { await page.evaluate(() => window.setUserRole('teacher')); await sleep(500);
      const t = await page.evaluate(() => ({ cards: Array.from(document.querySelectorAll('.mode-card')).filter((c) => getComputedStyle(c).display !== 'none').length, start: getComputedStyle(document.querySelector('.start-game-btn')).display !== 'none', stud: Array.from(document.querySelectorAll('.student-start-btn')).filter((b) => b.getBoundingClientRect().width > 0).length }));
      check(t.cards === 5 && t.start && t.stud === 0, `[teacher] five mode cards + Start Game, no student buttons ${JSON.stringify(t)}`);
      await page.screenshot({ path: path.join(OUT, 'teacher-home-1280.png'), fullPage: true });
      await page.evaluate(() => window.setUserRole('student')); await sleep(500); }

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
    await page.evaluate(() => {
      document.querySelectorAll('.toast-notification, .toast, #toast, [class*="toast"]').forEach((t) => { t.style.display = 'none'; });
      document.querySelectorAll('body *').forEach((e) => { const r = e.getBoundingClientRect(); if (getComputedStyle(e).position === 'fixed' && r.top > innerHeight - 120 && r.left > 300 && r.right < innerWidth - 300) e.style.display = 'none'; });
      const ae = document.activeElement; if (ae && ae.scrollIntoView) ae.scrollIntoView({ block: 'center' });
    });
    await sleep(300);
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
    await page.evaluate(() => document.getElementById('skipQuestionBtn').scrollIntoView({ block: 'center' }));
    await sleep(200);
    const skipRect = await page.evaluate(() => { const r = document.getElementById('skipQuestionBtn').getBoundingClientRect(); return { top: r.top, bottom: r.bottom, vh: innerHeight, w: r.width }; });
    check(skipRect.w > 0 && skipRect.top >= 0 && skipRect.bottom <= skipRect.vh, `[${w}] Skip button is in view ${JSON.stringify(skipRect)}`);
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
    const wsSkip0 = await page.evaluate(() => Array.from(document.querySelectorAll('.ws-skip-btn')).filter((b) => getComputedStyle(b).display !== 'none').length);
    check(wsSkip0 === 0, `[${w}] worksheet: no per-card Skip visible before any wrong check (${wsSkip0})`);
    for (let k = 1; k <= 5; k++) {
      await page.evaluate(() => { const q = window.state.worksheetQs[0]; const i = document.getElementById('ws_input_0') || document.querySelector('#ws_card_0 input'); i.value = String((Number(q.ans) || 0) + 7777); window.checkWorksheetAnswer(0); });
      await sleep(150);
      const vis = await page.evaluate(() => { const b = document.querySelector('#ws_card_0 .ws-skip-btn'); return !!b && getComputedStyle(b).display !== 'none'; });
      const other = await page.evaluate(() => { const b = document.querySelector('#ws_card_1 .ws-skip-btn'); return !!b && getComputedStyle(b).display !== 'none'; });
      if (k === 4) check(!vis, `[${w}] worksheet: card 0 Skip hidden after 4 wrong checks`);
      if (k === 5) check(vis && !other, `[${w}] worksheet: card 0 Skip shown after 5 wrong checks, card 1 still hidden (${vis}/${other})`);
    }
    await page.evaluate(() => document.querySelector('#ws_card_0').scrollIntoView({ block: 'center' }));
    await page.screenshot({ path: path.join(OUT, `worksheet-skip-after-5-${w}.png`) });
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
