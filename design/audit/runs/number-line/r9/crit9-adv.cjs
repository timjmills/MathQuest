// Critic r9 adversarial probe of _guardRefLine (question-render.js, d6075045).
// Usage: MQ_ROOT=<tree> node crit9-adv.cjs <out.json>
// Each test starts a fresh render (the guard arms on renderQuestion) and then acts as a pupil would
// within the guard's 1.5 s window. Every test runs with the line ON and OFF, so any difference is the guard's.
const fs = require('fs');
const { open } = require('/home/user/mq-numberline/tests/lib/ws-harness.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const OUT = process.argv[2];
const SKILLS = [['subtraction', 'sub_100_regroup', {}], ['multiplication', 'nl_mult', {}], ['addition', 'add_facts', {}], ['addition', 'mixed_addition', { nlFrom: 0, nlTo: 100 }]];
const SIZES = [{ w: 1280, h: 600 }, { w: 1366, h: 650 }];

function snap() {
  const vis = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) }; };
  const ae = document.activeElement;
  const b = document.getElementById('mqRefLine');
  return { sy: Math.round(scrollY), docH: document.documentElement.scrollHeight, ae: ae ? (ae.id || (ae.className || '').toString().slice(0, 30) || ae.tagName) : '', aeR: vis(ae), band: b ? vis(b) : null };
}

