#!/usr/bin/env node
// ws-fact-pages - the fact-family PAGE rules of lf-ops (div_facts support aids, critics r6 / r7, 2026-11-08 / 09): EB-PAGE (test /
// fade packet), EB-PAD, EB-COLS, EB-TESTEQ, EB-GAP (fact-to-line), EB-FACTX. RESTORED 2026-11-13 (lf-ops divarray r2, owner rule
// "every finding a check on precritic's path"): they lived in the lane's ws-empty-band, which master's lf-checks rewrite replaced,
// so the deploy (4c5de5a2) kept the fix but dropped the checks. This is that file as the lane last had it (b43bf8b99), under its
// own name; the shared band rules of today are tests/scripts/ws-empty-band.cjs. Run with --page-only (the page-rule jobs).
// Its own tool name below stays "ws-empty-band" in the old printouts only where quoted; the OK / FAIL line says ws-fact-pages.
//
// ws-empty-band — the ONE shared empty-band check every lane runs before a critic (lead, 2026-11-08: lf-vocab critic r3,
// lf-placevalue critic r1 F1 / N5 / N6 and lf-ops div_facts all failed on the SAME class - an empty band (RUBRIC H13) on a
// page role or screen host no machine check rendered, and a cell footprint that does not match the drawn height; every
// critic was the first to measure it). Cross-lane rule (design/audit/LESSONS_LEARNED.md L25): render and measure every
// offered role and host before a critic.
//
//   node tests/scripts/ws-empty-band.cjs --skill division:div_facts            # every offered role x S/M/L + screen hosts
//   node tests/scripts/ws-empty-band.cjs --skill a:b,c:d --sizes L --hosts none
//   node tests/scripts/ws-empty-band.cjs --skill a:b --roles independent,guided --opts '{"band":20}'
//   node tests/scripts/ws-empty-band.cjs --skill a:b --json out.json --report-only
//   node tests/scripts/ws-empty-band.cjs --skill division:div_facts --page-only --hosts none --only '^test [SML]$' --rules EB-PAGE
//   node tests/scripts/ws-empty-band.cjs --self-test                          # the page rules on fixtures (critic r6 numbers)
//
// WHAT IS RENDERED (the plan): the roles the skill's SIGNED spec card offers (tests/lib/ws-card-plan.mjs, lf-ops: §7a
// "offered" page roles minus "hidden"), each at sizes S, M and L with the skill's defaults; the card's option variants on the
// independent page at L (at most --variants, default 6, spread over the list); and the screen hosts: the practice card at 390,
// 820 and 1280 px wide, the online worksheet and the quiz at 1280 px. No card: the default role list below. A role buildSheet
// cannot compose for the skill is listed as "not composed", never passed.
//
// WHAT IS MEASURED, per kit cell ([data-ws-cell], top-level; print pupil pages; the B&W screen cell on a host):
//   EB-BAND   the empty band UNDER the item: from the lowest ink (text, a drawing, a stroked / bordered box; an EMPTY answer
//             slot counts as the item's own writing room, as in lf-placevalue's H13-ABS; the tab / letter label does not
//             count) to the cell's inner bottom. FAIL at >= 30 % of the cell height (RUBRIC H13's 30 %), judged on EVERY cell
//             of every role and host. Harmonised with H13-ABS (35 % of the cell less Hw): measured on today's head the
//             approved fact pages sit at 29.96 % (17.0 mm under a 56.75 mm cell at L, so H13-ABS's 16.5 mm limit now FAILS
//             them), while every critic-failed band sits at 34-57 % (lf-vocab Match 3 guided 34-37 %, error-analysis 35-40 %;
//             lf-placevalue N5 43 %, N6 57 %): 30 % of the full cell separates the two classes, H13-ABS's limit does not.
//   EB-SIDE   the empty band BESIDE the ink (left or right of the ink box): FAIL at >= 30 % of the cell width (RUBRIC H13).
//   EB-FOOT   the drawn height vs the footprint: the cell's needed height (top pad + ink + empty slots + bottom pad) against
//             the hMm the bridge measured for the item at the page's column count (buildSheet items[i].measured[cols].hMm);
//             FAIL when they differ by more than 10 %. Judged on the grid roles that lay out from that measure (independent,
//             more-practice, test, review, mixed-practice) where the page's cells and its measured items pair one to one; a
//             role that draws its own cell (fact-probe rows, word-problems stories, the guided model) is not judged by it.
//   EB-VOCAB  (opt-in --vocab-ink) a lesson vocabulary picture drawn in under 70 % of its own box (see measureVocab).
// Cells under 10 mm are not judged (a tick box, a choice ring). A finding names role, size (or host and width), page, cell.
//
// PAGE RULES (lf-ops div_facts critic r6 R6-1..R6-5, 2026-11-08; opt-in per skill in PAGE_RULES below, or --page-rules for
// any skill): the cell-only measures above let a ruling move the empty space from the cells to the page (F1 sized the Test rows
// to the facts and the page was left half empty). On the print grid roles (independent, more-practice, test, review) and on
// the faded packet:
//   EB-PAGE   white under the grid (last cell bottom to the footer / page foot) vs one row pitch: FAIL when the page is more
//             than one row pitch (+ 2.5 mm, the layout's safety strip) short of its body (RUBRIC H5 / C3 "half-empty page", L19), unless the skill's card names the
//             page as an accepted short page (a card line "accepted short page: <role> <size>").
//   EB-PAD    the least ink to each side rule of a cell (the ink box, answer line included, to the cell's inner border edge):
//             FAIL under the CL-8 fact pad, 3 mm (2 mm at 7 columns or more). Probed with the skill's widest facts too
//             (PAGE_RULES probes), not only a sample.
//   EB-COLS   columns(L) <= columns(M) for the same role and options, unless M holds more problems a page: L is never the
//             denser layout (R6-3).
//   EB-TESTEQ (TEST-EQ-IND, opt-in `testEq`) every support's Test page holds the same count as its Independent page at each
//             size (owner / lead 2026-11-09, critic r7 R7-1).
//   EB-GAP    the fact-to-answer-line distance (fact text bottom to the line under it) spreads at most 1 mm across a
//             render - a section, or a whole faded packet - that holds a fact starting under the number tab (critic r7 R7-2).
//   EB-FACTX  across ALL pages of a faded packet the fact's left edge in its cell (the fact's text ink, slot and supports
//             excluded) spreads at most 0.5 mm (facts card F4 "one x"; R6-5).
// The opted skill also renders each offered support alone (and with the probes) on independent and test at every size, and
// its faded packet (--fade-pages, default 3) at every size.
//
// PIN (--baseline <file>, default design/audit/baselines/empty-band.json when it exists; --no-baseline for raw): the counts of
// findings per (skill, render, rule) accepted on 2026-11-08 for skills that had passed before the check existed (the fact
// family: its guided / scripted-model / error-analysis pages were never rendered by a gate). A count above its pin, or a
// finding on a (skill, render, rule) the pin does not hold, FAILS; a skill not in the pin must be clean. --write-baseline
// <file> writes the run's counts (a STATUS note goes with every re-pin).
// Prints one line per finding and `ws-empty-band: OK` / `FAIL (n)`; exits 1 on FAIL (0 with --report-only), 2 on usage.
// Run time (sampled): about 1-3 min a skill.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { ROOT, open } = require('../lib/ws-harness.cjs');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const SKILLS = (arg('skill', '') || arg('skills', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
if (!has('self-test') && (!SKILLS.length || SKILLS.some((s) => !s.includes(':')))) { console.log('usage: ws-fact-pages.cjs --skill cat:skill[,cat:skill] [--roles r,..] [--sizes S,M,L] [--hosts card,worksheet,quiz|none] [--variants 6] [--opts json] [--seed 7] [--json f] [--report-only]'); console.log('ws-fact-pages: FAIL (usage)'); process.exit(2); }
const SIZES = (arg('sizes', 'S,M,L')).split(',').map((s) => s.trim()).filter(Boolean);
const HOSTS = arg('hosts', 'card,worksheet,quiz') === 'none' ? [] : arg('hosts', 'card,worksheet,quiz').split(',').map((s) => s.trim());
const SEED = parseInt(arg('seed', '7'), 10);
const NVAR = parseInt(arg('variants', '6'), 10);
const OPTS = arg('opts', null) ? JSON.parse(arg('opts')) : null;
const DEFAULT_ROLES = ['independent', 'more-practice', 'guided', 'error-analysis', 'review', 'test', 'true-false', 'reason-it', 'lesson'];
const BAND = 0.30, SIDE = 0.30, FOOT = 0.10, MIN_MM = 10;
// the roles that lay their grid out from the items' measured footprints (buildSheet items[i].measured[cols].hMm)
const GRID_ROLES = new Set(['independent', 'more-practice', 'test', 'review', 'mixed-practice']);
// PAGE RULES (header): the skills that opt in, each with its widest-fact probes (option sets merged into every support job)
// and the supports the probes go with. Another lane opts its skill in with an entry here (a STATUS note goes with it).
const PAGE_RULES = {
    // accepted: pages EB-PAGE accepts by a ruling - {size: count}: a page holding exactly that many cells at that size is at
    // the owner's ceiling (div_facts: "the supports-off page at S may hold 36", owner 2026-11-08; the Test follows the
    // Independent capacity, owner 2026-11-08 on critic r6 R6-1)
    // testEq: EB-TESTEQ judges every support's Test count against its Independent count (owner 2026-11-09)
    'division:div_facts': { accepted: { S: 36 }, testEq: true, probes: [{ for: ['off', 'touch', 'boxsign', 'skip', 'think'], opts: { constant: [12] } }, { for: ['array'], opts: { constant: [2, 3, 4] } }] },
};
const PAGE_ROLES = new Set(['independent', 'more-practice', 'test', 'review']);
const PAD_MM = 3, PAD_MM_7 = 2, FACTX_MM = 0.5;
// EB-PAGE: another row fits when the white is a row pitch plus the layout's own safety strip and grid borders (layout.js
// SAFETY_H_MM 1 + practice.js GRID_BORDERS_MM 1.2) and rounding: 2.5 mm
const EB_PAGE_SLACK_MM = 2.5;
const FADE_PAGES = parseInt(arg('fade-pages', '3'), 10);

