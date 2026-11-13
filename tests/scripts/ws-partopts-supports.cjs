#!/usr/bin/env node
// ws-partopts-supports — the gate of lane lf-partopts STEP B (design/partopts/DESIGN.md §2, §5 PO-3 / PO-5, §7): the
// supports of each lesson part and of the Practice and Quiz papers.
//
//   node tests/scripts/ws-partopts-supports.cjs --unit            # the pure checks (no browser, < 2 s)
//   node tests/scripts/ws-partopts-supports.cjs                   # + the browser checks (3 lessons, about 10 min)
//   node tests/scripts/ws-partopts-supports.cjs --lessons subtraction:sub_100_regroup --sizes M --only PO-5
//   node tests/scripts/ws-partopts-supports.cjs --ui              # the Print screen's Supports panel and the Quiz sheet
//
// PURE (--unit, and first in every run):
//   PO-SUP    resolveSupports (sheet/part-opts.js) is the PAGE_TYPES fade at the standard: every declared support ticked, no
//             `off`, no band off, nothing changed; a delta turns exactly its ids off; a support the step NEEDS ticked off gives
//             its warning and still resolves the values to print (a warning, never a block, §2.4); every structure off gives
//             "No structure left"; an option-backed hint follows the skill's own tick, so the QUIZ's hints are off by
//             default (owner answer 3); the panel's ticks write back only what differs (the standard writes nothing).
//   PO-SUPN   storage: partOpts carries a part's `opts` / `bands` through normalizePartOpts and a JSON save / load; unknown ids
//             are dropped; a supports-only delta is not the standard packet; partOpts at the standard is {}.
//   PO-4S     share codes: the universal option `off` exists on every skill, is HIDDEN (never a control), defaults to empty and
//             has an appended codec key and value tokens: a skill at its defaults encodes byte-identically (no payload), an
//             `off` value round-trips through skill-option-codec.
//   PO-SIZE   the per-size offer gate (lead): mult_properties band 36 ("offered at S, pending re-measure") is offered at S
//             only - offeredOptionsFor at M / L leaves it out, at S keeps it, with no size every value is offered; a choice of
//             it at M goes back to the default with its reason (gateBySize), at S it stays.
// BROWSER (the app's own buildSheet, seeded; every page judged ON ITS OWN):
//   PO-5      declarations: every lesson build reports what each part's items draw (res.lesson.partSup) and a paper's
//             (print-sheet.js paperSupportDecl); every declared id, turned off (a hint: on), changes that part's pupil
//             pages AND its key, and no other sheet (a part's delta is its own); every `needs` id is declared.
//   PO-3      the sampler: per lesson, every single tick and an all-pairs cover of the declared ticks x the Practice count
//             {min, standard, max} x size {M, L} (deterministic, greedy pairs). Each state: it builds; the supports asked are
//             the supports printed (a mark turned off is gone from its part's pages, a band off is gone); no overflow and
//             no EB-PAGE / EB-BAND that the standard packet does not already have (ws-empty-band's judge); nothing given away
//             (no answer slot inked on the pupil page beyond the standard's); key parity (per sheet, the key has the pupil
//             page's cells and the same support marks).
//   PO-PS     paper = screen: an item whose skill turns the regroup boxes off has none on paper and none on the practice card,
//             the online worksheet or the quiz (screen-cell.js kindHTML with screenOffFor); with the default it has them on
//             both; and the four screen hosts pass the skill's `off`.
// UI (--ui; the Print screen and the Quiz sheet at 1280 and 390):
//   PO-UI     every part with declared supports shows a Supports chip (a button, aria-expanded) reading "Standard: ..."; a part
//             with none reads "None to choose"; the panel lists only declared ids grouped Structure / Hints / On the page;
//             unticking a needed support shows its warning and the chip "Custom: 1 off", Print stays enabled, and the
//             rebuilt preview's part has no such mark; at 390 nothing scrolls sideways and every panel control is >= 44 px;
//             the Quiz sheet lists each skill's supports with its hints unticked by default and the hints line when ticked.
//
//   --only ID,...   count only these findings (a check id, e.g. PO-5, PO-3, PO-SIZE)
//   MQ_ROOT=<tree>  build and judge another checkout (ws-backtest commit-pair rows); this script is always today's.
// A missing feature is a finding (FAIL), never an ERROR: on the tree before step B every check FAILS. A crash prints
// `ws-partopts-supports: ERROR (...)` and exits 2.
// Prints `ws-partopts-supports: OK` / `FAIL (n)`; exits 1 on FAIL.
'use strict';
const path = require('path');
const { pathToFileURL } = require('url');

const argv = process.argv.slice(2);
const has = (k) => argv.includes('--' + k);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const HERE = path.resolve(__dirname, '..', '..');
const ROOT = process.env.MQ_ROOT ? path.resolve(process.env.MQ_ROOT) : HERE;
const ONLY = arg('only') ? arg('only').split(',').map((x) => x.trim()).filter(Boolean) : null;
const want = (id) => !ONLY || ONLY.includes(id);
const fails = [];
const errors = [];
const F = (id, msg) => { if (want(id)) fails.push(`${id} ${msg}`); };
const ok = (id, cond, msg) => { if (!cond) F(id, msg); return !!cond; };
const LESSONS = arg('lessons', 'subtraction:sub_100_regroup,addition:add_facts,placevalue:identify').split(',').map((x) => x.trim()).filter((x) => x && x !== 'none');   // ('none': no lesson - the paper and screen checks only)
const SIZES = arg('sizes', 'M,L').split(',');
const imp = (rel) => import(pathToFileURL(path.join(ROOT, rel)).href);
const J = JSON.stringify;

