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
//   LESSON_SIZE_NOTE), Practice 2 pages, the standard packet is built and its parts' limits read (res.lesson.partFit -> partLimits).
//   Then each part at its min and max, each part off, and parts changed TOGETHER (critic A r1 F12: every part at its min; the
//   same with We Do off; Vocabulary 0 with We Do off; Remember off with no lesson rows) are built through the Print screen's
//   own loop - a build returns its limits, the request is normalised to them (a value no longer offered snaps), built again -
//   and the packet that would print is judged ON ITS OWN, never against the standard packet:
//     PO-2a  it builds, its key builds, the anchor chart keeps its planned size (sizing.ok)
//     PO-2b  every count asked is the count printed (Prerequisite questions, We Do cells, lesson rows, Practice / Mixed TOTALS)
//     PO-2c  no overflow: every page's content inside its page, no cell past the page's foot
//     PO-2d  EB-PAGE on EVERY page, each sheet's last page included: 30 % or more of the body empty under its last block fails;
//            the last page of a sheet of 2+ pages fails under half used (H5). EB-BAND / EB-SIDE / EB-EDGE on every cell except
//            a page identical to a standard page, or a cell of the same template, sheet and size the standard packet already
//            draws with that finding (the standard's own defect, critic A r1 F11b - another lane's).
//     PO-2e  coverage (critic A r1 F2): the lesson x size cases offering a real We Do range and a real Practice range (2+ values),
//            against floors (--floor-wedo, --floor-practice; full runs only).
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
    const fit = { prereq: { total: 4 }, chart: { designed: 2, min: 1 }, vocab: { words: 3, values: [1, 2, 3], canOff: true }, remember: { has: true, canOff: true }, wedo: { fit: 3, values: [1, 2, 3], canOff: true }, rows: { fit: 2, perRow: 3, values: [1, 2], canOff: true }, practice: { perPage: 15, cols: 3, rows: 5, minRows: 4, pages: 1 }, mixed: { count: 10 } };
    const lims = po.allPartLimits(fit);
    let n = 0;
    for (const [p, lim] of Object.entries(lims)) {
        const vals = po.offeredValues(lim);
        if (vals.some((v) => v < lim.min || v > lim.max)) F('PO-4', `${p}: offered ${vals} outside [${lim.min}, ${lim.max}]`);
        if (lim.fixed) continue;
        if ((p === 'practice' || p === 'mixed') && vals.some((v) => v % lim.step)) F('PO-4', `${p}: ${vals} not whole rows / pages of ${lim.step}`);
        const lo = po.normalizePartOpts({ [p]: { n: lim.min - 1 } }, lims)[p];
        const hi = po.normalizePartOpts({ [p]: { n: lim.max + 1 } }, lims)[p];
        const offAt0 = ['vocab', 'wedo', 'rows'].includes(p) && lim.min - 1 <= 0;   // (0 = the part's tick off, F4 / F7)
        if (offAt0 ? !(lo && lo.on === false) : (!(lo && lo.n === lim.min) && lim.min !== lim.dflt)) F('PO-4', `${p}: min - 1 normalised to ${JSON.stringify(lo)}, not ${offAt0 ? 'off' : lim.min}`);
        if (hi !== undefined && lim.max === lim.dflt) F('PO-4', `${p}: max + 1 kept as ${JSON.stringify(hi)} (max is the default: nothing stored)`);
        if (Object.keys(po.normalizePartOpts({ [p]: { n: lim.dflt } }, lims)).length) F('PO-4', `${p}: the default count was stored`);
        n++;
    }
    if (Object.keys(po.normalizePartOpts({}, lims)).length || !po.partOptsEmpty({ wedo: {} })) F('PO-4', 'a standard lesson stores something');
    // §8a: Practice and Mixed counts are TOTALS - equal pages of whole rows, the pages follow; an old section's pages x the page
    {
        const pf = { perPage: 15, cols: 3, rows: 5, minRows: 4, pages: 2 };
        const pl = po.partLimits('practice', { fit: { practice: pf } });
        if (pl.dflt !== 30 || pl.values.some((v) => v % 3) || !pl.values.includes(12) || !pl.values.includes(75) || pl.values.includes(27)) F('PO-4', `practice totals ${pl.values} (default ${pl.dflt})`);
        for (const v of pl.values) { const sp = po.practiceSplit(v, pf); if (!sp || sp.pages * sp.per !== v || sp.per > 15 || sp.per < 12) F('PO-4', `practice ${v} splits as ${JSON.stringify(sp)}`); }
        if (JSON.stringify(po.normalizePartOpts({ practice: { n: 27 } }, { practice: pl })) !== JSON.stringify({ practice: { n: 24 } })) F('PO-4', 'practice 27 does not round to 24 (no page under half full)');
        const ml = po.partLimits('mixed', { fit: { mixed: { count: 12 } } });
        if (JSON.stringify(ml.values) !== '[12,24]') F('PO-4', `mixed totals ${ml.values}`);
        // a probed part: only its values; a tick that may not be cleared (the page would not fill) is dropped
        const wl = po.partLimits('wedo', { fit: { wedo: { fit: 3, values: [2, 3], canOff: false } } });
        if (JSON.stringify(po.offeredValues(wl)) !== '[2,3]' || Object.keys(po.normalizePartOpts({ wedo: { on: false } }, { wedo: wl })).length) F('PO-4', 'We Do values / canOff not honoured');
        if (JSON.stringify(po.normalizePartOpts({ wedo: { n: 1 } }, { wedo: wl })) !== JSON.stringify({ wedo: { n: 2 } })) F('PO-4', 'We Do 1 not snapped to 2');
        const rl = po.partLimits('rows', { fit: { rows: { fit: 0, perRow: 3 } } });
        if (!rl.none || rl.canOff !== false || Object.keys(po.normalizePartOpts({ rows: { on: false } }, { rows: rl })).length) F('PO-4', 'rows with no room is not "none" (F7)');
        if (/^\d+ · /.test(po.rangeText('rows', rl)) || !/^Fixed: /.test(po.rangeText('wedo', po.partLimits('wedo', { fit: { wedo: { fit: 3, values: [3] } } })))) F('PO-4', 'a fixed count is not written once as "Fixed: n (...)" (F6)');
    }
    // the save / load round trip: a section's partOpts as JSON, read back, normalised again
    const sec = { role: 'lesson', pages: 2, mixed: true, partOpts: po.normalizePartOpts({ prereq: { n: 2 }, wedo: { n: 2 }, rows: { n: 0 }, remember: { on: false }, practice: { n: 24 }, mixed: { n: 20 }, chart: { on: false } }, lims) };
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
    console.log(`PO-4 ${fails.length ? "FAIL" : "PASS"} (${n} counted parts, save/load, old sections, parts list)`); for (const x of fails) console.log(`   ${x}`);
}

