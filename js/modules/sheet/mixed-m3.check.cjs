// js/modules/sheet/mixed-m3.check.cjs
// THE MIXED PAGE CHECK, M3 - what the PUPIL SEES (IMPROVEMENT_PLAN §1.7 stop of lane "mixed pages M2" after critic r2;
// design/status/mixed-pages.md "Machine checks required"). Every rule below is a HARD FAIL. There is NO WARN tier for
// anything the rubric grades, and a lane may NOT soften, skip, widen a tolerance or add an exemption to any rule in this
// file to get green: fix the page. (Root cause 1 of the stop: the builder's own check could pass what the critic failed,
// because it WARNed, counted in the packer's units and left the critic's sets out of its matrix.)
//
// Everything is measured in the DOM of the printed pupil pages, in PROBLEMS and ROWS in print order (page by page, then
// the cell's number tab), never in the packer's units (turns, shelves, budgets):
//
//   runs     (checkRuns)     the longest run of one skill, counted in problems in print order ACROSS page breaks. A run
//                            over 2 FAILS unless (a) the weights force it - it is no longer than ceil(major / (minor + 1)),
//                            the shortest longest-run any order of these counts can give - AND (b) the page notes state
//                            that run truthfully ("up to N ... come in a row", N = the printed run). Mixed up only.
//   rowfill  (checkRowFill)  every row (one grid row track: the band of cells at one y) holds problems across >= 1/2 of the
//                            band's width; the unruled trailing area is <= 1/2 a row; a page that is not the last never
//                            ends in a short row (its last row is full).
//   spread   (checkSpread)   a skill with fewer problems than another: the gap between two of its consecutive problems
//                            (print order, across pages) is <= 1.5 x the even gap (problems / its count) + 1. Mixed up only.
//   align    (checkAlign)    every stacked computation cell (any template: kit fact, kit stack, legacy stack - a cell with
//                            a drawn answer rule) whose box starts in one row: the first rule's y within 1 mm.
//   digits   (checkDigits)   the cap height of the computation digits (operands above the first rule; the glyph '8' of
//                            the digit's own font, measured on a canvas) within 10 % across every stacked cell of a page.
//   spare    (checkSpare)    the pupil body is >= 85 % used and no more than 25 mm is blank under the lowest cell, on
//                            every page of a fill page (no counts) and every page but the last of an exact-count print.
//
//   node js/modules/sheet/mixed-m3.check.cjs [--quick] [--seeds 2] [--only a,b] [--checks runs,rowfill] [--all]
//   node js/modules/sheet/mixed-m3.check.cjs --fixture <page.html> [--checks ...]   # a saved / hand-made page (backtest)
//   node js/modules/sheet/mixed-m3.check.cjs --capture <dir>                         # save the matrix's pages as fixtures
//
// A fixture is pupil-page HTML whose problem cells carry data-ws-skill, plus <script type="application/json"
// id="mq-chk-ctx">{"arrangement":"mixed","counts":true|false,"notes":[...]}</script>. Matrix (the critics' sets): a
// multiply + add_facts, b add_facts + mult_2by2_standard, c add_facts + add_word_problems, d fractions identify + subtract
// (fill pages, Daily and I Can, S / M / L, 2 seeds: the critic's seed and one more); e exact 3 : 37 across pages at
// S / M / L; f I Can L of b; g In sections of b at S / M / L. --quick: 1 seed (the critic's), M and S, Daily, plus f.
// Prints `mixed-m3 check: OK` / `FAIL` and exits 1 on a failure.
'use strict';
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const ALL_CHECKS = ['runs', 'rowfill', 'spread', 'align', 'digits', 'spare'];
const MM = 96 / 25.4;

/* ================================================================ pure judges (node) */
// page = {last, bodyMm, freeMm, cells:[{n, skill, tpl}], rows:[{grid, usedFrac, trailFrac, last}], stacks:[{row, ruleMm, capMm, label}]}

/** The problems in print order across pages: [{skill, page, n}]. */
function printOrder(pages) {
    return pages.flatMap((pg, i) => pg.cells.slice().sort((a, b) => a.n - b.n).map((c) => ({ skill: c.skill || '?', page: i + 1, n: c.n })));
}
function countsOf(seq) { const c = {}; for (const x of seq) c[x.skill] = (c[x.skill] || 0) + 1; return c; }

