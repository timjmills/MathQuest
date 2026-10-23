// Teacher site 2.0 T1: every thumbnail must be what the APP draws for that skill and seed. A machine check, not a look:
//   node design/mockups/teacher-2/thumbs-check.cjs            the deterministic sample (>= 200 skills, every category,
//                                                              the critic's named ones), exit 1 on any failure
//   node design/mockups/teacher-2/thumbs-check.cjs --all      every live skill
//   node design/mockups/teacher-2/thumbs-check.cjs --only cat:skill,cat:skill
//
// Fix round 5 (critic r5 A1 / C1 / C2; stop rule §1.7: the thumbnail class survived r2, r3, r4 and r5). Its root cause was
// COPYING the app's drawing into a mock-up format (hand drawings, then a sanitised DOM capture whose CSS reset blew SVG
// text up 2–4×). The old check passed because it only asked that text be at least the minimum and inside the box. This one
// compares the mock-up with the app itself:
//   A. the APP: index.html is booted (globals.js, init), and for each sampled skill and seed the app's own
//      window.buildSheet prints the same request the thumbnail prints; the cell is rendered in the app's sheet document
//      and measured: every text line (words, effective font size, box) and every drawing (svg, img, ruled / filled box);
//   B. the MOCK-UP: thumbs.html draws the same skill and seed with the mock-up's thumbnail (MQThumbs.draw / drawItem) at
//      the Big, Medium and Small card sizes, the tray's Thumbnails view, the chip sheet and a page preview cell;
//   C. they must agree: the same words; every text's font size within ±10 %; every text and drawing box within
//      2 px + 4 % of the app's; the same number of drawings; and on the screen:
//      - the smallest text SHOWN is >= the place's minimum (Big 12, Medium 11, Small 9 px; previews and the bar 0);
//      - no text line is cut at its START (the window is anchored at the left / top of what the cell draws);
//      - the thumbnail is drawn (not waiting, not an error) and its picture stays inside its box;
//   D. the pages: app.html loads no samples.js; "Same problems, new numbers" pages 2 and 3 deal different items; a cold
//      load of app.html#skills is measured and reported.
'use strict';
const fs = require('fs');
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); }
const { startServer } = require('../../../tests/lib/ws-harness.cjs');
global.window = global;
require(path.join(__dirname, 'data.js'));
const D = window.MQ_DATA;
const EXE = fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
const args = process.argv.slice(2);
const argv = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const ALL = args.includes('--all');
const ONLY = argv('--only') ? argv('--only').split(',') : null;
const fails = [];
const say = (k, why) => { fails.push(`${k}: ${why}`); };

// ---- the sample: the critic's named skills, then every third live skill, then at least two of every category
const NAMED = [
  'measurement:time_hour', 'measurement:time_half_hour', 'measurement:time_quarter', 'measurement:time_1min', 'measurement:order_clocks_analog_asc',
  'measurement:elapsed_visual_easy', 'measurement:clock_parts', 'multiplication:nl_mult', 'addition:nl_add', 'integers:number_line_int',
  'graphs:bar_graph', 'graphs:pictograph', 'graphs:line_plot', 'graphs:line_plot_g2', 'coordinates:coordinates_read_all', 'coordinates:coordinate_q1',
  'vocabulary:vocab_grade_1', 'vocabulary:vocab_grade_3_geometry', 'vocabulary:vocab_grade_K_counting', 'order_of_operations:cube_numbers',
  'multiplication:count_by_9s', 'angles_lines:angles_on_straight_line', 'angles_lines:angles_around_point', 'algebra:solve_eq_twostep',
  'number_theory:factor_links_hard', 'fraction_operations:frac_word_mixed', 'addition:add_sub_fact_family',
];
const live = D.skills.map(s => s.c + ':' + s.v);
let keys;
if (ONLY) keys = ONLY;
else if (ALL) keys = live.slice();
else {
  const set = new Set(NAMED.filter(k => live.includes(k)));
  live.forEach((k, i) => { if (i % 3 === 0) set.add(k); });
  const byCat = {}; for (const k of set) { const c = k.split(':')[0]; byCat[c] = (byCat[c] || 0) + 1; }
  for (const k of live) { const c = k.split(':')[0]; if ((byCat[c] || 0) < 2) { set.add(k); byCat[c] = (byCat[c] || 0) + 1; } }
  keys = [...set];
}
for (const k of NAMED) if (!ONLY && !live.includes(k)) say(k, 'a named skill is not live in data.js');
// each skill at the card seed (item 1); every other one also at a "New numbers" seed (item 2), as a page preview deals it
const cases = [];
keys.forEach((k, i) => {
  cases.push({ k, seed: null, n: 0, place: ['big', 'medium', 'small', 'tray'][i % 4] });
  if (i % 2 === 0) cases.push({ k, seed: 'chk' + i + ':1', n: 1, place: i % 4 === 0 ? 'preview' : 'chip' });
});
const cats = new Set(keys.map(k => k.split(':')[0]));
const allCats = new Set(live.map(k => k.split(':')[0]));
if (!ONLY) {
  if (keys.length < 200 && !ALL) say('sample', `${keys.length} skills (need >= 200)`);
  for (const c of allCats) if (!cats.has(c)) say('sample', `category ${c} not sampled`);
}

