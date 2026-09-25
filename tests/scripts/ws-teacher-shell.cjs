// The teacher shell: focus, overlays, targets and the screens changed in shell pass 2.
//
//   - Tab never leaves the teacher app (the hidden pupil UI is inert in teacher mode).
//   - tvGo() closes any open legacy overlay; legacy scrims cover the sidebar.
//   - Every visible teacher control is at least 44 px tall (and wide, unless it holds text).
//   - The skill options popover stays in the viewport at 820 with Done visible, in the teacher
//     accent, names the skill and draws a live sample.
//   - The board code has no "|" and names the set; the Send screen's Create link is on screen.
//   - Print: the preview sits beside the controls at 1280, the page type is picked from cards of
//     the working types only, and the Score denominator counts the items.
//   - The classic print dialog is retired for teachers: its entry points open the Print screen.
//     openSimplePrintDialog() with no arguments does not throw (either role).
//   - The game started by a teacher is headed by the set's name.
//   - No console errors.
//
//   node tests/scripts/ws-teacher-shell.cjs
//   SHOTS=/some/dir node tests/scripts/ws-teacher-shell.cjs   # also save screenshots
const fs = require('fs');
const path = require('path');
const { open } = require('../lib/ws-harness.cjs');

const SHOTS = process.env.SHOTS || '';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SCREENS = ['home', 'sets', 'print', 'run', 'quizzes', 'settings', 'progress'];

