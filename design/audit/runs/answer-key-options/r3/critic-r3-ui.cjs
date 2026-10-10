// UI probe at Chromebook sizes: key options panel, label fit, new-sheet toggle, saved default, page order.
const path = require('path'); const fs = require('fs');
const ROOT = process.env.MQ_ROOT; const { open, waitFor } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const OUT = process.env.OUT; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const errs = [];
  for (const vp of [{ width: 1366, height: 768 }, { width: 1280, height: 720 }]) {
    const app = await open({ seed: 1, viewport: Object.assign({ deviceScaleFactor: 1 }, vp) }); const { page } = app; page.setDefaultTimeout(0);
    page.on('console', (m) => { if (m.type() === 'error') errs.push(`${vp.width}: ${m.text()}`); });
    page.on('pageerror', (e) => errs.push(`${vp.width}: ${e.message}`));
    try {
      await page.evaluate(() => { localStorage.removeItem('mq_teacher_print_defaults'); window.setUserRole('teacher'); });
      await waitFor(page, () => document.body.classList.contains('teacher-mode'), 10000, 'teacher');
      await page.evaluate(() => window.tvOpenPrintWith([{ categoryId: 'addition', skillId: 'add_facts' }]));
      await new Promise((r) => setTimeout(r, 2500));
      const st = async (tag) => page.evaluate(() => {
        const ko = document.querySelector('.tv-keyopts'); if (!ko) return { none: true };
        const segs = [...ko.querySelectorAll('.tv-seg button')].map((b) => { const r = b.getBoundingClientRect(); const sr = b.scrollWidth > b.clientWidth + 1; const spans = [...b.childNodes].length; return { t: b.textContent.trim(), on: b.getAttribute('aria-checked'), w: Math.round(r.width), h: Math.round(r.height), overflow: sr, right: Math.round(r.right), segRight: Math.round(b.parentElement.getBoundingClientRect().right) }; });
        const nb = ko.querySelector('[data-act="key-newsheet"]'); const nr = nb && nb.getBoundingClientRect();
        return { segs, newsheet: nb ? { checked: nb.getAttribute('aria-checked'), top: Math.round(nr.top), bottom: Math.round(nr.bottom), h: Math.round(nr.height), inView: nr.bottom <= innerHeight } : null, ih: innerHeight, koTop: Math.round(ko.getBoundingClientRect().top) };
      });
      const shot = async (name) => { const ko = await page.$('.tv-keyopts'); if (ko) { await page.evaluate(() => document.querySelector('.tv-keyopts').scrollIntoView({ block: 'center' })); await new Promise((r) => setTimeout(r, 300)); const b = await ko.boundingBox(); await page.screenshot({ path: path.join(OUT, `${name}.png`), clip: { x: Math.max(0, b.x - 20), y: Math.max(0, b.y - 20), width: b.width + 40, height: b.height + 40 } }); } await page.screenshot({ path: path.join(OUT, `${name}-full.png`) }); };
      const log = {};
      log.initial = await st();
      await shot(`ui-${vp.width}-default`);
      const click = (sel) => page.evaluate((sel) => { const b = document.querySelector(sel); if (!b) return false; b.click(); return true; }, sel);
      log.clickAfter = await click('[data-act="key-place"][data-v="after-page"]');
      await new Promise((r) => setTimeout(r, 1500));
      log.after = await st();
      await shot(`ui-${vp.width}-afterpage`);
      log.clickNew = await click('[data-act="key-newsheet"]');
      await new Promise((r) => setTimeout(r, 2500));
      log.afterNew = await st();
      log.stored = await page.evaluate(() => localStorage.getItem('mq_teacher_print_defaults'));
      await shot(`ui-${vp.width}-newsheet`);
      // page order in the preview doc
      log.order = await page.evaluate(() => { const f = document.querySelector('#tvPreviewFrame'); const d = f && f.contentDocument; return d ? [...d.querySelectorAll('section.ws-page')].map((s) => ({ print: 'P', key: 'K', blank: 'B' }[s.getAttribute('data-ws-mode')] || '?')).join('') : null; });
      log.pageLabel = await page.evaluate(() => { const el = document.querySelector('#tvPageLabel, .tv-pagecount, [data-tv-pages]'); return el ? el.textContent.trim() : (document.querySelector('.tv-preview-nav, #tvPager') || {}).textContent; });
      // short + after + newsheet
      await click('[data-act="key-style"][data-v="short"]'); await new Promise((r) => setTimeout(r, 2500));
      log.orderShort = await page.evaluate(() => { const d = document.querySelector('#tvPreviewFrame').contentDocument; return [...d.querySelectorAll('section.ws-page')].map((s) => ({ print: 'P', key: 'K', blank: 'B' }[s.getAttribute('data-ws-mode')] || '?')).join(''); });
      // At the end ignores it
      await click('[data-act="key-place"][data-v="end"]'); await new Promise((r) => setTimeout(r, 2500));
      log.atEnd = await st();
      log.orderEnd = await page.evaluate(() => { const d = document.querySelector('#tvPreviewFrame').contentDocument; return [...d.querySelectorAll('section.ws-page')].map((s) => ({ print: 'P', key: 'K', blank: 'B' }[s.getAttribute('data-ws-mode')] || '?')).join(''); });
      log.storedEnd = await page.evaluate(() => localStorage.getItem('mq_teacher_print_defaults'));
      await click('[data-act="key-place"][data-v="after-page"]'); await new Promise((r) => setTimeout(r, 1000));
      // reload: remembered?
      await page.reload({ waitUntil: 'networkidle0' });
      await page.evaluate(() => window.setUserRole('teacher'));
      await waitFor(page, () => document.body.classList.contains('teacher-mode'), 10000, 'teacher');
      await page.evaluate(() => window.tvOpenPrintWith([{ categoryId: 'addition', skillId: 'add_facts' }]));
      await new Promise((r) => setTimeout(r, 2500));
      log.reload = await st();
      log.storedReload = await page.evaluate(() => localStorage.getItem('mq_teacher_print_defaults'));
      log.orderReload = await page.evaluate(() => { const d = document.querySelector('#tvPreviewFrame').contentDocument; return [...d.querySelectorAll('section.ws-page')].map((s) => ({ print: 'P', key: 'K', blank: 'B' }[s.getAttribute('data-ws-mode')] || '?')).join(''); });
      console.log(vp.width, JSON.stringify(log, null, 1));
    } finally { await app.close(); }
  }
  console.log('console errors:', errs.length, errs.slice(0, 5).join(' | '));
})().catch((e) => { console.error(e); process.exit(1); });
