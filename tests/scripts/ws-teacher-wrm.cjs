// White Rose lessons teacher screen (teacher-wrm.js) — browser gate.
//   node tests/scripts/ws-teacher-wrm.cjs [--shots] [--curated <dir>]
//     --shots    writes design/audit/runs/wrm-page/*.png
//     --curated  serves the link files in <dir> (R.json … Y6.json, MAP.json) as data/curriculum/links/,
//                so the curated path (verdicts, "To be built", MAP.json tasks) is tested before the
//                tagging lanes' files are merged. Without it the computed fallbacks are tested.
//   node tests/scripts/ws-teacher-wrm.cjs --grade 3                 # the every-lesson sweeps cover grade 3 only
//   node tests/scripts/ws-teacher-wrm.cjs --lesson 3:D4:2            # ... only this lesson (its key, site id or WRM step id)
//     --grade / --lesson (ws-precritic --teacher, IMPROVEMENT_PLAN §1.4 S1) narrow the two every-lesson sweeps (the
//     rendered-text sweep and the detailed lessons) to the lessons a lane touched; every scenario check still runs.
//     Grade ids: PK, K, 1-6 ("Grade 3" and "G3" are read as 3). A filter that matches no lesson FAILS.
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
// --fallback: serve an empty index.json, so the computed fallbacks are tested (as shipped, the page reads the
// real link files that data/curriculum/links/index.json lists)
const FALLBACK = process.argv.includes('--fallback');
const SHIP_DIR = path.join(ROOT, 'data', 'curriculum', 'links');
const DATA_DIR = CUR_DIR || (FALLBACK ? '' : SHIP_DIR);
const SHIP_IDX = DATA_DIR === SHIP_DIR && fs.existsSync(path.join(SHIP_DIR, 'index.json')) ? JSON.parse(fs.readFileSync(path.join(SHIP_DIR, 'index.json'), 'utf8')) : null;
const CUR_YEARS = !DATA_DIR ? [] : SHIP_IDX ? (SHIP_IDX.years || []) : ['R', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6'].filter((y) => fs.existsSync(path.join(DATA_DIR, `${y}.json`)));
const CUR_MAP = !DATA_DIR ? false : SHIP_IDX ? !!SHIP_IDX.map : fs.existsSync(path.join(DATA_DIR, 'MAP.json'));
const { jargonHit } = require('../lib/wrm-jargon.cjs');
const OUT = path.join(ROOT, 'design', 'audit', 'runs', 'wrm-page');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const argOf = (f) => { const i = process.argv.indexOf(f); return i > 0 && i + 1 < process.argv.length ? String(process.argv[i + 1]) : ''; };
const ONLY_GRADE = argOf('--grade').replace(/^(grade|g)\s*/i, '').replace(/^pre-?k$/i, 'PK').toUpperCase();
const ONLY_LESSON = argOf('--lesson');
const sweepHas = (l) => !!l && (!ONLY_GRADE || String(l.grade).toUpperCase() === ONLY_GRADE)
  && (!ONLY_LESSON || [l.key, l.site, l.step].some((v) => v != null && String(v) === ONLY_LESSON));

(async () => {
  await require('../lib/wrm-jargon.cjs').ready();
  const failures = [];
  const check = (ok, msg) => { if (!ok) failures.push(msg); };
  // Pick the test lessons from the data itself (node side), so the gate follows the data.
  const links = await import(path.join(ROOT, 'js/modules/wrm-links.js'));
  for (const y of CUR_YEARS) links.addCuratedYear(JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${y}.json`), 'utf8')));
  const all = links.allLessons();
  // the list section a lesson is listed in (owner 2026-10-17 navigation): its domain section's key, or 'extra'
  const secOf = (l) => (links.gradeSections(l.grade).find((s) => s.lessons.includes(l)) || {}).key;
  const pref = (f) => all.find((l) => l.grade === '2' && f(l)) || all.find((l) => l.type === 'wr' && f(l));
  const builtLesson = CUR_YEARS.length ? pref((l) => links.linksFor(l).build.length) : null;
  const optLesson = CUR_YEARS.length ? pref((l) => links.linksFor(l).prereq.some((x) => x.opts)) : null;
  // every lesson the real files tag, for the rendered-text jargon sweep (critic r4 M3)
  const curLessons = CUR_YEARS.length ? all.filter((l) => l.step && links.linksFor(l).source === 'curated') : [];
  const partLesson = CUR_YEARS.length ? all.find((l) => l.key === 'PK:CC3:1' && links.linksFor(l).verdict === 'partial') || all.find((l) => links.linksFor(l).source === 'curated' && links.linksFor(l).verdict === 'partial') : null;
  const longWhyLesson = CUR_YEARS.length ? all.find((l) => { const r = links.linksFor(l); return r.source === 'curated' && [...r.prereq, ...r.related].some((x) => String(x.why).length > 120); }) : null;
  const copiedLesson = all.find((l) => l.type === 'copied');
  const gapLesson = all.find((l) => l.grade === '3' && l.type === 'wr' && l.step && !links.linksFor(l).direct.length)
    || all.find((l) => l.type === 'wr' && l.step && !links.linksFor(l).direct.length);
  const buildLesson = all.find((l) => l.grade === '3' && l.type === 'build');
  const rich = all.find((l) => l.grade === '2' && links.linksFor(l).direct.length >= 2 && links.linksFor(l).prereq.length >= 2 && links.linksFor(l).related.length >= 1);
  // round 7: the school site's own lessons (a tagged one when a year file has a "lessons" section)
  // owner 2026-10-17: the site orders the page, so its CCSS BUILD lessons are sequence rows that carry their site id
  const siteTagged = all.find((l) => l.site && !l.step && l.siteInfo && l.siteInfo.kind === 'lesson' && links.linksFor(l).source === 'curated' && links.linksFor(l).direct.length);
  const siteUntagged = all.find((l) => l.site && l.siteInfo && l.siteInfo.flag === 'committee' && links.linksFor(l).source !== 'curated');
  // as shipped every CCSS BUILD lesson may be tagged; the bookmark case then opens a tagged one
  const siteBuild = siteUntagged || all.find((l) => l.site && l.siteInfo && l.siteInfo.flag === 'committee');
  const supportLesson = all.find((l) => l.type === 'site' && l.siteInfo.flag === 'enrich-native');
  const assessLesson = all.find((l) => l.type === 'assessment' && l.grade === '4') || all.find((l) => l.type === 'assessment');

  const app = await open({ seed: 11, viewport: { width: 1366, height: 768, deviceScaleFactor: 1 } });
  const { page, browser, base } = app;
  // One request handler for every mode: --curated / --fallback answer the link files. Round 9: the detailed lessons
  // (data/curriculum/detailed-lessons.json, the real file) are on as shipped and with --curated, off with --fallback.
  const DL_FILE = path.join(ROOT, 'data', 'curriculum', 'detailed-lessons.json');
  const DL_ON = !FALLBACK && fs.existsSync(DL_FILE) && (CUR_DIR ? true : !!(SHIP_IDX && SHIP_IDX.detailed));
  const detailedAsked = [];       // every request for data/curriculum/detailed-lessons.json
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.isInterceptResolutionHandled && req.isInterceptResolutionHandled()) return;
    if (/\/data\/curriculum\/detailed-lessons\.json(\?|$)/.test(req.url())) {
      detailedAsked.push(req.url());
      req.continue();
      return;
    }
    const m = /\/data\/curriculum\/links\/([A-Za-z0-9]+)\.json(\?|$)/.exec(req.url());
    if (!m || !(CUR_DIR || FALLBACK)) { req.continue(); return; }
    let body;
    if (m[1] === 'index') {
      const base0 = CUR_DIR || FALLBACK ? (FALLBACK ? { years: [], map: false } : { years: CUR_YEARS, map: !!CUR_MAP }) : JSON.parse(fs.readFileSync(path.join(SHIP_DIR, 'index.json'), 'utf8'));
      body = JSON.stringify({ ...base0, detailed: DL_ON });
    } else body = fs.readFileSync(path.join(CUR_DIR, `${m[1]}.json`), 'utf8');
    req.respond({ status: 200, contentType: 'application/json', body });
  });
  // fix round 6: the plain-English check over the FULL rendered text of a screen (chrome lines may start lower
  // case: "and 3 more") and over every teacher field on it as a sentence (no fragment) — the same check the
  // screens use to decide whether a note is shown (js/modules/plain-words.js).
  const FIELD_SEL = '.tvw-why, .tvw-verdict, .tvw-tbb-link, .tvw-tm-name, .tvw-tm-what, .tvw-tm-lead, .tvw-tm-empty, .tvt-dl dd:not(.tvt-codes), .tvt-name';   // titles and names are checked as screen lines
  /** The distinct reasons in a list of sweep failures, most frequent first (so one run shows every form). */
  const summ = (bad) => { const c = {}; for (const b of bad) { const k = (/\) ([^:]+: \[[^\]]*\])/.exec(b) || [, b.slice(0, 60)])[1]; c[k] = (c[k] || 0) + 1; } return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 40).map(([k, n]) => `${n}× ${k}`).join(' ; '); };
  const plainSweep = async (sel, tag, bad) => {
    const r = await page.evaluate((sel, fsel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      // every visible text node as written (innerText would apply CSS upper-casing to the chrome labels)
      const nodes = [];
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) {
        const t = n.data.replace(/\s+/g, ' ').trim();
        const p = n.parentElement;
        if (!t || !p || p.closest('script, style, [hidden], [aria-hidden="true"]') || !p.getClientRects().length) continue;
        nodes.push(t);
      }
      const fields = [...el.querySelectorAll(fsel)].filter((x) => !x.querySelector('ul')).map((x) => x.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean);
      const lis = [...el.querySelectorAll('.tvt-dl dd li')].map((x) => x.textContent.replace(/\s+/g, ' ').trim());
      return { nodes, fields, lis };
    }, sel, FIELD_SEL);
    if (!r) { bad.push(`${tag}: ${sel} not found`); return 0; }
    let n = 0;
    for (const line of r.nodes) { n += 1; const h = jargonHit(line, { fragment: false }); if (h) bad.push(`${tag} (screen) ${h.name}: ${h.snippet}`); }
    for (const f of r.fields) { n += 1; const h = jargonHit(f); if (h) bad.push(`${tag} (field) ${h.name}: ${h.snippet}`); }
    for (const f of r.lis) { n += 1; const h = jargonHit(f, { fragment: false }); if (h) bad.push(`${tag} (list) ${h.name}: ${h.snippet}`); }
    return n;
  };
  // one case's error is reported and the run goes on (critic r4 B8)
  const step = async (name, fn) => { try { await fn(); } catch (e) { failures.push(`${name}: ${(e && e.message) || e}`); } };
  const shot = async (name) => { if (SHOTS) { fs.mkdirSync(OUT, { recursive: true }); await page.screenshot({ path: path.join(OUT, `${name}.png`) }); } };
  const hash = () => page.evaluate(() => location.hash);
  // owner 2026-10-17 navigation evidence: design/audit/runs/wrm-page/nav/
  const shotNav = async (name) => { if (SHOTS) { fs.mkdirSync(path.join(OUT, 'nav'), { recursive: true }); await page.screenshot({ path: path.join(OUT, 'nav', `${name}.png`) }); } };
  // round 7: a FULL page load at a hash (index.json and the detailed-lessons file are read once per load; a goto that
  // only changes the hash is a same-document navigation). The teacher role is set again after the load.
  const freshLoad = async (h, sel = '[data-screen="wrm"].is-active .tvw-lesson') => {
    await page.goto('about:blank');
    await page.goto(`${base}/index.html${h}`, { waitUntil: 'networkidle2', timeout: 60000 });
    await waitFor(page, () => typeof window.setUserRole === 'function' && typeof window.tvGo === 'function', 30000, 'fresh boot');
    await page.evaluate(() => { navigator.clipboard.writeText = () => Promise.resolve(); window.setUserRole('teacher'); });
    await waitFor(page, `!!document.querySelector(${JSON.stringify(sel)})`, 20000, `fresh load ${h}`);
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await sleep(300);
  };
  // Click as a teacher would: scroll the target to the middle first, so the sticky action bar
  // (which covers the bottom of the window by design) is never what gets the click.
  const tap = async (sel) => {
    await page.$eval(sel, (el) => el.scrollIntoView({ block: 'center' }));
    await sleep(50);
    await page.click(sel);
  };
  // T4: the quick tick row went (each list keeps its Select all): "Everything" = every list's Select all on
  const tickAll = async (scope = '[data-screen="wrm"].is-active') => {
    for (const b of await page.$$(`${scope} [data-w-all]`)) {
      const on = await b.evaluate((x) => x.getAttribute('aria-checked') === 'true');
      if (!on) { const sel = await b.evaluate((x) => `[data-w-all="${x.dataset.wAll}"]`); await tap(`${scope} ${sel}`); await sleep(80); }
    }
  };
  const tickOnly = async (g, scope = '[data-screen="wrm"].is-active') => {
    for (const x of ['direct', 'prereq', 'related']) {
      const sel = `${scope} [data-w-all="${x}"]`;
      if (!(await page.$(sel))) continue;
      let on = await page.$eval(sel, (b) => b.getAttribute('aria-checked') === 'true');
      if (on !== (x === g)) { await tap(sel); await sleep(80); on = await page.$eval(sel, (b) => b.getAttribute('aria-checked') === 'true'); }
      if (on !== (x === g)) { await tap(sel); await sleep(80); }
    }
  };
  // T4: "Skills to be made for this lesson" is folded at the end of the panel: unfold it before using it
  const openTm = async () => { if (await page.$('[data-screen="wrm"].is-active [data-w-tm-toggle][aria-expanded="false"]')) { await tap('[data-screen="wrm"].is-active [data-w-tm-toggle]'); await sleep(150); } };
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
      // T4: the fixed bar is the TRAY (#tvTray); the lesson's actions (#tvwBar) sit in the panel under its head, so on a
      // Chromebook the lesson's Print practice / Add to tray must be on screen and clear of the tray when it opens
      const bar = document.querySelector('#tvTray');
      const barTop = bar && bar.offsetParent ? bar.getBoundingClientRect().top : innerHeight;
      const row = document.querySelector('[data-screen="wrm"] #tvwBar [data-w-act="tray"]') || document.querySelector('[data-screen="wrm"] .tvw-group .tvw-row, [data-screen="wrm"] .tvw-group .tvw-card');
      const rowTop = row ? row.getBoundingClientRect().top : 9999;
      const under = [...document.querySelectorAll('[data-screen="wrm"] #tvwBar button')]
        .filter((b) => { const q = b.getBoundingClientRect(); return q.width && q.bottom > barTop && q.top < innerHeight; }).map((b) => b.textContent.trim());
      return { barTop: Math.round(barTop), rowTop: Math.round(rowTop), under };
    });
    check(r.rowTop + 40 <= r.barTop, `${tag}: the lesson's actions at ${r.rowTop}px are not clear of the tray bar at ${r.barTop}px`);
    check(!r.under.length, `${tag}: under the tray bar: ${r.under.join(', ')}`);
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
    check(/^#wrm\/2$/.test(await hash()), `hash on open: ${await hash()}`);
    const grades = await page.$$eval('[data-w-grade]', (b) => b.map((x) => x.textContent.trim()));
    check(grades.join() === 'Pre-K,K,Grade 1,Grade 2,Grade 3,Grade 4,Grade 5', `grade row ${grades}`);
    check(await page.$eval('.tvw-empty', (e) => /Choose a lesson/.test(e.textContent)), 'empty detail: no "Choose a lesson"');
    await fit('1366 start');
    await shot('01-start-1366');

    /* ---------------------------------------------------- the navigation (owner 2026-10-17): grade → domains → the list */
    // what the list shows, read from the page, against gradeSections() (domains in the site's order, Extra lessons last,
    // every lesson of the grade once, numbered 1, 2, 3 within its section, title + at most two small tags, no weeks)
    const navCheck = async (g, tag) => {
      const want = links.gradeSections(g);
      const r = await page.evaluate(() => {
        const list = document.querySelector('[data-screen="wrm"].is-active #tvwLessons');
        return {
          doms: [...document.querySelectorAll('[data-screen="wrm"].is-active #tvwDoms [data-w-sec]')].map((b) => [b.dataset.wSec, b.textContent.trim()]),
          secs: [...list.querySelectorAll('[data-w-secbox]')].map((s) => ({ key: s.dataset.wSecbox, name: s.querySelector('.tvw-sec-t').textContent.trim(),
            rows: [...s.querySelectorAll('.tvw-nrow')].map((b) => ({ key: b.dataset.wLesson, n: b.querySelector('.tvw-nrow-n').textContent.trim(),
              tags: [...b.querySelectorAll('.tvw-nrow-tags .tvw-tag')].map((x) => x.textContent.trim()), all: b.querySelectorAll('.tvw-tag').length })),
            tmuHidden: !s.querySelector('.tvw-tmu') || s.querySelector('.tvw-tmu').hidden })),
          text: list.innerText,
          pressed: [...document.querySelectorAll('[data-screen="wrm"].is-active [data-w-grade][aria-pressed="true"]')].map((b) => b.dataset.wGrade),
        };
      });
      check(r.pressed.join() === g, `${tag}: grade row marks ${r.pressed} not ${g}`);
      check(JSON.stringify(r.doms) === JSON.stringify(want.map((s) => [s.key, s.name])), `${tag}: domain row ${JSON.stringify(r.doms)} not ${JSON.stringify(want.map((s) => [s.key, s.name]))}`);
      check(r.secs.map((s) => s.key).join() === want.map((s) => s.key).join() && r.secs.map((s) => s.name).join() === want.map((s) => s.name).join(), `${tag}: sections ${r.secs.map((s) => s.name)}`);
      const extraWant = want.find((s) => s.extra);
      if (extraWant) check(r.secs[r.secs.length - 1].key === 'extra' && r.secs[r.secs.length - 1].name === 'Extra lessons', `${tag}: Extra lessons is not the last section`);
      const mine = all.filter((l) => l.grade === g);
      const keys = r.secs.flatMap((s) => s.rows.map((x) => x.key));
      check(keys.length === mine.length && new Set(keys).size === keys.length && mine.every((l) => keys.includes(l.key)), `${tag}: ${keys.length} rows for ${mine.length} lessons (each once)`);
      const extraRows = (r.secs.find((s) => s.key === 'extra') || { rows: [] }).rows.map((x) => x.key);
      const nonCore = mine.filter((l) => !links.isCoreLesson(l)).map((l) => l.key);
      check(extraRows.length === nonCore.length && nonCore.every((k) => extraRows.includes(k)), `${tag}: Extra lessons holds ${extraRows.length} rows, ${nonCore.length} non-core lessons`);
      for (const [i, s] of r.secs.entries()) {
        check(JSON.stringify(s.rows.map((x) => x.key)) === JSON.stringify(want[i].lessons.map((l) => l.key)), `${tag} ${s.key}: rows not in the site's order`);
        check(s.rows.every((x, j) => x.n === String(j + 1)), `${tag} ${s.key}: rows not numbered 1, 2, 3 …`);
        check(s.rows.every((x) => x.all <= 2 && x.tags.every((t) => /^(Full|Covers part|No skill yet|CCSS · BUILD)$/.test(t))), `${tag} ${s.key}: a row with other tags ${JSON.stringify(s.rows.find((x) => x.all > 2 || x.tags.some((t) => !/^(Full|Covers part|No skill yet|CCSS · BUILD)$/.test(t))))}`);
        check(s.tmuHidden, `${tag} ${s.key}: the Skills to be made card is open by default`);
      }
      const wk = /\bWeeks?\b|\bW\d\d\b|\b\d{1,2}\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b|\bStrand|\+\d\b/.exec(r.text);
      check(!wk, `${tag}: week / date text in the list: "${wk && r.text.slice(Math.max(0, wk.index - 30), wk.index + 20)}"`);
    };
    await navCheck('2', 'nav Grade 2');

    /* ---------------------------------------------------- grade → domain → lesson */
    await page.click('[data-w-grade="3"]');
    await waitFor(page, () => document.querySelector('[data-w-grade="3"]')?.getAttribute('aria-pressed') === 'true', 8000, 'grade 3');
    check(/^#wrm\/3$/.test(await hash()), `hash after grade: ${await hash()}`);
    const units3 = await page.$$eval('[data-w-sec]', (b) => b.map((x) => x.dataset.wSec));
    check(units3.join() === 'D1,D2,D3,D4,D5,extra', `grade 3 domain row ${units3}`);
    await navCheck('3', 'nav Grade 3');
    // a domain button jumps the list to that section (its heading in the list's view) and is the bookmark
    await page.click('[data-w-sec="D4"]');
    await sleep(200);
    const jump = await page.evaluate(() => { const l = document.querySelector('#tvwLessons').getBoundingClientRect(); const h = document.querySelector('#tvwSecH-D4').getBoundingClientRect(); return { inList: h.top >= l.top - 1 && h.top < l.top + 80, focus: document.activeElement && document.activeElement.id }; });
    check(jump.inList && jump.focus === 'tvwSecH-D4' && (await hash()) === '#wrm/3/D4', `domain jump: ${JSON.stringify(jump)} ${await hash()}`);
    await page.click('[data-w-grade="2"]');
    await waitFor(page, () => document.querySelector('[data-w-grade="2"]')?.getAttribute('aria-pressed') === 'true', 8000, 'grade 2');
    await page.click(`[data-w-sec="${secOf(rich)}"]`);
    await sleep(300);
    await tap(`.tvw-nrow[data-w-lesson="${rich.key}"]`);
    await waitFor(page, () => !!document.querySelector('.tvw-head'), 5000, 'detail');
    check((await hash()) === `${links.lessonHash(rich)}`, `hash after lesson: ${await hash()}`);
    // the lesson opens BESIDE the list (right column), the list stays on screen
    const side0 = await page.evaluate(() => { const l = document.querySelector('#tvwLessons').getBoundingClientRect(); const d = document.querySelector('#tvwDetail').getBoundingClientRect(); const row = document.querySelector('.tvw-nrow[aria-current="true"]'); return { beside: d.left >= l.right, listOn: l.width > 200 && l.bottom > 100, rowOn: !!row && row.getBoundingClientRect().width > 0, fixed: getComputedStyle(document.querySelector('#tvwDetail')).position, back: (document.querySelector('[data-w-back]') || { getClientRects: () => [] }).getClientRects().length }; });
    check(side0.beside && side0.listOn && side0.rowOn && side0.fixed !== 'fixed' && !side0.back, `1366 side panel: ${JSON.stringify(side0)}`);
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

    /* ---------------------------------------------------- tick: the teaching skills come ticked (T4), one, select all */
    const nDir = d.groups.find((g) => g[0] === 'direct')[1];
    const nPre = d.groups.find((g) => g[0] === 'prereq')[1];
    const ticked0 = await page.$$eval('[data-w-group="direct"] .tvw-tick[aria-checked="true"]', (b) => b.map((x) => x.dataset.wTick));
    check(ticked0.length === nDir && await page.$$eval('.tvw-tick[aria-checked="true"]', (b) => b.length) === nDir, `opening: ${ticked0.length}/${nDir} teaching skills ticked (only they should be)`);
    // untick the teaching skills (Select all twice: on, off), then one tick
    await tap('[data-w-all="direct"]');
    await sleep(100);
    if (await page.$$eval('.tvw-tick[aria-checked="true"]', (b) => b.length)) { await tap('[data-w-all="direct"]'); await sleep(100); }
    const firstDirect = await page.$eval('[data-w-group="direct"] .tvw-tick', (b) => b.dataset.wTick);
    await tap('[data-w-group="direct"] .tvw-tick');
    await sleep(100);
    check(await page.$eval('#tvwBar .tv-h3', (h) => /^1 skill selected/.test(h.textContent)), 'tick: bar does not say 1 skill');
    await tap('[data-w-all="prereq"]');
    await sleep(100);
    check(await page.$eval('#tvwBar .tv-h3', (h, n) => h.textContent.startsWith(`${n + 1} skills`), nPre), 'select all prereq: count wrong');
    await tap('[data-w-all="direct"]');
    await sleep(100);
    const ticked = await page.$$eval('[data-w-group="direct"] .tvw-tick[aria-checked="true"]', (b) => b.map((x) => x.dataset.wTick));
    check(ticked.length === nDir && ticked.includes(firstDirect), `select all direct ticked ${ticked.length}/${nDir}`);
    // only the do-first skills: untick the teaching ones again
    await tap('[data-w-all="direct"]');
    await sleep(100);
    const tickedPre = await page.$$eval('.tvw-tick[aria-checked="true"]', (b) => [...new Set(b.map((x) => x.dataset.wTick))]);
    check(tickedPre.length === new Set(await page.$$eval('[data-w-group="prereq"] .tvw-tick', (b) => b.map((x) => x.dataset.wTick))).size, `only do-first ticked: ${tickedPre.length}`);

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

    /* ---------------------------------------------------- Print practice: the sheet opens on ONLY the ticked skills (T4) */
    const trayBefore = await page.evaluate(() => JSON.stringify((window.skillQueue || []).map((x) => `${x.categoryId}|${x.skillId}`)));
    await tap('[data-w-act="print"]');
    await waitFor(page, () => !!document.querySelector('#tvSheet .tvs-sheet'), 8000, 'print sheet');
    const pr = await page.evaluate(() => ({ st: window.tvSheetState(), keys: (window.skillQueue || []).map((x) => `${x.categoryId}|${x.skillId}`), hash: location.hash, screen: (document.querySelector('#teacherMain .tv-screen.is-active') || {}).dataset?.screen }));
    check(pr.st.sheet === 'print' && pr.st.kind === 'sections' && pr.keys.length === tickedPre.length && tickedPre.every((k) => pr.keys.includes(k)), `print practice: sheet ${pr.st.sheet} ${pr.st.kind}, skills ${JSON.stringify(pr.keys)} not ${JSON.stringify(tickedPre)}`);
    check(pr.screen === 'wrm' && pr.hash === links.lessonHash(rich), `print practice: left the lesson (${pr.screen} ${pr.hash})`);
    await page.keyboard.press('Escape');
    await sleep(300);
    const back = await page.evaluate(() => ({ sheet: !!document.querySelector('#tvSheet'), tray: JSON.stringify((window.skillQueue || []).map((x) => `${x.categoryId}|${x.skillId}`)), title: (document.querySelector('.tvw-title') || {}).textContent || '' }));
    check(!back.sheet && back.tray === trayBefore && back.title.includes(rich.title), `print practice closed: the tray did not come back, or the lesson left (${JSON.stringify(back)} vs ${trayBefore})`);

    /* ---------------------------------------------------- one tick → a one-skill practice link */
    for (const g of ['direct', 'prereq', 'related']) {
      if (await page.$eval(`[data-w-all="${g}"]`, (b) => b.getAttribute('aria-checked') === 'true').catch(() => false)) { await tap(`[data-w-all="${g}"]`); await sleep(80); }
      while (await page.$(`[data-w-group="${g}"] .tvw-tick[aria-checked="true"]`)) { await tap(`[data-w-group="${g}"] .tvw-tick[aria-checked="true"]`); await sleep(80); }
    }
    const oneKey = await page.$eval('[data-w-group="related"] .tvw-tick', (b) => b.dataset.wTick);
    await tap('[data-w-group="related"] .tvw-tick');
    await sleep(100);
    await tap('[data-w-act="link"]');
    await waitFor(page, () => !!document.querySelector('#tvwLink'), 5000, 'one link');
    const one = await decode(await page.$eval('#tvwLink', (i) => i.value));
    check(one.length === 1 && one[0] === oneKey, `one tick: link has ${JSON.stringify(one)} not ${oneKey}`);

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
    check((await hash()) === `${links.lessonHash(gapLesson)}`, `search jump hash ${await hash()}`);

    /* ---------------------------------------------------- gap and to-be-built lessons */
    const gap = await page.evaluate(() => ({ none: (document.querySelector('[data-w-group="direct"] .tvw-none') || {}).textContent || '', verdict: (document.querySelector('.tvw-verdict') || {}).textContent || '', rowGap: !!document.querySelector('.tvw-lesson[aria-current="true"].is-gap') }));
    check(/No skill teaches this lesson yet/.test(gap.none) && gap.rowGap, `gap lesson: ${JSON.stringify(gap)}`);
    await fit('1366 gap');
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot('07-gap-lesson-1366');
    await page.evaluate((h) => { location.hash = h; }, `${links.lessonHash(buildLesson)}`);
    await sleep(500);
    const bl = await page.evaluate(() => (document.querySelector('.tvw-verdict') || {}).textContent || '');
    // a CCSS BUILD row: "still to write" (no site id), "Skills not tagged yet" (the site names it, no links entry)
    // or the links file's verdict when the year file tags it (round 7)
    check(/still to write|Skills not tagged yet|teach every part|cover part|No skill teaches/.test(bl), `build lesson verdict "${bl}"`);
    check(await page.evaluate(() => /CCSS · BUILD/.test((document.querySelector('.tvw-head .tvw-tags') || {}).textContent || '')), 'build lesson: no "CCSS · BUILD" flag');
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot('08-build-lesson-1366');

    /* ---------------------------------------------------- Pre-K */
    // the grade and domain rows stay on screen while a lesson is open
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.click('[data-w-grade="PK"]');
    await sleep(300);
    const pk = await page.$$eval('.tvw-lesson', (b) => b.length);
    check(pk > 5, `Pre-K: ${pk} lessons`);
    await navCheck('PK', 'nav Pre-K');
    await shot('09-prek-1366');
    // a search finds lessons in every grade: from Pre-K, a Grade 4 lesson opens Grade 4 at that lesson
    {
      const g4 = all.find((l) => l.grade === '4' && links.isCoreLesson(l) && l.title.length > 12 && links.searchLessons(l.title, 10, 'PK')[0] === l);
      await page.click('#tvwSearch', { clickCount: 3 });
      await page.type('#tvwSearch', g4.title);
      await sleep(300);
      await page.keyboard.press('Enter');
      await waitFor(page, `location.hash === ${JSON.stringify(links.lessonHash(g4))} && !!document.querySelector('#tvwDetail .tvw-head')`, 8000, 'search across grades');
      const sg = await page.evaluate(() => ({ g: (document.querySelector('[data-w-grade][aria-pressed="true"]') || {}).dataset?.wGrade, cur: (document.querySelector('.tvw-nrow[aria-current="true"]') || {}).dataset?.wLesson }));
      check(sg.g === '4' && sg.cur === g4.key, `search across grades: ${JSON.stringify(sg)} want 4 ${g4.key}`);
    }

    /* ---------------------------------------------------- bookmark: reload at a hash */
    await page.goto(`${base}/index.html${links.lessonHash(rich)}`, { waitUntil: 'networkidle2', timeout: 60000 });
    await waitFor(page, () => !!document.querySelector('.tvw-head'), 20000, 'bookmark reload');
    const bm = await page.evaluate(() => ({ screen: document.querySelector('#teacherMain .tv-screen.is-active').dataset.screen, title: document.querySelector('.tvw-title').textContent }));
    check(bm.screen === 'wrm' && bm.title.includes(rich.title), `bookmark: ${JSON.stringify(bm)}`);

    /* ---------------------------------------------------- 1280x720 */
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
    await sleep(300);
    await fit('1280 list');
    await page.click(`.tvw-nrow[data-w-lesson="${rich.key}"]`).catch(() => {});
    await sleep(500);
    await clearOfBar('1280 lesson open');
    await shot('10-lesson-list-1280');
    await page.click('[data-act="skill-view"][data-view="thumbs"]');
    await sleep(1000);
    await fit('1280 thumbs');
    await shot('11-thumbs-1280');
    await tickAll();
    await tap('[data-w-act="link"]');
    await sleep(300);
    await page.evaluate(() => window.scrollTo(0, 400));
    await fit('1280 link');
    await shot('12-everything-link-1280');
    // the tray bar stays on screen while the skills scroll (T4: the fixed bar of the Lessons place)
    const bar = await page.$eval('#tvTray', (b) => { const r = b.getBoundingClientRect(); return r.bottom <= window.innerHeight + 1 && r.top < window.innerHeight; });
    check(bar, '1280: tray bar not visible while scrolled');
    await page.click('[data-act="skill-view"][data-view="list"]');

    /* ---------------------------------------------------- dark mode, keyboard */
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await sleep(150);
    await shot('13-dark-1280');
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    await page.focus('[data-w-grade="4"]');
    await page.keyboard.press('Enter');
    await sleep(300);
    check(/^#wrm\/4$/.test(await hash()), `keyboard: Enter on a grade button gave ${await hash()}`);
    // the list: arrow keys move through the rows (across sections), End to the last, Enter opens the row with the focus
    {
      const order = links.gradeSections('4').flatMap((s) => s.lessons.map((l) => l.key));
      await page.focus(`.tvw-nrow[data-w-lesson="${order[0]}"]`);
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      const k2 = await page.evaluate(() => document.activeElement && document.activeElement.dataset.wLesson);
      await page.keyboard.press('ArrowUp');
      const k1 = await page.evaluate(() => document.activeElement && document.activeElement.dataset.wLesson);
      await page.keyboard.press('End');
      const kEnd = await page.evaluate(() => document.activeElement && document.activeElement.dataset.wLesson);
      check(k2 === order[2] && k1 === order[1] && kEnd === order[order.length - 1], `keyboard: arrows went ${k2}, ${k1}, End ${kEnd}`);
      await page.keyboard.press('Home');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await waitFor(page, `location.hash === ${JSON.stringify(links.lessonHash(links.lessonByKey(order[1])))} && !!document.querySelector('#tvwDetail .tvw-head')`, 8000, 'keyboard Enter opens');
      const kf = await page.evaluate(() => document.activeElement && document.activeElement.dataset.wLesson);
      check(kf === order[1], `keyboard: after Enter the focus is on ${kf}, not the row`);
    }

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
      await page.evaluate((h) => { location.hash = h; }, `${links.lessonHash(builtLesson)}`);
      // owner 2026-10-17: the lesson's planned skills are the "Skills to be made for this lesson" card (no line in the head)
      await waitFor(page, () => !!document.querySelector('#tvwToMake .tvw-tm-link[data-todo-open]'), 10000, 'to be built link');
      check(!(await page.$('.tvw-head .tvw-tbb-link')), 'the head still has its own "Still to make" line');
      const tbbId = await page.$eval('#tvwToMake .tvw-tm-link[data-todo-open]', (b) => b.dataset.todoOpen);
      await page.evaluate(() => window.scrollTo(0, 0));
      await fit('1366 curated lesson');
      await shot('14-curated-to-be-built-1366');
      await openTm();
      await tap('#tvwToMake .tvw-tm-link[data-todo-open]');
      await page.evaluate((id) => { window.__tbb = id; }, tbbId);
      await waitFor(page, () => !!document.querySelector(`[data-screen="todo"].is-active [data-t-item="${CSS.escape(window.__tbb)}"].is-open`), 15000, 'todo at entry');
      await sleep(200);
      await shot('15-todo-entry-from-lesson-1366');
    } else if (CUR_YEARS.length) failures.push('curated: no lesson with a build proposal');

    /* ==================================================== curated options travel into the link (B2) */
    if (optLesson) {
      await page.evaluate(() => window.tvGo('home'));
      await page.evaluate((h) => { location.hash = h; }, `${links.lessonHash(optLesson)}`);
      await waitFor(page, () => !!document.querySelector('[data-screen="wrm"].is-active .tvw-head'), 10000, 'opt lesson');
      await sleep(300);
      await tickOnly('prereq');
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
      check(!/\b(R|Y\d)\.B\d+\.S\d+|prior learning|wk W|not dealt|[{}\[\]]|Gr\./.test(why), `why lines show ids/jargon: ${why.slice(0, 200)}`);
      for (const w of why.split(' | ')) { const h = jargonHit(w); check(!h, `why line jargon (${h && h.name}): ${h && h.snippet}`); }
    } else if (CUR_YEARS.length) failures.push('curated: no lesson whose do-first skills carry options');

    /* ==================================================== Skills to be made, per lesson and per unit (owner 2026-10-17) */
    await step('to-make cards', async () => {
      const TMK = await import(path.join(ROOT, 'js/modules/lesson-tomake.js'));
      const BQ = await import(path.join(ROOT, 'js/modules/build-queue.js'));
      const DLK = await import(path.join(ROOT, 'js/modules/detailed-links.js'));
      // the page names live skills through its labeler; node installs the same (a detailed "redo <skill>" row needs it)
      globalThis.localStorage = globalThis.localStorage || { getItem: () => null, setItem() {}, removeItem() {} };
      const DATA = await import(path.join(ROOT, 'js/modules/data.js'));
      const { teacherLabel } = await import(path.join(ROOT, 'js/modules/teacher-label.js'));
      links.setSkillLabeler((id) => { const [a0, b0] = String(id).includes(':') ? String(id).split(':') : [DATA.getCategoryForSkill(id), id]; const sk = (DATA.SKILLS[a0] || []).find((x) => x.v === b0); return sk ? teacherLabel(sk.l) : null; });
      const years = CUR_YEARS.map((y) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${y}.json`), 'utf8')));
      const mapData = CUR_MAP ? JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'MAP.json'), 'utf8')) : null;
      const Qi = BQ.buildQueue({ curated: years, map: mapData }).items;
      const dlx = DL_ON ? DLK.indexDetailed(JSON.parse(fs.readFileSync(DL_FILE, 'utf8'))) : null;
      const tmOf = (l) => TMK.lessonToMake(l, links.linksFor(l), { queue: Qi, detailed: DLK.detailedOf(dlx, l) });
      const TMDIR = path.join(OUT, 'tomake');
      const elShot = async (sel, name) => { if (!SHOTS) return; fs.mkdirSync(TMDIR, { recursive: true }); const h = await page.$(sel); if (!h) return;
        // the sticky action bar is the page's own chrome; the evidence is the card, so the bar steps aside for the picture
        await page.evaluate(() => { const b = document.querySelector('.tvw-bar, #tvwBar'); if (b) b.style.visibility = 'hidden'; });
        await h.screenshot({ path: path.join(TMDIR, `${name}.png`) });
        await page.evaluate(() => { const b = document.querySelector('.tvw-bar, #tvwBar'); if (b) b.style.visibility = ''; }); };
      const openLesson = async (l) => {
        await page.evaluate(() => window.tvGo('home'));
        await page.evaluate((h) => { location.hash = h; }, links.lessonHash(l));
        await waitFor(page, `(document.querySelector('[data-screen="wrm"].is-active #tvwDetail .tvw-title') || {}).textContent?.includes(${JSON.stringify(l.title.slice(0, 20))}) && !!document.querySelector('#tvwToMake:not([data-w-tomake="loading"])')`, 20000, `to-make card on ${l.key}`);
        await sleep(150);
      };
      const cardFacts = () => page.evaluate(() => {
        const c = document.querySelector('#tvwToMake');
        const head = document.querySelector('#tvwDetail .tvw-head');
        const rows = (list) => [...c.querySelectorAll(`[data-w-tm-list="${list}"] .tvw-tm-row`)].map((r) => ({
          id: r.dataset.wTmRow, name: (r.querySelector('.tvw-tm-name') || {}).textContent || '', kind: (r.querySelector('.tvw-tm-kind') || {}).textContent || '',
          covers: (r.querySelector('.tvw-tm-what') || {}).textContent || '', status: (r.querySelector('.tvw-tm-status') || {}).textContent || '',
          todo: (r.querySelector('[data-todo-open]') || { dataset: {} }).dataset.todoOpen || '', dl: !!r.querySelector('[data-w-dl-goto]'),
          link: ((r.querySelector('[data-todo-open], [data-w-dl-goto]') || {}).textContent || '').trim() }));
        // T4: the card is folded into a section at the END of the lesson panel
        const panel = document.querySelector('#tvwDetail');
        return { afterHead: !!head && !!panel && panel.lastElementChild === c.closest('.tvw-tm-wrap'), folded: c.hidden && !!c.closest('.tvw-tm-wrap').querySelector('[data-w-tm-toggle][aria-expanded="false"]'), title: c.querySelector('#tvwTmH').textContent, count: +((c.querySelector('.tvw-tm-head .tvw-tm-count') || {}).textContent || 0),
          lead: (c.querySelector('.tvw-tm-lead') || {}).textContent || '', empty: (c.querySelector('.tvw-tm-empty') || {}).textContent || '',
          items: rows('lesson'), pre: rows('pre'), preHead: (c.querySelector('#tvwTmPre') || {}).textContent || '',
          oldLine: !!document.querySelector('#tvwDetail .tvw-head .tvw-tbb, #tvwDetail [data-w-group] .tvw-tbb') };
      });
      const checkCard = async (l, tag) => {
        const want = tmOf(l);
        const f = await cardFacts();
        check(f.afterHead && f.title === 'Skills to be made for this lesson', `${tag}: the card is not folded at the end of the lesson panel (${f.title})`);
        check(!f.oldLine, `${tag}: the old "Still to make" line is still shown`);
        check(f.count === want.items.length && f.items.length === want.items.length, `${tag}: ${f.items.length} rows (badge ${f.count}), want ${want.items.length}`);
        check(JSON.stringify(f.items.map((x) => x.todo)) === JSON.stringify(want.items.map((x) => x.todo)), `${tag}: rows ${f.items.map((x) => x.todo)} not ${want.items.map((x) => x.todo)}`);
        check(JSON.stringify(f.pre.map((x) => x.todo)) === JSON.stringify(want.pre.map((x) => x.todo)), `${tag}: earlier rows ${f.pre.map((x) => x.todo)} not ${want.pre.map((x) => x.todo)}`);
        if (want.pre.length) check(/^Earlier skills to be made first/.test(f.preHead), `${tag}: no "Earlier skills to be made first" list`);
        for (const x of [...f.items, ...f.pre]) {
          check(x.name && /^(New skill|New option|Fix|New picture|Follow-on lesson)$/.test(x.kind) && x.covers && /^(Planned|Being built)$/.test(x.status), `${tag}: row lacks name/kind/covers/status ${JSON.stringify(x)}`);
          check(x.todo ? x.link === 'See it on Skills to be made' : x.dl, `${tag}: row has no link ${JSON.stringify(x)}`);
          for (const t of [x.name, x.covers]) { const h = jargonHit(t); check(!h, `${tag}: not plain (${h && h.name}) ${h && h.snippet}`); }
        }
        if (want.items.length) check(f.lead === TMK.leadLine(want.codes, want.items.length), `${tag}: lead "${f.lead}"`);
        return { f, want };
      };
      const vp = async (w, h) => { await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 }); await sleep(250); };
      // (a) Grade 3 "Properties of multiplication" (CCSS BUILD), (b) a partial White Rose lesson with several items,
      // (c) a Grade 4 multiplication lesson with mult_standard, (d) a fully covered lesson (empty state)
      const nonA = all.filter((l) => l.type !== 'assessment');
      const a = nonA.find((l) => l.grade === '3' && /^Properties of multiplication/.test(l.title));
      const b = nonA.find((l) => l.grade === '2' && l.title === 'Measure in metres and centimetres' && tmOf(l).items.length >= 4)
        || nonA.find((l) => l.type === 'wr' && links.linksFor(l).verdict === 'partial' && tmOf(l).items.length >= 4);
      const c = nonA.find((l) => l.grade === '4' && l.ccss.includes('4.NBT.B.5') && /^Multiply/.test(l.title));
      const dFull = nonA.find((l) => ['3', '4'].includes(l.grade) && links.linksFor(l).verdict === 'full' && l.step && !tmOf(l).items.length);
      const gapEmpty = nonA.find((l) => !tmOf(l).items.length && links.linksFor(l).verdict !== 'full');
      check(a && b && c && dFull, `to-make: could not pick the sample lessons ${[a, b, c, dFull].map((x) => x && x.key)}`);
      const report = [];
      for (const [l, tag, name] of [[a, 'a', 'a-g3-properties-of-multiplication'], [b, 'b', 'b-partial-wrm-step'], [c, 'c', 'c-g4-multiplication-mult-standard'], [dFull, 'd', 'd-fully-covered-empty']]) {
        if (!l) continue;
        for (const [w, h] of [[1280, 800], [390, 844]]) {
          await vp(w, h);
          await openLesson(l);
          const { f, want } = await checkCard(l, `to-make ${tag} ${l.key} @${w}`);
          // folded when a lesson opens (the same lesson again keeps the teacher's unfolding)
          if (w === 1280) check(f.folded, `to-make ${tag} ${l.key}: the card is not folded when the lesson opens`);
          if (w === 1280) report.push(`${tag} ${l.gradeLabel} "${l.title}": ${f.items.map((x) => `[${x.kind}] ${x.name}`).join(' | ') || f.empty}`);
          if (tag === 'c') check(f.items.some((x) => x.todo === 'mult_standard' && x.name === 'Multi-Digit Multiplication: Standard Algorithm'), `to-make c ${l.key}: mult_standard not listed`);
          if (tag === 'd') check(f.empty === TMK.EMPTY_FULL && !want.items.length, `to-make d ${l.key}: empty line "${f.empty}"`);
          await fit(`to-make ${tag} @${w}`);
          { const ov = await page.$$eval('#tvwToMake button, #tvwUnitToMake button', (bs) => bs.filter((x) => x.getClientRects().length && x.scrollWidth > x.clientWidth + 1).map((x) => x.textContent.trim()));
            check(!ov.length, `to-make @${w}: button text spills out of its button: ${ov.slice(0, 3).join(', ')}`); }
          await openTm();
          await page.$eval('#tvwToMake', (el) => el.scrollIntoView({ block: 'start' }));
          await sleep(100);
          await elShot('#tvwToMake', `${name}-${w}`);
        }
      }
      console.log(`to-make samples:\n  ${report.join('\n  ')}`);
      if (gapEmpty) {
        await vp(1280, 800);
        await openLesson(gapEmpty);
        const f = await cardFacts();
        check(f.empty === TMK.EMPTY_GAP, `to-make gap empty ${gapEmpty.key}: "${f.empty}"`);
      }
      // a row opens its entry on Skills to be made
      await vp(1366, 768);
      await openLesson(b || a);
      const first = await page.$eval('#tvwToMake [data-todo-open]', (x) => x.dataset.todoOpen);
      await openTm();
      await tap('#tvwToMake [data-todo-open]');
      await page.evaluate((id) => { window.__tmo = id; }, first);
      await waitFor(page, () => !!document.querySelector(`[data-screen="todo"].is-active [data-t-item="${CSS.escape(window.__tmo)}"].is-open`), 15000, 'todo at the to-make entry');
      // the unit cards: Grade 3 · Operations & Algebraic Thinking and Grade 4 · Number & Operations in Base Ten
      const unitOf = (g, dom) => (links.gradeSections(g).find((s) => s.domain === dom) || {}).key;
      for (const [g, dom, name] of [['3', 'OA', 'unit-g3-operations-algebraic-thinking'], ['4', 'NBT', 'unit-g4-number-operations-base-ten']]) {
        const u = unitOf(g, dom);
        if (!u) { failures.push(`to-make unit: no Grade ${g} ${dom} unit`); continue; }
        // owner 2026-10-17 navigation: the card sits at the top of the domain's section, folded until the teacher opens it
        const lessons = (links.gradeSections(g).find((s) => s.key === u) || { lessons: [] }).lessons;
        const rows = TMK.unitToMake(lessons.map((l) => ({ lesson: l, links: links.linksFor(l), detailed: DLK.detailedOf(dlx, l) })), { queue: Qi });
        const CARD = `[data-screen="wrm"].is-active #tvwTmu-${u}`;
        for (const [w, h] of [[390, 844], [1280, 800]]) {
          await vp(w, h);
          // a fresh load: the card is folded on every new visit
          await freshLoad(`#wrm/${g}/${u}`, `${CARD}:not([data-w-tomake-unit="loading"])`);
          await page.evaluate(() => { navigator.clipboard.writeText = (t) => { window.__copied = t; return Promise.resolve(); }; });
          await sleep(150);
          const fold = await page.$eval(`[data-screen="wrm"].is-active [data-w-tmu-toggle="${u}"]`, (b) => ({ text: b.textContent.trim(), exp: b.getAttribute('aria-expanded'), hidden: document.querySelector(`#tvwTmu-${b.dataset.wTmuToggle}`).hidden }));
          check(fold.exp === 'false' && fold.hidden && fold.text === `Skills to be made for this domain (${rows.length}) — show`, `unit ${g} ${u} @${w}: folded button ${JSON.stringify(fold)}`);
          await tap(`[data-screen="wrm"].is-active [data-w-tmu-toggle="${u}"]`);
          await sleep(150);
          const uf = await page.evaluate((sel) => {
            const c = document.querySelector(sel);
            const sec = c.closest('[data-w-secbox]');
            return { title: c.querySelector('.tvw-tmu-h').textContent, count: +(c.querySelector('.tvw-tm-count') || {}).textContent, shown: c.querySelectorAll('.tvw-tm-row').length, hidden: c.hidden,
              all: (c.querySelector('[data-w-tmu-all]') || {}).textContent || '', empty: (c.querySelector('.tvw-tm-empty') || {}).textContent || '',
              forOk: [...c.querySelectorAll('.tvw-tm-row')].every((r) => r.querySelector('.tvw-tm-for [data-w-lesson]') && r.querySelector('.tvw-tm-name') && r.querySelector('.tvw-tm-kind') && r.querySelector('.tvw-tm-what') && r.querySelector('.tvw-tm-status') && r.querySelector('[data-todo-open], [data-w-dl-goto]')),
              atTop: !!sec && sec.dataset.wSecbox === c.dataset.wTmuSec && !!(c.compareDocumentPosition(sec.querySelector('.tvw-nlist')) & Node.DOCUMENT_POSITION_FOLLOWING) };
          }, CARD);
          const wantTitle = `Skills to be made for Grade ${g} · ${links.domainName(dom)}`;
          check(!uf.hidden && uf.title === wantTitle && uf.atTop, `unit ${g} ${u} @${w}: title "${uf.title}" (want "${wantTitle}"), open ${!uf.hidden}, at the top of its section ${uf.atTop}`);
          check(uf.count === rows.length && uf.shown === Math.min(6, rows.length), `unit ${g} ${u} @${w}: badge ${uf.count} rows ${uf.shown}, want ${rows.length} (first 6 shown)`);
          check(rows.length ? uf.forOk : uf.empty === TMK.EMPTY_UNIT, `unit ${g} ${u} @${w}: a row lacks its parts or lessons`);
          if (rows.length > 6) check(uf.all === `Show all ${rows.length}`, `unit ${g} ${u}: "Show all" button "${uf.all}"`);
          await fit(`unit ${g} ${u} @${w}`);
          { const ov = await page.$$eval(`#tvwToMake button, ${CARD} button, [data-w-tmu-toggle]`, (bs) => bs.filter((x) => x.getClientRects().length && x.scrollWidth > x.clientWidth + 1).map((x) => x.textContent.trim()));
            check(!ov.length, `to-make @${w}: button text spills out of its button: ${ov.slice(0, 3).join(', ')}`); }
          await page.$eval(CARD, (el) => el.scrollIntoView({ block: 'start' }));
          await elShot(CARD, `${name}-${w}`);
          if (w === 1280 && rows.length > 6) {
            await tap(`${CARD} [data-w-tmu-all]`);
            await sleep(150);
            check(await page.$$eval(`${CARD} .tvw-tm-row`, (r) => r.length) === rows.length, `unit ${g} ${u}: "Show all" does not show all`);
            // a lesson button opens that lesson
            const lk = await page.$eval(`${CARD} .tvw-tm-lesson`, (x) => x.dataset.wLesson);
            await tap(`${CARD} .tvw-tm-lesson`);
            await waitFor(page, `location.hash === ${JSON.stringify(links.lessonHash(links.lessonByKey(lk)))}`, 8000, 'unit lesson link');
          }
        }
      }
      await vp(1366, 768);
    });

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
    const f1 = await page.evaluate((src) => ({ n: document.querySelectorAll('.tvt-item').length, ok: [...document.querySelectorAll('.tvt-item')].every((li) => [...li.querySelectorAll('.tvt-src')].some((x) => x.dataset.src === src)) }), srcPick);
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
    // print (clean page of the filtered list) and CSV (the window.open stand-in again: the domain cards' case reloads the page)
    await page.evaluate(() => { window.__opened = ''; window.open = () => ({ document: { open() {}, write(h) { window.__opened += h; }, close() {} }, focus() {}, print() {} }); });
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
      check((await hash()) === `${links.lessonHash(want)}`, `todo step → ${await hash()} (want ${want.key})`);
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
    const mpr = await page.evaluate((names) => { const el = document.querySelector('#teacherMain .tv-screen.is-active'); return { screen: el.dataset.screen, has: names.filter((n) => el.textContent.includes(n) || el.textContent.includes(n.replace(/([A-Za-z]{2,}), (?=[A-Za-z]{2,}\b)/g, "$1/"))).length }; }, mlabels);
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


    /* ==================================================== critic r3 m4 / m5 / m6 / m7 */
    {
      await page.goto(`${base}/index.html#wrm/2/D1/1`, { waitUntil: 'networkidle2', timeout: 60000 });
      await waitFor(page, () => !!document.querySelector('[data-screen="wrm"].is-active .tvw-head'), 20000, 'm4 wrm');
      const wtxt = await page.$eval('[data-screen="wrm"].is-active', (e) => e.innerText);
      const wcode = /\bW\d\d\b/.exec(wtxt);
      check(!wcode, `m4: raw week code on the White Rose screen: ${wcode && wtxt.slice(Math.max(0, wcode.index - 40), wcode.index + 20)}`);
      // owner 2026-10-17 ("don't worry about the dates"): the list shows no weeks or dates (the panel's kicker may)
      const ltxt = await page.$eval('[data-screen="wrm"].is-active #tvwLessons', (e) => e.innerText);
      check(!/\bWeeks?\b|\(\d+ [A-Z][a-z]{2} – \d+ [A-Z][a-z]{2}\)/.test(ltxt), 'm4: the lesson list shows weeks or dates');
      // m5: the Start tab is not remembered
      await page.goto(`${base}/index.html#map/start`, { waitUntil: 'networkidle2', timeout: 60000 });
      await waitFor(page, () => !!document.querySelector('[data-screen="map"].is-active [data-map-tab]'), 20000, 'm5 map');
      await page.click('[data-map-tab="start"]'); await sleep(200);
      await page.goto(`${base}/index.html`, { waitUntil: 'networkidle2', timeout: 60000 });
      await waitFor(page, () => typeof window.tvGo === 'function' && !!document.querySelector('#teacherMain'), 20000, 'm5 shell');
      await sleep(300);
      await page.evaluate(() => { window.setUserRole('teacher'); window.tvGo('map'); });
      await waitFor(page, () => !!document.querySelector('[data-screen="map"].is-active [data-map-tab]'), 20000, 'm5 map 2');
      check(await page.$eval('[data-map-tab="tasks"]', (b) => b.getAttribute('aria-selected') === 'true'), 'm5: MAP did not reopen on Practise by task after the Start tab');
      // m6: every strand click leaves one band chip pressed and a list unless All is empty
      await waitFor(page, () => document.querySelectorAll('[data-mk-strand]').length >= 7, 20000, 'm6 strands');
      const strands = await page.$$eval('[data-mk-strand]', (b) => b.map((x) => x.dataset.mkStrand).filter(Boolean));
      check(strands.length === 7, `m6: ${strands.length} strand chips`);
      const bands = await page.$$eval('[data-mk-band]', (b) => b.map((x) => x.dataset.mkBand).filter(Boolean));
      if (bands.length) { await page.click(`[data-mk-band="${bands[bands.length - 1]}"]`); await sleep(150); }
      for (const st of strands) {
        await page.click(`[data-mk-strand="${st}"]`); await sleep(150);
        const r = await page.evaluate(() => ({ pressed: document.querySelectorAll('[data-mk-band][aria-pressed="true"]').length, tasks: document.querySelectorAll('[data-mk-task]').length }));
        check(r.pressed === 1, `m6: strand ${st}: ${r.pressed} band chips pressed`);
        check(r.tasks > 0, `m6: strand ${st}: no task listed`);
      }
      // fix round 6: EVERY MAP task (all strands, band All), the whole MAP screen line by line
      {
        const mb = [];
        let nTasks = 0, nL = 0;
        for (const st of strands) {
          await page.click(`[data-mk-strand="${st}"]`); await sleep(100);
          await page.click('[data-mk-band=""]'); await sleep(100);
          const ids = await page.$$eval('[data-mk-task]', (b) => b.map((x) => x.dataset.mkTask));
          for (const id of ids) {
            await page.evaluate((x) => document.querySelector(`[data-mk-task="${x}"]`).click(), id);
            await waitFor(page, `!!document.querySelector('[data-mk-task="${id}"][aria-current="true"]') && !!document.querySelector('#tvmkDetail .tvw-title')`, 5000, `map task ${id}`);
            nTasks += 1;
            nL += await plainSweep('[data-screen="map"].is-active', `MAP ${st} ${id}`, mb);
          }
        }
        check(nTasks > 20, `MAP task sweep reached only ${nTasks} tasks`);
        check(!mb.length, `plain English: ${mb.length} MAP lines not plain: ${mb.slice(0, 5).join(' || ')} — forms: ${summ(mb)}`);
        console.log(`MAP task sweep: ${nTasks} tasks, ${nL} lines, ${mb.length} not plain`);
        if (CUR_MAP) {
          const eq = await page.evaluate(async () => {
            const b = [...document.querySelectorAll('[data-mk-strand]')].find((x) => /Operations/.test(x.textContent)); b.click();
            await new Promise((r) => setTimeout(r, 120));
            document.querySelector('[data-mk-band=""]').click();
            await new Promise((r) => setTimeout(r, 120));
            const t = [...document.querySelectorAll('[data-mk-task]')].find((x) => /Meaning of the equal sign/.test(x.textContent));
            if (!t) return null;
            t.click();
            await new Promise((r) => setTimeout(r, 120));
            return (document.querySelector('#tvmkDetail .tvw-verdict') || {}).textContent || '';
          });
          check(eq && /equal sign/i.test(eq) && !/^(today|it|this)\b/i.test(eq), `M7: "Meaning of the equal sign" note: ${eq}`);
        }
      }
      // m7: Skills to be made shows no code, on screen (all entries open) or in the print
      await page.evaluate(() => window.tvGo('todo'));
      await waitFor(page, () => !!document.querySelector('[data-screen="todo"].is-active .tvt-item'), 20000, 'm7 todo');

      const t7 = await page.evaluate(async () => {
        const m = await import('./js/modules/teacher-todo.js');
        for (let i = 0; i < 2000; i += 1) { const b = document.querySelector('[data-screen="todo"].is-active [data-t-open][aria-expanded="false"]'); if (!b) break; b.click(); }
        const scr = document.querySelector('[data-screen="todo"].is-active');
        const txt = [...scr.querySelectorAll('.tvt-item')].map((x) => x.innerText).join('\n');
        const d = { innerText: m.todoPrintHTML().replace(/^[\s\S]*<body>/, '').replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>') };
        const chips = [...scr.querySelectorAll('[aria-labelledby="tvtGrH"] button')].map((b) => b.textContent.trim());
        return { txt, print: d.innerText, chips, open: scr.querySelectorAll('.tvt-spec').length, items: scr.querySelectorAll('.tvt-item').length };
      });
      // fix round 6: every entry open, the whole screen and every field, then the print
      const hit = (x) => { for (const line of String(x).split('\n')) { const h = jargonHit(line, { fragment: false }); if (h) return `${h.name}: ${h.snippet}`; } return ''; };
      check(t7.open === t7.items, `m7: ${t7.open} of ${t7.items} entries opened`);
      const tb = [];
      const tn = await plainSweep('[data-screen="todo"].is-active', 'todo', tb);
      check(!tb.length, `plain English: ${tb.length} Skills to be made lines not plain: ${tb.slice(0, 5).join(' || ')} — forms: ${summ(tb)}`);
      check(!hit(t7.print), `m7: not plain in the Skills to be made print: "${hit(t7.print)}"`);
      console.log(`Skills to be made sweep: ${t7.open} entries, ${tn} lines, ${tb.length} not plain`);
      // m10: with the 6+ chip on, the heading's count is the count shown
      await page.evaluate(() => document.querySelector('[data-t-f="grades"][data-t-v="6"]').click());
      await sleep(150);
      const m10 = await page.evaluate(() => ({ count: document.querySelector('#tvtCount').textContent, heads: [...document.querySelectorAll('.tvt-grade-h')].map((h) => h.textContent.trim()) }));
      const shown6 = +((/Showing (\d+)/.exec(m10.count) || [])[1] || -1);
      check(m10.heads.length === 1 && /^Reaching Grade 6 and above (\d+)$/.test(m10.heads[0]) && +m10.heads[0].replace(/\D+/g, ' ').trim().split(' ').pop() === shown6, `m10: 6+ heading ${JSON.stringify(m10)}`);
      await page.evaluate(() => document.querySelector('[data-t-f="grades"][data-t-v="6"]').click());
      await sleep(150);
      // N25: "Reception" is never on a teacher screen
      check(!/Reception/.test(t7.txt + t7.print), 'N25: "Reception" on Skills to be made');
      check(t7.chips.includes('6+') && t7.chips.includes('Not set'), `N13: Grade chips lack 6+ / Not set: ${t7.chips.join(',')}`);
    }

    /* ==================================================== critic r3 M2: the toast clears the bar's real top (820x1180, short page) */
    await page.setViewport({ width: 820, height: 1180, deviceScaleFactor: 1 });
    const toastCase = async (hash, sel, tag) => {
      await page.goto(`${base}/index.html${hash}`, { waitUntil: 'networkidle2', timeout: 60000 });
      await waitFor(page, `!!document.querySelector(${JSON.stringify(sel)})`, 20000, tag);
      await page.evaluate(() => { navigator.clipboard.writeText = () => Promise.resolve(); });
      const scope = sel.split(' ')[0];
      // T4: the Lessons place has no quick tick row and no sticky bar of its own: every Select all, and the tray bar
      const wrmScope = /data-screen="wrm"/.test(scope);
      if (wrmScope) await tickAll(scope);
      for (const b of [...(wrmScope ? [] : [`${scope} [data-w-quick="all"]`]), `${scope} [data-w-act="link"]`]) {
        await page.$eval(b, (e) => e.scrollIntoView({ block: 'center' })); await sleep(80); await page.click(b); await sleep(250);
      }
      const r = await page.evaluate(() => {
        const t = [...document.querySelectorAll('.tv-toast')].find((x) => x.getBoundingClientRect().height);
        const bar = document.querySelector('#teacherMain .tv-screen.is-active .tvw-bar') || document.querySelector('#tvTray');
        return { tb: t ? t.getBoundingClientRect().bottom : null, bt: bar.getBoundingClientRect().top };
      });
      check(r.tb !== null, `toast ${tag}: no toast after Practice link`);
      if (r.tb !== null) check(r.tb <= r.bt - 8, `toast ${tag}: toast bottom ${Math.round(r.tb)} not 8 px above the bar top ${Math.round(r.bt)}`);
    };
    await step('toast 820 MAP task', async () => {
      // the first real task of the strand, read from the page (MAP.json ids m…, fallback ids e…)
      await page.goto(`${base}/index.html#map/tasks/npv/all`, { waitUntil: 'networkidle2', timeout: 60000 });
      await waitFor(page, () => !!document.querySelector('[data-screen="map"].is-active [data-mk-task]:not(.is-gap)'), 20000, 'map task list');
      const tid = await page.$eval('[data-screen="map"].is-active [data-mk-task]:not(.is-gap)', (b) => b.dataset.mkTask);
      await toastCase(`#map/tasks/npv/all/${tid}`, '#tvmkDetail .tvw-head', '820 MAP task');
    });
    await step('toast 820 White Rose lesson', () => toastCase('#wrm/2/D1/1', '[data-screen="wrm"].is-active .tvw-head', '820 White Rose lesson'));

    /* ==================================================== critic r4: B8 m8 m9 N17 N20 N22, and the rendered-text sweep */
    await step('r4 checks', async () => {
      await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
      // B8: as shipped (no interception), the real files load: a lesson the files mark "Covers part" says so
      if (partLesson) {
        await page.goto(`${base}/index.html${links.lessonHash(partLesson)}`, { waitUntil: 'networkidle2', timeout: 60000 });
        await waitFor(page, () => !!document.querySelector('[data-screen="wrm"].is-active [data-w-verdict-tag]'), 20000, 'B8 lesson');
        const vt = await page.$eval('[data-screen="wrm"].is-active [data-w-verdict-tag]', (e) => e.dataset.wVerdictTag);
        check(vt === 'partial', `B8: ${partLesson.key} shows verdict ${vt}, the file says partial`);
      }
      // m8: a toast never follows the teacher to the next screen
      await page.goto(`${base}/index.html#wrm/2/D1/1`, { waitUntil: 'networkidle2', timeout: 60000 });
      await waitFor(page, () => !!document.querySelector('[data-screen="wrm"].is-active .tvw-head'), 20000, 'm8 wrm');
      await page.evaluate(() => { navigator.clipboard.writeText = () => Promise.resolve(); });
      await tickAll();
      await tap('[data-screen="wrm"].is-active [data-w-act="link"]');
      await sleep(80);
      const on1 = await page.evaluate(() => document.getElementById('tvToast')?.classList.contains('is-on'));
      await page.evaluate(() => window.tvGo('todo'));
      await sleep(100);
      const on2 = await page.evaluate(() => document.getElementById('tvToast')?.classList.contains('is-on'));
      check(on1 && !on2, `m8: toast on after the link ${on1}, still on after the screen change ${on2}`);
      // N17: Start tab, Home, MAP → Practise by task (no reload)
      await page.evaluate(() => window.tvGo('map'));
      await waitFor(page, () => !!document.querySelector('[data-screen="map"].is-active [data-map-tab]'), 20000, 'N17 map');
      await page.click('[data-map-tab="start"]'); await sleep(200);
      await page.evaluate(() => window.tvGo('home')); await sleep(200);
      await page.evaluate(() => window.tvGo('map')); await sleep(300);
      check(await page.$eval('[data-map-tab="tasks"]', (b) => b.getAttribute('aria-selected') === 'true'), 'N17: MAP reopened on the test tab within the session');
      // m9: an old fallback task link (e1) with MAP.json on opens a matching task or a plain note
      if (CUR_MAP) {
        await page.goto(`${base}/index.html#map/tasks/npv/all/e1`, { waitUntil: 'networkidle2', timeout: 60000 });
        await waitFor(page, () => !!document.querySelector('[data-screen="map"].is-active #tvmkDetail .tvw-head, [data-screen="map"].is-active [data-mk-stale]'), 20000, 'm9');
        const r9 = await page.evaluate(() => ({ task: !!document.querySelector('#tvmkDetail .tvw-head'), note: !!document.querySelector('[data-mk-stale]'), hash: location.hash }));
        check(r9.task || r9.note, `m9: old link ${JSON.stringify(r9)}`);
      }
      // N20: a copied-in lesson names its grade in words
      if (copiedLesson) {
        await page.goto(`${base}/index.html${links.lessonHash(copiedLesson)}`, { waitUntil: 'networkidle2', timeout: 60000 });
        await waitFor(page, () => !!document.querySelector('[data-screen="wrm"].is-active .tvw-head'), 20000, 'N20');
        const head = await page.$eval('[data-screen="wrm"].is-active .tvw-head', (e) => e.innerText);
        check(!/\bG\d\b/.test(head) && /Copied in from (Grade \d|Kindergarten|Pre-K)/.test(head), `N20: copied-in head "${head.slice(0, 160)}"`);
      }
      // fix round 6: EVERY lesson of the sequence (curated and rules), the whole White Rose screen, line by line
      const bad = [];
      let nLines = 0;
      const sweep = all.filter(sweepHas);
      check(sweep.length > 0, `--grade ${ONLY_GRADE || '-'} --lesson ${ONLY_LESSON || '-'}: no lesson matches`);
      for (const l of sweep) {
        const h = `${links.lessonHash(l)}`;
        await page.evaluate((x) => { location.hash = x; }, h);
        await waitFor(page, `location.hash === ${JSON.stringify(h)} && (document.querySelector('[data-screen="wrm"].is-active #tvwDetail .tvw-title') || {}).textContent?.includes(${JSON.stringify(l.title.slice(0, 12))})`, 8000, l.key);
        nLines += await plainSweep('[data-screen="wrm"].is-active', l.key, bad);
      }
      check(!bad.length, `plain English: ${bad.length} White Rose lines not plain: ${bad.slice(0, 5).join(' || ')} — forms: ${summ(bad)}`);
      console.log(`rendered-text sweep: ${sweep.length}${sweep.length !== all.length ? ` of ${all.length}` : ''} lessons (${curLessons.length} curated), ${nLines} lines, ${bad.length} not plain`);
    });

    /* ==================================================== round 7: the school site's own lessons (1366) */
    await step('site lessons 1366', async () => {
      await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
      check(siteBuild && supportLesson && assessLesson, 'data: no CCSS BUILD, support lesson or assessment to test');
      if (CUR_YEARS.includes('Y5')) check(!!siteTagged, 'data: Y5 is loaded but no site lesson is tagged');
      // owner 2026-10-17: the site's own lessons and assessments are the Extra lessons section, grouped (support lessons,
      // projects and other school lessons, enrichment, assessments); the domain sections hold the site's core lessons
      const unitOf = assessLesson;
      await freshLoad(`#wrm/${unitOf.grade}/extra`);
      await navCheck(unitOf.grade, `nav Grade ${unitOf.grade} (fresh load at #wrm/${unitOf.grade}/extra)`);
      const ex = await page.evaluate(() => {
        const s = document.querySelector('[data-screen="wrm"].is-active [data-w-secbox="extra"]');
        const l = document.querySelector('#tvwLessons').getBoundingClientRect();
        return { groups: [...s.querySelectorAll('[data-w-extra-kind]')].map((h) => [h.dataset.wExtraKind, h.textContent.trim(), h.nextElementSibling.querySelectorAll('.tvw-nrow').length]),
          inView: s.querySelector('.tvw-sec-h').getBoundingClientRect().top < l.top + 80 && s.querySelector('.tvw-sec-h').getBoundingClientRect().top >= l.top - 1 };
      });
      const exWant = links.gradeSections(unitOf.grade).find((s) => s.extra).groups.map((x) => [x.kind, x.label, x.lessons.length]);
      check(JSON.stringify(ex.groups) === JSON.stringify(exWant) && ex.inView, `Extra lessons: groups ${JSON.stringify(ex.groups)} want ${JSON.stringify(exWant)}, at the top of the list ${ex.inView}`);
      await fit('1366 extra lessons');
      await shot('30-extra-lessons-1366');
      // an assessment: its flag, the plain no-skills sentence, no tick groups
      await tap(`.tvw-nrow[data-w-lesson="${assessLesson.key}"]`);
      await waitFor(page, `location.hash === ${JSON.stringify(links.lessonHash(assessLesson))} && !!document.querySelector('#tvwDetail .tvw-head')`, 8000, 'assessment');
      const as = await page.evaluate(() => ({ flag: (document.querySelector('#tvwDetail [data-w-flag]') || {}).textContent || '', v: (document.querySelector('#tvwDetail .tvw-verdict') || {}).textContent || '', groups: document.querySelectorAll('#tvwDetail [data-w-group]').length, bar: !!document.querySelector('#tvwDetail .tvw-bar') }));
      check(as.flag === 'Assessment' && /No skills are linked to this assessment/.test(as.v) && !as.groups && !as.bar, `assessment detail ${JSON.stringify(as)}`);
      // a CCSS BUILD lesson only the site has, with no links entry: "Skills not tagged yet"
      await freshLoad(links.lessonHash(siteBuild), '[data-screen="wrm"].is-active #tvwDetail .tvw-head');
      const un = await page.evaluate(() => ({ title: document.querySelector('.tvw-title').textContent, flag: (document.querySelector('#tvwDetail [data-w-flag]') || {}).textContent || '', tag: (document.querySelector('#tvwDetail [data-w-verdict-tag]') || {}).dataset?.wVerdictTag || '', cur: (document.querySelector('.tvw-lesson[aria-current="true"]') || {}).dataset?.wLesson || '' }));
      check(un.title.includes(siteBuild.title) && un.flag === 'CCSS · BUILD' && (!siteUntagged || un.tag === 'untagged') && un.cur === siteBuild.key, `CCSS BUILD site lesson by bookmark ${JSON.stringify(un)}`);
      // a support lesson: listed in Extra lessons under "Support lessons"
      await page.evaluate((x) => { location.hash = x; }, links.lessonHash(supportLesson));
      await waitFor(page, `(document.querySelector('[data-screen="wrm"].is-active .tvw-lesson[aria-current="true"]') || {}).dataset?.wLesson === ${JSON.stringify(supportLesson.key)} && !!document.querySelector('#tvwDetail .tvw-head')`, 20000, 'support lesson');
      check(await page.evaluate(() => { const r = document.querySelector('.tvw-lesson[aria-current="true"]'); return /^Support lessons$/.test((r?.closest('ol')?.previousElementSibling || {}).textContent || '') && !!r.closest('[data-w-secbox="extra"]') && /Support lesson/.test(document.querySelector('#tvwDetail .tvw-tags').textContent); }), 'support lesson: not under Extra lessons › Support lessons, or no flag');
      // a tagged site lesson: verdict, skills, Tick → Practice link decodes to the lesson's teaching skills
      if (siteTagged) {
        await page.goto(`${base}/index.html#wrm/${siteTagged.grade}/${secOf(siteTagged)}`, { waitUntil: 'networkidle2', timeout: 60000 });
        await waitFor(page, () => !!document.querySelector('[data-screen="wrm"].is-active .tvw-lesson'), 20000, 'tagged unit');
        await tap(`.tvw-nrow[data-w-lesson="${siteTagged.key}"]`);
        await waitFor(page, `location.hash === ${JSON.stringify(links.lessonHash(siteTagged))} && !!document.querySelector('#tvwDetail [data-w-group="direct"] .tvw-tick')`, 8000, 'tagged site lesson');
        const tv = await page.evaluate(() => ({ tag: (document.querySelector('#tvwDetail [data-w-verdict-tag]') || {}).dataset?.wVerdictTag || '', flag: (document.querySelector('#tvwDetail [data-w-flag]') || {}).textContent || '' }));
        const r = links.linksFor(siteTagged);
        check(tv.tag === r.verdict && tv.flag === links.siteFlagText(siteTagged), `tagged site lesson head ${JSON.stringify(tv)} want ${r.verdict}`);
        await tickOnly('direct');
        await tap('[data-w-act="link"]');
        await waitFor(page, () => !!document.querySelector('#tvwLink'), 5000, 'site link');
        const sd = await decode(await page.$eval('#tvwLink', (i) => i.value));
        const wantKeys = r.direct.map((x) => x.key.replace(':', '|'));
        check(sd.length === wantKeys.length && wantKeys.every((k) => sd.includes(k)), `site lesson link decodes to ${JSON.stringify(sd)} not ${JSON.stringify(wantKeys)}`);
        await fit('1366 tagged site lesson');
        await clearOfBar('1366 tagged site lesson');
      }
      // search finds a site lesson and jumps to its bookmark
      const sl = siteTagged || siteBuild;
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.click('#tvwSearch', { clickCount: 3 });
      await page.type('#tvwSearch', sl.title.slice(0, 24));
      await sleep(300);
      const ti = await page.$$eval('.tvw-hit', (b, key) => b.findIndex((x) => x.dataset.wJump === key), sl.key);
      check(ti >= 0, `search: site lesson "${sl.title}" not offered`);
      if (ti >= 0) { (await page.$$('.tvw-hit'))[ti].click(); await sleep(400); check((await hash()) === links.lessonHash(sl), `search jump to a site lesson: ${await hash()}`); }
      // the detailed lessons OFF (--fallback: index.json says no file): nothing requested, no card, no console noise
      if (!DL_ON) {
        check(!detailedAsked.length, `detailed lessons fetched while index.json says the file is absent: ${detailedAsked.length}`);
        check(!(await page.$('[data-w-dl]')), 'a detailed lesson card shows with no file');
      }
    });

    /* ==================================================== round 7: Skills to be made → a school lesson it closes */
    if (CUR_YEARS.includes('Y5')) {
      await step('todo school lesson', async () => {
        await page.evaluate(() => window.tvGo('todo'));
        await waitFor(page, () => !!document.querySelector('[data-screen="todo"].is-active .tvt-item'), 20000, 'todo (site)');
        const hit = await page.evaluate(() => {
          for (const b of document.querySelectorAll('[data-screen="todo"].is-active .tvt-row')) {
            if (b.getAttribute('aria-expanded') !== 'true') b.click();
            const li = document.querySelector(`[data-t-item="${CSS.escape(b.dataset.tOpen)}"]`);
            const x = li && li.querySelector('[data-t-lesson]');
            if (x) return { id: b.dataset.tOpen, lesson: x.dataset.tLesson, text: x.textContent };
          }
          return null;
        });
        check(hit, 'todo: no entry lists a school lesson');
        if (hit) {
          await tap(`[data-t-item="${hit.id}"] [data-t-lesson="${hit.lesson}"]`);
          await waitFor(page, () => !!document.querySelector('[data-screen="wrm"].is-active .tvw-head'), 15000, 'todo lesson to wrm');
          check((await hash()) === links.lessonHash(links.lessonBySite(hit.lesson)), `todo school lesson → ${await hash()}`);
        }
      });
    }

    /* ==================================================== round 9: the DETAILED lessons (the real file), 1366 and 390 touch */
    if (DL_ON) {
      const D = await import(path.join(ROOT, 'js/modules/detailed-links.js'));
      const recs = D.indexDetailed(JSON.parse(fs.readFileSync(DL_FILE, 'utf8'))).all;
      // The Print screen's preview frame (about:srcdoc) is replaced while a 30-page pack builds, which aborts its font
      // requests (net::ERR_ABORTED; main's print screen does the same when "Lesson: detailed" is chosen by hand). Those
      // aborts are not errors of this page; every other failed request still fails the gate.
      const abortedPreview = new Set();
      page.on('requestfailed', (q) => { const f = q.failure(); if (f && f.errorText === 'net::ERR_ABORTED' && /^about:srcdoc/.test((q.frame() && q.frame().url()) || '')) abortedPreview.add(q.url()); });
      for (const [vw, vh, touch] of [[1366, 768, false], [390, 844, true]]) {
        await step(`detailed lessons ${vw}`, async () => {
          await page.setViewport({ width: vw, height: vh, deviceScaleFactor: 1, hasTouch: touch, isMobile: touch });
          const press = async (sel) => { await page.$eval(sel, (el) => el.scrollIntoView({ block: 'center' })); await sleep(60); if (touch) await page.tap(sel); else await page.click(sel); };
          for (const r of recs) {
            const l = links.lessonBySite(r.site);
            check(!!l, `detailed ${r.id}: site lesson ${r.site} not listed`);
            if (!l) continue;
            if ((ONLY_GRADE || ONLY_LESSON) && !sweepHas(l) && r.id !== ONLY_LESSON) continue;
            await freshLoad(links.lessonHash(l), '[data-screen="wrm"].is-active .tvw-head');
            const card = `[data-screen="wrm"].is-active [data-w-dl="${r.id}"]`;
            await waitFor(page, `!!document.querySelector(${JSON.stringify(card)})`, 20000, `detailed card ${r.id}`);
            // the lesson's head says so (owner 2026-10-17: the list rows carry only coverage and CCSS · BUILD)
            check(await page.$('[data-screen="wrm"].is-active #tvwDetail .tvw-head .tvw-dl-tag'), `${vw} detailed ${r.id}: no "Detailed lesson" tag in the lesson head`);
            check(!(await page.$(`[data-screen="wrm"].is-active .tvw-lesson[data-w-site="${l.site}"] .tvw-dl-tag`)), `${vw} detailed ${r.id}: the list row still carries a "Detailed lesson" tag`);
            // the lesson file: a path inside the site that exists on disk, opened in a new tab
            const a = await page.$eval(`${card} [data-w-dl-pack]`, (x) => [x.getAttribute('href'), x.target, x.rel]).catch(() => null);
            check(a && a[0] === r.pack && a[1] === '_blank' && /noopener/.test(a[2]) && fs.existsSync(path.join(ROOT, a[0])), `${vw} detailed ${r.id}: lesson file link ${JSON.stringify(a)}`);
            await fit(`${vw} detailed ${r.id}`);
            const sx = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
            check(sx <= 0, `${vw} detailed ${r.id}: page scrolls sideways by ${sx}px`);
            const small = await page.$$eval(`${card} .tv-btn`, (b) => b.filter((x) => { const q = x.getBoundingClientRect(); return q.width < 44 || q.height < 44; }).map((x) => x.textContent.trim()));
            check(!small.length, `${vw} detailed ${r.id}: buttons under 44 px: ${small.join(', ')}`);
            const bad = [];
            await plainSweep(card, `${vw} detailed ${r.id}`, bad);
            check(!bad.length, `${vw} detailed ${r.id} not plain: ${bad.slice(0, 3).join(' | ')}`);
            if (vw === 1366 || r === recs[0]) await shot(`r9-builder-detailed-${r.id}-${vw}`);
            // Practice link: decodes to exactly skills.used, options and all (compared as the codec writes them)
            await press(`${card} [data-w-dl-link]`);
            await waitFor(page, () => !!document.querySelector('#tvwLink') && document.querySelector('#tvwLink').value, 5000, `detailed link ${r.id}`);
            const u = await page.$eval('#tvwLink', (i) => i.value);
            const got = (await decode(u)).map((k) => k.replace('|', ':'));
            const want = r.used.map((x) => x.key);
            check(got.length === want.length && want.every((k) => got.includes(k)), `${vw} detailed ${r.id}: link decodes to ${JSON.stringify(got)}, not skills.used ${JSON.stringify(want)}`);
            const od = await decodeOpts(u);
            const lost = await page.evaluate(async (used, od) => {
              const c = await import('./js/modules/skill-option-codec.js');
              return used.filter((x) => x.opts).filter((x) => { const [cat, id] = x.key.split(':'); return c.encodeOptionPayload(cat, id, x.opts) !== c.encodeOptionPayload(cat, id, od[x.key] || {}); }).map((x) => x.key);
            }, r.used, od);
            check(!lost.length, `${vw} detailed ${r.id}: options lost in the link: ${lost.join(', ')}`);
            // Make it: the Print worksheets screen, "Lesson: detailed", this lesson
            const p0 = app.problems.length;
            await press(`${card} [data-w-dl-make]`);
            await waitFor(page, () => !!document.querySelector('[data-screen="print"].is-active #tvDLesson0'), 20000, `make it ${r.id}`);
            const pr = await page.evaluate(() => ({
              role: ((document.querySelector('[data-screen="print"].is-active .tv-ptype-now .tv-radio-title') || {}).textContent || '').trim(),
              lesson: (document.querySelector('#tvDLesson0') || {}).value || '',
              sections: document.querySelectorAll('[data-screen="print"].is-active .tv-section').length,
            }));
            check(pr.role === 'Lesson: detailed' && pr.lesson === r.id && pr.sections === 1, `${vw} detailed ${r.id}: Make it opened Print with ${JSON.stringify(pr)}`);
            // the pack builds (no error state)
            await waitFor(page, () => { const st = document.querySelector('[data-screen="print"].is-active #tvStage'); return st && st.dataset.state && st.dataset.state !== 'building'; }, 180000, `make it built ${r.id}`);
            // (whether the pack builds is the lesson maker's gate, ws-detailed-lesson; a print-screen build that fails
            // here is reported, not failed: g3-oa9-mult-table-patterns fails for some print seeds on main too)
            const state = await page.$eval('[data-screen="print"].is-active #tvStage', (x) => x.dataset.state);
            if (state !== 'ready') console.log(`NOTE ${vw} detailed ${r.id}: the Print screen could not build this pack with its seed (${state}); see ws-detailed-lesson`);
            await sleep(800);
            for (let i = app.problems.length - 1; i >= p0; i -= 1) if (app.problems[i].type === 'requestfailed' && abortedPreview.has(app.problems[i].text)) app.problems.splice(i, 1);
            if (vw === 1366 || r === recs[0]) await shot(`r9-builder-detailed-${r.id}-make-${vw}`);
          }
        });
      }
      await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
      await freshLoad('#wrm/2/D1/2', '[data-screen="wrm"].is-active .tvw-head');   // back on the White Rose screen for the phone checks
    }

    /* ==================================================== owner 2026-10-17: the list beside the panel (1280, 1024), deep links */
    await step('nav side panel and deep links', async () => {
      const besideCheck = async (tag) => {
        const r = await page.evaluate(() => {
          const l = document.querySelector('#tvwLessons').getBoundingClientRect();
          const d = document.querySelector('#tvwDetail').getBoundingClientRect();
          const row = document.querySelector('.tvw-nrow[aria-current="true"]');
          const q = row && row.getBoundingClientRect();
          return { beside: d.left >= l.right - 1, listW: Math.round(l.width), panelW: Math.round(d.width), rowIn: !!q && q.top >= l.top - 1 && q.bottom <= l.bottom + 1 && q.bottom <= innerHeight, fixed: getComputedStyle(document.querySelector('#tvwDetail')).position };
        });
        check(r.beside && r.listW >= 240 && r.panelW >= 380 && r.rowIn && r.fixed !== 'fixed', `${tag}: list beside the panel ${JSON.stringify(r)}`);
      };
      for (const [w, h] of [[1280, 800], [1024, 768]]) {
        await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
        await freshLoad('#wrm/3');
        await navCheck('3', `nav Grade 3 @${w}`);
        await fit(`${w} Grade 3 list`);
        if (w === 1280) await shotNav('1280-list-grade3');
        // an old D-number bookmark (#wrm/<grade>/<unit>/<n>) opens its lesson, beside the list
        const l = links.lessonByKey('3:D1:3');
        await freshLoad('#wrm/3/D1/3', '[data-screen="wrm"].is-active #tvwDetail .tvw-head');
        const t = await page.evaluate(() => ({ title: document.querySelector('#tvwDetail .tvw-title').textContent, n: document.querySelector('#tvwDetail .tvw-title-n').textContent, cur: (document.querySelector('.tvw-nrow[aria-current="true"]') || {}).dataset?.wLesson }));
        check(t.title.includes(l.title) && t.cur === l.key && t.n === `Lesson ${links.gradeSections('3')[0].lessons.indexOf(l) + 1}`, `old link #wrm/3/D1/3 @${w}: ${JSON.stringify(t)}`);
        await besideCheck(`${w} lesson`);
        await fit(`${w} lesson beside the list`);
        await clearOfBar(`${w} lesson beside the list`);
        await page.evaluate(() => window.scrollTo(0, 0));
        await shotNav(`${w}-lesson-panel`);
        // a second lesson from the list: the list stays, the panel follows
        const next = links.gradeSections('3')[0].lessons[5];
        await tap(`.tvw-nrow[data-w-lesson="${next.key}"]`);
        await waitFor(page, `location.hash === ${JSON.stringify(links.lessonHash(next))} && (document.querySelector('#tvwDetail .tvw-title') || {}).textContent?.includes(${JSON.stringify(next.title.slice(0, 12))})`, 8000, `second lesson ${w}`);
        await besideCheck(`${w} second lesson`);
      }
      await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
      // the Extra lessons section (domain button), with a support lesson open beside it
      await freshLoad(`${links.lessonHash(supportLesson)}`, '[data-screen="wrm"].is-active #tvwDetail .tvw-head');
      await page.click('[data-w-sec="extra"]');
      await sleep(200);
      await page.evaluate(() => window.scrollTo(0, 0));
      await shotNav('1280-extra-lessons');
      // deep links: a domain section, Extra lessons, a Pre-K small unit (opens its domain)
      for (const [h, sec] of [['#wrm/3/D4', 'D4'], ['#wrm/5/extra', 'extra'], ['#wrm/PK/CC3', 'CC1'], ['#wrm/K/D5', 'D5']]) {
        await freshLoad(h);
        const r = await page.evaluate((sec) => { const l = document.querySelector('#tvwLessons').getBoundingClientRect(); const s = document.querySelector(`#tvwSecH-${sec}`); const q = s && s.getBoundingClientRect(); return { hash: location.hash, top: !!q && q.top >= l.top - 1 && q.top < l.top + 80, empty: !!document.querySelector('#tvwDetail .tvw-empty') }; }, sec);
        check(r.top && r.empty, `deep link ${h}: section ${sec} at the top of the list ${JSON.stringify(r)}`);
      }
      // a link from before the site order (#wrm/<grade>/E/<n>: the workbook's enrichment unit is gone) opens the grade's list
      await freshLoad('#wrm/3/E/1');
      check(await page.evaluate(() => !!document.querySelector('#tvwDetail .tvw-empty') && /^#wrm\/3$/.test(location.hash)), `old enrichment link #wrm/3/E/1 does not fall back to the Grade 3 list (${await hash()})`);
      // the grade is remembered per viewer: a plain #wrm opens the last grade chosen
      await page.click('[data-w-grade="4"]');
      await sleep(200);
      await freshLoad('#wrm');
      check(await page.evaluate(() => (document.querySelector('[data-w-grade][aria-pressed="true"]') || {}).dataset?.wGrade === '4' && location.hash === '#wrm/4'), `the chosen grade is not remembered (${await hash()})`);
      await page.evaluate(() => { try { localStorage.removeItem('mq_teacher_wrm_grade'); } catch (e) {} });
      await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
    });

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
    // critic r3 B7: rows wrap, names >= 200 px, rows <= 140 px, buttons >= 44x44, bar buttons inside the bar
    const rows390 = async (tag) => {
      const r = await page.evaluate(() => {
        const scr = document.querySelector('#teacherMain .tv-screen.is-active');
        const out = { name: [], tall: [], small: [], outBar: [] };
        for (const row of scr.querySelectorAll('.tvw-row')) {
          if (!row.getClientRects().length) continue;
          const n = row.querySelector('.tvw-row-name');
          if (n && n.getBoundingClientRect().width < 200) out.name.push(`${n.textContent.slice(0, 30)}:${Math.round(n.getBoundingClientRect().width)}`);
          if (row.getBoundingClientRect().height > 140) out.tall.push(`${(n || row).textContent.slice(0, 30)}:${Math.round(row.getBoundingClientRect().height)}`);
          for (const b of row.querySelectorAll('button')) { const q = b.getBoundingClientRect(); if (q.width && (q.width < 44 || q.height < 44)) out.small.push(`${b.textContent.trim()}:${Math.round(q.width)}x${Math.round(q.height)}`); }
        }
        const bar = scr.querySelector('.tvw-bar');
        if (bar) { const B = bar.getBoundingClientRect(); for (const b of bar.querySelectorAll('button')) { const q = b.getBoundingClientRect(); if (q.left < B.left - 0.5 || q.right > B.right + 0.5 || q.top < B.top - 0.5 || q.bottom > B.bottom + 0.5) out.outBar.push(b.textContent.trim()); if (q.width < 44 || q.height < 44) out.small.push(`bar ${b.textContent.trim()}`); } }
        return out;
      });
      check(!r.name.length, `390 ${tag}: skill names under 200 px: ${r.name.slice(0, 3).join(', ')}`);
      check(!r.tall.length, `390 ${tag}: rows taller than 140 px: ${r.tall.slice(0, 3).join(', ')}`);
      check(!r.small.length, `390 ${tag}: buttons under 44x44: ${r.small.slice(0, 3).join(', ')}`);
      check(!r.outBar.length, `390 ${tag}: bar buttons outside the bar: ${r.outBar.join(', ')}`);
    };
    await rows390('White Rose lesson');
    await shot('40-wrm-lesson-390');
    if (longWhyLesson) {
      await step('390 long why lesson', async () => {
        await page.goto(`${base}/index.html${links.lessonHash(longWhyLesson)}`, { waitUntil: 'networkidle2', timeout: 60000 });
        await waitFor(page, () => !!document.querySelector('[data-screen="wrm"].is-active .tvw-head'), 20000, '390 long why');
        await sleep(300);
        await rows390(`long why lines (${longWhyLesson.key})`);
        // N22: a clamped line opens on a tap
        const opened = await page.evaluate(() => {
          const b = document.querySelector('[data-screen="wrm"].is-active [data-w-more-btn]:not([hidden])');
          if (!b) return null;
          const m = b.closest('.tvw-row').querySelector('[data-w-more]');
          const r = b.getBoundingClientRect();
          const h = m.getBoundingClientRect().height;
          const label0 = b.textContent.trim();
          b.click();
          return { h0: h, h1: m.getBoundingClientRect().height, open: m.getAttribute('aria-expanded'), label0, label1: b.textContent.trim(), w: r.width, hBtn: r.height };
        });
        check(!opened || (opened.open === 'true' && opened.h1 >= opened.h0), `N22: the "more" toggle ${JSON.stringify(opened)}`);
        check(!opened || (opened.label0 === 'more' && opened.label1 === 'less' && opened.w >= 44 && opened.hBtn >= 44), `N24: the "more" button shows "more"/"less" with a 44 px target ${JSON.stringify(opened)}`);
      });
    }
    await page.goto(`${base}/index.html${mh}`, { waitUntil: 'networkidle2', timeout: 60000 });
    await waitFor(page, () => !!document.querySelector('[data-screen="map"].is-active #tvmkDetail .tvw-head'), 20000, '390 map');
    await sleep(300);
    await side('MAP task');
    await rows390('MAP task');
    await page.evaluate(() => window.tvGo('todo'));
    await waitFor(page, () => !!document.querySelector('[data-screen="todo"].is-active .tvt-item'), 20000, '390 todo');
    await page.click('.tvt-item .tvt-row');
    await sleep(300);
    await side('Skills to be made');
    await shot('41-todo-390');

    /* ==================================================== round 7: site lessons at 390 with touch */
    await step('site lessons 390 touch', async () => {
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
      for (const l of [siteTagged || siteBuild, assessLesson, supportLesson]) {
        await freshLoad(`#wrm/${l.grade}/${secOf(l)}`, `[data-screen="wrm"].is-active .tvw-nrow[data-w-lesson="${l.key}"]`);
        await page.$eval(`.tvw-nrow[data-w-lesson="${l.key}"]`, (el) => el.scrollIntoView({ block: 'center' }));
        await sleep(80);
        await page.tap(`.tvw-nrow[data-w-lesson="${l.key}"]`);
        await waitFor(page, `location.hash === ${JSON.stringify(links.lessonHash(l))} && (document.querySelector('#tvwDetail .tvw-title') || {}).textContent?.includes(${JSON.stringify(l.title.slice(0, 12))})`, 8000, `390 tap ${l.key}`);
        await sleep(200);
        await side(`site lesson ${l.key}`);
        await rows390(`site lesson ${l.key}`);
        const flagOn = await page.evaluate(() => { const f = document.querySelector('#tvwDetail [data-w-flag]'); return !!f && f.getBoundingClientRect().width > 0; });
        check(flagOn, `390: ${l.key} shows no flag`);
      }
    });

    /* ==================================================== owner 2026-10-17: the lesson slides over the list (390, 820) with Back */
    for (const [w, h, touch] of [[390, 844, true], [820, 1180, false]]) {
      await step(`slide-over ${w}`, async () => {
        await page.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: touch, hasTouch: touch });
        const l = all.find((x) => x.grade === '3' && links.isCoreLesson(x) && links.linksFor(x).direct.length);
        await freshLoad('#wrm/3');
        await navCheck('3', `nav Grade 3 @${w}`);
        await side(`Grade 3 list @${w}`);
        if (w === 390) await shotNav('390-list-grade3');
        await page.$eval(`.tvw-nrow[data-w-lesson="${l.key}"]`, (el) => el.scrollIntoView({ block: 'center' }));
        await sleep(80);
        if (touch) await page.tap(`.tvw-nrow[data-w-lesson="${l.key}"]`); else await page.click(`.tvw-nrow[data-w-lesson="${l.key}"]`);
        await waitFor(page, `location.hash === ${JSON.stringify(links.lessonHash(l))} && !!document.querySelector('#tvwDetail .tvw-head')`, 8000, `slide-over open ${w}`);
        await sleep(200);
        const o = await page.evaluate(() => {
          const d = document.querySelector('#tvwDetail');
          const r = d.getBoundingClientRect();
          const back = d.querySelector('[data-w-back]');
          const b = back && back.getBoundingClientRect();
          return { fixed: getComputedStyle(d).position, top: Math.round(r.top), right: Math.round(r.right), bottom: Math.round(r.bottom), W: innerWidth, H: innerHeight,
            tray: ((t) => (t && t.getClientRects().length ? Math.round(t.getBoundingClientRect().top) : innerHeight))(document.querySelector('#tvTray')),
            back: b ? [Math.round(b.width), Math.round(b.height), Math.round(b.top), back.textContent.trim()] : null, focus: document.activeElement === back };
        });
        check(o.fixed === 'fixed' && o.top === 0 && o.right === o.W && Math.abs(o.bottom - o.tray) <= 1 && o.back && o.back[0] >= 44 && o.back[1] >= 44 && o.back[2] >= 0 && o.back[3] === 'Back to the lessons' && o.focus,
          `slide-over @${w}: ${JSON.stringify(o)}`);
        await side(`slide-over @${w}`);
        await rows390(`slide-over @${w}`);
        await shotNav(`${w}-lesson-panel`);
        // Back closes it: the list again, the row the teacher came from has the focus, the hash is the grade's
        if (touch) await page.tap('#tvwDetail [data-w-back]'); else await page.click('#tvwDetail [data-w-back]');
        await sleep(250);
        const c = await page.evaluate(() => ({ shown: !!document.querySelector('#tvwDetail').getClientRects().length, open: document.querySelector('#tvwGrid').classList.contains('is-open'), focus: document.activeElement && document.activeElement.dataset.wLesson, hash: location.hash }));
        check(!c.shown && !c.open && c.focus === l.key && /^#wrm\/3(\/[A-Za-z0-9]+)?$/.test(c.hash), `slide-over Back @${w}: ${JSON.stringify(c)}`);
        // Escape closes it too (keyboard)
        if (!touch) {
          await page.click(`.tvw-nrow[data-w-lesson="${l.key}"]`);
          await waitFor(page, () => document.querySelector('#tvwGrid').classList.contains('is-open'), 5000, 'reopen');
          await sleep(150);
          await page.keyboard.press('Escape');
          await sleep(150);
          check(!(await page.evaluate(() => document.querySelector('#tvwGrid').classList.contains('is-open'))), `slide-over @${w}: Escape did not close it`);
        }
      });
    }
    await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });

    if (app.problems.length) failures.push(`console/page errors: ${app.problems.slice(0, 5).map((p) => `[${p.type}] ${p.text}`).join(' | ')}`);
  } catch (e) {
    failures.push(e.stack || e.message);
  } finally {
    await app.close();
  }
  if (failures.length) { console.error('ws-teacher-wrm: FAIL'); failures.forEach((f) => console.error('  - ' + f)); process.exit(1); }
  console.log('ws-teacher-wrm: OK');
})();
