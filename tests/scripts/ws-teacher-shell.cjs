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
  // THE THREE PAPERS (owner ruling 2026-09-26, LESSON_LIBRARY_PLAN §8e): Practice, Quiz, Lesson.
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
  await page.evaluate(() => { window.tvGo('print'); window.tvOpenPrintWith(window.skillQueue); });
  await sleep(300);
  const pickPaper = (v) => { document.querySelector(`#teacherMain [data-screen="print"] [data-act="kind"][data-v="${v}"]`).click(); };
  const pr0 = await page.evaluate(() => {
    const scr = document.querySelector('#teacherMain [data-screen="print"]');
    const add = scr.querySelector('[data-act="pick"]').getBoundingClientRect();
    return {
      papers: [...scr.querySelectorAll('[data-act="kind"]')].map((b) => b.dataset.v),
      thumbs: scr.querySelectorAll('[data-act="kind"] .tv-ptype-thumb').length,
      checked: (scr.querySelector('[data-act="kind"][aria-checked="true"]') || {}).dataset?.v,
      oldCards: scr.querySelectorAll('[data-act="role"], [data-act="types"]').length,
      look: /\bLook\b/.test(scr.querySelector('#tvSetup').textContent),
      addTop: add.top,
    };
  });
  if (pr0.papers.join() !== 'practice,quiz,lesson') fail(`Print: the paper cards are ${pr0.papers.join()}, not Practice, Quiz, Lesson`);
  if (pr0.thumbs !== 3) fail('Print: a paper card has no thumbnail');
  if (pr0.checked !== 'practice') fail(`Print: the default paper is ${pr0.checked}, not Practice`);
  if (pr0.oldCards) fail('Print: the old page-type cards are still offered');
  if (pr0.look) fail('Print: the retired Look control is still on Page setup');
  if (pr0.addTop > 900) fail(`Print: Add a skill is below the fold (${pr0.addTop})`);
  await sleep(5000);
  const pr = await page.evaluate(() => {
    const what = document.querySelector('.tv-print-what').getBoundingClientRect();
    const prev = document.querySelector('.tv-preview-card').getBoundingClientRect();
    const scr = document.querySelector('#teacherMain [data-screen="print"]');
    const frame = document.getElementById('tvPreviewFrame');
    let score = '', cells = 0, title = '';
    try {
      const d = frame.contentDocument;
      score = (d.querySelector('.ws-field.score b') || {}).textContent || '';
      cells = [...d.querySelectorAll('.ws-page')].reduce((n, p) => n + p.querySelectorAll('.ws-cell').length, 0);
      title = (d.querySelector('.ws-title') || {}).textContent || '';
    } catch (e) { /* */ }
    return {
      beside: prev.left >= what.right && prev.top < 300,
      fits: document.getElementById('tvFits').innerText,
      soon: /coming soon/i.test(scr.textContent),
      classic: !!scr.querySelector('[data-act="classic"]'),
      skills: scr.querySelectorAll('.tv-set-item').length,
      weights: scr.querySelectorAll('.tv-set-item .tv-weight').length,
      score, cells, title,
    };
  });
  await shot('print-1280');
  if (!pr.beside) fail('Print: the preview is not beside the controls at 1280');
  if (/Fits:|rows?,|per page/i.test(pr.fits) || !/^\d+ problems? on \d+ pages?/.test(pr.fits)) fail(`Print: the fits line is not one plain line ("${pr.fits}")`);
  if (pr.soon) fail('Print: "coming soon" entries are still shown');
  if (pr.classic) fail('Print: the Classic print dialog button is still there');
  if (pr.skills !== 4) fail(`Print: expected the 4 queued skills, found ${pr.skills}`);
  if (pr.weights !== 4) fail(`Print: a skill of a mixed set has no weight control (${pr.weights} of 4)`);
  if (!pr.score || pr.score !== `/${pr.cells}`) fail(`Print: Score "${pr.score}" does not count the ${pr.cells} items`);
  if (/^I Can/.test(pr.title)) fail(`Print: a mixed set carries an I Can title ("${pr.title}")`);
  // One skill: the I Can title (PT-TTL-1), and no weight control.
  await page.evaluate(() => { window.tvOpenPrintWith([{ categoryId: 'subtraction', skillId: 'sub_100_regroup' }]); window.tvGo('print'); });
  await sleep(5000);
  const one = await page.evaluate(() => {
    const scr = document.querySelector('#teacherMain [data-screen="print"]');
    let title = '';
    try { title = (document.getElementById('tvPreviewFrame').contentDocument.querySelector('.ws-title') || {}).textContent || ''; } catch (e) { /* */ }
    return { title, weights: scr.querySelectorAll('.tv-weight').length, lesson: scr.querySelector('[data-act="kind"][data-v="lesson"]').getAttribute('aria-disabled') };
  });
  if (!/^I Can /.test(one.title)) fail(`Print: a one-skill Practice paper has no I Can title ("${one.title}")`);
  if (one.weights) fail('Print: a one-skill set shows a weight control');
  if (one.lesson === 'true') fail('Print: the Lesson paper is withheld for a skill that has a lesson');
  // Weights: 3 : 1 : 1 deals 60 / 20 / 20 (largest remainder, every skill at least one).
  await page.evaluate(() => { window.tvOpenPrintWith([{ categoryId: 'addition', skillId: 'add_20_regroup', weight: 3 }, { categoryId: 'subtraction', skillId: 'sub_100_regroup' }, { categoryId: 'number_sense', skillId: 'nearest_10' }]); window.tvGo('print'); });
  await sleep(200);
  const dealt = await page.evaluate(async () => {
    const b = await window.buildSheet({ kind: 'practice', size: 'S', seed: 4242, key: false, sections: [{ skills: [{ categoryId: 'addition', skillId: 'add_20_regroup', weight: 3 }, { categoryId: 'subtraction', skillId: 'sub_100_regroup', weight: 1 }, { categoryId: 'number_sense', skillId: 'nearest_10', weight: 1 }] }] });
    const per = {};
    for (const it of b.items || []) per[it.skill] = (per[it.skill] || 0) + 1;
    return { per, n: (b.items || []).length };
  });
  const want = [3, 1, 1].map((w) => (dealt.n * w) / 5);
  const got = [dealt.per['addition:add_20_regroup'] || 0, dealt.per['subtraction:sub_100_regroup'] || 0, dealt.per['number_sense:nearest_10'] || 0];
  if (got.some((g, k) => Math.abs(g - want[k]) >= 1)) fail(`Print: a 3 : 1 : 1 Practice paper dealt ${got.join(' / ')} of ${dealt.n}`);
  // The weight control changes the weight (+ and -).
  await page.evaluate(() => document.querySelector('#teacherMain [data-screen="print"] [data-act="weight"][data-idx="1"][data-dir="1"]').click());
  await sleep(100);
  const w2 = await page.evaluate(() => document.querySelectorAll('#teacherMain [data-screen="print"] .tv-weight span')[1].textContent);
  if (w2 !== '×2') fail(`Print: the weight + button did not raise the weight (${w2})`);
  // Mix in prerequisite skills: listed, none ticked; ticking one adds it with a "prerequisite of" note.
  const pre = await page.evaluate(async () => {
    const btn = document.querySelector('#teacherMain [data-screen="print"] [data-act="prereqs"]');
    if (!btn) return { none: true };
    btn.click();
    await new Promise((r) => setTimeout(r, 100));
    const boxes = [...document.querySelectorAll('[data-act="prereq"]')];
    const ticked = boxes.filter((b) => b.getAttribute('aria-checked') === 'true').length;
    const before = document.querySelectorAll('.tv-set-item').length;
    const h = boxes[0].getBoundingClientRect().height;
    boxes[0].click();
    await new Promise((r) => setTimeout(r, 100));
    return { n: boxes.length, ticked, before, after: document.querySelectorAll('.tv-set-item').length, note: !!document.querySelector('.tv-prereq-of'), h };
  });
  if (pre.none || !pre.n) fail('Print: no "Prerequisites" list for a Practice skill');
  else {
    if (pre.ticked) fail('Print: a prerequisite is ticked by default');
    if (pre.after !== pre.before + 1 || !pre.note) fail(`Print: ticking a prerequisite did not add it with its note (${JSON.stringify(pre)})`);
    if (pre.h < 44) fail(`Print: a prerequisite check box is ${pre.h}px tall`);
  }
  // A paper option that does not fit the skills says why: fact columns for a non-fact skill.
  await page.evaluate(async () => {
    const b = await window.buildSheet({ kind: 'practice', factColumns: 6, sections: [{ skills: [{ categoryId: 'composing', skillId: 'base10_regroup' }] }] }).catch((e) => e);
    window.__factWhy = b && b.unsupported ? b.message : '';
  });
  if (!(await page.evaluate(() => window.__factWhy))) fail('Print: fact columns for a non-fact skill are not refused with a reason');
  // Lesson: withheld, with its reason, for a skill that has no lesson; chosen, it offers its parts.
  await page.evaluate(() => { window.tvOpenPrintWith([{ categoryId: 'counting', skillId: 'count_objects' }]); window.tvGo('print'); });
  await sleep(200);
  const noLesson = await page.evaluate(() => {
    const card = document.querySelector('#teacherMain [data-screen="print"] [data-act="kind"][data-v="lesson"]');
    const note = card.getAttribute('aria-describedby') ? document.getElementById(card.getAttribute('aria-describedby')) : null;
    card.click();
    return { disabled: card.getAttribute('aria-disabled') === 'true', note: note ? note.textContent.trim() : '', chosen: document.querySelector('[data-act="kind"][data-v="lesson"]').getAttribute('aria-checked') };
  });
  if (!noLesson.disabled || !/No lesson/.test(noLesson.note) || noLesson.chosen === 'true') fail(`Print: the Lesson paper is not withheld, with its reason, for a skill with no lesson (${JSON.stringify(noLesson)})`);
  await page.evaluate(() => { window.tvOpenPrintWith([{ categoryId: 'subtraction', skillId: 'sub_100_regroup' }], { kind: 'lesson' }); });
  await sleep(6000);
  const lesson = await page.evaluate(() => ({
    parts: [...document.querySelectorAll('[data-act="part"]')].map((b) => `${b.dataset.v}:${b.getAttribute('aria-checked')}`),
    fits: document.getElementById('tvFits').innerText,
  }));
  if (lesson.parts.join() !== 'prereq:true,chart:true,sheet:true,practice:true,mixed:true') fail(`Print: the Lesson parts are not all five, ticked (${lesson.parts.join()})`);
  await page.evaluate(() => { document.querySelector('[data-act="part"][data-v="mixed"]').click(); document.querySelector('[data-act="part"][data-v="practice"]').click(); });
  await sleep(6000);
  const lesson2 = await page.evaluate(() => document.getElementById('tvFits').innerText);
  if (/Mixed|Practice:/.test(lesson2.replace(/Practice pages/g, '')) && lesson2 === lesson.fits) fail('Print: unticking lesson parts did not change the packet');
  // Quiz: Forms A and B.
  await page.evaluate(() => { window.tvOpenPrintWith([{ categoryId: 'subtraction', skillId: 'sub_100_regroup' }], { kind: 'quiz' }); });
  await sleep(200);
  await page.evaluate(() => document.querySelector('[data-act="form"][data-v="B"]').click());
  await sleep(6000);
  const quiz = await page.evaluate(() => {
    let titles = [];
    try { titles = [...document.getElementById('tvPreviewFrame').contentDocument.querySelectorAll('.ws-title')].map((t) => t.textContent); } catch (e) { /* */ }
    return { tabs: [...document.querySelectorAll('#tvPageTabs button')].map((b) => b.textContent), titles };
  });
  if (quiz.tabs.filter((t) => /^Page/.test(t)).length < 2) fail(`Print: a Quiz of Forms A and B does not print two pages (${quiz.tabs.join()})`);
  // Old role ids decode to their paper (§8e: saved sets and old links are never broken).
  await page.evaluate(() => window.tvOpenPrintWith([{ categoryId: 'multiplication', skillId: 'mult_facts' }], { role: 'fact-probe' }));
  await sleep(200);
  const probe = await page.evaluate(() => ({ paper: document.querySelector('[data-act="kind"][aria-checked="true"]').dataset.v, timed: (document.querySelector('[data-timed]') || {}).value }));
  if (probe.paper !== 'practice' || probe.timed !== '1') fail(`Print: an old fact-probe set does not open as a timed Practice paper (${JSON.stringify(probe)})`);
  await page.evaluate(() => window.tvOpenPrintWith(window.skillQueue));
  await sleep(300);
  // Versions A, B, C… chips
  await page.evaluate(() => window.tvGo('print'));
  await sleep(200);
  await page.evaluate(() => document.querySelector('[data-act="versions"][data-v="many"]').click());
  await sleep(300);
  const chipSize = await page.evaluate(() => { const r = document.querySelector('[data-act="letter"]').getBoundingClientRect(); return [r.width, r.height]; });
  if (chipSize[0] < 44 || chipSize[1] < 44) fail(`Print: version chips are ${chipSize.join('x')}`);
  void pickPaper;

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
