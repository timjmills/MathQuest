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
//   - T6 (IMPROVEMENT_PLAN §2.9): the menus hold only Skills, Lessons, Classes and Me (plus Classes' tabs); every
//     redirect (?c=, ?quiz=, #wrm/, #map/, #todo/<entry>, mq_teacher_screen, mq_teacher_sets, tvGo(old key),
//     tvOpenPrintWith, ?board=1) lands in its place, tab and content, at 1366 and 390, with no sideways scroll.
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
  // The first run after an edit (a re-stamped tree: every module and font is fetched cold) failed and the re-run passed
  // (2026-10-25 x2, 10-30): fixed sleeps (5-6 s for a print build, 1.5 s after a load) raced the cold fetches. Wait for the
  // REAL signals instead: the print stage's own state (teacher-print.js #tvStage data-state building -> ready|error), an
  // optional page predicate, the fonts, and a quiet network; a 90 s cap only stops a hung build.
  const quiet = async () => {
    await page.waitForNetworkIdle({ idleTime: 400, timeout: 30000 }).catch(() => {});
    await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
  };
  const printReady = async (pred) => {
    await sleep(500);   // past the preview's 350 ms build debounce, so a build that is about to start has started
    await page.waitForFunction((p) => {
      const st = document.getElementById('tvStage');
      if (st && st.dataset.state === 'building') return false;
      return p ? (0, eval)(`(${p})`)() : true;
    }, { timeout: 90000, polling: 100 }, pred ? pred.toString() : '').catch(() => {});
    await quiet();
  };

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
    if (key === "print") await printReady(); else await sleep(300);
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
    if (key === "print") await printReady(); else await sleep(300);
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
    // The primary-button fill (css/teacher-brand.css --tv-primary, the brand purple) as rgb().
    const probe = document.createElement('div');
    probe.style.background = 'var(--tv-primary)'; document.body.appendChild(probe);
    const primaryBg = getComputedStyle(probe).backgroundColor; probe.remove();
    return {
      open: true,
      inside: r.left >= 0 && r.top >= 0 && r.right <= vw + 0.5 && r.bottom <= vh + 0.5,
      doneVisible: !!(done && atDone && done.contains(atDone)),
      doneBg: done ? getComputedStyle(done).backgroundColor : '',
      primaryBg,
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
    if (pop.doneBg !== 'rgb(124, 92, 230)' || pop.doneBg !== pop.primaryBg) fail(`Done is not the brand primary purple (${pop.doneBg}; --tv-primary ${pop.primaryBg})`);
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
  // R2: the page types are collapsed to the chosen card + Change, so Add a skill comes first.
  const collapsed = await page.evaluate(() => {
    const scr = document.querySelector('#teacherMain [data-screen="print"]');
    const add = scr.querySelector('[data-act="pick"]').getBoundingClientRect();
    const type = scr.querySelector('.tv-ptype-now').getBoundingClientRect();
    return { grid: !!scr.querySelector('[data-act="role"]'), change: !!scr.querySelector('[data-act="types"]'), order: add.top < type.top, addTop: add.top };
  });
  if (collapsed.grid || !collapsed.change) fail('Print: the page-type grid is open before Change is pressed');
  if (!collapsed.order || collapsed.addTop > 900) fail(`Print: Add a skill is not above the page type near the top (${JSON.stringify(collapsed)})`);
  const pickRole = (v) => { const scr = document.querySelector('#teacherMain [data-screen="print"]'); if (!scr.querySelector('[data-act="role"]')) scr.querySelector('[data-act="types"]').click(); scr.querySelector(`[data-act="role"][data-v="${v}"]`).click(); };
  await page.evaluate(() => document.querySelector('#teacherMain [data-screen="print"] [data-act="types"]').click());
  await sleep(100);
  const pr0 = await page.evaluate(() => {
    const scr = document.querySelector('#teacherMain [data-screen="print"]');
    return {
      chips: [...scr.querySelectorAll('.tv-ptype[data-v]')].map((b) => b.dataset.v),
      groups: [...scr.querySelectorAll('.tv-ptype-h')].map((h) => h.textContent),
      thumbs: scr.querySelectorAll('.tv-ptype[data-v] .tv-ptype-thumb').length,
    };
  });
  await page.evaluate(pickRole, 'independent');
  await printReady();
  const pr = await page.evaluate(() => {
    const what = document.querySelector('.tv-print-what').getBoundingClientRect();
    const prev = document.querySelector('.tv-preview-card').getBoundingClientRect();
    const scr = document.querySelector('#teacherMain [data-screen="print"]');
    const frame = document.getElementById('tvPreviewFrame');
    let score = '', cells = 0;
    try {
      const d = frame.contentDocument;
      score = (d.querySelector('.ws-field.score b') || {}).textContent || '';
      cells = [...d.querySelectorAll('.ws-page')].reduce((n, p) => n + p.querySelectorAll('.ws-cell').length, 0);
    } catch (e) { /* */ }
    return {
      beside: prev.left >= what.right && prev.top < 300,
      fits: document.getElementById('tvFits').innerText,
      gridClosed: !scr.querySelector('[data-act="role"]'),
      select: !!scr.querySelector('select[data-role]'), soon: /coming soon/i.test(scr.textContent),
      classic: !!scr.querySelector('[data-act="classic"]'),
      skills: scr.querySelectorAll('.tv-set-item').length,
      score, cells,
    };
  });
  await shot('print-1280');
  Object.assign(pr, pr0);
  if (!pr.beside) fail('Print: the preview is not beside the controls at 1280');
  if (!pr.gridClosed) fail('Print: choosing a page type did not close the grid');
  if (/Fits:|rows?,|per page/i.test(pr.fits) || !/^\d+ problems? on \d+ pages?/.test(pr.fits)) fail(`Print: the fits line is not one plain line ("${pr.fits}")`);
  // error-analysis (Check it) is PAUSED: still a working role for saved sets, but not offered (owner ruling 2026-09-26)
  const ROLES = ['lesson', 'detailed-lesson', 'independent', 'more-practice', 'mixed-practice', 'word-problems', 'opener', 'scripted-model', 'guided', 'pre-skill-check', 'review', 'test', 'test-b', 'fact-rows', 'fact-probe', 'true-false', 'reason-it', 'stretch'];
  if (pr.select || [...pr.chips].sort().join() !== [...ROLES].sort().join()) fail(`Print: page type cards are not every working role (${pr.chips.join()})`);
  if (pr.groups.join() !== 'Practice,Teach,Check,Facts,Thinking') fail(`Print: page type groups are ${pr.groups.join()}`);
  if (pr.thumbs !== pr.chips.length) fail('Print: a page type card has no thumbnail');
  if (pr.soon) fail('Print: "coming soon" entries are still shown');
  if (pr.classic) fail('Print: the Classic print dialog button is still there');
  if (pr.skills !== 4) fail(`Print: expected the 4 queued skills, found ${pr.skills}`);
  if (!pr.score || pr.score !== `/${pr.cells}`) fail(`Print: Score "${pr.score}" does not count the ${pr.cells} items`);
  // A role that does not fit the skills says why on its card: fact rows for a non-fact skill.
  await page.evaluate(() => { window.tvOpenPrintWith([{ categoryId: 'composing', skillId: 'base10_regroup' }]); window.tvGo('print'); });
  await sleep(200);
  await page.evaluate(pickRole, 'fact-rows');
  await printReady();
  const unfit = await page.evaluate(() => {
    const why = document.querySelector('#teacherMain [data-screen="print"] .tv-ptype-why');
    const card = document.querySelector('#teacherMain [data-screen="print"] .tv-ptype.is-static');
    return { why: why ? why.textContent.trim() : '', marked: !!(card && card.classList.contains('is-unfit')) };
  });
  if (!unfit.why || !unfit.marked) fail(`Print: an unfit page type does not say why (${JSON.stringify(unfit)})`);
  // Stretch is WITHHELD for a skill with no open problem of its own (a K counting picture): its card
  // is disabled, says why, and cannot be chosen; an operation skill keeps it.
  await page.evaluate(() => { window.tvOpenPrintWith([{ categoryId: 'counting', skillId: 'count_objects' }]); window.tvGo('print'); });
  await sleep(200);
  const noStretch = await page.evaluate(async () => {
    const scr = document.querySelector('#teacherMain [data-screen="print"]');
    if (!scr.querySelector('[data-act="role"]')) scr.querySelector('[data-act="types"]').click();
    const card = scr.querySelector('[data-act="role"][data-v="stretch"]');
    const out = { disabled: card && card.getAttribute('aria-disabled') === 'true', title: card ? card.getAttribute('title') || '' : '' };
    const note = card && card.getAttribute('aria-describedby') ? document.getElementById(card.getAttribute('aria-describedby')) : null;
    out.note = note ? note.textContent.trim() : '';
    card && card.click();
    await new Promise((r) => setTimeout(r, 300));
    const again = scr.querySelector('[data-act="role"][data-v="stretch"]');
    out.chosen = !!(again && again.getAttribute('aria-checked') === 'true');
    return out;
  });
  if (!noStretch.disabled || !/No Stretch/.test(noStretch.title) || !/No Stretch/.test(noStretch.note) || noStretch.chosen) fail(`Print: Stretch is not withheld, with its reason, for a skill with no open problem (${JSON.stringify(noStretch)})`);
  await page.evaluate(() => { window.tvOpenPrintWith([{ categoryId: 'addition', skillId: 'add_20_regroup' }]); window.tvGo('print'); });
  await sleep(200);
  const hasStretch = await page.evaluate(() => {
    const scr = document.querySelector('#teacherMain [data-screen="print"]');
    if (!scr.querySelector('[data-act="role"]')) scr.querySelector('[data-act="types"]').click();
    const card = scr.querySelector('[data-act="role"][data-v="stretch"]');
    return !!card && card.getAttribute('aria-disabled') !== 'true';
  });
  if (!hasStretch) fail('Print: Stretch is withheld for an operation skill that has an open problem');
  // A one-page type too small for every chosen skill says so (never drops a skill quietly).
  await page.evaluate(() => {
    window.tvOpenPrintWith([['composing', 'base10_regroup'], ['addition', 'add_10_no_regroup'], ['addition', 'add_10_regroup'], ['addition', 'add_20_no_regroup']].map(([c, s]) => ({ categoryId: c, skillId: s })));
    window.tvGo('print');
  });
  await sleep(200);
  await page.evaluate(pickRole, 'review');
  await printReady();
  // Review prints one section per skill (guided-r1), so four skills normally all fit; the rule is
  // that a skill missing from the sheet is always named, never that a warning always shows.
  const reviewFit = await page.evaluate(async () => {
    const skills = [['composing', 'base10_regroup'], ['addition', 'add_10_no_regroup'], ['addition', 'add_10_regroup'], ['addition', 'add_20_no_regroup']].map(([c, s]) => ({ categoryId: c, skillId: s }));
    const res = await window.buildSheet({ role: 'review', sections: [{ skills }], seed: 1 });
    const got = new Set((res.items || []).map((it) => it && it.skill));
    return { missing: skills.filter((k) => !got.has(`${k.categoryId}:${k.skillId}`)).length, warn: (document.querySelector('#tvFits .tv-fits-warn') || {}).textContent || '' };
  });
  if (reviewFit.missing && !/of 4 skills fit/.test(reviewFit.warn)) fail(`Print: no warning when a Review page cannot hold every skill ("${reviewFit.warn}")`);
  if (!reviewFit.missing && /skills fit/.test(reviewFit.warn)) fail(`Print: a Review page holding every skill still warns ("${reviewFit.warn}")`);
  await page.evaluate(() => window.tvOpenPrintWith(window.skillQueue));
  await sleep(300);
  // More Practice letter chips
  await page.evaluate(() => window.tvGo('print'));
  await sleep(200);
  await page.evaluate(pickRole, 'more-practice');
  await sleep(300);
  const chipSize = await page.evaluate(() => { const r = document.querySelector('[data-act="letter"]').getBoundingClientRect(); return [r.width, r.height]; });
  if (chipSize[0] < 44 || chipSize[1] < 44) fail(`Print: letter chips are ${chipSize.join('x')}`);

  // The mixed worksheet (classic engine) with worked solutions, in black and white.
  await page.evaluate(() => { document.querySelector('.tv-extras').open = true; document.querySelector('[data-act="classic-opt"][data-v="worked"]').click(); });
  await sleep(100);
  await page.evaluate(() => document.querySelector('[data-act="classic-build"]').click());
  await printReady(() => { const b = document.getElementById("printPreviewContainer"); return !!(b && getComputedStyle(b).display !== "none" && b.querySelector(".tv-classic-bar")); });
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


  /* ------------------------------------------------------------ 7b T6: menus and redirects (one row per redirect) */
  const RETIRED = ['home', 'library', 'print', 'sets', 'todo'];
  const where = () => page.evaluate(() => ({
    screen: (document.querySelector('#teacherMain .tv-screen.is-active') || {}).dataset?.screen || '',
    on: document.body.classList.contains('tv-on-screen'),
    place: (document.querySelector('#teacherApp [data-tv-place][aria-current="page"]') || {}).dataset?.tvPlace || '',
    tab: ((document.querySelector('#tvPlaceTabs [aria-current="page"]') || {}).textContent || '').trim(),
    tabs: [...document.querySelectorAll('#tvPlaceTabs .tv2-tab')].map((a) => a.textContent.trim()),
    hash: location.hash, view: (document.querySelector('.view.active') || {}).id || '',
    sideways: document.documentElement.scrollWidth > window.innerWidth + 1,
    text: ((document.querySelector('#teacherMain .tv-screen.is-active') || {}).innerText || '').slice(0, 4000),
  }));
  // a FULL load (a hash-only goto is a same-document navigation); the teacher role is set again after the load
  const visit = async (url, ms = 1500, teacher = true) => {
    // leave the old page only once it has fully loaded (an early about:blank aborts its stylesheets)
    await page.waitForFunction(() => document.readyState === 'complete', { timeout: 60000 }).catch(() => {});
    await page.waitForNetworkIdle({ idleTime: 300, timeout: 30000 }).catch(() => {});
    await page.goto('about:blank');
    await page.goto(app.base + url, { waitUntil: 'networkidle0', timeout: 60000 });
    for (let i = 0; i < 60 && !(await page.evaluate(() => typeof window.tvGo === 'function' && typeof window.setUserRole === 'function')); i++) await sleep(250);
    if (teacher) await page.evaluate(() => window.setUserRole('teacher'));
    await sleep(ms);
    await quiet();
    return where();
  };
  const T6 = [];
  const row = (w, name, ok, info) => { T6.push(`${w} ${name}: ${ok ? 'OK' : 'FAIL'}`); if (!ok) fail(`T6 @${w} ${name}: ${JSON.stringify(info).slice(0, 300)}`); };
  const ref = await page.evaluate(async () => {
    const L = await import('/js/modules/wrm-links.js');
    const ls = L.allLessons();
    const l = ls.find((x) => x.site) || ls[10];
    const Q = await import('/js/modules/build-queue.js');
    const { loadLinksData } = await import('/js/modules/links-data.js');
    let todo = '', todoSite = '';
    try {
      const data = await loadLinksData();
      const items = Q.buildQueue({ curated: Object.values(data.years || {}), map: data.map }).items;
      const e = items.find((x) => x.siteLessons && x.siteLessons.length);
      if (e) { todo = e.id; todoSite = e.siteLessons[0]; }
    } catch (err) { todo = ''; }
    const S = await import('/js/modules/quiz-storage.js');
    const q = window.generateQuestionFor({ category: 'addition', skill: 'add_facts', seed: 7 });
    const quiz = S.compressTestForURL({ id: 't6quiz', name: 'T6 redirect quiz', sections: [{ label: 'A', layout: 'list', questions: [{ skillId: 'add_facts', questionData: q, points: 1 }] }], settings: {} });
    window.UnifiedSkills.clear();
    window.UnifiedSkills.add({ domainId: window.getDomainByCategory('addition'), categoryId: 'addition', skillId: 'add_facts', skillLabel: 'add_facts' });
    const code = window.generateSkillCode();
    return { hash: L.lessonHash(l), title: l.title || l.name || '', todo, todoSite, quiz, code };
  });
  if (!ref.todo) fail('T6: no "Skills to be made" entry with a lesson to test #todo/<entry>');
  for (const [w, h] of [[1366, 900], [390, 844]]) {
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    await page.evaluate(() => { try { sessionStorage.removeItem('mq_teacher_screen'); } catch (e) { /* */ } window.setUserRole('teacher'); });
    // the menus: four places plus Student view (owner 2026-10-25: one click back to the pupil site), no retired tab anywhere in the chrome
    let r = await visit('/index.html');
    const menu = await page.evaluate((ret) => ({
      places: [...document.querySelectorAll('#teacherApp .tv2-place')].map((a) => a.textContent.trim()),
      retired: [...document.querySelectorAll('#teacherApp nav [data-tv-go], #tvPlaceTabs [data-tv-go], #tv2Profile [data-tv-go]')].map((a) => a.dataset.tvGo).filter((k) => ret.includes(k)),
    }), RETIRED);
    row(w, 'menus', menu.places.join('|') === 'Skills|Lessons|Classes|Student view|Me' && !menu.retired.length && r.place === 'skills' && !r.tabs.length && !r.sideways, { menu, r });
    await page.evaluate(() => window.tvGo('wrm')); await sleep(800); r = await where();
    row(w, 'Lessons has no tabs', r.place === 'lessons' && !r.tabs.length, r);
    await page.evaluate(() => window.tvGo('run')); await sleep(500); r = await where();
    row(w, 'Classes keeps its tabs', r.tabs.join('|') === 'Run on the board|Quizzes|MAP tests|Progress' && r.tab === 'Run on the board', r);
    // tvGo(old key) aliases and tvOpenPrintWith
    for (const [k, place] of [['home', 'skills'], ['library', 'skills'], ['print', 'skills'], ['sets', 'skills'], ['todo', 'lessons'], ['skills', 'skills'], ['wrm', 'lessons'], ['run', 'classes'], ['quizzes', 'classes'], ['map', 'classes'], ['progress', 'classes'], ['settings', 'me']]) {
      await page.evaluate((key) => window.tvGo(key), k); await sleep(k === 'print' ? 1200 : 400); r = await where();
      row(w, `tvGo('${k}')`, r.on && r.screen === k && r.place === place && r.text.trim().length > 20 && !r.sideways, r);
    }
    await page.evaluate(() => window.tvOpenPrintWith([{ categoryId: 'addition', skillId: 'add_facts' }])); await sleep(1200); r = await where();
    row(w, 'tvOpenPrintWith', r.screen === 'print' && r.place === 'skills' && !r.sideways, r);
    // hashes
    r = await visit(`/index.html${ref.hash}`, 2500);
    row(w, `#wrm/… (${ref.hash})`, r.screen === 'wrm' && r.place === 'lessons' && r.hash === ref.hash && (!ref.title || r.text.includes(ref.title)) && !r.sideways, r);
    r = await visit('/index.html#map/tasks', 2000);
    row(w, '#map/tasks', r.screen === 'map' && r.place === 'classes' && r.tab === 'MAP tests' && !r.sideways, r);
    r = await visit(`/index.html#todo/${encodeURIComponent(ref.todo)}`, 4000);
    row(w, `#todo/${ref.todo}`, r.screen === 'wrm' && r.place === 'lessons' && /^#wrm\//.test(r.hash) && !r.sideways, r);
    r = await visit('/index.html#todo/no-such-entry', 3000);
    row(w, '#todo/<unknown> → the list', r.screen === 'todo' && r.place === 'lessons' && /All skills to be made/.test(r.text), r);
    // mq_teacher_screen old values
    for (const [old, screen, place] of [['home', 'skills', 'skills'], ['library', 'skills', 'skills'], ['print', 'skills', 'skills'], ['sets', 'skills', 'skills'], ['todo', 'wrm', 'lessons'], ['map', 'map', 'classes'], ['quizzes', 'quizzes', 'classes']]) {
      await page.evaluate((v) => sessionStorage.setItem('mq_teacher_screen', v), old);
      r = await visit('/index.html', 1500);
      row(w, `mq_teacher_screen=${old}`, r.screen === screen && r.place === place, r);
    }
    // mq_teacher_sets: the saved tray loads back into the tray
    await page.evaluate(() => {
      window.UnifiedSkills.clear(); window.skillQueue = [];
      localStorage.setItem('mq_teacher_sets', JSON.stringify([{ id: 'tray', tray: true, name: 'Tray', createdAt: 1, lastUsed: 1, skills: [{ categoryId: 'addition', skillId: 'add_facts' }, { categoryId: 'subtraction', skillId: 'sub_facts' }] }]));
      sessionStorage.setItem('mq_teacher_screen', 'skills');
      try { localStorage.removeItem('mq_unified_skills'); } catch (e) { /* */ }
    });
    r = await visit('/index.html', 2000);
    const tray = await page.evaluate(() => (window.skillQueue || []).map((x) => `${x.categoryId}:${x.skillId}`).sort().join(','));
    row(w, 'mq_teacher_sets → tray', r.screen === 'skills' && tray === 'addition:add_facts,subtraction:sub_facts', { r, tray });
    // ?c= share code opens the set (the landing card), ?quiz= opens the quiz
    r = await visit(`/index.html?c=${encodeURIComponent(ref.code)}`, 2000, false);
    const land = await page.evaluate(() => { const m = document.getElementById('studentLandingOverlay'); return !!(m && m.offsetHeight && /add_facts|Addition|Ready to Practice/i.test(m.innerText)); });
    row(w, `?c=${ref.code}`, land, { r, land });
    r = await visit(`/index.html?quiz=${ref.quiz}`, 2500, false);
    const qz = await page.evaluate(() => ((document.getElementById('quizTakeView') || {}).innerText || '').includes('T6 redirect quiz'));
    row(w, '?quiz=', r.view === 'quizTakeView' && qz, { r, qz });
    // ?board=1 hides the shell
    r = await visit('/index.html?board=1', 1500);
    const board = await page.evaluate(() => ({ cls: document.body.classList.contains('tv-board'), app: (() => { const a = document.getElementById('teacherApp'); return !a || getComputedStyle(a).display === 'none' || !a.offsetHeight; })() }));
    row(w, '?board=1', board.cls && board.app, board);
  }
  console.log(T6.join('\n'));
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
  await page.goto(app.base + "/index.html", { waitUntil: "networkidle0", timeout: 60000 }); await sleep(1500); await quiet();

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
