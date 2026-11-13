#!/usr/bin/env node
// ws-screen-ink-size — check SCREEN-INK-SIZE: a picture on a screen host is drawn at least at its PRINT size, and it lies
// across its cell before it grows tall (lane lf-checks, 2026-11-13). Why: the owner caught division:div_facts screen arrays
// drawn as tall narrow strips of tiny dots (a 12 x 36 frame in a 720 px card); the screen critic listed "array dots small on
// screen" only as an unscored note, and no machine check compared the screen drawing with the paper one.
//
// Two rules, judged on every screen cell of every host (practice card 390 / 820 / 1280, online worksheet .mq-wspaper and
// quiz .mq-qtpaper at 1280, as ws-empty-band renders them):
//   SIZE-INK    every repeated picture mark (dots, counters, base-10 blocks, cubes, tiles: SVG circle / ellipse / rect / use /
//               path / polygon groups of >= 3 like marks, and HTML leaf marks of one class) is at least its PRINT size in CSS
//               mm (1 mm = 96 / 25.4 px), with a 5 % tolerance. Print size = the same mark kind on the Independent page at the
//               print size (--size, default M) built by buildSheet with the same options and seed. Like with like: a mark kind
//               is the drawing's kind (its aria-label without digits, or its class) plus the mark's tag and class, and its size
//               the MEDIAN of the marks' smaller side (a dot's diameter, a rod's width).
//   SIZE-WIDTH  a drawing (an svg holding repeated marks, or the parent of HTML marks) uses at least 60 % of its cell's FREE
//               width (the cell's content-box width less every block standing beside the drawing, at each level from the
//               drawing up to the cell) before it grows taller: FAIL when drawing width < 60 % of the free width AND drawing
//               height > drawing width (a tall strip in a wide cell).
// Drawings under 4 mm across both ways are not judged (a tick, a ring). A numeral drawing (an svg with data-digit: the touch
// dots laid on a digit) is judged by SIZE-INK only: its shape is the digit's, so SIZE-WIDTH does not apply. A mark group needs
// >= 3 like marks at >= 3 distinct places (a picture's detail drawn three times on one spot is not a set of marks).
//
//   node tests/scripts/ws-screen-ink-size.cjs --skill division:div_facts
//   node tests/scripts/ws-screen-ink-size.cjs --skill a:b,c:d --hosts card,worksheet --only SIZE-WIDTH
//   node tests/scripts/ws-screen-ink-size.cjs --passed                 # every id in js/modules/redesign-passed.js
//   node tests/scripts/ws-screen-ink-size.cjs --skill a:b --opts '{"support":["array"]}'
//   node tests/scripts/ws-screen-ink-size.cjs --html file.html         # a fixture: [data-mq-print] holds the paper cells,
//                                                                       # [data-mq-screen] the screen cells (backtest rows)
//   node tests/scripts/ws-screen-ink-size.cjs --self-test              # the pure judging functions, no browser
// Options rendered per skill (absent --opts): the skill's defaults, plus each value of its supports-model `support` option
// (with that value's base options), so a support that draws a picture is judged. --report-only exits 0; --json <file> writes
// the findings. Prints one line per finding, then `ws-screen-ink-size: OK` or `FAIL (n)`; exits 1 on FAIL.
'use strict';
const fs = require('fs');
const path = require('path');

const NAME = 'ws-screen-ink-size';
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && i + 1 < argv.length ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const MM = 96 / 25.4;
const INK_TOL = 0.05;      // SIZE-INK: screen >= 95 % of print
const WIDTH_MIN = 0.60;    // SIZE-WIDTH: drawing width >= 60 % of the free width ...
const MIN_DRAW_MM = 4;     // drawings smaller than this both ways are not judged

/* ------------------------------------------------------------------ pure judging */

function median(xs) {
    const a = xs.filter((x) => Number.isFinite(x)).sort((p, q) => p - q);
    if (!a.length) return NaN;
    const m = a.length >> 1;
    return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}
