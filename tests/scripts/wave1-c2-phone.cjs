// Wave 1 lane C2, phone (390 px) practice card and online worksheet for count_by_tables (SP-11a extended to count-by rows):
//  - a row wider than its cell swipes inside it and shows the cue ("Swipe -> for more boxes"): visible while not at the end, hidden at
//    the end, never over a box;
//  - Tab through EVERY box: each is fully visible inside the swipe window and inside every clipping ancestor (the card's bottom edge too);
//  - no box's rect is clipped vertically by any ancestor; the page never scrolls sideways.
// Run: /tmp/mq-browser-run.sh node tests/scripts/wave1-c2-phone.cjs
const { open } = require('../lib/ws-harness.cjs');
const R = (step, start, at, dir) => Object.assign({ step }, start ? { start } : {}, at !== undefined ? { at } : {}, dir ? { dir } : {});
const CASES = {
  'default tables': {},
  'by 1,000 from 14,000': { rows: [R(1000, 'custom', 14000)] },
  'by 100,000 from 1,000,000 (15)': { rows: [R(100000, 'custom', 1000000)], jumps: 15 },
  'times each, back': { rows: [R(12, undefined, undefined, 'down')], times: 'each' },
};
let fails = 0;
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// runs in the page: measure every slot against its swipe window and every clipping ancestor
const MEASURE = () => {
  const slots = [...document.querySelectorAll('input.mq-cellslot')].filter((e) => e.offsetParent);
  const out = { n: slots.length, hidden: [], clippedY: [], page: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  slots.forEach((el, i) => {
    const r = el.getBoundingClientRect();
    for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a);
      const clipsY = /(hidden|auto|scroll|clip)/.test(cs.overflowY), clipsX = /(hidden|auto|scroll|clip)/.test(cs.overflowX);
      if (!clipsX && !clipsY) continue;
      const b = a.getBoundingClientRect();
      if (clipsY && (r.top < b.top - 1 || r.bottom > b.bottom + 1)) out.clippedY.push(`#${i} by ${a.className || a.id || a.tagName}: box ${Math.round(r.top)}-${Math.round(r.bottom)} vs ${Math.round(b.top)}-${Math.round(b.bottom)}`);
      if (clipsX && (r.left < b.left - 1 || r.right > b.right + 1)) out.hidden.push(`#${i} by ${a.className || a.id || a.tagName}`);
    }
  });
  return out;
};