/** 1 runs: longest run per skill in problems, against the forced minimum and the notes. */
function checkRuns(pages, ctx) {
    const out = [];
    if (ctx.arrangement !== 'mixed') return out;
    const seq = printOrder(pages);
    const cnt = countsOf(seq);
    if (Object.keys(cnt).length < 2) return out;
    const N = seq.length;
    const notes = (ctx.notes || []).join(' | ');
    const stated = [...notes.matchAll(/up to (\d+) [^|]*? come in a row/g)].map((m) => Number(m[1]));
    for (const sk of Object.keys(cnt)) {
        let best = 0; let run = 0; let at = null; let cur = null;
        for (const x of seq) { if (x.skill === sk) { if (!run) cur = x; run++; if (run > best) { best = run; at = cur; } } else run = 0; }
        if (best <= 2) continue;
        const forced = Math.ceil(cnt[sk] / (N - cnt[sk] + 1));
        const where = `from page ${at.page} problem ${at.n}`;
        if (best > forced) out.push(`runs: ${best} ${sk} problems in a row (${where}); ${cnt[sk]} of ${N} can be spread to runs of ${Math.max(2, forced)}`);
        else if (!stated.includes(best)) out.push(`runs: ${best} ${sk} problems in a row (${where}), forced by the weights, but no note states "up to ${best} ... come in a row"${stated.length ? ` (the notes say ${stated.join(' / ')})` : ''}`);
    }
    return out;
}

/** 2 rowfill: every row >= 1/2 used, trailing area <= 1/2, a non-last page ends in a full row. */
function checkRowFill(pages) {
    const out = [];
    pages.forEach((pg, i) => {
        for (const r of pg.rows) {
            if (r.usedFrac < 0.5 - 1e-6) out.push(`rowfill: page ${i + 1} grid ${r.grid + 1} row ${r.row + 1} holds problems across ${(r.usedFrac * 100).toFixed(0)} % of its width (>= 50 %)`);
            if (r.trailFrac > 0.5 + 1e-6) out.push(`rowfill: page ${i + 1} grid ${r.grid + 1} row ${r.row + 1} ends in a trailing area ${(r.trailFrac * 100).toFixed(0)} % of the row (<= 50 %)`);
        }
        const lastRow = pg.rows.filter((r) => r.lastOnPage)[0];
        if (!pg.last && lastRow && lastRow.usedFrac < 0.98) out.push(`rowfill: page ${i + 1} (not the last) ends in a short row: ${(lastRow.usedFrac * 100).toFixed(0)} % of the width holds problems`);
    });
    return out;
}

/** 3 spread: a skill with fewer problems than another, its consecutive gaps <= 1.5 x even + 1. */
function checkSpread(pages, ctx) {
    const out = [];
    if (ctx.arrangement !== 'mixed') return out;
    const seq = printOrder(pages);
    const cnt = countsOf(seq);
    const ks = Object.keys(cnt);
    if (ks.length < 2) return out;
    const top = Math.max(...Object.values(cnt));
    for (const sk of ks) {
        if (cnt[sk] >= top || cnt[sk] < 2) continue;
        const pos = seq.map((x, i) => (x.skill === sk ? i : -1)).filter((i) => i >= 0);
        const even = seq.length / cnt[sk];
        const lim = 1.5 * even + 1;
        for (let j = 1; j < pos.length; j++) {
            const gap = pos[j] - pos[j - 1];
            if (gap > lim + 1e-9) out.push(`spread: ${sk} (${cnt[sk]} of ${seq.length}) problems ${seq[pos[j - 1]].page}:${seq[pos[j - 1]].n} and ${seq[pos[j]].page}:${seq[pos[j]].n} are ${gap} apart; the even gap is ${even.toFixed(1)} (<= ${lim.toFixed(1)})`);
        }
    }
    return out;
}

/** 4 align: stacked cells starting in one row put their first rule within 1 mm. */
function checkAlign(pages) {
    const out = [];
    pages.forEach((pg, i) => {
        const rows = new Map();
        for (const s of pg.stacks) { const k = `${s.grid}|${s.row}`; if (!rows.has(k)) rows.set(k, []); rows.get(k).push(s); }
        for (const [k, xs] of rows) {
            if (xs.length < 2) continue;
            const ys = xs.map((x) => x.ruleMm);
            const lo = Math.min(...ys); const hi = Math.max(...ys);
            if (hi - lo > 1 + 1e-6) {
                const a = xs.find((x) => x.ruleMm === lo); const b = xs.find((x) => x.ruleMm === hi);
                out.push(`align: page ${i + 1} grid ${Number(k.split('|')[0]) + 1} row ${Number(k.split('|')[1]) + 1}: answer rules ${(hi - lo).toFixed(1)} mm apart (cell ${a.label} ${a.tpl} vs cell ${b.label} ${b.tpl}; <= 1 mm)`);
            }
        }
    });
    return out;
}

