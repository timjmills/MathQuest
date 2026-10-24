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
// Fix round 4 (critic r4) adds: every control >= 44 px WIDE too (close buttons squeezed by long titles); a quiz sheet's
// How many questions equals its summary; preview cells are drawn live from their own skill; the phone tray popup
// shows >= 6 skill rows on its first 390 × 844 screen (rows <= 56 px, ✕ on the name's line, headers <= 64 px); the print
// sheet keeps 3 pages and Examples after close → tick a skill → Print; Grade 2 (all areas) · More reaches every grade-2
// skill; and the two search boxes answer "2.NBT.5", "2.NBT.B.5", "within 1000", "time", "clocks", "add within 20",
// "fractoins" and (tray) "3.NF.1" through the app's own finder; every thumbnail shown keeps its text >= its place's minimum
// (Big 12, Medium 11, Small 9 px); and Each page (same problems / same page again) repeats page 1's plan.
const fs = require('fs');
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); }
const { startServer } = require('../../../tests/lib/ws-harness.cjs');
const FLOWS = require('./flows.js');
// fix round 5: the thumbnails on screen are drawn live by the app (live.mjs); wait until those in or near view are drawn
async function waitThumbs(page) {
  await page.evaluate(async () => {
    for (let t = 0; t < 100 && !window.MQLive; t++) await new Promise(r => setTimeout(r, 50)); if (!window.MQLive) return;
    for (let t = 0; t < 1200; t++) {
      // what the renderer will draw: in the viewport (with its 300 px margin) AND inside every box that clips it (a
      // thumbnail scrolled out of the popup's list is not drawn until it scrolls in, so it is not waited for)
      const inClips = (h, r) => { for (let e = h.parentElement; e && e !== document.body; e = e.parentElement) { const cs = getComputedStyle(e); if (/(auto|scroll|hidden|clip)/.test(cs.overflowX + cs.overflowY)) { const c = e.getBoundingClientRect(); if (r.bottom < c.top || r.top > c.bottom || r.right < c.left || r.left > c.right) return false; } } return true; };
      const pending = [...document.querySelectorAll('.live-thumb')].filter(h => { const r = h.getBoundingClientRect(); return (h.dataset.state === 'wait' || h.dataset.state === 'busy') && r.width > 0 && r.bottom > -300 && r.top < innerHeight + 300 && (h.dataset.state === 'busy' || inClips(h, r)); });
      if (!pending.length) break; await new Promise(r => setTimeout(r, 50));
    }
    await new Promise(r => requestAnimationFrame(() => r()));
  });
}

