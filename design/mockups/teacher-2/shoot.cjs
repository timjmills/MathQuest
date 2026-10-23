// Teacher site 2.0 T1: screenshots, screen checks and the flow click-through for the clickable mock-up.
//   node design/mockups/teacher-2/shoot.cjs            every screen at 1366x768 and 390x844, light and dark -> shots/*.png,
//                                                      every §2.6 flow clicked -> flows-check.js, then index.html
//   node design/mockups/teacher-2/shoot.cjs --boards   also (re)draw the static reference pictures board-a.png and board-b.png
//   node design/mockups/teacher-2/shoot.cjs --no-shots only the checks and the flows (no PNGs written)
// Checks on every shot: no console error, no sideways scroll, at most one solid ink (primary) button you can see, the
// primary above the fold at 1366x768 where the screen has one, no two controls overlapping. Exit 1 on any failure.
// Fix round 2 (critic r2, stop rule §1.7) adds, at all five widths in light AND dark: no text clipped by its own box or a
// clipping ancestor (ellipsis included; a search box must show its placeholder's first words); every chip's skill name
// >= ~8 characters wide and never ellipsized while its row has room to give it a line; nothing spilling past its chip,
// card or box; no card / box / band title broken inside a word; every control >= 44 px tall (§2.8); the tick box never on
// a thumbnail's drawing; Skills from 820 px up with a search box >= 320 px, medium cards >= 200 px, first card by y 420;
// every skill card / chip / lesson row / lesson panel / chip-options header has exactly one grade badge, first in its
// content box, whole, >= 12 px, >= 4.5 : 1 (owner 2026-10-23).
const fs = require('fs');
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); }
const { startServer } = require('../../../tests/lib/ws-harness.cjs');
const FLOWS = require('./flows.js');

const DIR = __dirname; const SHOTS = path.join(DIR, 'shots');
const args = process.argv.slice(2); const NO_SHOTS = args.includes('--no-shots');
// quick runs while fixing: --only a,b (screen names) --widths 820,1024 --themes light --no-flows (no PNGs, no index then)
const argv = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1].split(',') : null; };
const ONLY = argv('--only'), WIDTHS = (argv('--widths') || ['1366', '1280', '1024', '820', '390']).map(Number), THEMES = argv('--themes') || ['light', 'dark'];
const QUICK = !!(ONLY || argv('--widths') || argv('--themes') || args.includes('--no-flows'));
const EXE = fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
const SIZES = { 1366: { width: 1366, height: 768 }, 1280: { width: 1280, height: 800 }, 1024: { width: 1024, height: 768 }, 820: { width: 820, height: 1180 }, 390: { width: 390, height: 844 } };
// Every screen is CHECKED at all five widths (§2.9: no sideways scroll at 1366 / 1280 / 1024 / 820 / 390, nothing clipped
// inside a panel, nothing hidden in a sideways strip). PNGs: the full set at 1366 and 390, light and dark; the middle
// widths in light for the screens whose layout changes there (MID_SHOTS).
const MID_SHOTS = new Set(['skills-tray', 'skills-tray6', 'lessons', 'lesson-panel', 'print-mixed', 'quiz', 'classes-progress', 'classes-quizzes', 'chip']);

