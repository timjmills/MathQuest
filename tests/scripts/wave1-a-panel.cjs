// Wave 1 lane A: the teacher's per-skill option panel offers `skipAfter` and `calculator`, and the
// panel (screenshot) shows both. Run: /tmp/mq-browser-run.sh node tests/scripts/wave1-a-panel.cjs
const fs = require('fs');
const path = require('path');
const { ROOT, open } = require('../lib/ws-harness.cjs');
const OUT = path.join(ROOT, 'design', 'audit', 'runs', 'wave1-A');
fs.mkdirSync(OUT, { recursive: true });
const SKILLS = ['addition:add_facts', 'multiplication:mult_facts', 'measurement:time_5min'];
let fails = 0;
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };

(async () => {
  const app = await open({ seed: 1, viewport: { width: 1280, height: 1100, deviceScaleFactor: 1 } });
  const { page } = app;
  for (const ref of SKILLS) {
    const [categoryId, skillId] = ref.split(':');
    const ids = await page.evaluate((c, s) => window.offeredOptionsFor(c, s).map((o) => o.id), categoryId, skillId);
    check(ids.includes('skipAfter') && ids.includes('calculator'), `${ref} offeredOptionsFor has skipAfter and calculator (${ids.join(',')})`);
    const trip = await page.evaluate((c, s) => {
      const opts = { skipAfter: 3, calculator: true };
      const packed = window.packOptions(c, s, opts);
      const back = window.decodeOptionPayload(c, s, window.optionSuffix(c, s, opts));
      return { packed, back };
    }, categoryId, skillId);
    check(JSON.stringify(trip.packed) === JSON.stringify(trip.back) && trip.back.skipAfter === 3 && trip.back.calculator === true,
      `${ref} share code round trip ${JSON.stringify(trip.back)}`);
    await page.evaluate(({ categoryId, skillId }) => {
      if (!document.body.classList.contains('teacher-mode') && window.toggleUserRole) window.toggleUserRole();
      const s = (window.SKILLS[categoryId] || []).find((x) => x.v === skillId);
      window.UnifiedSkills.clear();
      window.UnifiedSkills.add({ domainId: 'x', categoryId, skillId, skillLabel: s ? s.l : skillId, categoryIcon: '', categoryName: categoryId, domainColor: '#8b5cf6' });
      window.UnifiedSkills._syncAllImmediate();
      window.tvGo('sets');
    }, { categoryId, skillId });
    const sel = `.tv-opt-btn[data-key="${categoryId}|${skillId}"]`;
    try {
      await page.waitForSelector(sel, { timeout: 10000 });
      await page.click(sel);
      await page.waitForSelector('#skillOptionsPopover', { timeout: 5000 });
      await new Promise((r) => setTimeout(r, 300));
      // Calculator and Skip live in the "Pupil play" disclosure (group 'play'): its summary names both
      // values at rest; opening it shows both controls.
      const play = await page.evaluate(() => {
        const d = document.querySelector('#skillOptionsPopover details.sko-play');
        return d ? { summary: d.querySelector('summary').innerText.replace(/\s+/g, ' ') } : null;
      });
      check(!!play && /Pupil play/i.test(play.summary) && /Calculator/i.test(play.summary) && /Skip/i.test(play.summary), `${ref} Pupil play summary names both settings: ${play ? play.summary : 'no disclosure'}`);
      await page.evaluate(() => { const d = document.querySelector('#skillOptionsPopover details.sko-play'); if (d && !d.open) d.querySelector('summary').click(); });
      await new Promise((r) => setTimeout(r, 200));
      const text = await page.evaluate(() => document.getElementById('skillOptionsPopover').innerText.replace(/\n+/g, ' | '));
      check(/Skip appears after/i.test(text) && /Calculator/i.test(text), `${ref} opened Pupil play shows both controls: ${text.slice(0, 200)}`);
      const el = await page.$('#skillOptionsPopover');
      await el.screenshot({ path: path.join(OUT, `option-panel-${categoryId}-${skillId}.png`) });
      await page.evaluate(() => { const p = document.getElementById('skillOptionsPopover'); if (p) p.remove(); });
    } catch (e) { check(false, `${ref} panel did not open: ${e.message}`); }
  }
  await app.close();
  console.log(fails ? 'wave1-a-panel: FAIL' : 'wave1-a-panel: OK');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
