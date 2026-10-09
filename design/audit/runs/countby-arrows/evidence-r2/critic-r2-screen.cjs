// critic r2: count_by_tables on card / worksheet / quiz. Boxes + Lines. Arrow clearance vs painted (clipped) answer areas incl. the
// active highlight and right/wrong tints; lines per row; swipe; reach; typing; caret.
const path = require('path'); const fs = require('fs');
const TREE = process.env.TREE, OUT = process.env.OUT;
const { open } = require(path.join(TREE, 'tests/lib/ws-harness.cjs'));
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const R = (step, start, at, dir) => Object.assign({ step }, start ? { start } : {}, at !== undefined ? { at } : {}, dir ? { dir } : {});
const CASES = {
  boxes: { rows: [R(7)] },
  lines: { rows: [R(7)], spaces: 'line' },
  'lines-3dig': { rows: [R(12)], spaces: 'line' },
  'boxes-3dig': { rows: [R(12)] },
  'lines-wide': { rows: [R(1000, 'custom', 14000)], spaces: 'line' },
  'lines-times': { rows: [R(7)], times: 'each', spaces: 'line' },
  'lines-default': { spaces: 'line' },
};
const VPS = (process.env.VPS || '1366x650,1280x600,1366x650t,1280x600t,390x844t').split(',').map((s) => { const m = /(\d+)x(\d+)(t?)/.exec(s); return [+m[1], +m[2], !!m[3]]; });
const MEASURE = () => {
  const row = [...document.querySelectorAll('.k2-countrow')].find((x) => x.offsetParent);
  if (!row) return { error: 'no row' };
  const rect = (e) => e.getBoundingClientRect();
  const clip = (e) => { let r = rect(e); r = { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    const cs = getComputedStyle(e); const ring = Math.max(parseFloat(cs.outlineWidth) || 0, 0) + (parseFloat(cs.outlineOffset) || 0);
    if (cs.outlineStyle !== 'none' && ring > 0) { r.left -= ring; r.right += ring; r.top -= ring; r.bottom += ring; }
    // outer (non-inset) box-shadow spread
    const sh = cs.boxShadow || ''; if (sh !== 'none' && !/inset/.test(sh)) { const m = sh.match(/0px 0px 0px ([\d.]+)px/g); if (m) { const s = Math.max(...m.map((x) => parseFloat(x.split(' ')[3]))); r.left -= s; r.right += s; r.top -= s; r.bottom += s; } }
    for (let a = e.parentElement; a && a !== row; a = a.parentElement) { const o = getComputedStyle(a); if (o.overflowX !== 'visible' || o.overflow !== 'visible') { const q = rect(a); r.left = Math.max(r.left, q.left); r.right = Math.min(r.right, q.right); r.top = Math.max(r.top, q.top); r.bottom = Math.min(r.bottom, q.bottom); } }
    return r; };
  const jumps = [...row.querySelectorAll('.k2-jump')].filter((j) => rect(j).width > 0);
  let minClear = Infinity, overlaps = 0; const lens = [];
  for (const j of jumps) {
    const ps = [...j.querySelectorAll('path,polygon,line')].map(rect).filter((x) => x.width > 0);
    if (!ps.length) continue;
    const a = { left: Math.min(...ps.map((x) => x.left)), right: Math.max(...ps.map((x) => x.right)), top: Math.min(...ps.map((x) => x.top)), bottom: Math.max(...ps.map((x) => x.bottom)) };
    lens.push(a.right - a.left);
    const line = j.closest('.k2-countrow-line') || j.parentElement.parentElement;
    const obs = [...line.querySelectorAll('input.mq-cellslot, .k2-tile, .k2-given, .k2-line-slot, .k2-shape')].map(clip).filter((o) => o.right - o.left > 0);
    for (const o of obs) { const v = Math.min(o.bottom, a.bottom) - Math.max(o.top, a.top); if (v <= 0) continue;
      let g; if (o.right <= a.left) g = a.left - o.right; else if (o.left >= a.right) g = o.left - a.right; else g = -1;
      if (g < minClear) minClear = g; if (g < 0) overlaps++; }
  }
  const lines = [...row.querySelectorAll('.k2-countrow-line')].filter((l) => rect(l).height > 0);
  const perLine = lines.map((l) => l.querySelectorAll('input.mq-cellslot, .k2-given').length).join('+');
  const inputs = [...row.querySelectorAll('input.mq-cellslot')].filter((e) => e.offsetParent);
  const inpVsLine = inputs.map((i) => { const ls = i.closest('.k2-line-slot'); if (!ls) return 0; const a = rect(i), b = rect(ls); return Math.max(0, b.left - a.left, a.right - b.right); });
  const btn = [...document.querySelectorAll('button')].filter((b) => b.offsetParent && /^(check|submit|check answer|next)/i.test(b.textContent.trim()));
  const swipe = [...document.querySelectorAll('*')].some((e) => e.offsetParent && e.children.length === 0 && /swipe/i.test(e.textContent || ''));
  const rr = rect(row); const br = btn.length ? rect(btn[0]) : null; const fr = inputs[0] ? rect(inputs[0]) : null;
  const scroller = row.querySelector('[data-mq-swiperow]'); 
  return { jumps: jumps.length, minClear: minClear === Infinity ? null : +minClear.toFixed(1), overlaps, minLen: lens.length ? +Math.min(...lens).toFixed(1) : null,
    lines: lines.length, perLine, inputs: inputs.length, inputOverhang: +Math.max(0, ...inpVsLine).toFixed(1), firstW: fr && Math.round(fr.width), firstH: fr && Math.round(fr.height), fsz: inputs[0] ? parseFloat(getComputedStyle(inputs[0]).fontSize) : null,
    rowTop: Math.round(rr.top), rowBottom: Math.round(rr.bottom), rowL: Math.round(rr.left), rowR: Math.round(rr.right), vw: innerWidth, vh: innerHeight, btn: btn.length ? btn[0].textContent.trim() : null, btnBottom: br && Math.round(br.bottom),
    swipe, rowScrollX: scroller ? scroller.scrollWidth - scroller.clientWidth : null, sideways: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    pulsing: document.querySelectorAll('.mq-active-box').length, pulseIdx: inputs.indexOf(document.querySelector('.mq-active-box')) };
};
(async () => {
  const app = await open({ seed: 3, viewport: { width: 1366, height: 650, deviceScaleFactor: 1 } });
  const { page } = app; const out = [];
  for (const [W, H, touch] of VPS) for (const host of ['card', 'worksheet', 'quiz']) for (const [name, opts] of Object.entries(CASES)) {
    if (W === 390 && !['boxes', 'lines', 'lines-3dig'].includes(name)) continue;
    await page.setViewport({ width: W, height: H, deviceScaleFactor: 1, hasTouch: touch, isMobile: W < 500 });
    await page.evaluate(async ({ opts, host }) => {
      const st = window.state; window.clearSetOptions({ silent: true });
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
    const m = await page.evaluate(MEASURE);
    await page.screenshot({ path: path.join(OUT, `screen-${tag}.png`) });
    let caret = null, after = null;
    const ans = await page.evaluate(() => {
      const row = [...document.querySelectorAll('.k2-countrow')].find((x) => x.offsetParent);
      const tab = row.querySelector('[data-ws-steptab]');
      const step = tab ? Number(tab.getAttribute('data-ws-steptab').replace(/[^0-9]/g, '')) : null;
      const down = tab && /−|-/.test(tab.getAttribute('data-ws-steptab'));
      const cols = [...row.querySelectorAll('.k2-given, input.mq-cellslot')];
      const fg = cols.findIndex((e) => e.classList.contains('k2-given'));
      const v0 = Number(cols[fg].textContent.replace(/[^0-9]/g, '')) - (down ? -1 : 1) * fg * step;
      return cols.map((e, k) => e.matches('input') ? String(v0 + (down ? -1 : 1) * k * step) : null).filter((x) => x !== null);
    });
    const vis = []; for (const i of await page.$$('.k2-countrow input.mq-cellslot')) if (await i.evaluate((e) => !!e.offsetParent)) vis.push(i);
    if (vis.length) {
      const pIdx = Math.max(0, m.pulseIdx); const t0 = vis[pIdx];
      if (touch) { await t0.evaluate((e) => e.scrollIntoView({ block: 'nearest', inline: 'nearest' })); const b = await t0.boundingBox(); if (b) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); } else await t0.click();
      await sleep(250);
      const tapFocus = await page.evaluate(() => { const ins = [...document.querySelectorAll('.k2-countrow input.mq-cellslot')].filter((e) => e.offsetParent); return ins.indexOf(document.activeElement); });
      for (const ch of ans[pIdx]) { await page.keyboard.type(ch); await sleep(60); }
      await sleep(600);
      caret = await page.evaluate(() => { const ins = [...document.querySelectorAll('.k2-countrow input.mq-cellslot')].filter((e) => e.offsetParent); return { focusIdx: ins.indexOf(document.activeElement), pulseIdx: ins.indexOf(document.querySelector('.mq-active-box')), cls: ins[0].className.replace(/\s+/g, ' ') }; });
      caret.tapFocus = tapFocus; caret.typed = ans[pIdx]; caret.typedIdx = pIdx;
      if (ans[pIdx + 1] && caret.focusIdx === pIdx + 1) {
        const wrong = String(Number(ans[pIdx + 1]) + 1);
        for (const ch of wrong) { await page.keyboard.type(ch); await sleep(60); }
        await sleep(600);
        caret.afterWrong = await page.evaluate(() => { const ins = [...document.querySelectorAll('.k2-countrow input.mq-cellslot')].filter((e) => e.offsetParent); return { focusIdx: ins.indexOf(document.activeElement), vals: ins.slice(0, 4).map((e) => e.value), cls: (ins[1] || {}).className }; });
      }
      after = await page.evaluate(MEASURE);
      await page.screenshot({ path: path.join(OUT, `screen-${tag}-typed.png`) });
      // zoom crop of the row
      const rb = await page.evaluate(() => { const row = [...document.querySelectorAll('.k2-countrow')].find((x) => x.offsetParent); const r = row.getBoundingClientRect(); return { x: Math.max(0, r.left - 4), y: Math.max(0, r.top - 4), width: Math.min(innerWidth - Math.max(0, r.left - 4), r.width + 8), height: Math.min(innerHeight - Math.max(0, r.top - 4), r.height + 8) }; });
      if (rb.width > 0 && rb.height > 0) await page.screenshot({ path: path.join(OUT, `zoom-${tag}.png`), clip: rb });
    }
    const rec = { tag, ...m, caret, afterTyping: after && { minClear: after.minClear, overlaps: after.overlaps, pulseIdx: after.pulseIdx } };
    out.push(rec); console.log(JSON.stringify(rec));
  }
  fs.writeFileSync(path.join(OUT, 'screen-metrics.json'), JSON.stringify(out, null, 1));
  console.log('problems', JSON.stringify(app.problems.slice(0, 10)));
  await app.close();
})().catch((e) => { console.error(e); process.exit(1); });