(async () => {
  const app = await open({ seed: 3, viewport: { width: 390, height: 900, deviceScaleFactor: 1 } });
  const { page } = app;
  for (const host of ['card', 'worksheet']) for (const [name, opts] of Object.entries(CASES)) {
    await page.evaluate(async ({ opts, host }) => {
      const st = window.state;
      window.clearSetOptions({ silent: true });
      window.setSetOptions('multiplication', 'count_by_tables', opts, { silent: true });
      st.category = 'multiplication'; st.skill = 'count_by_tables'; st.isMixedMode = false; st.quizMode = false;
      if (host === 'card') {
        st.gameMode = 'practice'; window.showView('gameView');
        st.currentQ = window.generateQuestion(); window.renderQuestion();
      } else {
        st.gameMode = 'worksheet'; window.showView('worksheetView'); window.initWorksheet();
      }
      await new Promise((r) => setTimeout(r, 900));
    }, { opts, host });
    const tag = `${host} 390 | ${name}`;
    // screenshots first, before the Tab walk (a focused first word would open the glossary tip over the instruction)
    const slug = name.replace(/[^a-z0-9]+/gi, '-');
    if (host === 'card') { await (await page.$('#questionCard')).screenshot({ path: `design/audit/runs/wave1-C2/phone-card-${slug}.png` }); }
    else { const h = await page.evaluateHandle(() => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); return w ? (w.closest('[id^="ws_card_"]') || w.parentElement) : null; }); const el = h.asElement(); if (el) await el.screenshot({ path: `design/audit/runs/wave1-C2/phone-worksheet-${slug}.png` }); }
    // critic C2 r4: the step tab sits in its own column BESIDE the swiping row: nothing (no number, no box) is ever under it or cut by
    // the row's left edge, each tab entry is level with its line, and the card opens at scrollLeft 0. Checked after load and after each Tab.
    const TABCHK = () => {
      const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent);
      const col = w && w.previousElementSibling && w.previousElementSibling.matches('[data-mq-tabcol]') ? w.previousElementSibling : null;
      if (!w) return { ok: false, why: 'no swipe row' };
      if (!col) return { ok: false, why: 'no step-tab column beside the row' };
      const c = col.getBoundingClientRect(), v = w.getBoundingClientRect();
      const tab = col.querySelector('.k2-steptab');
      const tr = tab && tab.getBoundingClientRect();
      if (!tr || tr.left < -1 || tr.right > window.innerWidth + 1) return { ok: false, why: 'step tab not on screen' };
      if (c.right > v.left + 1) return { ok: false, why: `tab column (${Math.round(c.right)}) overlaps the row (${Math.round(v.left)})` };
      const lines = [...w.querySelectorAll('.k2-countrow-line')];
      for (const t of col.querySelectorAll('[data-mq-tabfor]')) { const ln = lines[+t.getAttribute('data-mq-tabfor')]; const a = t.getBoundingClientRect(), b = ln.getBoundingClientRect(); if (Math.abs(a.bottom - b.bottom) > 2) return { ok: false, why: `tab entry ${t.getAttribute('data-mq-tabfor')} not level with its line (${Math.round(a.bottom)} vs ${Math.round(b.bottom)})` }; }
      const cut = [...w.querySelectorAll('input.mq-cellslot, .k2-given')].map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0 && r.left < v.left - 1 && r.right > v.left + 1);
      if (cut.length) return { ok: false, why: `${cut.length} number(s)/box(es) cut at the row's left edge` };
      // the leftmost column start (or 0) at which the first box is fully visible: where the row must rest when that box has focus
      const f = w.querySelector('input.mq-cellslot'), fr = f.getBoundingClientRect(), sl = w.scrollLeft, cw = w.clientWidth;
      const ln = w.querySelector('.k2-countrow-line [data-mq-wrapped]');
      const xs = [0, ...[...ln.children].map((e) => e.getBoundingClientRect().left - v.left + sl)];
      const bl = fr.left - v.left + sl, br = fr.right - v.left + sl;
      const okx = xs.filter((x) => x <= bl + 0.5 && br - x <= cw - 2);
      const want = Math.min(Math.max(0, Math.min(...okx)), w.scrollWidth - cw);
      return { ok: true, scrollLeft: sl, want };
    };
    const t0 = await page.evaluate(TABCHK);
    const at = (t) => t.ok && Math.abs(t.scrollLeft - t.want) <= 2;
    check(t0.ok && (host !== 'card' || at(t0)), `${tag}: after load the step tab is beside the row, nothing under it${host === 'card' ? `, the row rests at the leftmost start that shows the first box (scrollLeft ${t0.scrollLeft}, want ${Math.round(t0.want)})` : ''}${t0.ok ? '' : ' (' + t0.why + ')'}`);
    // a programmatic scroll settles on a column start (scroll-snap): no number or box is cut at the row's left edge
    await page.evaluate(() => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); w.scrollLeft = 37; });
    await sleep(700);
    const tS = await page.evaluate(TABCHK);
    const backCue = await page.evaluate(() => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); const b = w.querySelector('.k2-swipe-back'); return w.scrollLeft > 1 ? !!b && getComputedStyle(b).display !== 'none' : true; });
    check(tS.ok && backCue, `${tag}: after scrollLeft = 37 the row settles on a column start (scrollLeft ${tS.scrollLeft}), nothing cut, the back cue shows${tS.ok ? '' : ' (' + tS.why + ')'}`);
    await page.evaluate(() => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); w.scrollLeft = 130; });
    await sleep(700);
    const tM = await page.evaluate(TABCHK);
    const backCue2 = await page.evaluate(() => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); const b = w.querySelector('.k2-swipe-back'); return w.scrollLeft > 1 ? !!b && getComputedStyle(b).display !== 'none' : true; });
    check(tM.ok && backCue2, `${tag}: after scrollLeft = 130 the row settles on a column start (scrollLeft ${tM.scrollLeft}), nothing cut, the back cue shows${tM.ok ? '' : ' (' + tM.why + ')'}`);
    await page.evaluate(() => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); w.style.scrollSnapType = 'none'; w.scrollLeft = 0; w.style.scrollSnapType = ''; if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); delete w.dataset.mqFocused; });
    await sleep(200);
    const first = await page.evaluate(() => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); const i = w && w.querySelector('input.mq-cellslot'); if (i) i.focus(); return !!i; });
    if (!first) { check(false, `${tag}: no boxes`); continue; }
    await sleep(250);
    const t1 = await page.evaluate(TABCHK);
    check(at(t1), `${tag}: the first box focused, the row rests at the leftmost start that shows it (scrollLeft ${t1.scrollLeft}, want ${Math.round(t1.want || 0)}), the step tab on show, nothing under it${t1.ok ? '' : ' (' + t1.why + ')'}`);
    const n = await page.evaluate(() => [...[...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent).querySelectorAll('input.mq-cellslot')].length);   // the first card's boxes (the worksheet holds many cards)
    const seen = new Set();
    let bad = [];
    for (let k = 0; k < n; k++) {
      await sleep(60);
      const st = await page.evaluate((MEASURE_SRC) => {
        const a = document.activeElement;
        const isSlot = a && a.classList && a.classList.contains('mq-cellslot');
        const m = (new Function('return (' + MEASURE_SRC + ')'))()();
        const r = isSlot ? a.getBoundingClientRect() : null;
        // fully visible: inside its swipe window (if any) and every clipping ancestor, and inside the viewport
        let ok = isSlot, why = '';
        if (isSlot) {
          const idx = [...[...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent).querySelectorAll('input.mq-cellslot')].indexOf(a);
          for (let p = a.parentElement; p && p !== document.documentElement; p = p.parentElement) {
            const cs = getComputedStyle(p);
            if (!/(hidden|auto|scroll|clip)/.test(cs.overflowX + cs.overflowY)) continue;
            const b = p.getBoundingClientRect();
            if (r.left < b.left - 1 || r.right > b.right + 1 || r.top < b.top - 1 || r.bottom > b.bottom + 1) { ok = false; why = `clipped by ${p.className || p.id}`; break; }
          }
          if (r.right > window.innerWidth + 1 || r.left < -1) { ok = false; why = 'outside the viewport'; }
          return { ok, why, idx };
        }
        return { ok: false, why: 'focus left the boxes', idx: -1 };
      }, MEASURE.toString());
      if (st.idx >= 0) seen.add(st.idx);
      if (!st.ok) bad.push(`box ${st.idx}: ${st.why}`);
      await page.keyboard.press('Tab');
      await sleep(60);
      const tk = await page.evaluate(TABCHK);
      if (!tk.ok && k < n - 1) bad.push(`after Tab ${k + 1}: ${tk.why}`);
    }
    check(!bad.length && seen.size === n, `${tag}: Tab reached ${seen.size}/${n} boxes, each fully visible${bad.length ? ' (' + bad.slice(0, 3).join('; ') + ')' : ''}`);
    const m = await page.evaluate((src) => (new Function('return (' + src + ')'))()(), MEASURE.toString());
    check(!m.clippedY.length && m.page <= 0, `${tag}: no box clipped at the card's bottom or any ancestor edge, page scroll width ${m.page}${m.clippedY.length ? ' - ' + m.clippedY[0] : ''}`);
    // the cue: shown while the row is not at its end, hidden at the end, never over a box
    const cue = await page.evaluate(async () => {
      const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent);
      if (!w) return null;
      const overflow = w.scrollWidth > w.clientWidth + 1;
      w.scrollLeft = 0; w.dispatchEvent(new Event('scroll')); await new Promise((r) => setTimeout(r, 100));
      const c = w.querySelector('.k2-swipe-cue');
      const shown0 = c && getComputedStyle(c).display !== 'none';
      let over = false;
      if (shown0) { const cr = c.getBoundingClientRect(); over = [...w.querySelectorAll('input.mq-cellslot, .k2-given')].some((e) => { const r = e.getBoundingClientRect(); return !(r.right <= cr.left || r.left >= cr.right || r.bottom <= cr.top || r.top >= cr.bottom); }); }
      w.scrollLeft = w.scrollWidth; w.dispatchEvent(new Event('scroll')); await new Promise((r) => setTimeout(r, 100));
      const shown1 = c && getComputedStyle(c).display !== 'none';
      return { overflow, shown0, shown1, over, text: c ? c.textContent.trim() : '' };
    });
    if (cue) check(cue.overflow ? (cue.shown0 && !cue.shown1 && !cue.over) : !cue.shown0, `${tag}: swipe cue ${cue.overflow ? `"${cue.text}" shown at the start, hidden at the end, over a box: ${cue.over}` : 'hidden because the row fits'}`);
    else check(false, `${tag}: no swipe window`);
  }
  await app.close();
  console.log(fails ? `wave1-c2-phone: FAIL (${fails})` : 'wave1-c2-phone: OK');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
