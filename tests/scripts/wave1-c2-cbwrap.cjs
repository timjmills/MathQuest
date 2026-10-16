// Wave 1 lane C2, owner ruling 2026-10-09: on the online worksheet at Chromebook width (1366 x 768 and 1280 x 720, three cards
// per row) a count row shows the WHOLE row inside its card, wrapped, with no "Swipe -> for more boxes"; a phone (390) keeps the swipe.
//  - every answer input lies inside its card (left/right) and is not clipped by any ancestor;
//  - no swipe cue is visible; no count row scrolls sideways;
//  - at 390 no row is wrapped (the phone keeps the swipe).
// Run: /tmp/mq-browser-run.sh node tests/scripts/wave1-c2-cbwrap.cjs
const { open } = require('../lib/ws-harness.cjs');
let fails = 0;
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };
const CASES = [
  ['multiplication', 'count_by_tables', {}],
  ['multiplication', 'count_by_tables', { spaces: 'line' }],
  ['multiplication', 'count_by_tables', { rows: [{ step: 1000, start: 'custom', at: 14000 }] }],
  ['patterns', 'skip_count_grid', {}],
  ['patterns', 'skip_count_line', {}],
];

const MEASURE = () => {
  const rows = [...document.querySelectorAll('#worksheetView [data-mq-swiperow]')].filter((e) => e.offsetParent);
  const out = { rows: rows.length, inputs: 0, outside: [], clipped: [], cues: 0, scrolls: 0, wrapped: 0, page: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  rows.forEach((w, ri) => {
    if (w.hasAttribute('data-mq-wrapfit')) out.wrapped++;
    const axis = !!w.querySelector('.k2-countrow-axis');
    if (!axis && w.scrollWidth > w.clientWidth + 1 && getComputedStyle(w).overflowX !== 'visible') out.scrolls++;
    if (!axis) w.querySelectorAll('.k2-swipe-cue').forEach((c) => { if (c.offsetParent && getComputedStyle(c).display !== 'none') out.cues++; });
    const cell = w.closest('.mq-scell');
    const cr = cell.getBoundingClientRect();
    if (!axis) w.querySelectorAll('input.mq-cellslot').forEach((el, i) => {
      out.inputs++;
      const r = el.getBoundingClientRect();
      if (r.left < cr.left - 1 || r.right > cr.right + 1) out.outside.push(`row ${ri} #${i}`);
      for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
        if (a.classList.contains('k2-tile-slot') || a.classList.contains('k2-shape-line')) continue;   // the input's own field and line frame (they size the input)
        const cs = getComputedStyle(a);
        if (!/(hidden|auto|scroll|clip)/.test(cs.overflowX + cs.overflowY)) continue;
        const b = a.getBoundingClientRect();
        if (r.left < b.left - 1 || r.right > b.right + 1 || r.top < b.top - 1 || r.bottom > b.bottom + 1) { out.clipped.push(`row ${ri} #${i} by ${a.className || a.tagName}`); break; }
      }
    });
  });
  return out;
};


