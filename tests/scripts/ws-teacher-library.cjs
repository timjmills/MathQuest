// Teacher Skills library + MAP tests screens (teacher-library.js, teacher-map.js).
//   node tests/scripts/ws-teacher-library.cjs
//   node tests/scripts/ws-teacher-library.cjs --only PASS-CHIP-FILTER [--shots <dir>]   the 8/10 chip rule alone (backtests)
//
// Drives both screens as a teacher in a real browser: search, filters, List | Thumbnails, select a
// skill (paper-cell preview), every action (Practise now, Add to skill set, Print, Copy pupil link,
// Make a quiz), the old entry points (openSkillsOrganizer / openMapTest route teachers to the new
// screens), the MAP setup (level, mode, domains, bands, link, start), then opens the MAP link as a
// pupil in a fresh browser context and checks the session launches. Also checks the pupil side
// still gets the legacy views, 44 px targets at 1280 / 1024 / 820, and no console errors.
const { open, waitFor } = require('../lib/ws-harness.cjs');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ONLY = (() => { const i = process.argv.indexOf('--only'); return i > -1 ? process.argv[i + 1] : ''; })();
const SHOTS = (() => { const i = process.argv.indexOf('--shots'); return i > -1 ? process.argv[i + 1] : ''; })();

/* PASS-CHIP-FILTER (owner 2026-11-21, lead ruling A33; strengthened after critic r1 D1-D6): the Skills bar's 8/10 chip is a
   FILTER toggle (aria-pressed, a count "8/10 · N skills"). Pressed, in EVERY view (Maths area, White Rose, Standard, MAP,
   My sets): only passed skills (REDESIGN_PASSED) are shown, no empty step / standard / grade / area grid or header is left,
   every "+ Add all N" and "Add whole ..." adds only passed skills, nothing passed hides behind a cut (the Standard view's
   passed skills equal each standard's passed skills; White Rose's equal the passed skills linked to its steps), every count
   ("Show all N", "+ Add all N", the chip) equals what is listed, pressed or not, and at most one empty note shows. MAP is
   either filtered or shows the chip disabled with "8/10 filter: not available in MAP view". Unpressing returns the SAME card
   ids. "What does 8/10 mean?" sits on the chip's row at 1366, 1280, 1024 and 820; 48 px targets. */
