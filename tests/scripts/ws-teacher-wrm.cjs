// White Rose lessons teacher screen (teacher-wrm.js) — browser gate.
//   node tests/scripts/ws-teacher-wrm.cjs [--shots] [--curated <dir>]
//     --shots    writes design/audit/runs/wrm-page/*.png
//     --curated  serves the link files in <dir> (R.json … Y6.json, MAP.json) as data/curriculum/links/,
//                so the curated path (verdicts, "To be built", MAP.json tasks) is tested before the
//                tagging lanes' files are merged. Without it the computed fallbacks are tested.
//
// Also: the "Skills to be made" screen (filters, expand, White Rose step link, print, CSV) and the MAP
// page's "Practise by task" and "By representation" views (tick, Practice link, Print).
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
const CUR_AT = process.argv.indexOf('--curated');
const CUR_DIR = CUR_AT > 0 ? path.resolve(process.argv[CUR_AT + 1]) : '';
const CUR_YEARS = CUR_DIR ? ['R', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6'].filter((y) => fs.existsSync(path.join(CUR_DIR, `${y}.json`))) : [];
const CUR_MAP = CUR_DIR && fs.existsSync(path.join(CUR_DIR, 'MAP.json'));
const OUT = path.join(ROOT, 'design', 'audit', 'runs', 'wrm-page');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const failures = [];
  const check = (ok, msg) => { if (!ok) failures.push(msg); };
  // Pick the test lessons from the data itself (node side), so the gate follows the data.
  const links = await import(path.join(ROOT, 'js/modules/wrm-links.js'));
  for (const y of CUR_YEARS) links.addCuratedYear(JSON.parse(fs.readFileSync(path.join(CUR_DIR, `${y}.json`), 'utf8')));
  const all = links.allLessons();
  const builtLesson = CUR_YEARS.length ? all.find((l) => l.grade === '2' && links.linksFor(l).build.length) : null;
  const optLesson = CUR_YEARS.length ? all.find((l) => l.grade === '2' && links.linksFor(l).prereq.some((x) => x.opts)) : null;
  const gapLesson = all.find((l) => l.grade === '3' && l.type === 'wr' && l.step && !links.linksFor(l).direct.length)
    || all.find((l) => l.type === 'wr' && l.step && !links.linksFor(l).direct.length);
  const buildLesson = all.find((l) => l.grade === '3' && l.type === 'build');
  const rich = all.find((l) => l.grade === '2' && links.linksFor(l).direct.length >= 2 && links.linksFor(l).prereq.length >= 2 && links.linksFor(l).related.length >= 1);

  const app = await open({ seed: 11, viewport: { width: 1366, height: 768, deviceScaleFactor: 1 } });
  const { page, browser, base } = app;
  if (CUR_DIR) {
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const m = /\/data\/curriculum\/links\/([A-Za-z0-9]+)\.json(\?|$)/.exec(req.url());
      if (!m) { req.continue(); return; }
      const body = m[1] === 'index' ? JSON.stringify({ years: CUR_YEARS, map: !!CUR_MAP }) : fs.readFileSync(path.join(CUR_DIR, `${m[1]}.json`), 'utf8');
      req.respond({ status: 200, contentType: 'application/json', body });
    });
  }
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
  const decodeOpts = (u) => page.evaluate((link) => {
    const c = new URL(link).searchParams.get('c') || '';
    return Object.fromEntries(window.parseSkillCodeParts(c.split('|')[0]).map((s) => [`${s.categoryId}:${s.skillId}`, s.opts || {}]));
  }, u);
  // B5: on a Chromebook the first skill row is on screen and no Tick button is under the sticky bar.
  const clearOfBar = async (tag) => {
    const r = await page.evaluate(() => {
      const bar = document.querySelector('[data-screen="wrm"].is-active #tvwBar');
      const barTop = bar ? bar.getBoundingClientRect().top : innerHeight;
      const row = document.querySelector('[data-screen="wrm"] .tvw-group .tvw-row, [data-screen="wrm"] .tvw-group .tvw-card');
      const rowTop = row ? row.getBoundingClientRect().top : 9999;
      const under = [...document.querySelectorAll('[data-screen="wrm"] [data-w-quick], [data-screen="wrm"] [data-act="skill-view"]')]
        .filter((b) => { const q = b.getBoundingClientRect(); return q.width && q.bottom > barTop && q.top < innerHeight; }).map((b) => b.textContent.trim());
      return { barTop: Math.round(barTop), rowTop: Math.round(rowTop), under };
    });
    check(r.rowTop + 40 <= r.barTop, `${tag}: first skill row at ${r.rowTop}px is not clear of the bar at ${r.barTop}px`);
    check(!r.under.length, `${tag}: under the action bar: ${r.under.join(', ')}`);
  };
  const fit = async (tag, screen = 'wrm') => {
    const r = await page.evaluate((scr) => {
      const W = window.innerWidth;
      const over = [];
      document.querySelectorAll(`#teacherMain .tv-screen[data-screen="${scr}"] *`).forEach((n) => {
        const b = n.getBoundingClientRect();
        // a thumbnail's paper cell is scaled and clipped by its frame (overflow hidden): judge the frame
        if (n.closest('.tvp-frame') && n !== n.closest('.tvp-frame')) return;
        if (b.width && b.right > W + 1 && getComputedStyle(n).position !== 'fixed') over.push(`${n.tagName}.${n.className}`.slice(0, 60));
      });
      const small = [];
      document.querySelectorAll(`#teacherMain .tv-screen[data-screen="${scr}"] button, #teacherMain .tv-screen[data-screen="${scr}"] a.tv-btn`).forEach((b) => {
        const r = b.getBoundingClientRect();
        if (!r.width || b.getAttribute('aria-hidden') === 'true' || b.closest('[hidden]')) return;
        if (r.height < 43.5 || r.width < 43.5) small.push(`${(b.textContent || b.getAttribute('aria-label') || '').trim().slice(0, 30)} ${Math.round(r.width)}x${Math.round(r.height)}`);
      });
      return { scroll: document.documentElement.scrollWidth - W, over: over.slice(0, 5), small: small.slice(0, 5) };
    }, screen);
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
    await waitFor(page, () => document.querySelector('[data-w-grade="3"]')?.getAttribute('aria-pressed') === 'true', 8000, 'grade 3');
    check(/^#wrm\/3\/D1$/.test(await hash()), `hash after grade: ${await hash()}`);
    const units3 = await page.$$eval('[data-w-unit]', (b) => b.map((x) => x.dataset.wUnit));
    check(units3[0] === 'D1' && units3.includes('E'), `grade 3 units ${units3}`);
    await page.click('[data-w-grade="2"]');
    await waitFor(page, () => document.querySelector('[data-w-grade="2"]')?.getAttribute('aria-pressed') === 'true', 8000, 'grade 2');
    await page.click(`[data-w-unit="${rich.unit}"]`);
    await sleep(300);
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
    const vt = await page.evaluate(() => (document.querySelector('.tvw-head [data-w-verdict-tag]') || {}).textContent || '');
    check(/Fully taught|Covers part|No skill yet/.test(vt), `detail: no verdict tag ("${vt}")`);
    check(await page.$$eval('.tvw-lesson[data-w-verdict]', (b) => b.length) > 0, 'lesson rows carry no verdict');
    await fit('1366 lesson list');
    await clearOfBar('1366 lesson open');
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
    // with a lesson open the finder is one line; "Change grade or unit" opens it
    check(await page.$eval('.tvw-pick', (p) => p.hidden), 'finder not folded while a lesson is open');
    await tap('[data-w-finder]');
    await sleep(150);
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
    await page.click(`[data-w-lesson="${rich.key}"]`).catch(() => {});
    await sleep(500);
    await clearOfBar('1280 lesson open');
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
    if (await page.$('[data-w-finder]')) { await tap('[data-w-finder]'); await sleep(150); }
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


    /* ==================================================== the curated "To be built" link */
    await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
    await page.evaluate(() => { window.__opened = ''; window.open = () => ({ document: { open() {}, write(h) { window.__opened += h; }, close() {} }, focus() {}, print() {} }); });
    if (builtLesson) {
      await page.evaluate(() => window.tvGo('home'));
      await page.evaluate((h) => { location.hash = h; }, `#wrm/${builtLesson.grade}/${builtLesson.unit}/${builtLesson.n}`);
      await waitFor(page, () => !!document.querySelector('.tvw-head .tvw-tbb-link'), 10000, 'to be built link');
      const tbbId = await page.$eval('.tvw-head .tvw-tbb-link', (b) => b.dataset.todoOpen);
      await page.evaluate(() => window.scrollTo(0, 0));
      await fit('1366 curated lesson');
      await shot('14-curated-to-be-built-1366');
      await tap('.tvw-head .tvw-tbb-link');
      await page.evaluate((id) => { window.__tbb = id; }, tbbId);
      await waitFor(page, () => !!document.querySelector(`[data-screen="todo"].is-active [data-t-item="${CSS.escape(window.__tbb)}"].is-open`), 15000, 'todo at entry');
      await sleep(200);
      await shot('15-todo-entry-from-lesson-1366');
    } else if (CUR_YEARS.length) failures.push('curated: no Grade 2 lesson with a build proposal');

    /* ==================================================== curated options travel into the link (B2) */
    if (optLesson) {
      await page.evaluate(() => window.tvGo('home'));
      await page.evaluate((h) => { location.hash = h; }, `#wrm/${optLesson.grade}/${optLesson.unit}/${optLesson.n}`);
      await waitFor(page, () => !!document.querySelector('[data-screen="wrm"].is-active .tvw-head'), 10000, 'opt lesson');
      await sleep(300);
      await tap('[data-w-quick="prereq"]');
      await tap('[data-w-act="link"]');
      await waitFor(page, () => !!document.querySelector('#tvwLink'), 5000, 'opt link');
      const od = await decodeOpts(await page.$eval('#tvwLink', (i) => i.value));
      const want = links.linksFor(optLesson).prereq.filter((x) => x.opts);
      // an option equal to the skill's default is (rightly) not written into the code: compare encodings
      const lost = await page.evaluate(async (want, od) => {
        const c = await import('./js/modules/skill-option-codec.js');
        return want.filter((x) => { const [cat, id] = x.key.split(':'); return c.encodeOptionPayload(cat, id, x.opts) !== c.encodeOptionPayload(cat, id, od[x.key] || {}); }).map((x) => x.key);
      }, want, od);
      check(want.some((x) => { return Object.keys(od[x.key] || {}).length; }), 'no curated option reached the link at all');
      check(want.length && !lost.length, `curated pre opts lost in the link: ${lost.join(', ')} (of ${want.length})`);
      const why = await page.$$eval('[data-w-group="prereq"] .tvw-why', (w) => w.map((x) => x.textContent).join(' | '));
      check(!/\b(R|Y\d)\.B\d+\.S\d+|prior learning|wk W|not dealt/.test(why), `why lines show ids/jargon: ${why.slice(0, 200)}`);
    } else if (CUR_YEARS.length) failures.push('curated: no lesson whose do-first skills carry options');

    /* ==================================================== Skills to be made */
    await page.evaluate(() => window.tvGo('home'));
    await sleep(200);
    await page.click('[data-screen="home"] [data-home-go="todo"]');
    await waitFor(page, () => !!document.querySelector('[data-screen="todo"].is-active .tvt-item'), 20000, 'todo list');
    const tot = await page.evaluate(() => ({ items: document.querySelectorAll('.tvt-item').length, big: [...document.querySelectorAll('.tvt-big')].map((b) => +b.textContent),
      count: document.querySelector('#tvtCount').textContent, grades: [...document.querySelectorAll('.tvt-grade-h')].map((h) => h.textContent.trim()) }));
    check(tot.items === tot.big[0] && tot.big[0] > 200 && tot.big[1] + tot.big[2] <= tot.big[0], `todo totals ${JSON.stringify(tot)}`);
    check(/^Pre-K/.test(tot.grades[0] || ''), `todo: grouped by grade first (${tot.grades.slice(0, 3)})`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await fit('1366 todo', 'todo');
    await shot('20-todo-all-1366');
    const srcPick = CUR_MAP ? 'MAP' : 'CCSS';
    await page.click(`[data-t-f="sources"][data-t-v="${srcPick}"]`);
    await page.click('[data-t-f="grades"][data-t-v="3"]');
    await sleep(150);
    const f1 = await page.evaluate((src) => ({ n: document.querySelectorAll('.tvt-item').length, ok: [...document.querySelectorAll('.tvt-item')].every((li) => [...li.querySelectorAll('.tvt-src')].some((x) => x.textContent === src)) }), srcPick);
    check(f1.n > 0 && f1.ok, `todo: source+grade filter ${JSON.stringify(f1)}`);
    await page.click('[data-t-f="kinds"][data-t-v="option"]');
    await sleep(150);
    const f2 = await page.evaluate(() => ({ n: document.querySelectorAll('.tvt-item').length, ok: [...document.querySelectorAll('.tvt-kind')].every((x) => x.classList.contains('is-option')) }));
    check(f2.ok && f2.n <= f1.n, `todo: kind filter ${JSON.stringify(f2)}`);
    await page.click('[data-t-act="clear"]');
    await sleep(150);
    await page.click('[data-t-f="domains"][data-t-v="NF"]');
    await page.select('#tvtPair', 'numberline-number');
    await sleep(200);
    const f3 = await page.$$eval('.tvt-item', (b) => b.length);
    check(f3 > 0, `todo: domain NF + number line pair shows ${f3}`);
    await page.click('[data-t-act="clear"]');
    await sleep(150);
    await page.type('#tvtQ', 'number line');
    await sleep(200);
    const f4 = await page.$$eval('.tvt-item', (b) => b.length);
    check(f4 > 0 && f4 < tot.items, `todo: search shows ${f4}`);
    await tap('.tvt-item .tvt-row');
    await sleep(150);
    const spec = await page.evaluate(() => { const s = document.querySelector('.tvt-item.is-open .tvt-spec'); return s ? [...s.querySelectorAll('dt')].map((d) => d.textContent) : []; });
    check(['Kind', 'What pupils will do', 'Gap it fills', 'How it looks'].every((x) => spec.includes(x)), `todo: spec ${JSON.stringify(spec)}`);
    check(!(await page.evaluate(() => /\[object/.test(document.querySelector('[data-screen="todo"]').textContent))), 'todo screen shows [object …]');
    check(await page.$('.tvt-item.is-open [data-t-spec-slot]') !== null, 'todo: no slot for the fuller spec');
    await page.evaluate(() => window.scrollTo(0, 0));
    await fit('1366 todo filtered', 'todo');
    await shot('21-todo-search-open-1366');
    // print (clean page of the filtered list) and CSV
    await page.click('[data-t-act="print"]');
    await sleep(200);
    const ph = await page.evaluate(() => window.__opened);
    check(!/\[object/.test(ph), 'todo print shows [object …]');
    check(/<title>Skills to be made<\/title>/.test(ph) && (ph.match(/class="it"/g) || []).length === f4, `todo print: ${(ph.match(/class="it"/g) || []).length} of ${f4}`);
    await page.evaluate(() => { window.__csv = null; const orig = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function () { if (this.download) { fetch(this.href).then((r) => r.text()).then((t) => { window.__csv = { name: this.download, text: t }; }); return; } return orig.call(this); }; });
    await page.click('[data-t-act="csv"]');
    await waitFor(page, () => !!window.__csv, 5000, 'csv');
    const csv = await page.evaluate(() => window.__csv);
    const csvRows = csv.text.replace(/^﻿/, '').split('\r\n').length;
    check(csv.name === 'skills-to-be-made.csv' && csvRows === f4 + 1, `todo csv: ${csv.name} ${csvRows} rows for ${f4}`);
    // a White Rose step opens the lesson
    await page.click('[data-t-act="clear"]');
    await sleep(150);
    const stepItem = await page.evaluate(() => { for (const li of document.querySelectorAll('.tvt-item')) { if (li.dataset.tItem) return li.dataset.tItem; } return ''; });
    const withStep = await page.evaluate(async () => {
      for (const b of document.querySelectorAll('.tvt-item .tvt-row')) {
        b.click();
        const li = document.querySelector(`[data-t-item="${CSS.escape(b.dataset.tOpen)}"]`);
        const st = li && li.querySelector('[data-t-step]');
        if (st) return { id: b.dataset.tOpen, step: st.dataset.tStep };
        document.querySelector(`[data-t-open="${CSS.escape(b.dataset.tOpen)}"]`).click();
      }
      return null;
    });
    check(stepItem && withStep, 'todo: no entry with a White Rose step link');
    if (withStep) {
      await tap(`[data-t-item="${withStep.id}"] [data-t-step="${withStep.step}"]`);
      await waitFor(page, () => !!document.querySelector('[data-screen="wrm"].is-active .tvw-head'), 15000, 'step to wrm');
      const want = all.find((l) => l.step === withStep.step);
      check((await hash()) === `#wrm/${want.grade}/${want.unit}/${want.n}`, `todo step → ${await hash()} (want ${want.key})`);
    }
    // 1280x720
    await page.evaluate(() => window.tvGo('todo'));
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
    await sleep(300);
    await page.evaluate(() => window.scrollTo(0, 0));
    await fit('1280 todo', 'todo');
    await shot('22-todo-1280');
    await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });

    /* ==================================================== the REP map names live skills */
    const deadRep = await page.evaluate(async () => {
      const w = await import('./js/modules/wrm-links.js');
      const ui = await import('./js/modules/teacher-ui.js');
      const dead = [];
      for (const p of w.REP_PAIRS) for (const s of Object.values(p.strands)) for (const k of s.skills) { const [c, i] = k.split(':'); if (!ui.findSkill(c, i)) dead.push(k); }
      return dead;
    });
    check(!deadRep.length, `REP_PAIRS names skills that are not live: ${deadRep.join(', ')}`);

    /* ==================================================== MAP page: practise by task */
    await page.evaluate(() => { try { localStorage.removeItem('mq_teacher_map_ui'); } catch (e) {} window.tvGo('map'); });
    await sleep(300);
    await page.evaluate(() => { const b = document.querySelector('[data-map-tab="tasks"]'); if (b && b.getAttribute('aria-selected') !== 'true') b.click(); });
    await waitFor(page, () => document.querySelectorAll('[data-screen="map"] [data-mk-strand]').length === 7 && !!document.querySelector('[data-mk-task]'), 20000, 'map tasks');
    await page.click('[data-mk-strand="Fractions & decimals"]');
    await sleep(150);
    const bands = await page.$$eval('[data-mk-band]', (b) => b.map((x) => x.dataset.mkBand));
    check(bands.length >= 3 && bands[0] === '', `map: band chips ${bands}`);
    const mt = await page.evaluate(() => {
      for (const b of document.querySelectorAll('[data-mk-task]')) if (!b.classList.contains('is-gap')) return b.dataset.mkTask;
      return '';
    });
    check(!!mt, 'map: no Fractions & decimals task with skills');
    await tap(`[data-mk-task="${mt}"]`);
    await waitFor(page, () => !!document.querySelector('#tvmkDetail .tvw-head'), 5000, 'map task detail');
    const mg = await page.evaluate(() => [...document.querySelectorAll('#tvmkDetail [data-w-group]')].map((g) => [g.dataset.wGroup, g.querySelectorAll('.tvw-row, .tvw-card').length]));
    check(mg.map((g) => g[0]).join() === 'direct,prereq,related' && mg[0][1] > 0, `map task groups ${JSON.stringify(mg)}`);
    await page.$eval('#tvmkDetail [data-act="skill-view"][data-view="list"]', (b) => b.click()).catch(() => {});
    await sleep(100);
    await tap('#tvmkDetail [data-w-quick="direct"]');
    const mtick = await page.$$eval('#tvmkDetail .tvw-tick[aria-checked="true"]', (b) => [...new Set(b.map((x) => x.dataset.wTick))]);
    await tap('#tvmkDetail [data-w-act="link"]');
    await waitFor(page, () => !!document.querySelector('#tvmkLink'), 5000, 'map link');
    const mdec = await decode(await page.$eval('#tvmkLink', (i) => i.value));
    check(mdec.length === mtick.length && mtick.every((x) => mdec.includes(x)), `map link decodes to ${JSON.stringify(mdec)} not ${JSON.stringify(mtick)}`);
    const mh = await hash();
    check(new RegExp(`^#map/tasks/fd/all/${mt}$`).test(mh), `map task hash ${mh}`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await fit('1366 map tasks', 'map');
    await shot('30-map-tasks-1366');
    await page.$eval('#tvmkDetail [data-act="skill-view"][data-view="thumbs"]', (b) => b.click());
    await sleep(1200);
    await fit('1366 map thumbs', 'map');
    await shot('31-map-tasks-thumbs-1366');
    await page.$eval('#tvmkDetail [data-act="skill-view"][data-view="list"]', (b) => b.click());
    await sleep(150);
    const mlabels = await page.$$eval('#tvmkDetail .tvw-row', (rows) => rows.filter((r) => r.querySelector('.tvw-tick[aria-checked="true"]')).map((r) => r.querySelector('.tvw-row-name').textContent.trim()));
    await tap('#tvmkDetail [data-w-act="print"]');
    await sleep(600);
    const mpr = await page.evaluate((names) => { const el = document.querySelector('#teacherMain .tv-screen.is-active'); return { screen: el.dataset.screen, has: names.filter((n) => el.textContent.includes(n)).length }; }, mlabels);
    check(mpr.screen === 'print' && mpr.has === mlabels.length, `map print: ${JSON.stringify(mpr)} of ${mlabels.length}`);

    // a MAP task bookmark reopens the task; Back returns to it from another screen
    await page.goto(`${base}/index.html${mh}`, { waitUntil: 'networkidle2', timeout: 60000 });
    await waitFor(page, () => !!document.querySelector('[data-screen="map"].is-active #tvmkDetail .tvw-head'), 20000, 'map bookmark');
    check(await page.$eval('[data-mk-task][aria-current="true"]', (b) => b.dataset.mkTask) === mt, 'map bookmark: task not reopened');
    await page.evaluate(() => window.tvGo('home'));
    await sleep(300);
    await page.goBack();
    await waitFor(page, () => !!document.querySelector('[data-screen="map"].is-active #tvmkDetail .tvw-head'), 10000, 'map back').catch(() => {});
    check(await page.evaluate(() => (document.querySelector('#teacherMain .tv-screen.is-active') || {}).dataset?.screen) === 'map' && (await hash()) === mh, `map Back: ${await hash()}`);
    await page.evaluate(() => { window.__opened = ''; window.open = () => ({ document: { open() {}, write(h) { window.__opened += h; }, close() {} }, focus() {}, print() {} }); });

    /* ==================================================== MAP page: by representation */
    await page.evaluate(() => window.tvGo('map'));
    await sleep(300);
    await page.click('[data-map-tab="reps"]');
    await waitFor(page, () => !!document.querySelector('[data-screen="map"] [data-mk-strand]'), 10000, 'reps');
    await page.click('[data-mk-strand="Measurement"]');
    await sleep(200);
    // B3: after each strand change every group lists exactly that strand's live skills
    const repCheck = async (strand) => {
      const r = await page.evaluate(async (st) => {
        const w = await import('./js/modules/wrm-links.js');
        const ui = await import('./js/modules/teacher-ui.js');
        const bad = [];
        for (const p of w.REP_PAIRS) {
          const want = (p.strands[st] ? p.strands[st].skills : []).filter((k) => { const [c, i] = k.split(':'); return ui.findSkill(c, i); }).map((k) => k.replace(':', '|'));
          const g = document.querySelector(`#tvmkDetail [data-w-group="${p.id}"]`);
          if (!p.strands[st]) { if (g) bad.push(`${p.id} shown`); continue; }
          const got = g ? [...g.querySelectorAll('.tvw-tick')].map((b) => b.dataset.wTick) : [];
          if (got.join() !== want.join()) bad.push(`${p.id}: ${got} != ${want}`);
        }
        return bad;
      }, strand);
      check(!r.length, `reps ${strand}: ${r.join(' ; ')}`);
    };
    await repCheck('Measurement');
    const reps = await page.evaluate(() => [...document.querySelectorAll('#tvmkDetail [data-w-group]')].map((g) => g.dataset.wGroup));
    check(reps.includes('clock-words') && reps.includes('numberline-number'), `reps Measurement: ${reps}`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await fit('1366 reps', 'map');
    await shot('32-map-reps-1366');
    await page.click('[data-mk-strand="Fractions & decimals"]');
    await sleep(200);
    await repCheck('Fractions & decimals');
    await page.click('[data-mk-strand="Data & graphing"]');
    await sleep(200);
    await repCheck('Data & graphing');
    const rb = await page.$$eval('#tvmkDetail .tvw-tbb-link', (b) => b.length);
    check(rb > 0, 'reps Data & graphing: no "To be built" link');
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
    await sleep(300);
    await page.click('[data-mk-strand="Multiplication & division"]');
    await sleep(200);
    await fit('1280 reps', 'map');
    await shot('33-map-reps-1280');
    await page.click('[data-map-tab="tasks"]');
    await sleep(300);
    await tap('[data-mk-task]:not(.is-gap)');
    await sleep(300);
    await page.evaluate(() => window.scrollTo(0, 0));
    await fit('1280 map tasks', 'map');
    await shot('34-map-tasks-1280');
    // the test itself is still one tab away
    await page.click('[data-map-tab="start"]');
    await sleep(200);
    check(!!(await page.$('[data-map-act="start"]')), 'map: Start a MAP test tab lost the start button');


    /* ==================================================== phone basic check (390x844): nothing scrolls sideways */
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    const side = async (tag) => {
      const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: innerWidth,
        wide: [...document.querySelectorAll('#teacherMain .tv-screen.is-active *')].filter((n) => n.getBoundingClientRect().right > innerWidth + 1 && !n.closest('.tvp-frame, [hidden]') && getComputedStyle(n).position !== 'fixed').slice(0, 3).map((n) => `${n.tagName}.${n.className}`.slice(0, 50)) }));
      check(r.sw <= r.w, `390 ${tag}: page scrolls sideways (${r.sw} > ${r.w}) ${r.wide.join(', ')}`);
    };
    await page.goto(`${base}/index.html#wrm/2/D1/2`, { waitUntil: 'networkidle2', timeout: 60000 });
    await waitFor(page, () => !!document.querySelector('[data-screen="wrm"].is-active .tvw-head'), 20000, '390 wrm');
    await sleep(300);
    await side('White Rose lesson');
    await shot('40-wrm-lesson-390');
    await page.goto(`${base}/index.html${mh}`, { waitUntil: 'networkidle2', timeout: 60000 });
    await waitFor(page, () => !!document.querySelector('[data-screen="map"].is-active #tvmkDetail .tvw-head'), 20000, '390 map');
    await sleep(300);
    await side('MAP task');
    await page.evaluate(() => window.tvGo('todo'));
    await waitFor(page, () => !!document.querySelector('[data-screen="todo"].is-active .tvt-item'), 20000, '390 todo');
    await page.click('.tvt-item .tvt-row');
    await sleep(300);
    await side('Skills to be made');
    await shot('41-todo-390');

    if (app.problems.length) failures.push(`console/page errors: ${app.problems.slice(0, 5).map((p) => `[${p.type}] ${p.text}`).join(' | ')}`);
  } catch (e) {
    failures.push(e.stack || e.message);
  } finally {
    await app.close();
  }
  if (failures.length) { console.error('ws-teacher-wrm: FAIL'); failures.forEach((f) => console.error('  - ' + f)); process.exit(1); }
  console.log('ws-teacher-wrm: OK');
})();
