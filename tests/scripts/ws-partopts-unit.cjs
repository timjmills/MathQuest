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
    // (critic A r2 N4) a Vocabulary match of one pair is no task: 1 is never offered
    {
        const vl = po.partLimits('vocab', { fit: { vocab: { words: 3, values: [1, 2, 3], canOff: true } } });
        if (po.offeredValues(vl).includes(1)) F('PO-4', `N4: Vocabulary offers ${po.offeredValues(vl)} - a one-pair match`);
        const vl2 = po.partLimits('vocab', { fit: { vocab: { words: 3 } } });
        if (po.offeredValues(vl2).includes(1)) F('PO-4', `N4: Vocabulary (unprobed) offers ${po.offeredValues(vl2)}`);
    }
    // (critic A r2 N6) one form of range text: no "<n> a page" on a total
    {
        const ml = po.partLimits('mixed', { fit: { mixed: { count: 15 } } });
        const t = po.partRowText ? po.partRowText('mixed', ml, 15) : po.rangeText('mixed', ml);
        if (/\d+ a page\b/.test(t)) F('PO-4', `N6: the Mixed range reads "${t}"`);
    }
    console.log(`PO-4 ${fails.length ? "FAIL" : "PASS"} (${n} counted parts, save/load, old sections, parts list)`); for (const x of fails) console.log(`   ${x}`);
}