async function passChipFilter(page, check, { shots = '' } = {}) {
  const tag = 'PASS-CHIP-FILTER';
  const fs = require('fs');
  const shot = async (name) => { if (shots) { fs.mkdirSync(shots, { recursive: true }); await page.evaluate(() => { const f = document.querySelector('[data-screen="skills"].is-active .ts-filters'); if (f) f.scrollIntoView({ block: 'start' }); else window.scrollTo(0, 0); }); await page.screenshot({ path: require('path').join(shots, name) }); } };
  await page.evaluate(() => { try { localStorage.removeItem('mq_teacher_skills_ui'); } catch (e) {} window.tvGo('skills'); });
  await waitFor(page, () => !!document.querySelector('[data-screen="skills"].is-active #tsList'), 20000, 'skills screen');
  await sleep(400);
  const passed = await page.evaluate(() => import(new URL('js/modules/redesign-passed.js', location.href).href).then((m) => [...m.REDESIGN_PASSED]));
  const P = new Set(passed);
  const chipSel = '[data-screen="skills"].is-active #tsPassChip [aria-pressed]';
  const chip0 = await page.$(chipSel);
  check(!!chip0, `${tag}: no 8/10 chip with aria-pressed on the Skills bar`);
  if (!chip0) return;
  const click = async (sel) => { await page.$eval(sel, (b) => b.click()); await sleep(450); };
  const browse = async (v) => { await click(`#tsBrowse [data-arg="${v}"]`); await sleep(300); };
  const cardIds = () => page.$$eval('#tsList .ts-card[data-skill]', (c) => [...new Set(c.map((x) => x.dataset.skill))].sort());
  const openAll = async () => { for (let i = 0; i < 300; i++) { const more = await page.$('#tsList [data-act="showall"], #tsList [data-act="more"]'); if (!more) break; await more.evaluate((b) => b.click()); await sleep(250); } };
  // "Show all N": open each cut one at a time and check N against what it then lists
  const openAllCounted = async (v) => {
    for (let i = 0; i < 300; i++) {
      const rec = await page.evaluate(() => {
        const box = document.querySelector('#tsList');
        const b = box.querySelector('[data-act="showall"], [data-act="more"]');
        if (!b) return null;
        const secs = [...box.querySelectorAll('.ts-group')];
        const sec = b.closest('.ts-group');
        const std = b.closest('.ts-std');
        const r = { act: b.dataset.act, text: b.textContent.replace(/\s+/g, ' ').trim(), s: secs.indexOf(sec), d: std && sec ? [...sec.querySelectorAll('.ts-std')].indexOf(std) : -1 };
        b.click();
        return r;
      });
      if (!rec) break;
      await sleep(250);
      if (rec.act !== 'showall') continue;
      const n = +((rec.text.match(/Show all (\d+)/) || [])[1]);
      const got = await page.evaluate((r) => {
        const sec = [...document.querySelectorAll('#tsList .ts-group')][r.s];
        if (!sec) return -1;
        if (r.d > -1) return [...sec.querySelectorAll('.ts-std')][r.d].querySelectorAll('.ts-card[data-skill]').length;
        if (/steps/.test(r.text)) return sec.querySelectorAll('.ts-step').length;
        if (sec.querySelector('.ts-std')) return sec.querySelectorAll('.ts-std').length;
        if (sec.querySelector('.ts-task')) return sec.querySelectorAll('.ts-task').length;
        return sec.querySelectorAll('.ts-card[data-skill]').length;
      }, rec);
      check(got === n, `${tag}: "${v}" view: "${rec.text}" then lists ${got}`);
    }
  };
  // one view's structure: empty grids / headers, Add-all keys and counts, empty notes
  const audit = async (v, pressed) => {
    const bad = await page.evaluate((Pa, pressed) => {
      const S = new Set(Pa); const out = [];
      const box = document.querySelector('#tsList');
      const nCards = (el) => el.querySelectorAll('.ts-card[data-skill]').length;
      const txt = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim().slice(0, 60) : '');
      if (pressed) {
        box.querySelectorAll('.ts-grid').forEach((g) => { if (!nCards(g)) out.push(`empty grid under "${txt(g.previousElementSibling)}"`); });
        box.querySelectorAll('.ts-group').forEach((g) => { if (!nCards(g) && !g.querySelector('.ts-task')) out.push(`empty header "${txt(g.querySelector('.ts-band, h2, h3') || g)}"`); });
        box.querySelectorAll('.ts-std').forEach((g) => { if (!nCards(g)) out.push(`empty standard "${txt(g.querySelector('.ts-step'))}"`); });
        const heads = [...box.querySelectorAll('.ts-grade-head')];
        heads.forEach((h, i) => {
          let n = 0;
          for (let e = h.nextElementSibling; e && e !== heads[i + 1]; e = e.nextElementSibling) n += (e.matches('.ts-card[data-skill]') ? 1 : 0) + nCards(e);
          if (!n) out.push(`empty grade header "${txt(h)}"`);
        });
        const notes = [...box.querySelectorAll('.ts-note')].filter((p) => /^(No |Nothing |8\/10 filter)/.test(p.textContent.trim()));
        if (notes.length > 1) out.push(`${notes.length} empty notes at once: ${notes.map((p) => `"${txt(p)}"`).join(' + ')}`);
      }
      box.querySelectorAll('[data-act="addkeys"]').forEach((b) => {
        const keys = (b.dataset.arg || '').split(',').filter(Boolean);
        const n = +((b.textContent.match(/(\d+)/) || [])[1]);
        if (pressed) { const un = keys.filter((k) => !S.has(k)); if (un.length) out.push(`"${txt(b)}" (${b.dataset.what}) adds ${un.length} unpassed: ${un.slice(0, 2)}`); }
        if (n !== keys.length) out.push(`"${txt(b)}" (${b.dataset.what}) carries ${keys.length} keys`);
        const host = b.closest('.ts-std') || (b.closest('.ts-step') && b.closest('.ts-step').nextElementSibling);
        if (host && !host.querySelector('[data-act="showall"]') && !(host.nextElementSibling && host.nextElementSibling.matches('[data-act="showall"]')) && nCards(host) !== n) out.push(`"${txt(b)}" (${b.dataset.what}) but ${nCards(host)} cards listed`);
      });
      return out;
    }, passed, pressed);
    bad.slice(0, 6).forEach((m) => check(false, `${tag}: ${pressed ? 'pressed' : 'unpressed'}, "${v}" view: ${m}`));
    if (bad.length > 6) check(false, `${tag}: ${pressed ? 'pressed' : 'unpressed'}, "${v}" view: ... and ${bad.length - 6} more`);
  };

  // "What does 8/10 mean?" on the chip's row, at 1366, 1280, 1024 and 820
  const vp0 = page.viewport();
  for (const w of [1366, 1280, 1024, 820]) {
    await page.setViewport({ width: w, height: 768, deviceScaleFactor: 1 });
    await sleep(250);
    const row = await page.evaluate(() => { const s = document.querySelector('[data-screen="skills"].is-active .ts-marks > summary'); const c = document.querySelector('#tsPassChip [aria-pressed]'); if (!s || !c) return null; const a = c.getBoundingClientRect(); const b = s.getBoundingClientRect(); return { chipTop: Math.round(a.top), chipRight: Math.round(a.right), infoTop: Math.round(b.top), infoLeft: Math.round(b.left) }; });
    check(row && Math.abs(row.chipTop - row.infoTop) <= 4 && row.infoLeft >= row.chipRight - 1, `${tag}: at ${w} px "What does 8/10 mean?" is not on the chip's row: ${JSON.stringify(row)}`);
  }
  await page.setViewport(vp0);
  await sleep(250);

  await page.evaluate(() => { const b = document.querySelector('#tsBrowse [data-arg="area"]'); if (b && b.getAttribute('aria-pressed') !== 'true') b.click(); });
  await sleep(300);
  if ((await page.$eval('#tsGrades [data-arg="ALL"]', (b) => b.getAttribute('aria-pressed'))) !== 'true') await click('#tsGrades [data-arg="ALL"]');
  const info = await page.evaluate(() => { const s = document.querySelector('[data-screen="skills"].is-active .ts-marks > summary'); const c = document.querySelector('#tsPassChip [aria-pressed]'); return { text: s ? s.textContent.trim() : '', h: s ? s.getBoundingClientRect().height : 0, ch: c.getBoundingClientRect().height, label: c.textContent.replace(/\s+/g, ' ').trim(), pressed: c.getAttribute('aria-pressed') }; });
  check(/What does 8\/10 mean\?/.test(info.text) && info.h >= 47.5, `${tag}: no "What does 8/10 mean?" beside the chip (or under 48 px): ${JSON.stringify(info)}`);
  check(info.ch >= 47.5 && info.pressed === 'false', `${tag}: the chip is under 48 px or starts pressed: ${JSON.stringify(info)}`);
  check(info.label.endsWith(`8/10 · ${P.size} skills`), `${tag}: the chip reads "${info.label}", want "8/10 · ${P.size} skills"`);
  await shot('skills-bar-unpressed.png');

  // unpressed at Grade 2: the card ids to come back, and the counts of the White Rose and Standard views
  await click('#tsGrades [data-arg="2"]');
  await openAll();
  const before = await cardIds();
  for (const v of ['wrm', 'std']) { await browse(v); await audit(v, false); }
  await browse('area');
  await click('#tsGrades [data-arg="ALL"]');

  await click(chipSel);
  check((await page.$eval(chipSel, (b) => b.getAttribute('aria-pressed'))) === 'true', `${tag}: the chip is not pressed after a click`);
  await openAll();
  const shown = await cardIds();
  const wrong = shown.filter((k) => !P.has(k));
  const missing = passed.filter((k) => !shown.includes(k));
  check(!wrong.length && !missing.length, `${tag}: pressed, the Maths area view (all grades) shows ${shown.length} skills: ${wrong.length} not passed (${wrong.slice(0, 3)}), ${missing.length} passed ones missing (${missing.slice(0, 3)})`);
  const eb = await page.$eval('#tsEyebrow', (e) => e.textContent);
  check(new RegExp(`\\b${shown.length} skills?\\b`).test(eb), `${tag}: pressed, the Maths area eyebrow reads "${eb}" but ${shown.length} skills are listed`);
  await audit('area', true);
  await shot('skills-bar-pressed.png');

  // the expected passed skills of the White Rose and Standard views, all grades
  const expect = await page.evaluate((Pa) => Promise.all(['wrm.js', 'standards.js', 'teacher-standards.js', 'teacher-ui.js'].map((f) => import(new URL(`js/modules/${f}`, location.href).href))).then(([W, St, TS, UI]) => {
    const S = new Set(Pa);
    const cat = new Set(UI.skillCatalogue().map((s) => `${s.categoryId}:${s.skillId}`));
    const ok = (k) => cat.has(k) && S.has(k);
    const wrm = new Set();
    ['K', '1', '2', '3', '4', '5', '6'].forEach((g) => { const y = W.WRM_YEARS.find((x) => x.usGrade === g); if (y) W.WRM_STEPS.filter((st) => st.id.startsWith(`${y.id}.`)).forEach((st) => W.skillsForWrmStep(st.id).filter(ok).forEach((k) => wrm.add(k))); });
    const std = {};
    ['K', '1', '2', '3', '4', '5', '6'].forEach((g) => TS.coverageRows(St, { fw: 'ccss', grade: g }).forEach((r) => { const l = r.short || r.code; const ks = r.skills.filter(ok); if (ks.length) std[l] = [...new Set([...(std[l] || []), ...ks])].sort(); }));
    return { wrm: [...wrm].sort(), std };
  }), passed);

  // My sets first (an empty tray, no sets yet): one empty note only
  await browse('sets');
  await audit('sets', true);
  for (const v of ['wrm', 'std']) {
    await browse(v);
    await sleep(500);
    await shot(`pressed-${v}-top.png`);
    await openAllCounted(v);
    const c = await cardIds();
    check(c.every((k) => P.has(k)), `${tag}: pressed, the "${v}" view shows skills that did not pass: ${c.filter((k) => !P.has(k)).slice(0, 3)}`);
    await audit(v, true);
    if (v === 'wrm') {
      const miss = expect.wrm.filter((k) => !c.includes(k));
      check(!miss.length, `${tag}: pressed, the White Rose view (all grades, every cut opened) hides ${miss.length} passed skills linked to its steps: ${miss.slice(0, 3)}`);
    } else {
      const got = await page.$$eval('#tsList .ts-std', (ss) => { const o = {}; ss.forEach((s) => { const l = (s.querySelector('.ts-gpill') || {}).textContent || '?'; o[l] = [...new Set([...(o[l] || []), ...[...s.querySelectorAll('.ts-card[data-skill]')].map((x) => x.dataset.skill)])].sort(); }); return o; });
      const diff = [...new Set([...Object.keys(got), ...Object.keys(expect.std)])].filter((l) => JSON.stringify(got[l] || []) !== JSON.stringify(expect.std[l] || []));
      check(!diff.length, `${tag}: pressed, the Standard view (all grades, every cut opened): ${diff.length} standards do not show exactly their passed skills: ${diff.slice(0, 3).map((l) => `${l} shows ${(got[l] || []).length} want ${(expect.std[l] || []).length}`).join('; ')}`);
    }
  }
  // MAP: filtered, or the chip disabled with its note
  await browse('map');
  await sleep(500);
  await shot('pressed-map-top.png');
  const map = await page.evaluate((Pa) => import(new URL('js/modules/teacher-map-tasks.js', location.href).href).then((m) => m.mapTaskList()).then((T) => {
    const S = new Set(Pa);
    const c = document.querySelector('#tsPassChip [aria-pressed]');
    const note = [...document.querySelectorAll('#tsList .ts-note')].map((p) => p.textContent.trim());
    const tasks = [...document.querySelectorAll('#tsList .ts-task[data-arg]')].map((b) => T[+b.dataset.arg]).filter(Boolean);
    return { disabled: c && c.getAttribute('aria-disabled') === 'true', h: c ? c.getBoundingClientRect().height : 0, note: note.includes('8/10 filter: not available in MAP view'), passNote: !!document.querySelector('#tsList [data-ts-empty="only"]'), unpassed: tasks.filter((t) => !t.skills.some((k) => S.has(k))).length, tasks: tasks.length };
  }), passed);
  if (map.disabled) check(map.note && map.h >= 47.5 && !map.passNote, `${tag}: MAP view: the chip is disabled but ${JSON.stringify(map)} (want the note "8/10 filter: not available in MAP view", 48 px, no 8/10 empty note)`);
  else check(!map.unpassed, `${tag}: pressed, the MAP view shows ${map.unpassed} of ${map.tasks} tasks with no passed skill and the chip is not disabled`);
  await audit('map', true);
  await browse('area');
  await page.evaluate(() => { const s = document.querySelector('#tsSearch'); s.value = 'add within 20'; s.dispatchEvent(new Event('input', { bubbles: true })); });
  await sleep(700);
  const hits = await page.$$eval('#tsList .ts-card[data-skill]', (x) => x.map((y) => y.dataset.skill));
  check(hits.every((k) => P.has(k)), `${tag}: pressed, a search shows skills that did not pass: ${hits.filter((k) => !P.has(k)).slice(0, 3)}`);
  await page.evaluate(() => { const s = document.querySelector('#tsSearch'); s.value = ''; s.dispatchEvent(new Event('input', { bubbles: true })); });
  await sleep(500);
  // an empty result says so: a grade with no passed skill
  const levels = await page.evaluate(() => import(new URL('js/modules/teacher-ui.js', location.href).href).then((m) => m.skillCatalogue().map((s) => [`${s.categoryId}:${s.skillId}`, s.level])));
  const emptyG = ['6', '5', '4', 'K'].find((g) => !levels.some(([k, l]) => l === g && P.has(k)));
  if (emptyG) {
    await click(`#tsGrades [data-arg="${emptyG}"]`);
    const em = await page.evaluate(() => ({ cards: document.querySelectorAll('#tsList .ts-card[data-skill]').length, note: (document.querySelector('#tsList [data-ts-empty="only"]') || {}).textContent || '' }));
    check(!em.cards && /No skill here has passed 8\/10 yet/.test(em.note), `${tag}: grade ${emptyG} with the chip pressed: ${JSON.stringify(em)}`);
    await audit(`area, grade ${emptyG}`, true);
  }
  // "Add whole grade" / "Add all N grades" adds passed skills only
  await click('#tsGrades [data-arg="ALL"]');
  const tray0 = await page.evaluate(() => import(new URL('js/modules/teacher-tray.js', location.href).href).then((m) => m.trayKeys()));
  if (await page.$('#tsList [data-act="addgrade"]')) {
    await click('#tsList [data-act="addgrade"]');
    const tray1 = await page.evaluate(() => import(new URL('js/modules/teacher-tray.js', location.href).href).then((m) => m.trayKeys()));
    const added = tray1.filter((k) => !tray0.includes(k));
    check((added.length || tray1.some((k) => P.has(k))) && added.every((k) => P.has(k)), `${tag}: pressed, "Add whole grade" added ${added.length} skills, ${added.filter((k) => !P.has(k)).length} unpassed: ${added.filter((k) => !P.has(k)).slice(0, 3)}`);
  }
  // unpress: the same card ids come back (Grade 2, every cut opened)
  await click('#tsGrades [data-arg="2"]');
  await click(chipSel);
  check((await page.$eval(chipSel, (b) => b.getAttribute('aria-pressed'))) === 'false', `${tag}: the chip does not turn off`);
  await openAll();
  const after = await cardIds();
  const lost = before.filter((k) => !after.includes(k));
  const extra = after.filter((k) => !before.includes(k));
  check(!lost.length && !extra.length, `${tag}: unpressed, Grade 2 does not come back the same: ${lost.length} cards gone (${lost.slice(0, 3)}), ${extra.length} new (${extra.slice(0, 3)})`);
}