/** 5 digits: computation digits' cap height within 10 % on a page. */
function checkDigits(pages) {
    const out = [];
    pages.forEach((pg, i) => {
        const xs = pg.stacks.filter((s) => s.capMm > 0);
        if (xs.length < 2) return;
        const lo = xs.reduce((a, b) => (b.capMm < a.capMm ? b : a));
        const hi = xs.reduce((a, b) => (b.capMm > a.capMm ? b : a));
        if (hi.capMm > lo.capMm * 1.10 + 1e-9) out.push(`digits: page ${i + 1}: computation digits ${lo.capMm.toFixed(2)} mm (cell ${lo.label} ${lo.tpl}) to ${hi.capMm.toFixed(2)} mm (cell ${hi.label} ${hi.tpl}) cap height, ${((lo.capMm / hi.capMm) * 100).toFixed(0)} % (within 10 %)`);
    });
    return out;
}

/** 6 spare: >= 85 % of the body used and <= 25 mm blank, on fill pages and on every non-last page. */
function checkSpare(pages, ctx) {
    const out = [];
    pages.forEach((pg, i) => {
        if (pg.last && ctx.counts) return;
        const used = 1 - pg.freeMm / pg.bodyMm;
        if (pg.freeMm > 25 + 1e-6 || used < 0.85 - 1e-6) out.push(`spare: page ${i + 1}${pg.last ? '' : ' (not the last)'}: ${pg.freeMm.toFixed(0)} mm blank under the lowest cell, body ${(used * 100).toFixed(0)} % used (>= 85 %, <= 25 mm)`);
    });
    return out;
}

const JUDGES = { runs: checkRuns, rowfill: checkRowFill, spread: checkSpread, align: checkAlign, digits: checkDigits, spare: checkSpare };
function judge(pages, ctx, checks = ALL_CHECKS) {
    const out = {};
    for (const c of checks) out[c] = JUDGES[c](pages, ctx);
    return out;
}