/** The render plan of a skill from its signed card (lf-ops' ws-card-plan.mjs), or the default roles. */
function planOf(key) {
    if (arg('roles', null)) return { roles: arg('roles').split(','), variants: [], cards: ['--roles'] };
    try {
        const out = execFileSync(process.execPath, [path.join(__dirname, '..', 'lib', 'ws-card-plan.mjs'), '--skill', key, '--root', ROOT], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
        const p = JSON.parse(out)[0];
        if (p && p.cards && p.cards.length && p.roles.length) return p;
    } catch (e) { /* no card plan in this tree, or no card */ }
    return { roles: DEFAULT_ROLES, variants: [], cards: [] };
}

/* ------------------------------------------------------------------ in the page */
// Serialisable. scope: a CSS selector of the containers to read (print: the pupil pages; screen: the host's paper).
function measureCells(scope) {
    const MM = 96 / 25.4;
    const visible = (e) => { const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity || '1') > 0.05; };
    const out = [];
    // the body's foot: the footer's top, else the page's inner bottom
    const footTop = (rt) => { const f = rt.querySelector('.ws-foot'); const fr = f && visible(f) ? f.getBoundingClientRect() : null; const pr = rt.getBoundingClientRect(); return fr && fr.height ? fr.top : pr.bottom - parseFloat(getComputedStyle(rt).paddingBottom || '0'); };
    const roots = [...document.querySelectorAll(scope)];
    roots.forEach((rt, pi) => {
        const cells = [...rt.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]') && visible(c));
        cells.forEach((c, ci) => {
            const cr = c.getBoundingClientRect(); if (cr.height < 10 * MM || cr.width < 10 * MM) return;
            const cs = getComputedStyle(c);
            const inner = { t: cr.top + parseFloat(cs.paddingTop) + parseFloat(cs.borderTopWidth), b: cr.bottom - parseFloat(cs.paddingBottom) - parseFloat(cs.borderBottomWidth), l: cr.left + parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth), r: cr.right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth) };
            let box = null;
            const take = (r) => { if (!r.width || !r.height) return; box = box ? { t: Math.min(box.t, r.top), b: Math.max(box.b, r.bottom), l: Math.min(box.l, r.left), r: Math.max(box.r, r.right) } : { t: r.top, b: r.bottom, l: r.left, r: r.right }; };
            for (const d of c.querySelectorAll('*')) {
                if (d.closest('[data-ws-label], .ws-letter, .ws-tab') || !visible(d)) continue;
                const st = getComputedStyle(d);
                const ownText = [...d.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
                const stroked = (parseFloat(st.borderTopWidth) > 0 && st.borderTopStyle !== 'none') || (parseFloat(st.borderBottomWidth) > 0 && st.borderBottomStyle !== 'none') || (parseFloat(st.borderLeftWidth) > 0 && st.borderLeftStyle !== 'none');
                const drawn = d instanceof SVGElement ? /^(svg)$/i.test(d.tagName) : /^(img|canvas|input)$/i.test(d.tagName);
                const slot = d.hasAttribute('data-ws-slot');
                if (ownText) { const rg = document.createRange(); rg.selectNodeContents(d); for (const r of rg.getClientRects()) take(r); continue; }
                if (drawn || stroked || slot) take(d.getBoundingClientRect());
            }
            if (!box) return;
            const H = inner.b - inner.t, W = inner.r - inner.l;
            const hwVar = parseFloat(getComputedStyle(c).getPropertyValue('--ws-hw')) || 0;
            const hw = /mm/.test(getComputedStyle(c).getPropertyValue('--ws-hw')) ? hwVar * MM : hwVar;
            const below = Math.max(inner.b - box.b, 0);
            const side = Math.max(box.l - inner.l, inner.r - box.r, 0);
            // page rules: the ink to each side rule (the border's inner edge, the pad included), the fact's own text ink left
            const bl = cr.left + parseFloat(cs.borderLeftWidth), br = cr.right - parseFloat(cs.borderRightWidth);
            let factL = null, factB = null, factT = null, lineB = null;
            const eq = [...c.querySelectorAll('.ws-eq, .ws-fact')].find((e) => !e.closest('[data-ws-support-on], [data-ws-label], .ws-tab') && visible(e));
            if (eq) {
                const w = document.createTreeWalker(eq, NodeFilter.SHOW_TEXT); let n;
                while ((n = w.nextNode())) {
                    if (!n.textContent.trim() || n.parentElement.closest('[data-ws-slot], [data-ws-support-on], [aria-hidden="true"]') || !visible(n.parentElement)) continue;
                    const rg = document.createRange(); rg.selectNodeContents(n);
                    for (const r of rg.getClientRects()) if (r.width) { if (factL === null || r.left < factL) factL = r.left; if (factB === null || r.bottom > factB) factB = r.bottom; if (factT === null || r.top < factT) factT = r.top; }
                }
                // EB-GAP: the answer line UNDER the fact (a line slot that starts below the middle of the fact's text; the text's
                // range box reaches past its line box, so the slot may start inside it)
                const ln = eq.querySelector('[data-ws-slot][data-ws-shape="line"]');
                const lr = ln && visible(ln) ? ln.getBoundingClientRect() : null;
                if (lr && lr.width && factB !== null && lr.top >= (factT + factB) / 2 && lr.bottom > factB) lineB = lr.bottom;
            }
            const pr = rt.getBoundingClientRect();
            out.push({ gapL: +((box.l - bl) / MM).toFixed(2), gapR: +((br - box.r) / MM).toFixed(2), factL: factL === null ? null : +((factL - cr.left) / MM).toFixed(2),
                lineGap: lineB === null ? null : +((lineB - factB) / MM).toFixed(2), underTab: !!c.querySelector('[data-ws-undertab]'),
                x: +((cr.left - pr.left) / MM).toFixed(1), y: +((cr.top - pr.top) / MM).toFixed(1), yB: +((cr.bottom - pr.top) / MM).toFixed(1),
                bodyB: +((footTop(rt) - pr.top) / MM).toFixed(1),
 page: pi + 1, cell: ci + 1, label: ((c.querySelector('[data-ws-label], .ws-letter') || {}).textContent || '').trim(), hMm: +(cr.height / MM).toFixed(1), wMm: +(cr.width / MM).toFixed(1),
                innerMm: +(H / MM).toFixed(1), belowMm: +(below / MM).toFixed(1), sideMm: +(side / MM).toFixed(1), hwMm: +(hw / MM).toFixed(1), innerW: +(W / MM).toFixed(1),
                neededMm: +(((box.b - cr.top) + (cr.bottom - inner.b)) / MM).toFixed(1), tmpl: c.getAttribute('data-ws-cell') || '' });
        });
    });
    return out;
}

