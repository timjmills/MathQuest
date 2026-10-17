// Critic r8: print through the teacher Print screen (line on), key placement / style, tests with Hints on tests off / on.
const fs = require('fs');
const path = require('path');
const { open } = require('/home/user/mq-numberline/tests/lib/ws-harness.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SHOTS = process.argv[2];

(async () => {
  const h = await open({ viewport: { width: 1366, height: 768, deviceScaleFactor: 1 } });
  const { page } = h;
  await page.evaluate(() => { localStorage.setItem('mq_teacher_skill_view', 'list'); window.setUserRole('teacher'); });
  await sleep(500);
  const cases = [
    { name: 'nl_mult indep end copy', skills: [{ categoryId: 'multiplication', skillId: 'nl_mult', opts: { nlOn: true } }], role: null, place: 'end', style: 'copy', pages: 2 },
    { name: 'nl_mult indep after-page copy', skills: [{ categoryId: 'multiplication', skillId: 'nl_mult', opts: { nlOn: true } }], role: null, place: 'after-page', style: 'copy', pages: 2 },
    { name: 'nl_mult indep after-page short', skills: [{ categoryId: 'multiplication', skillId: 'nl_mult', opts: { nlOn: true } }], role: null, place: 'after-page', style: 'short', pages: 2 },
    { name: 'sub_100_regroup indep after-page short', skills: [{ categoryId: 'subtraction', skillId: 'sub_100_regroup', opts: { nlOn: true } }], role: null, place: 'after-page', style: 'short', pages: 2 },
    { name: 'add_facts test hints OFF', skills: [{ categoryId: 'addition', skillId: 'add_facts', opts: { nlOn: true } }], role: 'test', place: 'end', style: 'copy', hints: false },
    { name: 'add_facts test hints ON', skills: [{ categoryId: 'addition', skillId: 'add_facts', opts: { nlOn: true } }], role: 'test', place: 'end', style: 'copy', hints: true },
    { name: 'add_facts test hints ON after-page short', skills: [{ categoryId: 'addition', skillId: 'add_facts', opts: { nlOn: true } }], role: 'test', place: 'after-page', style: 'short', hints: true },
    { name: 'add_facts indep line OFF after-page short', skills: [{ categoryId: 'addition', skillId: 'add_facts', opts: {} }], role: null, place: 'after-page', style: 'short', pages: 2 },
  ];
  const results = [];
  for (const c of cases) {
    const r = { name: c.name };
    try {
      await page.evaluate((skills) => { window.tvOpenPrintWith(skills); window.tvGo('print'); }, c.skills);
      await sleep(1500);
      const clickAct = async (act, v) => page.evaluate((act, v) => { const b = document.querySelector(`[data-act="${act}"]${v ? `[data-v="${v}"]` : ''}`); if (!b) return false; b.click(); return true; }, act, v);
      { const role = c.role || 'independent'; await clickAct('types'); await sleep(300); r.roleClick = await clickAct('role', role); await sleep(800); r.roleNow = await page.evaluate(() => (document.querySelector('[data-act="role"][aria-checked="true"]') || {}).dataset?.v || null); }
      if (c.pages) r.pagesSet = await page.evaluate((n) => { const s = document.querySelector('select[data-pages]'); if (!s) return false; s.value = String(n); s.dispatchEvent(new Event('change', { bubbles: true })); return true; }, c.pages);
      r.place = await clickAct('key-place', c.place);
      r.style = await clickAct('key-style', c.style);
      if (c.role) {
        const cur = await page.evaluate(() => { const b = document.querySelector('[data-act="test-hints"]'); return b ? b.getAttribute('aria-checked') : null; });
        r.hintsSwitch = cur;
        if (cur !== null && (cur === 'true') !== !!c.hints) { await clickAct('test-hints'); }
        r.hintsAfter = await page.evaluate(() => { const b = document.querySelector('[data-act="test-hints"]'); return b ? b.getAttribute('aria-checked') : null; });
      }
      await sleep(3500);
      await page.evaluate(() => { const f = document.getElementById('tvPrintFrame'); if (f) f.remove(); });
      r.printBtn = await clickAct('print');
      let doc = null;
      for (let k = 0; k < 60 && !doc; k++) {
        await sleep(250);
        doc = await page.evaluate(() => { const f = document.getElementById('tvPrintFrame'); if (!f || !f.contentDocument) return null; const d = f.contentDocument; const pages = [...d.querySelectorAll('section.ws-page')]; if (!pages.length || d.documentElement.getAttribute('data-ws-fonts') !== 'ready') return null;
          return pages.map((p) => ({ mode: p.getAttribute('data-ws-mode'), role: p.getAttribute('data-ws-role'), band: !!p.querySelector('.ws-refline'), bandText: p.querySelector('.ws-refline svg') ? [...p.querySelectorAll('.ws-refline svg text')].map((t) => t.textContent).slice(0, 3).join(',') + '..' + [...p.querySelectorAll('.ws-refline svg text')].map((t) => t.textContent).slice(-1)[0] : '', foot: (p.querySelector('.ws-foot') || {}).textContent ? p.querySelector('.ws-foot').textContent.replace(/\s+/g, ' ').trim().slice(-40) : '', cells: p.querySelectorAll('.ws-cell').length, keyInk: [...p.querySelectorAll('*')].some((e) => getComputedStyle(e).color === 'rgb(194, 65, 12)') }));
        });
      }
      r.doc = doc;
      r.errs = h.problems.splice(0).map((p) => p.text.slice(0, 140));
      if (SHOTS) {
        fs.mkdirSync(SHOTS, { recursive: true });
        const html = await page.evaluate(() => document.getElementById('tvPrintFrame').contentDocument.documentElement.outerHTML);
        const p2 = await h.browser.newPage();
        await p2.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
        await p2.goto(h.base + '/index.html', { waitUntil: 'domcontentloaded' });
        await p2.setContent(html.replace('<head>', `<head><base href="${h.base}/">`), { waitUntil: 'networkidle0' });
        await sleep(800);
        await p2.screenshot({ path: path.join(SHOTS, c.name.replace(/\s+/g, '_') + '.png'), fullPage: true });
        await p2.close();
      }
    } catch (e) { r.error = e.message; }
    results.push(r);
    console.log(JSON.stringify(r));
  }
  await h.close();
})();
