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
//   boxes    (checkBoxes)    (critic r3 P1) every area enclosed by drawn rules holds a problem: inside a problem grid, no
//                            area of 100 mm2 or more is covered by no problem cell (an empty ruled box, a trailing
//                            blank box, an empty row track).
//   across   (checkAcross)   (critic r3 P3, PT-MIX-3) one count across for every FULL row of a sheet: the full rows of
//                            every page of one print hold the same number of problems. Mixed up, exact counts.
//   width    (checkWidth)    (critic r3 P2, H13 by width) no problem cell is wider than its content / 0.45 (>= 30 %
//                            empty each side), measured on the drawing's own ink box.
//   frame    (checkFrame)    (2026-11-03, the owner's 6-skill mix; hand-over addendum) every problem cell's four edges are
//                            drawn (>= 97 % of each edge is ink: the grid's gap / border, the frame, or the cell's border) and
//                            no grid rule runs more than 3 mm past the cells of the row it closes.
//   shelfw   (checkShelfWidth) every problem grid spans the frame's inner width (<= 2 mm short each side); only the last
//                            grid of the last page may stop short, at its right end.
//   fill     (checkFill)     (owner: "fill the paper") a mixed page's problem cells cover >= 85 % of the frame, and the page
//                            holds >= In sections' per-page count for the same skills at that size, less one row.
//   partials (checkPartials) a 2-digit x cell on a mixed page draws the work rows of its own single-skill page.
//   columns  (checkColumns)  req.columns = N (the print dialog's Columns control): every full row holds N problems.
//   sml      (checkSml)      S holds more problems a page than M, M more than L, for the owner's facts-only mix.
//   kinds    (checkKinds)    (owner 2026-11-03, layout A "Rows by type", the DEFAULT) each cell names its kind
//                            (data-ws-kind); fast facts are 'fact'; one kind a row; one count across per kind; kinds
//                            alternate row by row (runs of rows <= the forced minimum). In A, runs / spread are judged
//                            within each kind and the one-count `across` gives way to this.
//   layout   (checkLayout)   req.mixLayout 'rows' | 'grid' | 'even' (absent = 'rows') is reported as fits.mixLayout; C
//                            ("Even grid") boxes all one height. B ("One grid"): runs up to 2 x (across - 1) allowed.
//   Set o = the owner's mix (add / sub facts 20, mult / div facts 12, missing +/-, missing x/÷; 41 = 7,7,7,7,7,6).
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
// (`boxes`, `width` and `across`, critic r3 P1 / P2 / P3, run by default as HARD FAILs - the lane lead's ruling at the
// hand-over, 2026-10-31: a check may not be opt-in to keep a branch green; they are RED until the engine passes them,
// see design/status/mixed-pages.md "Hand-over")
const ALL_CHECKS = ['runs', 'rowfill', 'spread', 'align', 'digits', 'spare', 'boxes', 'width', 'across', 'frame', 'shelfw', 'fill', 'partials', 'columns', 'sml', 'kinds', 'layout'];
const KNOWN_CHECKS = [...ALL_CHECKS];
const MM = 96 / 25.4;

/* ================================================================ pure judges (node) */
// page = {last, bodyMm, freeMm, cells:[{n, skill, tpl}], rows:[{grid, usedFrac, trailFrac, last}], stacks:[{row, ruleMm, capMm, label}]}

/** The problems in print order across pages: [{skill, page, n}]. */
function printOrder(pages) {
    return pages.flatMap((pg, i) => pg.cells.slice().sort((a, b) => a.n - b.n).map((c) => ({ skill: c.skill || '?', page: i + 1, n: c.n, kind: c.kind || '' })));
}
function countsOf(seq) { const c = {}; for (const x of seq) c[x.skill] = (c[x.skill] || 0) + 1; return c; }