// EB-VOCAB (opt-in --vocab-ink; lf-placevalue critic r3c E-A1, lead 2026-11-08): a lesson's vocabulary picture whose drawing fills
// less than 70 % of its own picture box, up and down or across (a picture of 4 ones drawn in a ten-rod's height left the
// vocabulary cell 43 % empty above it). Reads every `.mq-lvpic-in svg` on the page: its drawn content (getBBox of its
// children, scaled from the viewBox) against the svg's own box. Additive: absent the flag nothing is read.
function measureVocab(scope) {
    const out = [];
    [...document.querySelectorAll(scope)].forEach((rt, pi) => {
        [...rt.querySelectorAll('.mq-lvpic-in svg')].forEach((svg, i) => {
            const r = svg.getBoundingClientRect(); if (!r.width || !r.height) return;
            let bb = null;
            for (const ch of svg.querySelectorAll('rect, line, path, circle, ellipse, polygon, polyline, text')) {
                let b; try { b = ch.getBBox(); } catch (e) { continue; }
                if (!b.width && !b.height) continue;
                bb = bb ? { x0: Math.min(bb.x0, b.x), y0: Math.min(bb.y0, b.y), x1: Math.max(bb.x1, b.x + b.width), y1: Math.max(bb.y1, b.y + b.height) } : { x0: b.x, y0: b.y, x1: b.x + b.width, y1: b.y + b.height };
            }
            if (!bb) return;
            const vb = svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.height ? svg.viewBox.baseVal : { width: r.width, height: r.height };
            const word = ((svg.closest('.mq-lvpic') || {}).textContent || '').trim().slice(0, 20);
            out.push({ page: pi + 1, pic: i + 1, word, fillH: +((bb.y1 - bb.y0) / vb.height).toFixed(3), fillW: +((bb.x1 - bb.x0) / vb.width).toFixed(3), hMm: +(r.height / (96 / 25.4)).toFixed(1) });
        });
    });
    return out;
}