/* ===================================================================================== pure */
async function unit() {
    const mem = {};
    globalThis.localStorage = globalThis.localStorage || { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } };
    const quiet = console.log; console.log = () => {};
    let P, SO, C, K;
    try { P = await imp('js/modules/sheet/part-opts.js'); SO = await imp('js/modules/skill-options.js'); C = await imp('js/modules/skill-option-codec.js'); K = await imp('js/modules/skill-option-keys.js'); } finally { console.log = quiet; }
    const need = (id, names) => { const miss = names.filter((n) => typeof P[n] === 'undefined'); if (miss.length) F(id, `part-opts.js has no ${miss.join(', ')} (step B not built)`); return !miss.length; };

    /* ---- PO-SUP */
    if (want('PO-SUP') && need('PO-SUP', ['resolveSupports', 'supportsChip', 'supDeltaFromTicks', 'NEEDS_TEXT', 'NO_STRUCTURE_TEXT', 'PART_LEVEL'])) {
        const decl = [
            { id: 'regroup', kind: 'structural', from: 'role', needs: true },
            { id: 'heads', kind: 'structural', from: 'role' },
            { id: 'firststep', kind: 'hint', from: 'role' },
            { id: 'touch', kind: 'hint', from: { option: 'support', value: 'touch' } },
            { id: 'steps', kind: 'band', from: 'band' },
        ];
        const std = P.resolveSupports(decl, P.PART_LEVEL.wedo, null, {});
        ok('PO-SUP', std.off.length === 0 && !Object.keys(std.bands).length && std.changed === 0 && !std.warnings.length, `the standard resolves to nothing off: ${J(std)}`);
        ok('PO-SUP', std.ticks.regroup && std.ticks.heads && std.ticks.firststep && std.ticks.steps && std.ticks.touch === false, `the standard ticks (structure, role hints, bands on; an option hint the skill does not have, off): ${J(std.ticks)}`);
        ok('PO-SUP', /^Standard/.test(P.supportsChip(decl, std)), `the standard chip: "${P.supportsChip(decl, std)}"`);
        ok('PO-SUP', P.supDeltaFromTicks(decl, std.ticks, std.std) === null, 'the standard ticks write a delta');
        const r1 = P.resolveSupports(decl, 2, { opts: { off: ['regroup'] } }, {});
        ok('PO-SUP', J(r1.off) === J(['regroup']) && r1.changed === 1, `off regroup: ${J(r1)}`);
        ok('PO-SUP', r1.warnings.includes(P.NEEDS_TEXT.regroup), `a needed support off gives its warning (§2.4): ${J(r1.warnings)}`);
        ok('PO-SUP', /Custom: 1 off/.test(P.supportsChip(decl, r1)), `the chip after one off: "${P.supportsChip(decl, r1)}"`);
        const r2 = P.resolveSupports(decl, 2, { opts: { off: ['regroup', 'heads'] } }, {});
        ok('PO-SUP', r2.warnings.includes(P.NO_STRUCTURE_TEXT) && J(r2.off) === J(['regroup', 'heads']), `every structure off: "${P.NO_STRUCTURE_TEXT}" and the values still print: ${J(r2)}`);
        const quiz = P.resolveSupports(decl, P.PART_LEVEL.quiz, null, {});
        ok('PO-SUP', P.PART_LEVEL.quiz === 0 && quiz.ticks.touch === false, `quiz hints off by default (owner answer 3): ${J(quiz.ticks)}`);
        const own = P.resolveSupports(decl, 1, null, { support: ['touch'] });
        ok('PO-SUP', own.ticks.touch === true && own.changed === 0, 'an option hint the skill ticks is the standard');
        const on = P.resolveSupports(decl, 0, { opts: { support: ['touch'] } }, {});
        ok('PO-SUP', J(on.opts.support) === J(['touch']) && on.changed === 1, `a hint ticked on a quiz prints it: ${J(on)}`);
        const bandOff = P.resolveSupports(decl, 1, { bands: { steps: false } }, {});
        ok('PO-SUP', bandOff.bands.steps === false && bandOff.off.length === 0, `a band off: ${J(bandOff)}`);
        const back = P.supDeltaFromTicks(decl, r1.ticks, r1.std);
        ok('PO-SUP', back && J(back.opts.off) === J(['regroup']) && !back.bands, `the ticks write back their delta: ${J(back)}`);
        ok('PO-SUP', J(P.PART_LEVEL) && P.PART_LEVEL.chart === 3 && P.PART_LEVEL.wedo === 2 && P.PART_LEVEL.practice === 1 && P.PART_LEVEL.prereq === 0, `the §2.3 fade: ${J(P.PART_LEVEL)}`);
        console.log(`PO-SUP ${fails.some((f) => f.startsWith('PO-SUP ')) ? 'FAIL' : 'PASS'}`);
    }

    /* ---- PO-SUPN */
    if (want('PO-SUPN') && need('PO-SUPN', ['normalizeSupDelta', 'withSupDelta'])) {
        const po = { wedo: { opts: { off: ['firststep', 'nonsense'] } }, practice: { opts: { off: ['regroup'], support: ['touch'], cover: 'fade' }, bands: { steps: false, bogus: false } }, chart: { bands: { say: false } }, sheet: { opts: { off: ['heads'] } } };
        const n = P.normalizePartOpts(po, null);
        ok('PO-SUPN', n.wedo && J(n.wedo.opts) === J({ off: ['firststep'] }), `wedo kept, unknown id dropped: ${J(n.wedo)}`);
        ok('PO-SUPN', n.practice && J(n.practice.bands) === J({ steps: false }) && J(n.practice.opts) === J({ off: ['regroup'], support: ['touch'], cover: 'fade' }), `practice opts and bands: ${J(n.practice)}`);
        ok('PO-SUPN', n.chart && n.chart.bands && n.chart.bands.say === false, `chart Say off: ${J(n.chart)}`);
        ok('PO-SUPN', n.sheet && J(n.sheet.opts) === J({ off: ['heads'] }), `the lesson sheet's structure: ${J(n.sheet)}`);
        ok('PO-SUPN', J(P.normalizePartOpts(JSON.parse(J(n)), null)) === J(n), 'a JSON save / load changes the supports');
        ok('PO-SUPN', !P.partOptsEmpty({ chart: { bands: { say: false } } }), 'a supports-only delta reads as the standard packet');
        ok('PO-SUPN', J(P.normalizePartOpts({ wedo: { opts: { off: [] } }, chart: { bands: { say: true } } }, null)) === '{}', 'the standard supports store something');
        const w = P.withSupDelta({ band: 100, support: ['tile'] }, { opts: { off: ['regroup'], support: ['touch'] } });
        ok('PO-SUPN', J(w) === J({ band: 100, support: ['touch'], off: ['regroup'] }), `withSupDelta: ${J(w)}`);
        console.log(`PO-SUPN ${fails.some((f) => f.startsWith('PO-SUPN ')) ? 'FAIL' : 'PASS'}`);
    }

    /* ---- PO-4S */
    if (want('PO-4S')) {
        const sk = ['subtraction', 'sub_100_regroup'];
        const def = SO.optionsFor(...sk).find((d) => d.id === 'off');
        ok('PO-4S', !!def, 'no universal `off` option on subtraction:sub_100_regroup');
        if (def) {
            ok('PO-4S', def.hidden === true && def.type === 'set' && Array.isArray(def.default) && def.default.length === 0, `off is a hidden set defaulting to empty: ${J({ hidden: def.hidden, type: def.type, d: def.default })}`);
            ok('PO-4S', !SO.offeredOptionsFor(...sk).some((d) => d.id === 'off'), 'off is offered as a control');
            ok('PO-4S', ['regroup', 'heads', 'firststep'].every((v) => def.values.some((x) => x.v === v)), `off values: ${J(def.values.map((x) => x.v))}`);
            ok('PO-4S', K.OPTION_KEYS.off && /^\d[A-Z]$/.test(K.OPTION_KEYS.off), `off has a multi-character codec key: ${K.OPTION_KEYS.off}`);
            const dflt = SO.defaultOptions(...sk);
            ok('PO-4S', C.encodeOptionPayload(...sk, dflt) === '', `a skill at its defaults writes a payload: "${C.encodeOptionPayload(...sk, dflt)}"`);
            for (const v of [['regroup'], ['heads'], ['regroup', 'heads', 'firststep']]) {
                const enc = C.encodeOptionPayload(...sk, Object.assign({}, dflt, { off: v }));
                const dec = SO.normalizeOptions(...sk, C.decodeOptionPayload(...sk, enc));
                ok('PO-4S', enc && J(dec.off) === J(v), `off ${J(v)} round trip: "${enc}" -> ${J(dec.off)}`);
            }
        }
        console.log(`PO-4S ${fails.some((f) => f.startsWith('PO-4S ')) ? 'FAIL' : 'PASS'}`);
    }

    /* ---- PO-SIZE */
    if (want('PO-SIZE') && need('PO-SIZE', ['offeredAtSize', 'gateBySize', 'SIZE_OFFERS'])) {
        const sk = ['multiplication', 'mult_properties'];
        ok('PO-SIZE', P.offeredAtSize(...sk, 'band', 36, 'S') && !P.offeredAtSize(...sk, 'band', 36, 'M') && !P.offeredAtSize(...sk, 'band', 36, 'L') && P.offeredAtSize(...sk, 'band', 36, null), 'band 36: S only, every size when no size is given');
        ok('PO-SIZE', P.offeredAtSize(...sk, 'band', 25, 'M') && P.offeredAtSize(...sk, 'band', 81, 'L'), 'the other bands are offered at every size');
        const bandAt = (size) => { const d = SO.offeredOptionsFor(...sk, size ? { size } : undefined).find((x) => x.id === 'band'); return d ? d.values.map((x) => x.v) : null; };
        ok('PO-SIZE', J(bandAt('M')) === J([25, 81]) && J(bandAt('L')) === J([25, 81]), `offeredOptionsFor at M / L: ${J(bandAt('M'))} / ${J(bandAt('L'))}`);
        ok('PO-SIZE', J(bandAt('S')) === J([25, 36, 81]) && J(bandAt(null)) === J([25, 36, 81]), `offeredOptionsFor at S / no size: ${J(bandAt('S'))} / ${J(bandAt(null))}`);
        const g = P.gateBySize(...sk, { band: 36, forms: [0] }, 'M', SO.defaultOptions(...sk));
        ok('PO-SIZE', g.opts.band === 25 && g.notes.length === 1 && /size S/.test(g.notes[0]), `a band-36 choice at M: ${J(g)}`);
        const gs = P.gateBySize(...sk, { band: 36 }, 'S', SO.defaultOptions(...sk));
        ok('PO-SIZE', gs.opts.band === 36 && !gs.notes.length, `at S it stays: ${J(gs)}`);
        ok('PO-SIZE', P.gateBySize('addition', 'add_facts', { band: 36 }, 'M', {}).notes.length === 0, 'another skill is gated');
        console.log(`PO-SIZE ${fails.some((f) => f.startsWith('PO-SIZE ')) ? 'FAIL' : 'PASS'}`);
    }
}

