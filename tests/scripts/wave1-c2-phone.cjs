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
    const first = await page.evaluate(() => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); const i = w && w.querySelector('input.mq-cellslot'); if (i) i.focus(); return !!i; });
    if (!first) { check(false, `${tag}: no boxes`); continue; }
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