// name, label, url (relative to teacher-2/), primary at 1366?, full page too?, only these widths/themes?
const SCREENS = [
  ['skills-empty', 'Skills, tray empty (opens here)', 'app.html#skills', false, true],
  ['skills-tray', 'Skills, 3 skills in the tray', 'app.html?tray=demo3#skills', true, true],
  ['skills-tray6', 'Skills, 6 skills in the tray', 'app.html?tray=addition:add_facts,measurement:time_hour,fractions:shade_fraction,subtraction:sub_facts,multiplication:arrays_groups,placevalue:expand#skills', true, false],
  ['tray-open', 'Tray opened (phone: “3 skills ▸”)', 'app.html?tray=demo3#trayopen', true, false],
  ['skills-search', 'Skills, a search across grades', 'app.html?tray=demo1&q=addition%20facts#skills', true, false],
  ['skills-list', 'Skills, List view', 'app.html?tray=demo3&view=list#skills', true, false],
  ['browse-wrm', 'Browse by White Rose step', 'app.html?browse=wrm#skills', false, false],
  ['browse-standard', 'Browse by Standard', 'app.html?browse=std#skills', false, false],
  ['browse-map', 'Browse by MAP strand', 'app.html?browse=map#skills', false, false],
  ['browse-sets', 'Browse by My sets', 'app.html?browse=sets#skills', false, false],
  ['print-single', 'Print: Single skill (1 skill)', 'app.html?tray=demo1#print', true, false],
  ['print-mixed', 'Print: Mixed practice (3 skills, the default)', 'app.html?tray=demo3#print', true, false],
  ['print-sections', 'Print: Sections, grouped by type', 'app.html?tray=demo3x&kind=sections&sections=grouped#print', true, false],
  ['print-parts', 'Print: Sections, exam-style parts', 'app.html?tray=demo3x&kind=sections&sections=parts#print', true, false],
  ['print-lesson', 'Print practice from a lesson (Sections + examples)', 'app.html?tray=lesson#print', true, false],
  ['print-more', 'Print: More options open', 'app.html?tray=demo3&more=1#print', true, false],
  ['quiz', 'Quiz from the tray', 'app.html?tray=demo3#quiz', true, false],
  ['quiz-buildfrom', 'Quiz with an empty tray: Build from', 'app.html#buildfrom', false, false],
  ['quiz-built', 'Quiz built from a standard', 'app.html?built=2.NBT.B.5&tray=addition:add_sub_10s,addition:add_sub_100s,placevalue:more_less_100#quiz', true, false],
  ['quiz-share', 'Quiz: Share with pupils', 'app.html?tray=demo3#quizshare', true, false],
  ['share', 'Share: code and link at once', 'app.html?tray=demo3#share', true, false],
  ['share-more', 'Share: More options (Quick Start link)', 'app.html?tray=demo3&more=1#share', true, false],
  ['chip', 'A chip’s own options (the skill’s real options)', 'app.html?tray=demo3#chip/addition:add_word_problems', true, false],
  ['chip-preset', 'A preset skill’s options (values already set)', 'app.html?tray=multiplication:mult_2by2_standard,measurement:time_hour#chip/multiplication:mult_2by2_standard', true, false],
  ['set-confirm', 'Opening a set when the tray has skills: use it or add it', 'app.html?tray=demo3&browse=sets&confirm=0#skills', true, false],
  ['board', 'Show on the board', 'app.html?tray=demo3#board', true, false],
  ['lessons', 'Lessons (opens where you were last)', 'app.html#lessons', true, true],
  ['lesson-panel', 'Lessons: the lesson panel (phone opens it full screen)', 'app.html#lessonpanel', true, false],
  ['lesson-print', 'Print lesson', 'app.html#lessonprint', true, false],
  ['classes', 'Classes: Run on the board', 'app.html#classes', true, true],
  ['classes-quizzes', 'Classes: Quizzes (my saved quizzes, results on this device)', 'app.html?ctab=quizzes#classes', false, true],
  ['classes-map', 'Classes: MAP tests', 'app.html?ctab=map#classes', true, false],
  ['classes-progress', 'Classes: Progress', 'app.html?ctab=progress#classes', false, false],
  ['profile', 'Profile menu', 'app.html#profile', false, false],
];