const near = (a, b, tol) => Math.abs(a - b) <= tol;
function compare(id, app, mock) {
  const bad = [];
  if (app.text !== mock.text) bad.push(`words differ: app “${app.text.slice(0, 80)}” vs mock-up “${mock.text.slice(0, 80)}”`);
  if (app.texts.length !== mock.texts.length) bad.push(`${mock.texts.length} text runs (app ${app.texts.length})`);
  else app.texts.forEach((a, i) => {
    const m = mock.texts[i];
    if (Math.abs(m.fs / a.fs - 1) > 0.10) bad.push(`“${a.t.slice(0, 20)}” at ${m.fs.toFixed(1)} px (app ${a.fs.toFixed(1)} px)`);
    const tol = (v) => 2 + 0.04 * Math.abs(v);
    if (!near(m.r[0], a.r[0], tol(a.r[2])) || !near(m.r[1], a.r[1], tol(a.r[3])) || !near(m.r[2], a.r[2], tol(a.r[2])) || !near(m.r[3], a.r[3], tol(a.r[3]))) bad.push(`“${a.t.slice(0, 20)}” box ${m.r.join(',')} (app ${a.r.join(',')})`);
  });
  if (app.draws.length !== mock.draws.length) bad.push(`${mock.draws.length} drawings (app ${app.draws.length})`);
  else app.draws.forEach((a, i) => {
    const m = mock.draws[i]; const tol = (v) => 2 + 0.04 * Math.abs(v);
    if (m.tag !== a.tag || !a.r.every((v, j) => near(m.r[j], v, tol(j < 2 ? a.r[j + 2] : v)))) bad.push(`drawing ${i} ${m.tag} ${m.r.join(',')} (app ${a.tag} ${a.r.join(',')})`);
  });
  if (Math.abs(mock.box[2] - app.box[2]) > 2 + 0.04 * app.box[2] || Math.abs(mock.box[3] - app.box[3]) > 2 + 0.04 * app.box[3]) bad.push(`drawn area ${mock.box.slice(2).map(Math.round).join('×')} (app ${app.box.slice(2).map(Math.round).join('×')})`);
  if (bad.length) say(id, bad.slice(0, 4).join('; ') + (bad.length > 4 ? ` … +${bad.length - 4}` : ''));
}

