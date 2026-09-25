// Teacher Skills library + MAP tests screens (teacher-library.js, teacher-map.js).
//   node tests/scripts/ws-teacher-library.cjs
//
// Drives both screens as a teacher in a real browser: search, filters, List | Thumbnails, select a
// skill (paper-cell preview), every action (Practise now, Add to skill set, Print, Copy pupil link,
// Make a quiz), the old entry points (openSkillsOrganizer / openMapTest route teachers to the new
// screens), the MAP setup (level, mode, domains, bands, link, start), then opens the MAP link as a
// pupil in a fresh browser context and checks the session launches. Also checks the pupil side
// still gets the legacy views, 44 px targets at 1280 / 1024 / 820, and no console errors.
const { open, waitFor } = require('../lib/ws-harness.cjs');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const failures = [];
  const check = (ok, msg) => { if (!ok) failures.push(msg); };
  const app = await open({ seed: 7 });
  const { page, browser, base } = app;
  const activeView = () => page.evaluate(() => (document.querySelector('.view.active') || {}).id || '');
  const onScreen = (key) => page.evaluate((k) => document.body.classList.contains('tv-on-screen')
    && !!document.querySelector(`#teacherMain .tv-screen.is-active[data-screen="${k}"]`), key);
  try {
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

    if (app.problems.length) failures.push(`console/page errors: ${app.problems.slice(0, 5).map((p) => `[${p.type}] ${p.text}`).join(' | ')}`);
  } catch (e) {
    failures.push(e.stack || e.message);
  } finally {
    await app.close();
  }
  if (failures.length) { console.error('ws-teacher-library: FAIL'); failures.forEach((f) => console.error('  - ' + f)); process.exit(1); }
  console.log('ws-teacher-library: OK');
})();
