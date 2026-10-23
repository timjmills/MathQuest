// Teacher site 2.0 T1: screenshots, screen checks and the flow click-through for the clickable mock-up.
//   node design/mockups/teacher-2/shoot.cjs            every screen at 1366x768 and 390x844, light and dark -> shots/*.png,
//                                                      every §2.6 flow clicked -> flows-check.js, then index.html
//   node design/mockups/teacher-2/shoot.cjs --boards   also (re)draw the static reference pictures board-a.png and board-b.png
//   node design/mockups/teacher-2/shoot.cjs --no-shots only the checks and the flows (no PNGs written)
// Checks on every shot: no console error, no sideways scroll, at most one solid ink (primary) button you can see, the
// primary above the fold at 1366x768 where the screen has one, no two controls overlapping. Exit 1 on any failure.
const fs = require('fs');
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); }
const { startServer } = require('../../../tests/lib/ws-harness.cjs');
const FLOWS = require('./flows.js');

const DIR = __dirname; const SHOTS = path.join(DIR, 'shots');
const args = process.argv.slice(2); const NO_SHOTS = args.includes('--no-shots');
const EXE = fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
const SIZES = { 1366: { width: 1366, height: 768 }, 390: { width: 390, height: 844 } };

// name, label, url (relative to teacher-2/), primary at 1366?, full page too?, only these widths/themes?
const SCREENS = [
  ['skills-empty', 'Skills, tray empty (opens here)', 'app.html#skills', false, true],
  ['skills-tray', 'Skills, 3 skills in the tray', 'app.html?tray=demo3#skills', true, true],
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
  ['chip', 'A chip’s own options', 'app.html?tray=demo3#chip/addition:add_word_problems', true, false],
  ['board', 'Show on the board', 'app.html?tray=demo3#board', true, false],
  ['lessons', 'Lessons (opens where you were last)', 'app.html#lessons', true, true],
  ['lesson-panel', 'Lessons: the lesson panel (phone opens it full screen)', 'app.html#lessonpanel', true, false],
  ['lesson-print', 'Print lesson', 'app.html#lessonprint', true, false],
  ['classes', 'Classes: Run on the board', 'app.html#classes', true, true],
  ['classes-results', 'Classes: Quiz results (this device only)', 'app.html?ctab=results#classes', false, false],
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
  let failed = 0; const shots = [];
  try {
    for (const b of ['a', 'b']) if (args.includes('--boards') || !fs.existsSync(path.join(DIR, `board-${b}.png`))) {
      const p = await browser.newPage({ viewport: { width: 1024, height: 700 } });
      await p.goto(`${base}/design/mockups/teacher-2/board-${b}-source.html`, { waitUntil: 'networkidle' });
      await (await p.$('#b')).screenshot({ path: path.join(DIR, `board-${b}.png`) }); await p.close();
      console.log(`board-${b}.png drawn`);
    }
    for (const [name, label, url, primary, full] of SCREENS) {
      for (const w of [1366, 390]) for (const theme of ['light', 'dark']) {
        const page = await browser.newPage({ viewport: SIZES[w] });
        const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errors.push(m.text()); });
        const u = url.includes('?') ? url.replace('?', `?theme=${theme}&`) : url.replace('app.html', `app.html?theme=${theme}`);
        await page.goto(`${base}/design/mockups/teacher-2/${u}`, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(150);
        const rep = await screenReport(page, w);
        if (errors.length) rep.problems.push('console: ' + errors.join('; '));
        if (w === 1366 && primary && (rep.primaries !== 1 || rep.primaryBottom > 768)) rep.problems.push(`primary action not above the fold at 1366x768 (${rep.primaries} visible, bottom ${rep.primaryBottom})`);
        const file = `${name}-${w}-${theme}.png`;
        if (!NO_SHOTS) await page.screenshot({ path: path.join(SHOTS, file) });
        let fullFile = null;
        if (full && rep.height > SIZES[w].height + 40 && !NO_SHOTS) { fullFile = `${name}-${w}-${theme}-full.png`; await page.screenshot({ path: path.join(SHOTS, fullFile), fullPage: true }); }
        shots.push({ name, label, w, theme, file, fullFile, primary: rep.primaryText, problems: rep.problems });
        const tag = rep.problems.length ? 'FAIL' : 'ok  ';
        if (rep.problems.length) failed++;
        console.log(`${tag} ${file.padEnd(36)} primary: ${(rep.primaryText || '—').padEnd(22)} ${rep.problems.join(' · ')}${rep.small.length ? ' (small: ' + rep.small.join(', ') + ')' : ''}`);
        await page.close();
      }
    }
    // the flows
    const results = {};
    console.log('\nflows (actions incl. needed scrolls / steps):');
    for (const f of FLOWS) for (const w of [1366, 390]) {
      const r = await runFlow(browser, base, f, w); results[`${f.id}@${w}`] = r;
      if (!r.ok) failed++;
      console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${f.id.padEnd(16)} @${w}  ${r.actions} actions${r.scrolls ? ` (${r.scrolls} scroll)` : ''}, ${r.steps} steps   plan ${f.plan.actions} · today ${f.plan.today}${r.error ? '  ' + r.error : ''}`);
    }
    fs.writeFileSync(path.join(DIR, 'flows-check.js'), `// GENERATED by shoot.cjs: the flows as clicked in the mock-up.\nwindow.MQ_FLOW_CHECK = ${JSON.stringify({ when: new Date().toISOString().slice(0, 10), results }, null, 1)};\n`);
    if (!NO_SHOTS) writeIndex(shots, results);
  } finally { await browser.close(); server.close(); }
  console.log(failed ? `\nshoot: FAIL (${failed})` : `\nshoot: OK (${shots.length} screens, ${FLOWS.length * 2} flow runs)`);
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
  <a class="tile" href="files.html"><b>Teacher files: live and branches</b><span>Which teacher files are live, which are only on a branch, and what T2–T6 does with each (STATUS §7).</span></a>
</div>
<h2>The flows at a glance</h2>
<div class="scroll"><table><thead><tr><th>Task</th><th>Steps</th><th>Clicked 1366 / 390</th><th>Plan</th><th>Today</th><th></th></tr></thead><tbody>${flowRows}</tbody></table></div>
<p class="note">Clicked = actions counted by shoot.cjs in this mock-up (clicks, typed searches and any scroll it needed).</p>
<h2>Every screen</h2>
<p class="note">${groups.length} screens × 1366 and 390 px × light and dark. Each picture opens full size; the screens that scroll open the full page.</p>
<div class="filter" role="group" aria-label="Show"><button data-f="all" aria-pressed="true">All</button><button data-f="1366" aria-pressed="false">1366 px</button><button data-f="390" aria-pressed="false">390 px</button><button data-f="light" aria-pressed="false">Light</button><button data-f="dark" aria-pressed="false">Dark</button></div>
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
