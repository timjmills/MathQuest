#!/usr/bin/env node
// ws-partopts-unit — the gate of lane lf-partopts (design/partopts/DESIGN.md §5): the per-part "how many" of a lesson.
//
//   node tests/scripts/ws-partopts-unit.cjs --unit                 # PO-4 + the pure half of PO-2 (no browser, < 1 s)
//   node tests/scripts/ws-partopts-unit.cjs                        # PO-2: every live lesson x M / L at each part's min and max
//   node tests/scripts/ws-partopts-unit.cjs --full 3               #   ... plus EVERY offered value for the first 3 lessons
//   node tests/scripts/ws-partopts-unit.cjs --lessons addition:add_facts --sizes L --parts practice
//
// PO-4 (unit): normalizePartOpts clamps min - 1 and max + 1 into the range and drops every default (a standard lesson stores
//   {}); a section's partOpts survive a JSON save and load unchanged; a saved section's older `parts` list reads into partOpts;
//   the parts list a partOpts asks for; offeredValues never leaves [min, max] and steps in whole rows on Practice.
// PO-2 (browser): for every live lesson (lessons/prereqs.js LESSONS and the add sample) at M and L (S prints as M - print-sheet.js
//   LESSON_SIZE_NOTE), the standard packet is built and its parts' limits read (res.lesson.partFit -> partLimits). Then each part
//   at its min and its max (and the toggles: Remember off, We Do off) is built ALONE and judged:
//     PO-2a  it builds, its key builds (the key renders from the same plan), the anchor chart keeps its planned size (sizing.ok)
//     PO-2b  the count is honoured where the build reports it (Prerequisite questions, We Do cells, lesson rows, Practice a page)
//     PO-2c  no overflow: every page's content inside its page, no cell past the page's foot (a split cell would cross it)
//     PO-2d  ws-empty-band's rules (EB-BAND / EB-SIDE / EB-EDGE, the shared measureCells + judge) and EB-PAGE (a page before its
//            sheet's last 30 % or more empty) find nothing the standard packet of the same lesson and size does not already
//            have - a non-default count may not add an empty band.
//   Sampling is deterministic (seed 4242).
// Prints `ws-partopts-unit: OK` / `FAIL (n)`; exits 1 on FAIL.
'use strict';
const path = require('path');
const { pathToFileURL } = require('url');

const argv = process.argv.slice(2);
const has = (k) => argv.includes('--' + k);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const ROOT = path.resolve(__dirname, '..', '..');
const fails = [];
const F = (id, msg) => fails.push(`${id} ${msg}`);

