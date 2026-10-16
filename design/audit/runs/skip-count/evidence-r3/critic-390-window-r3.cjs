// critic r3: the phone window (D9) on the practice card, skip_count_line, over many questions dealt with
// generateQuestionFor({seed}) (deterministic), reached two ways: (a) load at 390, (b) resize 683 -> 390 then render
// (the order the r2 probe's "fresh 390" uses), touch. For each: window width, the visible right edge of the window,
// and every number / box (incl. the active box's outline) that straddles it. Screenshots of the cut cases.
//   node design/audit/runs/skip-count/evidence-r3/critic-390-window-r3.cjs <outdir>
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '../../../../..');
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SHOW = (page, seed, host) => page.evaluate(async ({ seed, host }) => {
  const st = window.state; const cat = 'patterns', skill = 'skip_count_line';
  window.clearSetOptions({ silent: true }); window.setSetOptions(cat, skill, {}, { silent: true });
  st.category = cat; st.skill = skill; st.isMixedMode = false; st.quizMode = false; st.hasAnswered = false;
  if (host === 'card') { st.gameMode = 'practice'; window.showView('gameView'); st.currentQ = window.generateQuestionFor({ category: cat, skill, seed, itemIndex: 0, opts: {} }); window.renderQuestion(); }
  else { window.__wsReseed && window.__wsReseed(seed); st.gameMode = 'worksheet'; window.showView('worksheetView'); window.initWorksheet(); }
  await new Promise((r) => setTimeout(r, 1500));
}, { seed, host });
const GEO = () => [...document.querySelectorAll('[data-mq-swiperow]')].filter((e) => e.offsetParent).map((w) => {
  const v = w.getBoundingClientRect(); const cell = w.closest('.mq-scell'); const cr = cell.getBoundingClientRect(); const cs = getComputedStyle(cell);
  const ir = cr.right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth);
  const edge = Math.min(v.right, ir);
  const els = [...w.querySelectorAll('.k2-countrow-body .k2-given, .k2-countrow-body .k2-tile-slot, .k2-countrow-body input')].filter((e) => e.getBoundingClientRect().width > 0);
  const cut = els.filter((e) => { const r = e.getBoundingClientRect(); return r.left < edge - 1 && r.right > edge + 1; })
    .map((e) => `${e.className || e.tagName}:${(e.textContent || e.value || '').trim() || 'box'}[${Math.round(e.getBoundingClientRect().left)}-${Math.round(e.getBoundingClientRect().right)}]`);
  const giv = [...w.querySelectorAll('.k2-given')].map((g) => g.textContent.trim()).join(',');
  return { win: Math.round(v.width * 10) / 10, winRight: Math.round(v.right), cellInnerRight: Math.round(ir), edge: Math.round(edge), cut, giv };
});
(async () => {
  const lines = []; let cuts = 0;
  for (const host of ['card', 'worksheet']) for (const route of ['load390', 'resize683to390']) {
    const app = await open({ seed: 9, viewport: { width: route === 'load390' ? 390 : 683, height: route === 'load390' ? 844 : 650, deviceScaleFactor: 1, hasTouch: true } });
    const { page } = app;
    for (let seed = 1; seed <= (host === 'card' ? 30 : 8); seed++) {
      if (route === 'resize683to390') { await page.setViewport({ width: 683, height: 650, deviceScaleFactor: 1, hasTouch: true }); await sleep(400); await SHOW(page, seed, host); await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, hasTouch: true }); await sleep(500); }
      await SHOW(page, seed, host);
      const g = await page.evaluate(GEO);
      const bad = g.some((r) => r.cut.length);
      if (bad) { cuts++; const el = await page.$('[data-mq-swiperow]'); if (el && cuts <= 8) { const b = await el.boundingBox(); await page.screenshot({ path: `${OUT}/${host}-${route}-seed${seed}.png`, clip: { x: 0, y: Math.max(0, b.y - 120), width: 390, height: Math.min(330, b.height + 200) } }).catch(() => {}); } }
      lines.push(`${bad ? 'CUT ' : 'ok  '} ${host} ${route} seed ${seed}: ${JSON.stringify(g)}`);
    }
    await app.close();
  }
  fs.writeFileSync(path.join(OUT, 'window-390.txt'), lines.join('\n') + '\n');
  console.log(lines.join('\n')); console.log(`cut cases: ${cuts}`);
})().catch((e) => { console.error(e); process.exit(1); });