/* ===================================================================================== browser */
async function browser() {
    const { open } = require('../lib/ws-harness.cjs');
    const { measureCells, judge } = require('./ws-empty-band.cjs');
    const app = await open({ seed: 1 });
    const T0 = Date.now();
    let builds = 0;
    try {
        const { page, browser: br } = app;
        const build = (skill, size, partOpts, extra = {}) => page.evaluate(async ({ skill, size, partOpts, extra }) => {
            try {
                const r = await window.buildSheet(Object.assign({ role: 'lesson', sections: [{ skills: [skill] }], size, paper: 'A4', seed: 4242, key: true, practicePages: 2, mixed: true, partOpts }, extra));
                const sheetsOf = (html) => { const out = {}; const re = /<(section|div)\b[^>]*\bclass="[^"]*\bws-page\b[^"]*"[^>]*>/g; let m, last = null, at = 0; const marks = []; while ((m = re.exec(html))) marks.push({ i: m.index, tag: m[0] }); marks.forEach((mk, k) => { const s = (/data-ws-sheet="([^"]*)"/.exec(mk.tag) || [])[1] || 'sheet'; const end = k + 1 < marks.length ? marks[k + 1].i : html.length; out[s] = (out[s] || '') + html.slice(mk.i, end); }); return out; };
                return { partSup: r.lesson && r.lesson.partSup ? r.lesson.partSup : null, fit: r.lesson && r.lesson.partFit, pupil: r.pupilHtml, key: r.keyHtml, sheets: sheetsOf(r.pupilHtml), keySheets: sheetsOf(r.keyHtml || ''), doc: window.sheetDocument(r.pupilHtml, 'x', { paper: 'A4' }), keyDoc: window.sheetDocument(r.keyHtml || '', 'k', { paper: 'A4' }) };
            } catch (e) { return { error: String((e && e.stack) || e).split('\n').slice(0, 2).join(' ') }; }
        }, { skill, size, partOpts, extra });
        const measure = async (doc) => {
            const sh = await br.newPage();
            try {
                await sh.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
                await sh.goto(page.url(), { waitUntil: 'domcontentloaded' });
                await sh.setContent(doc, { waitUntil: 'networkidle0', timeout: 60000 });
                await sh.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', { timeout: 15000 }).catch(() => {});
                await sh.emulateMediaType('print');
                const cells = await sh.evaluate(measureCells, 'body > section.ws-page, body > .ws-page');
                const pages = await sh.evaluate(() => [...document.querySelectorAll('body > section.ws-page, body > .ws-page')].map((pg) => {
                    const pr = pg.getBoundingClientRect();
                    const body = pg.querySelector('.ws-body') || pg; const brr = body.getBoundingClientRect();
                    const kids = [...body.children].filter((x) => x.getBoundingClientRect().height > 0 && !/ws-foot|ws-footer/.test(x.className));
                    const last = kids.length ? Math.max(...kids.map((x) => x.getBoundingClientRect().bottom)) : brr.top;
                    const cellsOut = [...pg.querySelectorAll('[data-ws-cell]')].filter((c) => c.getBoundingClientRect().bottom > pr.bottom + 1).length;
                    let h = 0; const s = pg.outerHTML; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
                    // (nothing given away: an answer slot written in solid ink on the pupil page)
                    const inked = [...pg.querySelectorAll('[data-ws-slot]')].filter((e) => e.textContent.trim() && !e.closest('.ws-trace, [data-ws-ink="trace"]') && !e.querySelector('[data-ws-ink="trace"], .ws-trace') && e.getAttribute('data-ws-ink') !== 'trace' && !e.hasAttribute('data-ws-given')).length;
                    return { sheet: pg.getAttribute('data-ws-sheet') || '', over: pg.scrollHeight > pg.clientHeight + 2 || cellsOut > 0, empty: Math.round(Math.max(0, brr.bottom - last) / brr.height * 100), h, inked };
                }));
                return { cells, pages };
            } finally { await sh.close(); }
        };
        const cellKey = (m, c, rule) => `${(m.pages[c.page - 1] || {}).sheet}|${rule}|${c.tmpl}|${Math.round(c.wMm)}`;
        const stdOf = (m) => { const keys = new Set(); for (const c of m.cells) judge([c], '', (rule) => keys.add(cellKey(m, c, rule)), 'lesson'); return { keys, pages: new Set(m.pages.map((p) => p.h)), inked: m.pages.reduce((o, p) => { o[p.sheet] = (o[p.sheet] || 0) + p.inked; return o; }, {}) }; };
        // the support marks a sheet draws (key parity, and "asked = printed")
        const MARKS = { regroup: /class="rg[^"]*" data-ws-seg="/g, heads: /<span class="head">[A-Za-z]/g, say: /\bSay:/g, steps: /data-mq-lesson-strip/g };
        const marks = (html) => Object.fromEntries(Object.entries(MARKS).map(([k, re]) => [k, ((html || '').match(re) || []).length]));
        const cellsN = (html) => ((html || '').match(/data-ws-cell="/g) || []).length;
        const SHEET_OF = { prereq: 'lesson-prereq', chart: 'lesson-chart', sheet: 'lesson-sheet', wedo: 'lesson-sheet', practice: 'lesson-practice', mixed: 'lesson-mixed' };
        const deltaOf = (x, stdTick) => (x.kind === 'band' ? { bands: { [x.id]: false } } : x.from && typeof x.from === 'object' ? { opts: { support: stdTick ? [] : [x.from.value] } } : { opts: { off: [x.id] } });
        const merge = (a, b) => { const o = JSON.parse(J(a || {})); for (const [p, d] of Object.entries(b)) { o[p] = o[p] || {}; if (d.opts) { o[p].opts = o[p].opts || {}; if (d.opts.off) o[p].opts.off = [...new Set([...(o[p].opts.off || []), ...d.opts.off])]; if (d.opts.support) o[p].opts.support = d.opts.support; } if (d.bands) o[p].bands = Object.assign({}, o[p].bands, d.bands); if (d.n !== undefined) o[p].n = d.n; } return o; };
        const PO = await page.evaluate(async () => { const m = await import('./js/modules/sheet/part-opts.js'); return { has: typeof m.resolveSupports === 'function' }; });

        for (const lid of LESSONS) {
            const skill = { categoryId: lid.split(':')[0], skillId: lid.split(':')[1] };
            for (const size of SIZES) {
                const where = `${lid} ${size}`;
                const std = await build(skill, size, undefined); builds++;
                if (std.error) { F('PO-5', `${where}: the standard packet does not build: ${std.error}`); continue; }
                if (!std.partSup || !PO.has) { F('PO-5', `${where}: the build declares no supports (res.lesson.partSup) - step B not built`); F('PO-3', `${where}: nothing to sample (no res.lesson.partSup)`); continue; }
                const decls = Object.entries(std.partSup).flatMap(([p, list]) => (list || []).map((x) => Object.assign({ part: p }, x)));
                console.log(`${where}: declared ${decls.map((x) => `${x.part}.${x.id}${x.needs ? '!' : ''}`).join(' ') || '(none)'}`);
                // every `needs` names a declared id; every declared id is a support the catalogue or the skill knows
                for (const x of decls) ok('PO-5', ['structural', 'hint', 'band'].includes(x.kind) && x.label, `${where} ${x.part}.${x.id}: a declaration without a kind or label ${J(x)}`);
                const stdM = await measure(std.doc);
                const S = stdOf(stdM);
                const stdTicks = {};
                for (const [p, list] of Object.entries(std.partSup)) { const r = await page.evaluate(async ({ list, p }) => { const m = await import('./js/modules/sheet/part-opts.js'); return m.resolveSupports(list, m.PART_LEVEL[p], null, {}).ticks; }, { list, p }); stdTicks[p] = r; }

                /* ---- PO-5: each declared id, flipped, changes its part's pupil pages and key, and nothing else */
                if (want('PO-5') && size === SIZES[0]) {
                    for (const x of decls) {
                        const d = deltaOf(x, stdTicks[x.part] && stdTicks[x.part][x.id]);
                        const r = await build(skill, size, { [x.part]: d }); builds++;
                        if (r.error) { F('PO-5', `${where} ${x.part}.${x.id}: does not build: ${r.error}`); continue; }
                        const sh = SHEET_OF[x.part];
                        ok('PO-5', r.sheets[sh] !== std.sheets[sh], `${where} ${x.part}.${x.id} ${J(d)}: its part's pupil pages (${sh}) did not change - the support is declared but not drawn`);
                        // (a structure or a band is drawn on the key too; a hint on a cell the key shows fully worked may leave the key as it was)
                        if (x.kind !== 'hint') ok('PO-5', r.keySheets[sh] !== std.keySheets[sh], `${where} ${x.part}.${x.id}: the key (${sh}) did not change - the key does not follow the pupil page`);
                        for (const other of Object.keys(std.sheets)) if (other !== sh) ok('PO-5', r.sheets[other] === std.sheets[other], `${where} ${x.part}.${x.id}: another sheet (${other}) changed - a part's delta is its own`);
                    }
                }

                /* ---- PO-3: single ticks + all-pairs x the Practice count x size */
                if (!want('PO-3')) continue;
                const fac = decls.map((x) => ({ name: `${x.part}.${x.id}`, x, vals: [false, true] }));
                const lim = await page.evaluate(async (fit) => { const m = await import('./js/modules/sheet/part-opts.js'); const l = m.partLimits('practice', { fit }); return l ? m.offeredValues(l) : null; }, std.fit);
                const counts = lim && lim.length ? [...new Set([lim[0], null, lim[lim.length - 1]])] : [null];
                fac.push({ name: 'practice.n', vals: counts });
                // greedy all-pairs: each pair of factor values appears in some state (deterministic order)
                const pairs = new Set();
                for (let a = 0; a < fac.length; a++) for (let b = a + 1; b < fac.length; b++) for (const va of fac[a].vals) for (const vb of fac[b].vals) pairs.add(`${a}=${J(va)}|${b}=${J(vb)}`);
                const states = [];
                for (const f of fac.slice(0, -1)) states.push(fac.map((g) => (g === f ? true : g.vals[0])));
                const cover = (st) => { for (let a = 0; a < fac.length; a++) for (let b = a + 1; b < fac.length; b++) pairs.delete(`${a}=${J(st[a])}|${b}=${J(st[b])}`); };
                states.forEach(cover);
                let guard = 0;
                while (pairs.size && guard++ < 40) {
                    let best = null, bestN = -1;
                    const first = [...pairs][0];
                    const [pa, pb] = first.split('|').map((s) => { const i = s.indexOf('='); return [Number(s.slice(0, i)), JSON.parse(s.slice(i + 1))]; });
                    for (let k = 0; k < 8; k++) {
                        const st = fac.map((f, i) => (i === pa[0] ? pa[1] : i === pb[0] ? pb[1] : f.vals[(k + i * 3 + (k >> 1)) % f.vals.length]));
                        let n = 0; for (let a = 0; a < fac.length; a++) for (let b = a + 1; b < fac.length; b++) if (pairs.has(`${a}=${J(st[a])}|${b}=${J(st[b])}`)) n++;
                        if (n > bestN) { best = st; bestN = n; }
                    }
                    states.push(best); cover(best);
                }
                console.log(`  PO-3 ${where}: ${states.length} states (${fac.length} factors)`);
                for (const st of states) {
                    let po = {};
                    const asked = [];
                    fac.forEach((f, i) => {
                        if (f.name === 'practice.n') { if (st[i] !== null) po = merge(po, { practice: { n: st[i] } }); return; }
                        if (!st[i]) return;
                        po = merge(po, { [f.x.part]: deltaOf(f.x, stdTicks[f.x.part] && stdTicks[f.x.part][f.x.id]) });
                        asked.push(f.x);
                    });
                    const tag = `${where} ${J(po)}`;
                    const r = await build(skill, size, po); builds++;
                    if (r.error) { F('PO-3', `${tag}: does not build: ${r.error}`); continue; }
                    // asked = printed
                    for (const x of asked) {
                        const sh = SHEET_OF[x.part];
                        const mk = MARKS[x.id];
                        if (mk && !(x.from && typeof x.from === 'object')) {
                            const n = ((r.sheets[sh] || '').match(mk) || []).length;
                            const n0 = ((std.sheets[sh] || '').match(mk) || []).length;
                            if (x.part === 'wedo' || x.part === 'sheet') ok('PO-3', n < n0 || n0 === 0, `${tag}: ${x.part}.${x.id} off, yet ${sh} still draws ${n} of ${n0}`);
                            else ok('PO-3', n === 0, `${tag}: ${x.part}.${x.id} off, yet ${sh} draws ${n}`);
                        } else ok('PO-3', r.sheets[sh] !== std.sheets[sh], `${tag}: ${x.part}.${x.id} asked, ${sh} unchanged`);
                    }
                    // key parity
                    for (const sh of Object.keys(r.sheets)) {
                        ok('PO-3', cellsN(r.sheets[sh]) === cellsN(r.keySheets[sh]), `${tag}: ${sh} key has ${cellsN(r.keySheets[sh])} cells, the pupil page ${cellsN(r.sheets[sh])}`);
                        const a = marks(r.sheets[sh]), b = marks(r.keySheets[sh]);
                        for (const k of ['regroup', 'steps', 'say']) ok('PO-3', a[k] === b[k], `${tag}: ${sh} ${k} marks pupil ${a[k]} / key ${b[k]} (the key follows the pupil page)`);
                    }
                    // the page on its own
                    const m = await measure(r.doc);
                    for (const p of m.pages) if (p.over) F('PO-3', `${tag}: overflow on a ${p.sheet} page`);
                    m.pages.forEach((p, i) => {
                        const nx = m.pages[i + 1], pv = m.pages[i - 1];
                        const lastOfMany = (!nx || nx.sheet !== p.sheet) && pv && pv.sheet === p.sheet;
                        const limE = lastOfMany ? 50 : 30;
                        if (p.empty >= limE && !S.pages.has(p.h)) F('PO-3', `${tag}: EB-PAGE p${i + 1} (${p.sheet}) ${p.empty} % empty (limit ${limE} %)`);
                    });
                    for (const c of m.cells) {
                        if (S.pages.has((m.pages[c.page - 1] || {}).h)) continue;
                        judge([c], tag, (rule, w, msg) => { if (['EB-BAND', 'EB-SIDE', 'EB-EDGE'].includes(rule) && !S.keys.has(cellKey(m, c, rule))) F('PO-3', `${rule} ${w}: ${msg}`); }, 'lesson');
                    }
                    const inked = m.pages.reduce((o, p) => { o[p.sheet] = (o[p.sheet] || 0) + p.inked; return o; }, {});
                    for (const [sh, n] of Object.entries(inked)) ok('PO-3', n <= (S.inked[sh] || 0), `${tag}: ${sh} has ${n} answer slots inked on the pupil page (standard ${S.inked[sh] || 0}) - an answer given away`);
                }
            }
        }

        /* ---- PO-5 papers: each declared id of a Practice / Quiz paper changes the paper */
        if (want('PO-5')) {
            for (const [cat, sk, role] of [['subtraction', 'sub_100_regroup', 'independent'], ['addition', 'add_facts', 'independent'], ['addition', 'add_facts', 'test'], ['subtraction', 'sub_100_regroup', 'test']]) {
                const where = `${cat}:${sk} ${role}`;
                const r = await page.evaluate(async ({ cat, sk, role }) => {
                    const PS = await import('./js/modules/print-sheet.js');
                    if (typeof PS.paperSupportDecl !== 'function') return { missing: true };
                    const ref = { categoryId: cat, skillId: sk, opts: {} };
                    const decl = await PS.paperSupportDecl(ref, role === 'test' ? 'quiz' : 'practice');
                    const P = await import('./js/modules/sheet/part-opts.js');
                    const res = P.resolveSupports(decl, role === 'test' ? 0 : 1, null, {});
                    const req = (opts) => ({ role, sections: [{ skills: [Object.assign({}, ref, { opts })], count: 6 }], size: 'M', paper: 'A4', seed: 77, key: true });
                    const b0 = await window.buildSheet(req({}));
                    const out = [];
                    for (const x of decl) {
                        const o = x.from && typeof x.from === 'object' ? { support: res.ticks[x.id] ? [] : [x.from.value] } : { off: [x.id] };
                        const b = await window.buildSheet(req(o));
                        out.push({ id: x.id, kind: x.kind, std: res.ticks[x.id], changed: b.pupilHtml !== b0.pupilHtml, keyChanged: b.keyHtml !== b0.keyHtml });
                    }
                    return { decl: decl.map((x) => x.id), out };
                }, { cat, sk, role });
                if (r.missing) { F('PO-5', `${where}: print-sheet.js has no paperSupportDecl (step B not built)`); continue; }
                console.log(`${where}: declared ${r.decl.join(' ') || '(none)'}`);
                if (sk === 'sub_100_regroup' && role === 'independent') ok('PO-5', r.decl.includes('regroup'), `${where}: the regroup boxes are not declared`);
                if (sk === 'add_facts') ok('PO-5', r.decl.some((x) => x === 'touch' || x === 'tile'), `${where}: the Support option's hints are not declared`);
                for (const x of r.out) {
                    ok('PO-5', x.changed && (x.keyChanged || x.kind === 'hint'), `${where} ${x.id}: flipping it changes ${x.changed ? 'only the pupil page' : 'nothing on the pupil page'}${x.keyChanged ? '' : ' and not the key'}`);
                    if (role === 'test' && x.kind === 'hint') ok('PO-5', x.std === false, `${where} ${x.id}: a quiz hint is on by default`);
                }
            }
        }

        /* ---- PO-PS: paper = screen */
        if (want('PO-PS')) {
            const r = await page.evaluate(async () => {
                const SC = await import('./js/modules/screen-cell.js');
                const G = await import('./js/modules/generate-question.js');
                if (typeof SC.screenOffFor !== 'function') return { missing: true };
                const out = {};
                for (const [name, opts] of [['std', {}], ['off', { off: ['regroup'] }]]) {
                    let screenRg = 0, paperRg = 0;
                    for (let s = 1; s <= 4; s++) {
                        const q = G.generateQuestionFor({ category: 'subtraction', skill: 'sub_100_regroup', opts, seed: 900 + s });
                        q.skillOptions = Object.assign({}, q.skillOptions || {}, opts);
                        const k = SC.cellKindFor(q);
                        const html = k ? SC.kindHTML(k, { regroup: SC.regroupFor('sub_100_regroup'), off: SC.screenOffFor(q) }) : '';
                        screenRg += (html.match(/mq-carry/g) || []).length;
                    }
                    const b = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId: 'subtraction', skillId: 'sub_100_regroup', opts }], count: 4 }], size: 'M', paper: 'A4', seed: 901, key: true });
                    paperRg = (b.pupilHtml.match(/class="rg[^"]*" data-ws-seg="/g) || []).length;
                    out[name] = { screenRg, paperRg };
                }
                return out;
            });
            if (r.missing) F('PO-PS', 'screen-cell.js has no screenOffFor (step B not built)');
            else {
                ok('PO-PS', r.std.screenRg > 0 && r.std.paperRg > 0, `the default draws regroup boxes on paper and screen: ${J(r.std)}`);
                ok('PO-PS', r.off.screenRg === 0 && r.off.paperRg === 0, `regroup off: none on paper and none on screen: ${J(r.off)}`);
            }
            const fs = require('fs');
            for (const f of ['js/modules/question-render.js', 'js/modules/worksheet.js', 'js/modules/quiz-take.js', 'js/modules/support-ladder.js']) {
                const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
                const calls = (src.match(/kindHTML\([^;]*regroup:[^;]*\)/g) || []);
                ok('PO-PS', calls.length && calls.every((c) => /off:/.test(c)), `${f}: a stack drawn on screen without the skill's \`off\` (${calls.length} calls)`);
            }
        }
        console.log(`(${builds} builds, ${Math.round((Date.now() - T0) / 1000)} s)`);
    } finally { await app.close(); }
}