async function browser() {
    const { open } = require('../lib/ws-harness.cjs');
    const { measureCells, judge } = require('./ws-empty-band.cjs');
    const app = await open({ seed: 1 });
    const T0 = Date.now();
    let builds = 0;
    const cover = { cases: 0, wedo: 0, practice: 0, list: [] };
    try {
        const { page, browser } = app;
        let lessons = await page.evaluate(async () => Object.keys((await import('./js/modules/lessons/prereqs.js')).LESSONS));
        lessons = [{ id: 'addition:add_facts (sample)', skill: { categoryId: 'addition', skillId: 'add_facts', opts: { band: 10, constant: [1, 2, 3] } } }]
            .concat(lessons.map((k) => ({ id: k, skill: { categoryId: k.split(':')[0], skillId: k.split(':')[1] } })));
        if (arg('lessons')) lessons = lessons.filter((l) => arg('lessons').split(',').some((x) => l.id.startsWith(x)));
        const sizes = arg('sizes', 'M,L').split(',');
        const onlyParts = arg('parts') ? arg('parts').split(',') : null;
        const onlyCombos = has('combos-only');
        const full = Number(arg('full', 0)) || 0;
        const po = await import(pathToFileURL(path.join(ROOT, 'js/modules/sheet/part-opts.js')).href);
        const PAGES = 2;   // (Practice prints 2 pages, so a total count re-paginates and its last page is judged too)

        const build = (skill, size, partOpts) => page.evaluate(async ({ skill, size, partOpts, PAGES }) => {
            try {
                const r = await window.buildSheet({ role: 'lesson', sections: [{ skills: [skill] }], size, paper: 'A4', seed: 4242, key: true, practicePages: PAGES, mixed: true, partOpts });
                const prac = (r.items || []).filter((it) => it.part === 'practice');
                const mixed = (r.items || []).filter((it) => it.part === 'mixed');
                return {
                    pupil: r.pupilHtml, doc: window.sheetDocument(r.pupilHtml, 'x', { paper: 'A4' }), keyLen: (r.keyHtml || '').length, keyPages: r.keyPageCount, pages: r.pageCount,
                    fit: r.lesson.partFit, sizingOk: !r.chartSizing || r.chartSizing.ok !== false,
                    got: { prereq: r.lesson.prereqCheck ? r.lesson.prereqCheck.length : null, wedo: r.lesson.teach && r.lesson.teach.guided, rowsItems: r.lesson.teach && r.lesson.teach.independent, practice: prac.length || null, mixed: mixed.length || null },
                };
            } catch (e) { return { error: String((e && e.stack) || e).split('\n').slice(0, 2).join(' ') }; }
        }, { skill, size, partOpts, PAGES });

        // render a pupil document; read its cells (ws-empty-band), its overflow, its page fill and each page's own markup hash
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
                    let h = 0; const s = pg.outerHTML; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
                    return { sheet: pg.getAttribute('data-ws-sheet') || '', over: pg.scrollHeight > pg.clientHeight + 2 || cellsOut > 0, empty: Math.round(Math.max(0, br.bottom - last) / br.height * 100), h };
                }));
                // (each cell's own markup and size: a cell drawn exactly as in the standard packet carries the standard's findings)
                const sigs = await sh.evaluate(() => [...document.querySelectorAll('body > section.ws-page, body > .ws-page')].map((rt) => {
                    const visible = (e) => { const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity || '1') > 0.05; };
                    return [...rt.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]') && visible(c)).map((c) => {
                        const r = c.getBoundingClientRect(); let h = 0; const s = c.innerHTML; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
                        return `${h}|${Math.round(r.width)}|${Math.round(r.height)}`;
                    });
                }));
                return { cells, pages, sigs };
            } finally { await sh.close(); }
        };
        // F12 (critic A r1): EVERY page judged on its own, the last page of each sheet included - never against the standard
        // packet. EB-PAGE: a page 30 % or more empty under its last block fails; the last page of a sheet of 2 or more pages
        // fails under half used (H5). EB-BAND / EB-SIDE / EB-EDGE: absolute, on every cell not drawn exactly (same markup, same size) as a
        // cell of the standard packet (an unchanged cell is the standard packet's, graded by its own lane - critic A r1 F11b).
        const cellKey = (m, c, rule) => `${(m.pages[c.page - 1] || {}).sheet}|${rule}|${c.tmpl}|${Math.round(c.wMm)}|${rule === 'EB-BAND' ? Math.round(c.hMm) : ''}`;
        const stdKeys = (m) => { const out = new Set(); for (const c of m.cells) judge([c], '', (rule) => out.add(cellKey(m, c, rule)), 'lesson'); return out; };
        const findingsOf = (m, where, std) => {
            const out = [];
            const changed = (pi) => !std || !std.pages.has((m.pages[pi - 1] || {}).h);
            for (const c of m.cells) {
                if (!changed(c.page)) continue;
                judge([c], where, (rule, w, msg) => {
                    if (!['EB-BAND', 'EB-SIDE', 'EB-EDGE'].includes(rule)) return;
                    // (a cell of the same template, sheet and size that the STANDARD packet already draws with this finding is the
                    // standard's own defect - critic A r1 F11b, another lane's - not one a count made)
                    if (std && std.cellKeys.has(cellKey(m, c, rule))) return;
                    out.push(`${rule} ${w}: ${msg}`);
                }, 'lesson');
            }
            m.pages.forEach((p, i) => {
                const nx = m.pages[i + 1], pv = m.pages[i - 1];
                const lastOfMany = (!nx || nx.sheet !== p.sheet) && pv && pv.sheet === p.sheet;
                const lim = lastOfMany ? 50 : 30;
                if (p.empty >= lim && changed(i + 1)) out.push(`EB-PAGE ${where} p${i + 1} (${p.sheet || 'sheet'}): ${p.empty} % of the page body empty under its last block (limit ${lim} %${lastOfMany ? ', the last page of its sheet: H5 half used' : ''})`);
            });
            return out;
        };
        // The Print screen's loop (teacher-print.js runBuild): a build returns its parts' limits, the section's partOpts are
        // normalised to them (a value no longer offered snaps to one that is) and the packet is built again.
        const settle = async (skill, size, want) => {
            let cur = po.normalizePartOpts(want, null), b = null;
            for (let k = 0; k < 4; k++) {
                b = await build(skill, size, Object.keys(cur).length ? cur : undefined); builds++;
                if (b.error) return { b, cur };
                const next = po.normalizePartOpts(cur, po.allPartLimits(b.fit));
                if (JSON.stringify(next) === JSON.stringify(cur)) break;
                cur = next;
            }
            return { b, cur };
        };

        for (const [li, l] of lessons.entries()) for (const size of sizes) {
            const where0 = `${l.id} ${size}`;
            const b0 = await build(l.skill, size, undefined); builds++;
            if (b0.error) { F('PO-2a', `${where0} standard packet: ${b0.error}`); continue; }
            const m0 = await measure(b0.doc);
            const std = { pages: new Set(m0.pages.map((p) => p.h)), cellKeys: stdKeys(m0) };
            const lims = po.allPartLimits(b0.fit);
            // (F2 coverage: a real range - two values or more - on We Do and on Practice)
            cover.cases++;
            const nv = (p) => (lims[p] ? po.offeredValues(lims[p]).length : 0);
            if (nv('wedo') >= 2) cover.wedo++;
            if (nv('practice') >= 2) cover.practice++;
            cover.list.push(`${where0}: wedo ${lims.wedo ? po.offeredValues(lims.wedo).join('/') : '-'} · practice ${lims.practice ? po.offeredValues(lims.practice).join('/') : '-'}`);
            const jobs = [];
            if (!onlyCombos) for (const [p, lim] of Object.entries(lims)) {
                if (onlyParts && !onlyParts.includes(p)) continue;
                if (lim.toggle) { jobs.push({ p, partOpts: { [p]: { on: false } }, tag: `${p} off` }); continue; }
                if (['vocab', 'wedo', 'rows'].includes(p) && !lim.none) jobs.push({ p, partOpts: { [p]: { on: false } }, tag: `${p} off` });
                if (lim.fixed) continue;
                const vals = li < full ? po.offeredValues(lim) : [lim.min, lim.max];
                for (const v of [...new Set(vals)]) if (v !== lim.dflt) jobs.push({ p, v, partOpts: { [p]: { n: v } }, tag: `${p} ${v}` });
            }
            // (F12: parts changed TOGETHER - every part at its min; the same with We Do off; Vocabulary 0 with We Do off;
            // Remember off with no lesson rows)
            const allMin = {};
            for (const [p, lim] of Object.entries(lims)) if (lim.toggle || (['vocab', 'rows'].includes(p) && !lim.none)) allMin[p] = { on: false }; else if (!lim.fixed) allMin[p] = { n: lim.min };
            jobs.push({ partOpts: allMin, tag: 'everything at min' });
            jobs.push({ partOpts: Object.assign({}, allMin, { wedo: { on: false } }), tag: 'everything at min, We Do off' });
            if (lims.vocab && lims.wedo) jobs.push({ partOpts: { vocab: { n: 0 }, wedo: { on: false } }, tag: 'Vocabulary 0, We Do off' });
            if (lims.remember && lims.rows) jobs.push({ partOpts: { remember: { on: false }, rows: { n: 0 } }, tag: 'Remember off, rows 0' });
            for (const j of jobs) {
                const { b, cur } = await settle(l.skill, size, j.partOpts);
                const where = `${where0} ${j.tag}${JSON.stringify(cur) !== JSON.stringify(po.normalizePartOpts(j.partOpts, null)) ? ` (offered: ${JSON.stringify(cur)})` : ''}`;
                if (b.error) { F('PO-2a', `${where}: ${b.error}`); continue; }
                if (!b.keyLen || !(b.keyPages > 0)) F('PO-2a', `${where}: no answer key`);
                if (!b.sizingOk) F('PO-2a', `${where}: the anchor chart lost its planned size (sizing.ok false)`);
                if (!Object.keys(cur).length) continue;   // (snapped back to the standard packet: nothing new to judge)
                const lim2 = po.allPartLimits(b.fit);
                for (const [p, v] of Object.entries(cur)) {
                    if (!Number.isFinite(v.n)) continue;
                    const lim = lim2[p] || {};
                    const got = p === 'prereq' ? b.got.prereq : p === 'wedo' ? b.got.wedo : p === 'rows' ? (b.got.rowsItems / (lim.perRow || 1)) : p === 'practice' ? b.got.practice : p === 'mixed' ? b.got.mixed : undefined;
                    if (got !== undefined && got !== null && got !== v.n) F('PO-2b', `${where}: ${p} printed ${got}, asked ${v.n}`);
                }
                const m = await measure(b.doc);
                if (m.pages.some((x) => x.over)) F('PO-2c', `${where}: content past its page (overflow or a split cell) on p${m.pages.findIndex((x) => x.over) + 1}`);
                for (const x of findingsOf(m, where, std)) F('PO-2d', x);
            }
            if (has('verbose')) console.log(`  [${((Date.now() - T0) / 1000).toFixed(0)} s] ${where0}: ${jobs.length} variants`);
        }
    } finally { await app.close(); }
    const ids = ['PO-2a', 'PO-2b', 'PO-2c', 'PO-2d'];
    for (const id of ids) { const f = fails.filter((x) => x.startsWith(id + ' ')); console.log(`${id} ${f.length ? `FAIL ${f.length}` : 'PASS'}`); for (const x of f.slice(0, Number(arg('show', 25)))) console.log(`   ${x}`); }
    // F2 (critic A r1): how many lesson x size cases offer a real We Do range and a real Practice range (2 values or more)
    const floorW = Number(arg('floor-wedo', 0.4)), floorP = Number(arg('floor-practice', 0.9));
    const cw = cover.cases ? cover.wedo / cover.cases : 1, cp = cover.cases ? cover.practice / cover.cases : 1;
    if (has('verbose')) for (const x of cover.list) console.log(`   ${x}`);
    const covOk = !cover.cases || arg('lessons') || (cw >= floorW && cp >= floorP);
    console.log(`PO-2e ${covOk ? 'PASS' : 'FAIL'} coverage: We Do range ${cover.wedo}/${cover.cases}, Practice range ${cover.practice}/${cover.cases} (floors ${Math.round(floorW * 100)} % / ${Math.round(floorP * 100)} %)`);
    if (!covOk) fails.push('PO-2e coverage under its floor');
    console.log(`(${builds} builds, ${((Date.now() - T0) / 1000).toFixed(0)} s)`);
}

(async () => {
    await unit();
    if (!has('unit')) await browser();
    console.log(fails.length ? `ws-partopts-unit: FAIL (${fails.length})` : 'ws-partopts-unit: OK');
    process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); console.log('ws-partopts-unit: FAIL'); process.exit(1); });
