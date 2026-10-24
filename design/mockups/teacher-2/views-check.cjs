// Teacher site 2.0 T1, fix round 6 (critic r6, speed lesson: "check ALL views × kinds × widths, not just the failing
// state"). One sweep over every tray view (List · Chips · Thumbnails) × kind (Single · Sections · Mixed) × width
// (1366 · 1280 · 1024 · 820 · 390), exit 1 on any failure:
//   (viewports: 1366 × 768, 1280 × 800, 1024 × 768, 820 × 1180 a tablet upright, 390 × 844)
//   1. popup rows:   the tray popup (100 skills, every area open) shows >= 6 skill rows in its first screen, in every view,
//                    Detailed weights on and off; with Detailed weights on, a skill row is <= 60 px from 820 px up
//                    (critic r6 A2 / A3) and the area / grade headers stay one line (no Less · Equal · More shown) on a phone;
//   2. held %:       a skill held at 50 % shows "50 %" on its row in every popup view and in the Print sheet (never
//                    Less · Equal · More there), and pressing it asks "Release the 50 %?" (critic r6 C1);
//   3. no silent 0:  every skill with a weight above 0 gets >= 1 problem, or a visible ⚠ names it, or the summary says it
//                    is a sample, for every kind × pages 1–5 × a held skill or none (critic r6 C2); a big tray's summary
//                    never counts an area that gets no item (critic r6 C4);
//   4. tray bar:     with 2+ areas every visible Chips chip names its area (critic r6 D1); hidden areas or chips always
//                    leave a visible "+N" (critic r6 A4); on every selected option the ✓ never overlaps its label (A5).
'use strict';
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); }
const { startServer } = require('../../../tests/lib/ws-harness.cjs');
const EXE = require('fs').existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
const WIDTHS = [1366, 1280, 1024, 820, 390];
const VIEWS = ['list', 'chips', 'thumbs'];
const KINDS = ['single', 'sections', 'mixed'];
const FIVE = 'addition:add_facts,subtraction:sub_facts,multiplication:mult_facts,subtraction:sub_word_problems,division:div_facts';
const fails = []; const say = (k, w) => { fails.push(`${k}: ${w}`); process.stderr.write(`  ✗ ${k}: ${w}\n`); };
let n = 0;