/* ================================================================ the DOM measure (browser) */
// MEASURE_FN(html, ctx): lays the pupil html out off-screen in the app page and returns the pages above.
// ctx.items (optional): buildSheet's plan grid items per page [[skill...]] to attribute cells that carry no data-ws-skill.
const MEASURE_FN = async ({ html, perPage }) => {
    const mm = 96 / 25.4;
    try { await document.fonts.ready; } catch (e) { /* */ }
    const host = document.createElement('div');
    host.style.cssText = 'position:absolute;left:-12000px;top:0;width:230mm';
    host.innerHTML = html;
    document.body.appendChild(host);
    const canvas = document.createElement('canvas').getContext('2d');
    const capOf = (el) => {
        const cs = getComputedStyle(el);
        canvas.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const m = canvas.measureText('8');
        return (m.actualBoundingBoxAscent || parseFloat(cs.fontSize) * 0.7) / mm;
    };
    const CELL = '.ws-cell:not(.blankrun)';
    const isTrail = (c) => c.classList.contains('blankrun');
    const pages = [];
    const pgs = [...host.querySelectorAll('.ws-page')].filter((p) => p.getAttribute('data-ws-mode') !== 'key');
    pgs.forEach((pg, pi) => {
        const body = pg.querySelector('.ws-body') || pg;
        const bb = body.getBoundingClientRect();
        const out = { last: pi === pgs.length - 1, bodyMm: bb.height / mm, freeMm: 0, cells: [], rows: [], stacks: [], unattributed: 0 };
        const grids = [...pg.querySelectorAll('.ws-grid')].filter((g) => !g.parentElement.closest('.ws-cell'));
        // attribution by order (plan grid items of this page) where the cells carry no data-ws-skill
        const tabbed = grids.flatMap((g) => [...g.children].filter((c) => c.matches(CELL) && c.querySelector(':scope > .ws-tab, :scope > .ws-letter')));
        const want = perPage && perPage[pi];
        if (want && want.length === tabbed.length) tabbed.forEach((c, i) => { if (!c.getAttribute('data-ws-skill') && want[i]) c.setAttribute('data-ws-skill', want[i]); });
        let lowest = bb.top;
        grids.forEach((g, gi) => {
            const gr = g.getBoundingClientRect();
            const kids = [...g.children].filter((c) => c.classList.contains('ws-cell'));
            const cells = kids.filter((c) => !isTrail(c));
            const trails = kids.filter(isTrail);
            for (const c of kids) lowest = Math.max(lowest, c.getBoundingClientRect().bottom);
            // the row tracks: the grid's resolved template rows, else the distinct tops of its cells
            let tracks = [];
            const tpl = getComputedStyle(g).gridTemplateRows;
            if (getComputedStyle(g).display.includes('grid') && tpl && tpl !== 'none') {
                let y = gr.top + (parseFloat(getComputedStyle(g).paddingTop) || 0);
                const gap = parseFloat(getComputedStyle(g).rowGap) || 0;
                for (const t of tpl.split(/\s+/).map(parseFloat).filter((v) => v > 0)) { tracks.push([y, y + t]); y += t + gap; }
            }
            if (!tracks.length) {
                const tops = [...new Set(cells.map((c) => Math.round(c.getBoundingClientRect().top)))].sort((a, b) => a - b);
                tracks = tops.map((t, i) => [t, i + 1 < tops.length ? tops[i + 1] : Math.max(...cells.map((c) => c.getBoundingClientRect().bottom))]);
            }
            // a track with no cell at all (an empty grid row) still counts: it is a blank row the pupil sees
            const trackOf = (y) => { let best = 0; tracks.forEach((t, i) => { if (y >= t[0] - 2) best = i; }); return best; };
            const lastTrack = tracks.length - 1;
            tracks.forEach(([y0, y1], ti) => {
                const mid = (y0 + y1) / 2;
                const over = (c) => { const r = c.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; };
                const w = (xs) => xs.filter(over).reduce((a, c) => a + c.getBoundingClientRect().width, 0);
                out.rows.push({ grid: gi, row: ti, usedFrac: Math.min(1, w(cells) / gr.width), trailFrac: w(trails) / gr.width, lastOnPage: gi === grids.length - 1 && ti === lastTrack });
            });
            for (const c of cells) {
                const r = c.getBoundingClientRect();
                const tab = c.querySelector(':scope > .ws-tab, :scope > .ws-letter');
                const label = tab ? tab.textContent.trim() : '';
                if (!tab) continue;
                const n = Number(label.replace(/\D/g, '')) || out.cells.length + 1;
                const tplName = (c.getAttribute('data-ws-cell') || (c.className.match(/mqt--([\w-]+)/) || [])[1] || '');
                const skill = c.getAttribute('data-ws-skill') || '';
                if (!skill) out.unattributed++;
                out.cells.push({ n, skill, tpl: tplName });
                // a stacked computation: a drawn answer rule (kit .rule, legacy .stack-rule) under operands with a sign
                const rule = [...c.querySelectorAll('.rule, .stack-rule')].filter((e) => !e.closest('.ws-tab,.ws-letter,.ws-mixcue') && e.getBoundingClientRect().width > 0)
                    .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
                if (!rule || !/[+−×÷-]/.test(c.textContent || '')) continue;
                const ry = rule.getBoundingClientRect().top + (parseFloat(getComputedStyle(rule).borderTopWidth) || 0) / 2;
                let cap = 0;
                for (const e of c.querySelectorAll('*')) {
                    if (e.children.length || e.closest('.ws-tab,.ws-letter,.ws-mixcue,[data-ws-ink],[data-ws-slot],.ws-legacy-answer')) continue;
                    if (!/^\s*\d+\s*$/.test(e.textContent || '')) continue;
                    const er = e.getBoundingClientRect();
                    if (er.bottom > ry + 1 || er.width === 0) continue;
                    cap = Math.max(cap, capOf(e));
                }
                out.stacks.push({ grid: gi, row: trackOf(r.top), ruleMm: (ry - bb.top) / mm, capMm: cap, label, tpl: tplName });
            }
        });
        out.freeMm = Math.max(0, (bb.bottom - lowest) / mm);
        pages.push(out);
    });
    host.remove();
    return pages;
};

