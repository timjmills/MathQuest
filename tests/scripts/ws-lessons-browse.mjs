#!/usr/bin/env node
// ws-lessons-browse — the lessons BROWSER gate (signed card design/cards/lessons-browser, Checks + 0 + 0b). Browser.
//
//   node tests/scripts/ws-lessons-browse.mjs [--shots] [--widths 1366,1024] [--only RULE,RULE]
//     --shots   writes design/status/lf-checks/lessons-browser/build/<view>-<width>.png (a-list, b-thumbs, c-only,
//               d-skills, e-open, f-unit), the mock's names
//   MQ_ROOT=<tree>  check another tree (ws-backtest commit-pair rows; the check is always this script)
//
// Rules (each prints its own line; the last line is `ws-lessons-browse: OK` / `FAIL (n)`):
//   LESSON-DOMAIN   every grade, List view, all areas: every row of the grade (assessments left out) exactly once, under
//                   the area heading of its data area (wrm-links lessonArea), under its SCHOOL grade (R3); the grade x area
//                   counts and the area chips' counts equal the data; the grade chips are All + the grades the lessons
//                   carry (no chip with no lesson); no "Extra lessons" section; every row with type !== 'wr' carries the
//                   CCSS Build chip and no WRM row does; exactly one coverage chip per row (Full / Covers part / To build)
//   AREA-LABELS     every area chip and heading on the Lessons screen and the Skills screen reads AREA_LABELS; no other
//                   teacher-*.js file spells an area label
//   FILTER-PASSED   with "Only 8/10 ✓" on (all grades, all areas) the rows equal the LESSONS_PASSED ids that map to a row;
//                   per grade x area the counts equal the registry entries in it; the switch survives grade and area changes
//                   and a reload; the empty state names the pending lessons; the Skills screen's switch shows exactly the
//                   REDESIGN_PASSED skills of the grades chosen
//   LESSON-BROWSE   thumbnails = list rows (ids and order); load draws no preview outside the viewport (rendered <= visible
//                   + one row); open then "← All lessons" restores grade, area, switch, view and scrollTop (±2 px); the
//                   hash round trip; By unit / date: the rows under each unit equal that unit's filtered lessons, the Now
//                   unit is the one the dates choose for the pinned date 2026-11-20 and is in the viewport after open,
//                   the other units start collapsed
//   SCREEN          no sideways scroll at each width; every browser control and row >= 48 px tall; console clean
import { createRequire } from 'node:module';
import { readFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = process.env.MQ_ROOT ? resolve(process.env.MQ_ROOT) : resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const has = (f) => process.argv.includes(f);
const argOf = (f, d) => { const i = process.argv.indexOf(f); return i > -1 ? process.argv[i + 1] : d; };
const SHOTS = has('--shots');
const WIDTHS = String(argOf('--widths', '1366,1024')).split(',').map(Number).filter(Boolean);
const ONLY = String(argOf('--only', '')).split(',').filter(Boolean);
const want = (r) => !ONLY.length || ONLY.includes(r);
const TODAY = '2026-11-20';
const OUT = join(ROOT, 'design/status/lf-checks/lessons-browser/build');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fails = {};
const check = (rule, ok, msg) => { if (!ok) (fails[rule] = fails[rule] || []).push(msg); };
const RULES = ['LESSON-DOMAIN', 'AREA-LABELS', 'FILTER-PASSED', 'LESSON-BROWSE', 'SCREEN'];

if (!existsSync(join(ROOT, 'js/modules/lessons-passed.js')) || !existsSync(join(ROOT, 'js/modules/grade-of.js'))) {
    for (const r of RULES.filter(want)) console.log(`  ${r}: FAIL (no lessons browser: js/modules/lessons-passed.js / grade-of.js missing)`);
    console.log('ws-lessons-browse: FAIL (no lessons browser)');
    process.exit(1);
}

/* ---- the data, node side (the same functions the screen calls) */
globalThis.localStorage = globalThis.localStorage || { getItem: () => null, setItem() {}, removeItem() {} };
const imp = (p) => import(pathToFileURL(join(ROOT, p)).href);
const L = await imp('js/modules/wrm-links.js');
const TA = await imp('js/modules/teacher-areas.js');
const { SKILLS } = await imp('js/modules/data.js');
const { indexDetailed } = await imp('js/modules/detailed-links.js');
const { LESSONS_PASSED, PENDING_RECHECK } = await imp('js/modules/lessons-passed.js');
const { gradeWord } = await imp('js/modules/grade-of.js');
const { REDESIGN_PASSED } = await imp('js/modules/redesign-passed.js');
L.setAreaFns(TA);
const LINKS = join(ROOT, 'data/curriculum/links');
const idx = JSON.parse(readFileSync(join(LINKS, 'index.json'), 'utf8'));
for (const y of idx.years || []) L.addCuratedYear(JSON.parse(readFileSync(join(LINKS, `${y}.json`), 'utf8')));
// live = the screen's own liveKey (teacher-skillpick.js: a skill in the teacher catalogue), read from the page below
let LIVE = null;
const live = (k) => (LIVE ? LIVE.has(String(k)) : false);
const detailedData = JSON.parse(readFileSync(join(ROOT, 'data/curriculum/detailed-lessons.json'), 'utf8'));
const detailed = indexDetailed(detailedData);
const GRADES = L.browseGrades();
let ROWS = {};
let ALL_ROWS = [];
const PACING = JSON.parse(readFileSync(join(ROOT, 'data/curriculum/pacing/2026-27.json'), 'utf8'));
const today = new Date(`${TODAY}T12:00:00`);

/* ---- AREA-LABELS, source side: no other teacher-*.js spells an area label */
if (want('AREA-LABELS')) {
    const labels = Object.values(TA.AREA_LABELS);
    // the teacher screens that draw areas (they import teacher-areas.js); a MAP strand that happens to share a word with an
    // area (teacher-map.js "Geometry") is not an area label
    for (const f of readdirSync(join(ROOT, 'js/modules')).filter((x) => /^teacher-.*\.js$/.test(x) && x !== 'teacher-areas.js')) {
        const src = readFileSync(join(ROOT, 'js/modules', f), 'utf8');
        if (!/from '\.\/teacher-areas\.js'/.test(src)) continue;
        for (const t of labels) for (const q of ["'", '"', '`']) if (src.includes(`${q}${t}${q}`)) check('AREA-LABELS', false, `${f} spells the area label "${t}" (read it from AREA_LABELS)`);
    }
}

/* ---- the browser */
const { open, waitFor } = require(join(dirname(fileURLToPath(import.meta.url)), '../lib/ws-harness.cjs'));
const app = await open({ seed: 7, viewport: { width: WIDTHS[0] || 1366, height: 768, deviceScaleFactor: 1 } });
const { page, problems } = app;
LIVE = new Set(await page.evaluate(() => import(new URL('js/modules/teacher-ui.js', location.href).href).then((m) => m.skillCatalogue().map((s) => `${s.categoryId}:${s.skillId}`))));
ROWS = Object.fromEntries(GRADES.map((g) => [g, L.browseRows(g, { live, detailed })]));
ALL_ROWS = GRADES.flatMap((g) => ROWS[g]);
const W = { };
const go = async (h) => {
    await page.evaluate((h) => { location.hash = h; }, h);
    await sleep(250);
    await waitFor(page, () => !!document.querySelector('[data-screen="wrm"].is-active #tvwLessons') && !document.querySelector('[data-screen="wrm"].is-active .tv-cap')?.textContent.startsWith('Loading'), 20000, `wrm at ${h}`);
    await sleep(150);
};
const click = async (sel) => {
    await page.$eval(sel, (el) => el.scrollIntoView({ block: 'center' }));
    await sleep(40);
    await page.$eval(sel, (el) => el.click());
    await sleep(250);
};
const state = () => page.evaluate(() => ({
    hash: location.hash,
    grade: (document.querySelector('[data-w-grade][aria-pressed="true"]') || {}).dataset?.wGrade || '',
    area: (document.querySelector('.tvw-areabtn[aria-pressed="true"]') || {}).dataset?.wArea ?? null,
    only: document.querySelector('[data-w-only]')?.getAttribute('aria-pressed') === 'true',
    view: (document.querySelector('.tvw-viewseg [aria-pressed="true"]') || {}).dataset?.wView || '',
    y: Math.round(window.scrollY),
}));
const domRows = () => page.evaluate(() => [...document.querySelectorAll('#tvwLessons [data-w-lesson].tvw-nrow, #tvwLessons .tvw-lcard [data-w-lesson]')].map((b) => {
    const sec = b.closest('[data-w-secbox]');
    return { key: b.dataset.wLesson, area: sec ? sec.dataset.wSecbox : '', grade: sec ? sec.dataset.wSecGrade : '', chips: [...(b.closest('li').querySelectorAll('[data-w-chip]'))].map((c) => c.dataset.wChip), pass: b.dataset.wPass || '', domain: b.dataset.wArea };
}));
const shot = async (name, w) => { if (SHOTS) { mkdirSync(OUT, { recursive: true }); await page.screenshot({ path: join(OUT, `${name}-${w}.png`) }); } };
const screenOk = async (tag) => {
    const r = await page.evaluate(() => {
        const sx = document.documentElement.scrollWidth - innerWidth;
        const small = [...document.querySelectorAll('[data-screen="wrm"].is-active .tvw-bfilters button, [data-screen="wrm"].is-active .tvw-brow, [data-screen="wrm"].is-active .tvw-unit-h, [data-screen="wrm"].is-active .tvw-lcard-t, [data-screen="wrm"].is-active .tvw-back, [data-screen="skills"].is-active .ts-areas button, [data-screen="skills"].is-active .ts-only')]
            .filter((b) => b.getClientRects().length && b.getBoundingClientRect().height < 47.5).map((b) => `${b.className.split(' ')[0]}:${(b.textContent || '').trim().slice(0, 20)}(${Math.round(b.getBoundingClientRect().height)})`);
        return { sx, small: small.slice(0, 6), n: small.length };
    });
    check('SCREEN', r.sx <= 0, `${tag}: the page scrolls sideways by ${r.sx}px`);
    check('SCREEN', !r.n, `${tag}: ${r.n} controls under 48 px: ${r.small.join(', ')}`);
};

try {
    await page.evaluate((d) => {
        window.__MQ_TODAY__ = d;
        try { localStorage.removeItem('mq_teacher_lessons_browse'); localStorage.removeItem('mq_teacher_wrm_last'); } catch (e) { /* */ }
        window.setUserRole('teacher');
    }, TODAY);
    await sleep(200);
    await page.evaluate(() => window.tvGo('wrm'));
    await go('#wrm/3');

    for (const w of WIDTHS) {
        await page.setViewport({ width: w, height: 768, deviceScaleFactor: 1 });
        await go('#wrm/3');
        W[w] = true;
        /* ---------------- LESSON-DOMAIN (every grade, once, at the first width) */
        if (w === WIDTHS[0] && want('LESSON-DOMAIN')) {
            const chips = await page.$$eval('.tvw-gradebtn', (b) => b.map((x) => [x.dataset.wGrade, x.textContent.trim()]));
            check('LESSON-DOMAIN', JSON.stringify(chips) === JSON.stringify([['all', 'All'], ...GRADES.map((g) => [g, gradeWord(g)])]), `grade chips ${JSON.stringify(chips)}`);
            for (const g of GRADES) {
                await go(`#wrm/${g}`);
                const rows = await domRows();
                const want = ROWS[g];
                check('LESSON-DOMAIN', rows.length === want.length && new Set(rows.map((r) => r.key)).size === rows.length, `grade ${g}: ${rows.length} rows shown, ${want.length} lessons (each once)`);
                const byKey = new Map(want.map((r) => [r.key, r]));
                for (const r of rows) {
                    const d = byKey.get(r.key);
                    if (!d) { check('LESSON-DOMAIN', false, `grade ${g}: row ${r.key} is not a lesson of the grade`); continue; }
                    check('LESSON-DOMAIN', r.area === d.area && r.domain === d.area, `grade ${g}: ${r.key} under ${r.area}, its area is ${d.area}`);
                    check('LESSON-DOMAIN', r.grade === g && d.grade === g && d.lesson.grade === g, `grade ${g}: ${r.key} shows under grade ${r.grade}, the school lists it in ${d.lesson.grade}`);
                    const cover = r.chips.filter((c) => ['full', 'part', 'build'].includes(c));
                    check('LESSON-DOMAIN', cover.length === 1 && cover[0] === d.cover, `grade ${g}: ${r.key} coverage chips ${cover.join('+') || 'none'}, want ${d.cover}`);
                    check('LESSON-DOMAIN', r.chips.includes('ccss') === (d.lesson.type !== 'wr'), `grade ${g}: ${r.key} (type ${d.lesson.type}) CCSS Build chip ${r.chips.includes('ccss') ? 'shown' : 'missing'}`);
                }
                const counts = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('.tvw-areabtn[data-domain]')].map((b) => [b.dataset.domain, +b.querySelector('.tvw-n').textContent])));
                const exp = {};
                for (const r of want) exp[r.area] = (exp[r.area] || 0) + 1;
                check('LESSON-DOMAIN', JSON.stringify(TA.AREA_ORDER.filter((a) => exp[a]).map((a) => [a, exp[a]])) === JSON.stringify(Object.entries(counts)), `grade ${g}: area chips ${JSON.stringify(counts)} want ${JSON.stringify(exp)}`);
                const extra = await page.evaluate(() => !!document.querySelector('#tvwLessons [data-w-secbox="extra"]') || /Extra lessons/.test(document.querySelector('#tvwLessons').textContent));
                check('LESSON-DOMAIN', !extra, `grade ${g}: an "Extra lessons" section is still shown`);
            }
            // All grades: a grade heading per grade, then its areas
            await go('#wrm/all');
            const all = await domRows();
            const heads = await page.$$eval('#tvwLessons .tvw-grade-h', (h) => h.map((x) => x.dataset.grade));
            check('LESSON-DOMAIN', all.length === ALL_ROWS.length, `All grades: ${all.length} rows, ${ALL_ROWS.length} lessons`);
            check('LESSON-DOMAIN', heads.join() === GRADES.join(), `All grades: grade headings ${heads.join()} want ${GRADES.join()}`);
        }

        /* ---------------- AREA-LABELS (DOM) */
        if (want('AREA-LABELS')) {
            await go('#wrm/3');
            const bad = await page.evaluate((labels) => [...document.querySelectorAll('.tvw-areabtn[data-domain]')].map((b) => [b.dataset.domain, b.querySelector('.tvw-area-l').textContent])
                .concat([...document.querySelectorAll('#tvwLessons .tvw-asec')].map((s) => [s.dataset.wSecbox, s.querySelector('.tvw-sec-t').textContent]))
                .filter(([a, t]) => labels[a] !== t), TA.AREA_LABELS);
            check('AREA-LABELS', !bad.length, `@${w} Lessons: chips / headings not from AREA_LABELS: ${JSON.stringify(bad.slice(0, 4))}`);
        }

        /* ---------------- the list at grade 3: shots a, screen */
        await go('#wrm/3');
        await shot('a-list-top', w);
        await page.evaluate(() => document.querySelector('#tvwSum').scrollIntoView({ block: 'start' }));
        await shot('a-list', w);
        await screenOk(`@${w} list`);

        /* ---------------- LESSON-BROWSE: thumbnails = list, lazy previews */
        if (want('LESSON-BROWSE')) {
            const listKeys = (await domRows()).map((r) => r.key);
            await go('#wrm/3?view=thumbs');
            await page.evaluate(() => window.scrollTo(0, 0));
            await sleep(700);
            const lazy = await page.evaluate(() => {
                const cards = [...document.querySelectorAll('#tvwLessons .tvw-lcard')];
                const rowH = cards.length ? cards[0].getBoundingClientRect().height + 16 : 0;
                const near = cards.filter((c) => c.getBoundingClientRect().top < innerHeight + rowH).length;
                const drawn = document.querySelectorAll('#tvwLessons [data-w-thumb][data-w-done]').length;
                return { cards: cards.length, near, drawn };
            });
            const thumbKeys = (await domRows()).map((r) => r.key);
            check('LESSON-BROWSE', JSON.stringify(thumbKeys) === JSON.stringify(listKeys), `@${w} thumbnails (${thumbKeys.length}) are not the list rows (${listKeys.length}) in order`);
            check('LESSON-BROWSE', lazy.drawn <= lazy.near && lazy.cards > lazy.near, `@${w} previews drawn on load ${lazy.drawn}, cards near the viewport ${lazy.near} of ${lazy.cards}`);
            // scrolled to the cards, the ones on screen are drawn
            await page.evaluate(() => document.querySelector('#tvwLessons .tvw-lcard')?.scrollIntoView({ block: 'start' }));
            await sleep(900);
            const drawnNow = await page.evaluate(() => document.querySelectorAll('#tvwLessons [data-w-thumb][data-w-done] .tvp-frame').length);
            check('LESSON-BROWSE', drawnNow > 0, `@${w} no preview drawn when the cards are on screen`);
            await shot('b-thumbs', w);
            await screenOk(`@${w} thumbs`);
            // open then "← All lessons" (thumbnails, an area, scrolled)
            for (const [h, tag] of [['#wrm/3?a=NBT&view=thumbs', 'thumbs'], ['#wrm/3?a=OA', 'list']]) {
                await go(h);
                await page.evaluate(() => window.scrollTo(0, Math.min(600, document.documentElement.scrollHeight - innerHeight)));
                await sleep(300);
                const before = await state();
                const target = await page.evaluate(() => {
                    const b = [...document.querySelectorAll('#tvwLessons [data-w-lesson]')].find((x) => { const r = x.getBoundingClientRect(); return r.top > 60 && r.bottom < innerHeight - 60; });
                    return b ? b.dataset.wLesson : '';
                });
                check('LESSON-BROWSE', !!target, `@${w} ${tag}: no lesson on screen to open`);
                if (!target) continue;
                await page.$eval(`#tvwLessons [data-w-lesson="${target}"]`, (b) => b.click());
                await sleep(500);
                const opened = await page.evaluate(() => ({ open: document.querySelector('#tvwGrid').classList.contains('is-open'), listShown: !!document.querySelector('#tvwLessons').getClientRects().length, back: !!document.querySelector('#tvwDetail [data-w-back]')?.getClientRects().length, backText: (document.querySelector('#tvwDetail [data-w-back]') || {}).textContent || '' }));
                check('LESSON-BROWSE', opened.open && !opened.listShown && opened.back && /All lessons/.test(opened.backText), `@${w} ${tag}: the lesson did not open over the list with "← All lessons" ${JSON.stringify(opened)}`);
                if (tag === 'list' && w === WIDTHS[0]) {
                    // the opened lesson's header card: chips (+ the mark when it passed)
                    const hc = await page.evaluate(() => !!document.querySelector('#tvwDetail .tvw-bhead [data-w-chip]'));
                    check('LESSON-BROWSE', hc, `@${w}: the opened lesson's header card has no status chips`);
                }
                await page.$eval('#tvwDetail [data-w-back]', (b) => b.click());
                await sleep(500);
                const after = await state();
                check('LESSON-BROWSE', after.grade === before.grade && after.area === before.area && after.only === before.only && after.view === before.view && Math.abs(after.y - before.y) <= 2 && after.hash === before.hash,
                    `@${w} ${tag}: "← All lessons" came back to ${JSON.stringify(after)} not ${JSON.stringify(before)}`);
            }
            // the hash round trip: a fresh load at a browser link
            await page.goto('about:blank');
            await page.evaluateOnNewDocument((d) => { window.__MQ_TODAY__ = d; }, TODAY);
            await page.goto(`${app.base}/index.html#wrm/3?a=OA&only=1&view=thumbs`, { waitUntil: 'networkidle2', timeout: 60000 });
            await waitFor(page, () => typeof window.setUserRole === 'function' && typeof window.tvGo === 'function', 30000, 'fresh boot');
            await page.evaluate(() => window.setUserRole('teacher'));
            await waitFor(page, () => !!document.querySelector('[data-screen="wrm"].is-active #tvwLessons [data-w-lesson], [data-screen="wrm"].is-active [data-w-empty]'), 20000, 'fresh load');
            await sleep(300);
            const fresh = await state();
            check('LESSON-BROWSE', fresh.grade === '3' && fresh.area === 'OA' && fresh.only && fresh.view === 'thumbs', `@${w} a fresh load of #wrm/3?a=OA&only=1&view=thumbs shows ${JSON.stringify(fresh)}`);
            // back to defaults for the next checks
            await page.evaluate(() => { try { localStorage.removeItem('mq_teacher_lessons_browse'); } catch (e) { /* */ } });
            await go('#wrm/3?only=0&view=list');

            /* By unit / date */
            await go('#wrm/3?view=unit');
            await page.evaluate(() => window.scrollTo(0, 0));
            await page.$eval('.tvw-viewseg [data-w-view="list"]', (b) => b.click());
            await sleep(200);
            await page.$eval('.tvw-viewseg [data-w-view="unit"]', (b) => b.click());
            await sleep(500);
            const units = await page.evaluate(() => [...document.querySelectorAll('#tvwLessons .tvw-unit')].map((u) => ({ unit: u.dataset.wUnit, now: u.classList.contains('is-now'), open: !u.querySelector('.tvw-nlist').hidden, rows: [...u.querySelectorAll('[data-w-lesson]')].map((b) => b.dataset.wLesson), top: Math.round(u.getBoundingClientRect().top), bottom: Math.round(u.querySelector('.tvw-unit-h').getBoundingClientRect().bottom) })));
            const wantU = L.unitGroups('3', ROWS['3'], PACING, today).filter((u) => u.rows.length);
            check('LESSON-BROWSE', JSON.stringify(units.map((u) => u.unit)) === JSON.stringify(wantU.map((u) => u.unit)), `@${w} units ${units.map((u) => u.unit)} want ${wantU.map((u) => u.unit)} (teaching order)`);
            for (const u of wantU) {
                const d = units.find((x) => x.unit === u.unit);
                if (!d) continue;
                check('LESSON-BROWSE', JSON.stringify(d.rows) === JSON.stringify(u.rows.map((r) => r.key)), `@${w} unit ${u.unit}: rows are not the unit's lessons`);
                check('LESSON-BROWSE', d.now === u.now && d.open === u.now, `@${w} unit ${u.unit}: now ${d.now} open ${d.open}, want now ${u.now} (only the current unit open)`);
            }
            const nowU = units.find((u) => u.now);
            check('LESSON-BROWSE', nowU && nowU.unit === 'D3', `@${w} the Now unit on ${TODAY} is ${nowU && nowU.unit}, want D3 (Fractions, 1 Nov - 26 Nov)`);
            check('LESSON-BROWSE', nowU && nowU.top >= -2 && nowU.bottom <= 768, `@${w} the Now unit is not in the viewport after open (${nowU && nowU.top}..${nowU && nowU.bottom})`);
            await shot('f-unit', w);
            await screenOk(`@${w} unit`);
            // a unit opens on a click; filters apply inside units
            const closed = units.find((u) => !u.open);
            if (closed) {
                await click(`.tvw-unit[data-w-unit="${closed.unit}"] .tvw-unit-h`);
                const nowOpen = await page.$eval(`.tvw-unit[data-w-unit="${closed.unit}"] .tvw-nlist`, (o) => !o.hidden);
                check('LESSON-BROWSE', nowOpen, `@${w} unit ${closed.unit} did not open on a click`);
            }
            await go('#wrm/3?a=NF&view=unit');
            const nfUnits = await page.$$eval('#tvwLessons .tvw-unit', (u) => u.map((x) => x.dataset.wUnit));
            const wantNf = L.unitGroups('3', ROWS['3'].filter((r) => r.area === 'NF'), PACING, today).filter((u) => u.rows.length).map((u) => u.unit);
            check('LESSON-BROWSE', JSON.stringify(nfUnits) === JSON.stringify(wantNf), `@${w} the area filter inside units: ${nfUnits} want ${wantNf}`);
            await go('#wrm/3?view=list');
        }

        /* ---------------- FILTER-PASSED */
        if (want('FILTER-PASSED')) {
            await go('#wrm/all');
            await click('[data-w-only]');
            const rows = await domRows();
            const wantKeys = ALL_ROWS.filter((r) => r.pass).map((r) => r.key);
            check('FILTER-PASSED', JSON.stringify(rows.map((r) => r.key).sort()) === JSON.stringify(wantKeys.slice().sort()), `@${w} Only 8/10 (all grades): rows ${rows.map((r) => r.key)} want ${wantKeys}`);
            const mapped = new Set(ALL_ROWS.filter((r) => r.pass).map((r) => r.pass));
            check('FILTER-PASSED', [...LESSONS_PASSED.keys()].every((id) => mapped.has(id)), `@${w} a LESSONS_PASSED id maps to no row: ${[...LESSONS_PASSED.keys()].filter((id) => !mapped.has(id))}`);
            check('FILTER-PASSED', rows.every((r) => r.chips.includes('pass') && r.pass), `@${w} a row shown with the switch on has no ✓ 8/10 chip`);
            const marks = await page.$$eval('#tvwLessons .tvw-brow .ts-pass', (m) => m.length);
            check('FILTER-PASSED', marks === rows.length, `@${w} ${marks} corner marks for ${rows.length} passed rows`);
            for (const g of GRADES) {
                await click(`.tvw-gradebtn[data-w-grade="${g}"]`);
                const st = await state();
                check('FILTER-PASSED', st.only, `@${w} the switch went off on grade ${g}`);
                const r = await domRows();
                for (const a of TA.AREA_ORDER) {
                    const n = r.filter((x) => x.area === a).length;
                    const e = ROWS[g].filter((x) => x.area === a && x.pass).length;
                    check('FILTER-PASSED', n === e, `@${w} grade ${g} x ${a}: ${n} rows with the switch on, the registry has ${e}`);
                }
                if (!r.length) {
                    const empty = await page.evaluate(() => (document.querySelector('[data-w-empty="only"]') || {}).textContent || '');
                    check('FILTER-PASSED', /No lesson here has passed 8\/10 yet/.test(empty), `@${w} grade ${g}: no empty state with the switch on`);
                    if (g === '2') {
                        const t = (detailedData.lessons.find((x) => x.id === 'g2-nbt3-read-write-1000') || {}).title || '';
                        check('FILTER-PASSED', !t || empty.includes(t) || PENDING_RECHECK.size === 0, `@${w} the empty state does not name the pending lessons ("${t}")`);
                        if (w === WIDTHS[0]) await shot('c-only-empty', w);
                    }
                }
            }
            await click('.tvw-gradebtn[data-w-grade="3"]');
            await click('.tvw-areabtn[data-w-area="OA"]');
            check('FILTER-PASSED', (await state()).only, `@${w} the switch went off on an area change`);
            await click('.tvw-areabtn[data-w-area=""]');
            await page.evaluate(() => document.querySelector('#tvwSum').scrollIntoView({ block: 'start' }));
            await shot('c-only', w);
            // per viewer: kept across a reload of the screen
            const kept = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('mq_teacher_lessons_browse') || '{}').only === true; } catch (e) { return false; } });
            check('FILTER-PASSED', kept, `@${w} the switch is not kept for the viewer`);
            // the opened passed lesson: header card with the mark (e-open)
            const pk = ROWS['3'].find((r) => r.pass);
            if (pk) {
                await page.$eval(`#tvwLessons [data-w-lesson="${pk.key}"]`, (b) => b.click());
                await sleep(500);
                const hd = await page.evaluate(() => ({ mark: !!document.querySelector('#tvwDetail .tvw-head .ts-pass'), chip: !!document.querySelector('#tvwDetail .tvw-head [data-w-chip="pass"]'), line: (document.querySelector('#tvwDetail [data-w-passline]') || {}).textContent || '' }));
                check('FILTER-PASSED', hd.mark && hd.chip && /passed the 8\/10 quality check/.test(hd.line), `@${w} the opened passed lesson's header card: ${JSON.stringify(hd)}`);
                await page.evaluate(() => window.scrollTo(0, 0));
                await shot('e-open', w);
                await screenOk(`@${w} open`);
                await page.$eval('#tvwDetail [data-w-back]', (b) => b.click());
                await sleep(300);
            }
            await click('[data-w-only]');
            check('FILTER-PASSED', !(await state()).only, `@${w} the switch did not turn off`);

            /* the Skills screen: generated grades, area chips, Only 8/10 ✓ */
            await page.evaluate(() => window.tvGo('skills'));
            await waitFor(page, () => !!document.querySelector('[data-screen="skills"].is-active #tsOnly button'), 20000, 'skills screen');
            await page.evaluate(() => { const b = document.querySelector('#tsBrowse [data-arg="area"]'); if (b && b.getAttribute('aria-pressed') !== 'true') b.click(); });
            await sleep(300);
            const allBtn = await page.$('#tsGrades [data-arg="ALL"]');
            if (allBtn && (await allBtn.evaluate((b) => b.getAttribute('aria-pressed'))) !== 'true') { await allBtn.evaluate((b) => b.click()); await sleep(300); }
            const onAlready = await page.$eval('#tsOnly button', (b) => b.getAttribute('aria-pressed') === 'true');
            if (!onAlready) { await page.$eval('#tsOnly button', (b) => b.click()); await sleep(500); }
            for (let i = 0; i < 6; i++) { const more = await page.$('#tsList [data-act="showall"], #tsList [data-act="more"]'); if (!more) break; await more.evaluate((b) => b.click()); await sleep(300); }
            const sk = await page.$$eval('#tsList .ts-card[data-skill]', (c) => c.map((x) => x.dataset.skill));
            const levels = await page.evaluate(() => (window.SKILLS ? 1 : 0));
            check('FILTER-PASSED', levels && sk.length && sk.every((k) => REDESIGN_PASSED.has(k)), `@${w} Skills with Only 8/10: ${sk.filter((k) => !REDESIGN_PASSED.has(k)).slice(0, 3)} not passed (of ${sk.length})`);
            check('FILTER-PASSED', new Set(sk).size === REDESIGN_PASSED.size, `@${w} Skills with Only 8/10 (all grades): ${new Set(sk).size} skills, the registry has ${REDESIGN_PASSED.size}`);
            if (want('AREA-LABELS')) {
                const bad = await page.evaluate((labels) => [...document.querySelectorAll('#tsAreas .ts-areabtn')].map((b) => [b.dataset.domain, b.querySelector('.ts-area-l').textContent])
                    .concat([...document.querySelectorAll('#tsList .ts-group')].map((s) => [s.dataset.domain, s.querySelector('.ts-band h2').textContent]))
                    .filter(([a, t]) => labels[a] !== t), TA.AREA_LABELS);
                check('AREA-LABELS', !bad.length, `@${w} Skills: chips / headings not from AREA_LABELS: ${JSON.stringify(bad.slice(0, 4))}`);
            }
            const gchips = await page.$$eval('#tsGrades [data-arg]', (b) => b.map((x) => x.dataset.arg));
            const lv = [...new Set(Object.values(SKILLS).flat().filter((s) => s && s.v && !s.retired).map(() => 0))];
            check('FILTER-PASSED', gchips[0] === 'ALL' && gchips[gchips.length - 1] === 'M' && lv, `@${w} Skills grade pills ${gchips}`);
            await page.evaluate(() => window.scrollTo(0, 0));
            await shot('d-skills', w);
            await screenOk(`@${w} skills`);
            await page.$eval('#tsOnly button', (b) => b.click());
            await sleep(300);
            await page.evaluate(() => window.tvGo('wrm'));
            await go('#wrm/3');
        }
    }
    const errs = problems.filter((p) => !/favicon/.test(p.text));
    check('SCREEN', !errs.length, `console / page errors: ${errs.slice(0, 3).map((p) => `${p.type} ${p.text}`).join(' | ')}`);
} catch (e) {
    check('SCREEN', false, `run error: ${(e && e.stack) || e}`);
} finally {
    await app.close();
}
let n = 0;
for (const r of RULES.filter(want)) {
    const f = fails[r] || [];
    n += f.length;
    console.log(`  ${r}: ${f.length ? `FAIL (${f.length})` : 'OK'}`);
    for (const m of f.slice(0, 12)) console.log(`    - ${m}`);
}
console.log(n ? `ws-lessons-browse: FAIL (${n})` : 'ws-lessons-browse: OK');
process.exit(n ? 1 : 0);