// critic skip-count r1 D1-D3 (2026-10-16): the LAYOUT of every visible count row, on any host.
//  - a wrapped row splits each line into equal parts (6 -> 3 + 3) and is never a number line (axis);
//  - every axis row: each number's (box's) centre within 3 px of its tick;
//  - the turn arrow that leaves a line is within 1 pitch of that line's last box;
//  - no empty band: the gap from the step tab's bottom to line 1's top is <= 16 px;
//  - every visible jump arrow lies inside the cell's inner box and level with its box (no arrow alone in a band);
//  - the row is either whole (wrapped or not; no cue) or a swipe whose cue shows while a box lies past its right edge,
//    and its window is at least one whole column wide.
const LAYOUT = () => {
  const rows = [...document.querySelectorAll('[data-mq-swiperow]')].filter((e) => e.offsetParent);
  return rows.map((w) => {
    const cell = w.closest('.mq-scell'); const cr = cell.getBoundingClientRect(); const cs = getComputedStyle(cell);
    const il = cr.left + parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth), ir = cr.right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth);
    const wrapped = w.hasAttribute('data-mq-wrapfit'); const axis = !!w.querySelector('.k2-countrow-axis');
    const errs = [];
    const lines = [...w.querySelectorAll('.k2-countrow-line')];
    let pitch = 0;
    lines.forEach((ln, li) => {
      const inner = ln.querySelector('[data-mq-wrapped]'); const its = [...inner.children];
      if (its.length > 1) pitch = its[1].getBoundingClientRect().left - its[0].getBoundingClientRect().left;
      if (wrapped) {
        const tops = []; its.forEach((e) => { const t = Math.round(e.getBoundingClientRect().top); const g = tops.find((x) => Math.abs(x.t - t) < 4); if (g) g.n++; else tops.push({ t, n: 1 }); });
        const ns = tops.map((x) => x.n);
        if (its.length >= 6 && its.length % ns.length === 0 && new Set(ns).size > 1) errs.push(`line ${li} uneven ${ns.join('+')}`);
        if (ns.length > 1 && Math.max(...ns) - Math.min(...ns) > 1) errs.push(`line ${li} split ${ns.join('+')}`);
      }
      if (axis) {
        const svg = ln.querySelector('.k2-countrow-axis'); const vb = svg.viewBox.baseVal; const sr = svg.getBoundingClientRect();
        const xs = [...svg.querySelector('path').getAttribute('d').matchAll(/M([\d.]+) [\d.-]+ V/g)].map((m) => sr.left + Number(m[1]) * sr.width / vb.width);
        its.forEach((e, i) => { const r = e.getBoundingClientRect(); const c = (r.left + r.right) / 2; if (xs[i] === undefined || Math.abs(xs[i] - c) > 3) errs.push(`line ${li} #${i} off its tick by ${xs[i] === undefined ? 'no tick' : (c - xs[i]).toFixed(1)}`); });
        if (xs.length !== its.length) errs.push(`line ${li}: ${its.length} numbers, ${xs.length} ticks`);
      }
      const exit = ln.lastElementChild;
      if (exit && exit.tagName === 'SPAN' && exit.querySelector('svg') && its.length) {
        const last = its[its.length - 1].getBoundingClientRect(), er = exit.getBoundingClientRect();
        if (er.left - last.right > pitch + 1) errs.push(`line ${li} exit arrow ${Math.round(er.left - last.right)} px from its line (pitch ${Math.round(pitch)})`);
        if (er.bottom < last.top || er.top > last.bottom) errs.push(`line ${li} exit arrow not level with the line's last box`);
      }
    });
    // the tab -> line 1 band
    const frame = w.parentElement; const tab = frame && frame.querySelector('[data-mq-tabfor="0"]');
    if (tab && lines[0]) {
      const tb = tab.getBoundingClientRect(); const l1 = lines[0].firstElementChild.getBoundingClientRect();
      const tabAbove = tb.right <= l1.left + 1 ? false : true;
      if (tabAbove && l1.top - tb.bottom > 16) errs.push(`band of ${Math.round(l1.top - tb.bottom)} px between the tab and line 1`);
      if (!tabAbove) { const firstBox = lines[0].querySelector('[data-mq-wrapped]').firstElementChild.getBoundingClientRect(); const tabTxt = tab.firstElementChild ? tab.firstElementChild.getBoundingClientRect() : tb; if (firstBox.top - tabTxt.bottom > 16) errs.push(`tab beside: band of ${Math.round(firstBox.top - tabTxt.bottom)} px`); }
    }
    // jump arrows
    const v = w.getBoundingClientRect();
    w.querySelectorAll('.k2-jump').forEach((a, i) => {
      if (getComputedStyle(a).visibility === 'hidden') return;
      const r = a.getBoundingClientRect(); if (!r.width) return;
      if (!wrapped && getComputedStyle(w).overflowX !== 'visible' && (r.left < v.left - 1 || r.right > v.right + 1)) return;      // clipped by a swipe window (not shown whole)
      const box = a.parentElement.lastElementChild.getBoundingClientRect();
      if (r.left < il - 1 || r.right > ir + 1) errs.push(`jump ${i} outside the cell's inner box`);
      if (Math.abs((r.top + r.bottom) / 2 - (box.top + box.bottom) / 2) > 3) errs.push(`jump ${i} not level with its box`);
      if (wrapped && r.right > box.left + 1) errs.push(`jump ${i} not left of its box`);
    });
    // whole or swipe
    const cue = w.querySelector('.k2-swipe-cue'); const cueOn = !!cue && cue.offsetParent && getComputedStyle(cue).display !== 'none';
    const moreRight = [...w.querySelectorAll('.k2-countrow-body .k2-given, .k2-countrow-body input')].some((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > v.right + 1; });
    const ins = [...w.querySelectorAll('input.mq-cellslot')];
    const inside = ins.every((el) => { const r = el.getBoundingClientRect(); return r.left >= cr.left - 1 && r.right <= cr.right + 1; });
    const swipes = w.scrollWidth > w.clientWidth + 1 && getComputedStyle(w).overflowX !== 'visible';
    if (!swipes && (!inside || cueOn)) errs.push(`whole row but ${!inside ? 'an input lies outside the cell' : 'a cue shows'}`);
    if (swipes && cueOn !== moreRight) errs.push(`swipe cue ${cueOn ? 'shown' : 'hidden'} while ${moreRight ? 'a box lies' : 'nothing lies'} past the right edge`);
    if (swipes && pitch && w.clientWidth < pitch - 2) errs.push(`swipe window ${w.clientWidth} px narrower than one column (${Math.round(pitch)})`);
    const state = JSON.stringify({ wrapped, swipes, tabtop: !!(frame && frame.hasAttribute('data-mq-tabtop')), sw: !!(frame && frame.hasAttribute('data-mq-swipes')),
      st: [...w.querySelectorAll('.k2-countrow-line [data-mq-wrapped]')].map((c) => c.getAttribute('style')), ws: w.style.width, fs: frame ? frame.style.minWidth : '' });
    return { wrapped, swipes, axis, errs, state };
  });
};
const SHOW = async (page, host, cat, skill, opts) => page.evaluate(async ({ host, cat, skill, opts }) => {
  const st = window.state;
  window.clearSetOptions({ silent: true }); window.setSetOptions(cat, skill, opts, { silent: true });
  st.category = cat; st.skill = skill; st.isMixedMode = false; st.quizMode = false; st.hasAnswered = false;
  if (host === 'card') { st.gameMode = 'practice'; window.showView('gameView'); st.currentQ = window.generateQuestion(); window.renderQuestion(); }
  else if (host === 'quiz') {
    const q0 = window.generateQuestionFor({ category: cat, skill, seed: 11, itemIndex: 0, opts });
    const questions = [{ id: 0, skillId: skill, points: 1, questionData: window.quizQuestionData(q0) }];
    const test = { id: null, name: 'C2', sections: [{ id: 0, label: 'A', layout: { columns: 1, spacing: 'normal' }, instructions: '', questions }],
      settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
    window.handleQuizURL(window.compressTestForURL(test));
    const nm = document.getElementById('qtStudentName'); nm.value = 'A'; nm.dispatchEvent(new Event('input'));
    window.startQuizTest();
  } else { st.gameMode = 'worksheet'; window.showView('worksheetView'); window.initWorksheet(); }
  await new Promise((r) => setTimeout(r, 1400));
}, { host, cat, skill, opts });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const app = await open({ seed: 5, viewport: { width: 1366, height: 768, deviceScaleFactor: 1 } });
  const { page } = app;
  for (const [vw, vh] of [[1366, 768], [1280, 720], [390, 900]]) {
    await page.setViewport({ width: vw, height: vh, deviceScaleFactor: 1 });
    for (const [cat, skill, opts] of CASES) {
      if (vw === 390 && (skill !== 'count_by_tables' || Object.keys(opts).length)) continue;
      await page.evaluate(async ({ cat, skill, opts }) => {
        const st = window.state;
        window.clearSetOptions({ silent: true });
        window.setSetOptions(cat, skill, opts, { silent: true });
        st.category = cat; st.skill = skill; st.isMixedMode = false; st.quizMode = false; st.hasAnswered = false;
        st.gameMode = 'worksheet'; window.showView('worksheetView'); window.initWorksheet();
        await new Promise((r) => setTimeout(r, 1200));
        window.dispatchEvent(new Event('resize'));
        await new Promise((r) => setTimeout(r, 400));
      }, { cat, skill, opts });
      const m = await page.evaluate(MEASURE);
      const tag = `${vw} ${skill} ${JSON.stringify(opts)}`;
      if (vw === 390) {
        check(m.wrapped === 0, `${tag}: the phone never wraps a row (it keeps the swipe where a row is too wide: ${m.cues} cue(s) shown, ${m.wrapped} wrapped)`);
        check(m.page <= 0, `${tag}: no sideways page scroll (${m.page})`);
        continue;
      }
      check(m.rows > 0 && (m.inputs > 0 || skill === 'skip_count_line'), `${tag}: ${m.rows} count rows, ${m.inputs} inputs (a number line is checked by the layout pass below)`);
      check(m.cues === 0, `${tag}: no swipe cue shows (${m.cues})`);
      check(m.scrolls === 0, `${tag}: no count row scrolls sideways (${m.scrolls})`);
      check(!m.outside.length, `${tag}: every input inside its card${m.outside.length ? ' - ' + m.outside.slice(0, 4).join(', ') : ''}`);
      check(!m.clipped.length, `${tag}: no input clipped${m.clipped.length ? ' - ' + m.clipped.slice(0, 4).join(', ') : ''}`);
      check(m.page <= 0, `${tag}: no sideways page scroll (${m.page})`);
    }
  }
  // critic skip-count r1: the layout on the card, the quiz and the worksheet at both Chromebook sizes
  for (const [vw, vh] of [[1366, 650], [1280, 600]]) {
    await page.setViewport({ width: vw, height: vh, deviceScaleFactor: 1, hasTouch: true });
    for (const host of ['card', 'quiz', 'worksheet']) for (const [cat, skill, opts] of CASES) {
      await SHOW(page, host, cat, skill, opts);
      const L = await page.evaluate(LAYOUT);
      const tag = `${host} ${vw}x${vh} ${skill} ${JSON.stringify(opts)}`;
      check(L.length > 0, `${tag}: ${L.length} count row(s) shown`);
      if (host !== 'worksheet') check(L.every((r) => !r.wrapped), `${tag}: the card/quiz row is not wrapped (it fits whole, as on the baseline): ${L.map((r) => (r.wrapped ? 'wrapped' : r.swipes ? 'swipe' : 'whole')).join(',')}`);
      check(L.every((r) => !(r.axis && r.wrapped)), `${tag}: a number line is never wrapped`);
      const errs = L.flatMap((r, i) => r.errs.map((e) => `row ${i}: ${e}`));
      check(!errs.length, `${tag}: layout clean (even split, numbers on ticks, exit arrow by its line, no band, jumps inside and level, whole or cued swipe)${errs.length ? ' - ' + errs.slice(0, 4).join('; ') : ''}`);
    }
  }
  // critic skip-count r2 D7/D9: the card between half a Chromebook and a full one, and the phone window on 5 seeds.
  //  - no visible cue unless a number/box lies past the window's right edge;
  //  - no number/box straddles the window's or the cell's right edge;
  //  - the digits at 820 are no smaller than at 683.
  const EDGE = () => {
    const rows = [...document.querySelectorAll('[data-mq-swiperow]')].filter((e) => e.offsetParent);
    return rows.map((w) => {
      const v = w.getBoundingClientRect(); const cell = w.closest('.mq-scell'); const cr = cell.getBoundingClientRect(); const cs = getComputedStyle(cell);
      const ir = cr.right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth);
      const els = [...w.querySelectorAll('.k2-countrow-body .k2-given, .k2-countrow-body input')].filter((e) => e.getBoundingClientRect().width > 0);
      const more = els.some((e) => e.getBoundingClientRect().right > v.right + 1);
      const cue = w.querySelector('.k2-swipe-cue'); const cueOn = !!cue && !!cue.offsetParent && getComputedStyle(cue).display !== 'none';
      const edge = Math.min(v.right, ir);
      const straddle = els.filter((e) => { const r = e.getBoundingClientRect(); return r.left < edge - 1 && r.right > edge + 1; }).map((e) => e.textContent || e.value || 'box');
      const giv = [...w.querySelectorAll('.k2-given')];
      const fs = giv.length ? Math.min(...giv.map((e) => parseFloat(getComputedStyle(e).fontSize))) : 0;
      return { cueOn, more, straddle, fs };
    });
  };
  const fsAt = {};
  for (const [vw, vh] of [[683, 650], [820, 1180], [1024, 768], [1100, 650]]) {
    await page.setViewport({ width: vw, height: vh, deviceScaleFactor: 1, hasTouch: true });
    for (const [cat, skill, opts] of CASES) {
      await SHOW(page, 'card', cat, skill, opts);
      await sleep(700);
      const E = await page.evaluate(EDGE); const L = await page.evaluate(LAYOUT);
      const tag = `card ${vw}x${vh} ${skill} ${JSON.stringify(opts)}`;
      const errs = L.flatMap((r, i) => r.errs.map((e) => `row ${i}: ${e}`));
      check(E.length > 0 && !errs.length, `${tag}: layout clean${errs.length ? ' - ' + errs.slice(0, 3).join('; ') : ''}`);
      check(E.every((r) => !r.cueOn || r.more), `${tag}: no cue unless a number lies past the window (${E.map((r) => `${r.cueOn ? 'cue' : 'no cue'}/${r.more ? 'more' : 'all shown'}`).join(',')})`);
      check(E.every((r) => !r.straddle.length), `${tag}: no number or box straddles the right edge${E.some((r) => r.straddle.length) ? ' - ' + E.flatMap((r) => r.straddle).join(',') : ''}`);
      if (skill === 'skip_count_line') fsAt[vw] = Math.min(...E.map((r) => r.fs));
    }
  }
  check(fsAt[820] >= fsAt[683] - 0.05, `card skip_count_line: digits at 820 (${fsAt[820]} px) >= digits at 683 (${fsAt[683]} px)`);
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, hasTouch: true });
  for (const host of ['card', 'worksheet', 'quiz']) for (const seed of [9, 21, 33, 45, 57]) {
    await page.evaluate((s) => window.__wsReseed && window.__wsReseed(s), seed);
    await SHOW(page, host, 'patterns', 'skip_count_line', {});
    await sleep(700);
    const E = await page.evaluate(EDGE);
    check(E.length > 0 && E.every((r) => !r.straddle.length), `${host} 390 skip_count_line seed ${seed}: no number or box straddles the window's right edge${E.some((r) => r.straddle.length) ? ' - ' + E.flatMap((r) => r.straddle).join(',') : ''}`);
    check(E.every((r) => !r.cueOn || r.more), `${host} 390 skip_count_line seed ${seed}: cue only while a number lies past the window`);
  }
  // D3: a resize cycle on ONE page with no reload ends exactly as a fresh load does, and is clean at every width
  for (const [cat, skill, opts] of CASES) {
    const tag = `resize ${skill} ${JSON.stringify(opts)}`;
    await page.setViewport({ width: 1366, height: 650, deviceScaleFactor: 1, hasTouch: true });
    await SHOW(page, 'worksheet', cat, skill, opts);
    const fresh1366 = (await page.evaluate(LAYOUT)).map((r) => r.state);
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, hasTouch: true });
    await SHOW(page, 'worksheet', cat, skill, opts);
    const fresh390 = (await page.evaluate(LAYOUT)).map((r) => r.state);
    for (const [vw, vh] of [[1366, 650], [390, 844], [1280, 600], [683, 650], [1366, 650]]) {
      await page.setViewport({ width: vw, height: vh, deviceScaleFactor: 1, hasTouch: true });
      await sleep(1300);
      const L = await page.evaluate(LAYOUT);
      const errs = L.flatMap((r, i) => r.errs.map((e) => `row ${i}: ${e}`));
      check(!errs.length, `${tag} -> ${vw}: clean${errs.length ? ' - ' + errs.slice(0, 3).join('; ') : ''}`);
      if (vw === 390) check(JSON.stringify(L.map((r) => r.state)) === JSON.stringify(fresh390), `${tag} -> 390: identical to a fresh 390 load`);
    }
    const end = (await page.evaluate(LAYOUT)).map((r) => r.state);
    check(JSON.stringify(end) === JSON.stringify(fresh1366), `${tag}: 390->1366->390->1280->683->1366 ends identical to a fresh 1366 load${JSON.stringify(end) === JSON.stringify(fresh1366) ? '' : (() => { const i = end.findIndex((x, j) => x !== fresh1366[j]); return ` row ${i}/${end.length}: ${end[i]} vs fresh ${fresh1366[i]}`; })()}`);
  }
  check(!app.problems.some((p) => p.type === 'pageerror'), 'no page errors');
  await app.close();
  console.log(fails ? `wave1-c2-cbwrap: FAIL (${fails})` : 'wave1-c2-cbwrap: OK');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
