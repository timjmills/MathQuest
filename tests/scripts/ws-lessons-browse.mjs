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
// critic r1 D8: every screen width of the plan by default (FASTEST_PLAN rule 7: 1280-1366 and 820-1024; no 390)
const WIDTHS = String(argOf('--widths', '1366,1280,1024,820')).split(',').map(Number).filter(Boolean);
const ONLY = String(argOf('--only', '')).split(',').filter(Boolean);
const want = (r) => !ONLY.length || ONLY.includes(r);
const TODAY = '2026-11-20';
const OUT = join(ROOT, 'design/status/lf-checks/lessons-browser/build');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fails = {};
const check = (rule, ok, msg) => { if (!ok) (fails[rule] = fails[rule] || []).push(msg); };
const RULES = ['LESSON-DOMAIN', 'AREA-LABELS', 'FILTER-PASSED', 'LESSON-BROWSE', 'SCREEN',
    // critic lessons-browser r1 (2026-11-20): one rule per defect, so each has its own backtest row
    'THUMB-DETAILED-ITEM', 'THUMB-NO-FREEZE', 'SKILLS-VIEWS', 'PASS-CHIP-FILTER', 'PENDING-WORDS', 'UNIT-NOW-ON-HASH', 'THUMB-NO-CLIP', 'HEAD-NO-REPEAT', 'ROUNDTRIP-VIEW', 'SKILLS-GRADE-PILLS'];
