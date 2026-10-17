// Small fixes item 8 (critic r7 O9, critic r8 D1-D4): on SCREEN every count-by row is drawn at its host's digit size and wraps
// onto more lines where the cell is too narrow, instead of shrinking its digits under TY-10a or swiping. At desktop width
// (1366x650, 1280x600), on every host (practice card, online worksheet, quiz), for wide rows (by 100,000 from 1,000,000;
// by 25,000), fitting rows (by 2, 5, 10, 25) and a wide Lines row (100,000 + Answer spaces: Lines, SL-3a):
//   - the givens and the typed answers are at the host's digit size (29 px on the online worksheet, 40 px on the card / quiz)
//   - every input holds its widest answer (scrollWidth <= clientWidth)
//   - at least 3 numbers to every line (D1), and the right-hand empty band of the cell is under 30 % (H13)
//   - no "Swipe for more boxes" cue, no swipe overflow (SP-11a: count rows swipe only at 480 px and under), no page scroll
// A worksheet that mixes rows (by 5, by 100,000 from 1,000,000, by 25,000; 6 problems, D2): every card the same width, every
// row at 29 px, card heights even (tallest / shortest <= 1.35) and no card with a vertical empty band of 30 % or more.
// Owner ruling 2026-10-17: at 480 px and below (390, 360, 430) every row wraps the same way at the phone's 29 px on every host
// (at least 2 to a line there), with no swipe and no cue; it replaced the TY-10b phone swipe that PHONE_PIN used to pin.
// Every row: the jump arrow's INK stands >= 1.0 mm (at the row's own scale) clear of the ink of the numbers and boxes beside it
// (SL-3a, critic r10 F1, r11 G2), measured on rendered pixels at 3x as critic-r11/ink.cjs does: one shot with the arrows hidden,
// one with them shown; arrow ink is what is dark only in the second, number and box ink what is dark in the first.
// Critic r11 G1/G5: the phone's allowance is a FIXED constant, at least 2 numbers to a line at 360 px and up (never derived from
// the build's own geometry); both the left and the right empty band are under 30 %; the mixed sheet runs on the phone too.
// Critic r11 G4: at 481-540 px (the card and the quiz) a 1,000,000 row stands at least 2 a line; a turn of the device
// (390x844 <-> 844x390) draws the row as a fresh load at the new size does, keeping the typed answer and the focus.
// Run: node tests/scripts/small-fixes-countrow-wide.cjs   (SHOTS=<dir> saves screenshots; SIZES=1366,390 limits the viewports;
// the phone measures are no longer pinned)
const path = require('path');
const { open } = require('../lib/ws-harness.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fails = 0;
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };
const SIZES = [{ width: 1366, height: 650 }, { width: 1280, height: 600 }, { width: 820, height: 1180 }, { width: 768, height: 1024 }, { width: 520, height: 900 }, { width: 430, height: 932 }, { width: 390, height: 844 }, { width: 360, height: 780 }].filter((v) => !process.env.SIZES || process.env.SIZES.split(',').map(Number).includes(v.width));
const WIDE = { rows: [{ step: 100000, start: 'custom', at: 1000000 }] };
const ROWS = {
  '100000': WIDE,
  '25000': { rows: [{ step: 25000 }] },
  '100000-lines': Object.assign({ spaces: 'line' }, WIDE),
  by2: { rows: [{ step: 2 }] },
  by5: { rows: [{ step: 5 }] },
  by10: { rows: [{ step: 10 }] },
  by25: { rows: [{ step: 25, start: 'step', dir: 'up' }] },
};
const MIXED = { rows: [{ step: 5 }, { step: 100000, start: 'custom', at: 1000000 }, { step: 25000 }] };
const HOST_PX = { worksheet: 29, card: 40, quiz: 40 };
const SHOTS = process.env.SHOTS || '';
// critic r11 G1/G5: at 360 px and up a phone line holds at least two numbers - a constant, not the build's own geometry
const PHONE_MIN_PER_LINE = 2;
const NARROW = 540;   // at 540 px and under every host draws a count row at 29 px (owner ruling 2026-10-17, critic r11 G4)