/** SIZE-INK: a screen mark kind's median size (mm) against print's; null when it holds. */
function inkFinding(kind, screenMm, printMm, tol = INK_TOL) {
    if (!(screenMm > 0) || !(printMm > 0)) return null;
    if (screenMm >= (1 - tol) * printMm) return null;
    return `${kind}: screen ${screenMm.toFixed(2)} mm, print ${printMm.toFixed(2)} mm (${Math.round(screenMm / printMm * 100)} %; needs >= ${Math.round((1 - tol) * 100)} % = ${((1 - tol) * printMm).toFixed(2)} mm)`;
}
/** SIZE-WIDTH: drawing w x h (mm) in a cell whose free width is freeW (mm); null when it holds. */
function widthFinding(kind, w, h, freeW, min = WIDTH_MIN) {
    if (!(w > 0) || !(h > 0) || !(freeW > 0)) return null;
    if (w < MIN_DRAW_MM && h < MIN_DRAW_MM) return null;
    if (w >= min * freeW || h <= w) return null;
    return `${kind}: drawing ${w.toFixed(1)} x ${h.toFixed(1)} mm uses ${Math.round(w / freeW * 100)} % of the ${freeW.toFixed(1)} mm free width (limit ${Math.round(min * 100)} %) and is taller than wide`;
}
/** The print reference: kind -> median mm across every print group of that kind. */
function printSizes(groups) {
    const by = {};
    for (const g of groups) (by[g.kind] = by[g.kind] || []).push(g.sizeMm);
    const out = {};
    for (const k of Object.keys(by)) out[k] = median(by[k]);
    return out;
}

