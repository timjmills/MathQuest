// Wave 1 lane C2: the teacher's option panel for count_by_tables - ONE row-list control ("Count-bys on the page":
// tables 1 to 12 as chips, a typed step, one line per row with its start and direction), at most five controls at
// rest, the rest behind a closed "More" disclosure. The script drives the REAL controls (taps chips, types a step,
// changes a row's start and direction), reads the option store, and screenshots the panel closed and open at 1280
// and 390 into design/audit/runs/wave1-C2/. Run: /tmp/mq-browser-run.sh node tests/scripts/wave1-c2-panel.cjs
const fs = require('fs');
const path = require('path');
const { ROOT, open } = require('../lib/ws-harness.cjs');
const OUT = path.join(ROOT, 'design', 'audit', 'runs', 'wave1-C2', 'panel');
fs.mkdirSync(OUT, { recursive: true });
const CAT = 'multiplication', SKILL = 'count_by_tables';
let fails = 0;
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };
const canon = (rows) => JSON.stringify((rows || []).map((r) => ({ step: r.step, start: r.start, at: r.at, dir: r.dir })));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function openPanel(page) {
  await page.evaluate(({ c, s }) => {
    if (!document.body.classList.contains('teacher-mode') && window.toggleUserRole) window.toggleUserRole();
    window.clearSetOptions({ silent: true });
    const sk = (window.SKILLS[c] || []).find((x) => x.v === s);
    window.UnifiedSkills.clear();
    window.UnifiedSkills.add({ domainId: 'x', categoryId: c, skillId: s, skillLabel: sk ? sk.l : s, categoryIcon: '', categoryName: c, domainColor: '#8b5cf6' });
    window.UnifiedSkills._syncAllImmediate();
    window.tvGo('sets');
  }, { c: CAT, s: SKILL });
  const sel = `.tv-opt-btn[data-key="${CAT}|${SKILL}"]`;
  await page.waitForSelector(sel, { timeout: 10000 });
  await page.click(sel);
  await page.waitForSelector('#skillOptionsPopover', { timeout: 5000 });
  await sleep(300);
}
const rowsNow = (page) => page.evaluate((c, s) => window.getSetOptions(c, s).rows || [], CAT, SKILL);