async function browser() {
    const { open } = require('../lib/ws-harness.cjs');
    const { measureCells, judge } = require('./ws-empty-band.cjs');
    const app = await open({ seed: 1 });
    const T0 = Date.now();
    let builds = 0;
    const cover = { cases: 0, wedo: 0, practice: 0, list: [] };
    const walk = { cases: 0, states: 0 };
    // (the lessons critic A r2 graded: always walked)
    const MUST_WALK = ['number_sense:nearest_10', 'addition:add_wp_10', 'subtraction:sub_10k_no_regroup', 'addition:add_facts'];
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
                // (EB-ROWFIT: the shortest whole row of this lesson's own sheet items at c across - the ic shortest measured
                // heights, the tallest of them - read from the bridge's measurements, not from the planner under test)
                const teachIts = (r.items || []).filter((it) => it.part === 'teach' && it.measured && !/^lesson/.test(it.template || ''));
                const rowH = {};
                for (const c of [1, 2, 3, 4]) { const hs = teachIts.map((it) => it.measured[c] && it.measured[c].fits !== false ? it.measured[c].hMm : null).filter((h) => h > 0).sort((a, b) => a - b); if (hs.length >= c) rowH[c] = hs[c - 1]; }
                const L = await import('./js/modules/lessons/prereqs.js');
                const ld = L.lessonFor(skill.categoryId, skill.skillId) || {};
                const remTexts = [ld.concepts && ld.concepts[0] && ld.concepts[0].text, ld.chant, r.lesson.chant].filter((x) => typeof x === 'string' && x.trim().length >= 6);
                return {
                    rowH, remTexts,
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
                    const strips = [...pg.querySelectorAll('.ws-strip')].map((x) => x.getBoundingClientRect().height).filter((x) => x > 0);
                    const sheet = pg.getAttribute('data-ws-sheet') || '';
                    const labels = [...pg.querySelectorAll('.ws-strip > b')].map((x) => x.textContent.trim());
                    return { sheet, over: pg.scrollHeight > pg.clientHeight + 2 || cellsOut > 0, empty: Math.round(Math.max(0, br.bottom - last) / br.height * 100), h,
                        emptyMm: +(Math.max(0, br.bottom - last) / (96 / 25.4)).toFixed(1), stripMm: strips.length ? +(Math.max(...strips) / (96 / 25.4)).toFixed(1) : 0,
                        indep: labels.includes('Independent Practice:'), text: sheet === 'lesson-sheet' ? pg.textContent.replace(/\s+/g, ' ') : '' };
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

        // ---------------------------------------------------------------- N7: the screen's own step walk (critic A r2)
        // From the standard packet, every single change the Print screen OFFERS (each stepper -1 / +1 over its values, 0 = the
        // tick off where the part may be off; each tick on / off), the screen's settle loop at every node, breadth-first to
        // --walk-depth (3), de-duplicated by the settled partOpts. Depth 1 changes every part; deeper steps change the lesson
        // SHEET's parts (Vocabulary, Remember, We Do, rows: the parts that share one page) - the chart, Prerequisite Check,
        // Practice and Mixed are their own sheets, whose limits do not move with the others (PO-2 above builds their min / max).
        // Practice and Mixed keep their pages on (the unit prints 2 Practice pages and Mixed; their ticks are the screen's).
        const SHEET_P = ['vocab', 'remember', 'wedo', 'rows'];
        const ZERO_P = new Set(['vocab', 'wedo', 'rows', 'practice', 'mixed']);
        const stepVals = (p, lim, unitOff) => { const v = po.offeredValues(lim); return ZERO_P.has(p) && lim.canOff !== false && !lim.none && !(unitOff && (p === 'practice' || p === 'mixed')) ? [0, ...v.filter((x) => x > 0)] : v; };
        const isOn = (cur, p) => !(cur[p] && (cur[p].on === false || cur[p].n === 0));
        const countOf = (cur, p, lim) => { if (ZERO_P.has(p) && !isOn(cur, p)) return 0; const v = cur[p] && Number.isFinite(cur[p].n) ? cur[p].n : lim.dflt; return po.offeredValues(lim).includes(v) ? v : lim.dflt; };
        const movesOf = (cur, lims, depth) => {
            const out = [];
            for (const [p, lim] of Object.entries(lims)) {
                if (depth > 0 && !SHEET_P.includes(p)) continue;
                if (lim.none) continue;
                const set = (o) => { const n = JSON.parse(JSON.stringify(cur)); if (o === null) delete n[p]; else n[p] = o; return { tag: '', po: po.normalizePartOpts(n, lims) }; };
                if (lim.toggle) { if (!isOn(cur, p)) out.push(Object.assign(set(null), { tag: `${p} on` })); else if (lim.canOff !== false) out.push(Object.assign(set({ on: false }), { tag: `${p} off` })); continue; }
                if (p === 'practice' || p === 'mixed') { /* (their ticks turn pages off: not this sheet) */ }
                else if (!isOn(cur, p)) out.push(Object.assign(set(null), { tag: `${p} tick on` }));
                else if (lim.canOff !== false) out.push(Object.assign(set({ on: false }), { tag: `${p} tick off` }));
                const vals = stepVals(p, lim, true);
                if (vals.length <= 1) continue;
                let at = vals.indexOf(countOf(cur, p, lim)); if (at < 0) at = vals.length - 1;
                for (const d of [-1, 1]) {
                    const k = at + d; if (k < 0 || k >= vals.length) continue;
                    out.push(Object.assign(vals[k] === 0 ? set({ on: false }) : set({ n: vals[k] }), { tag: `${p} ${d < 0 ? '-' : '+'} (${vals[k]})` }));
                }
            }
            return out;
        };
        // The screen's texts (teacher-print.js partsHTML): the lesson sheet's caption and each row's How many text. (Read from
        // part-opts.js where it writes them; else the d6f22be screen's own wording - the state the critic graded.)
        const pagesNoteOf = (p, lim, n) => { const tp = n > 0 ? po.totalPages(p, n, lim) : null; return tp ? `${tp.pages} page${tp.pages === 1 ? '' : 's'} of ${tp.per}` : ''; };
        const textsOf = (fit, lims, cur) => {
            const cap = po.sheetCaption ? po.sheetCaption(fit) : 'Vocabulary, Remember, We Do and practice rows: one page';
            const rows = {};
            for (const [p, lim] of Object.entries(lims)) {
                const n = countOf(cur, p, lim);
                if (po.partRowText) { rows[p] = po.partRowText(p, lim, n); continue; }
                if (lim.none) { rows[p] = po.rangeText(p, lim); continue; }
                if (lim.toggle) { rows[p] = ''; continue; }
                const vals = stepVals(p, lim, false);
                if (vals.length <= 1) { rows[p] = po.rangeText(p, lim); continue; }
                const pn = p === 'practice' || p === 'mixed' ? pagesNoteOf(p, lim, n) : '';
                rows[p] = (lim.fixed ? `${lim.dflt}, or 0 to leave it off` : po.rangeText(p, lim)) + (pn ? ` · ${pn}` : '');
            }
            return { cap, rows };
        };
        const WORD_N = { one: 1, two: 2, three: 3, four: 4, five: 5 };
        const pagesSaid = (t) => { const a = /\bone page\b/.exec(t); if (a) return 1; const b = /\b(\d+|two|three|four|five) pages\b/.exec(t); return b ? (WORD_N[b[1]] || Number(b[1])) : null; };
        // every new check of critic A r2 on one settled state (the standard packet included: the screen's texts are this lane's)
        const judgeWalk = (where, b, cur, m, std, rowH) => {
            const lims = po.allPartLimits(b.fit);
            const sheetPgs = m.pages.map((x, i) => Object.assign({ i }, x)).filter((x) => x.sheet === 'lesson-sheet');
            const lastSheet = sheetPgs[sheetPgs.length - 1];
            const changed = (pg) => !std.pages.has(pg.h);
            const perRow = (lims.rows && lims.rows.perRow) || (b.fit.rows && b.fit.rows.perRow) || 1;
            const rowNeed = rowH[perRow] ? +(rowH[perRow] + (lastSheet ? lastSheet.stripMm : 0)).toFixed(1) : null;
            const rowsPrinted = Math.round((b.got.rowsItems || 0) / perRow);
            // (b) EB-ROWFIT: no lesson rows (0, off, or "no room") yet the sheet's foot holds a whole Independent row and its band head
            if (lastSheet && rowNeed && rowsPrinted === 0 && lastSheet.emptyMm >= rowNeed && changed(lastSheet)) F('EB-ROWFIT', `${where} p${lastSheet.i + 1}: no lesson rows, yet ${lastSheet.emptyMm} mm of the foot is empty - one Independent row and its head is ${rowNeed} mm`);
            // (c) "no room" is true: the screen says the rows have no room only where a row does not fit
            if (lims.rows && lims.rows.none && /no room/.test(po.rangeText('rows', lims.rows)) && lastSheet && rowNeed && lastSheet.emptyMm >= rowNeed) F('PO-NOROOM', `${where}: rows "${po.rangeText('rows', lims.rows)}", yet ${lastSheet.emptyMm} mm is empty at the sheet's foot and one row with its head is ${rowNeed} mm`);
            // (d) Remember off: neither the Remember line nor the rule prints anywhere on the lesson sheet
            if (cur.remember && cur.remember.on === false) for (const t of b.remTexts) if (sheetPgs.some((x) => x.text.includes(t.replace(/\s+/g, ' ').trim()))) F('PO-REM', `${where}: Remember is off, yet the lesson sheet prints "${t}"`);
            // (f) N4: no one-pair match
            if (lims.vocab && po.offeredValues(lims.vocab).includes(1)) F('PO-VOC', `${where}: Vocabulary offers 1 word - a one-pair "Draw a line to match"`);
            if (cur.vocab && cur.vocab.n === 1) F('PO-VOC', `${where}: Vocabulary prints 1 pair`);
            // (e) the screen's texts tell the truth about pages
            const tx = textsOf(b.fit, lims, cur);
            const said = pagesSaid(tx.cap);
            if (said !== sheetPgs.length) F('PO-CAP', `${where}: the lesson sheet caption "${tx.cap}" - the sheet prints on ${sheetPgs.length} page${sheetPgs.length === 1 ? '' : 's'}`);
            if (sheetPgs.length > 1 && lastSheet.empty >= 50 && !/under half/.test(tx.cap)) F('PO-CAP', `${where}: the lesson sheet's last page is ${lastSheet.empty} % empty, the caption does not say so ("${tx.cap}")`);
            if (/under half/.test(tx.cap) && !(sheetPgs.length > 1 && lastSheet.empty >= 40)) F('PO-CAP', `${where}: the caption says "under half" - the last page is ${lastSheet ? lastSheet.empty : '-'} % empty`);
            for (const [p, t] of Object.entries(tx.rows)) {
                const sheetOf = p === 'practice' ? 'lesson-practice' : p === 'mixed' ? 'lesson-mixed' : p === 'chart' ? 'lesson-chart' : p === 'prereq' ? null : 'lesson-sheet';
                const pgs = sheetOf ? m.pages.map((x, i) => Object.assign({ i }, x)).filter((x) => x.sheet === sheetOf) : [];
                if (/fills the page/.test(t) && !(pgs.length === 1 && pgs[0].empty < 30)) F('PO-CAP', `${where} ${p}: "${t}" - its sheet prints ${pgs.length} page(s), the last ${pgs.length ? pgs[pgs.length - 1].empty : '-'} % empty`);
                if (/\d+ a page\b/.test(t)) F('PO-CAP', `${where} ${p}: "${t}" (N6: "a page" on a total)`);
                if ((p === 'practice' || p === 'mixed') && pgs.length) {
                    const s2 = pagesSaid(t.replace(/\b1 page\b/, 'one page'));
                    if (s2 !== pgs.length) F('PO-CAP', `${where} ${p}: "${t}" - it prints on ${pgs.length} page${pgs.length === 1 ? '' : 's'}`);
                    const lastP = pgs[pgs.length - 1];
                    if (pgs.length > 1 && lastP.empty >= 50 && !/under half/.test(t)) F('PO-CAP', `${where} ${p}: its last page is ${lastP.empty} % empty, "${t}" does not say so`);
                }
                // (g) one form: a part whose stepper reaches 0 says "or 0 to leave it off"
                if (ZERO_P.has(p) && !lims[p].none && stepVals(p, lims[p], false)[0] === 0 && stepVals(p, lims[p], false).length > 1 && !/or 0 to leave it off/.test(t)) F('PO-CAP', `${where} ${p}: "${t}" - its stepper reaches 0 and the text does not say "or 0 to leave it off" (N6)`);
            }
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
            // N7 walk (sampled: --walk-lessons, default every lesson; the four the critic named are always walked)
            const walkHere = !has('no-walk') && (!arg('walk-lessons') || MUST_WALK.some((x) => l.id.startsWith(x)) || arg('walk-lessons').split(',').some((x) => l.id.startsWith(x)));
            let walked = 0;
            if (walkHere) {
                const D = Number(arg('walk-depth', 3));
                const seen = new Map([['{}', 0]]);
                let frontier = [{ cur: {}, b: b0, lims, path: 'standard' }];
                judgeWalk(`${where0} [walk] standard`, b0, {}, m0, std, b0.rowH);
                for (let d = 0; d < D && frontier.length; d++) {
                    const next = [];
                    for (const node of frontier) for (const mv of movesOf(node.cur, node.lims, d)) {
                        const k0 = JSON.stringify(mv.po);
                        if (seen.has(k0)) continue;
                        seen.set(k0, d + 1);
                        const { b, cur } = await settle(l.skill, size, mv.po);
                        const k = JSON.stringify(cur);
                        const path = `${node.path} > ${mv.tag}`;
                        const where = `${where0} [walk] ${path}${k !== k0 ? ` (settled: ${k})` : ''}`;
                        if (b.error) { F('PO-2a', `${where}: ${b.error}`); continue; }
                        if (k !== k0 && seen.has(k) && k !== '{}') continue;
                        seen.set(k, d + 1);
                        if (k === '{}') continue;
                        walked++;
                        if (!b.keyLen || !(b.keyPages > 0)) F('PO-2a', `${where}: no answer key`);
                        if (!b.sizingOk) F('PO-2a', `${where}: the anchor chart lost its planned size (sizing.ok false)`);
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
                        judgeWalk(where, b, cur, m, std, b0.rowH);
                        // (deeper steps grow from lesson-sheet changes only: a chart / Practice / Mixed change is a leaf)
                        if (SHEET_P.some((x) => mv.tag.startsWith(x + ' '))) next.push({ cur, b, lims: lim2, path });
                    }
                    frontier = next;
                }
                walk.states += walked; walk.cases++;
            }
            if (has('verbose')) console.log(`  [${((Date.now() - T0) / 1000).toFixed(0)} s] ${where0}: ${jobs.length} variants, ${walked} walked states`);
        }
    } finally { await app.close(); }
    const ids = ['PO-2a', 'PO-2b', 'PO-2c', 'PO-2d', 'EB-ROWFIT', 'PO-NOROOM', 'PO-REM', 'PO-CAP', 'PO-VOC'];
    console.log(`PO-2w walk: ${walk.states} settled states beyond the standard packet in ${walk.cases} lesson x size cases (depth ${arg('walk-depth', 3)})`);
    for (const id of ids) { const f = fails.filter((x) => x.startsWith(id + ' ')); console.log(`${id} ${f.length ? `FAIL ${f.length}` : 'PASS'}`); for (const x of f.slice(0, Number(arg('show', 25)))) console.log(`   ${x}`); }
    // F2 (critic A r1): how many lesson x size cases offer a real We Do range and a real Practice range (2 values or more)
    // PO-2e We Do floor = the measured 7/52 (lead, 2026-11-13): a ratchet, raise it only (a wider We Do layout is its own entry).
    const floorW = Number(arg('floor-wedo', 7 / 52)), floorP = Number(arg('floor-practice', 0.9));
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