/* ===================================================================================== UI */
async function ui() {
    const { open } = require('../lib/ws-harness.cjs');
    const app = await open({ seed: 1, viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    try {
        const { page } = app;
        const idle = async () => { await sleep(400); await page.waitForFunction(() => { const s = document.querySelector('#tvStage'); return s && s.dataset.state !== 'building' && document.querySelector('.tv-parts'); }, { timeout: 180000, polling: 300 }).catch(() => {}); await sleep(300); };
        const click = async (sel) => { const r = await page.evaluate((sel) => { const b = document.querySelector(sel); if (!b || b.disabled) return false; b.scrollIntoView({ block: 'center' }); b.click(); return true; }, sel); await sleep(200); return r; };
        for (const width of [1280, 390]) {
            await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
            await page.evaluate(() => { try { localStorage.removeItem('mq_teacher_sets'); } catch (e) { /* */ } window.setUserRole('teacher'); window.tvOpenPrintWith([{ categoryId: 'subtraction', skillId: 'sub_100_regroup' }]); });
            await sleep(500);
            await click('[data-act="types"][data-sec="0"]'); await sleep(300);
            await click('[data-act="role"][data-sec="0"][data-v="lesson"]');
            await click('[data-act="size"][data-v="M"]');
            await idle();
            const where = `sub_100_regroup ${width}`;
            const rows = await page.evaluate(() => [...document.querySelectorAll('.tv-part[data-part-row]')].map((r) => ({ part: r.dataset.partRow, chip: r.querySelector('.tv-part-chip') ? { btn: r.querySelector('.tv-part-chip').tagName === 'BUTTON', exp: r.querySelector('.tv-part-chip').getAttribute('aria-expanded'), text: r.querySelector('.tv-part-chip').textContent.trim() } : null, sup: (r.querySelector('.tv-part-sup') || {}).textContent || '' })));
            const sheetChip = await page.evaluate(() => { const c = document.querySelector('.tv-part-group .tv-part-chip'); return c ? c.textContent.trim() : null; });
            ok('PO-UI', rows.some((r) => r.chip), `${where}: no part has a Supports chip`);
            for (const r of rows) {
                if (r.chip) ok('PO-UI', r.chip.btn && r.chip.exp === 'false' && /^(Supports: )?Standard/.test(r.chip.text), `${where} ${r.part}: chip ${J(r.chip)}`);
                else ok('PO-UI', /None to choose|^\s*$/.test(r.sup), `${where} ${r.part}: no chip, yet "${r.sup}"`);
            }
            ok('PO-UI', sheetChip && /^(Supports: )?Standard/.test(sheetChip), `${where}: the lesson sheet's structure chip: ${sheetChip}`);
            // open the lesson sheet's panel; untick the regroup boxes
            const opened = await click('.tv-part-group .tv-part-chip');
            ok('PO-UI', opened, `${where}: the lesson sheet's chip does not open`);
            const panel = await page.evaluate(() => { const p = document.querySelector('.tv-sup-panel'); if (!p) return null; return { groups: [...p.querySelectorAll('.tv-sup-group-h')].map((h) => h.textContent.trim()), ids: [...p.querySelectorAll('[data-act="sup-tick"]')].map((b) => b.dataset.sup), small: [...p.querySelectorAll('button')].filter((b) => b.offsetParent).map((b) => b.getBoundingClientRect()).filter((r) => r.height < 44).length }; });
            ok('PO-UI', panel && panel.ids.includes('regroup') && panel.groups.some((g) => /Structure/.test(g)), `${where}: the panel ${J(panel)}`);
            if (width === 390) ok('PO-UI', panel && panel.small === 0, `${where}: ${panel && panel.small} panel controls under 44 px`);
            await click('.tv-sup-panel [data-act="sup-tick"][data-sup="regroup"]');
            await idle();
            const after = await page.evaluate(() => ({ warn: (document.querySelector('.tv-sup-warn') || {}).textContent || '', chip: (document.querySelector('.tv-part-group .tv-part-chip') || {}).textContent || '', print: !!document.querySelector('[data-act="print"]:not([disabled]), .tv-print-btn:not([disabled])'), wide: document.documentElement.scrollWidth - window.innerWidth }));
            ok('PO-UI', /regroup boxes/.test(after.warn) && /still prints/.test(after.warn), `${where}: no needs warning: "${after.warn}"`);
            ok('PO-UI', /Custom: 1 off/.test(after.chip), `${where}: chip after one off: "${after.chip.trim()}"`);
            ok('PO-UI', after.print, `${where}: Print is blocked`);
            if (width === 390) ok('PO-UI', after.wide <= 0, `${where}: ${after.wide} px sideways scroll with the panel open`);
            const prev = await page.evaluate(async () => { const T = await import("./js/modules/teacher-print.js"); if (typeof T.printScreenSnapshot !== "function") return null; const s = T.printScreenSnapshot(); const pages = (s.pupilHtml || "").split(/(?=<section\b)/).filter((x) => /data-ws-sheet="lesson-sheet"/.test(x.slice(0, 400))); return { pages: pages.length, rg: (pages.join("").match(/class="rg[^"]*" data-ws-seg="/g) || []).length, po: s.partOpts[0] }; });
            ok('PO-UI', prev && prev.pages > 0 && prev.rg === 0, `${where}: the rebuilt lesson sheet still draws regroup boxes: ${J(prev)}`);
        }
        // the Quiz sheet: each skill's hints unticked by default
        await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
        const q = await page.evaluate(async () => {
            try { window.tvCloseSheet && window.tvCloseSheet(); } catch (e) { /* */ }
            const TU = await import('./js/modules/teacher-ui.js');
            const U = TU.currentSet(); while (U.length) U.pop();
            TU.addToCurrentSet('addition', 'add_facts');
            window.tvOpenSheet('quiz');
            await new Promise((r) => setTimeout(r, 800));
            const rows = [...document.querySelectorAll('.tvs-sup-row')];
            const chip = rows[0] && rows[0].querySelector('.tv-part-chip');
            if (!chip) return { rows: rows.length };
            chip.click();
            await new Promise((r) => setTimeout(r, 300));
            const hints = [...document.querySelectorAll('.tv-sup-panel [data-sup-kind="hint"]')].map((b) => ({ id: b.dataset.sup, on: b.getAttribute('aria-checked') }));
            const first = document.querySelector('.tv-sup-panel [data-sup-kind="hint"]');
            if (first) first.click();
            await new Promise((r) => setTimeout(r, 300));
            return { rows: rows.length, chip: chip.textContent.trim(), hints, line: (document.querySelector('.tv-sup-quizline') || {}).textContent || '' };
        });
        ok('PO-UI', q.rows >= 1 && q.hints && q.hints.length && q.hints.every((h) => h.on === 'false'), `the Quiz sheet's supports (hints unticked by default): ${J(q)}`);
        ok('PO-UI', q.line && /Hints are on for this quiz/.test(q.line), `the Quiz sheet's hints line once a hint is ticked: ${J(q.line)}`);
    } finally { await app.close(); }
}

(async () => {
    try {
        await unit();
        if (!has('unit') && !has('ui')) { await browser(); for (const id of ['PO-5', 'PO-3', 'PO-PS']) if (want(id)) console.log(`${id} ${fails.some((f) => f.startsWith(id + ' ')) ? 'FAIL' : 'PASS'}`); }
        if (has('ui') || has('all')) { await ui(); if (want('PO-UI')) console.log(`PO-UI ${fails.some((f) => f.startsWith('PO-UI ')) ? 'FAIL' : 'PASS'}`); }
    } catch (e) { errors.push(String((e && e.stack) || e).split('\n').slice(0, 3).join(' ')); }
    for (const f of fails) console.log(`  FAIL ${f}`);
    if (errors.length) { for (const e of errors) console.log(`  ERROR ${e}`); console.log(`ws-partopts-supports: ERROR (${errors.length})`); process.exit(2); }
    console.log(fails.length ? `ws-partopts-supports: FAIL (${fails.length})` : 'ws-partopts-supports: OK');
    process.exit(fails.length ? 1 : 0);
})();