// critic r11 G2: the jump arrows' ink clearance, on pixels (port of critic-r11/ink.cjs): the smallest gap, in mm at the row's
// own scale, between an arrow's ink and the ink (digits, box borders, write-on lines) on either side of it on its line
async function inkClear(page, root, vp) {
  const touch = vp.width <= 480;
  await page.setViewport({ ...vp, deviceScaleFactor: 3, isMobile: touch, hasTouch: touch });
  await sleep(500);
  await page.evaluate(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); });
  await sleep(150);
  const info = await page.evaluate((root) => {
    const r = document.querySelector(root); const body = r.querySelector('.k2-countrow-body');
    const probe = document.createElement('div'); probe.style.cssText = 'position:absolute;width:var(--mq-k2);height:1px;visibility:hidden;'; body.appendChild(probe);
    const mmPx = probe.getBoundingClientRect().width; probe.remove();
    const pg = (b) => ({ l: b.left + scrollX, r: b.right + scrollX, t: b.top + scrollY, b: b.bottom + scrollY });
    const num = (el) => (el.classList.contains('k2-jumpcell') ? [...el.children].find((c) => !c.classList.contains('k2-jump')) || el : el);
    const arrows = [];
    body.querySelectorAll('.k2-jumpcell').forEach((jc) => {
      const j = jc.querySelector('.k2-jump'); const prev = jc.previousElementSibling; if (!j || !prev) return;
      const pn = num(prev), kid = num(jc);
      if (Math.abs(pn.getBoundingClientRect().top - kid.getBoundingClientRect().top) > 8) return;
      // the arrow's own drawing (its shaft and head), so nothing else that changes between the shots is read as arrow ink
      const sh = [...j.querySelectorAll('path, polygon')].map((e) => e.getBoundingClientRect());
      const ab = { left: Math.min(...sh.map((b) => b.left)), right: Math.max(...sh.map((b) => b.right)) };
      arrows.push({ j: pg(ab), p: pg(pn.getBoundingClientRect()), n: pg(kid.getBoundingClientRect()) });
    });
    const bb = body.getBoundingClientRect();
    return { mmPx, arrows, clip: { x: Math.max(0, Math.floor(bb.left + scrollX - 40)), y: Math.max(0, Math.floor(bb.top + scrollY - 4)), width: Math.ceil(bb.width + 80), height: Math.ceil(bb.height + 8) } };
  }, root);
  let res = { min: 99, arrows: info.arrows.length, noInk: 0 };
  if (info.arrows.length) {
    // the pulsing next box and any transition are stilled for both shots (they would differ between them and read as arrow ink)
    const still = await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;outline:none!important}' });
    // a bar pinned over the page (the quiz footer, the Check bar) is hidden for the shots, so it never covers the row
    await page.evaluate(() => { document.querySelectorAll('body *').forEach((e) => { const p = getComputedStyle(e).position; if ((p === 'sticky' || p === 'fixed') && !e.querySelector('.k2-countrow-body') && !e.closest('.k2-countrow-body')) { e.dataset.inkHid = e.style.visibility || '-'; e.style.visibility = 'hidden'; } }); });
    await sleep(120);
    const tag = await page.addStyleTag({ content: '.k2-jump{visibility:hidden!important}' });
    await sleep(120);
    const A = await page.screenshot({ encoding: 'base64', clip: info.clip, captureBeyondViewport: true });
    await tag.evaluate((t) => t.remove());
    await sleep(120);
    const Bs = await page.screenshot({ encoding: 'base64', clip: info.clip, captureBeyondViewport: true });
    await still.evaluate((t) => t.remove());
    await page.evaluate(() => document.querySelectorAll('[data-ink-hid]').forEach((e) => { e.style.visibility = e.dataset.inkHid === '-' ? '' : e.dataset.inkHid; delete e.dataset.inkHid; }));
    res = await page.evaluate(async (A, B, info) => {
      const DSF = 3;
      const load = (b64) => new Promise((ok) => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); ok({ w: im.width, h: im.height, d: x.getImageData(0, 0, im.width, im.height).data }); }; im.src = 'data:image/png;base64,' + b64; });
      const a = await load(A), b = await load(B);
      const dark = (img, x, y) => { if (x < 0 || y < 0 || x >= img.w || y >= img.h) return false; const i = (y * img.w + x) * 4; return (img.d[i] * 0.3 + img.d[i + 1] * 0.59 + img.d[i + 2] * 0.11) < 110; };
      const X = (v) => (v - info.clip.x) * DSF, Y = (v) => (v - info.clip.y) * DSF;
      let min = 99, noInk = 0;
      for (const ar of info.arrows) {
        const x0 = Math.floor(X(ar.j.l - 1)), x1 = Math.ceil(X(ar.j.r + 1)), y0 = Math.floor(Y(Math.min(ar.p.t, ar.n.t))), y1 = Math.ceil(Y(Math.max(ar.p.b, ar.n.b)));
        let L = 1e9, R = -1;
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (dark(b, x, y) && !dark(a, x, y)) { L = Math.min(L, x); R = Math.max(R, x); }
        if (R < 0) { noInk++; continue; }
        let pr = -1e9, nl = 1e9;
        const lx0 = Math.floor(X(ar.p.l - 2)), rx1 = Math.ceil(X(ar.n.r + 2));
        for (let y = y0; y < y1; y++) { for (let x = lx0; x < L; x++) if (dark(a, x, y)) pr = Math.max(pr, x); for (let x = R + 1; x < rx1; x++) if (dark(a, x, y)) { nl = Math.min(nl, x); break; } }
        min = Math.min(min, (L - pr - 1) / DSF / info.mmPx, (nl - R - 1) / DSF / info.mmPx);
      }
      return { min: Math.round(min * 100) / 100, arrows: info.arrows.length, noInk };
    }, A, Bs, info);
  }
  await page.setViewport({ ...vp, deviceScaleFactor: 1, isMobile: touch, hasTouch: touch });
  await sleep(400);
  return res;
}