function judge(cells, where, F) {
    for (const c of cells) {
        const lim = BAND * c.hMm;
        if (c.belowMm >= lim) F('EB-BAND', `${where} p${c.page} cell ${c.label || c.cell}`, `empty band ${c.belowMm} mm under the ink of a ${c.hMm} mm cell (${(c.belowMm / c.hMm * 100).toFixed(1)} %; limit 30 % = ${lim.toFixed(1)} mm) [${c.tmpl}]`);
        if (c.sideMm >= SIDE * c.innerW) F('EB-SIDE', `${where} p${c.page} cell ${c.label || c.cell}`, `empty band ${c.sideMm} mm beside the ink of a ${c.wMm} mm wide cell (${Math.round(c.sideMm / c.innerW * 100)} %) [${c.tmpl}]`);
    }
}

/** PAGE RULES: EB-PAGE and EB-PAD on one render; returns {cols} (the first page's column count) for EB-COLS. */
function judgePages(cells, where, F, accepted) {
    const byPage = new Map();
    for (const c of cells) { if (!byPage.has(c.page)) byPage.set(c.page, []); byPage.get(c.page).push(c); }
    let cols0 = null, n0 = 0;
    for (const [pg, cs] of byPage) {
        const lefts = [...new Set(cs.map((c) => Math.round(c.x)))];
        const cols = lefts.length;
        if (cols0 === null) { cols0 = cols; n0 = cs.length; }
        const tops = [...new Set(cs.map((c) => Math.round(c.y * 2) / 2))].sort((a, b) => a - b);
        const diffs = tops.slice(1).map((t, i) => t - tops[i]).sort((a, b) => a - b);
        const pitch = diffs.length ? diffs[Math.floor(diffs.length / 2)] : Math.max(...cs.map((c) => c.hMm));
        const gridB = Math.max(...cs.map((c) => c.yB));
        const white = +(cs[0].bodyB - gridB).toFixed(1);
        if (white > pitch + EB_PAGE_SLACK_MM && !(accepted === true || accepted === cs.length)) F('EB-PAGE', `${where} p${pg}`, `${white} mm white under the grid, more than one row pitch (${pitch.toFixed(1)} mm; ${cs.length} cells, ${cols} x ${tops.length}): the page is short of its body (RUBRIC H5 / C3 half-empty page, L19; critic r6 R6-1 / R6-4)`);
        const pad = cols >= 7 ? PAD_MM_7 : PAD_MM;
        for (const c of cs) {
            const g = Math.min(c.gapL, c.gapR);
            if (g < pad) F('EB-PAD', `${where} p${pg} cell ${c.label || c.cell}`, `ink ${g.toFixed(2)} mm from the ${c.gapL < c.gapR ? 'left' : 'right'} side rule (CL-8 pad ${pad} mm at ${cols} columns; cell ${c.wMm} mm) [${c.tmpl}]`);
        }
    }
    return { cols: cols0, n: n0 };
}

/** EB-FACTX: the fact's left edge in its cell, across every page of a faded packet. */
function judgeFactX(cells, where, F) {
    const xs = cells.filter((c) => c.factL !== null && c.factL !== undefined);
    if (!xs.length) { F('EB-READ', where, 'no fact text read in the packet (EB-FACTX)'); return; }
    const lo = xs.reduce((a, c) => (c.factL < a.factL ? c : a)), hi = xs.reduce((a, c) => (c.factL > a.factL ? c : a));
    if (hi.factL - lo.factL > FACTX_MM) F('EB-FACTX', where, `the fact's left edge spreads ${(hi.factL - lo.factL).toFixed(2)} mm across the packet (p${lo.page} cell ${lo.label || lo.cell} at ${lo.factL} mm, p${hi.page} cell ${hi.label || hi.cell} at ${hi.factL} mm in its cell; limit ${FACTX_MM} mm, facts card F4 one x; critic r6 R6-5)`);
}
/** EB-GAP (critic r7 R7-2): the fact-to-answer-line distance (the fact's text bottom to the line under it) spreads at most
 *  GAP_MM across one render - a section, or a whole faded packet. Cells whose line sits beside the fact are not read. */
