// Whole-grade print timing: Skills library → Grade N → "Add whole grade" → Worksheet sheet → build every page
// (what Print builds before the dialog). Prints the seconds for the page-1 preview and for the whole paper.
//   node tests/scripts/ws-grade-print-timing.cjs [grade=1] [--profile out.cpuprofile]
const fs = require('fs');
const { open } = require('../lib/ws-harness.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const grade = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : '1';
const profIx = process.argv.indexOf('--profile');
(async () => {
  const app = await open({ viewport: { width: 1366, height: 900, deviceScaleFactor: 1 } });
  const { page } = app;
  let ok = true;
  try {
    await page.evaluate(() => window.setUserRole('teacher'));
    await page.evaluate(() => window.tvGo('skills'));
    await sleep(500);
    // the grade pills add to the selection: All, then the grade alone (from All, a grade means just that grade)
    await page.evaluate(() => { const b = document.querySelector('#tsGrades [data-arg="ALL"]'); if (b && b.getAttribute('aria-pressed') !== 'true') b.click(); });
    await sleep(300);
    await page.evaluate((g) => { const b = document.querySelector(`#tsGrades [data-grade="${g}"]`); if (b) b.click(); }, grade);
    await sleep(300);
    const label = await page.evaluate(() => (document.querySelector('[data-act="addgrade"]') || {}).textContent || '');
    if (!/whole grade/i.test(label)) throw new Error(`not one grade: "${label}"`);
    await sleep(500);
    const added = await page.evaluate(() => { const b = document.querySelector('[data-act="addgrade"]'); if (!b) return false; b.click(); return true; });
    if (!added) throw new Error('no Add whole grade button');
    await sleep(500);
    let t0 = Date.now();
    await page.evaluate(() => window.tvOpenSheet('print', { from: 'tray' }));
    // page-1 preview: wait until the sheet is not building and a preview is drawn
    let previewOk = false;
    for (let i = 0; i < 1500 && !previewOk; i++) { previewOk = await page.evaluate(() => { const s = window.tvSheetState && window.tvSheetState(); return !!(s && s.preview && !s.building && !/Working out/.test((s.summary && s.summary.line) || '')); }); if (!previewOk) await sleep(200); }
    if (!previewOk) { console.error('the page-1 preview never arrived'); ok = false; }
    const tPrev = (Date.now() - t0) / 1000;
    let cdp = null;
    if (profIx > 0) { cdp = await page.target().createCDPSession(); await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 500 }); await cdp.send('Profiler.start'); }
    t0 = Date.now();
    // (started without awaiting inside evaluate: a whole grade can outlast the protocol's call timeout)
    await page.evaluate(() => { window.__gpt = null; const t = performance.now(); window.tvSheetBuildNow().then((b) => { window.__gpt = { ms: performance.now() - t, pages: b.pages, total: b.plan && b.plan.total, matches: b.matchesPlan, err: b.error || null, doc: b.doc || '' }; }, (e) => { window.__gpt = { err: String(e && e.message) }; }); });
    while (!(await page.evaluate(() => !!window.__gpt))) await sleep(1000);
    const r = await page.evaluate(() => window.__gpt);
    const hash = require('crypto').createHash('sha1').update(r.doc.replace(/127\.0\.0\.1:\d+/g, 'HOST')).digest('hex').slice(0, 12);
    if (process.env.DOC_OUT) fs.writeFileSync(process.env.DOC_OUT, r.doc);
    const tAll = (Date.now() - t0) / 1000;
    if (cdp) { const { profile } = await cdp.send('Profiler.stop'); fs.writeFileSync(process.argv[profIx + 1], JSON.stringify(profile)); }
    console.log(JSON.stringify({ grade, previewSec: +tPrev.toFixed(1), buildAllSec: +tAll.toFixed(1), pages: r.pages, docHash: hash, matchesPlan: r.matches, error: r.err, problems: app.problems.length }));
    if (!r.pages || r.err) ok = false;
  } catch (e) { console.error(e); ok = false; }
  await app.close();
  console.log(ok ? 'ws-grade-print-timing: OK' : 'ws-grade-print-timing: FAIL');
  process.exit(ok ? 0 : 1);
})();
