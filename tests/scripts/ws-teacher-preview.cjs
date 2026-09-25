// Teacher skill previews: the List | Thumbnails toggle on "Send a skill set", the lazily drawn
// thumbnail grid, the floating hover / focus / (i) preview of a skill row, a set chip and a Run
// pill, and the "what pupils see" preview of each type of practice (Run practice mode cards, the
// Send Mode picker). A chip's options travel into its sample (×7/×8 previews a ×7 or ×8 fact).
//
//   node tests/scripts/ws-teacher-preview.cjs
//   SHOTS=/some/dir node tests/scripts/ws-teacher-preview.cjs   # also save screenshots
const fs = require('fs');
const path = require('path');
const { open, waitFor } = require('../lib/ws-harness.cjs');

const SHOTS = process.env.SHOTS || '';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const failures = [];
  const fail = (m) => failures.push(m);
  if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
  const app = await open({ viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
  const { page } = app;
  const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `${name}.png`) }); };

  // The pop's rect, whether it is inside the viewport and whether it covers a point.
  const popInfo = (pt) => page.evaluate((pt) => {
    const p = document.getElementById('tvSkillPreview');
    if (!p || p.hidden) return { open: false };
    const r = p.getBoundingClientRect();
    const vw = document.documentElement.clientWidth, vh = window.innerHeight;
    return {
      open: true,
      inside: r.left >= 0 && r.top >= 0 && r.right <= vw && r.bottom <= vh,
      covers: pt ? (pt.x >= r.left && pt.x <= r.right && pt.y >= r.top && pt.y <= r.bottom) : false,
      text: p.textContent.replace(/\s+/g, ' ').trim(),
      sample: (p.querySelector('.tvp-pop-frame') || {}).getAttribute ? p.querySelector('.tvp-pop-frame').getAttribute('aria-label') : '',
      drawn: !!p.querySelector('.tvp-stage, .tvp-unavail'),
      cells: p.querySelectorAll('.tvp-mcell .tvp-stage').length,
      mode: (p.querySelector('.tvp-mode-frame') || {}).dataset ? p.querySelector('.tvp-mode-frame').dataset.mode : null,
    };
  }, pt);
  const hoverCenter = async (sel) => {
    const found = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      el.scrollIntoView({ block: 'center', behavior: 'instant' });
      return true;
    }, sel);
    await sleep(250);
    const box = !found ? null : await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      const a = el.querySelector('[data-tvp-anchor]') || el;
      const r = a.getBoundingClientRect();
      return { x: r.left + Math.min(r.width / 2, 60), y: r.top + r.height / 2 };
    }, sel);
    if (!box) throw new Error(`no element ${sel}`);
    await page.mouse.move(5, 5);
    await sleep(80);
    await page.mouse.move(box.x, box.y, { steps: 4 });
    await sleep(700);
    return box;
  };

  // The (i) buttons follow the pointer in use (html.tvp-touch): a mouse move means a desktop, a
  // touch tap means a touch screen. Headless Chrome cannot emulate the hover media feature.
  const setPointer = async (hover) => {
    if (hover) { await page.mouse.move(3, 3); await page.mouse.move(4, 4); } else await page.touchscreen.tap(700, 12);
    await sleep(60);
  };

  try {
    await setPointer(true);
    await page.evaluate(() => { localStorage.setItem('mq_teacher_skill_view', 'list'); window.setUserRole('teacher'); });
    await waitFor(page, () => document.body.classList.contains('teacher-mode'), 10000, 'teacher mode');
    await page.evaluate(() => { window.UnifiedSkills.clear(); window.tvGo('sets'); });
    await waitFor(page, () => !!document.querySelector('#tvBrowser .tv-tree-btn'), 10000, 'sets screen');
    const liveBefore = await page.evaluate(() => ({ c: window.state.category, s: window.state.skill, r: window.state.range }));

    // ---- List view, hover a row
    await page.evaluate(() => {
      const d = document.querySelector('[data-toggle="number_operations"]') || document.querySelector('#tvBrowser .tv-tree-btn');
      d.click();
    });
    await page.evaluate(() => {
      const c = document.querySelector('[data-toggle$="/multiplication"]') || document.querySelector('#tvBrowser .tv-tree-cat');
      c.click();
    });
    await waitFor(page, () => !!document.querySelector('.tv-skill-row[data-tvp]'), 5000, 'skill rows');
    const toggle = await page.evaluate(() => [...document.querySelectorAll('#tvViewSeg [data-act="skill-view"]')].map((b) => `${b.dataset.view}:${b.getAttribute('aria-checked')}`).join(','));
    if (toggle !== 'list:true,thumbs:false') fail(`view toggle state ${toggle}`);
    await shot('sets-list-1280');

    const rowSel = '.tv-skill-row[data-tvp="multiplication|mult_facts"]';
    const pt = await hoverCenter(rowSel);
    let info = await popInfo(pt);
    if (!info.open) fail('hover on a list row did not open the preview');
    else {
      if (!info.inside) fail('row preview is outside the viewport');
      if (info.covers) fail('row preview covers the pointer');
      if (!info.drawn) fail('row preview has no sample');
      if (!/Multiplication Facts/.test(info.text)) fail(`row preview names the wrong skill: ${info.text.slice(0, 80)}`);
      const described = await page.evaluate((sel) => document.querySelector(sel).getAttribute('aria-describedby'), rowSel);
      if (described !== 'tvSkillPreview') fail(`aria-describedby on the row is ${described}`);
    }
    await shot('sets-list-hover-row-1280');
    await page.mouse.move(5, 5);
    await sleep(150);
    if ((await popInfo()).open) fail('preview did not hide on mouseleave');

    // ---- keyboard focus shows it; Escape hides it
    await page.evaluate((sel) => {
      const rows = [...document.querySelectorAll('.tv-skill-row[data-tvp]')];
      const i = rows.findIndex((r) => r.matches(sel));
      (rows[i - 1] || rows[0]).querySelector('.tv-add').focus();
    }, rowSel);
    await page.keyboard.press('Tab');
    await sleep(600);
    info = await popInfo();
    if (!info.open) fail('keyboard focus did not open the preview');
    const focusDesc = await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('aria-describedby'));
    if (info.open && focusDesc !== 'tvSkillPreview') fail(`focused control is not described by the preview (${focusDesc})`);
    await page.keyboard.press('Escape');
    await sleep(50);
    if ((await popInfo()).open) fail('Escape did not hide the preview');

    // ---- a set chip carrying ×7/×8
    await page.evaluate(() => {
      document.querySelector('.tv-skill-row[data-tvp="multiplication|mult_facts"] .tv-add').click();
      const item = window.UnifiedSkills.skills.find((s) => s.categoryId === 'multiplication' && s.skillId === 'mult_facts');
      item.opts = { constant: [7, 8] };
      window.skillQueue = [...window.UnifiedSkills.skills];
      document.querySelector('.tv-skill-row[data-tvp="multiplication|add_facts"], .tv-skill-row[data-tvp^="multiplication|"]:not([data-tvp$="mult_facts"]) .tv-add')?.click();
      window.tvGo('sets');
    });
    const chipSel = '#tvSetList .tvp-name[data-tvp="multiplication|mult_facts"]';
    await waitFor(page, () => !!document.querySelector('#tvSetList .tvp-name[data-tvp="multiplication|mult_facts"]'), 5000, 'set chip').catch(() => {});
    const chipOk = await page.evaluate((sel) => !!document.querySelector(sel), chipSel);
    if (!chipOk) fail('mult_facts set chip missing');
    else {
      const cpt = await hoverCenter(chipSel);
      info = await popInfo(cpt);
      if (!info.open) fail('hover on a set chip did not open the preview');
      else {
        if (!/Times: 7, 8/.test(info.text)) fail(`chip preview does not show the options: ${info.text.slice(0, 120)}`);
        if (!/(^|\D)[78]\s*[×x]\s*\d|\d\s*[×x]\s*[78](\D|$)/.test(info.sample || '')) fail(`chip sample is not a ×7/×8 fact: ${info.sample}`);
        if (info.covers) fail('chip preview covers the pointer');
        if (!info.inside) fail('chip preview is outside the viewport');
      }
      await shot('sets-chip-hover-x7x8-1280');
      await page.mouse.move(5, 5);
      await sleep(100);
    }

    // ---- (i) button path (touch): shown only without hover; pins; tap outside closes
    const infoShownDesktop = await page.evaluate((sel) => getComputedStyle(document.querySelector(`${sel} [data-tvp-info]`)).display !== 'none', chipSel);
    if (infoShownDesktop) fail('(i) button is shown where the pointer can hover');
    await setPointer(false);
    const infoBox = await page.evaluate((sel) => {
      const b = document.querySelector(`${sel} [data-tvp-info]`);
      if (getComputedStyle(b).display === 'none') return null;
      const r = b.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }, chipSel);
    if (!infoBox) fail('(i) button is hidden on a touch screen');
    else await page.touchscreen.tap(infoBox.x, infoBox.y);
    await sleep(80);
    info = await popInfo(infoBox);
    const pinned = await page.evaluate(() => document.querySelector('#tvSetList [data-tvp-info][aria-expanded="true"]') !== null);
    if (!info.open || !pinned) fail('(i) button did not open a pinned preview');
    if (info.covers) fail('pinned preview covers the (i) button');
    await shot('sets-chip-info-touch-1280');
    await page.touchscreen.tap(700, 20);
    await sleep(80);
    if ((await popInfo()).open) fail('tap outside did not close the pinned preview');
    await setPointer(true);

    // ---- Thumbnails
    await page.evaluate(() => document.querySelector('[data-act="skill-view"][data-view="thumbs"]').click());
    await waitFor(page, () => document.querySelectorAll('.tvp-card').length > 0, 5000, 'thumbnail cards');
    const stored = await page.evaluate(() => localStorage.getItem('mq_teacher_skill_view'));
    if (stored !== '"thumbs"') fail(`view choice not persisted (${stored})`);
    const initial = await page.evaluate(() => document.querySelectorAll('.tvp-card').length);
    if (initial > 48) fail(`initial thumbnail render not capped (${initial})`);
    if (initial < 20) fail(`too few thumbnails (${initial})`);
    await sleep(1200);
    const drawn = await page.evaluate(() => document.querySelectorAll('.tvp-card .tvp-frame[data-tvp-done]').length);
    if (!drawn) fail('no thumbnail was drawn');
    if (drawn >= initial) fail(`thumbnails are not lazy (${drawn} of ${initial} drawn up front)`);
    const unavailable = await page.evaluate(() => document.querySelectorAll('.tvp-card .tvp-frame.is-unavailable').length);
    await shot('sets-thumbs-1280');
    await page.evaluate(() => { const b = document.getElementById('tvBrowser'); b.scrollTop = b.scrollHeight; });
    await sleep(900);
    const drawn2 = await page.evaluate(() => document.querySelectorAll('.tvp-card .tvp-frame[data-tvp-done]').length);
    if (drawn2 <= drawn) fail('scrolling did not draw more thumbnails');
    await page.evaluate(() => document.querySelector('[data-act="more-thumbs"]').click());
    const more = await page.evaluate(() => document.querySelectorAll('.tvp-card').length);
    if (more <= initial) fail('"Show more" did not add cards');
    // add from a card: updates in place
    await page.evaluate(() => document.getElementById('tvBrowser').scrollTo(0, 0));
    await sleep(500);
    const addOk = await page.evaluate(() => {
      const card = document.querySelector('.tvp-card:not(.is-added)');
      const frameBefore = card.querySelector('.tvp-frame').innerHTML;
      card.querySelector('.tv-add').click();
      const again = document.querySelector(`.tvp-card[data-card="${card.dataset.card}"]`);
      return again === card && card.classList.contains('is-added') && card.querySelector('.tvp-frame').innerHTML === frameBefore;
    });
    if (!addOk) fail('adding from a thumbnail card did not update the card in place');

    // ---- Run practice: a pill and the types of practice
    await page.evaluate(() => window.tvGo('run'));
    await waitFor(page, () => !!document.querySelector('.tvp-mode-wrap[data-tvp-mode]'), 5000, 'run screen');
    const pillSel = '.tv-pill[data-tvp="multiplication|mult_facts"]';
    const ppt = await hoverCenter(pillSel);
    info = await popInfo(ppt);
    if (!info.open || !/Times: 7, 8/.test(info.text)) fail('Run pill preview missing or without options');
    await page.mouse.move(5, 5);
    await sleep(100);
    const modes = await page.evaluate(() => [...document.querySelectorAll('.tvp-mode-wrap[data-tvp-mode]')].map((w) => w.dataset.tvpMode));
    for (const m of ['practice', 'boss', 'race', 'worksheet', 'board']) if (!modes.includes(m)) fail(`mode card ${m} has no preview`);
    for (const m of modes) {
      const mpt = await hoverCenter(`.tvp-mode-wrap[data-tvp-mode="${m}"]`);
      info = await popInfo(mpt);
      if (!info.open || info.mode !== m) { fail(`mode ${m}: preview did not open`); continue; }
      if (!info.inside) fail(`mode ${m}: preview outside the viewport`);
      if (info.covers) fail(`mode ${m}: preview covers the pointer`);
      if (!info.cells) fail(`mode ${m}: no sample item in the schematic`);
      if (m === 'boss' || m === 'worksheet') await shot(`run-mode-${m}-hover-1280`);
      await page.mouse.move(5, 5);
      await sleep(80);
    }
    // keyboard on a mode card
    await page.evaluate(() => document.querySelector('.tvp-mode-wrap[data-tvp-mode="practice"] .tv-mode').focus());
    await page.keyboard.press('Tab');
    await sleep(600);
    info = await popInfo();
    const act = await page.evaluate(() => document.activeElement && document.activeElement.outerHTML.slice(0, 120));
    if (!info.open || info.mode !== 'boss') fail(`keyboard focus on a mode card (${act}): ${JSON.stringify({ open: info.open, mode: info.mode })}`);
    await page.keyboard.press('Escape');
    // (i) on a mode card
    await page.evaluate(() => document.querySelector('.tvp-mode-wrap[data-tvp-mode="board"] [data-tvp-info]').click());
    await sleep(80);
    info = await popInfo();
    if (!info.open || info.mode !== 'board') fail('(i) on a mode card did not open its preview');
    await page.mouse.click(700, 20);

    // Send panel Mode picker
    await page.evaluate(() => window.tvGo('sets'));
    await sleep(200);
    const sendMode = await page.evaluate(() => { const w = document.querySelector('#tvSendPanel [data-tvp-mode]'); return w ? w.dataset.tvpMode : null; });
    if (!sendMode) fail('Send panel Mode picker has no preview');

    // ---- 820 wide, dark once
    await page.setViewport({ width: 820, height: 1100, deviceScaleFactor: 1 });
    await sleep(300);
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot('sets-thumbs-820');
    await page.evaluate(() => document.querySelector('[data-act="skill-view"][data-view="list"]').click());
    await sleep(200);
    await shot('sets-list-820');
    const r820 = await hoverCenter('#tvSetList .tvp-name[data-tvp="multiplication|mult_facts"]');
    info = await popInfo(r820);
    if (!info.open || !info.inside || info.covers) fail(`820: chip preview ${JSON.stringify({ open: info.open, inside: info.inside, covers: info.covers })}`);
    await shot('sets-chip-hover-820');
    await page.mouse.move(5, 5);
    await page.evaluate(() => { document.documentElement.classList.add('dark'); document.querySelector('[data-act="skill-view"][data-view="thumbs"]').click(); });
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    await sleep(1200);
    await hoverCenter('#tvSetList .tvp-name[data-tvp="multiplication|mult_facts"]');
    await shot('sets-thumbs-dark-1280');
    await page.mouse.move(5, 5);
    await page.evaluate(() => { window.tvGo('run'); });
    await sleep(200);
    await hoverCenter('.tvp-mode-wrap[data-tvp-mode="race"]');
    await shot('run-mode-race-hover-dark-1280');
    await page.mouse.move(5, 5);
    await page.evaluate(() => document.documentElement.classList.remove('dark'));

    const liveAfter = await page.evaluate(() => ({ c: window.state.category, s: window.state.skill, r: window.state.range }));
    if (JSON.stringify(liveBefore) !== JSON.stringify(liveAfter)) fail(`live state changed: ${JSON.stringify(liveBefore)} -> ${JSON.stringify(liveAfter)}`);

    if (unavailable) console.log(`  note: ${unavailable} of the first thumbnails show "Preview unavailable"`);
    if (app.problems.length) fail(`console/page errors: ${app.problems.slice(0, 5).map((p) => `[${p.type}] ${p.text}`).join(' | ')}`);
  } catch (e) {
    fail(e.stack || e.message);
  } finally {
    await app.close();
  }
  if (failures.length) { console.error('ws-teacher-preview: FAIL'); failures.forEach((f) => console.error('  - ' + f)); process.exit(1); }
  console.log('ws-teacher-preview: OK');
})();
