// Critic: count_by_tables on the card, online worksheet and quiz at 1366x650, 1280x600 (Chromebook visible heights) and 390x844.
// Boxes and Lines. Measures arrow clearance, reachability of the answer + Check, typing / caret advance, pulsing, touch taps.
const path = require('path');
const fs = require('fs');
const TREE = process.env.TREE, OUT = process.env.OUT;
const { open } = require(path.join(TREE, 'tests/lib/ws-harness.cjs'));
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const R = (step, start, at, dir) => Object.assign({ step }, start ? { start } : {}, at !== undefined ? { at } : {}, dir ? { dir } : {});
const CASES = {
  boxes: {},
  lines: { spaces: 'line' },
  'boxes-wide': { rows: [R(1000, 'custom', 14000)] },
  'lines-wide': { rows: [R(1000, 'custom', 14000)], spaces: 'line' },
  'times-each': { rows: [R(7)], times: 'each' },
};
const VPS = [[1366, 650, false], [1280, 600, false], [1366, 650, true], [390, 844, true]];

(async () => {
  const app = await open({ seed: 3, viewport: { width: 1366, height: 650, deviceScaleFactor: 1 } });
  const { page } = app;
  const out = [];
  for (const [W, H, touch] of VPS) for (const host of ['card', 'worksheet', 'quiz']) for (const [name, opts] of Object.entries(CASES)) {
    if (W === 390 && !['boxes', 'lines'].includes(name)) continue;
    if (touch && W !== 390 && !['boxes', 'lines'].includes(name)) continue;
    await page.setViewport({ width: W, height: H, deviceScaleFactor: 1, hasTouch: touch, isMobile: W < 500 });
    await page.evaluate(async ({ opts, host }) => {
      const st = window.state;
      window.clearSetOptions({ silent: true });
      window.setSetOptions('multiplication', 'count_by_tables', opts, { silent: true });
      st.category = 'multiplication'; st.skill = 'count_by_tables'; st.isMixedMode = false; st.quizMode = false; st.hasAnswered = false;
      if (host === 'card') { st.gameMode = 'practice'; window.showView('gameView'); st.currentQ = window.generateQuestion(); window.renderQuestion(); }
      else if (host === 'quiz') {
        const q0 = window.generateQuestionFor({ category: 'multiplication', skill: 'count_by_tables', seed: 12, itemIndex: 0, opts });
        const questions = [{ id: 0, skillId: 'count_by_tables', points: 1, questionData: window.quizQuestionData(q0) }];
        const test = { id: null, name: 'C', sections: [{ id: 0, label: 'A', layout: { columns: 1, spacing: 'normal' }, instructions: '', questions }],
          settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
        window.handleQuizURL(window.compressTestForURL(test));
        const nm = document.getElementById('qtStudentName'); nm.value = 'A'; nm.dispatchEvent(new Event('input'));
        window.startQuizTest();
      } else { st.gameMode = 'worksheet'; window.showView('worksheetView'); window.initWorksheet(); }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, host === 'quiz' ? 1300 : 1000));
    }, { opts, host });
    const tag = `${W}x${H}${touch ? '-touch' : ''}-${host}-${name}`;
    const m = await page.evaluate((host) => {
      const MM = 1;
      const row = [...document.querySelectorAll('.k2-countrow')].find((x) => x.offsetParent);
      if (!row) return { error: 'no row' };
      const rect = (e) => e.getBoundingClientRect();
      const jumps = [...row.querySelectorAll('.k2-jump')].filter((j) => rect(j).width > 0);
      let minClear = Infinity, overlaps = 0, lens = [];
      for (const j of jumps) {
        const ps = [...j.querySelectorAll('path,polygon')].map(rect);
        if (!ps.length) continue;
        const a = { left: Math.min(...ps.map((x) => x.left)), right: Math.max(...ps.map((x) => x.right)), top: Math.min(...ps.map((x) => x.top)), bottom: Math.max(...ps.map((x) => x.bottom)) };
        lens.push(a.right - a.left);
        const line = j.closest('[data-mq-wrapped]') || j.parentElement.parentElement;
        const obs = [...line.querySelectorAll('input.mq-cellslot, .k2-tile, .k2-given, .k2-line-slot')].map(rect).filter((o) => o.width > 0);
        for (const o of obs) {
          const v = Math.min(o.bottom, a.bottom) - Math.max(o.top, a.top); if (v <= 0) continue;
          let g; if (o.right <= a.left) g = a.left - o.right; else if (o.left >= a.right) g = o.left - a.right; else g = -1;
          if (g < minClear) minClear = g; if (g < 0) overlaps++;
        }
      }
      const inputs = [...row.querySelectorAll('input.mq-cellslot, input')].filter((e) => e.offsetParent);
      const first = inputs[0];
      const btn = [...document.querySelectorAll('button')].filter((b) => b.offsetParent && /^(check|submit|check answer|next)/i.test(b.textContent.trim()));
      const vh = window.innerHeight;
      const fr = first ? rect(first) : null;
      const br = btn.length ? rect(btn[0]) : null;
      const rr = rect(row);
      const lineSlots = row.querySelectorAll('[data-ws-shape="line"]').length;
      const pulsing = document.querySelectorAll('.mq-active-box').length;
      const sideways = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      const fsz = first ? parseFloat(getComputedStyle(first).fontSize) : null;
      return { jumps: jumps.length, minClear: minClear === Infinity ? null : +minClear.toFixed(1), overlaps, minLen: lens.length ? +Math.min(...lens).toFixed(1) : null,
        inputs: inputs.length, firstTop: fr && Math.round(fr.top), firstBottom: fr && Math.round(fr.bottom), firstW: fr && Math.round(fr.width), firstH: fr && Math.round(fr.height), fsz,
        rowTop: Math.round(rr.top), rowBottom: Math.round(rr.bottom), rowW: Math.round(rr.width), btn: btn.length ? btn[0].textContent.trim() : null, btnBottom: br && Math.round(br.bottom), vh,
        lineSlots, pulsing, sideways, focused: document.activeElement && document.activeElement.classList.contains('mq-cellslot') };
    }, host);
    // screenshot of the viewport
    await page.screenshot({ path: path.join(OUT, `screen-${tag}.png`) });
    // typing: focus the active box (tap or click) and type its correct answer; does the caret move on to the next box?
    const typing = await page.evaluate(() => {
      const row = [...document.querySelectorAll('.k2-countrow')].find((x) => x.offsetParent);
      const act = document.querySelector('.mq-active-box');
      const inputs = [...row.querySelectorAll('input.mq-cellslot')].filter((e) => e.offsetParent);
      const q = window.state.currentQ || null;
      return { activeIdx: inputs.indexOf(act), n: inputs.length };
    });
    let caret = null;
    if (typing.n) {
      // answers: read from the row values (key) via the question
      const ans = await page.evaluate((host) => {
        const row = [...document.querySelectorAll('.k2-countrow')].find((x) => x.offsetParent);
        // the given numbers and the step: derive the expected sequence from the first two printed numbers + the tab
        const tab = row.querySelector('[data-ws-steptab]');
        const step = tab ? Number(tab.getAttribute('data-ws-steptab').replace(/[^0-9]/g, '')) : null;
        const down = tab && /−|-/.test(tab.getAttribute('data-ws-steptab'));
        const cols = [...row.querySelectorAll('.k2-given, input.mq-cellslot')];
        const firstGiven = cols.findIndex((e) => e.classList.contains('k2-given'));
        const v0 = Number(cols[firstGiven].textContent.replace(/[^0-9]/g, '')) - (down ? -1 : 1) * firstGiven * step;
        return cols.map((e, k) => e.matches('input') ? String(v0 + (down ? -1 : 1) * k * step) : null).filter((x) => x !== null);
      }, host);
      const inputs = await page.$$('.k2-countrow input.mq-cellslot');
      const vis = [];
      for (const i of inputs) if (await i.evaluate((e) => !!e.offsetParent)) vis.push(i);
      const t0 = vis[0];
      if (touch) { const b = await t0.boundingBox(); if (b) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); }
      else await t0.click();
      await sleep(250);
      for (const ch of ans[0]) { await page.keyboard.type(ch); await sleep(60); }
      await sleep(600);
      caret = await page.evaluate(() => {
        const row = [...document.querySelectorAll('.k2-countrow')].find((x) => x.offsetParent);
        const ins = [...row.querySelectorAll('input.mq-cellslot')].filter((e) => e.offsetParent);
        const a = document.activeElement;
        return { focusIdx: ins.indexOf(a), firstVal: ins[0].value, pulseIdx: ins.indexOf(document.querySelector('.mq-active-box')), firstCls: ins[0].className };
      });
      caret.expect = ans[0];
      // type a WRONG full answer into box 2: caret should stay (not right)
      if (ans[1]) {
        for (const ch of String(Number(ans[1]) + 1)) { await page.keyboard.type(ch); await sleep(60); }
        await sleep(500);
        caret.afterWrong = await page.evaluate(() => { const row = [...document.querySelectorAll('.k2-countrow')].find((x) => x.offsetParent); const ins = [...row.querySelectorAll('input.mq-cellslot')].filter((e) => e.offsetParent); return { focusIdx: ins.indexOf(document.activeElement), vals: ins.slice(0, 3).map((e) => e.value) }; });
      }
      await page.screenshot({ path: path.join(OUT, `screen-${tag}-typed.png`) });
    }
    out.push({ tag, ...m, caret });
    console.log(JSON.stringify({ tag, ...m, caret }));
  }
  fs.writeFileSync(path.join(OUT, 'screen-metrics.json'), JSON.stringify(out, null, 1));
  console.log('problems', JSON.stringify(app.problems.slice(0, 10)));
  await app.close();
})().catch((e) => { console.error(e); process.exit(1); });
