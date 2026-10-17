// critic probe: worksheet wrap across resizes, orientation, re-render; arrows; touch/keyboard entry at Chromebook sizes
const { open } = require('/home/user/MathQuest/.claude/worktrees/agent-a79237e5c40225940/tests/lib/ws-harness.cjs');
const OUT = process.argv[2];
let fails = 0; const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };
const CASES = [
  ['multiplication', 'count_by_tables', {}],
  ['multiplication', 'count_by_tables', { spaces: 'line' }],
  ['multiplication', 'count_by_tables', { rows: [{ step: 1000, start: 'custom', at: 14000 }] }],
  ['patterns', 'skip_count_grid', {}],
  ['patterns', 'skip_count_line', {}],
];
const SNAP = () => {
  const rows = [...document.querySelectorAll('#worksheetView [data-mq-swiperow]')].filter((e) => e.offsetParent);
  return rows.map((w) => {
    const cell = w.closest('.mq-scell'); const cr = cell.getBoundingClientRect();
    const conts = [...w.querySelectorAll('.k2-countrow-line [data-mq-wrapped]')];
    const cues = [...w.parentElement.querySelectorAll('.k2-swipe-cue')].filter((c) => c.offsetParent && getComputedStyle(c).display !== 'none').length;
    // arrows: each k2-jump inside cell, and vertically centred on its box
    let arrowOut = 0, arrowOff = 0, arrows = 0;
    w.querySelectorAll('.k2-jump').forEach((a) => {
      arrows++;
      const r = a.getBoundingClientRect(); const box = a.parentElement.lastElementChild.getBoundingClientRect();
      if (r.left < cr.left - 1 || r.right > cr.right + 1) arrowOut++;
      if (Math.abs((r.top + r.bottom) / 2 - (box.top + box.bottom) / 2) > 3) arrowOff++;
    });
    // an arrow overlapping a neighbouring box/number
    let overlap = 0;
    w.querySelectorAll('.k2-jumpcell').forEach((jc) => {
      const a = jc.querySelector('.k2-jump').getBoundingClientRect(); const prev = jc.previousElementSibling;
      if (prev && prev.getBoundingClientRect().top === jc.getBoundingClientRect().top && prev.getBoundingClientRect().right > a.left + 1) overlap++;
    });
    const ins = [...w.querySelectorAll('input.mq-cellslot')];
    const outside = ins.filter((el) => { const r = el.getBoundingClientRect(); return r.left < cr.left - 1 || r.right > cr.right + 1; }).length;
    return { wrapped: w.hasAttribute('data-mq-wrapfit'), styles: conts.map((c) => c.getAttribute('style')), cues, sw: w.scrollWidth, cw: w.clientWidth, ox: getComputedStyle(w).overflowX,
      lines: new Set(ins.map((e) => Math.round(e.getBoundingClientRect().top))).size, arrows, arrowOut, arrowOff, overlap, outside, swipes: !!(w.parentElement && w.parentElement.hasAttribute('data-mq-swipes')) };
  });
};
const load = (page, cat, skill, opts) => page.evaluate(async ({ cat, skill, opts }) => {
  const st = window.state; window.clearSetOptions({ silent: true }); window.setSetOptions(cat, skill, opts, { silent: true });
  st.category = cat; st.skill = skill; st.isMixedMode = false; st.quizMode = false; st.hasAnswered = false;
  st.gameMode = 'worksheet'; window.showView('worksheetView'); window.initWorksheet();
  await new Promise((r) => setTimeout(r, 1500));
}, { cat, skill, opts });
const vp = async (page, w, h, extra = {}) => { await page.setViewport({ width: w, height: h, deviceScaleFactor: 1, hasTouch: true, ...extra }); await new Promise((r) => setTimeout(r, 700)); };
(async () => {
  const app = await open({ seed: 7, viewport: { width: 390, height: 844, deviceScaleFactor: 1, hasTouch: true } });
  const { page } = app;
  for (const [cat, skill, opts] of CASES) {
    const tag = `${skill} ${JSON.stringify(opts)}`;
    await vp(page, 390, 844);
    await load(page, cat, skill, opts);
    const p0 = await page.evaluate(SNAP);
    check(p0.every((r) => !r.wrapped), `${tag}: 390 load, no wrap (${p0.length} rows, swipe cues ${p0.map((r) => r.cues).join(',')})`);
    await vp(page, 1366, 650);
    const a1 = await page.evaluate(SNAP);
    check(a1.every((r) => r.cues === 0 && (r.sw <= r.cw + 1 || r.ox === 'visible') && r.outside === 0), `${tag}: 390->1366 every row whole, no cue, inputs inside (wrapped ${a1.filter((r) => r.wrapped).length}/${a1.length})`);
    check(a1.every((r) => r.arrowOut === 0 && r.arrowOff === 0 && r.overlap === 0), `${tag}: 1366 arrows inside cell, level with boxes, no overlap (${a1.map((r) => `${r.arrows}/${r.arrowOut}/${r.arrowOff}/${r.overlap}`).join(' ')})`);
    await page.screenshot({ path: `${OUT}/ws1366-${skill}-${Object.keys(opts).join('') || 'def'}.png` });
    await vp(page, 390, 844);
    const b1 = await page.evaluate(SNAP);
    const same = b1.length === p0.length && b1.every((r, i) => JSON.stringify(r.styles) === JSON.stringify(p0[i].styles) && r.wrapped === false && r.swipes === p0[i].swipes && r.cues === p0[i].cues);
    check(same, `${tag}: 1366->390 restores row style verbatim, swipe + cues as at load${same ? '' : ' ' + JSON.stringify(b1.map((r, i) => [r.styles[0], p0[i].styles[0], r.swipes, p0[i].swipes, r.cues, p0[i].cues]).slice(0, 2))}`);
    await vp(page, 1280, 600);
    const c1 = await page.evaluate(SNAP);
    check(c1.every((r) => r.cues === 0 && r.outside === 0 && (r.sw <= r.cw + 1 || r.ox === 'visible')), `${tag}: 390->1280 whole rows, no cue`);
    await page.screenshot({ path: `${OUT}/ws1280-${skill}-${Object.keys(opts).join('') || 'def'}.png` });
    // orientation: phone landscape 844x390 then back
    await vp(page, 844, 390); await page.evaluate(() => window.dispatchEvent(new Event('orientationchange')));
    const o1 = await page.evaluate(SNAP);
    check(o1.every((r) => !r.wrapped), `${tag}: phone landscape 844 keeps the swipe (no wrap)`);
    await vp(page, 390, 844); await page.evaluate(() => window.dispatchEvent(new Event('orientationchange')));
    const o2 = await page.evaluate(SNAP);
    check(o2.every((r, i) => JSON.stringify(r.styles) === JSON.stringify(p0[i].styles) && r.cues === p0[i].cues), `${tag}: back to portrait 390 = load state`);
    // re-render at 1366 then go to 390
    await vp(page, 1366, 650);
    await load(page, cat, skill, opts);
    const r1 = await page.evaluate(SNAP);
    await page.screenshot({ path: `${OUT}/rr1366-${skill}-${Object.keys(opts).join('') || 'def'}.png` });
    check(r1.every((r) => r.cues === 0 && r.outside === 0), `${tag}: re-render at 1366 whole rows (wrapped ${r1.filter((r) => r.wrapped).length})`);
    await vp(page, 390, 844);
    const r2 = await page.evaluate(SNAP);
    await page.screenshot({ path: `${OUT}/rr390-${skill}-${Object.keys(opts).join('') || 'def'}.png` });
    check(r2.every((r) => !r.wrapped && !/flex-wrap:\s*wrap/.test(r.styles.join(' '))), `${tag}: re-rendered at 1366, then 390: no wrap left over (${r2.map((r) => r.styles[0]).slice(0, 1)})`);
    // a fresh load at 390 after re-render matches the original phone styles (no-wrap rule present)
    check(r2.every((r, i) => p0[i] && JSON.stringify(r.styles) === JSON.stringify(p0[i].styles)), `${tag}: rows rendered at 1366 restore the same phone style as a 390 load`);
  }
  // touch + keyboard at 1366 on the worksheet: tap a box on a WRAPPED second line, type the answer
  await vp(page, 1366, 650);
  for (const [cat, skill, opts] of [CASES[0], CASES[2], CASES[3], CASES[4]]) {
    await load(page, cat, skill, opts);
    const info = await page.evaluate(() => {
      const rows = [...document.querySelectorAll('#worksheetView [data-mq-swiperow]')].filter((e) => e.offsetParent);
      const w = rows.find((x) => x.hasAttribute('data-mq-wrapfit')) || rows[0];
      const ins = [...w.querySelectorAll('input.mq-cellslot')];
      const tops = ins.map((e) => e.getBoundingClientRect().top);
      const k = ins.findIndex((e) => e.getBoundingClientRect().top > tops[0] + 5);
      const t = ins[k >= 0 ? k : ins.length - 1]; t.scrollIntoView({ block: 'center' });
      const r = t.getBoundingClientRect();
      window.__t = t; window.__ins = ins;
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, idx: k >= 0 ? k : ins.length - 1, n: ins.length, h: r.height, w: r.width, ans: t.dataset.mqAns || t.getAttribute('data-ans') || '' };
    });
    await page.touchscreen.tap(info.x, info.y);
    await new Promise((r) => setTimeout(r, 300));
    const foc = await page.evaluate(() => document.activeElement === window.__t);
    check(foc, `${skill}: touch tap on a box of the wrapped 2nd line focuses it (box ${info.w.toFixed(0)}x${info.h.toFixed(0)} px)`);
    check(info.h >= 44 && info.w >= 44, `${skill}: target >= 44 px (${info.w.toFixed(0)}x${info.h.toFixed(0)})`);
    // keyboard: focus the first box, type its right answer, see the caret move
    const kb = await page.evaluate(() => { const i0 = window.__ins[0]; i0.focus(); return true; });
    const ans = await page.evaluate(() => { const r = [...document.querySelectorAll('#worksheetView [data-mq-swiperow]')].filter((e) => e.offsetParent); const c = window.__ins[0].closest('[id^="ws_card_"]'); return c ? c.id : ''; });
    const right = await page.evaluate(() => { const i = window.__ins[0]; const q = (window.worksheetQuestions || window.state.worksheetQuestions || [])[0]; return i.getAttribute('data-mq-expect') || i.dataset.expect || ''; });
    // find expected values via the cell's bound value attribute
    const exp = await page.evaluate(() => window.__ins.map((i) => i.dataset.mqValue || i.dataset.mqBind || i.getAttribute('data-mq-v') || ''));
    console.log('   expected attrs sample', JSON.stringify(exp.slice(0, 3)), right, ans);
    await page.keyboard.type('9');
    await new Promise((r) => setTimeout(r, 200));
    const st = await page.evaluate(() => ({ v: window.__ins[0].value, act: window.__ins.indexOf(document.activeElement), cls: window.__ins[0].className }));
    console.log(`   ${skill}: typed 9 into box 0 -> value ${st.v}, active idx ${st.act}, cls ${st.cls}`);
    await page.keyboard.press('Tab'); await new Promise((r) => setTimeout(r, 300));
    const st2 = await page.evaluate(() => ({ act: window.__ins.indexOf(document.activeElement), cls: window.__ins[0].className, ae: document.activeElement.className }));
    console.log(`   ${skill}: after Tab -> active idx ${st2.act} (${st2.ae}), box0 cls ${st2.cls}`);
    await page.screenshot({ path: `${OUT}/kb-${skill}.png` });
  }
  check(!app.problems.some((p) => p.type === 'pageerror'), `no page errors ${JSON.stringify(app.problems.slice(0, 3))}`);
  await app.close();
  console.log(fails ? `probe: FAIL (${fails})` : 'probe: OK');
})().catch((e) => { console.error(e); process.exit(1); });