(async () => {
  const { server, base } = await startServer();
  const browser = await chromium.launch({ executablePath: EXE });
  const errs = [];
  const open = async (w, q, hash) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: ({ 390: 844, 820: 1180, 1024: 768, 1280: 800, 1366: 768 })[w] || 768 } });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(`${q}#${hash} @${w}: ${e.message}`));
    await p.goto(`${base}/design/mockups/teacher-2/app.html?theme=light&${q}#${hash}`, { waitUntil: 'load' });
    await p.waitForTimeout(250);
    return { p, ctx };
  };
  // ---- 1. popup rows, and 2. held % in the popup
  for (const w of WIDTHS) for (const v of VIEWS) for (const det of [0, 1]) {
    const id = `popup ${v} detailed=${det} @${w}`;
    const { p, ctx } = await open(w, `tray=demo100&open=all&tview=${v}&detailed=${det}`, 'tray');
    const r = await p.evaluate(() => {
      const body = document.querySelector('.tp-body'); if (!body) return null;
      const b = body.getBoundingClientRect(); const vh = innerHeight;
      const rows = [...body.querySelectorAll('.tp-row, .tp-item')].filter(e => e.offsetParent);
      const inView = rows.filter(e => { const r = e.getBoundingClientRect(); return r.top >= b.top - 1 && r.bottom <= Math.min(b.bottom, vh) + 1; }).length;
      const hs = rows.slice(0, 12).map(e => e.getBoundingClientRect().height);
      const heads = [...body.querySelectorAll('.tp-ahead, .tp-ghead:not(.tp-rgrade)')].filter(e => e.offsetParent);
      const headSeg = heads.filter(h => { const s = h.querySelector(':scope > .tp-ctl'); return s && getComputedStyle(s).display !== 'none'; }).length;
      return { inView, maxH: Math.max(0, ...hs), headSeg, nHeads: heads.length };
    });
    n++;
    if (!r) { say(id, 'no popup'); await ctx.close(); continue; }
    if (r.inView < 6) say(id, `${r.inView} skill rows in the first screen (need >= 6)`);
    if (det && w >= 820 && r.maxH > 60) say(id, `a Detailed weights skill row is ${Math.round(r.maxH)} px (need <= 60)`);
    if (w < 820 && r.headSeg) say(id, `${r.headSeg} of ${r.nHeads} headers open their controls inline (want one line with ⋯)`);
    await ctx.close();
  }
  for (const w of [1366, 390]) for (const v of VIEWS) for (const det of [0, 1]) {
    const id = `held % in popup ${v} detailed=${det} @${w}`;
    const { p, ctx } = await open(w, `tray=${FIVE}&open=all&tview=${v}&detailed=${det}&lockp=k:addition:add_facts:50`, 'tray');
    const t = await p.evaluate(() => { const nm = [...document.querySelectorAll('.tp-body .tp-name, .tp-body .chip .name')].find(e => /Addition Facts/.test(e.textContent)); if (!nm) return null; const row = nm.closest('.tp-row, .tp-item'); return row ? row.innerText + ' ' + [...row.querySelectorAll('input')].map(i => i.value + ' %').join(' ') : ''; });
    n++;
    if (t === null) say(id, 'the held skill is not in the popup'); else if (!/50\s*%/.test(t)) say(id, `its row does not show 50 %: “${t.replace(/\s+/g, ' ').slice(0, 80)}”`);
    await ctx.close();
  }
  // ---- 2. held % in the Print sheet, every kind
  for (const w of [1366, 390]) for (const k of ['', ...KINDS]) {
    const id = `held % in Print ${k || 'auto'} @${w}`;
    const { p, ctx } = await open(w, `tray=${FIVE}&lockp=k:addition:add_facts:50${k ? '&kind=' + k : ''}`, 'print');
    const r = await p.evaluate(() => {
      const row = [...document.querySelectorAll('.weight-row')].find(e => /Addition Facts/.test(e.textContent));
      if (!row) return { none: true };
      return { held: !!row.querySelector('.held-btn'), txt: row.innerText, seg: !!row.querySelector('.seg') };
    });
    n++;
    if (r.none) say(id, 'no How often row for the held skill');
    else {
      if (!r.held || !/50\s*%/.test(r.txt)) say(id, `shows “${r.txt.replace(/\s+/g, ' ').slice(0, 60)}”, not 50 % 🔒`);
      if (r.seg) say(id, 'still shows Less · Equal · More beside the held %');
      if (r.held) {
        await p.click('.weight-row .held-btn');
        const ask = await p.evaluate(() => (document.querySelector('.release-ask') || {}).innerText || '');
        if (!/Release the 50 %\?/.test(ask)) say(id, `pressing it does not ask “Release the 50 %?” (${ask.slice(0, 40)})`);
        const lockKept = await p.evaluate(() => MQ.S.lock['k:addition:add_facts'] === 50);
        if (!lockKept) say(id, 'pressing it changed the held % before the teacher answered');
      }
    }
    await ctx.close();
  }
  // ---- 3. no silent 0 (one page, at 1366: the plan is width-independent)
  {
    const { p, ctx } = await open(1366, `tray=${FIVE}`, 'print');
    const out = await p.evaluate(async (KINDS) => {
      const S = MQ.S; const bad = [];
      for (const lock of [null, 50, 70]) for (const k of KINDS) for (let pg = 1; pg <= 5; pg++) {
        S.lock = {}; if (lock) MQ.setLock('k:addition:add_facts', lock);
        S.kind = k; S.opts.pages = pg; S.touched.add('pages'); S.sheet = 'print'; MQ.render();
        const pl = MQ.plan(); const warn = [...document.querySelectorAll('[data-warn-nopage]')].map(e => e.textContent).join(' ');
        const sm = MQ.summaryText(); const all = sm.line + ' ' + sm.more;
        S.tray.forEach((x, i) => { if (pl.counts[i] < 1 && !warn.includes(x.split(':')[1]) && !/sample/.test(all)) {
          const nm = document.querySelector(`.weight-row`) ? '' : ''; const lab = (window.MQ_DATA.skills.find(s => s.c + ':' + s.v === x) || {}).l || x;
          if (!warn.includes(lab.replace(/\s*\((Visual|MAP)\)/, '').slice(0, 12))) bad.push(`${k} pages=${pg} lock=${lock}: ${x} gets 0 and no ⚠ names it`); } });
        if (lock && k === 'single') { const p0 = pl.counts[0] / pl.total * 100; if (Math.abs(p0 - lock) > 2 && !warn) bad.push(`single pages=${pg} lock=${lock}: held skill gets ${p0.toFixed(0)} % and no ⚠`); }
      }
      return bad;
    }, KINDS);
    n += 45; out.forEach(b => say('no silent 0', b));
    await ctx.close();
  }
  {
    const { p, ctx } = await open(1366, 'tray=grade3', 'quiz');
    const r = await p.evaluate(() => { const sm = MQ.summaryText(true); const pl = MQ.plan(true); const SK = {}; MQ_DATA.skills.forEach(s => { SK[s.c + ':' + s.v] = s; });
      const areas = new Set(MQ.S.tray.map(k => SK[k].a)); const hit = new Set(MQ.S.tray.filter(k => (pl.byKey[k] || 0) > 0).map(k => SK[k].a));
      return { line: sm.line, all: areas.size, hit: hit.size }; });
    n++;
    const m = r.line.match(/(\d+) of (\d+) areas|(\d+) areas?/);
    const said = m ? Number(m[1] || m[3]) : null;
    if (said !== r.hit) say('whole-grade quiz', `the summary says “${m ? m[0] : '?'}” but ${r.hit} of ${r.all} areas get a question`);
    await ctx.close();
  }
  // ---- 4. the tray bar
  const TRAYS = ['demo3x', `${FIVE},measurement:time_hour,fractions:shade_fraction,graphs:bar_graph`, 'demo10', 'demo160'];
  for (const w of WIDTHS) for (const v of VIEWS) for (const t of TRAYS) {
    const id = `tray bar ${t.length > 12 ? '8 skills' : t} ${v} @${w}`;
    const { p, ctx } = await open(w, `tray=${t}&tview=${v}`, 'skills');
    const r = await p.evaluate(() => {
      const tr = document.querySelector('.tray'); if (!tr) return null;
      const vis = (e) => e && e.offsetParent && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0;
      const chips = [...tr.querySelectorAll('.tray-chips .chip')].filter(vis);
      const areas = new Set([...tr.querySelectorAll('.tray-chips [data-domain], .tray-segs [data-domain]')].map(e => e.dataset.domain));
      const legend = vis(tr.querySelector('.tray-key'));
      const noArea = chips.filter(c => !c.querySelector('.tray-li-a') && !c.querySelector('.chip-area')).length;
      const rows = [...tr.querySelectorAll('.tray-chips, .tray-segs')].filter(vis);
      const hidden = rows.map(r => [...r.children].filter(c => !c.classList.contains('tray-more') && c.hidden).length).reduce((a, b) => a + b, 0);
      const more = rows.some(r => vis(r.querySelector('.tray-more')));
      return { chips: chips.length, areas: areas.size, legend, noArea, hidden, more, rowsShown: rows.length };
    });
    n++;
    if (!r) { say(id, 'no tray'); await ctx.close(); continue; }
    if (v === 'chips' && r.areas > 1 && r.noArea && !r.legend) say(id, `${r.noArea} of ${r.chips} chips carry no area name and there is no legend`);
    if (r.rowsShown && r.hidden && !r.more) say(id, `${r.hidden} hidden and no “+N” shown`);
    await ctx.close();
  }
  // ✓ and label: every selected option on the main screens and sheets, at every width
  for (const w of WIDTHS) for (const [q, h] of [['tray=demo3', 'skills'], ['tray=demo3', 'print'], ['tray=demo100&open=all', 'tray'], ['tray=demo3', 'quiz'], ['', 'lessons'], ['', 'classes']]) {
    const id = `✓ ${h} @${w}`;
    const { p, ctx } = await open(w, q, h);
    const bad = await p.evaluate(() => {
      const out = [];
      for (const b of document.querySelectorAll('.seg button[aria-pressed="true"], .pill[aria-pressed="true"]')) {
        if (!b.offsetParent) continue;
        const cs = getComputedStyle(b, '::before'); if (!cs.content || cs.content === 'none' || cs.content === 'normal') continue;
        const walker = document.createTreeWalker(b, NodeFilter.SHOW_TEXT); let first = null;
        for (let nd = walker.nextNode(); nd; nd = walker.nextNode()) { if (!nd.nodeValue.trim() || !nd.parentElement.offsetParent) continue; const rg = document.createRange(); rg.selectNodeContents(nd); const r = rg.getClientRects()[0]; if (r && r.width > 0) { first = r; break; } }
        if (!first) continue;
        const br = b.getBoundingClientRect(); const fs = parseFloat(cs.fontSize) || 12;
        const tickRight = cs.position === 'absolute' ? br.left + parseFloat(cs.left) + 0.75 * fs : null;
        if (tickRight !== null && tickRight + 2 > first.left) out.push(`“${b.textContent.trim().slice(0, 16)}” ✓ ends ${tickRight.toFixed(0)}, label starts ${first.left.toFixed(0)}`);
        if (cs.position !== 'absolute' && parseFloat(cs.marginRight) < 2) out.push(`“${b.textContent.trim().slice(0, 16)}” no gap after ✓`);
      }
      return out;
    });
    n++; bad.slice(0, 3).forEach(b => say(id, b));
    await ctx.close();
  }
  errs.forEach(e => say('console', e));
  await browser.close(); server.close();
  console.log(`views-check: ${n} states (views × kinds × widths)`);
  if (fails.length) { console.log(fails.slice(0, 60).map(f => '  ✗ ' + f).join('\n') + (fails.length > 60 ? `\n  … ${fails.length - 60} more` : '')); console.log(`views-check: FAIL (${fails.length})`); process.exit(1); }
  console.log('views-check: OK');
})().catch((e) => { console.error(e); console.log('views-check: FAIL (crashed)'); process.exit(1); });
