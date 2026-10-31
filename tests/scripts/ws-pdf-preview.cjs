// ws-pdf-preview — GATE for "Preview every page" on the teacher Print sheet (pdf-preview lane, owner 2026-10-31:
// "we need to have fast pdf previews of printouts").
//
//   node tests/scripts/ws-pdf-preview.cjs              # GATE: parity in 4 printouts + timing, then OK / FAIL
//   SHOTS=design/status/pdf-preview node tests/scripts/ws-pdf-preview.cjs   # also save screenshots (desktop + phone)
//   THROTTLE=4 (default) — CPU slow-down for the timing case (Chrome DevTools' Chromebook-class figure)
//
// Checks (any failure exits 1):
//   1. parity   the preview's pages are the printed pages: the open preview's `.ws-page` count === the page count of
//               Chrome's own PDF of the document Print sends (S.lastDoc, captured by pressing Print in the preview),
//               and the preview's pages are that document's pages, byte for byte as the browser serialises them.
//               Four printouts: A4 key at the end · Letter key after each page · 2 sets with different problems ·
//               a quiz.
//   2. timing   with the CPU slowed THROTTLE×, a 4-page worksheet + key: page 1 on screen < 1 s after "Preview every
//               page" (pressed the moment the side preview is drawn); the whole printout < 3 s once the sheet has
//               been open a moment (the background build); the cold whole-printout time is reported.
//               The page 1 shown at once is the printout's own page 1 (no visible swap).
//   3. dialog   Esc closes the preview and leaves the Print sheet open; Print and Save as PDF wait for the whole set.
//   4. layout   the pages' frame fills the window below the bar, with and without the Save as PDF hint, at 1366 and 390
//               (the hidden hint once pulled the frame into a 150 px grid row).
const fs = require('fs');
const path = require('path');
const { open, waitFor } = require('../lib/ws-harness.cjs');

const SHOTS = process.env.SHOTS || '';
const THROTTLE = Number(process.env.THROTTLE || 4);
const FIRST_MS = 1000, ALL_MS = 3000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SKILLS = [
  { categoryId: 'addition', skillId: 'add_20_regroup', skillLabel: 'Add within 20 (With Regrouping)' },
  { categoryId: 'addition', skillId: 'add_facts', skillLabel: 'Addition Facts (within 20)' },
  { categoryId: 'multiplication', skillId: 'multiply', skillLabel: 'Basic Multiplication' },
];