async function unit() {
    const po = await import(pathToFileURL(path.join(ROOT, 'js/modules/sheet/part-opts.js')).href);
    const fit = { prereq: { total: 4 }, chart: { designed: 2, min: 1 }, vocab: { words: 3 }, remember: { has: true }, wedo: { fit: 3, min: 2 }, rows: { fit: 2, perRow: 3 }, practice: { perPage: 15, cols: 3, rows: 5, minRows: 4 }, mixed: { count: 10 } };
    const lims = po.allPartLimits(fit);
    let n = 0;
    for (const [p, lim] of Object.entries(lims)) {
        const vals = po.offeredValues(lim);
        if (vals.some((v) => v < lim.min || v > lim.max)) F('PO-4', `${p}: offered ${vals} outside [${lim.min}, ${lim.max}]`);
        if (lim.fixed) continue;
        if (p === 'practice' && vals.some((v) => v % lim.step)) F('PO-4', `practice: ${vals} not whole rows of ${lim.step}`);
        const lo = po.normalizePartOpts({ [p]: { n: lim.min - 1 } }, lims)[p];
        const hi = po.normalizePartOpts({ [p]: { n: lim.max + 1 } }, lims)[p];
        if (!(lo && lo.n === lim.min) && lim.min !== lim.dflt) F('PO-4', `${p}: min - 1 normalised to ${JSON.stringify(lo)}, not ${lim.min}`);
        if (hi !== undefined && lim.max === lim.dflt) F('PO-4', `${p}: max + 1 kept as ${JSON.stringify(hi)} (max is the default: nothing stored)`);
        if (Object.keys(po.normalizePartOpts({ [p]: { n: lim.dflt } }, lims)).length) F('PO-4', `${p}: the default count was stored`);
        n++;
    }
    if (Object.keys(po.normalizePartOpts({}, lims)).length || !po.partOptsEmpty({ wedo: {} })) F('PO-4', 'a standard lesson stores something');
    // the save / load round trip: a section's partOpts as JSON, read back, normalised again
    const sec = { role: 'lesson', pages: 2, mixed: true, partOpts: po.normalizePartOpts({ prereq: { n: 2 }, wedo: { n: 2 }, rows: { n: 0 }, remember: { on: false }, practice: { n: 12 }, chart: { on: false } }, lims) };
    const back = JSON.parse(JSON.stringify(sec));
    const again = po.partOptsFromSection(back);
    if (JSON.stringify(again) !== JSON.stringify(sec.partOpts)) F('PO-4', `save/load changed the partOpts: ${JSON.stringify(sec.partOpts)} -> ${JSON.stringify(again)}`);
    if (JSON.stringify(po.normalizePartOpts(again, lims)) !== JSON.stringify(sec.partOpts)) F('PO-4', 'normalising twice is not stable');
    // an older saved section: `parts` without the Prerequisite Check reads as prereq off; pages / mixed stay its own fields
    const old = po.partOptsFromSection({ role: 'lesson', pages: 1, mixed: false, parts: ['chart', 'sheet', 'practice'] });
    if (!(old.prereq && old.prereq.on === false) || old.chart) F('PO-4', `an old section's parts list read as ${JSON.stringify(old)}`);
    if (po.partsListOf({}, 1, false) !== undefined) F('PO-4', 'the default packet asks for a parts list');
    if (JSON.stringify(po.partsListOf({ chart: { on: false } }, 2, true)) !== JSON.stringify(['prereq', 'sheet', 'practice', 'mixed'])) F('PO-4', 'the parts list of chart-off is wrong');
    const pn = po.lessonPartN({ wedo: { on: false }, vocab: { n: 0 }, rows: { n: 1 }, remember: { on: false } });
    if (!pn || pn.wedo !== 0 || pn.vocab !== 0 || pn.rows !== 1 || pn.remember !== false) F('PO-4', `lessonPartN ${JSON.stringify(pn)}`);
    if (po.lessonPartN({}) !== null) F('PO-4', 'lessonPartN of the standard packet is not null');
    console.log(`PO-4 ${fails.length ? 'FAIL' : 'PASS'} (${n} counted parts, save/load, old sections, parts list)`);
}