/* ================================================================ the matrix */
const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > -1 ? process.argv[i + 1] : d; };
const QUICK = process.argv.includes('--quick');
const SEEDS = Math.max(1, Number(arg('seeds', QUICK ? 1 : 2)) || 1);
const ONLY = arg('only', '') ? arg('only', '').split(',') : null;
const CHECKS = arg('checks', '') ? arg('checks', '').split(',') : ALL_CHECKS;
const sk = (id) => { const [categoryId, skillId] = id.split(':'); return { categoryId, skillId, opts: {} }; };
const SETS = {
    a: { skills: ['multiplication:multiply', 'addition:add_facts'], seed: 469182 },
    b: { skills: ['addition:add_facts', 'multiplication:mult_2by2_standard'], seed: 722369 },
    c: { skills: ['addition:add_facts', 'addition:add_word_problems'], seed: 722369 },
    d: { skills: ['fractions:identify', 'subtraction:subtract'], seed: 250230 },
};
function scenarios() {
    const out = [];
    const sizes = QUICK ? ['M', 'S'] : ['S', 'M', 'L'];
    const looks = QUICK ? ['daily'] : ['daily', 'ican'];
    const seeds = (s0) => [s0, 4037, 5113].slice(0, SEEDS);
    const want = (k) => !ONLY || ONLY.includes(k);
    for (const k of Object.keys(SETS)) if (want(k)) for (const seed of seeds(SETS[k].seed)) for (const look of looks) for (const size of sizes) {
        out.push({ id: `${k} mixed ${look} ${size} seed ${seed}`, set: SETS[k].skills, arr: 'mixed', look, size, seed });
    }
    if (want('e')) for (const seed of seeds(SETS.a.seed)) for (const size of QUICK ? ['M', 'S'] : ['S', 'M', 'L']) out.push({ id: `e exact 3:37 daily ${size} seed ${seed}`, set: SETS.a.skills, counts: [3, 37], arr: 'mixed', look: 'daily', size, seed });
    if (want('f') && (QUICK || !want('b'))) out.push({ id: `f mixed ican L seed ${SETS.b.seed}`, set: SETS.b.skills, arr: 'mixed', look: 'ican', size: 'L', seed: SETS.b.seed });
    if (want('g')) for (const seed of seeds(SETS.b.seed)) for (const size of QUICK ? ['M', 'S'] : ['S', 'M', 'L']) out.push({ id: `g sections daily ${size} seed ${seed}`, set: SETS.b.skills, arr: 'sections', look: 'daily', size, seed });
    return out;
}

// build in the page: the pupil html, notes and the skill of every tabbed cell per page (from the plan's grid items)
const BUILD_FN = async (req) => {
    const o = await window.buildSheet(req);
    const perPage = (o.plan.pages || []).map((pg) => {
        const xs = [];
        const walk = (p) => { if (!p) return; if (p.kind === 'grid') for (const it of p.items || []) { if (it && it.q && !it.model && !it.nolabel) xs.push(it.skill || (it.q.categoryId && it.q.skillId ? `${it.q.categoryId}:${it.q.skillId}` : '')); } (p.contents || []).forEach(walk); if (p.content) walk(p.content); };
        (pg.sections || []).forEach(walk);
        return xs;
    });
    return { html: o.pupilHtml, perPage, notes: o.notes || [], arrangement: o.arrangement, pages: o.pageCount };
};

function report(id, res, fails) {
    for (const c of Object.keys(res)) for (const f of res[c]) fails.push({ check: c, line: `${id}: ${f}` });
}