const GAP_MM = 1;
function judgeGap(cells, where, F) {
    // (scope, the brief of r7: a render where the fact starts UNDER the number tab - owner ruling 2026-11-09 (a), L - keeps the
    // fact-to-line gap of its other cells; the S / M bare stage's line at the cell foot is its own ruling, critic r5 R5-6)
    if (!cells.some((c) => c.underTab)) return;
    const xs = cells.filter((c) => c.lineGap !== null && c.lineGap !== undefined);
    if (xs.length < 2) return;
    const lo = xs.reduce((a, c) => (c.lineGap < a.lineGap ? c : a)), hi = xs.reduce((a, c) => (c.lineGap > a.lineGap ? c : a));
    if (hi.lineGap - lo.lineGap > GAP_MM) F('EB-GAP', where, `the fact-to-answer-line distance spreads ${(hi.lineGap - lo.lineGap).toFixed(2)} mm (p${lo.page} cell ${lo.label || lo.cell} ${lo.lineGap} mm, p${hi.page} cell ${hi.label || hi.cell} ${hi.lineGap} mm; limit ${GAP_MM} mm: one fact-to-line gap, critic r7 R7-2)`);
}
/** EB-TESTEQ (TEST-EQ-IND; owner / lead ruling 2026-11-09, critic r7 R7-1): a Test page prints the SAME count as the Independent
 *  page of the same facts, support and size. by: {colKey: {S: {cols, n}, ...}}; compares 'test<tag>' with 'independent<tag>'. */
function judgeTestEq(by, where, F) {
    for (const [k, t] of Object.entries(by)) {
        if (!/^test\b/.test(k)) continue;
        const ind = by['independent' + k.slice(4)];
        if (!ind) continue;
        for (const size of ['S', 'M', 'L']) if (t[size] && ind[size] && t[size].n !== ind[size].n) F('EB-TESTEQ', `${where} ${k} ${size}`, `the Test prints ${t[size].n} (${t[size].cols} columns) where the Independent page of the same facts prints ${ind[size].n} (${ind[size].cols} columns): every support's Test deals the Independent count (lead / owner 2026-11-09, critic r7 R7-1)`);
    }
}
/** EB-COLS: {S, M, L: {cols, n}} of one role and option set. */
function judgeCols(by, where, F) {
    // (denser = more columns for no fewer problems: M's 2 x 8 = 16 beside-box cells against L's 3 x 4 = 12 is M holding
    // more, not L crowding; R6-3's L 4 x 3 = 12 against M 3 x 4 = 12 is the 4th column buying nothing)
    if (by.L && by.M && by.L.cols > by.M.cols && by.L.n >= by.M.n) F('EB-COLS', where, `L takes ${by.L.cols} columns (${by.L.n} a page) where M takes ${by.M.cols} (${by.M.n}): L is never the denser layout (CL-8; critic r6 R6-3)`);
}