const DIR = __dirname; const SHOTS = path.join(DIR, 'shots');
const args = process.argv.slice(2); const NO_SHOTS = args.includes('--no-shots');
// quick runs while fixing: --only a,b (screen names) --widths 820,1024 --themes light --no-flows (no PNGs, no index then)
const argv = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1].split(',') : null; };
const FLOWS_ONLY = args.includes('--flows-only');   // quick: only click the flows (no screens, no files written)
const ONLY = FLOWS_ONLY ? ['none'] : argv('--only'), WIDTHS = (argv('--widths') || ['1366', '1280', '1024', '820', '390']).map(Number), THEMES = argv('--themes') || ['light'];   // dark mode parked (owner 2026-10-23): light only
const QUICK = !!(ONLY || argv('--widths') || argv('--themes') || args.includes('--no-flows'));
const EXE = fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
const SIZES = { 1366: { width: 1366, height: 768 }, 1280: { width: 1280, height: 800 }, 1024: { width: 1024, height: 768 }, 820: { width: 820, height: 1180 }, 390: { width: 390, height: 844 } };
// Every screen is CHECKED at all five widths (§2.9: no sideways scroll at 1366 / 1280 / 1024 / 820 / 390, nothing clipped
// inside a panel, nothing hidden in a sideways strip). PNGs: the full set at 1366 and 390, light and dark; the middle
// widths in light for the screens whose layout changes there (MID_SHOTS).
const MID_SHOTS = new Set(['skills-grade', 'tray-pop-open', 'print-grade', 'skills-tray', 'skills-tray6', 'lessons', 'lesson-panel', 'print-mixed', 'quiz', 'classes-progress', 'classes-quizzes', 'chip']);

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
  // fix round 3: big trays (owner 2026-10-23: 40–100+ skills, a whole grade)
  ['skills-tray10', 'Skills, 10 skills: the summary bar', 'app.html?tray=demo10#skills', true, false],
  ['skills-grade', 'Skills, a whole grade in the tray (Grade 3, 110 skills)', 'app.html?tray=grade3&grade=3#skills', true, false],
  ['skills-grades', 'Skills, two whole grades in the tray (200 skills)', 'app.html?tray=grades2-3#skills', true, false],
  ['tray-pop', 'The tray popup: by area, then grade (areas closed)', 'app.html?tray=grades2-3#tray', true, false],
  ['tray-pop-open', 'The tray popup, every area open', 'app.html?tray=grades2-3&open=all#tray', true, false],
  ['tray-pop-sel', 'The tray popup: a selection and the bulk bar', 'app.html?tray=grade3&open=NF&sel=g:NF|3#tray', true, false],
  ['tray-pop-detailed', 'The tray popup, Detailed weights: Fractions held at 40 %', 'app.html?tray=grade3&open=NF&detailed=1&lockp=a:NF:40#tray', true, false],
  ['tray-pop-50', 'Detailed: one skill held at 50 %, the rest split evenly', 'app.html?tray=demo64&pages=5&detailed=1&tq=add%201000%20story&lockp=k:addition:add_wp_1k:50#tray', true, false],
  ['print-grade', 'Print a whole grade: Mixed, every skill at least once', 'app.html?tray=grade3#print', true, false],
  ['print-grade-single', 'Print a whole grade on Single skill: the warning', 'app.html?tray=grade3&kind=single#print', true, false],
  ['print-grade-sections', 'Print a whole grade on Sections: one section per area', 'app.html?tray=grade3&kind=sections#print', true, false],
  ['quiz-grade', 'Quiz from a whole grade: 20 questions, a sample', 'app.html?tray=grade3#quiz', true, false],
  ['share-grade', 'Share a whole grade: the short grade code', 'app.html?tray=grade3#share', true, false],
  ['tray-view-list', 'The tray popup, List view (the default)', 'app.html?tray=grade3&open=NF&tview=list#tray', true, false],
  ['tray-view-chips', 'The tray popup, Chips view', 'app.html?tray=grade3&open=NF&tview=chips#tray', true, false],
  ['tray-view-thumbs', 'The tray popup, Thumbnails view', 'app.html?tray=grade3&open=NF&tview=thumbs#tray', true, false],
  ['skills-tray-chips', 'Skills, 3 skills, the tray bar in Chips view', 'app.html?tray=demo3&tview=chips#skills', true, false],
  ['skills-tray-thumbs', 'Skills, 3 skills, the tray bar in Thumbnails view', 'app.html?tray=demo3&tview=thumbs#skills', true, false],
  // owner 2026-10-23: several pages of the same set
  ['print-same', 'Print: 3 pages, the same problems with new numbers', 'app.html?tray=demo3&pages=3&each=same#print', true, false],
  ['print-copies', 'Print: 3 copies of the same page (one key)', 'app.html?tray=demo3&pages=3&each=copy#print', true, false],
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
    // (5) controls >= 44 px tall (§2.8); fix round 4 (critic r4 A4): and >= 44 px WIDE, so a long title can never squeeze a
    //     close button, an icon button or a stepper key below the target (measured at every width, light and dark)
    for (const el of document.querySelectorAll('button, a.btn, input:not([type=hidden]), select, summary, [role=tab]')) {
      if (!shown(el)) continue; const r = el.getBoundingClientRect();
      if (r.height < 43.5) say('control under 44px', `“${txt(el)}” ${Math.round(r.height)}px`);
      else if (r.width < 43.5 && !el.matches('input[type=checkbox], input[type=radio]')) say('control under 44px wide', `“${txt(el) || el.className}” ${Math.round(r.width)}px`);
    }
    // (10) lead 2026-10-23: a real item in a thumbnail is readable. The smallest text each shown thumbnail SHOWS is at least
    //      its place's minimum (--smp-min: Big 12 px, Medium and the tray's Thumbnails 11, Small 9); page previews and
    //      the bar's mini picture (0) are miniatures of a printed page and are not held to it
    // fix round 6: an SVG's own labels are held to the drawing floor (--smp-min-draw) by thumbs-check, prose to --smp-min here
    // fix round 5: thumbnails are drawn live by the app (live.mjs); each drawn one carries its measures (__mq), scale and
    // window, so what it SHOWS is read exactly as thumbs-check.cjs reads it
    for (const t of document.querySelectorAll('.live-thumb')) {
      const min = parseFloat(getComputedStyle(t).getPropertyValue('--smp-min')) || 0; const vis = t.getBoundingClientRect();
      if (vis.width < 4 || vis.bottom < 0 || vis.top > vh) continue;
      if (t.dataset.state === 'error' || t.dataset.state === 'none') { say('thumbnail not drawn', `${t.dataset.k}: ${t.dataset.state} ${t.dataset.err || ''}`); continue; }
      // owner ruling HD-5a: no strand-tab box (Level / strand / lesson) on any worksheet, so none in a thumbnail or preview
      if (t.shadowRoot && [...t.shadowRoot.querySelectorAll('.ws-tabbox, [data-ws-label="tab"]')].some(e => getComputedStyle(e).visibility !== 'hidden' && e.getBoundingClientRect().width > 0)) say('strand tab shown', t.dataset.k);
      if (!min || t.dataset.state !== 'done' || !t.__mq) continue;
      const sc = Number(t.dataset.scale), win = t.dataset.win.split(' ').map(Number); let low = 1e9, lowT = '';
      for (const x of t.__mq.texts) { const [X, Y, W, H] = x.r; if (X < win[0] + win[2] && X + W > win[0] && Y < win[1] + win[3] && Y + H > win[1] && !x.svg && x.fs * sc < low) { low = x.fs * sc; lowT = x.t.slice(0, 14); }
        if (x.lefts.some(L => L < win[0] - 0.5 && L + 1 < win[0] + win[2]) && Y < win[1] + win[3] && Y + H > win[1]) say('thumbnail line cut at its start', `${t.dataset.k}: “${x.t.slice(0, 16)}”`); }
      if (low < min - 0.05) say('thumbnail text too small', `${t.dataset.k}: ${low.toFixed(1)}px “${lowT}” (min ${min})`);
    }
    // fix round 5 (critic r5 D2, §2.7 "selected = fill + ✓ + ring"): every selected segmented option and pill shows a ✓ and
    // a fill, not only a thicker ring
    for (const b of document.querySelectorAll('.seg button[aria-pressed="true"], .pill[aria-pressed="true"]')) {
      if (!shown(b)) continue;
      const tick = /✓/.test(getComputedStyle(b, '::before').content) || !!b.querySelector('svg.icon, .icon');
      const sib = [...b.parentElement.children].find(x => x !== b && x.getAttribute('aria-pressed') === 'false');
      const bg = getComputedStyle(b).backgroundColor, bg0 = sib ? getComputedStyle(sib).backgroundColor : getComputedStyle(b.parentElement).backgroundColor;
      if (!tick) say('selected without ✓', `“${b.textContent.trim().slice(0, 20)}”`);
      if (bg === bg0) say('selected without a fill', `“${b.textContent.trim().slice(0, 20)}”`);
    }
    // (9) fix round 4 (critic r4 C3): a quiz sheet's How many questions equals the questions its summary line counts
    const qn = document.querySelector('[data-act="qn"]');
    if (qn && shown(qn)) { const n = Number(qn.closest('.stepper').querySelector('output').textContent); const line = (document.querySelector('[data-summary]') || {}).textContent || '';
      const m = line.match(/(\d+) questions/); if (!m || Number(m[1]) !== n) say('quiz count', `stepper ${n}, summary “${line.slice(0, 50)}”`); }
    // (6) the tick box never sits on the thumbnail's drawing
    for (const c of document.querySelectorAll('.card')) {
      const t = c.querySelector('.tick span'), th = c.querySelector('.thumb'); if (!t || !th || !th.getBoundingClientRect().width) continue; const tr = t.getBoundingClientRect();
      for (const e of th.querySelectorAll('svg *, span, div, b, i')) {
        if (e.children.length && e.tagName !== 'text') continue; const er0 = e.getBoundingClientRect(), thr = th.getBoundingClientRect();
        // only the part of the drawing that is SHOWN (a sample's cell runs on past its window, out of sight)
        const er = { left: Math.max(er0.left, thr.left), top: Math.max(er0.top, thr.top), right: Math.min(er0.right, thr.right), bottom: Math.min(er0.bottom, thr.bottom) }; er.width = er.right - er.left; er.height = er.bottom - er.top; if (er.width < 2 || er.height < 2) continue;
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
    // fix round 3 (critic r3 A2): a badge on every skill card and chip; on a lesson row only in a list across grades (a
    // search), because a one-grade list says the grade once in its header and the step number is what is scanned for
    const hosts = [...document.querySelectorAll('[data-domain].card[data-act="tick"], [data-domain].chip, .lesson-hits [data-domain].lesson, [data-grade-host]')];
    for (const l of document.querySelectorAll('.lesson-list:not(.lesson-hits) .lesson')) if (l.querySelector('.gbadge')) say('grade badge', `“${txt(l)}”: a badge on a row of a one-grade list`);
    for (const h of hosts) {
      if (!shown(h) && !h.matches('.card')) continue; if (!h.getBoundingClientRect().width) continue;
      // fix round 5 (critic r5 A5): in a ONE-grade tray the popup says the grade once on its grade header, so its chips
      // carry none (as its List rows) — allowed only under a grade header that shows the badge
      if (h.hasAttribute('data-grade-said')) { const g = h.closest('.tp-grade'); if (!g || !g.querySelector('.tp-ghead .gbadge')) say('grade badge', `“${txt(h)}” has no badge and no grade header says its grade`); continue; }
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
    if (a.type) { await loc.fill(a.text); if (a.enter) await loc.press('Enter'); } else await loc.click();
    actions++;
    await page.waitForTimeout(60);
  }
  const fin = await page.evaluate((chk) => ({ last: window.MQ.S.last, sheet: window.MQ.S.sheet, kind: window.MQ.plan().k, check: chk ? !!eval(chk) : true }), f.check || null);
  const steps = Math.max(...acts.map(a => a.step));
  const maxPlan = Math.max(...String(w < 820 && f.narrowPlan ? f.narrowPlan : f.plan.actions).match(/\d+/g).map(Number));
  if (!error && f.done && fin.last !== f.done) error = `ended with ${fin.last}, wanted ${f.done}`;
  if (!error && f.doneSheet && fin.sheet !== f.doneSheet) error = `ended on ${fin.sheet}, wanted ${f.doneSheet}`;
  if (!error && f.expectKind && fin.kind !== f.expectKind) error = `kind ${fin.kind}, wanted ${f.expectKind}`;
  if (!error && !fin.check) error = `end state wrong (${f.check.slice(0, 60)})`;
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
  // fix round 5: pages run the app in a hidden frame to draw thumbnails live, so a big tray's preview keeps the network
  // busy for a while; every page gets a 120 s budget instead of 30 s
  { const np = browser.newPage.bind(browser); browser.newPage = async (o) => { const p = await np(o); p.setDefaultTimeout(120000); p.setDefaultNavigationTimeout(120000); return p; }; }
  let failed = 0, checked = 0; const shots = [];
  try {
    for (const b of ['a', 'b']) if (args.includes('--boards') || !fs.existsSync(path.join(DIR, `board-${b}.png`))) {
      const p = await browser.newPage({ viewport: { width: 1024, height: 700 } });
      await p.goto(`${base}/design/mockups/teacher-2/board-${b}-source.html`, { waitUntil: 'networkidle' });
      await (await p.$('#b')).screenshot({ path: path.join(DIR, `board-${b}.png`) }); await p.close();
      console.log(`board-${b}.png drawn`);
    }
    // the doc pages never scroll sideways either (critic r2: thumbs.html was 419 px wide at 390)
    if (!ONLY) for (const doc of ['index.html', 'flows.html', 'palette.html', 'thumbs.html', 'files.html']) for (const w of [390, 1366]) {
      const page = await browser.newPage({ viewport: SIZES[w] }); await page.goto(`${base}/design/mockups/teacher-2/${doc}`, { waitUntil: 'networkidle' }); await page.waitForTimeout(300);
      const sw = await page.evaluate(() => document.documentElement.scrollWidth); await page.close();
      if (sw > SIZES[w].width + 1) { failed++; console.log(`FAIL ${doc} @${w}: sideways scroll ${sw}px`); } else console.log(`ok   ${doc} @${w}`);
    }
    for (const [name, label, url, primary, full] of SCREENS) {
      if (ONLY && !ONLY.includes(name)) continue;
      for (const w of WIDTHS) for (const theme of THEMES) {
        const page = await browser.newPage({ viewport: SIZES[w] });
        const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errors.push(m.text()); });
        const u = url.includes('?') ? url.replace('?', `?theme=${theme}&`) : url.replace('app.html', `app.html?theme=${theme}`);
        await page.goto(`${base}/design/mockups/teacher-2/${u}`, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready); await waitThumbs(page); await page.waitForTimeout(150);
        const rep = await screenReport(page, w);
        if (errors.length) rep.problems.push('console: ' + errors.join('; '));
        if (w === 1366 && primary && (rep.primaries !== 1 || rep.primaryBottom > 768)) rep.problems.push(`primary action not above the fold at 1366x768 (${rep.primaries} visible, bottom ${rep.primaryBottom})`);
        const file = `${name}-${w}-${theme}.png`;
        const keep = (!QUICK || args.includes('--write')) && (w === 1366 || w === 390 || (MID_SHOTS.has(name) && theme === 'light'));
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
    // ---- fix round 3 (critic r3 A1 + owner 2026-10-23 "40–100 skills", stop rule §1.7: tray height was flagged before) ----
    // The tray never grows with the skills in it: ≤ 8 skills = one row of chips (+N more past what fits), more = one summary
    // bar. Height ≤ 96 px from 1100 px up, ≤ 120 px at 1024 and below, and never more than 15 % of the screen; measured
    // with 1, 3, 6, 8, 10, 40 and 100 skills at all five widths.
    if (!ONLY || ONLY.includes('tray-height')) for (const w of WIDTHS) {
      const page = await browser.newPage({ viewport: SIZES[w] });
      await page.goto(`${base}/design/mockups/teacher-2/app.html?theme=light#skills`, { waitUntil: 'networkidle' }); await page.evaluate(() => document.fonts.ready);
      for (const view of ['list', 'chips', 'thumbs']) for (const n of [1, 3, 6, 8, 10, 40, 100]) {
        const r = await page.evaluate(([n, view]) => {
          const S = window.MQ.S; const pool = MQ_DATA.skills.filter(s => !s.p && s.a !== 'WORDS');
          // a realistic tray: the first n skills of grades 2 and 3 (several areas), then any others
          // the worst case for one row: every next skill from another maths area (most legends, longest names)
          const byA = {}; pool.forEach(s => (byA[s.a] = byA[s.a] || []).push(s)); const lists = Object.values(byA); const pick = [];
          for (let i = 0; pick.length < pool.length; i++) for (const l of lists) if (l[i]) pick.push(l[i]);
          S.tray = pick.slice(0, n).map(s => s.c + ':' + s.v); S.sheet = null; S.tview = view; window.MQ.render();
          const t = document.querySelector('.tray'); const tr = t.getBoundingClientRect();
          const chips = [...t.querySelectorAll('.tray-chips > *')].filter(c => c.getBoundingClientRect().width && getComputedStyle(c).visibility !== 'hidden');
          const rows = new Set(chips.map(c => Math.round(c.getBoundingClientRect().top))).size;
          const summary = [...t.querySelectorAll('.tray-summary')].some(x => x.getBoundingClientRect().width > 0);
          // critic r5 A2: never "+N" alone. Every shown "+N" has a NAMED item before it (a chip / name, or an area segment
          // with its icon, a short name and its count), and from 820 px up a big tray's bar shows at least one named area
          const shown = (e) => e && e.getBoundingClientRect().width > 0 && getComputedStyle(e).display !== 'none' && !e.closest('[hidden]');
          const named = [...t.querySelectorAll('.tray-seg')].filter(g => shown(g) && [...g.querySelectorAll('.seg-long, .seg-abbr')].some(x => shown(x) && x.textContent.trim()) && shown(g.querySelector('b')) && shown(g.querySelector('.icon, svg'))
            && g.getBoundingClientRect().right <= g.parentElement.getBoundingClientRect().right + 1);
          const plusAlone = [...t.querySelectorAll('.tray-more')].filter(shown).some(m => ![...m.parentElement.children].some(c => c !== m && shown(c)));
          const segRow = [...t.querySelectorAll('.tray-segs')].some(shown);
          return { h: Math.round(tr.height), rows, chips: chips.length, summary, named: named.length, plusAlone, segRow };
        }, [n, view]);
        const lim = Math.min(w >= 1100 ? 96 : 120, SIZES[w].height * 0.15); const bad = [];
        if (r.h > lim) bad.push(`tray ${r.h}px > ${Math.round(lim)}px`);
        if (n <= 8 && w >= 820 && r.rows > 1) bad.push(`${r.rows} rows of chips (one row only)`);
        if (n > 8 && !r.summary) bad.push('no summary bar past 8 skills');
        if (r.plusAlone) bad.push('“+N” with nothing named before it');
        if (n > 8 && w >= 820 && r.named < 1) bad.push(`no named area segment in the bar${r.segRow ? '' : ' (the area row is gone)'}`);
        if (bad.length) failed++;
        console.log(`${bad.length ? 'FAIL' : 'ok  '} tray-height @${w} ${view.padEnd(6)} ${String(n).padStart(3)} skills: ${r.h}px, ${r.chips} chips in ${r.rows} row(s)${r.summary ? `, summary bar, ${r.named} named area(s)` : ''}${bad.length ? '  ' + bad.join('; ') : ''}`);
      }
      await page.close();
    }
    // critic r3 C3: the preview deals from the same plan as the summary line. Each preview cell names its skill
    // (data-skill); the cells of each shown page equal plan().perPage for that page, the pages add up to the summary's
    // counts, and no item repeats on a page — for Print and Quiz, Mixed / Single / Sections, at several weight settings.
    if (!ONLY || ONLY.includes('preview')) {
      const page = await browser.newPage({ viewport: SIZES[1366] });
      // weights are numbers (Less · Equal · More = 1 · 2 · 3, Detailed 0–10); locks are target %s on a skill, grade or area
      const AF = 'addition:add_facts', TH = 'measurement:time_hour', SF = 'fractions:shade_fraction';
      const cases = [
        ['print equal', 'app.html?tray=demo3x#print', {}],
        ['print add=More', 'app.html?tray=demo3x#print', { w: { [AF]: 3 } }],
        ['print time=Less, shade=More', 'app.html?tray=demo3x#print', { w: { [TH]: 1, [SF]: 3 } }],
        ['print 2 pages', 'app.html?tray=demo3x&pages=2#print', { w: { [AF]: 3 } }],
        ['print single, 3 skills', 'app.html?tray=demo3x&kind=single#print', {}],
        ['print sections', 'app.html?tray=demo3x&kind=sections#print', { w: { [TH]: 3 } }],
        ['quiz equal', 'app.html?tray=demo3#quiz', {}],
        ['quiz add=More', 'app.html?tray=demo3#quiz', { w: { 'addition:add_word_problems': 3 } }],
        ['print 10 skills', 'app.html?tray=demo10#print', {}],
        ['print a whole grade', 'app.html?tray=grade3#print', {}],
        ['quiz a whole grade', 'app.html?tray=grade3#quiz', {}],
        ['detailed: a weight 0', 'app.html?tray=demo3x#print', { w: { [TH]: 0, [AF]: 7 } }],
        ['detailed: shade held at 50 %', 'app.html?tray=demo3x&pages=2#print', { lock: { ['k:' + SF]: 50 } }],
        ['detailed: Fractions 40 % of grade 3', 'app.html?tray=grade3#print', { lock: { 'a:NF': 40 }, w: { 'measurement:time_hour': 0 } }],
        ['detailed: a grade held + a skill', 'app.html?tray=grades2-3#print', { lock: { 'g:OA|2': 30, 'k:FIRST': 10, 'k:LAST': 5 } }],
      ];
      for (const [label, url, set] of cases) {
        await page.goto(`${base}/design/mockups/teacher-2/${url}`, { waitUntil: 'networkidle' });
        const r = await page.evaluate((set) => {
          const M = window.MQ; const fix = (o) => Object.fromEntries(Object.entries(o || {}).map(([k, v]) => [k.replace('FIRST', M.S.tray[0]).replace('LAST', M.S.tray[M.S.tray.length - 1]), v]));
          set = { w: fix(set.w), lock: fix(set.lock) }; Object.assign(M.S.w, set.w); Object.assign(M.S.lock, set.lock); M.render();
          const p = M.plan(M.S.sheet === 'quiz'); const bad = [];
          if (p.errs && p.errs.length) bad.push('locks refused: ' + p.errs[0]);
          for (const [k, w] of Object.entries(set.w || {})) if (w === 0 && p.byKey[k]) bad.push(`${k} has weight 0 but ${p.byKey[k]} problems`);
          for (const [sc, v] of Object.entries(set.lock || {})) { const ks = M.S.tray.filter(k => sc.startsWith('k:') ? k === sc.slice(2) : sc.startsWith('a:') ? MQ_DATA.skills.find(s => s.c + ':' + s.v === k).a === sc.slice(2) : (s => s.a + '|' + s.g)(MQ_DATA.skills.find(s => s.c + ':' + s.v === k)) === sc.slice(2)); const got = ks.reduce((t, k) => t + (p.byKey[k] || 0), 0); if (Math.abs(got - p.total * v / 100) > 1) bad.push(`${sc} held at ${v} % gets ${got} of ${p.total}`); }
          if (!p.perPage) return { bad: ['plan() has no perPage'] };
          const tot = {}; p.perPage.forEach(pg => Object.entries(pg).forEach(([k, n]) => { tot[k] = (tot[k] || 0) + n; }));
          M.S.tray.forEach((k, i) => { if ((tot[k] || 0) !== p.counts[i]) bad.push(`pages add up to ${tot[k] || 0} of ${k}, summary says ${p.counts[i]}`); });
          const pages = [...document.querySelectorAll('.previews .page')];
          if (!pages.length) bad.push('no preview');
          pages.forEach((pg, i) => {
            const cells = [...pg.querySelectorAll('.page-cell')]; const got = {};
            for (const c of cells) { const k = c.getAttribute('data-skill'); if (!k) { bad.push('a preview cell without data-skill'); break; } got[k] = (got[k] || 0) + 1; }
            const want = p.perPage[i] || {}; for (const k of new Set([...Object.keys(want), ...Object.keys(got)])) if ((want[k] || 0) !== (got[k] || 0)) bad.push(`page ${i + 1}: preview ${got[k] || 0} × ${k}, plan ${want[k] || 0}`);
            const seen = new Set(); for (const c of cells) { if (c.classList.contains('page-more')) continue; const h = c.innerHTML; if (seen.has(h)) { bad.push(`page ${i + 1}: the same item twice`); break; } seen.add(h); }
            // every cell is drawn live by the app from its own skill (fix round 5)
            for (const c of cells) { const sv = c.querySelector('.live-thumb'); if (!sv || sv.dataset.k !== c.getAttribute('data-skill')) { bad.push(`page ${i + 1}: a cell of ${c.getAttribute('data-skill')} shows ${sv ? sv.dataset.k : 'nothing'}`); break; } }
          });
          const line = document.querySelector('[data-summary]'); const txt = line ? line.textContent : '';
          if (!txt.includes(`${p.total} ${M.S.sheet === 'quiz' ? 'questions' : 'problems'}`)) bad.push(`summary “${txt.slice(0, 60)}” does not say ${p.total}`);
          return { bad, txt: txt.slice(0, 140) };
        }, set);
        if (r.bad.length) failed++;
        console.log(`${r.bad.length ? 'FAIL' : 'ok  '} preview = summary: ${label.padEnd(36)} ${r.bad.slice(0, 3).join('; ')}${r.bad.length > 3 ? ` (+${r.bad.length - 3})` : ''}`);
      }
      // owner 2026-10-23, Each page: "Same problems, new numbers" repeats page 1's skills, order and counts with other items;
      // "Same page again" repeats page 1 exactly (Single, Mixed and Sections; the quiz has no identical copies)
      for (const [label, url, mode] of [['mixed, same problems', 'app.html?tray=demo3&pages=3&each=same#print', 'same'], ['mixed, same page again', 'app.html?tray=demo3&pages=3&each=copy#print', 'copy'], ['single, same problems', 'app.html?tray=demo1&pages=3&each=same#print', 'same'], ['sections, same page again', 'app.html?tray=demo3x&kind=sections&pages=2&each=copy#print', 'copy'], ['quiz, same problems', 'app.html?tray=demo3&pages=2&each=same#quiz', 'same']]) {
        await page.goto(`${base}/design/mockups/teacher-2/${url}`, { waitUntil: 'networkidle' });
        const r = await page.evaluate(() => { const pg = [...document.querySelectorAll('.previews .page')].slice(0, 2).map(p => [...p.querySelectorAll('.page-cell')]); const p = window.MQ.plan(window.MQ.S.sheet === 'quiz');
          return { n: pg.length, sk: pg.map(c => c.map(x => x.getAttribute('data-skill')).join(',')), h: pg.map(c => c.map(x => { const t = x.querySelector('.live-thumb'); return t ? t.dataset.k + '|' + t.dataset.seed + '|' + t.dataset.n : 'none'; }).join(',')), plan: p.perPage.slice(0, 2).map(o => JSON.stringify(o)), line: document.querySelector('[data-summary]').textContent.slice(0, 80), copyOpt: !!document.querySelector('[data-act="each"][data-arg="copy"]') }; });
        const bad = [];
        if (r.n < 2) bad.push('fewer than 2 pages in the preview');
        else {
          if (r.sk[0] !== r.sk[1] || r.plan[0] !== r.plan[1]) bad.push('page 2 is not page 1’s plan');
          if (mode === 'same' && r.h[0] === r.h[1]) bad.push('page 2 has the same numbers');
          if (mode === 'copy' && r.h[0] !== r.h[1]) bad.push('page 2 is not a copy');
        }
        if (/quiz/.test(label) && r.copyOpt) bad.push('the quiz offers Same page again');
        if (mode === 'same' && !/the same \d+ (problems|questions) on each, new numbers/.test(r.line)) bad.push(`summary “${r.line}”`);
        if (mode === 'copy' && !/copies of the same page/.test(r.line)) bad.push(`summary “${r.line}”`);
        if (bad.length) failed++;
        console.log(`${bad.length ? 'FAIL' : 'ok  '} each page: ${label.padEnd(26)} ${bad.join('; ') || r.line}`);
      }
      // the owner's case (2026-10-23): "I choose 1 problem type to be 50 % and the rest are evenly split with the remaining".
      // 64 skills, one held at 50 % on a 40-problem page set → 20, the other 20 as even as rounding allows (each 0 or 1);
      // 5 skills, one at 50 % → 20, then 5 · 5 · 5 · 5.
      for (const [n, want] of [[64, 'one 20, the rest 0 or 1'], [5, '20 · 5 · 5 · 5 · 5']]) {
        await page.goto(`${base}/design/mockups/teacher-2/app.html?tray=demo${n}&pages=5&kind=mixed#print`, { waitUntil: 'networkidle' });
        const r = await page.evaluate(() => {
          const M = window.MQ; const k0 = M.S.tray[0]; M.S.opts.pages = 5; M.setLock('k:' + k0, 50); M.render(); const p = M.plan();
          const rest = M.S.tray.slice(1).map(k => p.byKey[k] || 0);
          const cells = [...document.querySelectorAll('.previews .page-cell')].length;
          return { n: M.S.tray.length, total: p.total, first: p.byKey[k0], max: Math.max(...rest), min: Math.min(...rest), sum: rest.reduce((a, b) => a + b, 0), cells, line: document.querySelector('[data-summary]').textContent };
        });
        const ok = r.total === 40 && r.first === 20 && r.sum === 20 && r.max - r.min <= 1 && (n !== 5 || (r.min === 5 && r.max === 5));
        if (!ok) failed++;
        console.log(`${ok ? 'ok  ' : 'FAIL'} 50 % case, ${r.n} skills on ${r.total}: held skill ${r.first}, the rest ${r.min}–${r.max} (sum ${r.sum})   want ${want}`);
      }
      await page.close();
    }
    // ---- fix round 4 (critic r4 A1): the big-tray popup on a phone scans. With a whole grade open at 390 × 844, at least
    //      6 skill rows are in the first screen (each row's middle not covered by the header or the sticky foot), every
    //      row is <= 56 px tall with its ✕ on the name's line, and the area and grade headers are <= 64 px.
    if (!ONLY || ONLY.includes('phone-pop')) for (const theme of THEMES) {
      const page = await browser.newPage({ viewport: SIZES[390] });
      for (const [label, url] of [['a whole grade, every area open', 'app.html?tray=grade3&open=all#tray'], ['two grades, Operations open', 'app.html?tray=grades2-3&open=OA#tray']]) {
        await page.goto(`${base}/design/mockups/teacher-2/${url.replace('?', `?theme=${theme}&`)}`, { waitUntil: 'networkidle' }); await page.evaluate(() => document.fonts.ready);
        const r = await page.evaluate(() => {
          const rows = [...document.querySelectorAll('.tp-row')]; const vis = rows.filter(row => { const b = row.getBoundingClientRect(); if (b.bottom > innerHeight || b.top < 0) return false; const t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return !!t && row.contains(t); });
          const tall = rows.filter(row => row.getBoundingClientRect().height > 56.5).length;
          const xOff = rows.filter(row => { const x = row.querySelector('[data-act="tpremove"]'), n = row.querySelector('.tp-name'); if (!x || !n) return true; const a = x.getBoundingClientRect(), b = n.getBoundingClientRect(); return a.top > b.bottom - 4; }).length;
          const heads = [...document.querySelectorAll('.tp-ahead, .tp-ghead:not(.tp-rgrade)')].filter(h => h.getBoundingClientRect().height > 64.5).map(h => Math.round(h.getBoundingClientRect().height));
          return { vis: vis.length, rows: rows.length, tall, xOff, heads };
        });
        const bad = []; if (r.vis < 6) bad.push(`${r.vis} skill rows in the first screen (want >= 6)`); if (r.tall) bad.push(`${r.tall} rows taller than 56 px`); if (r.xOff) bad.push(`${r.xOff} rows with the ✕ off the name's line`); if (r.heads.length) bad.push(`headers over 64 px: ${r.heads.slice(0, 4).join(', ')}`);
        if (bad.length) failed++;
        console.log(`${bad.length ? 'FAIL' : 'ok  '} phone popup @390 ${theme}, ${label}: ${r.vis} rows on the first screen of ${r.rows}${bad.length ? '  ' + bad.join('; ') : ''}`);
      }
      await page.close();
    }
    // ---- fix round 5 (critic r5 A3 / A4): the tray popup with Detailed weights.
    //  (a) every popup state, at every width: no text sits under a control and no two controls overlap (the r5 phone
    //      defect laid Less · Equal · More over "Grade 2 (all areas)"); the ⋯ menus are opened too;
    //  (b) rows per screen in Detailed weights: with the first skill row brought to the top of the popup, >= 8 skill rows
    //      are whole on the 1366 × 768 screen (each <= 56 px: name, weight, %, lock, ≈ n and ✕ on one line) and >= 6 on
    //      the 390 × 844 screen.
    if (!ONLY || ONLY.includes('pop-overlap')) for (const w of WIDTHS) for (const theme of THEMES) {
      const page = await browser.newPage({ viewport: SIZES[w] });
      const states = [['areas closed', 'app.html?tray=grades2-3#tray'], ['every area open', 'app.html?tray=grades2-3&open=all#tray'], ['a selection', 'app.html?tray=grade3&open=NF&sel=g:NF|3#tray'],
        ['detailed, one grade', 'app.html?tray=grade3&open=NF&detailed=1&lockp=a:NF:40#tray'], ['detailed, two grades', 'app.html?tray=grades2-3&detailed=1#tray'], ['detailed, two grades, all open', 'app.html?tray=grades2-3&detailed=1&open=all#tray'],
        ['detailed, a skill at 50 %', 'app.html?tray=demo64&pages=5&detailed=1&tq=add%201000%20story&lockp=k:addition:add_wp_1k:50#tray'],
        ['chips', 'app.html?tray=grade3&open=NF&tview=chips#tray'], ['thumbnails', 'app.html?tray=grade3&open=NF&tview=thumbs#tray'], ['detailed chips', 'app.html?tray=grades2-3&open=NF&tview=chips&detailed=1#tray'], ['detailed thumbnails', 'app.html?tray=grades2-3&open=NF&tview=thumbs&detailed=1#tray']];
      for (const [label, url] of states) {
        await page.goto(`${base}/design/mockups/teacher-2/${url.replace('?', `?theme=${theme}&`)}`, { waitUntil: 'networkidle' }); await page.evaluate(() => document.fonts.ready);
        // the closed state, then each ⋯ opened in turn (a phone's header controls)
        const nDots = await page.evaluate(() => document.querySelectorAll('.traypop .tp-dots').length);
        const bad = [];
        for (let d = -1; d < Math.min(nDots, 4); d++) {
          if (d >= 0) { await page.evaluate((d) => { const b = [...document.querySelectorAll('.traypop .tp-dots')].filter(x => x.getBoundingClientRect().width)[d]; if (b) b.click(); }, d); await page.waitForTimeout(30); }
          const r = await page.evaluate(() => {
            const out = []; const sheet = document.querySelector('.traypop'); if (!sheet) return ['no popup'];
            const vis = (el) => { const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false; for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return false; } return true; };
            const CTL = 'button, a, input, select, summary, [role="checkbox"], .stepper output';
            // only what the teacher can SEE: a control or a text whose middle is not covered (a sticky foot is not an overlap)
            const top = (x, y) => (x >= 0 && y >= 0 && x < innerWidth && y < innerHeight) ? document.elementFromPoint(x, y) : null;
            const ctls = [...sheet.querySelectorAll(CTL)].filter(vis).filter(c => !c.parentElement.closest(CTL)).filter(c => { const r = c.getBoundingClientRect(); const t = top(r.left + r.width / 2, r.top + r.height / 2); return t && c.contains(t); });
            const clipR = (el) => { const r = el.getBoundingClientRect(); const o = { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) { const cs = getComputedStyle(e); if (/(auto|scroll|hidden|clip)/.test(cs.overflowX + cs.overflowY)) { const c = e.getBoundingClientRect(); o.left = Math.max(o.left, c.left); o.top = Math.max(o.top, c.top); o.right = Math.min(o.right, c.right); o.bottom = Math.min(o.bottom, c.bottom); } } return o; };
            const inClip = (el, x, y) => { for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) { const cs = getComputedStyle(e); if (/(auto|scroll|hidden|clip)/.test(cs.overflowX + cs.overflowY)) { const c = e.getBoundingClientRect(); if (x < c.left || x > c.right || y < c.top || y > c.bottom) return false; } } return true; };
            // a control in a pinned part (the sticky foot) over rows scrolled under it is not laid over them
            const pinned = (c, pe) => { for (let e = c; e && e !== sheet; e = e.parentElement) { if (/sticky|fixed/.test(getComputedStyle(e).position)) return !e.contains(pe); } return false; };
            const meet = (p, q) => Math.min(p.right, q.right) - Math.max(p.left, q.left) > 2 && Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top) > 2;
            for (let i = 0; i < ctls.length; i++) for (let j = i + 1; j < ctls.length; j++) if (meet(clipR(ctls[i]), clipR(ctls[j])) && !pinned(ctls[i], ctls[j]) && !pinned(ctls[j], ctls[i])) out.push(`controls overlap: “${ctls[i].textContent.trim().slice(0, 18)}” / “${ctls[j].textContent.trim().slice(0, 18)}”`);
            const tw = document.createTreeWalker(sheet, NodeFilter.SHOW_TEXT);
            for (let nd = tw.nextNode(); nd; nd = tw.nextNode()) {
              const tx = nd.nodeValue.trim(); if (!tx) continue; const pe = nd.parentElement; if (!pe || pe.closest(CTL) || pe.closest('.sr, .live-thumb') || !vis(pe)) continue;
              const rg = document.createRange(); rg.selectNodeContents(nd);
              for (const rr of rg.getClientRects()) {
                if (rr.width < 2 || rr.height < 2) continue;
                // a control laid over the words: what is on top at the text's middle (or its first letter) is a control
                for (const [x, y] of [[rr.left + rr.width / 2, rr.top + rr.height / 2], [rr.left + 3, rr.top + rr.height / 2]]) {
                  if (!inClip(pe, x, y)) continue;      // scrolled out of its own box: not shown, so not under anything
                  const t = top(x, y); const c = t && t.closest(CTL);
                  if (c && !c.contains(pe) && sheet.contains(c) && !pinned(c, pe)) { out.push(`text under a control: “${tx.slice(0, 24)}” under “${c.textContent.trim().slice(0, 16) || c.getAttribute('aria-label') || c.tagName}”`); break; }
                }
              }
            }
            return [...new Set(out)];
          });
          for (const x of r) bad.push((d >= 0 ? `⋯ ${d + 1} open: ` : '') + x);
        }
        if (bad.length) failed++;
        console.log(`${bad.length ? 'FAIL' : 'ok  '} popup overlap @${w} ${theme} ${label.padEnd(30)} ${bad.slice(0, 3).join('; ')}${bad.length > 3 ? ` (+${bad.length - 3})` : ''}`);
      }
      await page.close();
    }
    if (!ONLY || ONLY.includes('detailed-rows')) for (const w of [1366, 1280, 1024, 820, 390].filter(x => WIDTHS.includes(x))) {
      const page = await browser.newPage({ viewport: SIZES[w] });
      await page.goto(`${base}/design/mockups/teacher-2/app.html?theme=light&tray=grade3&open=NF&detailed=1#tray`, { waitUntil: 'networkidle' }); await page.evaluate(() => document.fonts.ready);
      const r = await page.evaluate(() => {
        const rows = [...document.querySelectorAll('.traypop .tp-row')]; if (!rows.length) return { err: 'no skill rows' };
        rows[0].scrollIntoView({ block: 'start' });
        // what covers the top of the scrolling part (a sticky head) is not screen the rows can use
        const covered = (row) => { const b = row.getBoundingClientRect(); for (const y of [b.top + 2, b.top + b.height / 2, b.bottom - 2]) { const t = document.elementFromPoint(b.left + Math.min(40, b.width / 2), y); if (!t || !row.contains(t)) return true; } return false; };
        const body = document.querySelector('.traypop .tp-body'); const sc = getComputedStyle(body).overflowY === 'auto' ? body : document.querySelector('.traypop');
        // bring the first row to the top of what the teacher sees, below any sticky part
        for (let i = 0; i < 6 && covered(rows[0]); i++) sc.scrollTop -= 8;
        const whole = rows.filter(row => { const b = row.getBoundingClientRect(); return b.top >= 0 && b.bottom <= innerHeight && !covered(row); });
        const hs = rows.slice(0, 12).map(row => Math.round(row.getBoundingClientRect().height));
        return { whole: whole.length, max: Math.max(...hs), hs };
      });
      const bad = []; const need = w === 390 ? 6 : w === 1366 ? 8 : 0;
      if (r.err) bad.push(r.err);
      else {
        if (r.whole < need) bad.push(`${r.whole} skill rows whole on the screen (want >= ${need})`);
        if (w >= 820 && r.max > 56.5) bad.push(`rows up to ${r.max} px (want <= 56: one line)`);
      }
      if (bad.length) failed++;
      console.log(`${bad.length ? 'FAIL' : 'ok  '} detailed weights @${w}: ${r.whole} rows per screen, rows ${r.hs ? r.hs.slice(0, 6).join(' / ') : ''} px${bad.length ? '  ' + bad.join('; ') : ''}`);
      await page.close();
    }
    // ---- fix round 4 (critic r4 B3): the worksheet sheet keeps what the teacher set. Set 3 pages and Examples at the top,
    //      close, tick one more skill, press Print again: still 3 pages and Examples at the top (the kind recomputed only
    //      if it no longer fits); and a grade's How often across ALL areas reaches every skill of that grade (r4 B1)
    if (!ONLY || ONLY.includes('keep')) {
      const page = await browser.newPage({ viewport: SIZES[1366] });
      await page.goto(`${base}/design/mockups/teacher-2/app.html?tray=demo3#skills`, { waitUntil: 'networkidle' });
      const clickAll = async (sels) => { for (const sel of sels) { await page.locator(sel).first().click(); await page.waitForTimeout(40); } };
      await clickAll(['[data-act="tray-print"]', '[data-act="pages"][data-arg="1"]', '[data-act="pages"][data-arg="1"]', '[data-act="examples"][data-arg="top"]', '.sheet [data-act="close"].close']);
      const before = await page.evaluate(() => window.MQ.S.opts.pages);
      await clickAll(['#skill-list .card[aria-pressed="false"]', '[data-act="tray-print"]']);
      const r = await page.evaluate(() => ({ pages: window.MQ.S.opts.pages, ex: window.MQ.S.opts.examples, n: window.MQ.S.tray.length, shown: (document.querySelector('.stepper output') || {}).textContent }));
      const ok = before === 3 && r.pages === 3 && r.ex === 'top' && r.n === 4;
      if (!ok) failed++;
      console.log(`${ok ? 'ok  ' : 'FAIL'} print sheet keeps its settings: 3 pages + Examples at the top → close → tick a 4th skill → Print: ${r.pages} pages, examples ${r.ex}, ${r.n} skills`);
      await page.goto(`${base}/design/mockups/teacher-2/app.html?tray=grades2-3#tray`, { waitUntil: 'networkidle' });
      await clickAll(['[data-act="hw"][data-arg="r:2|3"]']);
      const g = await page.evaluate(() => { const S = window.MQ.S; const two = S.tray.filter(k => MQ_DATA.skills.find(s => s.c + ':' + s.v === k).g === '2'); const areas = new Set(two.map(k => MQ_DATA.skills.find(s => s.c + ':' + s.v === k).a)); return { n: two.length, more: two.filter(k => S.w[k] === 3).length, areas: areas.size, others: S.tray.filter(k => !two.includes(k) && (k in S.w) && S.w[k] !== 2).length }; });
      const gok = g.n > 0 && g.more === g.n && g.others === 0 && g.areas > 1;
      if (!gok) failed++;
      console.log(`${gok ? 'ok  ' : 'FAIL'} Grade 2 (all areas) · More: ${g.more} of ${g.n} grade-2 skills across ${g.areas} areas, ${g.others} other skills changed`);
      await page.close();
    }
    // ---- fix round 4 (critic r4 B2): both search boxes go through the app's own finder (js/modules/skill-finder.js), never
    //      label matching (CLAUDE.md). Each query's first card and hit count are held to what a teacher means by it.
    if (!ONLY || ONLY.includes('search')) {
      const page = await browser.newPage({ viewport: SIZES[1366] });
      const cases = [
        ['2.NBT.5', (r) => r.n >= 5 && r.n === r.alt, 'the standard without its cluster letter finds what 2.NBT.B.5 finds'],
        ['2.NBT.B.5', (r) => r.n >= 5, 'the full code'],
        ['within 1000', (r) => r.n >= 5 && /1,000/.test(r.top[0]), 'numbers written with or without the comma'],
        ['time', (r) => /time|clock/i.test(r.top[0]) && !/times/i.test(r.top[0]) && r.top.slice(0, 3).every(t => /time|clock/i.test(t) && !/times as/i.test(t)), 'clock skills first, not Times as Many'],
        ['clocks', (r) => /clock/i.test(r.top[0]), 'a clock skill first'],
        ['add within 20', (r) => /within 20/i.test(r.top[0]) && /add/i.test(r.top[0]), 'Add within 20 first'],
        ['fractoins', (r) => r.n >= 5 && /fraction/i.test(r.top[0]), 'a misspelling still finds fractions'],
      ];
      await page.goto(`${base}/design/mockups/teacher-2/app.html#skills`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => window.MQ_FINDER_READY, null, { timeout: 30000 });
      for (const [q, ok, why] of cases) {
        const r = await page.evaluate((q) => { const S = window.MQ.S; const run = (x) => { S.q = x; window.MQ.render(); return [...document.querySelectorAll('#skill-list .card[data-skill]')].map(c => c.querySelector('.card-name').textContent); }; const top = run(q); const alt = q === '2.NBT.5' ? run('2.NBT.B.5').length : 0; run(q); const note = (document.querySelector('#skill-list .note') || {}).textContent || ''; const m = note.match(/(\d+) skills? match/); return { top, n: m ? Number(m[1]) : top.length, alt: q === '2.NBT.5' ? (alt && Number(((document.querySelector('#skill-list .note') || {}).textContent || '').match(/(\d+)/)[1])) : 0 }; }, q);
        if (q === '2.NBT.5') { r.alt = await page.evaluate(() => { const S = window.MQ.S; S.q = '2.NBT.B.5'; window.MQ.render(); const m = ((document.querySelector('#skill-list .note') || {}).textContent || '').match(/(\d+) skills? match/); S.q = ''; return m ? Number(m[1]) : 0; }); }
        const good = ok(r); if (!good) failed++;
        console.log(`${good ? 'ok  ' : 'FAIL'} search “${q}”: ${r.n} skills, first ${r.top.slice(0, 3).join(' · ')}   (${why})`);
      }
      // the tray's own search: a standard code finds the tray's skills of that standard
      await page.goto(`${base}/design/mockups/teacher-2/app.html?tray=grade3&tq=3.NF.1#tray`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => window.MQ_FINDER_READY, null, { timeout: 30000 }); await page.evaluate(() => window.MQ.render());
      const tr = await page.evaluate(() => [...document.querySelectorAll('.tp-row .tp-name')].map(x => x.textContent));
      const tok = tr.length >= 2 && tr.every(t => /fraction|whole|equal|part|shade|unit/i.test(t)); if (!tok) failed++;
      console.log(`${tok ? 'ok  ' : 'FAIL'} tray search “3.NF.1”: ${tr.length} rows (${tr.slice(0, 3).join(' · ')})`);
      await page.close();
    }
    // the flows
    const results = {};
    console.log('\nflows (actions incl. needed scrolls / steps):');
    if (!QUICK || FLOWS_ONLY) for (const f of FLOWS) for (const w of [1366, 390]) {
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
<script>document.documentElement.setAttribute('data-theme','light');/* dark mode parked: owner 2026-10-23 */</script>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Fraunces:ital,opsz,wght@1,9..144,500&family=Inter:wght@500;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="tokens.css"><link rel="stylesheet" href="docs.css"></head>
<body><div class="doc">
<p class="eyebrow">Maths Quest · Teacher site 2.0 · T1 · ${new Date().toISOString().slice(0, 10)}</p>
<h1>The clickable mock-up</h1>
<p class="serif">Find skills, tick them, then Print, Quiz or Share.</p>
<p class="lead">Every job in 3 or 4 steps. Colour means the maths area (board C, the look of the school’s maths site); the one main action on each screen is solid warm ink.</p>
<div class="top"><a class="btn btn-primary" href="app.html">Open the mock-up</a></div>
<div class="tiles">
  <a class="tile" href="app.html"><b>The mock-up</b><span>Skills (opens here) with the tray, the worksheet sheet, Quiz, Share, Lessons, Classes and the profile menu. Works at any width. Light only: dark mode is parked by the owner (2026-10-23).</span></a>
  <a class="tile" href="flows.html"><b>The flows</b><span>Each job with its steps and clicks, today’s count beside it, and a “Walk it” button that shows each click in the mock-up.</span></a>
  <a class="tile" href="palette.html"><b>Colour: board C</b><span>Eight maths areas in four strengths (light; dark mode parked by the owner), the colour-blind check, where each colour moved from the site, and boards B and A as reference pictures.</span></a>
  <a class="tile" href="thumbs.html"><b>Every skill’s thumbnail</b><span>All 715 live skills, each drawn LIVE by the app as you scroll (<code>live.mjs</code>: the app’s own <code>buildSheet</code>); <code>thumbs-check.cjs</code> holds each thumbnail to the booted app’s own cell for the same skill and seed.</span></a>
  <a class="tile" href="files.html"><b>Teacher files: live and branches</b><span>Which teacher files are live, which are only on a branch, and what T2–T6 does with each (STATUS §7).</span></a>
</div>
<h2>The flows at a glance</h2>
<div class="scroll"><table><thead><tr><th>Task</th><th>Steps</th><th>Clicked 1366 / 390</th><th>Plan</th><th>Today</th><th></th></tr></thead><tbody>${flowRows}</tbody></table></div>
<p class="note">Clicked = actions counted by shoot.cjs in this mock-up (clicks, typed searches and any scroll it needed).</p>
<h2>Every screen</h2>
<p class="note">${groups.length} screens × 1366 and 390 px × light (dark mode is parked by the owner, 2026-10-23), plus the screens whose layout changes at 1280, 1024 and 820 px. Every screen is also checked at all five widths (no sideways scroll, nothing clipped, nothing hidden in a sideways strip). Each picture opens full size; the screens that scroll open the full page.</p>
<div class="filter" role="group" aria-label="Show"><button data-f="all" aria-pressed="true">All</button><button data-f="1366" aria-pressed="false">1366 px</button><button data-f="1280" aria-pressed="false">1280</button><button data-f="1024" aria-pressed="false">1024</button><button data-f="820" aria-pressed="false">820</button><button data-f="390" aria-pressed="false">390 px</button></div>
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