async function screenReport(page, w) {
  return page.evaluate((w) => {
    const out = { problems: [] };
    const vw = innerWidth, vh = innerHeight;
    if (document.documentElement.scrollWidth > vw + 1) out.problems.push(`sideways scroll: ${document.documentElement.scrollWidth}px wide`);
    const hit = (el) => { const r = el.getBoundingClientRect(); if (!r.width || !r.height) return false; const x = r.left + r.width / 2, y = r.top + r.height / 2; if (x < 0 || y < 0 || x > vw || y > vh) return false; const t = document.elementFromPoint(x, y); return !!t && (t === el || el.contains(t)); };
    // clipped inside a panel (overflow hidden) or hidden in a sideways strip (overflow auto/scroll), as the critic's probe
    for (const el of document.querySelectorAll('button, .btn, td, th')) {
      const r = el.getBoundingClientRect(); if (!r.width || el.closest('.page, .thumb, [hidden]')) continue;
      for (let e = el.parentElement; e; e = e.parentElement) {
        const cs = getComputedStyle(e); if (!/(hidden|auto|scroll|clip)/.test(cs.overflowX)) continue;
        const c = e.getBoundingClientRect(); if (r.right > c.right + 1 || r.left < c.left - 1) out.problems.push(`${/(auto|scroll)/.test(cs.overflowX) ? 'hidden in a sideways strip' : 'clipped'}: “${el.textContent.trim().slice(0, 24)}” by ${Math.round(Math.max(r.right - c.right, c.left - r.left))}px in .${String(e.className).split(' ')[0]}`);
        break;
      }
    }
    const prim = [...document.querySelectorAll('.btn-primary')].filter(hit);
    out.primaries = prim.length; out.primaryBottom = prim.length ? Math.round(prim[0].getBoundingClientRect().bottom) : null; out.primaryText = prim.map(p => p.textContent.trim()).join(' | ');
    if (prim.length > 1) out.problems.push(`${prim.length} primary buttons visible: ${out.primaryText}`);
    const ctl = [...document.querySelectorAll('button, a, input, summary')].filter(hit);
    const clip = (el) => { const r = el.getBoundingClientRect(); let o = { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; for (let e = el.parentElement; e; e = e.parentElement) { const cs = getComputedStyle(e); if (/(auto|scroll|hidden)/.test(cs.overflowX + cs.overflowY)) { const c = e.getBoundingClientRect(); o = { left: Math.max(o.left, c.left), top: Math.max(o.top, c.top), right: Math.min(o.right, c.right), bottom: Math.min(o.bottom, c.bottom) }; } } return o; };
    const layer = (el) => el.closest('.tray, .bottombar, .tray-sheet, .walk, .toast') ? 'fixed' : 'page';
    for (let i = 0; i < ctl.length; i++) for (let j = i + 1; j < ctl.length; j++) {
      const a = ctl[i], b = ctl[j]; if (a.contains(b) || b.contains(a) || layer(a) !== layer(b)) continue;
      const p = clip(a), q = clip(b);
      const ox = Math.min(p.right, q.right) - Math.max(p.left, q.left), oy = Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top);
      if (ox > 1 && oy > 1) out.problems.push(`overlap: “${a.textContent.trim().slice(0, 30)}” and “${b.textContent.trim().slice(0, 30)}”`);
    }
    // ---- fix round 2 (critic r2 A1/A2/A4/A5, stop rule §1.7): the checks that would have caught the tray and 820 defects ----
    const shown = (el) => { if (el.closest('.sr, [hidden], .page, .thumb, svg, details:not([open]) > :not(summary)')) return false; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    const say = (key, msg) => { (out.k = out.k || {}); (out.k[key] = out.k[key] || []).push(msg); };
    const txt = (el) => (el.innerText || el.textContent || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 28);
    // (1) text clipped: an element (or an ancestor that clips) cuts off its own text, or ellipsizes it
    for (const el of document.querySelectorAll('body *')) {
      if (!shown(el)) continue;
      const own = [...el.childNodes].some(n => n.nodeType === 3 && n.data.trim());
      if (!own && !el.matches('input')) continue;
      const cs = getComputedStyle(el);
      const clipsX = /(hidden|clip)/.test(cs.overflowX) || cs.textOverflow === 'ellipsis', clipsY = /(hidden|clip)/.test(cs.overflowY);
      if (el.matches('input') && el.placeholder && !el.value) {
        // a search box that shows only part of its own placeholder: measure the placeholder text with the input's font
        const c = document.createElement('canvas').getContext('2d'); c.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const need = c.measureText(el.placeholder.split(/[:,(“]/)[0].trim()).width, room = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        if (need > room + 1) say('text clipped', `placeholder “${el.placeholder.split(/[:,(“]/)[0].trim()}” in a ${Math.round(el.getBoundingClientRect().width)}px box`);
        continue;
      }
      if ((clipsX && el.scrollWidth > el.clientWidth + 1) || (clipsY && el.scrollHeight > el.clientHeight + 1)) { say('text clipped', `“${txt(el)}” (.${String(el.className).split(' ')[0] || el.tagName.toLowerCase()} ${el.scrollWidth}/${el.clientWidth})`); continue; }
      // an ancestor that clips cuts the text off
      const rg = document.createRange(); rg.selectNodeContents(el); const tr = rg.getBoundingClientRect();
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        const ac = getComputedStyle(a); const hx = /(hidden|clip)/.test(ac.overflowX), hy = /(hidden|clip)/.test(ac.overflowY);
        if (!hx && !hy) continue; const ar = a.getBoundingClientRect();
        if ((hx && (tr.right > ar.right + 1 || tr.left < ar.left - 1)) || (hy && (tr.bottom > ar.bottom + 1 || tr.top < ar.top - 1))) { say('text clipped', `“${txt(el)}” cut by .${String(a.className).split(' ')[0]}`); break; }
      }
    }
    // (2) a chip's skill NAME: never narrower than ~8 characters, never ellipsized while its row could give it a line of its own
    for (const nm of document.querySelectorAll('.chip .name')) {
      if (!shown(nm)) continue; const chip = nm.closest('.chip'); const fs = parseFloat(getComputedStyle(nm).fontSize);
      if (nm.clientWidth < 4 * fs) say('chip name too narrow', `“${nm.textContent.slice(0, 24)}” ${nm.clientWidth}px (< 8 characters)`);
      else if (nm.scrollWidth > nm.clientWidth + 1) { const par = chip.parentElement, pcs = getComputedStyle(par); const room = par.clientWidth - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight); if (chip.getBoundingClientRect().width < room - 2) say('chip name ellipsized', `“${nm.textContent.slice(0, 24)}” (row has ${Math.round(room)}px)`); }
    }
    // (3) nothing spills past its chip, card or box
    for (const box of document.querySelectorAll('.chip, .card, .box, .sect-box, .weight-row, .tray-chips')) {
      if (!shown(box) && !box.matches('.card')) continue; const b = box.getBoundingClientRect(); if (!b.width) continue;
      for (const d of box.querySelectorAll('*')) {
        if (d.closest('.thumb, svg, .sr') || !d.getBoundingClientRect().width) continue; const r = d.getBoundingClientRect();
        if (r.right > b.right + 1 || r.left < b.left - 1 || r.bottom > b.bottom + 1 || r.top < b.top - 1) { say('spills out of its box', `“${txt(d)}” out of .${String(box.className).split(' ')[0]} by ${Math.round(Math.max(r.right - b.right, b.left - r.left, r.bottom - b.bottom, b.top - r.top))}px`); break; }
      }
    }
    // (4) a card or box title never breaks inside a word (a break after a hyphen or a slash is a normal line break)
    for (const el of document.querySelectorAll('.card-name, .box h3, .band, .panel-band h2, .sheet-head h2, .kind b')) {
      if (!el.getBoundingClientRect().width || el.closest('[hidden]')) continue;
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n, bad = null;
      while (!bad && (n = w.nextNode())) { const re = /[^\s\-‐‑/]{2,}/g; let m; while ((m = re.exec(n.data))) { const rg = document.createRange(); rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length); const tops = new Set([...rg.getClientRects()].filter(x => x.width > 0).map(x => Math.round(x.top))); if (tops.size > 1) { bad = m[0]; break; } } }
      if (bad) say('word broken across lines', `“${bad}” in “${txt(el)}”`);
    }
    // (5) controls >= 44 px tall (§2.8)
    for (const el of document.querySelectorAll('button, a.btn, input:not([type=hidden]), select, summary, [role=tab]')) {
      if (!shown(el)) continue; const r = el.getBoundingClientRect();
      if (r.height < 43.5) say('control under 44px', `“${txt(el)}” ${Math.round(r.height)}px`);
    }
    // (6) the tick box never sits on the thumbnail's drawing
    for (const c of document.querySelectorAll('.card')) {
      const t = c.querySelector('.tick span'), th = c.querySelector('.thumb'); if (!t || !th || !th.getBoundingClientRect().width) continue; const tr = t.getBoundingClientRect();
      for (const e of th.querySelectorAll('svg *, span, div, b, i')) {
        if (e.children.length && e.tagName !== 'text') continue; const er = e.getBoundingClientRect(); if (er.width < 2 || er.height < 2) continue;
        const ox = Math.min(tr.right, er.right) - Math.max(tr.left, er.left), oy = Math.min(tr.bottom, er.bottom) - Math.max(tr.top, er.top);
        if (ox > 2 && oy > 2) { say('tick on the drawing', `“${txt(c.querySelector('.card-name'))}”`); break; }
      }
    }
    // (7) Skills from 820 up: the search box is usable, cards are at least 200 px, the first card is high on the page
    if (vw >= 820 && document.querySelector('.head-skills') && !document.querySelector('.sheet, .board')) {
      const s = document.querySelector('.head-skills .search input'); if (s && s.getBoundingClientRect().width < 320) say('skills layout', `search box ${Math.round(s.getBoundingClientRect().width)}px wide`);
      const cards = [...document.querySelectorAll('.grid[data-view="medium"] .card, .grid[data-view="big"] .card')].filter(c => c.getBoundingClientRect().width);
      const thin = cards.filter(c => c.getBoundingClientRect().width < 200); if (thin.length) say('skills layout', `${thin.length} cards under 200px (${Math.round(thin[0].getBoundingClientRect().width)}px)`);
      const first = window.MQ && window.MQ.S.browse === 'area' && !window.MQ.S.q.trim() ? document.querySelector('#skill-list .card') : null;   // the default view if (first && first.getBoundingClientRect().top + scrollY > 420) say('skills layout', `first card at y ${Math.round(first.getBoundingClientRect().top + scrollY)}`);
    }
    // (8) the GRADE badge (owner 2026-10-23): every skill card, chip, lesson row, lesson panel and chip-options header
    //     carries exactly one, first in its content box (the fixed slot), whole, >= 12 px and >= 4.5 : 1, never an area colour
    const rgbOf = (c) => (c.match(/[\d.]+/g) || []).slice(0, 4).map(Number);
    const L = (c) => { const [r, g, b] = rgbOf(c).map(v => v / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
    const hosts = [...document.querySelectorAll('[data-domain].card[data-act="tick"], [data-domain].chip, [data-domain].lesson, [data-grade-host]')];
    for (const h of hosts) {
      if (!shown(h) && !h.matches('.card')) continue; if (!h.getBoundingClientRect().width) continue;
      if (!h.hasAttribute('data-grade-host')) { say('grade badge', `“${txt(h)}” is not a grade host`); continue; }
      const own = [...h.querySelectorAll('.gbadge')].filter(b => b.closest('[data-grade-host]') === h);
      if (own.length !== 1) { say('grade badge', `“${txt(h)}” has ${own.length} badges`); continue; }
      const b = own[0], br = b.getBoundingClientRect(), hr = h.getBoundingClientRect(), cs = getComputedStyle(h), bs = getComputedStyle(b);
      const left = hr.left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft);
      if (Math.abs(br.left - left) > 2) say('grade badge', `“${txt(h)}”: badge ${Math.round(br.left - left)}px from the start slot`);
      if (b.scrollWidth > b.clientWidth + 1 || br.right > hr.right + 1 || br.bottom > hr.bottom + 1 || !br.width) say('grade badge', `“${txt(h)}”: badge clipped`);
      if (parseFloat(bs.fontSize) < 12) say('grade badge', `“${txt(h)}”: ${bs.fontSize} type`);
      const fgL = L(bs.color), bgc = rgbOf(bs.backgroundColor); const bgL = bgc.length === 4 && bgc[3] === 0 ? 1 : L(bs.backgroundColor);
      const ratio = (Math.max(fgL, bgL) + 0.05) / (Math.min(fgL, bgL) + 0.05); if (ratio < 4.5) say('grade badge', `“${txt(h)}”: ${ratio.toFixed(2)} : 1`);
      if (!b.textContent.trim()) say('grade badge', `“${txt(h)}”: empty badge`);
    }
    for (const [k, list] of Object.entries(out.k || {})) out.problems.push(`${k} ×${list.length}: ${list.slice(0, 3).join('; ')}`);
    out.small = ctl.filter(el => { const r = el.getBoundingClientRect(); return el.matches('button:not(.card):not(.tick), .btn') && (r.height < 36 || r.width < 36) && !el.closest('.page'); }).map(el => el.textContent.trim().slice(0, 20));
    out.height = document.documentElement.scrollHeight;
    return out;
  }, w);
}

