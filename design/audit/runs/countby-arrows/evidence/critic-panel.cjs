// Critic: teacher print screen at 1366x768 (and 1280x720), count_by_tables Options popover: docked beside the preview, never over it;
// every option row has a "?" with a tip; tap shows it; Select all / none; chips sort smallest -> biggest; Lines option redraws the preview.
const path = require('path');
const fs = require('fs');
const TREE = process.env.TREE, OUT = process.env.OUT;
const { open } = require(path.join(TREE, 'tests/lib/ws-harness.cjs'));
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  for (const [W, H, touch] of [[1366, 768, false], [1280, 720, false], [1366, 768, true]]) {
    const app = await open({ seed: 1, viewport: { width: W, height: H, deviceScaleFactor: 1, hasTouch: touch } });
    const { page } = app;
    await page.evaluate(() => {
      if (!document.body.classList.contains('teacher-mode') && window.toggleUserRole) window.toggleUserRole();
      window.clearSetOptions({ silent: true });
      window.tvOpenPrintWith([{ categoryId: 'multiplication', skillId: 'count_by_tables' }]); window.tvGo('print');
    });
    await sleep(2500);
    await page.waitForSelector('.tv-opt-btn[data-act="skill-options"]', { timeout: 15000 });
    const b = await page.$('.tv-opt-btn[data-act="skill-options"]');
    if (touch) { await b.scrollIntoView(); const bb = await b.boundingBox(); await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); } else await b.click();
    await page.waitForSelector('#skillOptionsPopover', { timeout: 5000 });
    await sleep(1200);
    const tag = `${W}x${H}${touch ? '-touch' : ''}`;
    const geo = await page.evaluate(() => {
      const pop = document.getElementById('skillOptionsPopover');
      const prev = document.querySelector('#teacherApp .tv-preview-card');
      const paper = prev && (prev.querySelector('.ws-page, iframe, .tv-preview-stage') || prev);
      const r = (e) => { const x = e.getBoundingClientRect(); return { l: Math.round(x.left), r: Math.round(x.right), t: Math.round(x.top), b: Math.round(x.bottom) }; };
      const p = r(pop), v = prev ? r(prev) : null, pp = paper ? r(paper) : null;
      const overlap = (a, c) => a && c && Math.max(0, Math.min(a.r, c.r) - Math.max(a.l, c.l)) * Math.max(0, Math.min(a.b, c.b) - Math.max(a.t, c.t));
      const rows = [...pop.querySelectorAll('.tv-sko-row')];
      const noTip = rows.filter((x) => !x.querySelector('.sko-tip')).map((x) => x.getAttribute('aria-label') || x.textContent.slice(0, 30));
      const tips = rows.map((x) => { const t = x.querySelector('.sko-tip'); return t ? `${x.getAttribute('aria-label')}: ${t.getAttribute('title')}` : null; }).filter(Boolean);
      const hidden = [...pop.querySelectorAll('details')].map((d) => d.querySelector('summary').innerText.trim() + (d.open ? ' (open)' : ' (closed)'));
      return { pop: p, prev: v, paper: pp, overlapPreview: overlap(p, v), overlapPaper: overlap(p, pp), cls: pop.className, vw: innerWidth, vh: innerHeight, nRows: rows.length, noTip, tips, hidden };
    });
    console.log(tag, JSON.stringify(geo));
    await page.screenshot({ path: path.join(OUT, `panel-${tag}-open.png`) });
    // Select all, then tap "?" on a row, then pick Lines, open More
    await page.evaluate(() => { document.querySelectorAll('#skillOptionsPopover details').forEach((d) => { d.open = true; }); });
    const sa = await page.$('#skillOptionsPopover .sko-rows-all');
    if (sa) { if (touch) { const bb = await sa.boundingBox(); await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); } else await sa.click(); }
    await sleep(1500);
    const afterAll = await page.evaluate(() => (window.getSetOptions('multiplication', 'count_by_tables').rows || []).map((r) => r.step));
    // chips added out of order sort themselves: none, then tap 7, 3, 11
    await page.evaluate(() => document.querySelector('#skillOptionsPopover .sko-rows-none').click());
    await sleep(800);
    for (const n of [7, 3, 11]) { await page.evaluate((n) => document.querySelector(`#skillOptionsPopover .sko-rows-chips button[aria-label="Count by ${n}"]`).click(), n); await sleep(700); }
    const order = await page.evaluate(() => (window.getSetOptions('multiplication', 'count_by_tables').rows || []).map((r) => r.step));
    // typed step 25 then chip 5 -> sorted
    await page.evaluate(() => { const box = document.querySelector('#skillOptionsPopover .sko-rows input[placeholder="25"]'); box.value = '25'; box.nextElementSibling.click(); });
    await sleep(700);
    await page.evaluate(() => document.querySelector('#skillOptionsPopover .sko-rows-chips button[aria-label="Count by 5"]').click());
    await sleep(700);
    const order2 = await page.evaluate(() => (window.getSetOptions('multiplication', 'count_by_tables').rows || []).map((r) => r.step));
    // move row 1 down then add chip 2: hand order kept, new at the end
    await page.evaluate(() => document.querySelector('#skillOptionsPopover .sko-row-line button[aria-label="Move row 1 down"]').click());
    await sleep(700);
    await page.evaluate(() => document.querySelector('#skillOptionsPopover .sko-rows-chips button[aria-label="Count by 2"]').click());
    await sleep(700);
    const order3 = await page.evaluate(() => (window.getSetOptions('multiplication', 'count_by_tables').rows || []).map((r) => r.step));
    await page.evaluate(() => { document.querySelectorAll('#skillOptionsPopover details').forEach((d) => { d.open = true; }); });
    // tap a "?" (the rows one)
    const q = await page.$('#skillOptionsPopover .sko-tip');
    if (q) { if (touch) { await q.scrollIntoView(); const bb = await q.boundingBox(); await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); } else await q.click(); }
    await sleep(400);
    const tipShown = await page.evaluate(() => { const t = document.querySelector('#skillOptionsPopover .sko-tip-text:not([hidden])'); return t ? t.textContent : null; });
    await page.screenshot({ path: path.join(OUT, `panel-${tag}-rows.png`) });
    // Answer spaces: Lines
    const linesSel = await page.evaluate(() => {
      const row = [...document.querySelectorAll('#skillOptionsPopover .tv-sko-row')].find((r) => /Answer spaces/.test(r.getAttribute('aria-label') || ''));
      if (!row) return 'no Answer spaces row';
      const s = row.querySelector('select'); s.value = [...s.options].findIndex((o) => /Lines/.test(o.textContent)); s.dispatchEvent(new Event('change', { bubbles: true }));
      row.scrollIntoView({ block: 'center' });
      return { opts: [...s.options].map((o) => `${o.textContent}${o.title ? ' [' + o.title + ']' : ''}`) };
    });
    await sleep(3500);
    const prevLines = await page.evaluate(() => {
      const prev = document.querySelector('#teacherApp .tv-preview-card');
      const ifr = prev.querySelector('iframe');
      const doc = ifr ? ifr.contentDocument : prev;
      return doc ? doc.querySelectorAll('[data-ws-shape="line"]').length : -1;
    });
    await page.screenshot({ path: path.join(OUT, `panel-${tag}-lines.png`) });
    console.log(tag, JSON.stringify({ afterAll, order, order2, order3, tipShown, linesSel, prevLines }));
    console.log('problems', JSON.stringify(app.problems.slice(0, 5)));
    await app.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