(async () => {
  const h = await open({ viewport: { width: 1280, height: 600, deviceScaleFactor: 1 } });
  const { page } = h;
  const cdp = await page.target().createCDPSession();
  const dialogs = [];
  page.on('dialog', async (d) => { dialogs.push(d.type() + ': ' + d.message().slice(0, 60)); try { await d.accept(); } catch (e) { /* gone */ } });
  const base = page.url().split('?')[0];
  const res = [];
  const start = async (size, cat, skill, extra, line) => {
    await page.setViewport({ width: size.w, height: size.h, deviceScaleFactor: 1 });
    await page.goto(base, { waitUntil: 'networkidle2' });
    await page.waitForFunction(() => typeof window.playSelectedSkills === 'function' && window.UnifiedSkills && typeof window.generateSkillCode === 'function', { timeout: 30000 });
    const code = await page.evaluate((cat, skill, extra, line) => {
      window.clearSetOptions && window.clearSetOptions({ silent: true });
      const U = window.UnifiedSkills; U.clear();
      U.add({ categoryId: cat, skillId: skill, skillLabel: skill, opts: line ? Object.assign({ nlOn: true }, extra) : {} });
      return window.generateSkillCode();
    }, cat, skill, extra, line);
    await page.goto(base + '?c=' + encodeURIComponent(`${code}|Gp-N10-T300`), { waitUntil: 'networkidle2' });
    await page.waitForFunction(() => window.state && window.state.landingSettings && typeof window.startFromLanding === 'function', { timeout: 30000 });
    await page.evaluate(() => window.startFromLanding());
    await sleep(1800);
    try { await page.waitForFunction(() => document.fonts.status === 'loaded', { timeout: 8000 }); } catch (e) { /* ignore */ }
  };
  // a fresh render of a new item: the guard arms for 1.5 s
  const rerender = async () => (process.env.DBG && console.error('rerender'), page.evaluate(() => { const st = window.state; st.hasAnswered = false; st.currentQ = window.generateQuestion(); window.renderQuestion(); }));
  const trace = async () => page.evaluate(() => { window.__tr = []; window.__trOn = true; const f = () => { if (!window.__trOn) return; window.__tr.push(Math.round(scrollY)); requestAnimationFrame(f); }; requestAnimationFrame(f); });
  const untrace = async () => page.evaluate(() => { window.__trOn = false; const seg = []; for (const y of window.__tr) { if (!seg.length || seg[seg.length - 1][0] !== y) seg.push([y, 1]); else seg[seg.length - 1][1]++; } return seg.map(([y, n]) => `${y}x${n}`).join('>'); });
  const listeners = async () => {
    const { result } = await cdp.send('Runtime.evaluate', { expression: 'window' });
    const { listeners: L } = await cdp.send('DOMDebugger.getEventListeners', { objectId: result.objectId });
    const c = {}; for (const l of L) c[l.type] = (c[l.type] || 0) + 1; return c;
  };

  for (const size of SIZES) for (const [cat, skill, extra] of SKILLS) for (const line of [true, false]) {
    const tag = `${size.w}x${size.h} ${skill} ${line ? 'line' : 'OFF'}`;
    const r = { tag, t: {} };
    try {
      await start(size, cat, skill, extra, line);
      r.t.base = await page.evaluate(snap);
      console.error(tag + ' T1');
      // T1 PageDown with the caret in the box (the guard ignores keys aimed at an INPUT)
      await rerender(); await sleep(150);
      const s0 = await page.evaluate(snap);
      await trace(); await page.keyboard.press('PageDown'); await sleep(60);
      const s1 = await page.evaluate(snap); await sleep(1700);
      r.t.pageDownInInput = { before: s0.sy, ae: s0.ae, after60: s1.sy, after1760: (await page.evaluate(snap)).sy, trace: await untrace() };
      console.error(tag + ' T2');
      // T2 ArrowDown x3 with nothing focused (body)
      await rerender(); await sleep(150);
      await page.evaluate(() => document.activeElement && document.activeElement.blur());
      await trace(); for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowDown'); await sleep(400);
      r.t.arrowBody = { after400: (await page.evaluate(snap)).sy, trace: await untrace() };
      await sleep(1500);
      console.error(tag + ' T3');
      // T3 a scroll with no pointer / wheel / key (stands for a scrollbar drag or a screen-reader scroll)
      await rerender(); await sleep(150);
      await trace(); await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await sleep(60); const a60 = (await page.evaluate(snap)).sy; await sleep(1700);
      r.t.silentScroll = { after60: a60, after1760: (await page.evaluate(snap)).sy, trace: await untrace() };
      console.error(tag + ' T4');
      // T4 Tab through the card from a fresh render: each focused control and whether it is in view
      await page.evaluate(() => window.scrollTo(0, 0));
      await rerender(); await sleep(150);
      const tabs = [];
      await trace();
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press('Tab'); await sleep(80);
        const s = await page.evaluate(() => { const ae = document.activeElement; const r = ae.getBoundingClientRect(); let hdr = 0; for (const el of document.querySelectorAll('#gameView > *')) { if (getComputedStyle(el).position !== 'sticky') continue; const q = el.getBoundingClientRect(); if (q.height > 0 && q.top < 20 && q.bottom < innerHeight / 2) hdr = Math.max(hdr, q.bottom); } return { ae: ae.id || (ae.className || '').toString().slice(0, 24) || ae.tagName, sy: Math.round(scrollY), inView: r.height === 0 ? 'hidden' : (r.top >= hdr - 1 && r.bottom <= innerHeight + 1) }; });
        tabs.push(`${s.ae}@${s.sy}${s.inView === true ? '' : s.inView === 'hidden' ? '(0h)' : '(OUT)'}`);
      }
      r.t.tab = { tabs: tabs.join(' '), trace: await untrace() };
      await sleep(1500);
      console.error(tag + ' T5');
      // T5 typing the answer right after a render (stack digits move the caret cell to cell)
      await page.evaluate(() => window.scrollTo(0, 0));
      await rerender(); await sleep(120);
      const ans = await page.evaluate(() => String(window.state.currentQ && window.state.currentQ.ans));
      const rtl = await page.evaluate(() => !!(document.activeElement && /column-answer-input/.test(document.activeElement.className)));
      const clean = ans.replace(/[^0-9.\-\/ ]/g, '') || '1';
      await trace(); await page.keyboard.type(rtl ? clean.split('').reverse().join('') : clean, { delay: 60 }); await sleep(800);
      r.t.typing = { ans: clean, rtl, trace: await untrace(), end: await page.evaluate(snap) };
      await sleep(1500);
      console.error(tag + ' T6');
      // T6 Hint, Read (Listen) and Solution pop-ups opened inside the window
      for (const [name, fn] of [['hint', 'showHint'], ['read', 'speakQuestion'], ['solution', 'showSolution']]) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await rerender(); await sleep(150);
        await trace();
        const ok = await page.evaluate((fn) => { try { window[fn](); return true; } catch (e) { return 'ERR ' + e.message; } }, fn);
        await sleep(600);
        // the pupil scrolls the page to read the pop-up (keyboard End, focus on body)
        await page.evaluate(() => window.scrollBy(0, 120));
        await sleep(100); const sA = (await page.evaluate(snap)).sy; await sleep(1500);
        r.t[name] = { ok, afterScroll: sA, end: (await page.evaluate(snap)).sy, trace: await untrace() };
        await page.keyboard.press('Escape');
        await page.evaluate(() => { for (const el of document.querySelectorAll('.modal.active, .modal.show, .hint-popup, .solution-popup, .mq-popup')) { el.classList.remove('active', 'show'); } window.closeSolution && window.closeSolution(); window.closeHint && window.closeHint(); window.stopSpeaking && window.stopSpeaking(); });
        await sleep(200);
      }
      console.error(tag + ' T7');
      // T7 listeners on window after many renders; then leave the game inside the window and scroll the home page
      r.t.listenersBefore = await listeners();
      for (let i = 0; i < 6; i++) { await rerender(); await sleep(50); }
      r.t.listenersAfter6 = await listeners();
      await rerender(); await sleep(50);
      await page.evaluate(() => (window.exitGame || window.goHome)());
      await sleep(150);
      const home = await page.evaluate(() => { window.scrollTo(0, 300); return { docH: document.documentElement.scrollHeight, vh: innerHeight, band: (() => { const b = document.getElementById('mqRefLine'); if (!b) return null; const q = b.getBoundingClientRect(); return { h: Math.round(q.height), top: Math.round(q.top) }; })() }; });
      await sleep(80); const hs = (await page.evaluate(snap)).sy; await sleep(400);
      r.t.leaveGame = Object.assign(home, { syAfter80: hs, syAfter480: (await page.evaluate(snap)).sy });
    } catch (e) { r.error = e.message; }
    r.dialogs = dialogs.splice(0);
    r.errors = h.problems.splice(0).map((p) => p.text.slice(0, 120));
    res.push(r);
    console.log(JSON.stringify(r));
  }
  fs.writeFileSync(OUT, JSON.stringify(res, null, 1));
  await h.close();
})();