async function browser() {
    const { open } = require('../lib/ws-harness.cjs');
    const { measureCells, judge } = require('./ws-empty-band.cjs');
    const app = await open({ seed: 1 });
    const T0 = Date.now();
    let builds = 0;
    try {
        const { page, browser } = app;
        let lessons = await page.evaluate(async () => Object.keys((await import('./js/modules/lessons/prereqs.js')).LESSONS));
        lessons = [{ id: 'addition:add_facts (sample)', skill: { categoryId: 'addition', skillId: 'add_facts', opts: { band: 10, constant: [1, 2, 3] } } }]
            .concat(lessons.map((k) => ({ id: k, skill: { categoryId: k.split(':')[0], skillId: k.split(':')[1] } })));
        if (arg('lessons')) lessons = lessons.filter((l) => arg('lessons').split(',').some((x) => l.id.startsWith(x)));
        const sizes = arg('sizes', 'M,L').split(',');
        const onlyParts = arg('parts') ? arg('parts').split(',') : null;
        const full = Number(arg('full', 0)) || 0;
        const po = await import(pathToFileURL(path.join(ROOT, 'js/modules/sheet/part-opts.js')).href);

        const build = (skill, size, partOpts) => page.evaluate(async ({ skill, size, partOpts }) => {
            try {
                const r = await window.buildSheet({ role: 'lesson', sections: [{ skills: [skill] }], size, paper: 'A4', seed: 4242, key: true, practicePages: 1, mixed: true, partOpts });
                const prac = (r.items || []).filter((it) => it.part === 'practice');
                const pracPart = (r.lesson.parts || []).find((p) => p.part === 'practice');
                return {
                    pupil: r.pupilHtml, doc: window.sheetDocument(r.pupilHtml, 'x', { paper: 'A4' }), keyLen: (r.keyHtml || '').length, keyPages: r.keyPageCount, pages: r.pageCount,
                    fit: r.lesson.partFit, sizingOk: !r.chartSizing || r.chartSizing.ok !== false,
                    got: { prereq: r.lesson.prereqCheck ? r.lesson.prereqCheck.length : null, wedo: r.lesson.teach && r.lesson.teach.guided, rowsItems: r.lesson.teach && r.lesson.teach.independent, practice: pracPart && pracPart.pages ? Math.ceil(prac.length / pracPart.pages) : null },
                };
            } catch (e) { return { error: String((e && e.stack) || e).split('\n').slice(0, 2).join(' ') }; }
        }, { skill, size, partOpts });

        // render a pupil document; read its cells (ws-empty-band), its overflow and its page fill per sheet
        const measure = async (doc) => {
            const sh = await browser.newPage();
            try {
                await sh.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
                await sh.goto(page.url(), { waitUntil: 'domcontentloaded' });
                await sh.setContent(doc, { waitUntil: 'networkidle0', timeout: 60000 });
                await sh.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', { timeout: 15000 }).catch(() => {});
                await sh.emulateMediaType('print');
                const cells = await sh.evaluate(measureCells, 'body > section.ws-page, body > .ws-page');
                const pages = await sh.evaluate(() => [...document.querySelectorAll('body > section.ws-page, body > .ws-page')].map((pg) => {
                    const pr = pg.getBoundingClientRect();
                    const body = pg.querySelector('.ws-body') || pg; const br = body.getBoundingClientRect();
                    const kids = [...body.children].filter((x) => x.getBoundingClientRect().height > 0 && !/ws-foot|ws-footer/.test(x.className));
                    const last = kids.length ? Math.max(...kids.map((x) => x.getBoundingClientRect().bottom)) : br.top;
                    const cellsOut = [...pg.querySelectorAll('[data-ws-cell]')].filter((c) => c.getBoundingClientRect().bottom > pr.bottom + 1).length;
                    return { sheet: pg.getAttribute('data-ws-sheet') || '', over: pg.scrollHeight > pg.clientHeight + 2 || cellsOut > 0, empty: Math.round(Math.max(0, br.bottom - last) / br.height * 100) };
                }));
                return { cells, pages };
            } finally { await sh.close(); }
        };
        const findingsOf = (m, where) => {
            const out = [];
            const sheetOf = (pi) => (m.pages[pi - 1] || {}).sheet || '';
            judge(m.cells, where, (rule, w, msg) => { if (['EB-BAND', 'EB-SIDE', 'EB-EDGE'].includes(rule)) out.push({ key: `${rule}|${sheetOf(Number((/ p(\d+) /.exec(w) || [])[1]))}`, msg: `${w}: ${msg}` }); }, 'lesson');
            m.pages.forEach((p, i) => { const nx = m.pages[i + 1]; if (nx && nx.sheet === p.sheet && p.empty >= 30) out.push({ key: `EB-PAGE|${p.sheet}`, msg: `${where} p${i + 1} (${p.sheet}): ${p.empty} % of the page body empty under its last block` }); });
            return out;
        };
        const count = (list) => list.reduce((a, x) => { a[x.key] = (a[x.key] || 0) + 1; return a; }, {});

        for (const [li, l] of lessons.entries()) for (const size of sizes) {
            const where0 = `${l.id} ${size}`;
            const b0 = await build(l.skill, size, undefined); builds++;
            if (b0.error) { F('PO-2a', `${where0} standard packet: ${b0.error}`); continue; }
            const m0 = await measure(b0.doc);
            const base = count(findingsOf(m0, where0));
            const lims = po.allPartLimits(b0.fit);
            const jobs = [];
            for (const [p, lim] of Object.entries(lims)) {
                if (onlyParts && !onlyParts.includes(p)) continue;
                if (lim.toggle) { jobs.push({ p, partOpts: { [p]: { on: false } }, tag: `${p} off` }); continue; }
                if (p === 'wedo') jobs.push({ p, partOpts: { wedo: { on: false } }, tag: 'wedo off' });
                if (lim.fixed) continue;
                const vals = li < full ? po.offeredValues(lim) : [lim.min, lim.max];
                for (const v of [...new Set(vals)]) if (v !== lim.dflt) jobs.push({ p, v, partOpts: { [p]: { n: v } }, tag: `${p} ${v}` });
            }
            for (const j of jobs) {
                const where = `${where0} ${j.tag}`;
                const b = await build(l.skill, size, j.partOpts); builds++;
                if (b.error) { F('PO-2a', `${where}: ${b.error}`); continue; }
                if (!b.keyLen || !(b.keyPages > 0)) F('PO-2a', `${where}: no answer key`);
                if (!b.sizingOk) F('PO-2a', `${where}: the anchor chart lost its planned size (sizing.ok false)`);
                if (b.pupil === b0.pupil) F('PO-2b', `${where}: the page is the standard page (the count was not applied)`);
                const lim = lims[j.p];
                if (j.v !== undefined) {
                    const want = j.v;
                    const got = j.p === 'prereq' ? b.got.prereq : j.p === 'wedo' ? b.got.wedo : j.p === 'rows' ? (b.got.rowsItems / (lim.perRow || 1)) : j.p === 'practice' ? b.got.practice : undefined;
                    if (got !== undefined && got !== null && got !== want) F('PO-2b', `${where}: printed ${got}, asked ${want}`);
                }
                const m = await measure(b.doc);
                if (m.pages.some((x) => x.over)) F('PO-2c', `${where}: content past its page (overflow or a split cell) on p${m.pages.findIndex((x) => x.over) + 1}`);
                const now = findingsOf(m, where);
                const c = count(now);
                for (const [k, v] of Object.entries(c)) if (v > (base[k] || 0)) F('PO-2d', `${where}: ${k} ${v} finding(s), the standard packet ${base[k] || 0} - ${now.filter((x) => x.key === k).map((x) => x.msg).slice(0, 2).join(' | ')}`);
            }
            if (has('verbose')) console.log(`  [${((Date.now() - T0) / 1000).toFixed(0)} s] ${where0}: ${jobs.length} variants`);
        }
    } finally { await app.close(); }
    const ids = ['PO-2a', 'PO-2b', 'PO-2c', 'PO-2d'];
    for (const id of ids) { const f = fails.filter((x) => x.startsWith(id + ' ')); console.log(`${id} ${f.length ? `FAIL ${f.length}` : 'PASS'}`); for (const x of f.slice(0, 20)) console.log(`   ${x}`); }
    console.log(`(${builds} builds, ${((Date.now() - T0) / 1000).toFixed(0)} s)`);
}

(async () => {
    await unit();
    if (!has('unit')) await browser();
    console.log(fails.length ? `ws-partopts-unit: FAIL (${fails.length})` : 'ws-partopts-unit: OK');
    process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); console.log('ws-partopts-unit: FAIL'); process.exit(1); });