async function runFlow(browser, base, f, w) {
  const page = await browser.newPage({ viewport: SIZES[w] });
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errors.push(m.text()); });
  await page.goto(`${base}/design/mockups/teacher-2/app.html${f.start ? '?' + f.start : ''}#skills`, { waitUntil: 'networkidle' });
  const acts = (w < 820 && f.narrow) || f.actions;
  let actions = 0, scrolls = 0, error = '';
  for (const a of acts) {
    const sel = a.click || a.type;
    const state = await page.evaluate((sel) => {
      const vis = [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height && getComputedStyle(e).visibility !== 'hidden' && e.offsetParent !== null || (r.width && getComputedStyle(e).position === 'fixed'); });
      if (!vis.length) return { found: false };
      const el = vis[0]; document.querySelectorAll('[data-flow-target]').forEach(x => x.removeAttribute('data-flow-target')); el.setAttribute('data-flow-target', '1');
      const r = el.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const t = (x >= 0 && y >= 0 && x <= innerWidth && y <= innerHeight) ? document.elementFromPoint(x, y) : null;
      return { found: true, inView: !!t && (t === el || el.contains(t)) };
    }, sel);
    if (!state.found) { error = `no visible ${sel}`; break; }
    if (!state.inView) { scrolls++; actions++; await page.evaluate(() => document.querySelector('[data-flow-target]').scrollIntoView({ block: 'center' })); await page.waitForTimeout(50); }
    const loc = page.locator('[data-flow-target]');
    if (a.type) await loc.fill(a.text); else await loc.click();
    actions++;
    await page.waitForTimeout(60);
  }
  const fin = await page.evaluate(() => ({ last: window.MQ.S.last, sheet: window.MQ.S.sheet, kind: window.MQ.plan().k }));
  const steps = Math.max(...acts.map(a => a.step));
  const maxPlan = Math.max(...String(w < 820 && f.narrowPlan ? f.narrowPlan : f.plan.actions).match(/\d+/g).map(Number));
  if (!error && f.done && fin.last !== f.done) error = `ended with ${fin.last}, wanted ${f.done}`;
  if (!error && f.doneSheet && fin.sheet !== f.doneSheet) error = `ended on ${fin.sheet}, wanted ${f.doneSheet}`;
  if (!error && f.expectKind && fin.kind !== f.expectKind) error = `kind ${fin.kind}, wanted ${f.expectKind}`;
  if (!error && actions > maxPlan) error = `${actions} actions > plan ${f.plan.actions}`;
  if (!error && steps > 4) error = `${steps} steps > 4`;
  if (!error && errors.length) error = errors.join('; ');
  await page.close();
  return { actions, scrolls, steps, ok: !error, error };
}

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const { server, base } = await startServer();
  const browser = await chromium.launch({ executablePath: EXE });
  let failed = 0, checked = 0; const shots = [];
  try {
    for (const b of ['a', 'b']) if (args.includes('--boards') || !fs.existsSync(path.join(DIR, `board-${b}.png`))) {
      const p = await browser.newPage({ viewport: { width: 1024, height: 700 } });
      await p.goto(`${base}/design/mockups/teacher-2/board-${b}-source.html`, { waitUntil: 'networkidle' });
      await (await p.$('#b')).screenshot({ path: path.join(DIR, `board-${b}.png`) }); await p.close();
      console.log(`board-${b}.png drawn`);
    }
    for (const [name, label, url, primary, full] of SCREENS) {
      if (ONLY && !ONLY.includes(name)) continue;
      for (const w of WIDTHS) for (const theme of THEMES) {
        const page = await browser.newPage({ viewport: SIZES[w] });
        const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errors.push(m.text()); });
        const u = url.includes('?') ? url.replace('?', `?theme=${theme}&`) : url.replace('app.html', `app.html?theme=${theme}`);
        await page.goto(`${base}/design/mockups/teacher-2/${u}`, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(150);
        const rep = await screenReport(page, w);
        if (errors.length) rep.problems.push('console: ' + errors.join('; '));
        if (w === 1366 && primary && (rep.primaries !== 1 || rep.primaryBottom > 768)) rep.problems.push(`primary action not above the fold at 1366x768 (${rep.primaries} visible, bottom ${rep.primaryBottom})`);
        const file = `${name}-${w}-${theme}.png`;
        const keep = !QUICK && (w === 1366 || w === 390 || (MID_SHOTS.has(name) && theme === 'light'));
        if (!NO_SHOTS && keep) await page.screenshot({ path: path.join(SHOTS, file) });
        let fullFile = null;
        if (full && keep && (w === 1366 || w === 390) && rep.height > SIZES[w].height + 40 && !NO_SHOTS) { fullFile = `${name}-${w}-${theme}-full.png`; await page.screenshot({ path: path.join(SHOTS, fullFile), fullPage: true }); }
        if (keep) shots.push({ name, label, w, theme, file, fullFile, primary: rep.primaryText, problems: rep.problems });
        else checked++;
        const tag = rep.problems.length ? 'FAIL' : 'ok  ';
        if (rep.problems.length) failed++;
        console.log(`${tag} ${file.padEnd(36)} primary: ${(rep.primaryText || '—').padEnd(22)} ${rep.problems.join(' · ')}${rep.small.length ? ' (small: ' + rep.small.join(', ') + ')' : ''}`);
        await page.close();
      }
    }
    // the flows
    const results = {};
    console.log('\nflows (actions incl. needed scrolls / steps):');
    if (!QUICK) for (const f of FLOWS) for (const w of [1366, 390]) {
      const r = await runFlow(browser, base, f, w); results[`${f.id}@${w}`] = r;
      if (!r.ok) failed++;
      console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${f.id.padEnd(16)} @${w}  ${r.actions} actions${r.scrolls ? ` (${r.scrolls} scroll)` : ''}, ${r.steps} steps   plan ${f.plan.actions} · today ${f.plan.today}${r.error ? '  ' + r.error : ''}`);
    }
    if (!QUICK) fs.writeFileSync(path.join(DIR, 'flows-check.js'), `// GENERATED by shoot.cjs: the flows as clicked in the mock-up.\nwindow.MQ_FLOW_CHECK = ${JSON.stringify({ when: new Date().toISOString().slice(0, 10), results }, null, 1)};\n`);
    if (!NO_SHOTS && !QUICK) writeIndex(shots, results);
  } finally { await browser.close(); server.close(); }
  console.log(failed ? `\nshoot: FAIL (${failed})` : `\nshoot: OK (${shots.length} pictures + ${checked} more checks at 1280 / 1024 / 820, ${FLOWS.length * 2} flow runs)`);
  process.exit(failed ? 1 : 0);
})();