(async () => {
  const failures = [];
  const check = (ok, msg) => { if (!ok) failures.push(msg); };
  const app = await open({ seed: 7 });
  const { page, browser, base } = app;
  const activeView = () => page.evaluate(() => (document.querySelector('.view.active') || {}).id || '');
  const onScreen = (key) => page.evaluate((k) => document.body.classList.contains('tv-on-screen')
    && !!document.querySelector(`#teacherMain .tv-screen.is-active[data-screen="${k}"]`), key);
  try {
    if (ONLY === 'PASS-CHIP-FILTER') {
      await page.evaluate(() => window.setUserRole('teacher'));
      await sleep(200);
      for (const w of SHOTS ? [1366, 1024] : [1366]) {
        await page.setViewport({ width: w, height: 768, deviceScaleFactor: 1 });
        const n0 = failures.length;
        await passChipFilter(page, check, { shots: SHOTS ? require('path').join(SHOTS, String(w)) : '' });
        if (failures.length > n0) break;
      }
      throw Object.assign(new Error('done'), { done: true });
    }
    // Record what the screens copy (headless Chrome has no real clipboard).
    await page.evaluate(() => { window.__copied = ''; navigator.clipboard.writeText = (t) => { window.__copied = t; return Promise.resolve(); }; });
    await page.evaluate(() => window.setUserRole('teacher'));
    await sleep(200);

    /* ------------------------------------------------------------ Skills library */
    await page.evaluate(() => window.tvGo('library'));
    await sleep(300);
    check(await onScreen('library'), 'library: screen not shown');
    check((await activeView()) !== 'skillsOrganizerView', 'library: the legacy navigator is showing');
    const rows = await page.$$eval('#tvlResults .tvl-row', (b) => b.length);
    check(rows > 400, `library: only ${rows} skill rows`);

    await page.type('#tvlSearch', 'subtract across zeros');
    await sleep(300);
    const hits = await page.$$eval('#tvlResults .tvl-row', (b) => b.map((x) => x.textContent.toLowerCase()));
    check(hits.length > 0 && hits.length < 20 && hits.every((t) => t.includes('zero')), `library: search gave ${hits.length} rows`);
    await page.click('[data-lib-act="clear-filters"]');
    await sleep(200);
    check(await page.$eval('#tvlSearch', (i) => i.value === ''), 'library: clear filters left the search');

    await page.select('#tvlLevel', '3');
    await sleep(200);
    const lv = await page.$$eval('#tvlResults .tvl-row-level', (s) => s.map((x) => x.textContent.trim()));
    check(lv.length > 0 && lv.every((t) => t === 'Level 3'), 'library: level filter not applied');
    await page.select('#tvlDomain', 'number_operations');
    await sleep(200);
    const groups = await page.$$eval('#tvlResults .tvl-group-h', (h) => h.map((x) => x.textContent));
    check(groups.length === 1, `library: domain filter shows ${groups.length} groups`);
    await page.select('#tvlLevel', '');
    await page.select('#tvlDomain', '');
    await sleep(200);

    // Select a column-addition skill: the preview is the kit's paper cell.
    await page.type('#tvlSearch', 'add within 50');
    await sleep(300);
    await page.click('#tvlResults .tvl-row');
    await sleep(300);
    const sel = await page.evaluate(() => ({
      name: (document.querySelector('#tvlSelName') || {}).textContent || '',
      paper: !!document.querySelector('#tvlStage .tvp-stage .tvp-cell'),
      current: document.querySelectorAll('#tvlResults [aria-current="true"]').length,
    }));
    check(sel.name && sel.paper && sel.current === 1, `library: selection/preview failed ${JSON.stringify(sel)}`);
    const before = await page.$eval('#tvlStage', (s) => s.innerHTML);
    await page.click('[data-lib-act="new-example"]');
    await sleep(200);
    let changed = false;
    for (let i = 0; i < 4 && !changed; i++) {
      changed = (await page.$eval('#tvlStage', (s) => s.innerHTML)) !== before;
      if (!changed) { await page.click('[data-lib-act="new-example"]'); await sleep(150); }
    }
    check(changed, 'library: New example did not change the example');
    const colours = await page.$eval('#tvlStage .tvp-cell', (p) => {
      const bad = [];
      p.querySelectorAll('*').forEach((n) => {
        const c = getComputedStyle(n).color;
        if (!/^rgba?\((0, 0, 0|255, 255, 255|148, 148, 148)/.test(c)) bad.push(c);
      });
      return bad.slice(0, 3);
    });
    check(!colours.length, `library: preview is not black and white (${colours.join(', ')})`);

    // Thumbnails
    await page.click('[data-act="skill-view"][data-view="thumbs"]');
    await sleep(900);
    const thumbs = await page.evaluate(() => ({
      n: document.querySelectorAll('#tvlResults .tvl-thumb').length,
      drawn: document.querySelectorAll('#tvlResults .tvl-thumb .tvp-stage').length,
    }));
    check(thumbs.n > 0 && thumbs.drawn > 0, `library: thumbnails ${JSON.stringify(thumbs)}`);
    await page.click('[data-act="skill-view"][data-view="list"]');
    await sleep(200);

    // Add to skill set
    const n0 = await page.evaluate(() => window.UnifiedSkills.count);
    await page.click('[data-lib-act="add"]');
    await sleep(200);
    const add = await page.evaluate(() => ({ n: window.UnifiedSkills.count, pressed: document.querySelector('[data-lib-act="add"]').getAttribute('aria-pressed') }));
    check(add.n === n0 + 1 && add.pressed === 'true', `library: add to set ${JSON.stringify(add)} from ${n0}`);

    // Print hands the skill to the Print screen
    await page.click('[data-lib-act="print"]');
    await sleep(600);
    check(await onScreen('print'), 'library: Print did not open the Print screen');
    const printHas = await page.evaluate((name) => document.querySelector('#teacherMain [data-screen="print"]').textContent.includes(name), sel.name.trim());
    check(printHas, 'library: the Print screen does not list the skill');

    // Practise now runs the one skill; the current set is given back
    await page.evaluate(() => window.tvGo('library'));
    await sleep(300);
    const q0 = await page.evaluate(() => window.UnifiedSkills.count);
    await page.click('[data-lib-act="practise"]');
    await sleep(800);
    check((await activeView()) === 'gameView', `library: Practise now opened ${await activeView()}`);
    check((await page.evaluate(() => window.UnifiedSkills.count)) === q0, 'library: Practise now changed the current set');
    await page.evaluate(() => window.showView('homeView'));
    await sleep(300);
    check(await onScreen('library'), 'library: leaving the game did not return to the library');

    // More menu: copy link, make a quiz
    await page.click('[data-lib-act="menu"]');
    await sleep(100);
    check(await page.$eval('#tvlDetail .tv-menu', (m) => !m.hidden), 'library: menu did not open');
    await page.keyboard.press('Escape');
    await sleep(100);
    check(await page.$eval('#tvlDetail .tv-menu', (m) => m.hidden), 'library: Escape did not close the menu');
    await page.click('[data-lib-act="menu"]');
    await sleep(100);
    await page.click('[data-lib-act="link"]');
    await waitFor(page, () => /copied|could not/i.test(document.getElementById('tvToast').textContent), 5000, 'link toast').catch(() => {});
    const toastText = await page.$eval('#tvToast', (t) => t.textContent);
    check(/pupil link copied/i.test(toastText), `library: link toast "${toastText}"`);
    const copied = await page.evaluate(() => window.__copied);
    const decoded = copied ? await page.evaluate((u) => {
      const c = new URL(u).searchParams.get('c') || '';
      const d = window.parseEnhancedSkillCode ? window.parseEnhancedSkillCode(c) : null;
      return d ? JSON.stringify(d).slice(0, 200) : c;
    }, copied) : '';
    check(/[?&]c=/.test(copied) && decoded, `library: copied link "${copied}"`);
    await page.click('[data-lib-act="menu"]');
    await sleep(100);
    await page.click('[data-lib-act="quiz"]');
    await sleep(700);
    check((await activeView()) === 'quizBuilderView', `library: Make a quiz opened ${await activeView()}`);
    const qn = await page.evaluate(() => (document.getElementById('qbQuestionCount') || {}).textContent || '');
    check(/\b5\b/.test(qn), `library: quiz has "${qn}" questions`);

    // Old entry point routes the teacher to the new screen
    await page.evaluate(() => window.openSkillsOrganizer());
    await sleep(300);
    check(await onScreen('library') && (await activeView()) !== 'skillsOrganizerView', 'library: openSkillsOrganizer did not route to the library');

    /* ------------------------------------------------------------ MAP tests */
    await page.evaluate(() => window.tvGo('map'));
    await sleep(300);
    check(await onScreen('map'), 'map: screen not shown');
    // The MAP page opens on its task views; the test settings are the "Start a MAP test" tab.
    if (await page.$('[data-map-tab="start"][aria-selected="false"]')) { await page.click('[data-map-tab="start"]'); await sleep(200); }
    await page.click('[data-map-tier="k2"]');
    await page.click('[data-map-mode="simulation"]');
    await page.click('[data-map-domain="G"]');
    await page.click('[data-map-act="bands"]');
    await sleep(100);
    const bandN = await page.$$eval('[data-map-band]', (b) => b.length);
    check(bandN === 8, `map: K-2 shows ${bandN} bands`);
    await page.click('[data-map-band="141-150"]');
    await page.select('#tvmCount', '10');
    // A sample question for a band
    const sample0 = await page.evaluate(() => ({ drawn: !!document.querySelector('#tvmSample .tvp-stage'), html: (document.querySelector('#tvmSample') || {}).innerHTML || '' }));
    check(sample0.drawn, 'map: no sample question drawn');
    await page.select('#tvmSampleBand', '201-210');
    await sleep(150);
    await page.click('[data-map-act="another"]');
    await sleep(150);
    const sample1 = await page.evaluate(() => (document.querySelector('#tvmSample .tvp-stage') || {}).innerHTML || '');
    check(sample1 && sample1 !== sample0.html, 'map: the sample did not change with the band');
    await page.click('[data-map-act="link"]');
    await sleep(200);
    const link = await page.$eval('#tvmLink', (c) => c.textContent);
    check(/\?map=k2-SI-151,161,171,181,191,201,211-ONM-10/.test(link), `map: link ${link}`);
    await page.click('[data-map-act="copy"]');
    // Empty choices disable the actions
    await page.click('[data-map-act="no-bands"]');
    await sleep(100);
    check(await page.$eval('[data-map-act="start"]', (b) => b.getAttribute('aria-disabled') === 'true'), 'map: start not disabled without bands');
    await page.click('[data-map-act="all-bands"]');
    await page.click('[data-map-band="141-150"]');
    await sleep(100);
    await page.click('[data-map-act="start"]');
    await sleep(800);
    check((await activeView()) === 'mapSessionView', `map: Start opened ${await activeView()}`);
    const sess = await page.evaluate(() => ({ tier: window.state.mapTier, mode: window.state.mapSessionMode, n: window.state.mapItemCountTarget }));
    check(sess.tier === 'k2' && sess.mode === 'simulation' && sess.n === 10, `map: session state ${JSON.stringify(sess)}`);
    await page.evaluate(() => window.showView('homeView'));
    await sleep(300);
    // openMapTest('mixed') from an old entry point: routed, with K-5 chosen
    await page.evaluate(() => window.openMapTest('mixed'));
    await sleep(300);
    check(await onScreen('map'), 'map: openMapTest did not route to the MAP screen');
    check(await page.$eval('[data-map-tier="mixed"]', (b) => b.getAttribute('aria-checked') === 'true'), 'map: openMapTest tier not honoured');

    /* ------------------------------------------------------------ 44 px targets, three widths */
    for (const width of [1280, 1024, 820]) {
      await page.setViewport({ width, height: 900 });
      for (const key of ['library', 'map']) {
        await page.evaluate((k) => window.tvGo(k), key);
        await sleep(250);
        // MAP opens on "Practise by task" (owner ruling N17): the test controls are on the "Start a MAP test" tab
        if (key === 'map') { await page.click('[data-map-tab="start"]'); await sleep(150); }
        if (key === 'map') { await page.evaluate(() => { const b = document.querySelector('[data-map-act="bands"]'); if (b.getAttribute('aria-expanded') !== 'true') b.click(); }); await sleep(100); }
        const small = await page.evaluate((k) => {
          const scr = document.querySelector(`#teacherMain [data-screen="${k}"]`);
          const out = [];
          scr.querySelectorAll('button, select, input').forEach((b) => {
            const r = b.getBoundingClientRect();
            if (!r.width || !r.height) return;
            if (b.closest('.tvp-frame') || b.classList.contains('tv-link')) return;
            if (b.closest('.tv-seg') ? r.height < 36 : r.height < 44) out.push(`${b.textContent.trim().slice(0, 20) || b.id || b.className} ${Math.round(r.height)}`);
          });
          const overflow = document.documentElement.scrollWidth > window.innerWidth + 1;
          return { out: out.slice(0, 5), overflow };
        }, key);
        check(!small.out.length, `${key}@${width}: small targets ${small.out.join('; ')}`);
        check(!small.overflow, `${key}@${width}: page scrolls sideways`);
      }
    }

    /* ------------------------------------------------------------ sticky search bar (2026-09-25)
       The search + filter row stays pinned to the top of the window while the list scrolls, at
       every width and in both themes; it is opaque (rows slide under it, not through it); the
       document's scroll-padding clears it, so a row focused by the keyboard is never hidden
       under it; and it never makes the page scroll sideways. */
    await page.evaluate(() => window.tvGo('library'));
    await sleep(250);
    await page.evaluate(() => {
      const b = document.querySelector('#tvlView [data-view="list"]'); if (b) b.click();
      const c = document.querySelector('[data-lib-act="clear-filters"]'); if (c && !c.hidden) c.click();
    });
    await sleep(300);
    for (const dark of [false, true]) {
      await page.evaluate((d) => document.documentElement.classList.toggle('dark', d), dark);
      for (const width of [1280, 820, 390]) {
        const tag = `sticky@${width}${dark ? ' dark' : ''}`;
        await page.setViewport({ width, height: 900 });
        await page.evaluate(() => window.scrollTo(0, 0));
        await sleep(250);
        const rest = await page.evaluate(() => ({ stuck: document.querySelector('.tvl-bar').classList.contains('is-stuck') }));
        check(!rest.stuck, `${tag}: bar marked stuck before any scroll`);
        await page.evaluate(() => window.scrollTo(0, 2400));
        await sleep(250);
        const st = await page.evaluate(() => {
          const bar = document.querySelector('.tvl-bar');
          const r = bar.getBoundingClientRect();
          const cs = getComputedStyle(bar);
          const page = getComputedStyle(document.body).getPropertyValue('--tv-page').trim();
          const probe = document.createElement('div');
          probe.style.color = page; document.body.appendChild(probe);
          const pageRgb = getComputedStyle(probe).color; probe.remove();
          // What is painted just under the bar's middle: the bar (or its controls), not a row.
          const hit = document.elementFromPoint(Math.round((r.left + r.right) / 2), Math.round(r.top + 4));
          return {
            scrollY: window.scrollY, top: r.top, bottom: r.bottom, pos: cs.position, bg: cs.backgroundColor, pageRgb,
            stuck: bar.classList.contains('is-stuck'), onTop: !!(hit && bar.contains(hit)),
            pad: parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0,
            overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
          };
        });
        check(st.scrollY > 500, `${tag}: the list did not scroll (${st.scrollY})`);
        check(st.pos === 'sticky' && Math.abs(st.top) <= 1, `${tag}: bar not pinned at the top after scrolling (top ${st.top}, ${st.pos})`);
        check(st.stuck, `${tag}: bar not marked .is-stuck while pinned`);
        check(st.bg === st.pageRgb, `${tag}: bar background ${st.bg} is not the page colour ${st.pageRgb}`);
        check(st.onTop, `${tag}: rows paint over the pinned bar`);
        check(st.pad >= st.bottom, `${tag}: scroll-padding ${st.pad} does not clear the bar (${st.bottom})`);
        check(st.bottom <= 900 * 0.2, `${tag}: pinned bar is ${Math.round(st.bottom)} px tall`);
        check(!st.overflow, `${tag}: page scrolls sideways`);
        // Keyboard: arrow down through the rows; the focused row always clears the bar.
        await page.evaluate(() => { const rows = [...document.querySelectorAll('#tvlResults .tvl-row')]; const r = rows.find((x) => x.getBoundingClientRect().top > 300) || rows[0]; r.focus(); });
        for (let i = 0; i < 25; i++) await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowUp');
        for (let i = 0; i < 12; i++) await page.keyboard.press('ArrowUp');
        await sleep(150);
        const foc = await page.evaluate(() => {
          const a = document.activeElement;
          const bar = document.querySelector('.tvl-bar').getBoundingClientRect();
          const r = a.getBoundingClientRect();
          return { row: a.classList.contains('tvl-row'), top: r.top, bar: bar.bottom };
        });
        check(foc.row && foc.top >= foc.bar - 1, `${tag}: keyboard-focused row is under the bar (${JSON.stringify(foc)})`);
        await page.keyboard.press('Escape');
      }
    }
    await page.evaluate(() => { document.documentElement.classList.remove('dark'); window.scrollTo(0, 0); });
    await page.setViewport({ width: 1280, height: 900 });

    /* ------------------------------------------------------------ pupil side */
    const ctx = await browser.createBrowserContext();
    const pupil = await ctx.newPage();
    const pupilErrors = [];
    pupil.on('pageerror', (e) => pupilErrors.push(e.message));
    pupil.on('console', (m) => { if (m.type() === 'error') pupilErrors.push(m.text()); });
    await pupil.evaluateOnNewDocument(() => { try { localStorage.setItem('mathquest_onboarded', '1'); } catch (e) {} });
    const path = link.replace(/^https?:\/\/[^/]+/, '');
    await pupil.goto(base + path, { waitUntil: 'networkidle2', timeout: 60000 });
    await waitFor(pupil, () => typeof window.generateQuestion === 'function', 30000, 'pupil boot');
    await sleep(800);
    const pv = await pupil.evaluate(() => ({ view: (document.querySelector('.view.active') || {}).id, teacher: document.body.classList.contains('teacher-mode'), tier: window.state.mapTier, mode: window.state.mapSessionMode }));
    check(pv.view === 'mapSessionView' && !pv.teacher && pv.tier === 'k2' && pv.mode === 'simulation', `pupil: MAP link ${JSON.stringify(pv)}`);
    // The pupil still gets the legacy views from their old entry points.
    await pupil.evaluate(() => window.showView('homeView'));
    await pupil.evaluate(() => window.openMapTest('k2'));
    await sleep(300);
    check((await pupil.evaluate(() => document.querySelector('.view.active').id)) === 'mapSelectorView', 'pupil: openMapTest no longer shows the MAP selector');
    await pupil.evaluate(() => window.openSkillsOrganizer());
    await sleep(300);
    check((await pupil.evaluate(() => document.querySelector('.view.active').id)) === 'skillsOrganizerView', 'pupil: openSkillsOrganizer no longer shows the navigator');
    check(!pupilErrors.length, `pupil: console errors ${pupilErrors.slice(0, 3).join(' | ')}`);
    await ctx.close();

    await passChipFilter(page, check);

    if (app.problems.length) failures.push(`console/page errors: ${app.problems.slice(0, 5).map((p) => `[${p.type}] ${p.text}`).join(' | ')}`);
  } catch (e) {
    if (e && e.done) { if (app.problems.length) failures.push(`console/page errors: ${app.problems.slice(0, 5).map((p) => `[${p.type}] ${p.text}`).join(' | ')}`); }
    else failures.push(e.stack || e.message);
  } finally {
    await app.close();
  }
  if (failures.length) { console.error('ws-teacher-library: FAIL'); failures.forEach((f) => console.error('  - ' + f)); process.exit(1); }
  console.log('ws-teacher-library: OK');
})();