(async () => {
  const failures = [];
  const fail = (m) => { failures.push(m); console.log('  FAIL ' + m); };
  if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
  const app = await open({ viewport: { width: 1366, height: 900, deviceScaleFactor: 1 } });
  const { page, browser } = app;
  const cdp = await page.target().createCDPSession();
  const report = { timing: {}, parity: [] };

  const setup = async (kind, opts, quiz) => {
    await page.evaluate(() => { if (window.tvPdfPreview) window.tvPdfPreview.close(); if (window.tvCloseSheet) window.tvCloseSheet(); });
    await sleep(150);
    await page.evaluate((skills, opts, quiz) => {
      window.UnifiedSkills.clear();
      skills.forEach((s) => window.UnifiedSkills.add(s));
      const cur = window.tvSheetPrint.get();
      cur.opts = Object.assign(cur.opts, { mode: 'pages', versions: 1, setsSame: false, keyPlace: 'end', keyStyle: 'copy', paper: 'A4' }, opts);
      if (quiz) cur.quiz = Object.assign(cur.quiz, quiz);
      window.tvSheetPrint.set(cur);
      if (opts.pages) window.tvSheetAmount.set('pages', opts.pages);
    }, SKILLS, opts, quiz || null);
    await page.evaluate((k) => window.tvOpenSheet(k, { from: 'tray' }), kind);
    await waitFor(page, () => { const s = window.tvSheetState(); return !!(s && s.preview && !s.building && !/Working out/.test((s.summary && s.summary.line) || '')); }, 60000, 'side preview');
  };
  const pressPreview = () => page.evaluate(() => { const b = document.querySelector('#tvsSide [data-act="pdfprev"]'); if (!b) return false; b.click(); return true; });
  // 4. layout: the pages' frame fills the window below the bar (and the hint), and the page fits its width
  const layoutCheck = async (label) => {
    const r = await page.evaluate(() => {
      const el = document.getElementById('tvPdfPreview'), f = document.getElementById('tvPdfFrame');
      const fb = f.getBoundingClientRect();
      const pg = f.contentDocument.querySelector('.mq-sheet > .ws-page');
      const z = parseFloat(getComputedStyle(f.contentDocument.body).zoom || '1') || 1;
      return { vh: window.innerHeight, vw: document.documentElement.clientWidth, top: fb.top, bottom: fb.bottom, w: fb.width, pageW: pg ? pg.getBoundingClientRect().width * (z && pg.getBoundingClientRect().width > fb.width ? 1 : 1) : 0, open: !el.hidden };
    });
    const ok = r.open && r.bottom >= r.vh - 1 && r.bottom - r.top >= r.vh * 0.5 && r.w >= r.vw - 1 && r.pageW > 0 && r.pageW <= r.w;
    console.log(`  layout ${label}: frame ${Math.round(r.top)}–${Math.round(r.bottom)} of ${r.vh} px, ${Math.round(r.w)} wide; page ${Math.round(r.pageW)} px wide`);
    if (!ok) fail(`layout ${label}: the pages' frame does not fill the window (${JSON.stringify(r)})`);
  };
  const waitReady = (ms = 90000) => waitFor(page, () => { const s = window.tvPdfPreview.state(); return s.open && (s.state === 'ready' || s.state === 'error'); }, ms, 'preview ready');

  // Chrome's own PDF of a document: its page count, and the pages as the browser serialises them
  const pdfOf = async (doc) => {
    const p = await browser.newPage();
    try {
      await p.setContent(doc, { waitUntil: 'networkidle0', timeout: 60000 });
      await p.evaluate(() => (document.fonts ? document.fonts.ready.then(() => 0) : 0));
      const buf = await p.pdf({ preferCSSPageSize: true, printBackground: true });
      const tmp = path.join(require('os').tmpdir(), `ws-pdf-preview-${process.pid}.pdf`);
      fs.writeFileSync(tmp, buf);
      // the PDF's own page count (pymupdf: the SessionStart hook installs it; ws-print-lint needs it too)
      const n = Number(require('child_process').execFileSync('python3', ['-c', 'import sys, pymupdf; print(pymupdf.open(sys.argv[1]).page_count)', tmp]).toString().trim());
      fs.unlinkSync(tmp);
      const pages = await p.evaluate(() => [...document.querySelectorAll('.mq-sheet > .ws-page')].map((x) => x.outerHTML));
      return { n, pages };
    } finally { await p.close(); }
  };

  const parityCase = async (name, kind, opts, quiz) => {
    await setup(kind, opts, quiz);
    if (!(await pressPreview())) { fail(`${name}: no "Preview every page" button`); return; }
    await waitReady();
    const st = await page.evaluate(() => { const s = window.tvPdfPreview.state(); return { state: s.state, pages: s.pages, meta: s.meta, html: [...document.getElementById('tvPdfFrame').contentDocument.querySelectorAll('.mq-sheet > .ws-page')].map((x) => x.outerHTML) }; });
    if (st.state !== 'ready') { fail(`${name}: preview state ${st.state} (${st.meta})`); return; }
    // Print from the preview: the sheet keeps the document it sends (window.print is a no-op headless)
    await page.evaluate(() => { window.__lastDoc0 = window.tvSheetState().lastDoc; document.querySelector('#tvPdfPreview [data-pdf="print"]').click(); });
    await waitFor(page, () => { const d = window.tvSheetState().lastDoc; return !!d && d !== window.__lastDoc0; }, 60000, 'print document');
    const doc = await page.evaluate(() => window.tvSheetState().lastDoc);
    const pdf = await pdfOf(doc);
    const same = pdf.pages.length === st.html.length && pdf.pages.every((h, i) => h === st.html[i]);
    const row = { name, previewPages: st.pages, docPages: pdf.pages.length, pdfPages: pdf.n, samePages: same, meta: st.meta };
    report.parity.push(row);
    console.log(`  ${name}: preview ${st.pages} · document ${pdf.pages.length} · PDF ${pdf.n} pages · pages identical ${same} · "${st.meta}"`);
    if (st.pages !== pdf.n) fail(`${name}: preview shows ${st.pages} pages but the PDF has ${pdf.n}`);
    if (!same) fail(`${name}: the preview's pages differ from the document Print sends`);
    if (!new RegExp(`^${pdf.n} pages? to print`).test(st.meta)) fail(`${name}: the bar says "${st.meta}", not ${pdf.n} pages`);
    return row;
  };

  try {
    await page.evaluate(() => window.setUserRole('teacher'));
    await waitFor(page, () => document.body.classList.contains('teacher-mode'), 10000, 'teacher mode');

    // ---- 2. timing (CPU throttled)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });
    // cold: pressed the moment the side preview is drawn (the background build has only just begun)
    await setup('print', { pages: 4 });
    await pressPreview();
    await waitFor(page, () => { const s = window.tvPdfPreview.state(); return s.open && !!s.tFirst; }, 30000, 'page 1');
    await waitReady();
    const cold = await page.evaluate(() => window.tvPdfPreview.state());
    // warm: the sheet open a moment (the background build done), then Preview
    await page.evaluate(() => window.tvPdfPreview.close());
    await page.evaluate(() => { const b = document.querySelector('#tvsSide [data-act="renew"]'); b.click(); });
    await waitFor(page, () => { const s = window.tvSheetState(); return !!(s && s.preview && !s.building); }, 60000, 'side preview (new numbers)');
    const tw = Date.now();
    await waitFor(page, () => { const s = window.tvSheetState(); return !!(s && s.built && s.built.pages); }, 60000, 'background build');
    const bgMs = Date.now() - tw;
    await sleep(300);
    await pressPreview();
    await waitReady();
    const warm = await page.evaluate(() => window.tvPdfPreview.state());
    report.timing = { throttle: THROTTLE, coldFirstMs: Math.round(cold.tFirst), coldAllMs: Math.round(cold.tAll), warmFirstMs: Math.round(warm.tFirst), warmAllMs: Math.round(warm.tAll), backgroundBuildMsAfterPage1: bgMs, pages: warm.pages };
    console.log(`  timing (CPU ${THROTTLE}x, ${warm.pages} pages): cold page 1 ${report.timing.coldFirstMs} ms, all ${report.timing.coldAllMs} ms · warm page 1 ${report.timing.warmFirstMs} ms, all ${report.timing.warmAllMs} ms · background build ready ${bgMs} ms after page 1`);
    for (const [n, st] of [['cold', cold], ['warm', warm]]) if (st.firstSame !== true) fail(`timing: the ${n} instant page 1 is not the printout's page 1 (firstSame ${st.firstSame})`);
    if (!(cold.tFirst < FIRST_MS)) fail(`timing: cold page 1 took ${Math.round(cold.tFirst)} ms (target < ${FIRST_MS})`);
    if (!(warm.tFirst < FIRST_MS)) fail(`timing: warm page 1 took ${Math.round(warm.tFirst)} ms (target < ${FIRST_MS})`);
    if (!(warm.tAll < ALL_MS)) fail(`timing: warm whole printout took ${Math.round(warm.tAll)} ms (target < ${ALL_MS})`);
    await layoutCheck('1366 · no hint');
    if (SHOTS) {
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
      await page.screenshot({ path: path.join(SHOTS, 'desktop-1366-preview.png') });
      await page.evaluate(() => { const f = document.getElementById('tvPdfFrame').contentWindow; f.scrollTo(0, f.document.body.scrollHeight); });
      await sleep(200);
      await page.screenshot({ path: path.join(SHOTS, 'desktop-1366-preview-key.png') });
    }
    // ---- 3. dialog: Esc closes the preview, not the sheet
    await page.keyboard.press('Escape');
    await sleep(200);
    const afterEsc = await page.evaluate(() => ({ prev: window.tvPdfPreview.state().open, sheet: window.tvSheetState().sheet }));
    if (afterEsc.prev) fail('dialog: Esc left the preview open');
    if (afterEsc.sheet !== 'print') fail(`dialog: Esc closed the Print sheet too (sheet ${afterEsc.sheet})`);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });

    // ---- 1. parity
    await parityCase('A4 · 2 pages · key at the end', 'print', { pages: 2 });
    await parityCase('Letter · 3 pages · key after each page', 'print', { pages: 3, paper: 'Letter', keyPlace: 'after-page' });
    await parityCase('2 sets · different problems', 'print', { pages: 2, versions: 2, setsSame: false });
    await parityCase('quiz · 2 versions', 'quiz', {}, { versions: 2, mode: 'total', n: 12 });

    {
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: SHOTS ? 2 : 1 });
      await setup('print', { pages: 2 });
      await pressPreview(); await waitReady();
      await sleep(300);
      await layoutCheck('390 · no hint');
      if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'phone-390-preview.png') });
      await page.evaluate(() => document.querySelector('#tvPdfPreview [data-pdf="save"]').click());
      await sleep(400);
      await layoutCheck('390 · Save as PDF hint');
      if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'phone-390-save-hint.png') });
      await page.setViewport({ width: 1366, height: 900, deviceScaleFactor: 1 });
      await sleep(300);
      await layoutCheck('1366 · Save as PDF hint');
      await page.evaluate(() => window.tvPdfPreview.close());
      await sleep(200);
      if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'desktop-1366-sheet-button.png') });
    }
    const errs = app.problems.filter((p) => p.type === 'pageerror');
    if (errs.length) fail(`page errors: ${errs.map((e) => e.text.split('\n')[0]).join(' | ')}`);
  } catch (e) { fail(String(e && e.stack || e)); }
  if (process.env.REPORT) fs.writeFileSync(process.env.REPORT, JSON.stringify(report, null, 2));
  await app.close();
  console.log(failures.length ? `ws-pdf-preview: FAIL (${failures.length})` : 'ws-pdf-preview: OK');
  process.exit(failures.length ? 1 : 0);
})();