function selfTest() {
    const bad = []; let n = 0;
    const eq = (name, got, want) => { n++; if (JSON.stringify(got) !== JSON.stringify(want)) bad.push(`${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); };
    eq('median odd', median([3, 1, 2]), 2);
    eq('median even', median([1, 2, 3, 4]), 2.5);
    eq('median NaN dropped', median([NaN, 2]), 2);
    // SIZE-INK: div_facts 73e96fc1 screen dot 0.9 mm against print 1.96 mm fails; 1.90 (97 %) holds; 1.85 (94 %) fails
    eq('ink tiny dots (73e96fc1)', !!inkFinding('array circle', 0.9, 1.96), true);
    eq('ink within 5 %', inkFinding('array circle', 1.90, 1.96), null);
    eq('ink just under 95 %', !!inkFinding('array circle', 1.85, 1.96), true);
    eq('ink bigger', inkFinding('array circle', 3.2, 1.96), null);
    eq('ink no print ref', inkFinding('array circle', 0.5, NaN), null);
    // SIZE-WIDTH: a 10.8 x 32 mm strip in a 150 mm free width fails; a wide drawing holds; a tall drawing filling its free width holds
    eq('width tall strip (73e96fc1)', !!widthFinding('array', 10.8, 32.3, 150), true);
    eq('width landscape', widthFinding('array', 40, 25, 150), null);
    eq('width narrow but short', widthFinding('array', 30, 20, 150), null);
    eq('width tall but fills free width', widthFinding('array', 20, 60, 30), null);
    eq('width at 60 %', widthFinding('array', 60, 90, 100), null);
    eq('width at 59 %', !!widthFinding('array', 59, 90, 100), true);
    eq('width tiny drawing', widthFinding('tick', 3, 3.5, 100), null);
    eq('print sizes', printSizes([{ kind: 'a', sizeMm: 2 }, { kind: 'a', sizeMm: 4 }, { kind: 'b', sizeMm: 1 }]), { a: 3, b: 1 });
    for (const b of bad) console.log('  ' + b);
    console.log(`${NAME} --self-test: ${n - bad.length}/${n}`);
    console.log(`${NAME}: ${bad.length ? 'FAIL' : 'OK'}`);
    process.exit(bad.length ? 1 : 0);
}
if (require.main === module && has('self-test')) selfTest();

/* ------------------------------------------------------------------ in the page */

// Run in the page: every drawing (svg with repeated marks, or the parent of repeated HTML marks) under `scope`, with its
// cell, its mark groups (kind, median smaller side in mm) and its free width. `cellSel` finds a drawing's cell.
function readDrawingsInPage({ scope, cellSel }) {
    const MM = 96 / 25.4;
    const roots = [...document.querySelectorAll(scope)];
    if (!roots.length) return { error: `no ${scope}` };
    const visible = (e) => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0; };
    const med = (xs) => { const a = xs.slice().sort((p, q) => p - q); const m = a.length >> 1; return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; };
    const kindOf = (el) => {
        const lab = (el.getAttribute('aria-label') || '').replace(/\d+/g, '').replace(/\s+/g, ' ').trim();
        if (lab) return lab.split(',')[0].trim();
        const cls = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean)[0] || el.tagName.toLowerCase();
        // an unlabelled picture takes the object its item names ("3 and 4 fish" -> fish): a fish is compared with a fish
        let ctx = el.parentElement && el.parentElement.closest('[aria-label]');
        while (ctx && !/\d/.test(ctx.getAttribute('aria-label') || '')) ctx = ctx.parentElement && ctx.parentElement.closest('[aria-label]');   // an item's label holds its numbers
        const noun = ctx ? (ctx.getAttribute('aria-label') || '').toLowerCase().replace(/\d+/g, ' ').split(/[^a-z]+/).filter((w) => w && !/^(and|plus|minus|times|divided|by|equals|is|of|the|a|answer)$/.test(w)).join(' ') : '';
        return noun ? `${cls} (${noun})` : cls;
    };
    const markKey = (m) => `${m.tagName.toLowerCase()}${(m.getAttribute('class') || '').split(/\s+/).filter(Boolean).slice(0, 1).map((c) => '.' + c).join('')}`;
    // groups of >= 3 like marks (same key, size within 20 % of the key's median); the frame (one big rect) never qualifies
    const groupsOf = (marks) => {
        const by = {};
        for (const m of marks) {
            if (!visible(m)) continue;
            const r = m.getBoundingClientRect();
            const s = Math.min(r.width, r.height);
            if (!(s > 0.5)) continue;
            (by[markKey(m)] = by[markKey(m)] || []).push({ s, w: r.width, h: r.height, at: `${Math.round(r.left + r.width / 2)},${Math.round(r.top + r.height / 2)}` });
        }
        const out = [];
        for (const k of Object.keys(by)) {
            const xs = by[k]; const m0 = med(xs.map((x) => x.s));
            const like = xs.filter((x) => Math.abs(x.s - m0) <= 0.2 * m0 && Math.abs(Math.max(x.w, x.h) - med(xs.map((y) => Math.max(y.w, y.h)))) <= 0.2 * Math.max(x.w, x.h));
            // >= 3 marks at >= 3 DISTINCT places (a picture's detail stacked on one spot - three eyes drawn at one point - is not a set of marks)
            if (like.length >= 3 && new Set(like.map((x) => x.at)).size >= 3) out.push({ mark: k, n: like.length, sizeMm: +(med(like.map((x) => x.s)) / MM).toFixed(3) });
        }
        return out;
    };
    const drawings = [];
    for (const rt of roots) {
        // SVG drawings: the outermost svg (a nested svg is part of its parent's picture)
        for (const svg of rt.querySelectorAll('svg')) {
            if (svg.parentElement && svg.parentElement.closest('svg') || !visible(svg)) continue;
            const g = groupsOf([...svg.querySelectorAll('circle, ellipse, rect, use, path, polygon')]);
            if (g.length) drawings.push({ el: svg, kind: kindOf(svg), groups: g, glyph: svg.hasAttribute('data-digit') });
        }
        // HTML marks: leaf elements with no text, a fill or a border, grouped under their parent by class
        const parents = new Map();
        for (const e of rt.querySelectorAll('div, span, i, b')) {
            if (e.children.length || e.textContent.trim() || e.closest('svg, input, [data-ws-slot], .mq-slot, button') || !visible(e)) continue;
            const cs = getComputedStyle(e);
            const filled = cs.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor);
            const bordered = parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none';
            if (!filled && !bordered) continue;
            const r = e.getBoundingClientRect();
            if (r.width > 20 * MM || r.height > 20 * MM) continue;
            const p = e.parentElement; if (!parents.has(p)) parents.set(p, []); parents.get(p).push(e);
        }
        for (const [p, kids] of parents) {
            if (kids.length < 3 || p.closest('svg')) continue;
            const g = groupsOf(kids);
            if (g.length) drawings.push({ el: p, kind: kindOf(p), groups: g });
        }
    }
    const out = [];
    for (const d of drawings) {
        const cell = d.el.closest(cellSel);
        const r = d.el.getBoundingClientRect();
        let freeMm = null, cellMm = null;
        if (cell) {
            const cr = cell.getBoundingClientRect(); const cs = getComputedStyle(cell);
            const contentW = cr.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth);
            // every block beside the drawing's chain (vertical overlap, no horizontal overlap), level by level up to the cell
            let beside = 0;
            for (let node = d.el; node && node !== cell; node = node.parentElement) {
                const nr = node.getBoundingClientRect();
                const par = node.parentElement; if (!par) break;
                for (const sib of par.children) {
                    if (sib === node || !visible(sib)) continue;
                    const sr = sib.getBoundingClientRect();
                    const vOver = Math.min(sr.bottom, nr.bottom) - Math.max(sr.top, nr.top);
                    const hOver = Math.min(sr.right, nr.right) - Math.max(sr.left, nr.left);
                    if (vOver > 0.3 * Math.min(sr.height, nr.height) && hOver <= 1) beside += sr.width;
                }
            }
            cellMm = +(contentW / MM).toFixed(1);
            freeMm = +(Math.max(0, contentW - beside) / MM).toFixed(1);
        }
        const item = cell ? ((cell.querySelector('[aria-label]:not(svg)') || {}).getAttribute ? cell.querySelector('[aria-label]:not(svg)').getAttribute('aria-label') : '') : '';
        out.push({ kind: d.kind, groups: d.groups, wMm: +(r.width / MM).toFixed(1), hMm: +(r.height / MM).toFixed(1), cellMm, freeMm, item: (item || '').slice(0, 40), hasCell: !!cell, glyph: !!d.glyph });
    }
    return { drawings: out };
}

/* ------------------------------------------------------------------ judging a host's drawings */

function judgeHost({ where, drawings, ref, F, notes }) {
    for (const d of drawings) {
        for (const g of d.groups) {
            // a noun read off a screen-only label ("touch dots, tap to count") falls back to the plain kind when paper names none
            let kind = `${d.kind} ${g.mark}`;
            if (ref[kind] == null) { const plain = kind.replace(/ \([^)]*\)/, ''); if (ref[plain] != null) kind = plain; }
            if (ref[kind] == null) { notes.add(`${where}: "${kind}" has no print counterpart (not compared)`); continue; }
            const f = inkFinding(kind, g.sizeMm, ref[kind]);
            if (f) F('SIZE-INK', `${where}${d.item ? ` [${d.item}]` : ''}`, f, { kind, screenMm: g.sizeMm, printMm: ref[kind] });
        }
        if (d.hasCell && !d.glyph) {
            const f = widthFinding(d.kind, d.wMm, d.hMm, d.freeMm);
            if (f) F('SIZE-WIDTH', `${where}${d.item ? ` [${d.item}]` : ''}`, `${f} (cell content ${d.cellMm} mm)`, { kind: d.kind, wMm: d.wMm, hMm: d.hMm, freeMm: d.freeMm, cellMm: d.cellMm });
        }
    }
}

/* ------------------------------------------------------------------ the run */

function passedIds() {
    const src = fs.readFileSync(path.join(process.env.MQ_ROOT || path.resolve(__dirname, '..', '..'), 'js/modules/redesign-passed.js'), 'utf8');
    return [...new Set([...src.matchAll(/^\s*'([a-z0-9_]+:[a-z0-9_]+)',?\s*$/gim)].map((m) => m[1]))];
}

async function main() {
    const { open } = require('../lib/ws-harness.cjs');
    const ONLY = arg('only', null) ? arg('only').split(',').map((s) => s.trim().toUpperCase()) : null;
    const findings = []; const notes = new Set(); let renders = 0;
    const F = (rule, where, msg, data) => { if (!ONLY || ONLY.includes(rule)) findings.push({ rule, where, msg, data }); };
    const SEED = parseInt(arg('seed', '7'), 10);
    const SIZE = arg('size', 'M');
    const HOSTS = arg('hosts', 'card,worksheet,quiz').split(',').map((s) => s.trim()).filter(Boolean);
    const WIDTHS = arg('widths', null) ? arg('widths').split(',').map(Number) : null;
    const hostWidths = { card: [390, 820, 1280], worksheet: [1280], quiz: [1280] };
    const SKILLS = has('passed') ? passedIds() : (arg('skill', '') || arg('skills', '')).split(',').map((s) => s.trim()).filter(Boolean);
    const HTML = arg('html', null);
    if (!HTML && !SKILLS.length) { console.error('usage: --skill cat:skill[,...] | --passed | --html file | --self-test'); process.exit(2); }
    const app = await open({ seed: 1 });
    const { page } = app;
    const T0 = Date.now();
    try {
        if (HTML) {
            // a fixture: paper cells under [data-mq-print], screen cells under [data-mq-screen], in one document
            await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
            await page.setContent(fs.readFileSync(path.resolve(process.cwd(), HTML), 'utf8'), { waitUntil: 'load' });
            const pr = await page.evaluate(readDrawingsInPage, { scope: '[data-mq-print]', cellSel: '[data-ws-cell]' });
            const sc = await page.evaluate(readDrawingsInPage, { scope: '[data-mq-screen]', cellSel: '[data-ws-cell], .mq-scell' });
            if (pr.error || sc.error) throw new Error(pr.error || sc.error);
            renders += 2;
            const ref = printSizes(pr.drawings.flatMap((d) => d.groups.map((g) => ({ kind: `${d.kind} ${g.mark}`, sizeMm: g.sizeMm }))));
            if (!sc.drawings.length) F('SIZE-READ', path.basename(HTML), 'no screen drawing read');
            judgeHost({ where: path.basename(HTML), drawings: sc.drawings, ref, F, notes });
        }
        for (const key of SKILLS) {
            const [cat, skill] = key.split(':');
            let variants;
            if (arg('opts', null)) variants = [{ tag: 'opts', opts: JSON.parse(arg('opts')) }];
            else {
                const def = await page.evaluate(({ cat, skill }) => {
                    try {
                        const d = (window.offeredOptionsFor(cat, skill) || []).find((x) => x.id === 'support' && x.supportsModel);
                        return d ? { render: d.render || [], base: d.valueBase || {} } : null;
                    } catch (e) { return null; }
                }, { cat, skill });
                variants = [{ tag: 'defaults', opts: null }];
                if (def) for (const v of def.render) variants.push({ tag: `support ${v}`, opts: Object.assign({ support: [v] }, def.base[v] || {}) });
            }
            for (const v of variants) {
                const tag = `${key} {${v.tag}}`;
                // ---- paper: the Independent page at SIZE
                const doc = await page.evaluate(async ({ cat, skill, opts, SIZE, SEED }) => {
                    try {
                        const r = await window.buildSheet({ role: 'independent', sections: [{ skills: [Object.assign({ categoryId: cat, skillId: skill }, opts ? { opts } : {})] }], size: SIZE, paper: 'A4', seed: SEED, key: false });
                        return { html: window.sheetDocument(r.pupilHtml, 'x', { paper: 'A4' }) };
                    } catch (e) { return { error: String((e && e.message) || e).slice(0, 200) }; }
                }, { cat, skill, opts: v.opts, SIZE, SEED });
                if (doc.error) { notes.add(`${tag}: paper not composed (${doc.error})`); continue; }
                const sh = await app.browser.newPage();
                let ref = {};
                try {
                    await sh.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
                    await sh.goto(page.url(), { waitUntil: 'domcontentloaded' });
                    await sh.setContent(doc.html, { waitUntil: 'networkidle0', timeout: 60000 });
                    await sh.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', { timeout: 15000 }).catch(() => {});
                    await sh.emulateMediaType('print');
                    const pr = await sh.evaluate(readDrawingsInPage, { scope: 'body', cellSel: '[data-ws-cell]' });
                    renders++;
                    ref = printSizes((pr.drawings || []).flatMap((d) => d.groups.map((g) => ({ kind: `${d.kind} ${g.mark}`, sizeMm: g.sizeMm }))));
                } finally { await sh.close(); }
                const refKinds = Object.keys(ref);
                // ---- screen hosts
                for (const host of HOSTS) for (const w of (hostWidths[host] || []).filter((x) => !WIDTHS || WIDTHS.includes(x))) {
                    await page.setViewport({ width: w, height: w < 500 ? 844 : 900, deviceScaleFactor: 1 });
                    const seeds = [SEED, SEED + 1, SEED + 2];
                    const runs = host === 'card' ? seeds.map((s) => ({ s })) : [{ s: SEED }];
                    for (const run of runs) {
                        const scope = await page.evaluate(({ c, k, host, s, opts }) => {
                            try {
                                const st = window.state;
                                window.clearSetOptions({ silent: true });
                                if (opts) window.setSetOptions(c, k, opts, { silent: true });
                                if (host === 'card') { st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false; window.showView('gameView'); st.currentQ = window.generateQuestionFor(Object.assign({ category: c, skill: k, seed: s }, opts ? { opts } : {})); window.renderQuestion(); return '#questionCard'; }
                                if (host === 'worksheet') { if (window.__wsReseed) window.__wsReseed(4242 + s); st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 4; window.initWorksheet(); return '#worksheetView .mq-wspaper'; }
                                if (host === 'quiz') {
                                    const questions = [s, s + 1].map((sd, i) => { const q = window.generateQuestionFor(Object.assign({ category: c, skill: k, seed: sd, itemIndex: i }, opts ? { opts } : {})); return { id: i, skillId: k, points: 1, questionData: window.quizQuestionData(Object.assign({ categoryId: c }, q)) }; });
                                    const test = { id: null, name: 'Ink', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }], settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
                                    window.handleQuizURL(window.compressTestForURL(test));
                                    const nm = document.getElementById('qtStudentName'); nm.value = 'A'; nm.dispatchEvent(new Event('input'));
                                    window.startQuizTest(); return '#quizTakeView .mq-qtpaper';
                                }
                                return null;
                            } catch (e) { return 'ERR ' + String((e && e.message) || e).slice(0, 150); }
                        }, { c: cat, k: skill, host, s: run.s, opts: v.opts });
                        if (!scope || /^ERR/.test(scope)) { notes.add(`${tag} ${host} ${w}: not rendered (${scope})`); continue; }
                        await new Promise((r) => setTimeout(r, 450));
                        if (host === 'worksheet') await page.waitForFunction(() => { const g = document.getElementById('worksheetGrid'); return !g || g.dataset.mqLaidOut !== '0'; }, { timeout: 5000 }).catch(() => {});
                        const sc = await page.evaluate(readDrawingsInPage, { scope, cellSel: '[data-ws-cell], .mq-scell, .problem-card' });
                        renders++;
                        await page.evaluate(() => { try { window.state.quizMode = false; } catch (e) { /* ignore */ } });
                        if (sc.error) { notes.add(`${tag} ${host} ${w}: ${sc.error}`); continue; }
                        if (!sc.drawings.length) continue;
                        judgeHost({ where: `${tag} ${host} ${w}px${host === 'card' ? ` seed ${run.s}` : ''}`, drawings: sc.drawings, ref, F, notes });
                    }
                }
                if (refKinds.length) notes.add(`${tag}: print ${SIZE} ${refKinds.map((k) => `"${k}" ${ref[k].toFixed(2)} mm`).join(', ')}`);
            }
            await page.evaluate(() => { try { window.clearSetOptions({ silent: true }); } catch (e) { /* ignore */ } });
        }
        if (app.problems.length) notes.add(`console: ${app.problems.slice(0, 3).map((p) => p.text).join(' | ')}`);
    } finally { await app.close(); }
    // the same finding repeated over card seeds is kept: each is one screen render
    for (const n of notes) console.log(`note: ${n}`);
    for (const x of findings) console.log(`${x.rule} ${x.where}: ${x.msg}`);
    console.log(`(${SKILLS.length} skill(s)${HTML ? ' + fixture' : ''}, ${renders} renders, ${((Date.now() - T0) / 1000).toFixed(0)} s)`);
    if (arg('json', null)) fs.writeFileSync(path.resolve(process.cwd(), arg('json')), JSON.stringify({ skills: SKILLS, findings, notes: [...notes], renders }, null, 1));
    const bad = findings.length || (!renders ? 1 : 0);
    console.log(`${NAME}: ${bad ? `FAIL (${findings.length || 'nothing rendered'})` : 'OK'}`);
    process.exit(bad && !has('report-only') ? 1 : 0);
}

if (require.main === module && !has('self-test')) main().catch((e) => { console.error(e); console.log(`${NAME}: FAIL`); process.exit(1); });

module.exports = { median, inkFinding, widthFinding, printSizes };