function writeIndex(shots, results) {
  const flowRows = FLOWS.map(f => { const a = results[f.id + '@1366'], b = results[f.id + '@390']; const steps = Math.max(...f.actions.map(x => x.step)); return `<tr><td>${f.task}</td><td class="n">${steps}</td><td class="n">${a ? a.actions : '—'} / ${b ? b.actions : '—'}</td><td class="n">${f.plan.actions}</td><td class="n">${f.plan.today}</td><td><a href="app.html?walk=${f.id}${f.start ? '&' + f.start : ''}">Walk it</a></td></tr>`; }).join('');
  const groups = [...new Set(shots.map(s => s.name))];
  const tiles = shots.map(s => `<a class="shot ${s.w === 390 ? 'narrow' : ''}" data-w="${s.w}" data-theme="${s.theme}" href="shots/${s.fullFile || s.file}"><img loading="lazy" src="shots/${s.file}" alt="${s.label}, ${s.w} px, ${s.theme}"><span><b>${s.label}</b><br>${s.w} px · ${s.theme}${s.fullFile ? ' · opens the full page' : ''}</span></a>`).join('');
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Teacher Site 2.0</title>
<script>(function(){var t=new URLSearchParams(location.search).get('theme');if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);})();</script>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Fraunces:ital,opsz,wght@1,9..144,500&family=Inter:wght@500;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="tokens.css"><link rel="stylesheet" href="docs.css"></head>
<body><div class="doc">
<p class="eyebrow">Maths Quest · Teacher site 2.0 · T1 · ${new Date().toISOString().slice(0, 10)}</p>
<h1>The clickable mock-up</h1>
<p class="serif">Find skills, tick them, then Print, Quiz or Share.</p>
<p class="lead">Every job in 3 or 4 steps. Colour means the maths area (board C, the look of the school’s maths site); the one main action on each screen is solid warm ink.</p>
<div class="top"><a class="btn btn-primary" href="app.html">Open the mock-up</a></div>
<div class="tiles">
  <a class="tile" href="app.html"><b>The mock-up</b><span>Skills (opens here) with the tray, the worksheet sheet, Quiz, Share, Lessons, Classes and the profile menu. Works at any width; Theme is in the profile menu, or add ?theme=dark.</span></a>
  <a class="tile" href="flows.html"><b>The flows</b><span>Each job with its steps and clicks, today’s count beside it, and a “Walk it” button that shows each click in the mock-up.</span></a>
  <a class="tile" href="palette.html"><b>Colour: board C</b><span>Eight maths areas in four strengths, light and dark, the colour-blind check, where each colour moved from the site, and boards B and A as reference pictures.</span></a>
  <a class="tile" href="thumbs.html"><b>Every skill’s thumbnail</b><span>All 715 live skills with the drawing their card shows, picked by category and skill id; <code>thumbs-check.cjs</code> holds each to its name.</span></a>
  <a class="tile" href="files.html"><b>Teacher files: live and branches</b><span>Which teacher files are live, which are only on a branch, and what T2–T6 does with each (STATUS §7).</span></a>
