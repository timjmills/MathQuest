// White Rose lessons teacher screen (teacher-wrm.js) — browser gate.
//   node tests/scripts/ws-teacher-wrm.cjs [--shots]     (--shots writes design/audit/runs/wrm-page/*.png)
//
// Grade → unit → lesson; List and Thumbnails; tick skills (one, a group's "Select all", the quick
// groups); Practice link decodes to exactly the ticked skills and opens the pupil flow; Print opens
// the Print worksheets screen with them; the URL hash round trip (bookmark reload, Back); the search
// jump; a lesson no skill teaches and a CCSS lesson still to be built; 44 px targets; no horizontal
// overflow or clipping at 1366x768 and 1280x720 (Chromebooks); console clean.
const path = require('path');
const fs = require('fs');
const { open, waitFor } = require('../lib/ws-harness.cjs');

const ROOT = path.join(__dirname, '..', '..');
const SHOTS = process.argv.includes('--shots');
const OUT = path.join(ROOT, 'design', 'audit', 'runs', 'wrm-page');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const failures = [];
  const check = (ok, msg) => { if (!ok) failures.push(msg); };
  // Pick the test lessons from the data itself (node side), so the gate follows the data.
  const links = await import(path.join(ROOT, 'js/modules/wrm-links.js'));
  const all = links.allLessons();
  const gapLesson = all.find((l) => l.grade === '3' && l.type === 'wr' && l.step && !links.linksFor(l).direct.length)
    || all.find((l) => l.type === 'wr' && l.step && !links.linksFor(l).direct.length);
  const buildLesson = all.find((l) => l.grade === '3' && l.type === 'build');
  const rich = all.find((l) => l.grade === '2' && links.linksFor(l).direct.length >= 2 && links.linksFor(l).prereq.length >= 2 && links.linksFor(l).related.length >= 1);

  const app = await open({ seed: 11, viewport: { width: 1366, height: 768, deviceScaleFactor: 1 } });
  const { page, browser, base } = app;
  const shot = async (name) => { if (SHOTS) { fs.mkdirSync(OUT, { recursive: true }); await page.screenshot({ path: path.join(OUT, `${name}.png`) }); } };
  const hash = () => page.evaluate(() => location.hash);
  // Click as a teacher would: scroll the target to the middle first, so the sticky action bar
  // (which covers the bottom of the window by design) is never what gets the click.
  const tap = async (sel) => {
    await page.$eval(sel, (el) => el.scrollIntoView({ block: 'center' }));
    await sleep(50);
    await page.click(sel);
  };
  const decode = (u) => page.evaluate((link) => {
    const c = new URL(link).searchParams.get('c') || '';
    return window.parseSkillCodeParts(c.split('|')[0]).map((s) => `${s.categoryId}|${s.skillId}`);
  }, u);
  const fit = async (tag) => {
    const r = await page.evaluate(() => {
      const W = window.innerWidth;
      const over = [];
      document.querySelectorAll('#teacherMain .tv-screen[data-screen="wrm"] *').forEach((n) => {
        const b = n.getBoundingClientRect();
        // a thumbnail's paper cell is scaled and clipped by its frame (overflow hidden): judge the frame
        if (n.closest('.tvp-frame') && n !== n.closest('.tvp-frame')) return;
        if (b.width && b.right > W + 1 && getComputedStyle(n).position !== 'fixed') over.push(`${n.tagName}.${n.className}`.slice(0, 60));
      });
      const small = [];
      document.querySelectorAll('#teacherMain .tv-screen[data-screen="wrm"] button, #teacherMain .tv-screen[data-screen="wrm"] a.tv-btn').forEach((b) => {
        const r = b.getBoundingClientRect();
        if (!r.width || b.getAttribute('aria-hidden') === 'true' || b.closest('[hidden]')) return;
        if (r.height < 43.5 || r.width < 43.5) small.push(`${(b.textContent || b.getAttribute('aria-label') || '').trim().slice(0, 30)} ${Math.round(r.width)}x${Math.round(r.height)}`);
      });
      return { scroll: document.documentElement.scrollWidth - W, over: over.slice(0, 5), small: small.slice(0, 5) };
    });
    check(r.scroll <= 0, `${tag}: page scrolls sideways by ${r.scroll}px`);
    check(!r.over.length, `${tag}: clipped past the right edge: ${r.over.join(', ')}`);
    check(!r.small.length, `${tag}: targets under 44 px: ${r.small.join(', ')}`);
  };
  try {
    check(gapLesson && buildLesson && rich, 'data: could not pick the test lessons');
    await page.evaluate(() => { window.__copied = ''; navigator.clipboard.writeText = (t) => { window.__copied = t; return Promise.resolve(); }; });
    await page.evaluate(() => { try { localStorage.setItem('mq_teacher_skill_view', JSON.stringify('list')); } catch (e) {} window.setUserRole('teacher'); });
    await sleep(200);

    /* ---------------------------------------------------- open from the sidebar */
    await page.click('#teacherApp [data-tv-go="wrm"]');
    await waitFor(page, () => !!document.querySelector('[data-screen="wrm"] .tvw-lesson'), 20000, 'wrm lessons');
    check(await page.evaluate(() => document.querySelector('#teacherMain .tv-screen.is-active').dataset.screen === 'wrm'), 'nav: wrm screen not active');
    check(/^#wrm\/2\/D1$/.test(await hash()), `hash on open: ${await hash()}`);
    const grades = await page.$$eval('[data-w-grade]', (b) => b.map((x) => x.textContent.trim()));
    check(grades.join() === 'Pre-K,K,1,2,3,4,5'.replace('Pre-K', grades[0]) && grades.length === 7, `grade chips ${grades}`);
    check(await page.$eval('.tvw-empty', (e) => /Choose a lesson/.test(e.textContent)), 'empty detail: no "Choose a lesson"');
    await fit('1366 start');
    await shot('01-start-1366');

    /* ---------------------------------------------------- grade → unit → lesson */
    await page.click('[data-w-grade="3"]');
    await sleep(150);
    check(/^#wrm\/3\/D1$/.test(await hash()), `hash after grade: ${await hash()}`);
    const units3 = await page.$$eval('[data-w-unit]', (b) => b.map((x) => x.dataset.wUnit));
    check(units3[0] === 'D1' && units3.includes('E'), `grade 3 units ${units3}`);
    await page.click('[data-w-grade="2"]');
    await sleep(150);
    await page.click(`[data-w-unit="${rich.unit}"]`);
    await sleep(150);
    await page.click(`[data-w-lesson="${rich.key}"]`);
    await waitFor(page, () => !!document.querySelector('.tvw-head'), 5000, 'detail');
    check((await hash()) === `#wrm/2/${rich.unit}/${rich.n}`, `hash after lesson: ${await hash()}`);
    const d = await page.evaluate(() => ({
      title: document.querySelector('.tvw-title').textContent,
      groups: [...document.querySelectorAll('[data-w-group]')].map((g) => [g.dataset.wGroup, g.querySelectorAll('.tvw-row').length]),
      lessonBtn: !!document.querySelector('.tvw-files a[target="_blank"]'),
    }));
    check(d.title.includes(rich.title), `detail title ${d.title}`);
    check(d.groups.map((g) => g[0]).join() === 'direct,prereq,related' && d.groups.every((g) => g[1] > 0), `groups ${JSON.stringify(d.groups)}`);
    check(d.lessonBtn, 'detail: no Open lesson link');
    await fit('1366 lesson list');
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot('02-lesson-list-1366');

    /* ---------------------------------------------------- tick: one, select all, quick groups */
    const firstDirect = await page.$eval('[data-w-group="direct"] .tvw-tick', (b) => b.dataset.wTick);
    await tap('[data-w-group="direct"] .tvw-tick');
    await sleep(100);
    check(await page.$eval('#tvwBar .tv-h3', (h) => /^1 skill ticked/.test(h.textContent)), 'tick: bar does not say 1 skill');
    await tap('[data-w-all="prereq"]');
    await sleep(100);
    const nPre = d.groups.find((g) => g[0] === 'prereq')[1];
    check(await page.$eval('#tvwBar .tv-h3', (h, n) => h.textContent.startsWith(`${n + 1} skills`), nPre), 'select all prereq: count wrong');
    await tap('[data-w-quick="direct"]');
    await sleep(100);
    const ticked = await page.$$eval('.tvw-tick[aria-checked="true"]', (b) => b.map((x) => x.dataset.wTick));
    const nDir = d.groups.find((g) => g[0] === 'direct')[1];
    check(ticked.length === nDir && ticked.includes(firstDirect), `quick direct ticked ${ticked.length}/${nDir}`);
    await tap('[data-w-quick="prereq"]');
    await sleep(100);
    const tickedPre = await page.$$eval('.tvw-tick[aria-checked="true"]', (b) => [...new Set(b.map((x) => x.dataset.wTick))]);

    /* ---------------------------------------------------- practice link decodes to the ticked skills */
    await tap('[data-w-act="link"]');
    await waitFor(page, () => !!document.querySelector('#tvwLink'), 5000, 'link box');
    const link = await page.$eval('#tvwLink', (i) => i.value);
    check(link && (await page.evaluate(() => window.__copied)) === link, 'link: not copied');
    const dec = await decode(link);
    check(dec && dec.length === tickedPre.length && tickedPre.every((k) => dec.includes(k)), `link decodes to ${JSON.stringify(dec)} not ${JSON.stringify(tickedPre)}`);
    await fit('1366 link');
    await shot('03-ticked-link-1366');

    /* ---------------------------------------------------- thumbnails */
    await page.click('[data-act="skill-view"][data-view="thumbs"]');
    await waitFor(page, () => document.querySelectorAll('.tvw-card').length > 0, 5000, 'thumbs');
    await sleep(1200);
    const th = await page.evaluate(() => ({ cards: document.querySelectorAll('.tvw-card').length, drawn: document.querySelectorAll('.tvw-card [data-tvp-done]').length }));
    check(th.cards > 0 && th.drawn > 0, `thumbs: ${JSON.stringify(th)}`);
    check(await page.$$eval('.tvw-card .tvw-tick[aria-checked="true"]', (b) => b.length) === tickedPre.length, 'thumbs: ticks lost on view switch');
    await fit('1366 thumbs');
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot('04-thumbs-1366');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(600);
    await shot('05-thumbs-scrolled-1366');
    await page.click('[data-act="skill-view"][data-view="list"]');
    await sleep(150);

    /* ---------------------------------------------------- print opens with the ticked skills */
    const labels = await page.$$eval('.tvw-row', (rows) => rows.filter((r) => r.querySelector('.tvw-tick[aria-checked="true"]')).map((r) => r.querySelector('.tvw-row-name').textContent.trim()));
    await tap('[data-w-act="print"]');
    await sleep(600);
    const pr = await page.evaluate((names) => {
      const el = document.querySelector('#teacherMain .tv-screen.is-active');
      return { screen: el && el.dataset.screen, has: names.filter((n) => el.textContent.includes(n)).length, hash: location.hash };
    }, labels);
    check(pr.screen === 'print' && pr.has === labels.length, `print: ${JSON.stringify(pr)} of ${labels.length}`);
    check(pr.hash === '', `print: hash not cleared (${pr.hash})`);

    /* ---------------------------------------------------- Back returns to the lesson */
    await page.goBack();
    await waitFor(page, () => !!document.querySelector('#teacherMain .tv-screen.is-active[data-screen="wrm"] .tvw-head'), 8000, 'back to wrm').catch(() => {});
    const back = await page.evaluate(() => ({ screen: (document.querySelector('#teacherMain .tv-screen.is-active') || {}).dataset?.screen, hash: location.hash, title: (document.querySelector('.tvw-title') || {}).textContent || '' }));
    check(back.screen === 'wrm' && back.title.includes(rich.title), `back: ${JSON.stringify(back)}`);

    /* ---------------------------------------------------- per-card quick buttons */
    const oneKey = await page.$eval('[data-w-group="related"] [data-w-one="link"]', (b) => b.dataset.wKey);
    await tap('[data-w-group="related"] [data-w-one="link"]');
    await waitFor(page, () => !!document.querySelector('#tvwLink'), 5000, 'one link');
    const one = await decode(await page.$eval('#tvwLink', (i) => i.value));
    check(one.length === 1 && one[0] === oneKey, `card Practice: link has ${JSON.stringify(one)} not ${oneKey}`);

    /* ---------------------------------------------------- search jump */
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.click('#tvwSearch');
    await page.type('#tvwSearch', gapLesson.ccss[0] ? gapLesson.title.slice(0, 18) : gapLesson.title);
    await sleep(300);
    const hits = await page.$$eval('.tvw-hit', (b) => b.length);
    check(hits > 0, 'search: no hits');
    await shot('06-search-1366');
    const target = await page.$$eval('.tvw-hit', (b, key) => b.findIndex((x) => x.dataset.wJump === key), gapLesson.key);
    check(target >= 0, `search: "${gapLesson.title}" not offered`);
    if (target >= 0) (await page.$$('.tvw-hit'))[target].click();
    await sleep(300);
    check((await hash()) === `#wrm/${gapLesson.grade}/${gapLesson.unit}/${gapLesson.n}`, `search jump hash ${await hash()}`);

    /* ---------------------------------------------------- gap and to-be-built lessons */
    const gap = await page.evaluate(() => ({ none: (document.querySelector('[data-w-group="direct"] .tvw-none') || {}).textContent || '', verdict: (document.querySelector('.tvw-verdict') || {}).textContent || '', rowGap: !!document.querySelector('.tvw-lesson[aria-current="true"].is-gap') }));
    check(/No skill teaches this lesson yet/.test(gap.none) && gap.rowGap, `gap lesson: ${JSON.stringify(gap)}`);
    await fit('1366 gap');
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot('07-gap-lesson-1366');
    await page.evaluate((h) => { location.hash = h; }, `#wrm/${buildLesson.grade}/${buildLesson.unit}/${buildLesson.n}`);
    await sleep(500);
    const bl = await page.evaluate(() => (document.querySelector('.tvw-verdict') || {}).textContent || '');
    check(/still to write/.test(bl), `build lesson verdict "${bl}"`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot('08-build-lesson-1366');

    /* ---------------------------------------------------- Pre-K */
    await page.click('[data-w-grade="PK"]');
    await sleep(200);
    const pk = await page.$$eval('.tvw-lesson', (b) => b.length);
    check(pk > 5, `Pre-K: ${pk} lessons`);
    await shot('09-prek-1366');

    /* ---------------------------------------------------- bookmark: reload at a hash */
    await page.goto(`${base}/index.html#wrm/${rich.grade}/${rich.unit}/${rich.n}`, { waitUntil: 'networkidle2', timeout: 60000 });
    await waitFor(page, () => !!document.querySelector('.tvw-head'), 20000, 'bookmark reload');
    const bm = await page.evaluate(() => ({ screen: document.querySelector('#teacherMain .tv-screen.is-active').dataset.screen, title: document.querySelector('.tvw-title').textContent }));
    check(bm.screen === 'wrm' && bm.title.includes(rich.title), `bookmark: ${JSON.stringify(bm)}`);

    /* ---------------------------------------------------- 1280x720 */
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
    await sleep(300);
    await fit('1280 list');
    await shot('10-lesson-list-1280');
    await page.click('[data-act="skill-view"][data-view="thumbs"]');
    await sleep(1000);
    await fit('1280 thumbs');
    await shot('11-thumbs-1280');
    await tap('[data-w-quick="all"]');
    await tap('[data-w-act="link"]');
    await sleep(300);
    await page.evaluate(() => window.scrollTo(0, 400));
    await fit('1280 link');
    await shot('12-everything-link-1280');
    // the sticky bar stays on screen while the skills scroll
    const bar = await page.$eval('#tvwBar', (b) => { const r = b.getBoundingClientRect(); return r.bottom <= window.innerHeight + 1 && r.top < window.innerHeight; });
    check(bar, '1280: action bar not visible while scrolled');
    await page.click('[data-act="skill-view"][data-view="list"]');

    /* ---------------------------------------------------- dark mode, keyboard */
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await sleep(150);
    await shot('13-dark-1280');
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    await page.focus('[data-w-grade="4"]');
    await page.keyboard.press('Enter');
    await sleep(200);
    check(/^#wrm\/4\//.test(await hash()), 'keyboard: Enter on a grade chip did nothing');

    /* ---------------------------------------------------- the pupil link opens the pupil flow */
    const ctx = await browser.createBrowserContext();
    const pupil = await ctx.newPage();
    const pupilErrors = [];
    pupil.on('pageerror', (e) => pupilErrors.push(e.message));
    pupil.on('console', (m) => { if (m.type() === 'error') pupilErrors.push(m.text()); });
    await pupil.evaluateOnNewDocument(() => { try { localStorage.setItem('mathquest_onboarded', '1'); } catch (e) {} });
    await pupil.goto(base + link.replace(/^https?:\/\/[^/]+/, ''), { waitUntil: 'networkidle2', timeout: 60000 });
    await waitFor(pupil, () => typeof window.generateQuestion === 'function', 30000, 'pupil boot');
    // The unchanged pupil flow: the shared-link landing card, then Start plays the ticked skills.
    await waitFor(pupil, () => typeof window.startFromLanding === 'function' && !!document.getElementById('studentLandingOverlay'), 15000, 'pupil landing').catch(() => {});
    const landed = await pupil.evaluate(() => !!document.getElementById('studentLandingOverlay'));
    await pupil.evaluate(() => { const m = document.getElementById('landingMode'); if (m) m.value = 'practice'; window.startFromLanding && window.startFromLanding(); });
    await sleep(1200);
    const pv = await pupil.evaluate(() => ({
      teacher: document.body.classList.contains('teacher-mode'), view: (document.querySelector('.view.active') || {}).id,
      skills: [...new Set((window.skillQueue || []).map((s) => `${s.categoryId}|${s.skillId}`))],
    }));
    check(landed && !pv.teacher && pv.view === 'gameView' && pv.skills.length === tickedPre.length && tickedPre.every((k) => pv.skills.includes(k)),
      `pupil: landed ${landed} ${JSON.stringify(pv)} want ${tickedPre.length}`);
    check(!pupilErrors.length, `pupil: console errors ${pupilErrors.slice(0, 3).join(' | ')}`);
    await ctx.close();

    if (app.problems.length) failures.push(`console/page errors: ${app.problems.slice(0, 5).map((p) => `[${p.type}] ${p.text}`).join(' | ')}`);
  } catch (e) {
    failures.push(e.stack || e.message);
  } finally {
    await app.close();
  }
  if (failures.length) { console.error('ws-teacher-wrm: FAIL'); failures.forEach((f) => console.error('  - ' + f)); process.exit(1); }
  console.log('ws-teacher-wrm: OK');
})();
