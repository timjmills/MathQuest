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
      await new Promise((r) => setTimeout(r, 3000));
      const click = (sel) => page.evaluate((sel) => { const b = document.querySelector(sel); if (!b) return false; b.click(); return true; }, sel);
      const st = () => page.evaluate(() => {
        const btn = document.querySelector('[data-act="print"]'); const nb = document.querySelector('[data-act="key-newsheet"]');
        const d = document.querySelector('#tvPreviewFrame') && document.querySelector('#tvPreviewFrame').contentDocument;
        return { label: btn && btn.textContent.trim(), btnH: btn && Math.round(btn.getBoundingClientRect().height), btnOverflow: btn && btn.scrollWidth > btn.clientWidth + 1, newsheet: nb ? nb.getAttribute('aria-checked') : 'hidden', order: d ? [...d.querySelectorAll('section.ws-page')].map((s) => ({ print: 'P', key: 'K', blank: 'B' }[s.getAttribute('data-ws-mode')] || '?')).join('') : null };
      });
      const log = {};
      log.default = await st();
      await click('[data-act="key-place"][data-v="after-page"]'); await new Promise((r) => setTimeout(r, 2000));
      log.after = await st();
      await click('[data-act="key-newsheet"]'); await new Promise((r) => setTimeout(r, 3000));
      log.afterNS = await st();
      await page.evaluate(() => { const b = document.querySelector('[data-act="print"]'); b.scrollIntoView({ block: 'center' }); });
      await new Promise((r) => setTimeout(r, 300));
      await page.screenshot({ path: path.join(OUT, `ui-${vp.width}-ns.png`) });
      await click('[data-act="key-style"][data-v="short"]'); await new Promise((r) => setTimeout(r, 3000));
      log.shortNS = await st();
      await click('[data-act="key-place"][data-v="end"]'); await new Promise((r) => setTimeout(r, 3000));
      log.endNS = await st();
      await click('[data-act="key"]'); await new Promise((r) => setTimeout(r, 3000));
      log.keyOff = await st();
      console.log(vp.width, JSON.stringify(log));
    } finally { await app.close(); }
  }
  console.log('console errors:', errs.length, errs.slice(0, 5).join(' | '));
})().catch((e) => { console.error(e); process.exit(1); });