(async () => {
  for (const W of [1280, 390]) {
    const app = await open({ seed: 1, viewport: { width: W, height: 1100, deviceScaleFactor: 1 } });
    const { page } = app;
    await openPanel(page);
    const pop = '#skillOptionsPopover';
    // closed: at most five resting controls, More and Pupil play closed
    const rest = await page.evaluate(() => {
      const root = document.getElementById('skillOptionsPopover');
      const groups = [...root.querySelectorAll('.sko-group:not(details)')];
      const controls = groups.reduce((n, g) => n + g.querySelectorAll('.tv-sko-row').length, 0);
      const more = root.querySelector('details.sko-more'), play = root.querySelector('details.sko-play');
      return { controls, moreOpen: more ? more.open : null, moreSum: more ? more.querySelector('summary').innerText.replace(/\s+/g, ' ') : '', playOpen: play ? play.open : null, chips: root.querySelectorAll('.sko-rows-chips button').length };
    });
    check(rest.controls <= 5, `${W}: ${rest.controls} controls at rest (at most 5)`);
    check(rest.moreOpen === false && /More/.test(rest.moreSum), `${W}: More is closed and says "${rest.moreSum}"`);
    check(rest.chips === 12, `${W}: twelve table chips`);
    await (await page.$(pop)).screenshot({ path: path.join(OUT, `panel-closed-${W}.png`) });
    // drive the real controls: chip 2 (on), type 5, 25 and 1000 and Add each, then edit rows
    const click = async (fn) => { await page.evaluate(fn); await sleep(250); };
    await click(() => document.querySelector('#skillOptionsPopover .sko-rows-chips button[aria-label="Count by 2"]').click());
    for (const v of [5, 25, 1000]) {
      await page.evaluate((val) => {
        const box = document.querySelector('#skillOptionsPopover .sko-rows input[placeholder="25"]');
        box.value = String(val);
        box.nextElementSibling.click();
      }, v);
      await sleep(250);
    }
    check(JSON.stringify((await rowsNow(page)).map((r) => r.step)) === '[2,5,25,1000]', `${W}: tapped 2, typed 5, 25, 1000 -> ${JSON.stringify((await rowsNow(page)).map((r) => r.step))}`);
    // row 1 (step 2): start at 0; row 2 (5): start at a number 3; row 3 (25): custom 100, counting back; row 4: custom 2000, counting back
    const setSel = async (i, kind, value) => {
      await page.evaluate((i, kind, value) => {
        const lines = document.querySelectorAll('#skillOptionsPopover .sko-row-line');
        const el = [...lines[i].querySelectorAll('select')].find((s) => new RegExp(kind).test(s.getAttribute('aria-label')));
        el.value = value; el.dispatchEvent(new Event('change', { bubbles: true }));
      }, i, kind, value);
      await sleep(250);
    };
    const setAt = async (i, value) => {
      await page.evaluate((i, value) => {
        const el = document.querySelectorAll('#skillOptionsPopover .sko-row-line')[i].querySelector('input[aria-label$="start number"]');
        el.value = String(value); el.dispatchEvent(new Event('change', { bubbles: true }));
      }, i, value);
      await sleep(250);
    };
    await setSel(0, 'starts at', 'zero');
    await setSel(1, 'starts at', 'custom'); await setAt(1, 3);
    await setSel(2, 'starts at', 'custom'); await setAt(2, 100); await setSel(2, 'direction', 'down');
    await setSel(3, 'starts at', 'custom'); await setAt(3, 2000); await setSel(3, 'direction', 'down');
    const rows = await rowsNow(page);
    const want = [{ step: 2, start: 'zero', dir: 'up' }, { step: 5, start: 'custom', at: 3, dir: 'up' }, { step: 25, start: 'custom', at: 100, dir: 'down' }, { step: 1000, start: 'custom', at: 2000, dir: 'down' }];
    check(canon(rows) === canon(want), `${W}: rows after editing ${JSON.stringify(rows)}`);
    // remove one row and put it back through its chip
    await page.evaluate(() => document.querySelectorAll('#skillOptionsPopover .sko-row-line')[3].querySelector('button[aria-label^="Remove"]').click());
    await sleep(250);
    check((await rowsNow(page)).length === 3, `${W}: a row can be removed`);
    await page.evaluate(() => {
      const box = document.querySelector('#skillOptionsPopover .sko-rows input[placeholder="25"]');
      box.value = '1000'; box.nextElementSibling.click();
    });
    await sleep(250);
    await setSel(3, 'starts at', 'custom'); await setAt(3, 2000); await setSel(3, 'direction', 'down');
    check(canon(await rowsNow(page)) === canon(want), `${W}: the list is back to four rows`);
    // the share code carries it and gives it back
    const trip = await page.evaluate((c, s) => {
      const opts = window.getSetOptions(c, s);
      const suffix = window.optionSuffix(c, s, opts);
      return { suffix, back: window.decodeOptionPayload(c, s, suffix), packed: window.packOptions(c, s, opts) };
    }, CAT, SKILL);
    check(JSON.stringify(trip.back) === JSON.stringify(trip.packed) && /^~_1W2ZR5C3R25C100DR1000C2000D$/.test(trip.suffix), `${W}: share code ${trip.suffix} round-trips`);
    // ... and a full skill code (the form a link or MX- code carries) gives the rows back; an OLD code (ticked tables 7 and 8, "C78") becomes two rows
    const codes = await page.evaluate((c, s) => {
      const base = window.SKILL_CODES[c + ':' + s];
      const fromRows = window.parseSkillCodeParts(base + '~_1W2ZR5C3R25C100D');
      const oldCode = window.parseSkillCodeParts(base + '~C78');
      return { rows: fromRows[0] && fromRows[0].opts.rows, old: oldCode[0] && window.normalizeOptions(c, s, oldCode[0].opts).rows };
    }, CAT, SKILL);
    check(canon(codes.rows) === canon([{ step: 2, start: 'zero', dir: 'up' }, { step: 5, start: 'custom', at: 3, dir: 'up' }, { step: 25, start: 'custom', at: 100, dir: 'down' }]), `${W}: a skill code carries the rows ${JSON.stringify(codes.rows)}`);
    check(canon(codes.old) === canon([{ step: 7, start: 'step', dir: 'up' }, { step: 8, start: 'step', dir: 'up' }]), `${W}: an old code (tables 7, 8) reads as two plain rows ${JSON.stringify(codes.old)}`);
    // open More
    await page.evaluate(() => { const d = document.querySelector('#skillOptionsPopover details.sko-more'); if (d && !d.open) d.querySelector('summary').click(); });
    await sleep(250);
    const more = await page.evaluate(() => document.querySelector('#skillOptionsPopover details.sko-more').innerText.replace(/\n+/g, ' | '));
    check(/Line runs to/.test(more) && /Order of the rows/.test(more) && /Box shape/.test(more), `${W}: More holds jumps, order and shape: ${more.slice(0, 120)}`);
    const el = await page.$(pop);
    await el.screenshot({ path: path.join(OUT, `panel-open-${W}.png`) });
    await app.close();
  }
  console.log(fails ? 'wave1-c2-panel: FAIL' : 'wave1-c2-panel: OK');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