// --plant <what>: plant a known-bad state in the CHECK's own reading, to prove an assertion can fail (ws-backtest args rows):
//   roundtrip-thumbs  the "list" round trip starts from a link with no view= after the thumbnails (the r1 D9 state)
//   drop-grade-pill   one Skills grade pill (grade 3) is removed before the pills are read (r1 D10)
const PLANT = String(argOf('--plant', ''));

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
const LP = await imp('js/modules/lessons-passed.js');
const pendingKind = LP.pendingKind || ((id) => (/re-?pinned|render(?:s|ed)? differently|\bstale\b|pages changed/i.test(String((PENDING_RECHECK.get(id) || {}).why || '')) ? 'changed' : 'fix'));
const { gradeWord, sortGrades } = await imp('js/modules/grade-of.js');
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
// critic r1 D4: EVERY interactive control of the active screen (not a hand list), visible and not inside an item preview,
// is a 48 px touch target; nothing scrolls sideways
const screenOk = async (tag) => {
    const r = await page.evaluate(() => {
        const sx = document.documentElement.scrollWidth - innerWidth;
        const scr = document.querySelector('#teacherMain .tv-screen.is-active');
        const sel = 'button, [role="button"], a[href], input:not([type="hidden"]), select, summary, [tabindex]:not([tabindex="-1"])';
        const vis = (el) => el.getClientRects().length && !el.closest('[hidden], [aria-hidden="true"], .tvp-frame, .ts-thumb, .tvw-lthumb') && getComputedStyle(el).visibility !== 'hidden';
        const small = [...(scr ? scr.querySelectorAll(sel) : [])].filter(vis).filter((b) => b.getBoundingClientRect().height < 47.5)
            .map((b) => `${(b.className && String(b.className).split(' ')[0]) || b.tagName}:${(b.textContent || b.getAttribute('aria-label') || '').trim().slice(0, 24)}(${Math.round(b.getBoundingClientRect().height)})`);
        return { sx, small: [...new Set(small)].slice(0, 8), n: small.length, screen: scr ? scr.dataset.screen : '' };
    });
    check('SCREEN', r.sx <= 0, `${tag}: the page scrolls sideways by ${r.sx}px`);
    check('SCREEN', !r.n, `${tag} (${r.screen}): ${r.n} controls under 48 px: ${r.small.join(', ')}`);
};
/** Every drawn thumbnail preview is whole: no cut class, every visible part inside its box (critic r1 D6). Measured once the previews settle (8 s at most). */
const clipProbe = async () => {
    try { await waitFor(page, () => [...document.querySelectorAll('#tvwLessons .tvw-lthumb[data-w-thumb][data-w-done]')].every((h) => h.dataset.wFit), 8000, 'previews settled'); } catch (e) { /* the unsettled ones are reported */ }
    return page.evaluate(() => {
        const out = [];
        for (const h of document.querySelectorAll('#tvwLessons .tvw-lthumb[data-w-thumb][data-w-done]')) {
            const f = h.querySelector('.tvp-frame');
            const card = h.closest('[data-w-card]');
            const id = card ? card.dataset.wCard : '?';
            const hr = h.getBoundingClientRect();
            if (!f || !hr.width) continue;
            const cut = f.classList.contains('ts-cut-r') || f.classList.contains('ts-cut-b');
            let over = 0;
            for (const el of f.querySelectorAll('*')) {
                const r = el.getBoundingClientRect();
                if (!r.width || !r.height) continue;
                const st = getComputedStyle(el);
                if (st.visibility === 'hidden' || st.opacity === '0') continue;
                if (r.left < hr.left - 1 || r.top < hr.top - 1 || r.right > hr.right + 1 || r.bottom > hr.bottom + 1) over++;
            }
            if (cut || over) out.push(`${id}${cut ? ' cut' : ''}${over ? ` ${over} parts outside` : ''}`);
        }
        return out;
    });
};
/** No status fact twice in the opened lesson's header card (critic r1 D7). */
const headRepeats = () => page.evaluate(() => {
    const head = document.querySelector('#tvwDetail .tvw-head');
    if (!head) return ['no header card'];
    const words = [...head.querySelectorAll('.tvw-tag, [data-w-chip]')].map((x) => x.textContent.trim());
    const kinds = { ccss: /^(CCSS Build|CCSS · BUILD)$/, cover: /^(Full|Fully taught|Covers part|To build|No skill yet)$/, pass: /8\/10/, pending: /^Pending re-check$/ };
    return Object.entries(kinds).map(([k, re]) => [k, words.filter((w) => re.test(w))]).filter(([, l]) => l.length > 1).map(([k, l]) => `${k}: ${l.join(' + ')}`);
});
/** The one colour band of a thumbnail card (0b: a 4 px top band; not the Skills card's left band too). */
const cardBands = () => page.evaluate(() => [...document.querySelectorAll('#tvwLessons .tvw-lcard')].slice(0, 6).map((c) => { const st = getComputedStyle(c); return [parseFloat(st.borderTopWidth), parseFloat(st.borderLeftWidth)]; }).filter(([t, l]) => !(t >= 3.5 && l <= 1.5)));

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

        /* ---------------- the list at grade 3 (shots a) */
        await go('#wrm/3?view=list');
        await page.evaluate(() => window.scrollTo(0, 0));
        await shot('a-list-top', w);
        await page.evaluate(() => document.querySelector('#tvwSum').scrollIntoView({ block: 'start' }));
        await shot('a-list', w);
        if (want('SCREEN')) await screenOk(`@${w} list`);

        /* ---------------- LESSON-BROWSE / THUMB-NO-CLIP / HEAD-NO-REPEAT: thumbnails = list, lazy previews, whole previews */
        if (want('LESSON-BROWSE') || want('THUMB-NO-CLIP') || want('HEAD-NO-REPEAT') || want('SCREEN')) {
            const listKeys = (await domRows()).map((r) => r.key);
            // the thumbnails are drawn at the top of the page (a view switch keeps the page where it is)
            await page.evaluate(() => window.scrollTo(0, 0));
            await sleep(100);
            await go('#wrm/3?view=thumbs');
            await sleep(700);
            const lazy = await page.evaluate(() => {
                const cards = [...document.querySelectorAll('#tvwLessons .tvw-lcard')];
                const rowH = cards.length ? cards[0].getBoundingClientRect().height + 16 : 0;
                const near = cards.filter((c) => c.getBoundingClientRect().top < innerHeight + rowH).length;
                const drawn = document.querySelectorAll('#tvwLessons [data-w-thumb][data-w-done], #tvwLessons [data-w-page][data-w-done]').length;
                return { cards: cards.length, near, drawn };
            });
            const thumbKeys = (await domRows()).map((r) => r.key);
            check('LESSON-BROWSE', JSON.stringify(thumbKeys) === JSON.stringify(listKeys), `@${w} thumbnails (${thumbKeys.length}) are not the list rows (${listKeys.length}) in order`);
            check('LESSON-BROWSE', lazy.drawn <= lazy.near && lazy.cards > lazy.near, `@${w} previews drawn on load ${lazy.drawn}, cards near the viewport ${lazy.near} of ${lazy.cards}`);
            // scrolled down the cards, the ones on screen are drawn whole (every drawn preview probed, critic r1 D6)
            const clipped = new Set();
            for (const frac of [0, 0.25, 0.5, 0.75, 1]) {
                await page.evaluate((f) => { const l = document.querySelector('#tvwLessons'); const r = l.getBoundingClientRect(); window.scrollTo(0, window.scrollY + r.top + (r.height - innerHeight) * f); }, frac);
                await sleep(1300);
                for (const c of await clipProbe()) clipped.add(c);
            }
            const drawnNow = await page.evaluate(() => document.querySelectorAll('#tvwLessons [data-w-thumb][data-w-done] .tvp-frame').length);
            check('LESSON-BROWSE', drawnNow > 0, `@${w} no preview drawn when the cards are on screen`);
            check('THUMB-NO-CLIP', drawnNow > 0 && !clipped.size, `@${w} thumbnail previews cut or spilling out of their box: ${[...clipped].slice(0, 6).join(', ')} (${drawnNow} drawn)`);
            const bands = await cardBands();
            check('HEAD-NO-REPEAT', !bands.length, `@${w} thumbnail cards with two colour bands (top / left width): ${JSON.stringify(bands.slice(0, 3))}`);
            await page.evaluate(() => document.querySelector('#tvwLessons .tvw-lcard')?.scrollIntoView({ block: 'start' }));
            await sleep(900);
            await clipProbe();   // (waits for the previews on screen to settle before the picture)
            await sleep(300);
            await shot('b-thumbs', w);
            if (want('SCREEN')) await screenOk(`@${w} thumbs`);
        }
        if (want('LESSON-BROWSE') || want('ROUNDTRIP-VIEW') || want('HEAD-NO-REPEAT')) {
            // open then "← All lessons": thumbnails and LIST (critic r1 D9: the list case names view=list and asserts it)
            const trips = [['#wrm/3?a=NBT&view=thumbs', 'thumbs'], [PLANT === 'roundtrip-thumbs' ? '#wrm/3?a=OA' : '#wrm/3?a=OA&view=list', 'list']];
            for (const [h, tag] of trips) {
                await go(h);
                // into the list (the filter card is taller at tablet widths)
                await page.evaluate(() => { const l = document.querySelector('#tvwLessons').getBoundingClientRect(); window.scrollTo(0, Math.min(window.scrollY + l.top + 300, document.documentElement.scrollHeight - innerHeight)); });
                await sleep(300);
                const before = await state();
                check('ROUNDTRIP-VIEW', before.view === tag, `@${w} the ${tag} round trip runs in view ${before.view}`);
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
                if (tag === 'list') {
                    const hc = await page.evaluate(() => !!document.querySelector('#tvwDetail .tvw-bhead .tvw-gbadge'));
                    check('LESSON-BROWSE', hc, `@${w}: the opened lesson's header card has no grade / area band`);
                    const rep = await headRepeats();
                    check('HEAD-NO-REPEAT', !rep.length, `@${w} ${target}: the header card says a fact twice: ${rep.join('; ')}`);
                }
                await page.$eval('#tvwDetail [data-w-back]', (b) => b.click());
                await sleep(500);
                const after = await state();
                check('LESSON-BROWSE', after.grade === before.grade && after.area === before.area && after.only === before.only && after.view === before.view && Math.abs(after.y - before.y) <= 2 && after.hash === before.hash,
                    `@${w} ${tag}: "← All lessons" came back to ${JSON.stringify(after)} not ${JSON.stringify(before)}`);
            }
        }
        if (want('LESSON-BROWSE') && w === WIDTHS[0]) {
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
            await page.evaluate(() => { try { localStorage.removeItem('mq_teacher_lessons_browse'); } catch (e) { /* */ } });
            await go('#wrm/3?only=0&view=list');
        }

        /* ---------------- By unit / date (LESSON-BROWSE), and a link into it (UNIT-NOW-ON-HASH, critic r1 D5) */
        if (want('LESSON-BROWSE') || want('UNIT-NOW-ON-HASH') || want('SCREEN')) {
            await go('#wrm/3?view=list');
            await page.evaluate(() => window.scrollTo(0, 0));
            await sleep(150);
            // a link (Back, Forward, a pasted address) from the List view straight into By unit / date
            await go('#wrm/3?view=unit');
            await sleep(400);
            const viaHash = await page.evaluate(() => { const u = document.querySelector('#tvwLessons .tvw-unit.is-now .tvw-unit-h'); if (!u) return null; const r = u.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom) }; });
            check('UNIT-NOW-ON-HASH', viaHash && viaHash.top >= -2 && viaHash.bottom <= 768, `@${w} #wrm/3?view=unit by a link: the Now unit header is at ${JSON.stringify(viaHash)}, not in the window`);
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
            if (want('SCREEN')) await screenOk(`@${w} unit`);
            const closed = units.find((u) => !u.open);
            if (closed) {
                await click(`.tvw-unit[data-w-unit="${closed.unit}"] .tvw-unit-h`);
                const nowOpen = await page.$eval(`.tvw-unit[data-w-unit="${closed.unit}"] .tvw-nlist`, (o) => !o.hidden);
                check('LESSON-BROWSE', nowOpen, `@${w} unit ${closed.unit} did not open on a click`);
                await click(`.tvw-unit[data-w-unit="${closed.unit}"] .tvw-unit-h`);   // closed again (the next width starts as a teacher would)
            }
            await go('#wrm/3?a=NF&view=unit');
            const nfUnits = await page.$$eval('#tvwLessons .tvw-unit', (u) => u.map((x) => x.dataset.wUnit));
            const wantNf = L.unitGroups('3', ROWS['3'].filter((r) => r.area === 'NF'), PACING, today).filter((u) => u.rows.length).map((u) => u.unit);
            check('LESSON-BROWSE', JSON.stringify(nfUnits) === JSON.stringify(wantNf), `@${w} the area filter inside units: ${nfUnits} want ${wantNf}`);
            await go('#wrm/3?a=&view=list');
        }

        /* ---------------- THUMB-DETAILED-ITEM (lead ruling A20, critic r2 D11): a detailed lesson's card shows its first
           teaching skill's ITEM card (the r1 state), and no first-page build starts on load or scroll */
        if (want('THUMB-DETAILED-ITEM') && w === WIDTHS[0]) {
            const buildable = new Set(await page.evaluate(() => import(new URL('js/modules/lessons/detailed/index.js', location.href).href).then((m) => Object.keys(m.DETAILED_LESSONS || {}))));
            const withDl = ALL_ROWS.filter((r) => (r.detailed || []).some((id) => buildable.has(id)));
            check('THUMB-DETAILED-ITEM', withDl.length > 0, 'no lesson row has a detailed lesson to test');
            const b0 = await page.evaluate(() => window.__mqLessonPageBuilds || 0);
            for (const g of [...new Set(withDl.map((r) => r.grade))]) {
                await go(`#wrm/${g}?view=thumbs`);
                for (const r of withDl.filter((x) => x.grade === g)) {
                    const k = await page.evaluate((key) => { const c = document.querySelector(`#tvwLessons [data-w-card="${key}"]`); if (!c) return null; c.scrollIntoView({ block: 'center' }); return { page: !!c.querySelector('[data-w-page]'), item: !!c.querySelector('[data-w-thumb]') }; }, r.key);
                    await sleep(400);
                    check('THUMB-DETAILED-ITEM', k && !k.page && (k.item || !r.firstSkill), `grade ${g}: ${r.key} (detailed ${r.detailed.join(', ')}) card: ${JSON.stringify(k)}; want its first skill's item card, no first page`);
                }
                await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } });
                await sleep(800);
            }
            const b1 = await page.evaluate(() => window.__mqLessonPageBuilds || 0);
            check('THUMB-DETAILED-ITEM', b1 === b0, `${b1 - b0} first-page build(s) started on load or scroll (lead ruling A20: only on request)`);
            await go('#wrm/3?view=list');
        }

        /* ---------------- THUMB-NO-FREEZE (critic r2 D11): CPU x4, cold cache (IndexedDB cleared), grade 3 Thumbnails at
           1024, scroll through. FAIL if any long task > 200 ms or any rAF frame gap > 500 ms. Measured only from the moment
           the Lessons screen is shown (the app's own boot is outside this rule). */
        if (want('THUMB-NO-FREEZE') && w === 1024) {
            const cdp = await page.target().createCDPSession();
            await page.evaluate(() => new Promise((res) => { try { for (const n of ['mq-lesson-pages', 'mathquest-lesson-pages']) indexedDB.deleteDatabase(n); } catch (e) { /* */ } res(); }));
            await cdp.send('Storage.clearDataForOrigin', { origin: new URL(app.base).origin, storageTypes: 'indexeddb' }).catch(() => {});
            await page.evaluate(() => { window.__mqLessonPageBuilds = 0; });
            await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
            try {
                await go('#wrm/3?view=thumbs');
                await page.evaluate(() => {
                    const M = window.__mqFreeze = { long: 0, gap: 0 };
                    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) M.long = Math.max(M.long, e.duration); }).observe({ type: 'longtask' }); } catch (e) { M.err = String(e); }
                    let t = performance.now();
                    const tick = (n) => { M.gap = Math.max(M.gap, n - t); t = n; if (!M.stop) requestAnimationFrame(tick); };
                    requestAnimationFrame(tick);
                });
                const H = await page.evaluate(() => document.body.scrollHeight);
                for (let y = 0; y <= H; y += 500) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await sleep(700); }
                await sleep(4000);
                const m = await page.evaluate(() => { window.__mqFreeze.stop = true; return window.__mqFreeze; });
                check('THUMB-NO-FREEZE', !m.err, `longtask observer: ${m.err}`);
                check('THUMB-NO-FREEZE', m.long <= 200, `a long task of ${Math.round(m.long)} ms (budget 200 ms) on the grade 3 Thumbnails at CPU x4, cold cache`);
                check('THUMB-NO-FREEZE', m.gap <= 500, `a frame gap of ${Math.round(m.gap)} ms (budget 500 ms) on the grade 3 Thumbnails at CPU x4, cold cache`);
            } finally {
                await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
                await cdp.detach().catch(() => {});
            }
            await go('#wrm/3?view=list');
        }

        /* ---------------- PASS-CHIP-FILTER (owner 2026-11-21, lead ruling A33): the bar's 8/10 chip IS the filter toggle
           (one control, chip-styled, aria-pressed, "8/10 · N lesson(s)"), "What does 8/10 mean?" beside it, 48 px */
        if (want('PASS-CHIP-FILTER')) {
            await go('#wrm/4?view=list');
            await page.evaluate(() => window.scrollTo(0, 0));
            const n = LESSONS_PASSED.size;
            const bar = () => page.evaluate(() => { const c = document.querySelectorAll('#tvwFilters [data-w-only]'); const b = c[0]; const s = document.querySelector('#tvwFilters .ts-marks > summary'); return { controls: c.length, chip: !!b && b.classList.contains('ts-passchip'), pressed: b ? b.getAttribute('aria-pressed') : null, text: b ? b.textContent.replace(/\s+/g, ' ').trim() : '', h: b ? b.getBoundingClientRect().height : 0, info: s ? s.textContent.trim() : '', ih: s ? s.getBoundingClientRect().height : 0 }; });
            const b0 = await bar();
            check('PASS-CHIP-FILTER', b0.controls === 1 && b0.chip && b0.pressed === 'false' && b0.text.endsWith(`8/10 · ${n} lesson${n === 1 ? '' : 's'}`) && b0.h >= 47.5, `@${w} the Lessons bar's 8/10 control is not one chip-styled toggle reading "8/10 · ${n} lesson${n === 1 ? '' : 's'}": ${JSON.stringify(b0)}`);
            check('PASS-CHIP-FILTER', /What does 8\/10 mean\?/.test(b0.info) && b0.ih >= 47.5, `@${w} no 48 px "What does 8/10 mean?" beside the chip: ${JSON.stringify(b0)}`);
            await page.evaluate(() => document.querySelector('#tvwFilters').scrollIntoView({ block: 'start' }));
            await shot('pass-chip-lessons-unpressed', w);
            if (b0.controls) {
                await click('#tvwFilters [data-w-only]');
                const b1 = await bar();
                const rows = await domRows();
                check('PASS-CHIP-FILTER', b1.pressed === 'true' && rows.length && rows.every((r) => r.pass), `@${w} pressed, the chip ${b1.pressed} shows ${rows.length} rows, not only the passed lessons`);
                await page.evaluate(() => document.querySelector('#tvwFilters').scrollIntoView({ block: 'start' }));
                await shot('pass-chip-lessons-pressed', w);
                await click('#tvwFilters [data-w-only]');
            }
            // the Skills bar: the same chip (teacher-library.js passChipHTML)
            await page.evaluate(() => window.tvGo('skills'));
            await waitFor(page, () => !!document.querySelector('[data-screen="skills"].is-active #tsList'), 20000, 'skills screen');
            const sk = await page.evaluate(() => { const c = document.querySelector('#tsPassChip [aria-pressed]'); return { chip: !!c && c.classList.contains('ts-passchip'), text: c ? c.textContent.replace(/\s+/g, ' ').trim() : '', switchLeft: !!document.querySelector('#tsOnly, #tsOnlyRow') }; });
            check('PASS-CHIP-FILTER', sk.chip && /8\/10 · \d+ skills?$/.test(sk.text) && !sk.switchLeft, `@${w} the Skills bar's 8/10 control: ${JSON.stringify(sk)}`);
            await page.evaluate(() => document.querySelector('[data-screen="skills"] .ts-filters').scrollIntoView({ block: 'start' }));
            await shot('pass-chip-skills-unpressed', w);
            if (sk.chip) {
                await page.$eval('#tsPassChip [aria-pressed]', (b) => b.click());
                await sleep(500);
                await page.evaluate(() => document.querySelector('[data-screen="skills"] .ts-filters').scrollIntoView({ block: 'start' }));
                await shot('pass-chip-skills-pressed', w);
                await page.$eval('#tsPassChip [aria-pressed]', (b) => b.click());
                await sleep(300);
            }
            await page.evaluate(() => window.tvGo('wrm'));
            await go('#wrm/3?view=list');
        }

        /* ---------------- FILTER-PASSED / PENDING-WORDS */
        if (want('FILTER-PASSED') || want('PENDING-WORDS') || want('HEAD-NO-REPEAT') || want('SCREEN')) {
            await go('#wrm/all?view=list');
            if (!(await state()).only) await click('[data-w-only]');
            const rows = await domRows();
            const wantKeys = ALL_ROWS.filter((r) => r.pass).map((r) => r.key);
            check('FILTER-PASSED', JSON.stringify(rows.map((r) => r.key).sort()) === JSON.stringify(wantKeys.slice().sort()), `@${w} Only 8/10 (all grades): rows ${rows.map((r) => r.key)} want ${wantKeys}`);
            const mapped = new Set(ALL_ROWS.filter((r) => r.pass).map((r) => r.pass));
            check('FILTER-PASSED', [...LESSONS_PASSED.keys()].every((id) => mapped.has(id)), `@${w} a LESSONS_PASSED id maps to no row: ${[...LESSONS_PASSED.keys()].filter((id) => !mapped.has(id))}`);
            check('FILTER-PASSED', rows.every((r) => r.chips.includes('pass') && r.pass), `@${w} a row shown with the switch on has no ✓ 8/10 chip`);
            const marks = await page.$$eval('#tvwLessons .tvw-brow .ts-pass', (m) => m.length);
            check('FILTER-PASSED', marks === rows.length, `@${w} ${marks} corner marks for ${rows.length} passed rows`);
            // PENDING-WORDS: the summary never says "fix" for every pending lesson; each words its own reason
            const sum = await page.$eval('#tvwSum', (x) => x.textContent);
            // critic r2 D12: every pending line words a reason (the text after the title is at least 10 characters)
            for (const t of await page.$$eval('#tvwLessons [data-w-pend], [data-w-pend]', (li) => li.map((x) => { const b = x.querySelector('b'); return x.textContent.slice(((b && b.textContent) || '').length).replace(/^[:\s]+|[.\s]+$/g, ''); }))) check('PENDING-WORDS', t.length >= 10, `@${w} a pending line has an empty reason: "${t}"`);
            check('PENDING-WORDS', !/fix/i.test(sum), `@${w} the summary claims a fix for every pending lesson: "${sum.replace(/\s+/g, ' ').trim()}"`);
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
                    const em = await page.evaluate(() => { const e = document.querySelector('[data-w-empty="only"]'); return e ? { text: e.textContent, pend: [...e.querySelectorAll('[data-w-pend]')].map((li) => [li.dataset.wPend, li.textContent.replace(/\s+/g, ' ').trim()]) } : null; });
                    check('FILTER-PASSED', em && /No lesson here has passed 8\/10 yet/.test(em.text), `@${w} grade ${g}: no empty state with the switch on`);
                    if (em) {
                        // only the pending lessons of the grade on screen, each with its own reason
                        const wantPend = ROWS[g].filter((x) => x.pending).map((x) => x.pending);
                        check('PENDING-WORDS', JSON.stringify(em.pend.map((x) => x[0]).sort()) === JSON.stringify(wantPend.slice().sort()), `@${w} grade ${g}: the empty state names ${em.pend.map((x) => x[0])} want this grade's pending ${wantPend}`);
                        for (const [id, t] of em.pend) check('PENDING-WORDS', /fix/i.test(t) === (pendingKind(id) === 'fix'), `@${w} grade ${g}: "${t}" does not match ${id}'s reason (${pendingKind(id)})`);
                        if (!em.pend.length) check('PENDING-WORDS', !/Pending re-check/.test(em.text), `@${w} grade ${g}: a pending line with no pending lesson in the grade`);
                    }
                    if (g === '3' && w === WIDTHS[0]) await shot('c-only-empty', w);
                }
            }
            await click('.tvw-gradebtn[data-w-grade="3"]');
            await click('.tvw-areabtn[data-w-area="OA"]');
            check('FILTER-PASSED', (await state()).only, `@${w} the switch went off on an area change`);
            await click('.tvw-areabtn[data-w-area=""]');
            const kept = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('mq_teacher_lessons_browse') || '{}').only === true; } catch (e) { return false; } });
            check('FILTER-PASSED', kept, `@${w} the switch is not kept for the viewer`);
            const pk = ALL_ROWS.find((r) => r.pass);
            if (pk) {
                await click(`.tvw-gradebtn[data-w-grade="${pk.grade}"]`);
                await page.evaluate(() => document.querySelector('#tvwSum').scrollIntoView({ block: 'start' }));
                await shot('c-only', w);
                await page.$eval(`#tvwLessons [data-w-lesson="${pk.key}"]`, (b) => b.click());
                await sleep(500);
                const hd = await page.evaluate(() => ({ mark: !!document.querySelector('#tvwDetail .tvw-head .ts-pass'), chip: !!document.querySelector('#tvwDetail .tvw-head [data-w-chip="pass"]'), line: (document.querySelector('#tvwDetail [data-w-passline]') || {}).textContent || '' }));
                check('FILTER-PASSED', hd.mark && hd.chip && /passed the 8\/10 quality check/.test(hd.line), `@${w} the opened passed lesson's header card: ${JSON.stringify(hd)}`);
                const rep = await headRepeats();
                check('HEAD-NO-REPEAT', !rep.length, `@${w} ${pk.key}: the header card says a fact twice: ${rep.join('; ')}`);
                await page.evaluate(() => window.scrollTo(0, 0));
                await shot('e-open', w);
                if (want('SCREEN')) await screenOk(`@${w} open`);
                await page.$eval('#tvwDetail [data-w-back]', (b) => b.click());
                await sleep(300);
            }
            await click('[data-w-only]');
            check('FILTER-PASSED', !(await state()).only, `@${w} the switch did not turn off`);
            // PENDING-WORDS on every opened pending lesson: its own reason
            if (w === WIDTHS[0]) for (const r of ALL_ROWS.filter((x) => x.pending)) {
                await go(L.lessonHash(r.lesson));
                await sleep(300);
                const t = await page.evaluate(() => (document.querySelector('#tvwDetail [data-w-passline="pending"]') || {}).textContent || '');
                check('PENDING-WORDS', !!t && /fix/i.test(t) === (pendingKind(r.pending) === 'fix'), `${r.key} (${r.pending}, ${pendingKind(r.pending)}): pending line "${t}"`);
                const rep = await headRepeats();
                check('HEAD-NO-REPEAT', !rep.length, `${r.key}: the header card says a fact twice: ${rep.join('; ')}`);
                await page.$eval('#tvwDetail [data-w-back]', (b) => b.click());
                await sleep(200);
            }
        }

        /* ---------------- the Skills screen: generated grades, area chips, Only 8/10 ✓ (FILTER-PASSED, SKILLS-VIEWS, SKILLS-GRADE-PILLS) */
        if (want('FILTER-PASSED') || want('SKILLS-VIEWS') || want('SKILLS-GRADE-PILLS') || want('AREA-LABELS') || want('SCREEN')) {
            await page.evaluate(() => window.tvGo('skills'));
            await waitFor(page, () => !!document.querySelector('[data-screen="skills"].is-active #tsPassChip [aria-pressed]'), 20000, 'skills screen');
            await page.evaluate(() => { const s = document.querySelector('#tsSearch'); if (s && s.value) { s.value = ''; s.dispatchEvent(new Event('input', { bubbles: true })); } });
            await sleep(300);
            await page.evaluate(() => { const b = document.querySelector('#tsBrowse [data-arg="area"]'); if (b && b.getAttribute('aria-pressed') !== 'true') b.click(); });
            await sleep(300);
            const allBtn = await page.$('#tsGrades [data-arg="ALL"]');
            if (allBtn && (await allBtn.evaluate((b) => b.getAttribute('aria-pressed'))) !== 'true') { await allBtn.evaluate((b) => b.click()); await sleep(300); }
            const onAlready = await page.$eval('#tsPassChip [aria-pressed]', (b) => b.getAttribute('aria-pressed') === 'true');
            if (!onAlready) { await page.$eval('#tsPassChip [aria-pressed]', (b) => b.click()); await sleep(500); }
            for (let i = 0; i < 6; i++) { const more = await page.$('#tsList [data-act="showall"], #tsList [data-act="more"]'); if (!more) break; await more.evaluate((b) => b.click()); await sleep(300); }
            const sk = await page.$$eval('#tsList .ts-card[data-skill]', (c) => c.map((x) => x.dataset.skill));
            check('FILTER-PASSED', sk.length && sk.every((k) => REDESIGN_PASSED.has(k)), `@${w} Skills with Only 8/10: ${sk.filter((k) => !REDESIGN_PASSED.has(k)).slice(0, 3)} not passed (of ${sk.length})`);
            check('FILTER-PASSED', new Set(sk).size === REDESIGN_PASSED.size, `@${w} Skills with Only 8/10 (all grades): ${new Set(sk).size} skills, the registry has ${REDESIGN_PASSED.size}`);
            if (want('AREA-LABELS')) {
                const bad = await page.evaluate((labels) => [...document.querySelectorAll('#tsAreas .ts-areabtn')].map((b) => [b.dataset.domain, b.querySelector('.ts-area-l').textContent])
                    .concat([...document.querySelectorAll('#tsList .ts-group')].map((s) => [s.dataset.domain, s.querySelector('.ts-band h2').textContent]))
                    .filter(([a, t]) => labels[a] !== t), TA.AREA_LABELS);
                check('AREA-LABELS', !bad.length, `@${w} Skills: chips / headings not from AREA_LABELS: ${JSON.stringify(bad.slice(0, 4))}`);
            }
            // SKILLS-GRADE-PILLS (critic r1 D10): the pills are exactly All + the grades the skills carry (sorted) + Mixed
            if (PLANT === 'drop-grade-pill') await page.evaluate(() => document.querySelector('#tsGrades [data-arg="3"]')?.remove());
            const gchips = await page.$$eval('#tsGrades [data-arg]', (b) => b.map((x) => x.dataset.arg));
            const levels = await page.evaluate(() => import(new URL('js/modules/teacher-ui.js', location.href).href).then((m) => m.skillCatalogue().map((s) => s.level)));
            const wantPills = ['ALL', ...sortGrades(levels.filter((g) => g !== 'M')), 'M'];
            check('SKILLS-GRADE-PILLS', JSON.stringify(gchips) === JSON.stringify(wantPills), `@${w} Skills grade pills ${gchips} want ${wantPills}`);
            await page.evaluate(() => window.scrollTo(0, 0));
            await shot('d-skills', w);
            if (want('SCREEN')) await screenOk(`@${w} skills`);
            // SKILLS-VIEWS (critic r1 D2): in every Browse-by view and while searching, the switch is not offered, or every
            // card shown is a passed skill
            if (want('SKILLS-VIEWS') && w === WIDTHS[0]) {
                const probe = () => page.evaluate(() => ({ offered: !!document.querySelector('#tsPassChip [aria-pressed]')?.getClientRects().length, on: document.querySelector('#tsPassChip [aria-pressed]')?.getAttribute('aria-pressed') === 'true', cards: [...document.querySelectorAll('#tsList .ts-card[data-skill]')].map((c) => c.dataset.skill) }));
                for (const v of ['wrm', 'std', 'map', 'sets']) {
                    await page.evaluate((v) => document.querySelector(`#tsBrowse [data-arg="${v}"]`)?.click(), v);
                    await sleep(900);
                    const r = await probe();
                    check('SKILLS-VIEWS', !(r.offered && r.on) || r.cards.every((k) => REDESIGN_PASSED.has(k)), `@${w} Skills "${v}" view: Only 8/10 is offered and on, yet ${r.cards.filter((k) => !REDESIGN_PASSED.has(k)).length} cards shown are not passed`);
                }
                await page.evaluate(() => document.querySelector('#tsBrowse [data-arg="area"]')?.click());
                await sleep(300);
                await page.evaluate(() => { const s = document.querySelector('#tsSearch'); s.value = 'add within 20'; s.dispatchEvent(new Event('input', { bubbles: true })); });
                await sleep(900);
                const rs = await probe();
                check('SKILLS-VIEWS', !(rs.offered && rs.on) || rs.cards.every((k) => REDESIGN_PASSED.has(k)), `@${w} Skills search: Only 8/10 is offered and on, yet ${rs.cards.filter((k) => !REDESIGN_PASSED.has(k)).length} cards found are not passed`);
                await page.evaluate(() => { const s = document.querySelector('#tsSearch'); s.value = ''; s.dispatchEvent(new Event('input', { bubbles: true })); });
                await sleep(500);
            }
            await page.evaluate(() => { const b = document.querySelector('#tsPassChip [aria-pressed]'); if (b && b.getAttribute('aria-pressed') === 'true') b.click(); });
            await sleep(300);
            await page.evaluate(() => window.tvGo('wrm'));
            await go('#wrm/3?view=list');
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