/** 1 runs: longest run per skill in problems, against the forced minimum and the notes. */
function checkRuns(pages, ctx) {
    const out = [];
    if (ctx.arrangement !== 'mixed') return out;
    // (owner 2026-11-03, layout A "Rows by type": a row holds one kind, so runs are judged within each kind's own problems)
    if (ctx.layout === 'rows') {
        const kinds = [...new Set(printOrder(pages).map((x) => x.kind))];
        if (kinds.length > 1) { for (const k of kinds) out.push(...checkRuns(pages.map((pg) => ({ ...pg, cells: pg.cells.filter((c) => c.kind === k) })), { ...ctx, layout: 'rows-kind' })); return out; }
    }
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
        // (owner 2026-11-03, layout B "One grid": a long box stands two rows tall, and the facts beside it may run up to
        // 2 x (count across - 1) - allowed without a note)
        if (ctx.layout === 'grid' && ctx.across && best <= Math.max(forced, 2 * (ctx.across - 1))) continue;
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
    if (ctx.layout === 'rows') {
        const kinds = [...new Set(printOrder(pages).map((x) => x.kind))];
        if (kinds.length > 1) { for (const k of kinds) out.push(...checkSpread(pages.map((pg) => ({ ...pg, cells: pg.cells.filter((c) => c.kind === k) })), { ...ctx, layout: 'rows-kind' })); return out; }
    }
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

/** 7 boxes: no empty ruled area inside a problem grid. */
function checkBoxes(pages) {
    const out = [];
    pages.forEach((pg, i) => { for (const h of pg.holes || []) if (h.mm2 >= 100) out.push(`boxes: page ${i + 1} grid ${h.grid + 1}: an area of ${Math.round(h.mm2)} mm2 enclosed by rules holds no problem (near ${h.at})`); });
    return out;
}

/** 8 across: every full row of a mixed exact-count print holds the same count of problems. */
function checkAcross(pages, ctx) {
    const out = [];
    if (ctx.layout === 'rows') return out;   // (A: one count per KIND, checkKinds)
    if (ctx.arrangement !== 'mixed' || !ctx.counts || pages.length < 2) return out;
    const per = pages.map((pg) => (pg.fullRows || []).map((r) => r.n));
    const all = [...new Set(per.flat())];
    if (all.length > 1) out.push(`across: the full rows hold ${per.map((xs, i) => `page ${i + 1}: ${[...new Set(xs)].join('/') || '-'}`).join('; ')} problems across (one count for every full row of the sheet)`);
    return out;
}

/** 9 width: a cell no wider than its content / 0.45. */
function checkWidth(pages) {
    const out = [];
    pages.forEach((pg, i) => { for (const c of pg.wide || []) out.push(`width: page ${i + 1} cell ${c.label} (${c.tpl}) is ${c.cellMm.toFixed(0)} mm wide for ${c.inkMm.toFixed(0)} mm of problem (${Math.round((c.inkMm / c.cellMm) * 100)} %; >= 45 %)`); });
    return out;
}

/** 10 frame (2026-11-03): every problem cell's four edges drawn (>= 97 % of each by a rule), no rule runs loose past the
 *  cells it closes by more than 2 mm (a rule ends at the frame or at another cell's edge). */
function checkFrame(pages) {
    const out = [];
    pages.forEach((pg, i) => {
        const open = pg.openEdges || [];
        if (open.length) out.push(`frame: page ${i + 1}: ${open.length} cell edge(s) not closed by a rule - ${open.slice(0, 6).map((e) => `cell ${e.label} ${e.side} ${Math.round(e.frac * 100)} %`).join(', ')}`);
        const dl = pg.dangling || [];
        if (dl.length) out.push(`frame: page ${i + 1}: ${dl.length} rule(s) run loose past the cells - ${dl.slice(0, 4).map((d) => `${d.h ? 'horizontal' : 'vertical'} ${d.src} rule at ${d.atMm.toFixed(0)} mm, ${d.mm.toFixed(0)} mm loose`).join(', ')}`);
    });
    return out;
}

/** 11 shelfw (2026-11-03): every problem grid spans the frame's inner width (within 2 mm each side); only the last grid of
 *  the last page may stop short, and only at its right end. */
function checkShelfWidth(pages) {
    const out = [];
    pages.forEach((pg, i) => {
        for (const s of pg.shelves || []) {
            const endOk = s.rightMm <= 2 || (pg.last && s.last);
            if (s.leftMm > 2 || !endOk) out.push(`shelfw: page ${i + 1} grid ${s.grid + 1}: ${s.leftMm.toFixed(0)} mm short at the left, ${s.rightMm.toFixed(0)} mm at the right of the frame (<= 2 mm)`);
        }
    });
    return out;
}

/** 12 fill (2026-11-03, owner: "fill the paper"): on a mixed page (every page of a fill print, every page but the last of
 *  an exact-count print) the problem cells cover >= 70 % of the frame's inner area, and the page holds no fewer problems
 *  than In sections puts on a page for the same skills, less one row (its count across). */
function checkFill(pages, ctx) {
    const out = [];
    if (ctx.arrangement !== 'mixed') return out;
    pages.forEach((pg, i) => {
        if (pg.last && ctx.counts) return;
        // (OWNER, 2026-11-03: an explicit Columns count WINS - the teacher's count and big digits are kept and white space is
        // allowed; the fill floor applies to Auto only. Every other check still runs on a Columns print.)
        if (ctx.columns) return;
        // (OWNER, 2026-11-03: "fit them all and have no white space" - >= 85 % of the frame on every page but the last; "unless
        // there were limited problems" - the last page of an exact-count print, and a print shorter than a page, is exempt above)
        if ((pg.fillFrac || 0) < 0.85 - 1e-6) out.push(`fill: page ${i + 1}: problems cover ${Math.round((pg.fillFrac || 0) * 100)} % of the frame (>= 85 %)`);
        if (ctx.sectionsPerPage) {
            const across = Math.max(1, ...(pg.fullRows || []).map((r) => r.n));
            const floor = ctx.sectionsPerPage - across;
            if (pg.cells.length < floor) out.push(`fill: page ${i + 1}: ${pg.cells.length} problems; In sections holds ${ctx.sectionsPerPage} a page for these skills at this size (>= ${floor}, one row of ${across} less)`);
        }
    });
    return out;
}

/** 13 partials (2026-11-03): a 2-digit x cell on a mixed page draws the same work rows (partial-product rows, second rule)
 *  as on its single-skill page. */
function checkPartials(pages, ctx) {
    const out = [];
    if (!ctx.workRef) return out;
    pages.forEach((pg, i) => {
        for (const w of pg.work || []) if (w.prows !== ctx.workRef.prows || w.rule2 !== ctx.workRef.rule2) out.push(`partials: page ${i + 1} cell ${w.label}: ${w.prows} partial-product row(s), ${w.rule2} second rule(s); its own page draws ${ctx.workRef.prows} and ${ctx.workRef.rule2}`);
    });
    return out;
}

/** 14 sml (2026-11-03): S holds more problems a page than M, M more than L, for the same facts-only mix (no exemption:
 *  S may equal M only when a non-shrinking visual sets every row - mixed-m2 h13Exempt - never on a facts-only mix). */
function checkSml(perSize, id) {
    const out = [];
    const { S, M, L } = perSize;
    if (S != null && M != null && !(S > M)) out.push(`sml: ${id}: S ${S} a page, M ${M} (S > M)`);
    if (M != null && L != null && !(M > L)) out.push(`sml: ${id}: M ${M} a page, L ${L} (M > L)`);
    return out;
}

/** 15 columns (2026-11-03, the print dialog's Columns control): with req.columns = N every full row holds N problems. */
function checkColumns(pages, ctx) {
    const out = [];
    if (!ctx.columns) return out;
    pages.forEach((pg, i) => { const bad = (pg.fullRows || []).filter((r) => r.n !== ctx.columns); if (bad.length || !(pg.fullRows || []).length) out.push(`columns: page ${i + 1}: full rows hold ${[...new Set((pg.fullRows || []).map((r) => r.n))].join('/') || 'none'} across, Columns asked ${ctx.columns}`); });
    return out;
}

const FACT_SKILL = (sk) => /_facts$/.test(sk.split(':')[1] || '') || sk === 'multiplication:multiply';
/** 16 kinds (owner 2026-11-03, layout A "Rows by type", the default): every problem cell names its kind (data-ws-kind);
 *  one kind per skill; fast-fact skills (*_facts, multiply table facts) are the kind 'fact' and no other skill is; every
 *  row holds ONE kind; each kind's full rows hold ONE count across over the whole print; rows of a kind come in runs no
 *  longer than the forced ceil(rowsK / (other rows + 1)) (kinds alternate row by row). */
function checkKinds(pages, ctx) {
    const out = [];
    if (ctx.arrangement !== 'mixed' || ctx.layout !== 'rows') return out;
    const all = pages.flatMap((pg, pi) => pg.cells.map((c) => ({ ...c, page: pi })));
    const none = all.filter((c) => !c.kind);
    if (none.length) { out.push(`kinds: ${none.length} problem cell(s) carry no data-ws-kind (layout A names each row's kind)`); return out; }
    const bySkill = {};
    for (const c of all) (bySkill[c.skill] = bySkill[c.skill] || new Set()).add(c.kind);
    for (const [sk, ks] of Object.entries(bySkill)) {
        if (ks.size > 1) out.push(`kinds: ${sk} is dealt as ${[...ks].join(' and ')} (one kind per skill)`);
        const k = [...ks][0];
        if (FACT_SKILL(sk) && k !== 'fact') out.push(`kinds: ${sk} is a fast-fact skill, dealt as kind '${k}' (must be 'fact')`);
        if (!FACT_SKILL(sk) && k === 'fact') out.push(`kinds: ${sk} is not a fast-fact skill, dealt as kind 'fact'`);
    }
    // rows in print order
    const rows = [];
    pages.forEach((pg, pi) => {
        const key = (c) => `${c.grid}|${c.row}`;
        const groups = {};
        for (const c of pg.cells) (groups[key(c)] = groups[key(c)] || []).push(c);
        const ordered = Object.values(groups).sort((a, b) => Math.min(...a.map((c) => c.n)) - Math.min(...b.map((c) => c.n)));
        for (const g of ordered) {
            const r = (pg.rows || []).find((x) => x.grid === g[0].grid && x.row === g[0].row);
            rows.push({ page: pi + 1, kinds: [...new Set(g.map((c) => c.kind))], n: g.length, full: !!r && r.usedFrac >= 0.98, first: Math.min(...g.map((c) => c.n)) });
        }
    });
    for (const r of rows) if (r.kinds.length > 1) out.push(`kinds: page ${r.page} the row from problem ${r.first} mixes kinds ${r.kinds.join(' + ')} (one kind a row)`);
    const kindsAll = [...new Set(rows.map((r) => r.kinds[0]))];
    for (const k of kindsAll) {
        const counts = [...new Set(rows.filter((r) => r.kinds[0] === k && r.full).map((r) => r.n))];
        if (counts.length > 1) out.push(`kinds: full rows of kind '${k}' hold ${counts.join(' / ')} across (one count per kind over the print)`);
    }
    if (kindsAll.length > 1) {
        const tot = {}; for (const r of rows) tot[r.kinds[0]] = (tot[r.kinds[0]] || 0) + 1;
        let i = 0;
        while (i < rows.length) {
            let j = i; while (j + 1 < rows.length && rows[j + 1].kinds[0] === rows[i].kinds[0]) j++;
            const k = rows[i].kinds[0]; const len = j - i + 1;
            const forced = Math.max(1, Math.ceil(tot[k] / (rows.length - tot[k] + 1)));
            if (len > forced) out.push(`kinds: ${len} rows of kind '${k}' in a row (page ${rows[i].page}, from problem ${rows[i].first}); ${tot[k]} of ${rows.length} rows alternate to runs of ${forced}`);
            i = j + 1;
        }
    }
    return out;
}

/** 17 layout (owner 2026-11-03): the print is laid out in the layout asked (req.mixLayout; absent = 'rows'), reported
 *  as fits.mixLayout; layout C "Even grid": every row track of a page's grid the same height (within 1 mm). */
function checkLayout(pages, ctx) {
    const out = [];
    if (ctx.arrangement !== 'mixed') return out;
    if (ctx.reported !== ctx.layout) out.push(`layout: asked '${ctx.layout}', the result reports fits.mixLayout '${ctx.reported || '-'}'`);
    if (ctx.layout === 'even') pages.forEach((pg, i) => {
        const hs = pg.cells.map((c) => c.hMm);
        if (hs.length && Math.max(...hs) - Math.min(...hs) > 1) out.push(`layout: page ${i + 1}: Even grid boxes are ${Math.min(...hs).toFixed(0)}-${Math.max(...hs).toFixed(0)} mm tall (one height, within 1 mm)`);
    });
    return out;
}

const JUDGES = { kinds: checkKinds, layout: checkLayout, sml: () => [], frame: checkFrame, shelfw: checkShelfWidth, fill: checkFill, partials: checkPartials, columns: checkColumns, boxes: checkBoxes, across: checkAcross, width: checkWidth, runs: checkRuns, rowfill: checkRowFill, spread: checkSpread, align: checkAlign, digits: checkDigits, spare: checkSpare };
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
        const out = { last: pi === pgs.length - 1, bodyMm: bb.height / mm, freeMm: 0, cells: [], rows: [], stacks: [], unattributed: 0, holes: [], fullRows: [], wide: [] };
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
            // boxes: lattice points (3 mm) inside the grid covered by no problem cell (a blank run counts as empty)
            {
                const rs = cells.map((c) => c.getBoundingClientRect());
                const st = 3 * mm;
                let miss = 0; let at = '';
                for (let y = gr.top + st / 2; y < gr.bottom - 1; y += st) for (let x = gr.left + st / 2; x < gr.right - 1; x += st) {
                    if (!rs.some((r) => x >= r.left - 1 && x <= r.right + 1 && y >= r.top - 1 && y <= r.bottom + 1)) { miss++; if (!at) at = `${Math.round((x - gr.left) / mm)} mm, ${Math.round((y - gr.top) / mm)} mm`; }
                }
                if (miss) out.holes.push({ grid: gi, mm2: miss * 9, at });
            }
            // across: the rows whose problems fill the grid's width (full rows), with their count of problems
            tracks.forEach(([y0, y1]) => {
                const mid = (y0 + y1) / 2;
                const on = cells.filter((c) => { const r = c.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid && c.querySelector(':scope > .ws-tab, :scope > .ws-letter'); });
                const w = on.reduce((a, c) => a + c.getBoundingClientRect().width, 0);
                if (on.length && w >= gr.width * 0.98) out.fullRows.push({ n: on.length });
            });
            for (const c of cells) {
                const r = c.getBoundingClientRect();
                const tab = c.querySelector(':scope > .ws-tab, :scope > .ws-letter');
                // width: the drawing's ink box (every leaf box but the tab), against the cell's width
                if (tab) {
                    let lo = Infinity; let hi = -Infinity;
                    for (const e of c.querySelectorAll('*')) {
                        if (e.closest('.ws-tab,.ws-letter') || e.children.length) continue;
                        const er = e.getBoundingClientRect();
                        if (er.width <= 0 || er.height <= 0) continue;
                        lo = Math.min(lo, er.left); hi = Math.max(hi, er.right);
                    }
                    // (2026-11-03) text that sits beside a child element (a legacy "[box] - 3 = 10") is ink too: its text nodes' boxes
                    const tw = document.createTreeWalker(c, NodeFilter.SHOW_TEXT);
                    for (let t = tw.nextNode(); t; t = tw.nextNode()) {
                        if (!t.textContent.trim() || (t.parentElement && t.parentElement.closest('.ws-tab,.ws-letter'))) continue;
                        const rg = document.createRange(); rg.selectNodeContents(t);
                        for (const er of rg.getClientRects()) if (er.width > 0) { lo = Math.min(lo, er.left); hi = Math.max(hi, er.right); }
                    }
                    if (hi > lo && (hi - lo) / r.width < 0.45) out.wide.push({ label: tab.textContent.trim(), tpl: c.getAttribute('data-ws-cell') || '', cellMm: r.width / mm, inkMm: (hi - lo) / mm });
                }
                const label = tab ? tab.textContent.trim() : '';
                if (!tab) continue;
                const n = Number(label.replace(/\D/g, '')) || out.cells.length + 1;
                const tplName = (c.getAttribute('data-ws-cell') || (c.className.match(/mqt--([\w-]+)/) || [])[1] || '');
                const skill = c.getAttribute('data-ws-skill') || '';
                if (!skill) out.unattributed++;
                out.cells.push({ n, skill, tpl: tplName, grid: gi, row: trackOf(r.top), kind: c.getAttribute('data-ws-kind') || '', hMm: r.height / mm });
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
        // (2026-11-03, owner's 6-skill mix) frame / shelfw / fill / partials: the bordered frame round the problem grids,
        // every rule segment on the page, each cell's four edges, each grid's span, the cells' area, the 2-digit x work rows
        {
            // (r4 fix: each grid's OWN frame - an In sections page has one bordered band per part, not one frame round all)
            const frameOf = (g) => {
                let fr = null;
                for (let e = g ? g.parentElement : null; e && e !== pg; e = e.parentElement) {
                    const cs = getComputedStyle(e);
                    if ((parseFloat(cs.borderTopWidth) || 0) >= 1 && (parseFloat(cs.borderLeftWidth) || 0) >= 1 && cs.borderTopStyle !== 'none') { fr = e; break; }
                }
                const el = fr || body; const fb = el.getBoundingClientRect(); const fcs = getComputedStyle(el);
                return { el, fr, fb, inner: { left: fb.left + (parseFloat(fcs.borderLeftWidth) || 0), right: fb.right - (parseFloat(fcs.borderRightWidth) || 0), top: fb.top + (parseFloat(fcs.borderTopWidth) || 0), bottom: fb.bottom - (parseFloat(fcs.borderBottomWidth) || 0) } };
            };
            const gFrames = grids.map(frameOf);
            const frames = gFrames.filter((f, i) => gFrames.findIndex((x) => x.el === f.el) === i);
            const { fr, fb, inner } = frames[0] || frameOf(null);
            out.frame = { wMm: (inner.right - inner.left) / mm, hMm: (inner.bottom - inner.top) / mm, bordered: !!fr };
            // rule segments: every border side >= 0.5 px of the frame, the grids and every cell inside them (not inside a cell's drawing)
            const segs = [];   // {h: true|false, at, a, b, src}
            const sides = (el, src) => {
                const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
                const bw = (s) => (cs[`border${s}Style`] !== 'none' && cs[`border${s}Style`] !== 'hidden' ? parseFloat(cs[`border${s}Width`]) || 0 : 0);
                if (bw('Top') >= 0.5) segs.push({ h: true, at: r.top + bw('Top') / 2, a: r.left, b: r.right, src });
                if (bw('Bottom') >= 0.5) segs.push({ h: true, at: r.bottom - bw('Bottom') / 2, a: r.left, b: r.right, src });
                if (bw('Left') >= 0.5) segs.push({ h: false, at: r.left + bw('Left') / 2, a: r.top, b: r.bottom, src });
                if (bw('Right') >= 0.5) segs.push({ h: false, at: r.right - bw('Right') / 2, a: r.top, b: r.bottom, src });
            };
            frames.forEach((F) => { if (F.fr) sides(F.fr, 'frame'); });
            const allCells = grids.flatMap((g) => [...g.children].filter((c) => c.classList.contains('ws-cell')));
            grids.forEach((g) => sides(g, 'grid'));
            allCells.forEach((c) => sides(c, 'cell'));
            // (the kit draws a cell's rules as its grid's ink background showing through the gaps and the grid's border: a
            // point just outside a cell edge is ink when it lies in a grid's border box but in none of that grid's cells,
            // in the frame's border ring, or on the cell's own border)
            const ink = (x, y) => {
                for (const F of frames) { if (!F.fr) continue; const { fb, inner } = F; const insideOuter = x >= fb.left && x <= fb.right && y >= fb.top && y <= fb.bottom; const insideInner = x > inner.left && x < inner.right && y > inner.top && y < inner.bottom; if (insideOuter && !insideInner) return true; }
                for (const g of grids) {
                    const r = g.getBoundingClientRect();
                    if (x < r.left || x > r.right || y < r.top || y > r.bottom) continue;
                    const bg = getComputedStyle(g).backgroundColor;
                    const dark = /rgb\((\d+), (\d+), (\d+)\)/.exec(bg);
                    const isInk = dark && (Number(dark[1]) + Number(dark[2]) + Number(dark[3])) < 200;
                    const kids = [...g.children].filter((c) => c.classList.contains('ws-cell'));
                    const inKid = kids.some((c) => { const q = c.getBoundingClientRect(); return x > q.left && x < q.right && y > q.top && y < q.bottom; });
                    if (inKid) return false;
                    const gcs = getComputedStyle(g);
                    const inBorder = x < r.left + (parseFloat(gcs.borderLeftWidth) || 0) || x > r.right - (parseFloat(gcs.borderRightWidth) || 0) || y < r.top + (parseFloat(gcs.borderTopWidth) || 0) || y > r.bottom - (parseFloat(gcs.borderBottomWidth) || 0);
                    return inBorder || !!isInk;
                }
                return false;
            };
            out.openEdges = [];
            const probs = allCells.filter((c) => !isTrail(c) && c.querySelector(':scope > .ws-tab, :scope > .ws-letter'));
            const off = 0.75;
            for (const c of probs) {
                const r = c.getBoundingClientRect(); const cs = getComputedStyle(c);
                const lab = c.querySelector(':scope > .ws-tab, :scope > .ws-letter').textContent.trim();
                for (const [side, pts] of [
                    ['top', (t) => [r.left + t * r.width, r.top - off]], ['bottom', (t) => [r.left + t * r.width, r.bottom + off]],
                    ['left', (t) => [r.left - off, r.top + t * r.height]], ['right', (t) => [r.right + off, r.top + t * r.height]]]) {
                    const S = side[0].toUpperCase() + side.slice(1);
                    if ((parseFloat(cs[`border${S}Width`]) || 0) >= 0.5 && cs[`border${S}Style`] !== 'none') continue;
                    let hit = 0; const N = 40;
                    for (let k = 0; k < N; k++) { const [x, y] = pts((k + 0.5) / N); if (ink(x, y)) hit++; }
                    if (hit / N < 0.97) out.openEdges.push({ label: lab, side, frac: hit / N });
                }
            }
            // loose rules: a grid's top / bottom border running past the cells of its first / last row by more than 3 mm
            out.dangling = [];
            for (const g of grids) {
                const r = g.getBoundingClientRect(); const gcs = getComputedStyle(g);
                const kids = [...g.children].filter((c) => c.classList.contains('ws-cell')).map((c) => c.getBoundingClientRect());
                if (!kids.length) continue;
                const x0 = r.left + (parseFloat(gcs.borderLeftWidth) || 0); const x1 = r.right - (parseFloat(gcs.borderRightWidth) || 0);
                for (const [edge, yIn] of [['top', r.top + (parseFloat(gcs.borderTopWidth) || 0)], ['bottom', r.bottom - (parseFloat(gcs.borderBottomWidth) || 0)]]) {
                    const row = kids.filter((q) => Math.abs((edge === 'top' ? q.top : q.bottom) - yIn) <= 4).map((q) => [q.left, q.right]).sort((p, q) => p[0] - q[0]);
                    let cov = 0; let cur = x0;
                    for (const [a0, a1] of row) { const s0 = Math.max(cur, a0); const s1 = Math.min(a1, x1); if (s1 > s0) { cov += s1 - s0; cur = s1; } }
                    const loose = (x1 - x0 - cov) / mm - Math.max(0, row.length - 1) * ((parseFloat(gcs.columnGap) || 0) / mm);
                    if (loose > 3) out.dangling.push({ h: true, src: 'grid', mm: loose, atMm: ((edge === 'top' ? r.top : r.bottom) - inner.top) / mm });
                }
            }
            // shelves: each problem grid's span against the frame's inner width
            out.shelves = grids.map((g, gi) => { const r = g.getBoundingClientRect(); const I = gFrames[gi].inner; return { grid: gi, leftMm: (r.left - I.left) / mm, rightMm: (I.right - r.right) / mm, last: gi === grids.length - 1 }; });
            // fill: the problem cells' area against the frame's inner area
            const area = probs.reduce((a, c) => { const r = c.getBoundingClientRect(); return a + r.width * r.height; }, 0);
            out.fillFrac = area / Math.max(1, frames.reduce((a, F) => a + (F.inner.right - F.inner.left) * (F.inner.bottom - F.inner.top), 0));
            // partials: the 2-digit x work rows of every mult_2by2_standard cell
            out.work = probs.filter((c) => /mult_2by2_standard/.test(c.getAttribute('data-ws-skill') || '')).map((c) => ({ label: c.querySelector(':scope > .ws-tab, :scope > .ws-letter').textContent.trim(), prows: c.querySelectorAll('.ws-prow').length, rule2: c.querySelectorAll('.ws-rule2').length }));
        }
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
const OWNER = ['addition:add_facts', 'subtraction:sub_facts', 'multiplication:mult_facts', 'division:div_facts', 'subtraction:missing_add_sub', 'multiplication:missing_mult_div'];
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
    // h (critic r3 P1): the Independent sheet of two parts with counts (add facts 10 + subtract facts 10)
    // (critic r3 P1 second half: RED until practice.js flowLayout picks a count across that divides - runs by default)
    if (want('h')) for (const size of QUICK ? ['M', 'S'] : ['S', 'M', 'L']) out.push({ id: `h independent 10+10 daily ${size} seed 4242`, set: ['addition:add_facts', 'subtraction:sub_facts'], counts: [10, 10], arr: 'sections', role: 'independent', look: 'daily', size, seed: 4242 });
    // o (owner, 2026-11-03): his 6-skill mix - add / sub facts within 20, mult / div facts 1-12, missing numbers +/-, missing
    // factors x/÷ - 41 problems (7,7,7,7,7,6) printed 3 a page. Every size, every run (quick too); a fill page at M; the
    // print dialog's Columns control (req.columns 4 at M, 6 at S).
    if (want('o')) {
        for (const size of ['S', 'M', 'L']) out.push({ id: `o owner 41 daily ${size} seed 4242`, set: OWNER, counts: [7, 7, 7, 7, 7, 6], arr: 'mixed', look: 'daily', size, seed: 4242, sml: 'o owner 41' });
        // (owner 2026-11-03: all three Mixed up layouts are options - A rows (default, above), B grid, C even)
        for (const layout of ['grid', 'even']) for (const size of QUICK ? ['M'] : ['S', 'M', 'L']) out.push({ id: `o owner 41 ${layout} daily ${size} seed 4242`, set: OWNER, counts: [7, 7, 7, 7, 7, 6], arr: 'mixed', look: 'daily', size, seed: 4242, layout });
        if (!QUICK) for (const layout of ['grid', 'even']) out.push({ id: `b ${layout} daily M seed 722369`, set: SETS.b.skills, arr: 'mixed', look: 'daily', size: 'M', seed: 722369, layout });
        out.push({ id: 'o owner fill ican M seed 4242', set: OWNER, arr: 'mixed', look: 'ican', size: 'M', seed: 4242 });
        out.push({ id: 'o owner 41 columns 4 M seed 4242', set: OWNER, counts: [7, 7, 7, 7, 7, 6], arr: 'mixed', look: 'daily', size: 'M', seed: 4242, columns: 4 });
        out.push({ id: 'o owner 41 columns 6 S seed 4242', set: OWNER, counts: [7, 7, 7, 7, 7, 6], arr: 'mixed', look: 'daily', size: 'S', seed: 4242, columns: 6, colsOn: 'sections' });
    }
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
    return { html: o.pupilHtml, perPage, notes: o.notes || [], arrangement: o.arrangement, pages: o.pageCount, across: (o.fits && o.fits.across) || 0, layout: (o.fits && o.fits.mixLayout) || '' };
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
    const SECT = {}; const WORK = {}; const SML = {};
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
                const req = { role: sc.role || 'mixed-practice', arrangement: sc.arr, sections, size: sc.size, look: sc.look, seed: sc.seed, key: false };
                // (the print dialog sends Columns as each section's `columns`, simple-print lane 2026-11-03; req.columns too)
                if (sc.layout) req.mixLayout = sc.layout;
                if (sc.columns && sc.colsOn === 'sections') req.sections.forEach((x) => { x.columns = sc.columns; });
                else if (sc.columns) req.columns = sc.columns;
                let b;
                try { b = await app.page.evaluate(BUILD_FN, req); } catch (e) { fails.push({ check: 'build', line: `${sc.id}: build failed: ${String(e.message || e).slice(0, 200)}` }); continue; }
                const pages = await app.page.evaluate(MEASURE_FN, { html: b.html, perPage: b.perPage });
                n++; pagesN += pages.length;
                const un = pages.reduce((a, p) => a + p.unattributed, 0);
                if (un && CHECKS.some((c) => c === 'runs' || c === 'spread')) fails.push({ check: 'measure', line: `${sc.id}: ${un} problem cell(s) could not be given their skill (plan items vs printed cells)` });
                const ctx = { arrangement: b.arrangement || sc.arr, counts, notes: b.notes, columns: sc.columns || 0, layout: sc.layout || 'rows', reported: b.layout, across: b.across };
                // fill: In sections' per-page count for the same skills at this size (a fill page of each skill in its own part)
                if (ctx.arrangement === 'mixed' && CHECKS.includes('fill')) {
                    const key = `${sc.set.join(',')}|${sc.size}|${sc.look}`;
                    if (!(key in SECT)) {
                        try {
                            const sb = await app.page.evaluate(BUILD_FN, { role: 'mixed-practice', arrangement: 'sections', sections: [{ skills: sc.set.map(sk) }], size: sc.size, look: sc.look, seed: sc.seed, key: false });
                            SECT[key] = Math.max(0, ...sb.perPage.map((xs) => xs.length));
                        } catch (e) { SECT[key] = 0; fails.push({ check: 'build', line: `${sc.id}: the In sections reference failed: ${String(e.message || e).slice(0, 160)}` }); }
                    }
                    ctx.sectionsPerPage = SECT[key];
                }
                // partials: the 2-digit x cell's own single-skill page
                if (CHECKS.includes('partials') && sc.set.includes('multiplication:mult_2by2_standard')) {
                    const key = `2by2|${sc.size}|${sc.look}`;
                    if (!(key in WORK)) {
                        const wb = await app.page.evaluate(BUILD_FN, { role: 'independent', sections: [{ skills: [sk('multiplication:mult_2by2_standard')], count: 4 }], size: sc.size, look: sc.look, seed: sc.seed, key: false });
                        const wp = await app.page.evaluate(MEASURE_FN, { html: wb.html, perPage: wb.perPage.map((xs) => xs.map(() => 'multiplication:mult_2by2_standard')) });
                        const w0 = wp.flatMap((x) => x.work || [])[0];
                        WORK[key] = w0 ? { prows: w0.prows, rule2: w0.rule2 } : null;
                        if (!w0) fails.push({ check: 'partials', line: `${sc.id}: no 2-digit x cell measured on its own page` });
                    }
                    ctx.workRef = WORK[key];
                }
                if (sc.sml && CHECKS.includes('sml')) (SML[sc.sml] = SML[sc.sml] || {})[sc.size] = pages.length ? pages[0].cells.length : 0;
                report(sc.id, judge(pages, ctx, CHECKS.filter((c) => c !== 'sml')), fails);
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
        for (const id of Object.keys(SML)) for (const f of checkSml(SML[id], id)) fails.push({ check: 'sml', line: f });
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

module.exports = { checkFrame, checkShelfWidth, checkFill, checkPartials, checkSml, checkColumns, judge, checkBoxes, checkAcross, checkWidth, checkRuns, checkRowFill, checkSpread, checkAlign, checkDigits, checkSpare, printOrder, ALL_CHECKS, MEASURE_FN };
if (require.main === module) main().catch((e) => { console.error(e); process.exit(1); });