async function main() {
    const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
    const fixture = arg('fixture', '');
    const capture = arg('capture', '');
    const app = await open({ seed: 12345 });
    const fails = [];
    let n = 0; let pagesN = 0;
    try {
        if (fixture) {
            const html = fs.readFileSync(path.resolve(fixture), 'utf8');
            const m = /<script type="application\/json" id="mq-chk-ctx">([\s\S]*?)<\/script>/.exec(html);
            const ctx = m ? JSON.parse(m[1]) : { arrangement: 'mixed', counts: false, notes: [] };
            const pages = await app.page.evaluate(MEASURE_FN, { html: html.replace(m ? m[0] : '', ''), perPage: null });
            n = 1; pagesN = pages.length;
            if (!pages.length) fails.push({ check: 'measure', line: `${fixture}: no .ws-page in the fixture` });
            // (what was measured, so a pass is never vacuous)
            console.log(`  measured: ${pages.length} page(s), ${pages.reduce((a, p) => a + p.cells.length, 0)} problems, ${pages.reduce((a, p) => a + p.rows.length, 0)} rows, ${pages.reduce((a, p) => a + p.stacks.length, 0)} stacked cells`);
            if (!pages.some((p) => p.cells.length)) fails.push({ check: 'measure', line: `${fixture}: no tabbed problem cell measured` });
            const un = pages.reduce((a, p) => a + p.unattributed, 0);
            if (un) fails.push({ check: 'measure', line: `${fixture}: ${un} problem cell(s) carry no data-ws-skill` });
            report(path.basename(fixture), judge(pages, ctx, CHECKS), fails);
        } else {
            for (const sc of scenarios()) {
                const counts = !!sc.counts;
                const sections = counts ? sc.set.map((id, i) => ({ skills: [sk(id)], count: sc.counts[i] })) : [{ skills: sc.set.map(sk) }];
                const req = { role: 'mixed-practice', arrangement: sc.arr, sections, size: sc.size, look: sc.look, seed: sc.seed, key: false };
                let b;
                try { b = await app.page.evaluate(BUILD_FN, req); } catch (e) { fails.push({ check: 'build', line: `${sc.id}: build failed: ${String(e.message || e).slice(0, 200)}` }); continue; }
                const pages = await app.page.evaluate(MEASURE_FN, { html: b.html, perPage: b.perPage });
                n++; pagesN += pages.length;
                const un = pages.reduce((a, p) => a + p.unattributed, 0);
                if (un && CHECKS.some((c) => c === 'runs' || c === 'spread')) fails.push({ check: 'measure', line: `${sc.id}: ${un} problem cell(s) could not be given their skill (plan items vs printed cells)` });
                const ctx = { arrangement: b.arrangement || sc.arr, counts, notes: b.notes };
                report(sc.id, judge(pages, ctx, CHECKS), fails);
                if (capture) {
                    fs.mkdirSync(capture, { recursive: true });
                    // the pupil html with each cell's skill written in, and the context the judges read
                    const tagged = await app.page.evaluate(({ html, perPage }) => {
                        const host = document.createElement('div'); host.innerHTML = html;
                        [...host.querySelectorAll('.ws-page')].forEach((pg, pi) => {
                            const cs = [...pg.querySelectorAll('.ws-grid')].filter((g) => !g.parentElement.closest('.ws-cell')).flatMap((g) => [...g.children].filter((c) => c.matches('.ws-cell:not(.blankrun)') && c.querySelector(':scope > .ws-tab, :scope > .ws-letter')));
                            const want = perPage[pi] || [];
                            if (want.length === cs.length) cs.forEach((c, i) => c.setAttribute('data-ws-skill', want[i]));
                        });
                        return host.innerHTML;
                    }, { html: b.html, perPage: b.perPage });
                    const file = path.join(capture, `${sc.id.replace(/[^\w]+/g, '-')}.html`);
                    fs.writeFileSync(file, `<script type="application/json" id="mq-chk-ctx">${JSON.stringify(ctx)}</script>\n${tagged}`);
                }
            }
        }
    } finally {
        await app.close();
    }
    const by = {};
    for (const f of fails) by[f.check] = (by[f.check] || 0) + 1;
    const lim = process.argv.includes('--all') ? 1e6 : 80;
    for (const f of fails.slice(0, lim)) console.log(`  FAIL ${f.line}`);
    if (fails.length > lim) console.log(`  ... ${fails.length - lim} more (--all)`);
    console.log(`  per check: ${CHECKS.map((c) => `${c} ${by[c] || 0}`).join(' · ')}${by.measure ? ` · measure ${by.measure}` : ''}${by.build ? ` · build ${by.build}` : ''}`);
    // (two verdict lines: `mixed-m3: X` is the one ws-backtest reads, `mixed-m3 check: X` the one ws-precritic reads)
    console.log(`mixed-m3: ${fails.length ? 'FAIL' : 'OK'}`);
    console.log(`mixed-m3 check: ${fails.length ? 'FAIL' : 'OK'} (${n} ${fixture ? 'fixture' : 'scenarios'}, ${pagesN} pages${QUICK ? ', quick' : ''}; ${fails.length} failure(s))`);
    process.exit(fails.length ? 1 : 0);
}

module.exports = { judge, checkRuns, checkRowFill, checkSpread, checkAlign, checkDigits, checkSpare, printOrder, ALL_CHECKS, MEASURE_FN };
if (require.main === module) main().catch((e) => { console.error(e); process.exit(1); });
