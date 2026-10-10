// Critic r5 probe of the teacher print screen Print button (read-only).
const path = require('path'); const fs = require('fs');
const ROOT = process.env.MQ_ROOT; const { open, waitFor } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const OUT = process.env.OUT; fs.mkdirSync(OUT, { recursive: true });
const VPS = (process.env.VPS || '1366x768,1280x720,1024x768,1366x650').split(',').map((s) => { const [w, h] = s.split('x').map(Number); return { width: w, height: h }; });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const errs = []; const fails = [];
  for (const vp of VPS) {
    const app = await open({ seed: 1, viewport: Object.assign({ deviceScaleFactor: 1 }, vp) }); const { page } = app; page.setDefaultTimeout(0);
    page.on('console', (m) => { if (m.type() === 'error') errs.push(`${vp.width}x${vp.height}: ${m.text()}`); });
    page.on('pageerror', (e) => errs.push(`${vp.width}x${vp.height}: ${e.message}`));
    const tag = `${vp.width}x${vp.height}`;
    try {
      await page.evaluate(() => { localStorage.removeItem('mq_teacher_print_defaults'); window.setUserRole('teacher'); });
      await waitFor(page, () => document.body.classList.contains('teacher-mode'), 10000, 'teacher');
      await page.evaluate(() => window.tvOpenPrintWith([{ categoryId: 'addition', skillId: 'add_facts' }]));
      await sleep(3500);
      const click = async (sel) => { const ok = await page.evaluate((sel) => { const b = document.querySelector(sel); if (!b) return false; b.click(); return true; }, sel); await sleep(3000); return ok; };
      const st = (name) => page.evaluate((name) => {
        const b = document.querySelector('#tvSetup [data-act="print"]'); const ot = document.querySelector('#tvSetup [data-act="open-tab"]');
        const cap = document.querySelector('#tvPrintSheets'); const nb = document.querySelector('[data-act="key-newsheet"]');
        const d = document.querySelector('#tvPreviewFrame') && document.querySelector('#tvPreviewFrame').contentDocument;
        const order = d ? [...d.querySelectorAll('section.ws-page')].map((s) => ({ print: 'P', key: 'K', blank: 'B' }[s.getAttribute('data-ws-mode')] || '?')).join('') : null;
        const r = b.getBoundingClientRect(), o = ot.getBoundingClientRect();
        const spans = [...b.querySelectorAll('span')]; const lab = b.querySelector(':scope > span');
        const lr = lab.getBoundingClientRect();
        const lines = (() => { const rs = [...b.querySelectorAll('.tv-print-l')].map((s) => Math.round(s.getBoundingClientRect().top)); return new Set(rs).size; })();
        // any clipped element anywhere in #tvSetup
        const clipped = [...document.querySelectorAll('#tvSetup button, #tvSetup p, #tvSetup span, #tvSetup label')].filter((e) => e.offsetParent && getComputedStyle(e).overflow !== 'visible' && e.scrollWidth > e.clientWidth + 1).map((e) => (e.getAttribute('data-act') || e.className || e.tagName) + ':' + e.textContent.trim().slice(0, 30));
        const descId = b.getAttribute('aria-describedby'); const desc = descId ? (document.getElementById(descId) || {}).textContent : null;
        const fs = parseFloat(getComputedStyle(lab).fontSize); const cfs = cap ? parseFloat(getComputedStyle(cap).fontSize) : null;
        const capColor = cap ? getComputedStyle(cap).color : null;
        const capBox = cap ? cap.getBoundingClientRect() : null;
        return { name, label: lab.textContent.trim(), cap: cap ? cap.textContent.trim() : '', descId, desc, newsheet: nb ? nb.getAttribute('aria-checked') : 'hidden', order,
          docSheets: order ? Math.ceil(order.length / 2) : null,
          btn: { x: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), bottom: Math.round(r.bottom) }, openTab: { x: Math.round(o.left), w: Math.round(o.width), h: Math.round(o.height) },
          lines, labelInside: lr.left >= r.left - 0.5 && lr.right <= r.right + 0.5 && lr.top >= r.top - 0.5 && lr.bottom <= r.bottom + 0.5,
          btnClip: b.scrollWidth > b.clientWidth + 1, labClip: lab.scrollWidth > lab.clientWidth + 1, fs, cfs, capColor,
          capBox: capBox ? { x: Math.round(capBox.left), w: Math.round(capBox.width), top: Math.round(capBox.top), gapToBtn: Math.round(capBox.top - r.bottom) } : null,
          clipped, hScroll: document.documentElement.scrollWidth > innerWidth, sw: document.documentElement.scrollWidth, inViewport: r.bottom <= innerHeight && r.top >= 0, vh: innerHeight };
      }, name);
      const log = [];
      const rec = async (name) => { const s = await st(name); log.push(s);
        if (s.hScroll) fails.push(`${tag} ${name}: page scrolls sideways (scrollWidth ${s.sw})`);
        if (s.btnClip || s.labClip || !s.labelInside || s.btn.h < 44 || s.clipped.length) fails.push(`${tag} ${name}: ${JSON.stringify(s)}`);
        if (s.btn.x !== s.openTab.x || s.btn.w !== s.openTab.w) fails.push(`${tag} ${name}: misaligned btn ${JSON.stringify(s.btn)} vs open-tab ${JSON.stringify(s.openTab)}`);
        const pp = Number((s.label.match(/Print (\d+)/) || [])[1] || 0); const wantCap = s.newsheet === 'true' && / \+ key/.test(s.label);
        if (wantCap && s.cap !== `On ${2 * pp} sheets, double-sided.`) fails.push(`${tag} ${name}: caption "${s.cap}" vs preview ${s.order}`);
        if (!wantCap && s.cap) fails.push(`${tag} ${name}: caption shown "${s.cap}" newsheet ${s.newsheet}`);
        if (s.cap && s.desc !== s.cap) fails.push(`${tag} ${name}: aria-describedby mismatch`);
        if (!s.cap && s.descId) fails.push(`${tag} ${name}: dangling aria-describedby ${s.descId}`);
        return s; };
      const shot = async (name) => { await page.evaluate(() => document.querySelector('#tvSetup [data-act="print"]').scrollIntoView({ block: 'center' })); await sleep(300);
        await page.screenshot({ path: path.join(OUT, `${tag}-${name}.png`) }); };
      // initial view: where is the button at load (no scroll)?
      await page.screenshot({ path: path.join(OUT, `${tag}-0-load.png`) });
      await rec('default-end-copy');
      await click('[data-act="key-place"][data-v="after-page"]'); await rec('after-copy');
      await click('[data-act="key-newsheet"]'); await rec('after-copy-NS'); await shot('1-after-NS');
      await click('[data-act="key-style"][data-v="short"]'); await rec('after-short-NS');
      await click('[data-act="key-place"][data-v="end"]'); await rec('end-short-NS-hidden');
      await click('[data-act="key-place"][data-v="after-page"]'); await rec('after-short-NS-back');
      await click('[data-act="key-style"][data-v="copy"]'); await rec('after-copy-NS-back');
      await click('[data-act="key"]'); await rec('key-off');
      await click('[data-act="key"]'); await rec('key-on-again');
      // every letter (10 pupil pages)
      await page.evaluate(() => (async () => { for (const L of 'BCDEFGHIJ') { const c = document.querySelector(`[data-act="letter"][data-sec="0"][data-letter="${L}"]`); if (c && c.getAttribute('aria-pressed') !== 'true') { c.click(); await new Promise((r) => setTimeout(r, 150)); } } })());
      await sleep(5000); await rec('letters-A-J'); await shot('2-letters-AJ');
      // one letter only
      await page.evaluate(async () => { for (const L of 'BCDEFGHIJ') { const c = document.querySelector(`[data-act="letter"][data-sec="0"][data-letter="${L}"]`); if (c && c.getAttribute('aria-pressed') === 'true') { c.click(); await new Promise((r) => setTimeout(r, 150)); } } });
      await sleep(3000); await rec('letter-A-only');
      // second section: independent 5 pages of a subtraction skill
      await click('[data-act="add-section"]');
      await click('[data-act="pick"][data-sec="1"]');
      await page.evaluate(() => { const i = document.querySelector('#tvPick1'); i.value = 'subtract within 20'; i.dispatchEvent(new Event('input', { bubbles: true })); }); await sleep(800);
      const picked = await click('[data-act="pick-skill"][data-sec="1"]');
      await click('[data-act="types"][data-sec="1"]');
      await click('[data-act="role"][data-sec="1"][data-v="independent"]');
      await page.evaluate(() => { const s = document.querySelector('#tvPages1'); if (s) { s.value = '5'; s.dispatchEvent(new Event('change', { bubbles: true })); } }); await sleep(6000);
      const two = await rec(`two-sections picked=${picked}`); await shot('3-two-sections');
      // all letters in sec 0 too: long printout
      await page.evaluate(() => (async () => { for (const L of 'BCDEFGHIJ') { const c = document.querySelector(`[data-act="letter"][data-sec="0"][data-letter="${L}"]`); if (c && c.getAttribute('aria-pressed') !== 'true') { c.click(); await new Promise((r) => setTimeout(r, 150)); } } })());
      await sleep(8000); await rec('two-sections-long'); await shot('4-two-sections-long');
      const tabP = new Promise((res) => page.browser().once('targetcreated', async (t) => res(await t.page())));
      await page.evaluate(() => document.querySelector('#tvSetup [data-act="open-tab"]').click());
      const tp = await Promise.race([tabP, sleep(20000).then(() => null)]);
      if (tp) { await sleep(6000); const faces = await tp.evaluate(() => [...document.querySelectorAll('section.ws-page')].map((x) => ({ print: 'P', key: 'K', blank: 'B' }[x.getAttribute('data-ws-mode')] || '?')).join('')).catch((e) => 'ERR ' + e.message);
        console.log(tag, 'open-tab document faces', faces.length, faces, 'sheets', Math.ceil(faces.length / 2)); await tp.close(); } else console.log(tag, 'open-tab: no new tab');
      await click('[data-act="key-style"][data-v="short"]'); await sleep(3000); await rec('two-sections-long-short');
      await click('[data-act="key-newsheet"]'); await rec('two-sections-long-NS-off');
      console.log(tag, JSON.stringify(log.map((s) => ({ n: s.name, label: s.label, cap: s.cap, ns: s.newsheet, order: s.order && (s.order.length > 24 ? s.order.slice(0, 24) + '…(' + s.order.length + ')' : s.order), h: s.btn.h, lines: s.lines, btnTop: s.btn.top, inVp: s.inViewport, fs: s.fs, cfs: s.cfs, capColor: s.capColor, capBox: s.capBox })), null, 0));
    } finally { await app.close(); }
  }
  console.log('console errors:', errs.length, errs.slice(0, 5).join(' | '));
  console.log('FAILS:', fails.length); fails.slice(0, 30).forEach((f) => console.log(' -', f.slice(0, 600)));
})().catch((e) => { console.error(e); process.exit(1); });