/** --self-test: the page rules on fixtures with the critic r6 numbers (fail) and their fixes (pass). No browser. */
function selfTest() {
    const grid = (cols, rows, pitch, top, extra = {}) => Array.from({ length: cols * rows }, (_, i) => Object.assign({ page: 1, cell: i + 1, label: String(i + 1), x: 3 + (i % cols) * 46, y: top + Math.floor(i / cols) * pitch, yB: top + Math.floor(i / cols) * pitch + pitch, hMm: pitch, wMm: 46, gapL: 5, gapR: 5, bodyB: 275, tmpl: 'equation' }, extra));
    const run = (fn) => { const out = []; fn((rule, where, msg) => out.push(rule)); return out; };
    const cases = [
        // R6-1: Test S 4 x 5 in 23 mm rows from y 43 to 158: 117 mm white
        { name: 'R6-1 Test S half page (117 mm white)', got: run((F) => judgePages(grid(4, 5, 23, 43), 't', F, null)), want: 'EB-PAGE' },
        { name: 'R6-1 fixed: Test S 4 x 9 (one row of white)', got: run((F) => judgePages(grid(4, 9, 23, 43), 't', F, null)), want: null },
        { name: 'EB-PAGE accepted at the owner ceiling (36 at S)', got: run((F) => judgePages(grid(4, 9, 20, 43), 't', F, 36)), want: null },
        // R6-4: fade page 3, 3 x 4 in 28 mm rows, 129 mm white
        { name: 'R6-4 fade page 3 (129 mm white)', got: run((F) => judgePages(grid(3, 4, 28, 34), 'f', F, null)), want: 'EB-PAGE' },
        // R6-2: answer line 0.79 mm from the right rule at M
        { name: 'R6-2 line 0.79 mm from the rule', got: run((F) => judgePages(grid(3, 8, 29, 43, { gapR: 0.79 }), 'p', F, true)), want: 'EB-PAD' },
        { name: 'R6-2 fixed (3.2 mm)', got: run((F) => judgePages(grid(3, 8, 29, 43, { gapR: 3.2 }), 'p', F, true)), want: null },
        { name: 'CL-8 at 7 columns is 2 mm', got: run((F) => judgePages(grid(7, 4, 29, 43, { gapR: 2.2 }), 'p', F, true)), want: null },
        // R6-3: L 4 x 3 = 12 against M 3 x 4 = 12
        { name: 'R6-3 L 4 columns where M takes 3, both 12', got: run((F) => judgeCols({ M: { cols: 3, n: 12 }, L: { cols: 4, n: 12 } }, 'c', F)), want: 'EB-COLS' },
        { name: 'R6-3 fixed: L 3 columns', got: run((F) => judgeCols({ M: { cols: 3, n: 12 }, L: { cols: 3, n: 12 } }, 'c', F)), want: null },
        { name: 'M 2 x 8 = 16 against L 3 x 4 = 12 is not L crowding', got: run((F) => judgeCols({ M: { cols: 2, n: 16 }, L: { cols: 3, n: 12 } }, 'c', F)), want: null },
        // R6-5: the fact at 8.5 mm on page 1 and 13.8 mm on pages 2-3 (5.3 mm)
        { name: 'R6-5 fact x spreads 5.3 mm across the packet', got: run((F) => judgeFactX([{ page: 1, cell: 1, factL: 8.5 }, { page: 2, cell: 7, factL: 13.8 }, { page: 3, cell: 16, factL: 13.8 }], 'x', F)), want: 'EB-FACTX' },
        { name: 'R6-5 fixed: one x (0.3 mm)', got: run((F) => judgeFactX([{ page: 1, cell: 1, factL: 9.7 }, { page: 2, cell: 7, factL: 10.0 }, { page: 3, cell: 16, factL: 9.8 }], 'x', F)), want: null },
        // R7-1: off Test M 21 against Independent 24; boxsign M 12 / 16
        { name: 'R7-1 Test M 21 vs Independent 24', got: run((F) => judgeTestEq({ independent: { M: { cols: 3, n: 24 } }, test: { M: { cols: 3, n: 21 } } }, 'k', F)), want: 'EB-TESTEQ' },
        { name: 'R7-1 boxsign M 12 vs 16', got: run((F) => judgeTestEq({ 'independent {support: boxsign}': { M: { cols: 2, n: 16 } }, 'test {support: boxsign}': { M: { cols: 3, n: 12 } } }, 'k', F)), want: 'EB-TESTEQ' },
        { name: 'R7-1 fixed: Test = Independent', got: run((F) => judgeTestEq({ independent: { S: { cols: 4, n: 36 }, M: { cols: 3, n: 24 } }, test: { S: { cols: 4, n: 36 }, M: { cols: 3, n: 24 } } }, 'k', F)), want: null },
        // R7-2: fade L, 11.1 mm on pages 1-2, 19.0 mm on page 3
        { name: 'R7-2 fade L line gap 11.1 / 19.0 mm', got: run((F) => judgeGap([{ page: 1, cell: 1, lineGap: 11.1 }, { page: 2, cell: 7, lineGap: 11.1 }, { page: 3, cell: 16, lineGap: 19.0, underTab: true }], 'g', F)), want: 'EB-GAP' },
        { name: 'EB-GAP judges only a render with an under-tab fact', got: run((F) => judgeGap([{ page: 1, cell: 1, lineGap: 9 }, { page: 3, cell: 16, lineGap: 19.5 }], 'g', F)), want: null },
        { name: 'R7-2 fixed: one gap (0.4 mm spread)', got: run((F) => judgeGap([{ page: 1, cell: 1, lineGap: 11.1 }, { page: 3, cell: 16, lineGap: 11.5, underTab: true }, { page: 3, cell: 17, lineGap: null }], 'g', F)), want: null },
    ];
    let bad = 0;
    for (const c of cases) { const ok = c.want ? c.got.includes(c.want) : !c.got.length; if (!ok) bad++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${c.name}: ${c.got.join(', ') || 'clean'}`); }
    console.log(`ws-fact-pages: ${bad ? `FAIL (self-test ${bad})` : 'OK'} (self-test, ${cases.length} cases)`);
    process.exit(bad ? 1 : 0);
}

/** A card line "accepted short page: <role> <size>[, ...]" (EB-PAGE exemption, named by the card). */
function acceptedShort(cards, role, size) {
    for (const f of cards || []) {
        let t = ''; try { t = fs.readFileSync(path.resolve(ROOT, f), 'utf8'); } catch (e) { continue; }
        for (const line of t.split('\n')) {
            const m = line.match(/accepted short page:\s*(.*)$/i);
            if (m && new RegExp(`\\b${role}\\b`).test(m[1]) && new RegExp(`\\b${size}\\b`).test(m[1])) return true;
        }
    }
    return false;
}

const RULES_ONLY = arg('rules', null) ? new Set(arg('rules').split(',')) : null;
const ONLY_RULES = arg('only', null) && arg('only').split(',').every((s) => /^EB-[A-Z]+$/.test(s)) ? arg('only').split(',') : null;
async function main() {
    const findings = []; const notes = []; let renders = 0, cellsRead = 0;
    // (`--only R1,R2`: judge only these rules - a backtest row proves one rule alone; `--only <regex>` that is not a rule
    // list keeps the jobs whose tag matches, lf-ops' page-rule rows; `--rules R1,R2` filters the rules as well)
    const F = (rule, where, msg) => { if ((!RULES_ONLY || RULES_ONLY.has(rule)) && (!ONLY_RULES || ONLY_RULES.includes(rule))) findings.push({ rule, where, msg }); };
    const app = await open({ seed: 1 });
    const { page } = app;
    const T0 = Date.now();
    try {
        for (const key of SKILLS) {
            const [categoryId, skillId] = key.split(':');
            const plan = planOf(key);
            const vlist = plan.variants || [];
            const step = vlist.length > NVAR ? vlist.length / NVAR : 1;
            const variants = Array.from({ length: Math.min(NVAR, vlist.length) }, (_, i) => vlist[Math.floor(i * step)]);
            const jobs = [];
            for (const role of plan.roles) for (const size of SIZES) jobs.push({ role, size, opts: OPTS, tag: `${role} ${size}` });
            for (const v of variants) jobs.push({ role: 'independent', size: 'L', opts: Object.assign({}, OPTS || {}, v.opts), tag: `independent L {${v.option}: ${v.value}}` });
            // PAGE RULES: each offered support alone (and with the skill's widest-fact probes) on independent and test, and the
            // faded packet, at every size
            const pr = PAGE_RULES[key] || (has('page-rules') ? { probes: [] } : null);
            if (pr) {
                const sups = await page.evaluate(({ categoryId, skillId }) => { const d = (window.offeredOptionsFor(categoryId, skillId) || []).find((x) => x.id === 'support' && x.supportsModel); return d ? d.render : []; }, { categoryId, skillId });
                const sets = [];
                // ('off': the supports-off page with the probe; its default deal is the card's own grid-role job)
                for (const sp of ['off', ...sups]) {
                    if (sp !== 'off') sets.push({ tag: `{support: ${sp}}`, opts: { support: [sp] } });
                    for (const pb of pr.probes || []) if (!pb.for || pb.for.includes(sp)) sets.push({ tag: `{support: ${sp}, ${JSON.stringify(pb.opts).slice(1, -1)}}`, opts: Object.assign(sp === 'off' ? {} : { support: [sp] }, pb.opts), probe: true });
                }
                // (these jobs are judged by the page rules only: the cell bands of the support pages are the critic's, and a
                // probe deals the widest facts alone, a page no one prints as a band sample)
                // (a probe page is held short by its pool - {constant: [12]} deals 13 facts - so EB-PAGE and EB-COLS do not judge it)
                for (const st of sets) for (const role of ['independent', 'test']) for (const size of SIZES) jobs.push({ role, size, opts: Object.assign({}, OPTS || {}, st.opts), tag: `${role} ${size} ${st.tag}`, pr: true, prOnly: true, noPage: !!st.probe, colKey: st.probe ? null : `${role} ${st.tag}` });
                if (sups.length) for (const size of SIZES) jobs.push({ role: 'independent', size, opts: Object.assign({}, OPTS || {}, { support: sups.slice() }), fade: FADE_PAGES, tag: `fade packet ${FADE_PAGES}p ${size}`, pr: true, prOnly: true });
            }
            // the card's grid roles at the skill's defaults take the page rules too (not the option variants: a pool-capped
            // variant - {constant: [3]} - is short by its pool)
            for (const j of jobs) if (pr && !j.pr && PAGE_ROLES.has(j.role) && !j.opts === !OPTS) { j.pr = true; j.colKey = j.role; }
            const colsAt = {};
            // --page-only: only the page-rule jobs (the grid roles and the support / packet jobs); --only <regex>: jobs whose tag matches
            if (has('page-only')) for (let i = jobs.length - 1; i >= 0; i--) if (!jobs[i].pr) jobs.splice(i, 1);
            if (arg('only', null) && !ONLY_RULES) { const re = new RegExp(arg('only')); for (let i = jobs.length - 1; i >= 0; i--) if (!re.test(jobs[i].tag)) jobs.splice(i, 1); }
            notes.push(`${key}: card ${plan.cards.join(', ') || '(none: default roles)'}; ${plan.roles.length} roles x ${SIZES.join('/')} + ${variants.length} option variant(s) of ${vlist.length} + hosts ${HOSTS.join(', ') || 'none'}`);
            for (const j of jobs) {
                const b = await page.evaluate(async ({ categoryId, skillId, j, SEED }) => {
                    try {
                        const sec = { skills: [Object.assign({ categoryId, skillId }, j.opts ? { opts: j.opts } : {})] };
                        if (j.fade) sec.pages = j.fade;
                        const r = await window.buildSheet(Object.assign({ role: j.role, sections: [sec], size: j.size, paper: 'A4', seed: SEED, key: false }, j.fade ? { coverage: 'fade' } : {}));
                        const cols = r.plan && r.plan.meta && r.plan.meta.fits && r.plan.meta.fits[0] ? r.plan.meta.fits[0].cols : null;
                        const sections = new Set((r.items || []).map((it) => it.section)).size;
                        return { html: window.sheetDocument(r.pupilHtml, r.title || 'x', { paper: 'A4' }), cols, sections, measured: (r.items || []).map((it) => (it.measured && cols && it.measured[cols] ? it.measured[cols].hMm : null)) };
                    } catch (e) { return { error: String((e && e.message) || e).slice(0, 200) }; }
                }, { categoryId, skillId, j, SEED });
                if (b.error) { notes.push(`${key} ${j.tag}: not composed (${b.error})`); continue; }
                const sh = await app.browser.newPage();
                try {
                    await sh.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
                    await sh.goto(page.url(), { waitUntil: 'domcontentloaded' });
                    await sh.setContent(b.html, { waitUntil: 'networkidle0', timeout: 60000 });
                    await sh.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', { timeout: 15000 }).catch(() => {});
                    await sh.emulateMediaType('print');
                    const cells = await sh.evaluate(measureCells, 'body > section.ws-page, body > .ws-page');
                    renders++; cellsRead += cells.length;
                    if (!cells.length) { F('EB-READ', `${key} ${j.tag}`, 'no kit cell read on the page (markup changed?)'); continue; }
                    if (!j.prOnly) judge(cells, `${key} ${j.tag}`, F);
                    if (j.pr) {
                        const acc = acceptedShort(plan.cards, j.fade ? 'fade' : j.role, j.size) || ((pr && pr.accepted) || {})[j.size] || null;
                        const pj = judgePages(cells, `${key} ${j.tag}`, F, j.noPage ? true : acc);
                        if (j.colKey) (colsAt[j.colKey] = colsAt[j.colKey] || {})[j.size] = pj;
                        if (j.fade) judgeFactX(cells, `${key} ${j.tag}`, F);
                        judgeGap(cells, `${key} ${j.tag}`, F);
                    }
                    // (`--rule-skills a:b,...`, ws-precritic opt-in: the opt-in rule judges only the opted-in lane's skills)
                    if (has('vocab-ink') && (!arg('rule-skills', null) || arg('rule-skills').split(',').includes(key))) for (const v of await sh.evaluate(measureVocab, 'body > section.ws-page, body > .ws-page')) {
                        if (v.fillH < 0.7 || v.fillW < 0.7) F('EB-VOCAB', `${key} ${j.tag} p${v.page} vocab picture ${v.pic}`, `the drawing fills ${Math.round(v.fillH * 100)} % of its ${v.hMm} mm picture box up and down, ${Math.round(v.fillW * 100)} % across (limit 70 %)`);
                    }
                    // EB-FOOT: pairs only where the page's cells and the measured items are one to one
                    const m = b.measured;
                    if (GRID_ROLES.has(j.role) && b.sections <= 1 && m.length === cells.length && m.every((x) => x != null)) {
                        cells.forEach((c, i) => { const fp = m[i]; if (Math.abs(c.neededMm - fp) > FOOT * fp) F('EB-FOOT', `${key} ${j.tag} p${c.page} cell ${c.label || c.cell}`, `drawn ${c.neededMm} mm, footprint hMm ${fp} mm at ${b.cols} columns (${Math.round((c.neededMm - fp) / fp * 100)} %)`); });
                    } else if (j.role === 'independent' && !j.opts) notes.push(`${key} ${j.tag}: footprint not paired (${cells.length} cells, ${m.length} items, ${m.filter((x) => x == null).length} unmeasured)`);
                } finally { await sh.close(); }
            }
            // (denser = more columns for no fewer problems: M's 2 x 8 = 16 beside-box cells against L's 3 x 4 = 12 is M holding
            // more, not L crowding; R6-3's L 4 x 3 = 12 against M 3 x 4 = 12 is the 4th column buying nothing)
            for (const [k, by] of Object.entries(colsAt)) judgeCols(by, `${key} ${k}`, F);
            if (pr && pr.testEq) judgeTestEq(colsAt, key, F);
            // screen hosts
            const widths = { card: [390, 820, 1280], worksheet: [1280], quiz: [1280] };
            for (const host of HOSTS) for (const w of widths[host] || []) {
                await page.setViewport({ width: w, height: w < 500 ? 844 : 900, deviceScaleFactor: 1 });
                const ok = await page.evaluate(async ({ c, k, host, SEED, OPTS }) => {
                    try {
                        const st = window.state;
                        if (OPTS && window.setSetOptions) { window.clearSetOptions({ silent: true }); window.setSetOptions(c, k, OPTS, { silent: true }); }
                        if (host === 'card') { st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false; window.showView('gameView'); st.currentQ = window.generateQuestionFor({ category: c, skill: k, seed: SEED }); window.renderQuestion(); return '#visualAid'; }
                        if (host === 'worksheet') { st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 2; window.initWorksheet(); return '#worksheetView .mq-wspaper'; }
                        if (host === 'quiz') {
                            const q = window.generateQuestionFor({ category: c, skill: k, seed: SEED, itemIndex: 0 });
                            const questions = [{ id: 0, skillId: k, points: 1, questionData: window.quizQuestionData(Object.assign({ categoryId: c }, q)) }];
                            const test = { id: null, name: 'Band', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }], settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
                            window.handleQuizURL(window.compressTestForURL(test));
                            const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input'));
                            window.startQuizTest(); return '#quizTakeView .mq-qtpaper';
                        }
                        return null;
                    } catch (e) { return 'ERR ' + String((e && e.message) || e).slice(0, 150); }
                }, { c: categoryId, k: skillId, host, SEED, OPTS });
                if (!ok || /^ERR/.test(ok)) { notes.push(`${key} ${host} ${w}: not rendered (${ok})`); continue; }
                await new Promise((r) => setTimeout(r, 450));
                const cells = await page.evaluate(measureCells, ok);
                renders++; cellsRead += cells.length;
                if (!cells.length) { notes.push(`${key} ${host} ${w}: no kit cell on the host (legacy screen item?)`); continue; }
                judge(cells, `${key} ${host} ${w}px`, F);
                await page.evaluate(() => { try { window.state.quizMode = false; } catch (e) { /* ignore */ } });
            }
        }
    } finally { await app.close(); }
    // the pin
    const keyOf = (x) => `${x.where.replace(/ p\d+ cell .*$/, '')}|${x.rule}`;
    const counts = {}; for (const x of findings) counts[keyOf(x)] = (counts[keyOf(x)] || 0) + 1;
    if (arg('write-baseline', null)) {
        fs.writeFileSync(path.resolve(process.cwd(), arg('write-baseline')), JSON.stringify({ note: 'ws-empty-band pin: findings per (skill render, rule) accepted for skills that passed before the check existed. Re-pin only with a STATUS note.', written: new Date().toISOString().slice(0, 10), skills: SKILLS, counts }, null, 1) + '\n');
        console.log(`wrote ${arg('write-baseline')}: ${Object.keys(counts).length} keys`);
    }
    const BASE = has('no-baseline') ? null : path.resolve(ROOT, arg('baseline', 'design/audit/baselines/empty-band.json'));
    let pinned = null;
    if (BASE && fs.existsSync(BASE) && !arg('write-baseline', null)) {
        const pin = JSON.parse(fs.readFileSync(BASE, 'utf8')).counts || {};
        const over = new Set(Object.keys(counts).filter((k) => counts[k] > (pin[k] || 0)));
        pinned = findings.length - findings.filter((x) => over.has(keyOf(x))).length;
        for (const k of Object.keys(pin)) if (SKILLS.some((sk) => k.startsWith(sk + ' ')) && (counts[k] || 0) < pin[k]) notes.push(`pin ${k}: ${pin[k]} -> ${counts[k] || 0} (fixed: tighten the pin)`);
        for (let i = findings.length - 1; i >= 0; i--) if (!over.has(keyOf(findings[i]))) findings.splice(i, 1);
    }
    const rules = ['EB-BAND', 'EB-SIDE', 'EB-FOOT', 'EB-PAGE', 'EB-PAD', 'EB-COLS', 'EB-TESTEQ', 'EB-GAP', 'EB-FACTX', 'EB-READ', 'EB-VOCAB'];
    for (const n of notes) console.log(`note: ${n}`);
    for (const r of rules) { const f = findings.filter((x) => x.rule === r); console.log(`${r.padEnd(8)} ${f.length ? `FAIL ${f.length}` : 'PASS'}`); for (const x of f.slice(0, 15)) console.log(`   ${x.where}: ${x.msg}`); if (f.length > 15) console.log(`   ... ${f.length - 15} more`); }
    console.log(`(${SKILLS.length} skill(s), ${renders} renders, ${cellsRead} cells, ${((Date.now() - T0) / 1000).toFixed(0)} s${pinned != null ? `; ${pinned} finding(s) within the pin ${path.relative(ROOT, BASE)}` : ''})`);
    if (arg('json', null)) fs.writeFileSync(path.resolve(process.cwd(), arg('json')), JSON.stringify({ skills: SKILLS, findings, notes, renders, cells: cellsRead }, null, 1));
    const bad = findings.length || !renders ? (findings.length || 1) : 0;
    console.log(`ws-fact-pages: ${bad ? `FAIL (${findings.length || 'nothing rendered'})` : 'OK'}`);
    process.exit(bad && !has('report-only') ? 1 : 0);
}
if (has('self-test')) selfTest();
else main().catch((e) => { console.error(e); console.log('ws-fact-pages: FAIL'); process.exit(1); });
