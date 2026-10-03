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
  'by 7 from 3': { rows: [R(7, 'custom', 3)] },
  'by 25': { rows: [R(25)] },
  // critic C2 r7: a first box the row's start does not show (Missing 20 %, seeded so it is in column 6) takes no focus at load;
  // Missing 90 % "first only" (its first box is in column 2) keeps the auto-focus
  'missing 20 % (first box in column 6)': { missing: 20, $firstCol: 5 },
  'missing 90 % first only': { missing: 90, fill: 'one' },
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
      const col = opts.$firstCol; const o = Object.assign({}, opts); delete o.$firstCol;
      window.setSetOptions('multiplication', 'count_by_tables', o, { silent: true });
      st.category = 'multiplication'; st.skill = 'count_by_tables'; st.isMixedMode = false; st.quizMode = false; st.hasAnswered = false;
      // a case that names the first box's column searches the seeds until the (first) row's first box is there
      const firstCol = () => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); const ln = w && w.querySelector('.k2-countrow-line [data-mq-wrapped]'); return ln ? [...ln.children].findIndex((e) => e.querySelector('input.mq-cellslot') || e.matches('input.mq-cellslot')) : -1; };
      for (let seed = 1; seed < 300; seed++) {
        if (col !== undefined) window.__wsReseed(seed);
        if (host === 'card') {
          st.gameMode = 'practice'; window.showView('gameView');
          st.currentQ = window.generateQuestion();
          if (col !== undefined && st.currentQ.countBy.blanks[0] !== col) continue;
          window.renderQuestion();
        } else {
          st.gameMode = 'worksheet'; window.showView('worksheetView'); window.initWorksheet();
          if (col !== undefined && firstCol() !== col) continue;
        }
        break;
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
      // critic C2 r6: when the row swipes the tab sits ABOVE line 1; either way it never overlaps the row's window
      const swipes = col.parentElement.hasAttribute('data-mq-swipes');
      if (!(tr.bottom <= v.top + 1 || tr.top >= v.bottom - 1 || tr.right <= v.left + 1 || tr.left >= v.right - 1)) return { ok: false, why: 'the step tab overlaps the row' };
      const lines = [...w.querySelectorAll('.k2-countrow-line')];
      for (const t of (swipes ? [] : col.querySelectorAll('[data-mq-tabfor]'))) { const ln = lines[+t.getAttribute('data-mq-tabfor')]; const a = t.getBoundingClientRect(), b = ln.getBoundingClientRect(); if (Math.abs(a.bottom - b.bottom) > 2) return { ok: false, why: `tab entry ${t.getAttribute('data-mq-tabfor')} not level with its line (${Math.round(a.bottom)} vs ${Math.round(b.bottom)})` }; }
      const cut = [...w.querySelectorAll('input.mq-cellslot, .k2-given')].map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0 && r.left < v.left - 1 && r.right > v.left + 1);
      if (cut.length) return { ok: false, why: `${cut.length} number(s)/box(es) cut at the row's left edge` };
      const cutR = [...w.querySelectorAll('input.mq-cellslot, .k2-given')].map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0 && r.left < v.right - 1 && r.right > v.right + 1);
      if (cutR.length) return { ok: false, why: `${cutR.length} number(s)/box(es) cut at the row's right edge` };
      const inWin = (r) => r.left >= v.left - 1 && r.right <= v.right + 1;
      const g0 = w.querySelector('.k2-given'), b0 = w.querySelector('input.mq-cellslot');
      const startShown = !!g0 && inWin(g0.getBoundingClientRect()), boxShown = !!b0 && inWin(b0.getBoundingClientRect());
      // the leftmost column start (or 0) at which the first box is fully visible: where the row must rest when that box has focus
      const f = w.querySelector('input.mq-cellslot'), fr = f.getBoundingClientRect(), sl = w.scrollLeft, cw = w.clientWidth;
      const ln = w.querySelector('.k2-countrow-line [data-mq-wrapped]');
      const xs = [0, ...[...ln.children].map((e) => e.getBoundingClientRect().left - v.left + sl)];
      const bl = fr.left - v.left + sl, br = fr.right - v.left + sl;
      const okx = xs.filter((x) => x <= bl + 0.5 && br - x <= cw - 2);
      const want = Math.min(Math.max(0, Math.min(...okx)), w.scrollWidth - cw);
      return { ok: true, scrollLeft: sl, want, startShown, boxShown, win: Math.round(v.width), swipes };
    };
    const t0 = await page.evaluate(TABCHK);
    const at = (t) => t.ok && Math.abs(t.scrollLeft - t.want) <= 2;
    // critic C2 r7: at load the row rests at 0 on every host and case, the start shows, and focus is never on a box outside the window
    const F0 = () => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); const a = document.activeElement; const v = w.getBoundingClientRect();
      const box = a && a.classList && a.classList.contains('mq-cellslot') && w.contains(a) ? a.getBoundingClientRect() : null;
      return { inRow: !!box, first: a === w.querySelector('input.mq-cellslot'), hiddenFocus: !!box && (box.left < v.left - 1 || box.right > v.right + 1) }; };
    const f0 = await page.evaluate(F0);
    const named = !!opts.$firstCol;
    check(t0.ok && t0.scrollLeft === 0 && t0.startShown && !f0.hiddenFocus, `${tag}: at load the row rests at 0 (scrollLeft ${t0.scrollLeft}) with the first given number${t0.startShown ? '' : ' NOT'} fully in the ${t0.win} px window, the first box${t0.boxShown ? '' : ' NOT'} fully in it, focus ${f0.inRow ? (f0.hiddenFocus ? 'ON A HIDDEN BOX' : 'on a box in view') : 'not in the row'}, nothing cut at either edge${t0.ok ? '' : ' (' + t0.why + ')'}`);
    if (host === 'card') check(t0.boxShown ? f0.first : !f0.inRow, `${tag}: the card's auto-focus ${t0.boxShown ? (f0.first ? 'is on the first box (it shows at the start)' : 'is NOT on the first box though it shows') : (f0.inRow ? 'went INTO A HIDDEN BOX' : 'is withheld: the first box does not show at the start, so nothing is typed blind')}`);
    if (named) check(!t0.boxShown && !f0.inRow, `${tag}: the seeded first box (column ${opts.$firstCol + 1}) lies past the window at load (shown: ${t0.boxShown}) and holds no focus`);
    check(t0.ok, `${tag}: after load the step tab is clear of the row, nothing under it${t0.ok ? '' : ' (' + t0.why + ')'}`);
    // owner 2026-10-03 (TY-10b): on a phone the row's digits are about 29 px, the boxes scaled with them (>= 48 px touch targets);
    // critic C2 r8 (a): the window shows as many WHOLE columns as fit in the cell's inner box
    const sz = await page.evaluate(() => {
      const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent);
      const g = w.querySelector('.k2-given'), i = w.querySelector('input.mq-cellslot'), ir = i.getBoundingClientRect(), v = w.getBoundingClientRect();
      const its = [...w.querySelector('.k2-countrow-line [data-mq-wrapped]').children];
      const a = its[0].getBoundingClientRect(), b = its[1].getBoundingClientRect(), pitch = b.left - a.left, gap = pitch - a.width;
      const cell = w.closest('.mq-scell'), cr = cell.getBoundingClientRect(), cs = getComputedStyle(cell);
      const room = cr.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth);
      const shown = its.filter((e) => { const r = e.getBoundingClientRect(); return r.left >= v.left - 1 && r.right <= v.right + 1; }).length;
      return { fs: parseFloat(getComputedStyle(g).fontSize), bfs: parseFloat(getComputedStyle(i).fontSize), bw: ir.width, bh: ir.height, shown, fit: Math.min(its.length, Math.max(1, Math.floor((room + gap + 0.5) / pitch))), room: Math.round(room), swipes: w.scrollWidth > w.clientWidth + 1 };
    });
    // a number too wide for six boxes shrinks under TY-10a (floor 9 pt), so the 29 px rule is checked on rows that keep their size
    const big = !/1,000|100,000/.test(name);
    if (big) check(sz.fs >= 28 && sz.fs <= 31 && Math.abs(sz.bfs - sz.fs) < 0.5 && Math.min(sz.bw, sz.bh) >= 48 && sz.bw / sz.fs > 2.4 && sz.bw / sz.fs < 2.9, `${tag}: digits ${sz.fs.toFixed(1)} px (about 29), box ${Math.round(sz.bw)} x ${Math.round(sz.bh)} px (>= 48, width:digit ${(sz.bw / sz.fs).toFixed(2)}, 2.6 before the change)`);
    else check(Math.min(sz.bw, sz.bh) >= 44, `${tag}: a wide number row (TY-10a): digits ${sz.fs.toFixed(1)} px, box ${Math.round(sz.bw)} x ${Math.round(sz.bh)} px (>= 44)`);
    const cueFit = await page.evaluate(() => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); const c = w.querySelector('.k2-swipe-cue');
      if (!c || getComputedStyle(c).display === 'none') return { ok: true, why: 'no forward cue (the row fits)' };
      const v = w.getBoundingClientRect(), r = c.getBoundingClientRect(), fs = parseFloat(getComputedStyle(c).fontSize);
      return { ok: c.scrollWidth <= c.clientWidth + 1 && r.right <= v.right + 1 && r.left >= v.left - 1 && r.height < 2.2 * fs && fs >= 14, why: `${Math.round(r.width)} px in a ${Math.round(v.width)} px window, ${fs} px type, ${Math.round(r.height)} px high` }; });
    check(cueFit.ok, `${tag}: the forward cue is whole, on one line, inside the window (${cueFit.why})`);
    check(!sz.swipes || sz.shown === sz.fit, `${tag}: the window shows ${sz.shown} whole columns; ${sz.fit} fit in the cell's ${sz.room} px inner box`);
    // critic C2 r8 (b): focus held back -> the first digit key typed with nothing focused goes to the first box, shown whole, as Tab does
    if (host === 'card' && !t0.boxShown && !f0.inRow) {   // (at 29 px digits a default row may hold its first box past the start too)
      await page.keyboard.press('5'); await sleep(300);
      const dk = await page.evaluate(() => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); const i = w.querySelector('input.mq-cellslot'), v = w.getBoundingClientRect(), r = i.getBoundingClientRect();
        const out = { focused: document.activeElement === i, value: i.value, shown: r.left >= v.left - 1 && r.right <= v.right + 1 }; i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); i.blur(); w.scrollLeft = 0; return out; });
      await sleep(300);
      check(dk.focused && dk.value === '5' && dk.shown, `${tag}: with focus held back, typing 5 moves to the first box (focused ${dk.focused}, value "${dk.value}", fully shown ${dk.shown})`);
    }
    // a programmatic scroll settles on a column start (scroll-snap): no number or box is cut at the row's left edge
    await page.evaluate(() => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); const its = [...w.querySelector('.k2-countrow-line [data-mq-wrapped]').children]; w.scrollLeft = Math.round((its[1].getBoundingClientRect().left - its[0].getBoundingClientRect().left) * 0.7); });
    await sleep(700);
    const tS = await page.evaluate(TABCHK);
    const backCue = await page.evaluate(() => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); const b = w.querySelector('.k2-swipe-back'); return w.scrollLeft > 1 ? !!b && getComputedStyle(b).display !== 'none' : true; });
    check(tS.ok && tS.scrollLeft > 0 && backCue, `${tag}: after a scroll of 0.7 column the row settles on the next column start (scrollLeft ${tS.scrollLeft}), nothing cut, the back cue shows${tS.ok ? '' : ' (' + tS.why + ')'}`);
    const strip1 = await page.evaluate(() => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); const c = w.querySelector('.k2-swipe-cues'); const sh = (e) => getComputedStyle(e).display !== 'none';
      return { h: sh(c) ? c.getBoundingClientRect().height : 0, back: sh(w.querySelector('.k2-swipe-back')), fwd: sh(w.querySelector('.k2-swipe-cue')), text: c.innerText.replace(/\s+/g, ' ').trim() }; });
    check(!(strip1.back && strip1.fwd) || strip1.h <= 40, `${tag}: one column in, ${strip1.back && strip1.fwd ? `both cues show on ONE line, ${Math.round(strip1.h)} px ("${strip1.text}")` : `one cue shows ("${strip1.text}", ${Math.round(strip1.h)} px)`}`);
    await page.evaluate(() => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); w.scrollLeft = 130; });
    await sleep(700);
    const tM = await page.evaluate(TABCHK);
    const backCue2 = await page.evaluate(() => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); const b = w.querySelector('.k2-swipe-back'); return w.scrollLeft > 1 ? !!b && getComputedStyle(b).display !== 'none' : true; });
    const strip = await page.evaluate(() => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); const c = w.querySelector('.k2-swipe-cues'); const b = w.querySelector('.k2-countrow-body'); return { h: c && getComputedStyle(c).display !== 'none' ? c.getBoundingClientRect().height : 0, body: b.getBoundingClientRect().height, back: getComputedStyle(w.querySelector('.k2-swipe-back')).display !== 'none', fwd: getComputedStyle(w.querySelector('.k2-swipe-cue')).display !== 'none' }; });
    check(strip.h > 0 && strip.h <= 60 && strip.h <= 0.5 * strip.body, `${tag}: mid-row, the cues share one strip ${Math.round(strip.h)} px high (<= 60 and <= half the ${Math.round(strip.body)} px row; back ${strip.back ? 'shown' : 'hidden'}, forward ${strip.fwd ? 'shown' : 'hidden'})`);
    check(tM.ok && backCue2, `${tag}: after scrollLeft = 130 the row settles on a column start (scrollLeft ${tM.scrollLeft}), nothing cut, the back cue shows${tM.ok ? '' : ' (' + tM.why + ')'}`);
    await page.evaluate(() => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); w.style.scrollSnapType = 'none'; w.scrollLeft = 0; w.style.scrollSnapType = ''; if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); delete w.dataset.mqFocused; });
    await sleep(200);
    // a PROGRAM focus (an auto-focus) of the first box: taken only when the box shows at the start, refused otherwise; the row stays at 0
    const first = await page.evaluate(() => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); const i = w && w.querySelector('input.mq-cellslot'); if (i) i.focus(); return !!i; });
    if (!first) { check(false, `${tag}: no boxes`); continue; }
    await sleep(250);
    const t1 = await page.evaluate(TABCHK);
    const f1 = await page.evaluate(F0);
    check(t1.ok && t1.scrollLeft === 0 && t1.startShown && !f1.hiddenFocus && (t1.boxShown ? f1.first : !f1.inRow), `${tag}: a program focus of the first box ${t1.boxShown ? 'is taken (it shows at the start)' : 'is refused (it does not show at the start)'}, the row stays at 0 (scrollLeft ${t1.scrollLeft}), the start in the ${t1.win} px window${t1.ok ? '' : ' (' + t1.why + ')'}`);
    // the pupil's own Tab into the row reaches the first box and shows it whole (the row moves only on this explicit action)
    await page.evaluate(() => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      const s = document.createElement('button'); s.id = 'c2TabFrom'; s.textContent = 'x'; s.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;'; const host = w.closest('.mq-scell') || w.parentElement; host.parentElement.insertBefore(s, host); s.focus({ preventScroll: true }); });
    // (the sentinel sits just before the cell; any other control between it and the row is stepped past)
    for (let k = 0; k < 8; k++) { await page.keyboard.press('Tab'); await sleep(40); if (await page.evaluate(() => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); return w.contains(document.activeElement); })) break; }
    await sleep(250);
    const t2 = await page.evaluate(TABCHK);
    const f2 = await page.evaluate(() => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); const a = document.activeElement, v = w.getBoundingClientRect(), r = a.getBoundingClientRect(); document.getElementById('c2TabFrom')?.remove();
      return { first: a === w.querySelector('input.mq-cellslot'), shown: r.left >= v.left - 1 && r.right <= v.right + 1 }; });
    check(t2.ok && f2.first && f2.shown && at(t2), `${tag}: Tab into the row focuses the first box, fully in the window, the row at the leftmost start that shows it (scrollLeft ${t2.scrollLeft}, want ${Math.round(t2.want || 0)})${t2.ok ? '' : ' (' + t2.why + ')'}`);
    await page.keyboard.type('7'); await sleep(80);
    const typedTab = await page.evaluate(() => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); const i = w.querySelector('input.mq-cellslot'); const v = i.value; i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); return v; });
    check(typedTab === '7', `${tag}: after Tab, typing 7 writes "${typedTab}" into the first box`);
    // the pupil's tap: back to the start, swipe to the box (a held box is not focused), tap it, type
    await page.evaluate(() => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); w.scrollLeft = 0; });
    await sleep(500);
    await page.evaluate((want) => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); w.scrollLeft = want; }, Math.round(t2.want || 0));
    await sleep(600);
    const bx = await page.evaluate(() => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); const r = w.querySelector('input.mq-cellslot').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, sl: w.scrollLeft }; });
    await page.mouse.click(bx.x, bx.y); await sleep(250);
    const t3 = await page.evaluate(TABCHK);
    const f3 = await page.evaluate(() => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); const a = document.activeElement, v = w.getBoundingClientRect(), r = a.getBoundingClientRect(); return { first: a === w.querySelector('input.mq-cellslot'), shown: r.left >= v.left - 1 && r.right <= v.right + 1 }; });
    await page.keyboard.type('7'); await sleep(80);
    const typedTap = await page.evaluate(() => { const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent); const i = w.querySelector('input.mq-cellslot'); const v = i.value; i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); i.focus(); return v; });
    check(t3.ok && f3.first && f3.shown && t3.scrollLeft === bx.sl && typedTap === '7', `${tag}: a tap on the first box (row swiped to ${bx.sl}) focuses it in view, the row does not move (scrollLeft ${t3.scrollLeft}), typing 7 writes "${typedTap}"${t3.ok ? '' : ' (' + t3.why + ')'}`);
    await sleep(250);
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
  // critic C2 r7: wider hosts. When every column fits, the row uses the full width and does not scroll, every turn arrow is inside the
  // window and the forward cue is hidden; the cue shows only while a number or a box lies past the right edge.
  const WIDE = { 'by 100,000 from 1,000,000 (15)': CASES['by 100,000 from 1,000,000 (15)'], 'by 1,000 from 14,000': CASES['by 1,000 from 14,000'], 'default tables': {} };
  for (const width of [1280, 820]) {
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    for (const host of ['card', 'quiz']) for (const [name, opts] of Object.entries(WIDE)) {
      await page.evaluate(async ({ opts, host }) => {
        const st = window.state;
        window.clearSetOptions({ silent: true }); window.setSetOptions('multiplication', 'count_by_tables', opts, { silent: true });
        st.category = 'multiplication'; st.skill = 'count_by_tables'; st.isMixedMode = false; st.quizMode = false; st.hasAnswered = false;
        if (host === 'card') { st.gameMode = 'practice'; window.showView('gameView'); st.currentQ = window.generateQuestion(); window.renderQuestion(); }
        else {
          const questions = [0, 1].map((i) => ({ id: i, skillId: 'count_by_tables', points: 1, questionData: window.quizQuestionData(window.generateQuestionFor({ category: 'multiplication', skill: 'count_by_tables', seed: 11 + i, itemIndex: i, opts })) }));
          const test = { id: null, name: 'C2', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }],
            settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
          window.handleQuizURL(window.compressTestForURL(test));
          const nm = document.getElementById('qtStudentName'); nm.value = 'A'; nm.dispatchEvent(new Event('input'));
          window.startQuizTest();
        }
        await new Promise((r) => setTimeout(r, 1200));
      }, { opts, host });
      const m = await page.evaluate(() => {
        const w = [...document.querySelectorAll('[data-mq-swiperow]')].find((x) => x.offsetParent);
        if (!w) return null;
        const v = w.getBoundingClientRect(), cue = w.querySelector('.k2-swipe-cue');
        const past = [...w.querySelectorAll('.k2-countrow-body .k2-given, .k2-countrow-body input')].filter((e) => e.getBoundingClientRect().right > v.right + 1).length;
        const arrows = [...w.querySelectorAll('.k2-countrow-line > span svg')].map((e) => e.getBoundingClientRect());
        return { sw: w.scrollWidth, cw: w.clientWidth, past, cue: !!cue && getComputedStyle(cue).display !== 'none', arrows: arrows.length, arrowsOut: arrows.filter((r) => r.right > v.right + 2).length,
          page: document.documentElement.scrollWidth - document.documentElement.clientWidth };
      });
      const tag = `${host} ${width} | ${name}`;
      if (!m) { check(false, `${tag}: no count row`); continue; }
      if (!m.past) check(m.sw <= m.cw + 1 && !m.cue && !m.arrowsOut && m.page <= 0, `${tag}: every column fits: no scroll (scrollWidth ${m.sw} / window ${m.cw}), forward cue ${m.cue ? 'SHOWN' : 'hidden'}, ${m.arrows - m.arrowsOut}/${m.arrows} turn arrows inside the window, page scroll ${m.page}`);
      else check(m.cue && m.page <= 0, `${tag}: ${m.past} number(s)/box(es) past the right edge, so the forward cue ${m.cue ? 'shows' : 'is MISSING'}, page scroll ${m.page}`);
    }
  }
  await app.close();
  console.log(fails ? `wave1-c2-phone: FAIL (${fails})` : 'wave1-c2-phone: OK');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