(async () => {
  const failures = [];
  const fail = (m) => failures.push(m);
  if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
  const app = await open({ viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
  const { page } = app;
  const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `${name}.png`) }); };

  await page.evaluate(() => {
    try { localStorage.removeItem('mq_teacher_sets'); } catch (e) { /* */ }
    window.setUserRole('teacher');
    window.UnifiedSkills.clear();
    const add = (c, s) => window.UnifiedSkills.add({ domainId: window.getDomainByCategory(c), categoryId: c, skillId: s, skillLabel: s });
    add('addition', 'add_facts'); add('multiplication', 'mult_facts'); add('subtraction', 'sub_facts'); add('addition', 'add');
  });

  /* ------------------------------------------------------------ 1 focus stays in the teacher app */
  for (const key of SCREENS) {
    await page.evaluate((k) => { window.tvGo(k); document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0); }, key);
    await sleep(key === 'print' ? 1500 : 300);
    const leaks = [];
    let steps = 0;
    await page.evaluate(() => document.body.focus());
    for (let i = 0; i < 160; i++) {
      await page.keyboard.press('Tab');
      const where = await page.evaluate(() => {
        const a = document.activeElement;
        if (!a || a === document.body || a === document.documentElement) return 'body';
        if (a.closest('#teacherApp')) return 'app';
        return `${a.tagName}.${String(a.className).slice(0, 40)}#${a.id}`;
      });
      steps++;
      if (where === 'body') break;
      if (where !== 'app') leaks.push(where);
    }
    if (leaks.length) fail(`${key}: Tab left the teacher app into ${[...new Set(leaks)].slice(0, 4).join(', ')}`);
    if (steps < 3) fail(`${key}: Tab reached only ${steps} controls`);
  }

  /* ------------------------------------------------------------ 2 targets ≥ 44 px */
  for (const key of SCREENS) {
    await page.evaluate((k) => window.tvGo(k), key);
    await sleep(key === 'print' ? 1500 : 300);
    const small = await page.evaluate(() => {
      const out = [];
      const sel = '#teacherApp button, #teacherApp a[href], #teacherApp select, #teacherApp input, #teacherApp [role="switch"], #teacherApp summary';
      for (const el of document.querySelectorAll(sel)) {
        if (el.closest('[inert]') || el.tabIndex < 0) continue;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden') continue;
        const wide = el.tagName === 'INPUT' || el.tagName === 'SELECT' || (el.textContent || '').trim().length > 2;
        if (r.height < 43.5 || (!wide && r.width < 43.5)) out.push(`${el.tagName}.${String(el.className).split(' ')[0]} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
      return out;
    });
    if (small.length) fail(`${key}: ${small.length} controls under 44 px: ${small.slice(0, 5).join(' | ')}`);
  }

  /* ------------------------------------------------------------ 3 legacy overlays */
  const ov = await page.evaluate(async () => {
    const r = {};
    window.tvGo('home');
    await new Promise((res) => setTimeout(res, 50));
    r.panelInertClosed = document.getElementById('settingsPanel').inert === true;
    r.homeInert = document.getElementById('homeView').inert === true;
    window.openSettingsPanel();
    await new Promise((res) => setTimeout(res, 50));
    r.panelInertOpen = document.getElementById('settingsPanel').inert;
    r.appInertOpen = document.getElementById('teacherApp').inert;
    window.closeSettingsPanel();
    window.openMixedSettings();
    await new Promise((res) => setTimeout(res, 100));
    const hit = document.elementFromPoint(100, 450);
    r.scrimCoversSidebar = !!hit && !hit.closest('#teacherApp');
    window.tvGo('sets');
    await new Promise((res) => setTimeout(res, 100));
    r.mixedClosed = getComputedStyle(document.getElementById('mixedSettingsModal')).display === 'none';
    r.appInertAfter = document.getElementById('teacherApp').inert;
    return r;
  });
  if (!ov.panelInertClosed) fail('the closed Advanced Settings panel is not inert');
  if (!ov.homeInert) fail('#homeView is not inert behind a teacher screen');
  if (ov.panelInertOpen) fail('the open Advanced Settings panel is inert');
  if (!ov.appInertOpen) fail('the teacher app is not inert behind the open settings panel');
  if (!ov.scrimCoversSidebar) fail('a legacy modal scrim does not cover the sidebar');
  if (!ov.mixedClosed) fail('tvGo() left the mixed settings modal open');
  if (ov.appInertAfter) fail('the teacher app stayed inert after tvGo() closed the modal');

  /* ------------------------------------------------------------ 4 Send: bar, popover, board code */
  await page.evaluate(() => { window.tvGo('sets'); window.scrollTo(0, 0); });
  await sleep(500);
  const bar = await page.evaluate(() => {
    const b = document.querySelector('#tvSetsBar [data-act="create"]');
    if (!b || document.getElementById('tvSetsBar').hidden) return { ok: false };
    const r = b.getBoundingClientRect();
    return { ok: r.bottom <= window.innerHeight && r.top >= 0 };
  });
  if (!bar.ok) fail('Send: Create link is not on screen at 1280');
  await shot('sets-1280');

  await page.setViewport({ width: 820, height: 900, deviceScaleFactor: 1 });
  await sleep(300);
  await page.evaluate(() => { const b = document.querySelector('[data-act="options"][data-key="multiplication|mult_facts"]'); b.scrollIntoView({ block: 'center' }); b.click(); });
  await sleep(1300);
  const pop = await page.evaluate(() => {
    const el = document.getElementById('skillOptionsPopover');
    if (!el) return { open: false };
    const r = el.getBoundingClientRect();
    const vw = document.documentElement.clientWidth, vh = window.innerHeight;
    const done = [...el.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Done');
    const dr = done ? done.getBoundingClientRect() : null;
    const atDone = dr ? document.elementFromPoint(dr.left + dr.width / 2, dr.top + dr.height / 2) : null;
    const accent = getComputedStyle(document.body).getPropertyValue('--tv-accent').trim();
    return {
      open: true,
      inside: r.left >= 0 && r.top >= 0 && r.right <= vw + 0.5 && r.bottom <= vh + 0.5,
      doneVisible: !!(done && atDone && done.contains(atDone)),
      doneBg: done ? getComputedStyle(done).backgroundColor : '',
      accent,
      title: (el.querySelector('.tv-sko-title') || {}).textContent || '',
      sample: !!el.querySelector('.tv-sko-frame .tvp-stage'),
      jargon: /generator|option could change/i.test(el.textContent),
      purple: el.innerHTML.includes('#6d28d9'),
    };
  });
  await shot('sets-options-820');
  if (!pop.open) fail('Options did not open the popover');
  else {
    if (!pop.inside) fail('the options popover is not inside the viewport at 820');
    if (!pop.doneVisible) fail('Done is not visible on the options popover at 820');
    if (pop.doneBg !== 'rgb(59, 75, 200)') fail(`Done is not the teacher accent (${pop.doneBg})`);
    if (!/Multiplication Facts/.test(pop.title)) fail(`the popover is not headed by the skill name ("${pop.title}")`);
    if (!pop.sample) fail('the popover draws no sample');
    if (pop.jargon) fail('the popover still uses developer wording');
    if (pop.purple) fail('the popover still uses the purple accent');
  }
  // A change re-draws the sample with the new choice.
  const after = await page.evaluate(async () => {
    const el = document.getElementById('skillOptionsPopover');
    const none = [...el.querySelectorAll('button')].find((b) => b.textContent.trim() === 'None');
    none.click();
    await new Promise((r) => setTimeout(r, 100));
    const box = [...document.querySelectorAll('#skillOptionsPopover label')].find((l) => l.textContent.trim().startsWith('7'));
    box.querySelector('input').click();
    await new Promise((r) => setTimeout(r, 300));
    const sum = document.querySelector('#skillOptionsPopover .tv-sko-sum').textContent;
    const frame = document.querySelector('#skillOptionsPopover .tv-sko-frame');
    return { sum, sample: frame ? frame.getAttribute('aria-label') || '' : '' };
  });
  if (!/7/.test(after.sum)) fail(`the popover summary did not follow the change ("${after.sum}")`);
  if (!/7/.test(after.sample)) fail(`the sample did not follow the change ("${after.sample}")`);
  await page.keyboard.press('Escape');
  await sleep(100);
  if (await page.evaluate(() => !!document.getElementById('skillOptionsPopover'))) fail('Esc did not close the popover');

  await page.evaluate(() => {
    const n = document.querySelector('#tvSetName'); n.value = 'Friday facts'; n.dispatchEvent(new Event('input', { bubbles: true }));
    (document.querySelector('#tvSetsBar [data-act="create"]') || document.querySelector('#tvSendPanel [data-act="create"]')).click();
  });
  await sleep(900);
  const resultOnScreen = await page.evaluate(() => {
    const r = document.querySelector('#tvSendPanel .tv-result');
    if (!r) return false;
    const b = r.getBoundingClientRect();
    return b.top < window.innerHeight && b.bottom > 0;
  });
  if (!resultOnScreen) fail('after Create link the result is off screen');
  await page.evaluate(() => document.querySelector('[data-act="board-code"]').click());
  await sleep(300);
  const board = await page.evaluate(() => {
    const el = document.getElementById('tvBoardOverlay');
    if (!el) return null;
    const code = el.querySelector('.tv-boardcode-code').textContent;
    return { code, decoded: window.parseSkillCodeParts(code).length, text: el.textContent, focus: document.activeElement && document.activeElement.hasAttribute('data-close'), appInert: document.getElementById('teacherApp').inert };
  });
  await shot('board-code-820');
  if (!board) fail('the board code overlay did not open');
  else {
    if (board.code.includes('|') || board.code.length > 24) fail(`the board code is not pupil-typeable ("${board.code}")`);
    if (!board.text.includes('Friday facts')) fail('the board code does not name the set');
    if (board.decoded !== 4) fail(`the board code decodes to ${board.decoded} skills, not 4`);
    if (!board.focus) fail('focus is not on Close in the board code overlay');
    if (!board.appInert) fail('the teacher app is not inert behind the board code');
  }
  await page.keyboard.press('Escape');
  await sleep(100);
  if (await page.evaluate(() => !!document.getElementById('tvBoardOverlay'))) fail('Esc did not close the board code');

  /* ------------------------------------------------------------ 5 Print */
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
  await page.evaluate(() => { window.tvGo('print'); window.tvOpenPrintWith(window.skillQueue); });
  await sleep(300);
  await page.evaluate(() => document.querySelector('[data-act="role"][data-v="independent"]').click());
  await sleep(5000);
  const pr = await page.evaluate(() => {
    const what = document.querySelector('.tv-print-what').getBoundingClientRect();
    const prev = document.querySelector('.tv-preview-card').getBoundingClientRect();
    const scr = document.querySelector('#teacherMain [data-screen="print"]');
    const chips = [...scr.querySelectorAll('.tv-ptype')].map((b) => b.dataset.v);
    const groups = [...scr.querySelectorAll('.tv-ptype-h')].map((h) => h.textContent);
    const thumbs = scr.querySelectorAll('.tv-ptype .tv-ptype-thumb').length;
    const frame = document.getElementById('tvPreviewFrame');
    let score = '', cells = 0;
    try {
      const d = frame.contentDocument;
      score = (d.querySelector('.ws-field.score b') || {}).textContent || '';
      cells = [...d.querySelectorAll('.ws-page')].reduce((n, p) => n + p.querySelectorAll('.ws-cell').length, 0);
    } catch (e) { /* */ }
    return {
      groups, thumbs, beside: prev.left >= what.right && prev.top < 300,
      chips, select: !!scr.querySelector('select[data-role]'), soon: /coming soon/i.test(scr.textContent),
      classic: !!scr.querySelector('[data-act="classic"]'),
      skills: scr.querySelectorAll('.tv-set-item').length,
      score, cells,
    };
  });
  await shot('print-1280');
  if (!pr.beside) fail('Print: the preview is not beside the controls at 1280');
  const ROLES = ['independent', 'more-practice', 'mixed-practice', 'word-problems', 'opener', 'scripted-model', 'guided', 'pre-skill-check', 'error-analysis', 'review', 'test', 'test-b', 'fact-rows', 'fact-probe', 'true-false', 'reason-it', 'stretch'];
  if (pr.select || [...pr.chips].sort().join() !== [...ROLES].sort().join()) fail(`Print: page type cards are not every working role (${pr.chips.join()})`);
  if (pr.groups.join() !== 'Practice,Teach,Check,Facts,Thinking') fail(`Print: page type groups are ${pr.groups.join()}`);
  if (pr.thumbs !== pr.chips.length) fail('Print: a page type card has no thumbnail');
  if (pr.soon) fail('Print: "coming soon" entries are still shown');
  if (pr.classic) fail('Print: the Classic print dialog button is still there');
  if (pr.skills !== 4) fail(`Print: expected the 4 queued skills, found ${pr.skills}`);
  if (!pr.score || pr.score !== `/${pr.cells}`) fail(`Print: Score "${pr.score}" does not count the ${pr.cells} items`);
  // A role that does not fit the skills says why on its card: fact rows for a non-fact skill.
  await page.evaluate(() => { window.tvOpenPrintWith([{ categoryId: 'composing', skillId: 'base10_regroup' }]); document.querySelector('[data-act="role"][data-v="fact-rows"]').click(); });
  await sleep(5000);
  const unfit = await page.evaluate(() => {
    const why = document.querySelector('#teacherMain [data-screen="print"] .tv-ptype-why');
    const card = document.querySelector('[data-act="role"][data-v="fact-rows"]');
    return { why: why ? why.textContent.trim() : '', marked: !!(card && card.classList.contains('is-unfit')) };
  });
  if (!unfit.why || !unfit.marked) fail(`Print: an unfit page type does not say why (${JSON.stringify(unfit)})`);
  // A one-page type too small for every chosen skill says so (never drops a skill quietly).
  await page.evaluate(() => {
    window.tvOpenPrintWith([['composing', 'base10_regroup'], ['addition', 'add_10_no_regroup'], ['addition', 'add_10_regroup'], ['addition', 'add_20_no_regroup']].map(([c, s]) => ({ categoryId: c, skillId: s })));
    document.querySelector('[data-act="role"][data-v="review"]').click();
  });
  await sleep(6000);
  const warn = await page.evaluate(() => (document.querySelector('#tvFits .tv-fits-warn') || {}).textContent || '');
  if (!/of 4 skills fit/.test(warn)) fail(`Print: no warning when a Review page cannot hold every skill ("${warn}")`);
  await page.evaluate(() => window.tvOpenPrintWith(window.skillQueue));
  await sleep(300);
  // More Practice letter chips
  await page.evaluate(() => document.querySelector('[data-act="role"][data-v="more-practice"]').click());
  await sleep(300);
  const chipSize = await page.evaluate(() => { const r = document.querySelector('[data-act="letter"]').getBoundingClientRect(); return [r.width, r.height]; });
  if (chipSize[0] < 44 || chipSize[1] < 44) fail(`Print: letter chips are ${chipSize.join('x')}`);

  // The mixed worksheet (classic engine) with worked solutions, in black and white.
  await page.evaluate(() => { document.querySelector('.tv-extras').open = true; document.querySelector('[data-act="classic-opt"][data-v="worked"]').click(); });
  await sleep(100);
  await page.evaluate(() => document.querySelector('[data-act="classic-build"]').click());
  await sleep(6000);
  const mixed = await page.evaluate(() => {
    const box = document.getElementById('printPreviewContainer');
    return {
      shown: getComputedStyle(box).display !== 'none', bar: !!box.querySelector('.tv-classic-bar'),
      grey: /grayscale/.test(box.innerHTML), worked: !!box.querySelector('.worked-solutions'),
      legacyBar: getComputedStyle(box.querySelector('.print-preview-toolbar')).display,
      focus: !!(document.activeElement && document.activeElement.dataset.cb === 'print'),
    };
  });
  await shot('mixed-worksheet-1280');
  if (!mixed.shown || !mixed.bar || mixed.legacyBar !== 'none') fail('Print: the mixed worksheet preview is missing its teacher toolbar');
  if (!mixed.grey) fail('Print: the mixed worksheet is not black and white');
  if (!mixed.worked) fail('Print: worked solutions did not reach the mixed worksheet key');
  if (!mixed.focus) fail('Print: focus did not move to the mixed worksheet toolbar');
  await page.evaluate(() => document.querySelector('.tv-classic-bar [data-cb="back"]').click());
  await sleep(200);
  if (await page.evaluate(() => getComputedStyle(document.getElementById('printPreviewContainer')).display !== 'none')) fail('Print: Back did not close the mixed worksheet');

  /* ------------------------------------------------------------ 6 the classic dialog is retired for teachers */
  const cl = await page.evaluate(async () => {
    const r = {};
    window.tvGo('home');
    try { window.openSimplePrintDialog(); r.noArgs = 'ok'; } catch (e) { r.noArgs = e.message; }
    await new Promise((res) => setTimeout(res, 100));
    const m = document.getElementById('simplePrintModal');
    r.dialog = !!(m && getComputedStyle(m).display !== 'none');
    r.onPrint = !!document.querySelector('#teacherMain [data-screen="print"].is-active');
    window.tvGo('home');
    window.openPrintSettings();
    await new Promise((res) => setTimeout(res, 100));
    r.settingsToPrint = !!document.querySelector('#teacherMain [data-screen="print"].is-active');
    return r;
  });
  if (cl.noArgs !== 'ok') fail(`openSimplePrintDialog() threw: ${cl.noArgs}`);
  if (cl.dialog) fail('the classic print dialog opened in teacher mode');
  if (!cl.onPrint || !cl.settingsToPrint) fail('a classic print entry point did not open the Print screen');
  // Library -> Print
  await page.evaluate(() => { window.openSkillsOrganizer(); });
  await sleep(400);
  await page.evaluate(() => window.soPrint());
  await sleep(500);
  const lib = await page.evaluate(() => ({ print: !!document.querySelector('#teacherMain [data-screen="print"].is-active'), view: (document.querySelector('.view.active') || {}).id }));
  if (!lib.print) fail(`Library -> Print did not open the Print screen (view ${lib.view})`);

  /* ------------------------------------------------------------ 7 game header */
  await page.evaluate(() => { window.tvGo('run'); });
  await sleep(300);
  await page.evaluate(() => { document.querySelector('[data-run-mode="practice"]').click(); });
  await sleep(100);
  await page.evaluate(() => document.querySelector('[data-run-act="start"]').click());
  await sleep(1200);
  const game = await page.evaluate(() => ({
    topic: (document.getElementById('gameTopicDisplay') || {}).textContent || '',
    chip: (() => { const c = document.getElementById('adaptiveLevelChip'); return c ? getComputedStyle(c).display : 'none'; })(),
  }));
  await shot('game-1280');
  if (/Mixed Mode|All Categories/.test(game.topic) || !game.topic.trim()) fail(`game header reads "${game.topic}"`);
  if (game.chip !== 'none') fail('the adaptive "L3" chip is still shown on the teacher board');

  /* ------------------------------------------------------------ 8 student side: the dialog still opens */
  const st = await page.evaluate(async () => {
    window.exitGame?.();
    window.setUserRole('student');
    await new Promise((res) => setTimeout(res, 100));
    let r = 'ok';
    try { window.openSimplePrintDialog(); } catch (e) { r = e.message; }
    await new Promise((res) => setTimeout(res, 100));
    const m = document.getElementById('simplePrintModal');
    const shownDialog = !!(m && getComputedStyle(m).display !== 'none');
    window.closeSimplePrintModal();
    const inert = [...document.querySelectorAll('[data-tv-inert]')].length;
    return { r, shownDialog, inert, appInert: !!document.getElementById('teacherApp').inert };
  });
  if (st.r !== 'ok') fail(`student: openSimplePrintDialog() threw: ${st.r}`);
  if (!st.shownDialog) fail('student: the print dialog did not open');
  if (st.inert) fail(`student: ${st.inert} elements are still inert`);

  if (app.problems.length) fail(`console: ${app.problems.map((p) => p.text).slice(0, 3).join(' | ')}`);
  await app.close();
  if (failures.length) {
    for (const f of failures) console.log('  FAIL', f);
    console.log('ws-teacher-shell: FAIL');
    process.exit(1);
  }
  console.log('ws-teacher-shell: OK');
})().catch((e) => { console.error(e); console.log('ws-teacher-shell: FAIL'); process.exit(1); });