(async () => {
  const t0 = Date.now();
  const { server, base } = await startServer();
  const browser = await chromium.launch({ executablePath: EXE, args: ['--font-render-hinting=none'] });
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, deviceScaleFactor: 1 });
  const errs = [];
  // ---------------------------------------------------------------- A. the app
  const app = await ctx.newPage(); app.setDefaultTimeout(180000);
  app.on('pageerror', e => errs.push('app: ' + e.message));
  await app.goto(base + '/index.html', { waitUntil: 'load' });
  await app.waitForFunction(() => typeof window.buildSheet === 'function' && typeof window.sheetDocument === 'function');
  await app.evaluate(async (u) => { window.__live = await import(u); try { await Promise.all([document.fonts.load('400 16px Andika'), document.fonts.load('700 16px Andika')]); await document.fonts.ready; } catch (e) { /* */ } }, base + '/design/mockups/teacher-2/live.mjs');
  const appRec = {};
  for (let b = 0; b < cases.length; b += 20) {
    const batch = cases.slice(b, b + 20);
    const got = await app.evaluate(async (batch) => {
      const L = window.__live; const out = {};
      for (const c of batch) {
        const id = c.k + '|' + c.seed + '|' + c.n;
        try {
          const r = await window.buildSheet(L.sheetRequest(c.k, c.seed === null ? undefined : c.seed, L.countFor(c.n)));
          const f = document.createElement('iframe'); f.style.cssText = 'position:fixed;left:0;top:0;width:900px;height:1400px;border:0;visibility:hidden';
          document.body.appendChild(f);
          await new Promise((ok) => { f.onload = ok; f.srcdoc = window.sheetDocument(r.pupilHtml, 'check'); setTimeout(ok, 15000); });
          const d = f.contentDocument;
          for (let t = 0; t < 200 && d.documentElement.getAttribute('data-ws-fonts') !== 'ready'; t++) await new Promise(ok => setTimeout(ok, 25));
          await d.fonts.ready;
          const cells = [...d.querySelectorAll('.ws-page .ws-cell:not(.blankrun)')].filter(x => x.getBoundingClientRect().width > 4);
          out[id] = cells[c.n] ? L.measureCell(cells[c.n]) : { none: true };
          f.remove();
        } catch (e) { out[id] = { err: String(e.message || e).slice(0, 160) }; }
      }
      return out;
    }, batch);
    Object.assign(appRec, got);
    process.stderr.write(`  app ${Math.min(b + 20, cases.length)}/${cases.length} ${Math.round((Date.now() - t0) / 1000)} s\n`);
  }
  // ---------------------------------------------------------------- B. the mock-up
  const mk = await ctx.newPage(); mk.setDefaultTimeout(180000);
  mk.on('pageerror', e => errs.push('thumbs.html: ' + e.message));
  await mk.goto(base + '/design/mockups/teacher-2/thumbs.html?q=__none__', { waitUntil: 'load' });
  const hasLive = await mk.evaluate(async () => { for (let t = 0; t < 100 && !window.MQLive; t++) await new Promise(ok => setTimeout(ok, 50)); return !!window.MQLive; });
  if (!hasLive) say('thumbs.html', 'the live renderer (MQLive) did not load: thumbnails are not drawn by the app');
  const mockRec = {};
  for (let b = 0; b < cases.length && hasLive; b += 24) {
    const batch = cases.slice(b, b + 24);
    const got = await mk.evaluate(async (batch) => {
      const T = window.MQThumbs, D = window.MQ_DATA; const SK = {}; D.skills.forEach(s => { SK[s.c + ':' + s.v] = s; });
      const out = document.getElementById('out'); out.innerHTML = '';
      // each place as the mock-up builds it (the same classes as app.html)
      const wrap = {
        big: (h) => `<div class="grid" data-view="big" style="grid-template-columns:300px"><div class="card"><div class="thumb">${h}</div></div></div>`,
        medium: (h) => `<div class="grid" data-view="medium" style="grid-template-columns:220px"><div class="card"><div class="thumb">${h}</div></div></div>`,
        small: (h) => `<div class="grid" data-view="small" style="grid-template-columns:170px"><div class="card"><div class="thumb">${h}</div></div></div>`,
        tray: (h) => `<div class="tp-list" style="width:200px"><div class="tp-item tp-thumb"><div class="thumb">${h}</div></div></div>`,
        chip: (h) => `<div style="width:420px"><div class="thumb thumb-lg">${h}</div></div>`,
        preview: (h) => `<div class="previews"><div class="page p3"><div class="page-in"><div class="page-grid c2"><div class="page-cell">${h}</div></div></div></div></div>`,
      };
      const ids = [];
      for (const c of batch) {
        const s = SK[c.k]; const id = c.k + '|' + c.seed + '|' + c.n;
        const h = c.n === 0 && c.seed === null ? T.draw(s) : T.drawItem(s, c.n, c.seed);
        const d = document.createElement('div'); d.className = 'chk'; d.dataset.id = id; d.dataset.place = c.place; d.style.cssText = 'width:300px;display:inline-block;vertical-align:top;margin:6px';
        if (c.place === 'big') d.style.width = '300px'; if (c.place === 'small') d.style.width = '220px'; if (c.place === 'chip') d.style.width = '420px'; if (c.place === 'preview') d.style.width = '520px';
        d.innerHTML = wrap[c.place](h || ''); out.appendChild(d); ids.push(id);
      }
      if (window.MQLive) await window.MQLive.drawAll(out);
      const res = {};
      for (const d of out.querySelectorAll('.chk')) {
        const id = d.dataset.id; const host = d.querySelector('.live-thumb');
        if (!host) { res[id] = { nolive: true, html: d.innerHTML.slice(0, 80) }; continue; }
        if (host.dataset.state !== 'done') { res[id] = { state: host.dataset.state, err: host.dataset.err || '' }; continue; }
        const m = window.MQLive.measureHost(host);
        if (!m) { res[id] = { state: 'drawn without a cell', err: '' }; continue; }
        if (!host.dataset.win) { res[id] = { state: 'not fitted', err: `host ${host.clientWidth}×${host.clientHeight}` }; continue; }
        const s = Number(host.dataset.scale); const win = host.dataset.win.split(' ').map(Number);
        const min = parseFloat(getComputedStyle(host).getPropertyValue('--smp-min')) || 0;
        const z = host.shadowRoot.querySelector('.mq-zoom'); const hr = host.getBoundingClientRect(), zr = z.getBoundingClientRect();
        const realScale = (zr.width / z.offsetWidth) / (hr.width / host.offsetWidth);   // the thumbnail's own scale, any outer one (a preview page) divided out
        // what is SHOWN: text lines whose box meets the window (cell-relative: the window's top-left is win[0], win[1])
        const ox = win[0], oy = win[1];
        let low = Infinity, lowT = ''; const cutStart = [];
        for (const t of m.texts) {
          const [x, y, w, hh] = t.r; const shown = x < ox + win[2] && x + w > ox && y < oy + win[3] && y + hh > oy;
          if (!shown) continue;
          if (t.fs * s < low) { low = t.fs * s; lowT = t.t; }
          for (const L of t.lefts) if (L < ox - 0.5 && L + 1 < ox + win[2]) cutStart.push(t.t.slice(0, 20));
        }
        res[id] = { m, s, realScale, min, low: Number.isFinite(low) ? low : null, lowT, cutStart, place: d.dataset.place,
          inside: true,
          clip: getComputedStyle(host).overflow, hostW: hr.width, hostH: hr.height };
      }
      return res;
    }, batch);
    Object.assign(mockRec, got);
    process.stderr.write(`  mock-up ${Math.min(b + 24, cases.length)}/${cases.length} ${Math.round((Date.now() - t0) / 1000)} s\n`);
  }
  // ---------------------------------------------------------------- C. compare
  let nCmp = 0;
  for (const c of cases) {
    const id = c.k + '|' + c.seed + '|' + c.n; const a = appRec[id], m = mockRec[id];
    if (!a || a.err) { say(id, 'the app could not print it: ' + (a ? a.err : 'no record')); continue; }
    if (a.none) { say(id, 'the app printed no cell ' + (c.n + 1)); continue; }
    if (!m) { if (hasLive) say(id, 'not drawn in the mock-up'); continue; }
    if (m.nolive) { say(id, `${c.place}: not a live thumbnail (${m.html.replace(/\s+/g, ' ').slice(0, 60)})`); continue; }
    if (m.state) { say(id, `${c.place}: thumbnail ${m.state} ${m.err}`); continue; }
    nCmp++;
    compare(`${id} [${c.place}]`, a, m.m);
    if (Math.abs(m.realScale - m.s) > 0.01) say(id, `${c.place}: drawn at ${m.realScale.toFixed(3)}×, says ${m.s}`);
    if (m.min > 0 && m.low !== null && m.low + 0.05 < m.min) say(id, `${c.place}: smallest text shown ${m.low.toFixed(1)} px “${m.lowT.slice(0, 20)}” (min ${m.min})`);
    if (m.cutStart.length) say(id, `${c.place}: line cut at its start: “${m.cutStart[0]}”`);
    if (!m.inside || m.clip !== 'hidden') say(id, `${c.place}: the picture is not held inside its box`);
  }
  // ---------------------------------------------------------------- D. the pages
  const pg = await ctx.newPage();
  const bytes = { total: 0, samples: 0, n: 0 };
  pg.on('response', async (r) => { try { const b = await r.body(); bytes.total += b.length; bytes.n++; if (/samples\.js/.test(r.url())) bytes.samples += b.length; } catch (e) { /* */ } });
  pg.on('pageerror', e => errs.push('app.html: ' + e.message));
  await pg.goto(base + '/design/mockups/teacher-2/app.html?theme=light#skills', { waitUntil: 'load' });
  await pg.evaluate(async () => { for (let t = 0; t < 100 && !window.MQLive; t++) await new Promise(ok => setTimeout(ok, 50)); if (window.MQLive) await window.MQLive.settled(document); });
  await pg.waitForTimeout(500);
  const cards = await pg.evaluate(() => ({ live: document.querySelectorAll('.card .live-thumb').length, done: document.querySelectorAll('.card .live-thumb[data-state="done"]').length, other: document.querySelectorAll('.card .smp-thumb, .card svg[data-fallback]').length }));
  if (bytes.samples) say('app.html', `loads samples.js (${(bytes.samples / 1e6).toFixed(2)} MB)`);
  if (!cards.live || cards.other) say('app.html#skills', `cards: ${cards.live} live thumbnails, ${cards.other} copied pictures`);
  if (cards.live && !cards.done) say('app.html#skills', 'no card thumbnail was drawn on screen');
  // "Same problems, new numbers": three pages of three skills; pages 2 and 3 must deal other items than page 1
  const tray = ['addition', 'measurement', 'fractions'].map(c => { const s = D.skills.find(x => x.c === c && (c !== 'measurement' || /time_hour/.test(x.v))); return s.c + ':' + s.v; }).join(',');
  await pg.goto(base + `/design/mockups/teacher-2/app.html?theme=light&tray=${tray}&pages=3&each=same#print`, { waitUntil: 'load' });
  await pg.waitForTimeout(400);
  const each = await pg.evaluate(async () => {
    for (let t = 0; t < 100 && !window.MQLive; t++) await new Promise(ok => setTimeout(ok, 50));
    if (window.MQLive) await window.MQLive.drawAll(document);
    const pages = [...document.querySelectorAll('.previews .page')].map(p => [...p.querySelectorAll('.page-cell')].map(c => { const h = c.querySelector('.live-thumb'); return h ? (h.dataset.k + '=' + (h.dataset.text || '') + ' → ' + (h.dataset.ans || '')) : 'none'; }));
    return { q: true, s: /new numbers/i.test((document.querySelector('[data-summary]') || {}).textContent || ''), pages };
  });
  if (!each.q || !each.s) say('Each page', 'the summary does not say Same problems, new numbers (?pages=3&each=same)');
  else if (each.pages.length < 3) say('Each page', `${each.pages.length} preview pages`);
  else {
    const same = (a, b) => a.join('|') === b.join('|');
    if (same(each.pages[0], each.pages[1]) || same(each.pages[1], each.pages[2]) || same(each.pages[0], each.pages[2])) say('Each page', 'Same problems, new numbers: two preview pages deal the same items');
    const sk = (p) => p.map(x => x.split('=')[0]).join(',');
    if (new Set(each.pages[0].map(x => x.split('=')[0])).size < 3) say('Each page', `page 1 shows ${each.pages[0].length} cells of ${new Set(each.pages[0].map(x => x.split('=')[0])).size} skills (want the tray's 3)`);
    if (sk(each.pages[0]) !== sk(each.pages[1])) say('Each page', 'Same problems, new numbers: page 2 does not repeat page 1’s skills');
    if (each.pages.flat().some(x => x === 'none' || /= → $/.test(x))) say('Each page', 'a preview cell is not a drawn live thumbnail');
  }
  // cold load, nothing cached: the bytes a first visit to Skills transfers
  const cold = await browser.newContext({ viewport: { width: 1366, height: 768 } }); const cp = await cold.newPage();
  const cb = { total: 0, n: 0 }; cp.on('response', async (r) => { try { cb.total += (await r.body()).length; cb.n++; } catch (e) { /* */ } });
  const tc = Date.now(); await cp.goto(base + '/design/mockups/teacher-2/app.html?theme=light#skills', { waitUntil: 'load' });
  const tLoad = Date.now() - tc;
  await cp.evaluate(async () => { for (let t = 0; t < 100 && !window.MQLive; t++) await new Promise(ok => setTimeout(ok, 50)); if (window.MQLive) await window.MQLive.settled(document); });
  const tDrawn = Date.now() - tc; await cold.close();
  for (const e of errs) say('console', e);
  await browser.close(); server.close();
  const nSk = keys.length;
  console.log(`thumbs-check: ${nSk} skills in ${cats.size} categories, ${cases.length} thumbnails, ${nCmp} compared with the app's own sheet`);
  console.log(`  cold load app.html#skills: ${(cb.total / 1e6).toFixed(2)} MB in ${cb.n} files (uncompressed), page ${tLoad} ms, first screen of thumbnails ${tDrawn} ms`);
  if (fails.length) { console.log(fails.slice(0, 80).map(f => '  ✗ ' + f).join('\n') + (fails.length > 80 ? `\n  … ${fails.length - 80} more` : '')); console.log(`thumbs-check: FAIL (${fails.length})`); process.exit(1); }
  console.log('thumbs-check: OK');
})().catch((e) => { console.error(e); console.log('thumbs-check: FAIL (crashed)'); process.exit(1); });