async function mount(page, host, opts, seed, count) {
  return page.evaluate(async (host, opts, seed, count) => {
    const st = window.state;
    const c = 'multiplication', k = 'count_by_tables';
    st.range = 100; st.decimalPlaces = 0; st.isMixedMode = false; st.quizMode = false; st.hasAnswered = false; st.skillOptions = opts;
    const q = window.generateQuestionFor({ category: c, skill: k, seed, itemIndex: 0, opts: opts || undefined });
    if (host === 'quiz') {
      const questions = [{ id: 0, skillId: k, points: 1, questionData: window.quizQuestionData(Object.assign({ categoryId: c }, q)) }];
      const test = { id: null, name: 'wide', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }],
        settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
      window.handleQuizURL(window.compressTestForURL(test));
      const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input'));
      window.startQuizTest();
    } else if (host === 'card') {
      st.category = c; st.skill = k; st.gameMode = 'practice'; st.currentQAttempts = 0;
      window.showView('gameView');
      st.currentQ = q; window.renderQuestion();
    } else {
      st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.problemCount = count || 2;
      window.initWorksheet();
    }
  }, host, opts, seed, count);
}

// the measures of one count row (its body inside `root`)
async function measure(page, root, host, qi) {
  return page.evaluate((root, host, qi) => {
    const r = document.querySelector(root);
    const q = host === 'quiz' ? window.state.quizAllQuestions[0].question.questionData : host === 'card' ? window.state.currentQ : window.state.worksheetQs[qi];
    const vals = (q.cell && q.cell.payload && q.cell.payload.values) || [];
    const body = r.querySelector('.k2-countrow-body');
    const ins = [...r.querySelectorAll('.k2-countrow-body input.mq-cellslot:not(.mq-cellslot-host)')];
    const widest = vals.reduce((a, v) => (String(v).length > a.length ? String(v) : a), '');
    ins.forEach((e) => { e.value = widest; });
    const fit = ins.map((e) => e.scrollWidth <= e.clientWidth);
    ins.forEach((e) => { e.value = ''; });
    const givens = [...r.querySelectorAll('.k2-countrow-body .k2-given')];
    const fz = (e) => parseFloat(getComputedStyle(e).fontSize);
    const cue = [...r.querySelectorAll('.k2-swipe-cue')].some((e) => { const cs = getComputedStyle(e); const b = e.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && b.width > 0 && b.height > 0; });
    const sw = r.querySelector('[data-mq-swiperow]');
    // the numbers in reading order, grouped into lines by their top edge
    const nums = ins.concat(givens).map((e) => e.closest('.k2-shape, .k2-given') || e).map((e) => e.getBoundingClientRect()).filter((b) => b.width > 0).sort((a, b) => a.top - b.top || a.left - b.left);
    const lines = [];
    nums.forEach((b) => { const ln = lines.find((l) => Math.abs(l.top - b.top) < 8); if (ln) ln.items.push(b); else lines.push({ top: b.top, items: [b] }); });
    const perLine = lines.map((l) => l.items.length);
    const cell = body ? body.closest('.mq-scell') : null;
    let band = 1, bandL = 1;
    if (cell && nums.length) {
      const cr = cell.getBoundingClientRect(), cs = getComputedStyle(cell);
      const left = cr.left + parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth), right = cr.right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth);
      band = (right - Math.max(...nums.map((b) => b.right))) / Math.max(1, right - left);
      bandL = (Math.min(...nums.map((b) => b.left)) - left) / Math.max(1, right - left);
    }
    return { n: ins.length, widest, fit, inW: ins.map((e) => Math.round(e.getBoundingClientRect().width)),
      givenPx: givens.length ? Math.min(...givens.map(fz)) : 0, inputPx: ins.length ? Math.min(...ins.map(fz)) : 0,
      maxPx: Math.max(0, ...givens.concat(ins).map(fz)),
      cue, swipeOver: sw ? sw.scrollWidth - sw.clientWidth : 0, perLine, band: Math.round(band * 1000) / 10, bandL: Math.round(bandL * 1000) / 10,
      cellW: cell ? Math.round(cell.getBoundingClientRect().width) : 0,
      pageScroll: document.documentElement.scrollWidth - window.innerWidth };
  }, root, host, qi);
}

