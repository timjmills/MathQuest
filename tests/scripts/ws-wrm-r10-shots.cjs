// ws-wrm-r10-shots.cjs — evidence PNGs for WRM page round 10 (design/audit/runs/wrm-page/r10-builder-*.png):
//   Skills to be made with mult_4x1 / map_share_among / patterns_notice open (1280 and 390), the Grade 3 OA domain
//   list in the live site's order with its CCSS BUILD lessons (1280), and the Grade 3 "Properties of multiplication"
//   lesson with its detailed card (m20, 1280 and 390).
//   node tests/scripts/ws-wrm-r10-shots.cjs
const path = require('path');
const fs = require('fs');
const { open, waitFor } = require('../lib/ws-harness.cjs');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'design', 'audit', 'runs', 'wrm-page');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const app = await open({ seed: 11, viewport: { width: 1280, height: 720, deviceScaleFactor: 1 } });
  const { page, browser, base } = app;
  const fails = [];
  const teacher = async () => { await waitFor(page, () => typeof window.setUserRole === 'function' && typeof window.tvGo === 'function', 30000, 'boot'); await page.evaluate(() => window.setUserRole('teacher')); await sleep(300); };
  const shot = (n) => page.screenshot({ path: path.join(OUT, `${n}.png`) });
  try {
    await page.goto(`${base}/index.html`, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.evaluate(() => { try { localStorage.setItem('mq_teacher_skill_view', JSON.stringify('list')); } catch (e) {} window.setUserRole('teacher'); });
    await sleep(300);
    for (const [vw, vh, touch] of [[1280, 720, false], [390, 844, true]]) {
      await page.setViewport({ width: vw, height: vh, deviceScaleFactor: 1, isMobile: touch, hasTouch: touch });
      await page.goto(`${base}/index.html`, { waitUntil: 'networkidle2', timeout: 60000 });
      await waitFor(page, () => typeof window.setUserRole === 'function' && typeof window.tvGo === 'function', 30000, 'boot');
      await page.evaluate(() => window.setUserRole('teacher'));
      await sleep(300);
      for (const id of ['mult_4x1', 'map_share_among', 'patterns_notice']) {
        await page.evaluate(() => window.tvGo('todo'));
        await waitFor(page, () => !!document.querySelector('.tvt-item'), 20000, 'todo list');
        await page.evaluate(() => { const c = document.querySelector('[data-t-act="clear"]'); if (c) c.click(); });
        await sleep(150);
        const found = await page.evaluate((id) => {
          const b = document.querySelector(`.tvt-item .tvt-row[data-t-open="${CSS.escape(id)}"]`);
          if (!b) return null;
          if (b.getAttribute('aria-expanded') !== 'true') b.click();
          const li = document.querySelector(`[data-t-item="${CSS.escape(id)}"]`);
          const dl = [...li.querySelectorAll('.tvt-spec dt')].map((d) => [d.textContent, d.nextElementSibling ? d.nextElementSibling.textContent.replace(/\s+/g, ' ').trim() : '']);
          li.scrollIntoView({ block: 'start' });
          return dl;
        }, id);
        if (!found) { fails.push(`todo ${id} not found`); continue; }
        const looks = (found.find((x) => x[0] === 'How it looks') || [])[1] || '(no How it looks line)';
        console.log(`${vw} ${id}: How it looks = ${looks}`);
        await sleep(200);
        await page.evaluate(() => window.scrollBy(0, -70));
        await shot(`r10-builder-todo-${id}-${vw}`);
      }
    }
    // Grade 3 OA in the site's order, CCSS BUILD lessons in place
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
    await page.goto("about:blank");
    await page.goto(`${base}/index.html#wrm/3/D1`, { waitUntil: 'networkidle2', timeout: 60000 });
    await teacher();
    await waitFor(page, () => !!document.querySelector('[data-screen="wrm"] .tvw-lesson'), 20000, 'wrm').catch(async (e) => {
      console.log('debug', await page.evaluate(() => ({ h: location.hash, act: (document.querySelector('#teacherMain .tv-screen.is-active') || {}).dataset?.screen, role: document.body.className.slice(0, 120) })));
      throw e;
    });
    const rows = await page.$$eval('[data-screen="wrm"] .tvw-lesson', (b) => b.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
    console.log(`G3 D1 rows: ${rows.length}; CCSS BUILD rows: ${rows.filter((r) => /CCSS/.test(r)).length}`);
    await page.evaluate(() => { const r = [...document.querySelectorAll('[data-screen="wrm"] .tvw-lesson')].find((x) => /Properties of multiplication/.test(x.textContent)); if (r) r.scrollIntoView({ block: 'center' }); });
    await sleep(200);
    await shot('r10-builder-g3-oa-site-order-1280');
    // the detailed lesson card and its untagged lesson (m20)
    for (const [vw, vh, touch] of [[1280, 720, false], [390, 844, true]]) {
      await page.setViewport({ width: vw, height: vh, deviceScaleFactor: 1, isMobile: touch, hasTouch: touch });
      await page.goto("about:blank");
      await page.goto(`${base}/index.html#wrm/3/D1/propertiesofmultiplicationcommutativeidentityanddistributive`, { waitUntil: 'networkidle2', timeout: 60000 });
      await teacher();
      await waitFor(page, () => !!document.querySelector('[data-screen="wrm"] .tvw-head'), 20000, 'lesson');
      await sleep(800);
      const t = await page.evaluate(() => ({ title: document.querySelector('.tvw-title').textContent.trim(), card: !!document.querySelector('.tvw-dl'),
        verdict: document.querySelector('.tvw-verdict').textContent.trim(), empty: (document.querySelector('[data-w-group="direct"]') || {}).textContent }));
      console.log(`${vw} lesson: ${t.title} | card ${t.card} | verdict: ${t.verdict} | direct: ${(t.empty || '').replace(/\s+/g, ' ').trim().slice(0, 160)}`);
      if (!t.card) fails.push(`${vw}: no detailed card on Properties of multiplication`);
      await page.evaluate(() => { const c = document.querySelector('.tvw-dl'); if (c) c.scrollIntoView({ block: 'start' }); window.scrollBy(0, -80); });
      await sleep(200);
      await shot(`r10-builder-g3-properties-dl-${vw}`);
    }
  } catch (e) { fails.push(String(e && e.stack || e)); }
  const probs = (app.problems || []).filter((p) => !/favicon/.test(p.text));
  if (probs.length) console.log('console problems:', JSON.stringify(probs.slice(0, 5)));
  await app.close();
  console.log(fails.length ? `ws-wrm-r10-shots: FAIL\n${fails.join('\n')}` : 'ws-wrm-r10-shots: OK');
  process.exit(fails.length ? 1 : 0);
})();