</div>
<h2>The flows at a glance</h2>
<div class="scroll"><table><thead><tr><th>Task</th><th>Steps</th><th>Clicked 1366 / 390</th><th>Plan</th><th>Today</th><th></th></tr></thead><tbody>${flowRows}</tbody></table></div>
<p class="note">Clicked = actions counted by shoot.cjs in this mock-up (clicks, typed searches and any scroll it needed).</p>
<h2>Every screen</h2>
<p class="note">${groups.length} screens × 1366 and 390 px × light and dark, plus the screens whose layout changes at 1280, 1024 and 820 px. Every screen is also checked at all five widths (no sideways scroll, nothing clipped, nothing hidden in a sideways strip). Each picture opens full size; the screens that scroll open the full page.</p>
<div class="filter" role="group" aria-label="Show"><button data-f="all" aria-pressed="true">All</button><button data-f="1366" aria-pressed="false">1366 px</button><button data-f="1280" aria-pressed="false">1280</button><button data-f="1024" aria-pressed="false">1024</button><button data-f="820" aria-pressed="false">820</button><button data-f="390" aria-pressed="false">390 px</button><button data-f="light" aria-pressed="false">Light</button><button data-f="dark" aria-pressed="false">Dark</button></div>
<div class="shots" id="shots">${tiles}</div>
</div>
<script>
document.querySelector('.filter').addEventListener('click', function (e) {
  var b = e.target.closest('button'); if (!b) return; var f = b.dataset.f;
  document.querySelectorAll('.filter button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
  document.querySelectorAll('.shot').forEach(function (s) { s.hidden = !(f === 'all' || s.dataset.w === f || s.dataset.theme === f); });
});
</script>
</body></html>
`;
  fs.writeFileSync(path.join(DIR, 'index.html'), html);
}