async function boot(vp, touch) {
  const phone = touch === undefined ? vp.width <= 480 : touch;
  const app = await open({ viewport: { ...vp, deviceScaleFactor: 1, isMobile: phone, hasTouch: phone } });
  const { page } = app;
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  await page.reload({ waitUntil: 'networkidle2' });
  await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
  await page.evaluate(() => { try { localStorage.setItem('mathquest_onboarded', '1'); } catch (e) { /* ignore */ } });
  return { app, page, errs };
}
const dismiss = (page) => page.evaluate(() => { const d = document.getElementById('mqWorkedDismiss'); if (d) d.click(); });

(async () => {
  for (const vp of SIZES) {
    const phone = vp.width <= 480;
    for (const host of ['worksheet', 'card', 'quiz']) {
      for (const [rk, opts] of Object.entries(ROWS)) {
        const tag = `[${vp.width}x${vp.height} ${host} ${rk}]`;
        let app;
        try {
          const b = await boot(vp); app = b.app; const { page, errs } = b;
          await mount(page, host, opts, 11);
          await sleep(1200); await dismiss(page); await sleep(300);
          const root = host === 'quiz' ? '#quizTakeView' : host === 'card' ? '#questionCard' : '#ws_card_0';
          const m = await measure(page, root, host, 0);
          console.log(`  ${tag} widest ${m.widest} givens ${m.givenPx}px inputs ${m.inputPx}px boxes ${Math.min(...m.inW)}-${Math.max(...m.inW)}px cell ${m.cellW}px per line ${m.perLine.join('+')} bands ${m.bandL}/${m.band}% cue ${m.cue} swipeOver ${m.swipeOver} pageScroll ${m.pageScroll}`);
          if (SHOTS && !phone && (rk === '100000' || (rk === '100000-lines' && host !== 'worksheet') || (rk === 'by5' && host === 'card'))) {
            const el = await page.$(root);
            await el.evaluate((e) => e.scrollIntoView({ block: 'start' }));
            await page.screenshot({ path: path.join(SHOTS, `screen-${vp.width}-${host}-${rk}.png`) });
          }
          if (SHOTS && ((vp.width === 390 && ['100000', '25000', 'by5', '100000-lines'].includes(rk)) || (vp.width === 360 && host === 'worksheet' && rk === '100000'))) {
            const el = await page.$(root);
            await el.evaluate((e) => e.scrollIntoView({ block: 'start' }));
            await page.screenshot({ path: path.join(SHOTS, `screen-${vp.width}-${host}-${rk}.png`), fullPage: true });
          }
          check(m.n >= 2, `${tag} ${m.n} answer boxes`);
          {
            const px = vp.width <= NARROW ? 29 : HOST_PX[host];
            const tot = m.perLine.reduce((x, y) => x + y, 0);
            const half = tot >= 13 ? 5 : Math.ceil(tot / 2);
            check(m.givenPx >= px - 0.5 && m.inputPx >= px - 0.5 && m.maxPx <= px + 0.5, `${tag} givens ${m.givenPx}px and inputs ${m.inputPx}px at the host's ${px}px`);
            check(m.fit.every(Boolean), `${tag} every box holds "${m.widest}" (${m.fit.filter((f) => !f).length} too narrow)`);
            // critic r11 G1/G5: a phone line (and a 481-540 px line) takes 2 or more, a fixed allowance; 3 or more above
            const minPer = vp.width <= NARROW ? PHONE_MIN_PER_LINE : 3;
            check(Math.min(...m.perLine) >= minPer, `${tag} at least ${minPer} numbers to every line (${m.perLine.join('+')})`);
            check(Math.max(...m.perLine) - Math.min(...m.perLine) <= 1, `${tag} balanced lines (${m.perLine.join('+')})`);
            check(m.band < 30 && m.bandL < 30, `${tag} empty bands left ${m.bandL}% and right ${m.band}% < 30%`);
            check(Math.max(...m.perLine) <= half, `${tag} no screen line holds more than half the row (${m.perLine.join('+')}, at most ${half}) (TY-10a, SL-3a)`);
            check(!m.cue && m.swipeOver <= 1, `${tag} no swipe (cue ${m.cue}, overflow ${m.swipeOver}px)`);
            const ink = await inkClear(page, root, vp);
            check(ink.noInk === 0 && ink.min >= 1.0, `${tag} jump arrows' ink >= 1.0 mm clear of the numbers' and boxes' ink (${ink.min} mm, ${ink.arrows} arrows)`);
          }
          check(m.pageScroll <= 0, `${tag} the page never scrolls sideways (${m.pageScroll}px)`);
          check(errs.length === 0, `${tag} no page errors ${errs.join(' ')}`);
        } catch (e) {
          check(false, `${tag} ${e.message}`);
        } finally { if (app) await app.close(); }
      }
    }
    // D2: a worksheet that mixes rows (critic r11 G5: on the phone too)
    const tag = `[${vp.width}x${vp.height} worksheet mixed]`;
    let app;
    try {
      const b = await boot(vp); app = b.app; const { page, errs } = b;
      await mount(page, 'worksheet', MIXED, 11, 6);
      await sleep(1500); await dismiss(page); await sleep(300);
      const ms = [];
      for (let i = 0; i < 6; i++) ms.push(await measure(page, `#ws_card_${i}`, 'worksheet', i));
      const cards = await page.evaluate(() => [...document.querySelectorAll('#worksheetGrid > .problem-card')].map((c) => {
        const cell = c.querySelector('.ws-card-visual');
        const cr = cell.getBoundingClientRect();
        const kids = [...cell.children].filter((k) => getComputedStyle(k).display !== 'none').map((k) => k.getBoundingClientRect()).filter((b) => b.height > 0);
        const content = kids.length ? Math.max(...kids.map((k) => k.bottom)) - Math.min(...kids.map((k) => k.top)) : 0;
        return { x: Math.round(c.getBoundingClientRect().left), w: Math.round(c.getBoundingClientRect().width), h: Math.round(c.getBoundingClientRect().height), vband: Math.round((1 - content / Math.max(1, cr.height)) * 1000) / 10 };
      }));
      console.log(`  ${tag} cards ${cards.map((c) => `${c.w}x${c.h} (v-band ${c.vband}%)`).join(', ')}`);
      ms.forEach((m, i) => console.log(`  ${tag} #${i} givens ${m.givenPx}px inputs ${m.inputPx}px per line ${m.perLine.join('+')} bands ${m.bandL}/${m.band}% cue ${m.cue}`));
      if (SHOTS) {
        await page.evaluate(() => document.getElementById('ws_card_0').scrollIntoView({ block: 'start' }));
        await page.screenshot({ path: path.join(SHOTS, `screen-${vp.width}-worksheet-mixed.png`), fullPage: true });
      }
      const ws = cards.map((c) => c.w), hs = cards.map((c) => c.h);
      check(cards.length === 6 && Math.max(...ws) - Math.min(...ws) <= 1, `${tag} every card the same width (${ws.join(', ')})`);
      // one column (a phone): the cards stand one under another and each is as tall as its own row, so heights cannot be uneven
      const oneCol = new Set(cards.map((c) => c.x)).size === 1;
      check(oneCol || Math.max(...hs) / Math.min(...hs) <= 1.35, `${tag} card heights even (${hs.join(', ')}${oneCol ? '; one column' : ''})`);
      check(cards.every((c) => c.vband < 30), `${tag} no card stretched with a vertical empty band >= 30% (${cards.map((c) => c.vband).join(', ')})`);
      check(ms.every((m) => Math.abs(m.givenPx - 29) <= 0.5 && Math.abs(m.inputPx - 29) <= 0.5 && m.maxPx <= 29.5), `${tag} every row at 29 px (${ms.map((m) => m.inputPx).join(', ')})`);
      const mper = vp.width <= NARROW ? PHONE_MIN_PER_LINE : 3;
      check(ms.every((m) => Math.min(...m.perLine) >= mper && m.band < 30 && m.bandL < 30 && !m.cue && m.swipeOver <= 1), `${tag} every row ${mper}+ to a line, bands < 30%, no swipe (${ms.map((m) => `${m.perLine.join('+')} ${m.bandL}/${m.band}%`).join(', ')})`);
      check(ms.every((m) => m.pageScroll <= 0), `${tag} the page never scrolls sideways`);
      check(ms.every((m) => Math.max(...m.perLine) <= 6), `${tag} no line holds more than half a row (${ms.map((m) => m.perLine.join('+')).join(', ')})`);
      check(errs.length === 0, `${tag} no page errors ${errs.join(' ')}`);
    } catch (e) {
      check(false, `${tag} ${e.message}`);
    } finally { if (app) await app.close(); }
  }
  // critic r9 E3: a row balances the same on a fresh load and after a resize to the same width
  for (const [w0, h0, path0] of [[768, 1024, [[1366, 650], [1100, 700], [768, 800]]], [390, 844, [[430, 932], [360, 780], [390, 844]]]]) for (const host of ['worksheet', 'card', 'quiz']) {
    if (process.env.SIZES && !process.env.SIZES.split(',').includes(String(w0))) break;
    const tag = `[${w0} ${host} 100000 load vs resize]`;
    let app;
    try {
      const b = await boot({ width: w0, height: h0 }); app = b.app; const { page } = b;
      await mount(page, host, WIDE, 11);
      await sleep(1200); await dismiss(page); await sleep(300);
      const root = host === 'quiz' ? '#quizTakeView' : host === 'card' ? '#questionCard' : '#ws_card_0';
      const m0 = await measure(page, root, host, 0);
      for (const [vw, vh] of path0) { await page.setViewport({ width: vw, height: vh, deviceScaleFactor: 1, isMobile: w0 <= 480, hasTouch: w0 <= 480 }); await sleep(700); }
      const m1 = await measure(page, root, host, 0);
      check(m0.perLine.join('+') === m1.perLine.join('+'), `${tag} ${m0.perLine.join('+')} on load, ${m1.perLine.join('+')} after resizing back`);
    } catch (e) { check(false, `${tag} ${e.message}`); } finally { if (app) await app.close(); }
  }
  // critic r11 G4: a turn of the device re-chooses the drawing (no reload), as a fresh load at the new size draws it, and keeps
  // the typed answer and the focus
  const fresh = {};
  for (const [a0, a1] of [[{ width: 390, height: 844 }, { width: 844, height: 390 }], [{ width: 844, height: 390 }, { width: 390, height: 844 }]]) for (const host of ['card', 'quiz', 'worksheet']) {
    if (process.env.SIZES && !process.env.SIZES.split(',').includes(String(a0.width))) break;
    const tag = `[${a0.width}x${a0.height} -> ${a1.width}x${a1.height} ${host} 100000 rotate]`;
    const root = host === 'quiz' ? '#quizTakeView' : host === 'card' ? '#questionCard' : '#ws_card_0';
    let app;
    try {
      const key = `${a1.width}:${host}`;
      if (!fresh[key]) {
        const b = await boot(a1, true); app = b.app;
        await mount(b.page, host, WIDE, 11); await sleep(1200); await dismiss(b.page); await sleep(300);
        fresh[key] = await measure(b.page, root, host, 0);
        await app.close(); app = null;
      }
      const b = await boot(a0, true); app = b.app; const { page, errs } = b;
      await mount(page, host, WIDE, 11); await sleep(1200); await dismiss(page); await sleep(300);
      await page.evaluate((root) => { const i = document.querySelector(root).querySelector('.k2-countrow-body input.mq-cellslot:not(.mq-cellslot-host)'); i.setAttribute('data-rot', '1'); i.focus(); }, root);
      await page.keyboard.type('123', { delay: 30 });
      await page.setViewport({ ...a1, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
      await sleep(1200);
      // (read before measure(), which types the widest answer into every box to test its fit and then clears them)
      const kept = await page.evaluate(() => { const i = document.querySelector('[data-rot="1"]'); return { v: i ? i.value : null, focus: document.activeElement === i }; });
      const m = await measure(page, root, host, 0);
      const f = fresh[key];
      check(m.perLine.join('+') === f.perLine.join('+') && Math.abs(m.givenPx - f.givenPx) < 0.5, `${tag} ${m.perLine.join('+')} at ${m.givenPx}px, as a fresh load (${f.perLine.join('+')} at ${f.givenPx}px)`);
      check(kept.v === '123' && kept.focus, `${tag} the typed answer and the focus are kept (${JSON.stringify(kept)})`);
      check(m.pageScroll <= 0 && !m.cue && errs.length === 0, `${tag} no page scroll, no cue, no page errors ${errs.join(' ')}`);
    } catch (e) { check(false, `${tag} ${e.message}`); } finally { if (app) await app.close(); }
  }
    console.log(fails ? `small-fixes-countrow-wide: FAIL (${fails})` : 'small-fixes-countrow-wide: OK');
  process.exit(fails ? 1 : 0);
})();
