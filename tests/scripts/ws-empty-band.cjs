#!/usr/bin/env node
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
//             PT-MOD-3 (lead ruling 2026-11-12): on a Scripted Model, a state that is not its example's last is excused when its
//             band is <= 35 % AND a later state of the same example draws ink in that band (the room kept for a later mark).
//             --self-test checks it (the ink appears later: excused; it never appears: FAIL).
//   EB-SIDE   the empty band BESIDE the ink (left or right of the ink box): FAIL at >= 30 % of the cell width (RUBRIC H13).
//   EB-FOOT   the drawn height vs the footprint: the cell's needed height (top pad + ink + empty slots + bottom pad) against
//             the hMm the bridge measured for the item at the page's column count (buildSheet items[i].measured[cols].hMm);
//             FAIL when they differ by more than 10 %. Judged on the grid roles that lay out from that measure (independent,
//             more-practice, test, review, mixed-practice). PAIRING (critic eb-r5 m1): the kit writes data-eb-item on each grid
//             cell (the bridge's item index, or the list "3,4" for a cell holding several), and EVERY indexed cell is judged
//             against ITS OWN item's measure at the column count of the grid that lays it - a page that reorders its items by
//             height (arrays_groups) is never judged against another item's footprint. Fallbacks, each printed as a NOTE naming
//             its mode, never a silent pass: no index on the page -> POSITION pairing (dealt order, only where cells and measured
//             items are one to one); a multi-item cell with no bridge measure, an index outside the items, an unmeasured item or
//             an unindexed cell on an indexed page -> not judged. A role that draws its own cell (fact-probe rows, word-problems
//             stories, the guided model) is not judged by it.
//   --slot-ink off (opt-in, lf-vocab r6, critic r4 #1): an EMPTY answer slot that draws nothing (no text, no stroke, no
//             drawing) does NOT count as ink - the band is measured as the critic's row-ink scan of the PNG sees it (the
//             critic measured pick3 error analysis S at 30.1 % while the default rule passed it), and EB-BAND reads the
//             LONGEST blank run of rows between the cell's rules (padding included, above, between or under the ink), as
//             the critic's per-cell scan does. A `legacy` cell (another skill's old print HTML) is printed as a note, not
//             judged. The default stays on.
//   EB-PAGE   (opt-in --page-fill) a page before the role's last with 30 % or more of its body empty under its last block.
//   --margin N judges EB-BAND / EB-SIDE at 30 - N % (a fix must clear the limit, not graze it).
//   EB-GDPCAP a Guided page (all its pages) holding more scored tries than the PAGE_TYPES §12.1 / design-standard 12.1 ceiling for
//             its size: 10 / 8 / 6 at S / M / L, plus the Model(s) (lead ruling 2026-11-12, lf-ops facts-roles option b: the fact
//             pages had lifted it to 31 / 23 / 19 to fill the page). Read from buildSheet's plan.meta.scoreOutOf. --self-test checks it.
//   EB-EDGE   ink within EDGE_MM (1.5 mm) of, or across, the cell's own border (a cell divider or the page frame), on every
//             row of every role and host (lf-ops facts-roles critic r1 G1: Guided S add / sub facts, the hinted row 1's dot tiles
//             ran onto the divider and the fifth cell's tile across the frame; EB-SIDE reads the band beside the ink, never a
//             collision). Measured left and right on the ink box of the cell (the tab / letter label excluded).
//   MOD-MARKS (opt-in --model-states) a Scripted Model whose adjacent states (step k, step k + 1 of one example) draw the same
//             picture: PT-MOD-1 asks a new grey mark each step (lf-ops facts-roles critic r1 S1: states 1..n-1 of every fact
//             Model were the blank problem). Compared on the state cell's markup, its step text left out.
//   MOD-LINES (opt-in --model-states) a Scripted Model step text over 2 line boxes (PT-MOD-2; critic r1 S2: mult_facts step 2
//             wrapped to 4-5 lines).
//   MOD-GRID  (opt-in --model-states) a Scripted Model grid with an EMPTY state cell (no text, no drawing): 4 states laid 3 + 1
//             left 2 of 6 cells blank and pushed the second example off the page (lf-ops facts-roles critic r2 S4: mult_facts /
//             div_facts Model L). A grid of states lays them evenly (2 + 2), the next example on a continuation page.
//   EB-GAP    (opt-in --model-states) the INTERIOR empty band of a Scripted Model state cell: from the bottom of its step text
//             to the top of the next ink under it (the problem), read on the PIXELS as the critic reads it. FAIL at >= 30 % of the cell height (RUBRIC H13; --margin
//             applies), as EB-BAND under the ink (lf-ops facts-roles critic r3 S5: div_facts Model L, 30.3-30.9 % in all 8 state
//             cells, missed because EB-BAND reads only the band under the ink). PT-MOD-3 excuses it as it does EB-BAND: not the
//             example's last state, <= 35 %, and a later state of the same example inks that band. --self-test checks it.
//   EB-PAGE also, with --model-states, a Scripted Model page using under 70 % of its body (the last ink above the footer;
//             critic r1 S3: 23-42 % used; lead ruling 2026-11-12: a second worked example fills it). Guided is EXEMPT from
//             EB-PAGE (lead ruling 2026-11-12, PT-GDP / PAGE_TYPES §12.1: the white under a Guided grid is accepted; the tries
//             stay at the 10 / 8 / 6 ceiling, EB-GDPCAP).
//   EB-PARITY (opt-in --screen-parity, --rule-skills) a kit-template skill's card / worksheet / quiz host draws no kit cell of its
//             print template, or no answer place inside it, or an empty legacy box beside it (lf-placevalue critic nwf r1 N9).
//   EB-VOCAB  (opt-in --vocab-ink) a lesson vocabulary picture drawn in under 70 % of its own box (see measureVocab).
// Cells under 10 mm are not judged (a tick box, a choice ring). A finding names role, size (or host and width), page, cell.
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
// EB-GDPCAP: the Guided tries ceiling (PAGE_TYPES §12.1), and its verdict on one Guided render (null = within it)
const GDP_CAP = { S: 10, M: 8, L: 6 };
const gdpCap = (role, size, tries) => (role === 'guided' && GDP_CAP[size] != null && Number.isFinite(tries) && tries > GDP_CAP[size]
    ? `${tries} scored tries on the Guided page(s) at ${size}; the §12.1 ceiling is ${GDP_CAP[size]} plus the Model` : null);
// PT-MOD-3 (lead ruling 2026-11-12, lf-ops facts-roles r2): a Scripted Model state's room kept for later marks is not an empty band
// when ALL hold - the role is scripted-model, the state is not its example's last, the band is <= 35 % of the cell, and a LATER
// state of the same example draws ink in that band (reserved, not just white). cells: measureCells' list in page order (step =
// the state's step number, 1 starts an example; inkMm = the ink's bottom from the cell's top). true = the band is excused.
const MOD3_BAND = 0.35;
function modBandOk(role, cells, i) {
    const c = cells[i];
    if (role !== 'scripted-model' || !Number.isFinite(c.step) || c.belowMm > MOD3_BAND * c.hMm) return false;
    for (let k = i + 1; k < cells.length && Number.isFinite(cells[k].step) && cells[k].step > cells[k - 1].step; k++) {
        if (cells[k].inkMm > c.inkMm + 1) return true;   // a later state's ink reaches into this state's band
    }
    return false;
}
// EB-GAP (critic r3 S5): the step-text-to-problem band of a Scripted Model state. c.gapMm / c.gapAtMm from measureCells (the
// band's height and its top from the cell's top), c.iv the ink's [top, bottom] intervals (mm from the cell's top). The band is
// excused (PT-MOD-3) when the state is not its example's last, the band is <= 35 %, and a later state of the example inks it.
function gapBad(role, cells, i, lim) {
    const c = cells[i];
    if (role !== 'scripted-model' || !Number.isFinite(c.step) || !(c.gapMm >= lim * c.hMm)) return false;
    if (c.gapMm > MOD3_BAND * c.hMm) return true;
    const a = c.gapAtMm + 1, b = c.gapAtMm + c.gapMm - 1;
    for (let k = i + 1; k < cells.length && Number.isFinite(cells[k].step) && cells[k].step > cells[k - 1].step; k++) {
        if ((cells[k].iv || []).some(([t, u]) => t < b && u > a)) return false;   // a later mark is drawn in the band
    }
    return true;
}
// EB-FOOT's column count for a cell: the column count of the grid that lays it (a lone last-row cell of a 2-column grid is
// still at 2; a full-width problem in its own 1-column grid at 1); with no grid read, the cells across its row.
function footCols(c, cells) { return c.gridCols || cells.filter((d) => d.page === c.page && Math.abs(d.topPx - c.topPx) <= 4).length; }
// EB-FOOT pairing, pure (critic eb-r5 m1). m: per item, its measured hMm by column count ({2: 41.4, 1: 30}) or null; cols: the
// page's first fit's column count (the position fallback's default). combo(ids, k): the bridge's measure of a multi-item cell
// (none today). Returns { mode: 'index' | 'position' | '', out: [{c, fp, k, ids}], notes } - every fallback writes a note.
const idsOf = (c) => (Array.isArray(c.items) ? c.items : []);
function footFindings(cells, m, cols, sections, lim = 0.10, combo = () => null) {
    const out = [], notes = [];
    const fpOf = (mi, k) => (mi ? (mi[k] != null ? mi[k] : mi[cols]) : null);
    const off = (c, fp) => fp != null && Math.abs(c.neededMm - fp) > lim * fp;
    if (cells.some((c) => idsOf(c).length)) {
        for (const c of cells) {
            const ids = idsOf(c), k = footCols(c, cells), nm = `p${c.page} cell ${c.label || c.cell}`;
            if (!ids.length) { notes.push(`EB-FOOT fallback (unindexed cell): ${nm} has no data-eb-item on an indexed page, footprint not judged`); continue; }
            if (ids.some((i) => !Number.isInteger(i) || i < 0 || i >= m.length)) { notes.push(`EB-FOOT fallback (index out of range): ${nm} item index ${ids.join(',')} outside the ${m.length} measured items, footprint not judged`); continue; }
            const fp = ids.length === 1 ? fpOf(m[ids[0]], k) : combo(ids, k);
            if (fp == null) { notes.push(ids.length > 1 ? `EB-FOOT fallback (multi-item cell, no measure): ${nm} holds items ${ids.map((i) => i + 1).join('+')}; the bridge gives no measure for that combination at ${k} across, footprint not judged` : `EB-FOOT fallback (unmeasured item): ${nm} item ${ids[0] + 1} has no measure at ${k} across, footprint not judged`); continue; }
            if (off(c, fp)) out.push({ c, fp, k, ids });
        }
        return { mode: 'index', out, notes };
    }
    if (!(sections <= 1 && m.length === cells.length && m.every((x) => x != null))) {
        notes.push(`EB-FOOT not paired: no data-eb-item on the page and no one-to-one position pairing (${cells.length} cells, ${m.length} items, ${m.filter((x) => x == null).length} unmeasured, ${sections} section(s))`);
        return { mode: '', out, notes };
    }
    notes.push(`EB-FOOT fallback (position pairing): no data-eb-item on the page, cells paired with the items in dealt order (a page that reorders its items reads false findings)`);
    cells.forEach((c, i) => { const k = footCols(c, cells); const fp = fpOf(m[i], k); if (off(c, fp)) out.push({ c, fp, k, ids: [i] }); });
    return { mode: 'position', out, notes };
}
if (argv.includes('--self-test')) {
    {   // EB-FOOT pairing (critic eb-r5 m1): by the kit's index on a reordered page; a real footprint error still fails; every
        // fallback prints a note naming its mode (critic eb-r6 m1)
        const mk = (items, needed, cell, extra) => Object.assign({ page: 1, cell, topPx: cell <= 2 ? 10 : 300, hMm: 60, neededMm: needed, gridCols: 2, items }, extra || {});
        const m = [{ 2: 41.4 }, { 2: 61.4 }, { 2: 46.4 }, { 2: 51.8 }];
        // arrays_groups-like: the page draws the items tallest first (1, 3, 2, 0), each cell at its own item's footprint
        const reordered = [mk([1], 61.4, 1), mk([3], 51.8, 2), mk([2], 46.4, 3), mk([0], 41.4, 4)];
        const realErr = [mk([1], 61.4, 1), mk([3], 60.0, 2), mk([2], 46.4, 3), mk([0], 41.4, 4)];      // item 4 drawn 16 % over
        const noIdx = reordered.map((c) => Object.assign({}, c, { items: [] }));
        const has = (r, re) => r.notes.some((n) => re.test(n));
        const r = {
            reordered: footFindings(reordered, m, 2, 1), realErr: footFindings(realErr, m, 2, 1), pos: footFindings(noIdx, m, 2, 1),
            multi: footFindings([mk([0, 1], 50, 1), mk([2], 46.4, 2)], m, 2, 1), multiM: footFindings([mk([0, 1], 50, 1)], m, 2, 1, 0.10, (ids, k) => (ids.join() === '0,1' && k === 2 ? 60 : null)),
            range: footFindings([mk([9], 50, 1), mk([1], 70, 2)], m, 2, 1), unIdx: footFindings([mk([0], 41.4, 1), mk([], 90, 2)], m, 2, 1),
            none: footFindings(noIdx.slice(0, 3), m, 2, 1), cols1: footFindings([mk([2], 36, 1, { gridCols: 1 })], [{ 1: 30, 2: 46.4 }, null, { 1: 30, 2: 46.4 }], 2, 2),
        };
        const fc = [['reordered page, by index: no finding', r.reordered.out.length, 0], ['reordered page: mode index', r.reordered.mode, 'index'], ['reordered page: no note', r.reordered.notes.length, 0],
            ['real footprint error: FAIL', r.realErr.out.map((x) => x.ids.join()).join(), '3'],
            ['no index: position fallback', r.pos.mode, 'position'], ['no index: position note', has(r.pos, /fallback \(position pairing\)/), true], ['no index on a reordered page: false findings by position', r.pos.out.length > 0, true],
            ['multi-item, no measure: note', has(r.multi, /fallback \(multi-item cell, no measure\)/), true], ['multi-item, no measure: the other cell judged', r.multi.out.length, 0],
            ['multi-item, measured combination: judged', r.multiM.out.length, 1],
            ['index out of range: note', has(r.range, /fallback \(index out of range\)/), true], ['index out of range: the other cell judged', r.range.out.length, 1],
            ['unindexed cell on an indexed page: note', has(r.unIdx, /fallback \(unindexed cell\)/), true],
            ['no index, not one to one: not paired, noted', r.none.mode + '|' + has(r.none, /not paired/), '|true'],
            ['own grid column count', r.cols1.out.map((x) => `${x.fp}@${x.k}`).join(), '30@1']];
        const fbad = fc.filter(([, got, want]) => got !== want);
        for (const [n, got, want] of fbad) console.log(`self-test FAIL: EB-FOOT pairing ${n}: ${got}, want ${want}`);
        if (fbad.length) { console.log(`ws-empty-band self-test: FAIL (EB-FOOT pairing)`); process.exit(1); }
        for (const k of ['pos', 'multi', 'range', 'unIdx', 'none']) for (const n of r[k].notes) console.log(`  note (${k}): ${n}`);
        console.log(`EB-FOOT pairing: ${fc.length} cases OK`);
    }
    {   // EB-GAP: 30.5 % never inked (FAIL, the div_facts r3 state) / 27 % (OK) / reserved and inked later (OK) / not the Model (OK)
        const g = (step, gapAtMm, gapMm, iv) => ({ step, gapAtMm, gapMm, hMm: 81.2, iv });
        const div = [g(1, 10, 24.8, [[3, 10], [34.8, 50]]), g(2, 10, 24.8, [[3, 10], [34.8, 56]]), g(3, 10, 24.8, [[3, 10], [34.8, 62]]), g(4, 10, 24.8, [[3, 10], [34.8, 62]])];
        const fixed = div.map((c) => Object.assign({}, c, { gapMm: 21.9 }));
        const resv = [g(1, 10, 26, [[3, 10], [36, 50]]), g(2, 10, 12, [[3, 10], [22, 30], [36, 50]])];
        const gc = [['div_facts r3 state 1', gapBad('scripted-model', div, 0, 0.30), true], ['div_facts r3 last state', gapBad('scripted-model', div, 3, 0.30), true],
            ['fixed 27 %', gapBad('scripted-model', fixed, 0, 0.30), false], ['reserved, inked later', gapBad('scripted-model', resv, 0, 0.30), false],
            ['guided', gapBad('guided', div, 0, 0.30), false], ['27 % at --margin 4', gapBad('scripted-model', fixed, 0, 0.26), true]];
        const gbad = gc.filter(([, got, want]) => got !== want);
        for (const [n, , want] of gbad) console.log(`self-test FAIL: EB-GAP ${n} should ${want ? 'fail' : 'pass'}`);
        if (gbad.length) { console.log(`ws-empty-band self-test: FAIL (EB-GAP)`); process.exit(1); }
    }
    {   // PT-MOD-3: the ink appears later (OK) / never appears (FAIL) / over 35 % / not the Model / the last state
        const st = (step, inkMm, belowMm) => ({ step, inkMm, belowMm, hMm: 80 });
        const later = [st(1, 50, 26), st(2, 58, 18), st(3, 66, 10), st(4, 66, 10)];
        const never = [st(1, 50, 26), st(2, 50, 26), st(3, 50, 26), st(4, 50, 26)];
        const wide = [st(1, 40, 36), st(2, 70, 6)];
        const nextEx = [st(1, 50, 26), st(2, 50, 26), st(1, 70, 6), st(2, 70, 6)];
        const mc = [['later, state 1', modBandOk('scripted-model', later, 0), true], ['never', modBandOk('scripted-model', never, 0), false],
            ['band 45 %', modBandOk('scripted-model', wide, 0), false], ['guided', modBandOk('guided', later, 0), false],
            ['last state', modBandOk('scripted-model', later, 3), false], ['ink only in the next example', modBandOk('scripted-model', nextEx, 0), false]];
        const mbad = mc.filter(([, got, want]) => got !== want);
        for (const [n, , want] of mbad) console.log(`self-test FAIL: PT-MOD-3 ${n} should ${want ? 'be excused' : 'fail'}`);
        if (mbad.length) { console.log(`ws-empty-band self-test: FAIL (PT-MOD-3)`); process.exit(1); }
    }
    const cases = [['guided', 'S', 10, false], ['guided', 'S', 11, true], ['guided', 'M', 8, false], ['guided', 'M', 23, true], ['guided', 'L', 6, false],
        ['guided', 'L', 7, true], ['guided', 'L', 19, true], ['independent', 'L', 30, false], ['guided', 'M', undefined, false]];
    const bad = cases.filter(([r, z, n, want]) => !!gdpCap(r, z, n) !== want);
    for (const c of bad) console.log(`self-test FAIL: gdpCap(${c.slice(0, 3).join(', ')}) should ${c[3] ? '' : 'not '}fail`);
    console.log(`ws-empty-band self-test: ${bad.length ? "FAIL" : "OK"} (${cases.length} EB-GDPCAP + 6 PT-MOD-3 + 6 EB-GAP + 15 EB-FOOT pairing cases)`);
    process.exit(bad.length ? 1 : 0);
}
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const SKILLS = (arg('skill', '') || arg('skills', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
if (!SKILLS.length || SKILLS.some((s) => !s.includes(':'))) { console.log('usage: ws-empty-band.cjs --skill cat:skill[,cat:skill] [--roles r,..] [--sizes S,M,L] [--hosts card,worksheet,quiz|none] [--variants 6] [--opts json] [--seed 7] [--json f] [--report-only]'); console.log('ws-empty-band: FAIL (usage)'); process.exit(2); }
const SIZES = (arg('sizes', 'S,M,L')).split(',').map((s) => s.trim()).filter(Boolean);
const HOSTS = arg('hosts', 'card,worksheet,quiz') === 'none' ? [] : arg('hosts', 'card,worksheet,quiz').split(',').map((s) => s.trim());
const SEED = parseInt(arg('seed', '7'), 10);
const NVAR = parseInt(arg('variants', '6'), 10);
const OPTS = arg('opts', null) ? JSON.parse(arg('opts')) : null;
const DEFAULT_ROLES = ['independent', 'more-practice', 'guided', 'error-analysis', 'review', 'test', 'true-false', 'reason-it', 'lesson'];
const SLOT_INK = arg('slot-ink', 'on') !== 'off';
const LEGACY_NOTES = [];
// (`--margin N`, lf-placevalue critic r4 N-r4-1, owner 2026-11-09 "every finding a check": a fix that clears the 30 % limit by under
// N points is fragile - G2 passed at 29.9 % - so the band and side limits are judged at 30 - N %; absent, 30 % as before)
const MARGIN = Math.max(0, Number((process.argv.includes('--margin') && process.argv[process.argv.indexOf('--margin') + 1]) || 0)) / 100;
const BAND = 0.30 - MARGIN, SIDE = 0.30 - MARGIN, FOOT = 0.10, MIN_MM = 10, EDGE_MM = 1.5;
// the roles that lay their grid out from the items' measured footprints (buildSheet items[i].measured[cols].hMm)
const GRID_ROLES = new Set(['independent', 'more-practice', 'test', 'review', 'mixed-practice']);

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
function measureCells(scope, slotInk = true) {
    const MM = 96 / 25.4;
    const visible = (e) => { const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity || '1') > 0.05; };
    const out = [];
    const roots = [...document.querySelectorAll(scope)];
    roots.forEach((rt, pi) => {
        const cells = [...rt.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]') && visible(c));
        cells.forEach((c, ci) => {
            const cr = c.getBoundingClientRect(); if (cr.height < 10 * MM || cr.width < 10 * MM) return;
            const cs = getComputedStyle(c);
            const inner = { t: cr.top + parseFloat(cs.paddingTop) + parseFloat(cs.borderTopWidth), b: cr.bottom - parseFloat(cs.paddingBottom) - parseFloat(cs.borderBottomWidth), l: cr.left + parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth), r: cr.right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth) };
            let box = null; const runs = [];
            const inks = [];   // each ink box's top/bottom (for EB-SUPBAND: the gap under the support drawing)
            const take = (r) => { if (!r.width || !r.height) return; runs.push([r.top, r.bottom]); inks.push({ t: r.top, b: r.bottom, l: r.left, r: r.right }); box = box ? { t: Math.min(box.t, r.top), b: Math.max(box.b, r.bottom), l: Math.min(box.l, r.left), r: Math.max(box.r, r.right) } : { t: r.top, b: r.bottom, l: r.left, r: r.right }; };
            // the support array drawing (÷ frame or × array): its bottom edge, so EB-SUPBAND can read the band below IT (D4)
            const supSvg = [...c.querySelectorAll('[data-ws-support-on] svg, [data-ws-supports] svg, .ws-support svg')].find((v) => /rows? of \d+|^no dots$/.test(v.getAttribute('aria-label') || ''));
            for (const d of c.querySelectorAll('*')) {
                if (d.closest('[data-ws-label], .ws-letter, .ws-tab') || !visible(d)) continue;
                const st = getComputedStyle(d);
                const ownText = [...d.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
                const stroked = (parseFloat(st.borderTopWidth) > 0 && st.borderTopStyle !== 'none') || (parseFloat(st.borderBottomWidth) > 0 && st.borderBottomStyle !== 'none') || (parseFloat(st.borderLeftWidth) > 0 && st.borderLeftStyle !== 'none');
                const drawn = d instanceof SVGElement ? /^(svg)$/i.test(d.tagName) : /^(img|canvas|input)$/i.test(d.tagName);
                const slot = slotInk && d.hasAttribute('data-ws-slot');
                if (ownText) {
                    const rg = document.createRange(); rg.selectNodeContents(d);
                    // slot ink off: a text line's INK, not its line box - the half-leading and the descender room are blank
                    // pixels in the critic's scan (the glyphs run from about 0.05 em under the em box top to the baseline,
                    // 0.2 em above its bottom)
                    const fs = parseFloat(st.fontSize) || 0;
                    for (const r of rg.getClientRects()) {
                        if (slotInk || !fs || r.height <= fs * 0.5) { take(r); continue; }
                        const lead = Math.max((r.height - fs) / 2, 0);
                        take({ width: r.width, height: 1, left: r.left, right: r.right, top: r.top + lead + 0.05 * fs, bottom: r.bottom - lead - 0.2 * fs });
                    }
                    continue;
                }
                if (drawn || stroked || slot) take(d.getBoundingClientRect());
            }
            if (!box) return;
            // EB-SUPBAND (critic divarray r1 D4): the empty band directly under the support drawing - from its bottom to the
            // nearest ink below it (the answer slot), or to the cell's inner bottom when nothing is below. An unframed × array
            // sat in a cell sized for a 10-12-row one, 36-44 % empty below it, under a slot that EB-BAND counted as the floor.
            let supBelow = null;
            if (supSvg) {
                const sr = supSvg.getBoundingClientRect();
                // (r2: a support BESIDE ink that runs lower - the fact beside the × band frame - has no empty band under it: the
                // strip under the frame holds the fact's lower rows, and the band under the cell's LAST ink is EB-BAND's)
                const beside = inks.some((r) => r.t < sr.bottom - 1 && r.b > sr.bottom + 1 && (r.r <= sr.left + 1 || r.l >= sr.right - 1));
                if (sr.height > 0 && beside) supBelow = 0;
                else if (sr.height > 0) {
                    const below = inks.filter((r) => r.t >= sr.bottom - 1);
                    const nextTop = below.length ? Math.min(...below.map((r) => r.t)) : inner.b;
                    supBelow = Math.max(Math.min(nextTop, inner.b) - sr.bottom, 0);
                }
            }
            const H = inner.b - inner.t, W = inner.r - inner.l;
            const hwVar = parseFloat(getComputedStyle(c).getPropertyValue('--ws-hw')) || 0;
            const hw = /mm/.test(getComputedStyle(c).getPropertyValue('--ws-hw')) ? hwVar * MM : hwVar;
            // slot ink off: the critic's row-ink scan - the longest blank run of rows between the cell's own rules (its
            // border's inner edges, the padding included), anywhere in the cell, as a share of the cell height
            let below = Math.max(inner.b - box.b, 0);
            if (!slotInk) {
                const top = cr.top + parseFloat(cs.borderTopWidth), bot = cr.bottom - parseFloat(cs.borderBottomWidth);
                let y = top, gap = 0;
                for (const [a, b] of runs.sort((p, q) => p[0] - q[0])) { if (a > y) gap = Math.max(gap, a - y); y = Math.max(y, b); }
                below = Math.max(gap, bot - y, 0);
            }
            const side = Math.max(box.l - inner.l, inner.r - box.r, 0);
            // EB-EDGE: the ink's nearest approach to the cell's own border, left or right (negative: across it)
            const edge = Math.min(box.l - cr.left, cr.right - box.r);
            out.push({ page: pi + 1, cell: ci + 1, label: ((c.querySelector('[data-ws-label], .ws-letter') || {}).textContent || '').trim(), hMm: +(cr.height / MM).toFixed(1), wMm: +(cr.width / MM).toFixed(1),
                innerMm: +(H / MM).toFixed(1), belowMm: +(below / MM).toFixed(1), sideMm: +(side / MM).toFixed(1), hwMm: +(hw / MM).toFixed(1), innerW: +(W / MM).toFixed(1), edgeMm: +(edge / MM).toFixed(1),
                neededMm: +(((box.b - cr.top) + (cr.bottom - inner.b)) / MM).toFixed(1), tmpl: c.getAttribute('data-ws-cell') || '',
                supBelowMm: supBelow === null ? null : +(supBelow / MM).toFixed(1),
                step: Number(((c.querySelector('.mq-steptext em') || {}).textContent) || NaN), inkMm: +((box.b - cr.top) / MM).toFixed(1),
                // EB-FOOT (critic eb-r5 m1): the bridge's item index(es) the kit wrote on the cell ([] when absent), the cell's top
                // (its row), and the column count of the grid that LAYS it (a re-laid grid, grid.js PG-15, is cut into lcm tracks:
                // its columns are the tracks over a full row's span)
                items: c.hasAttribute('data-eb-item') ? c.getAttribute('data-eb-item').split(',').map(Number) : [], topPx: Math.round(cr.top),
                gridCols: (() => { const g = c.closest('.ws-grid'); if (!g) return 0; const t = getComputedStyle(g).gridTemplateColumns || ''; const n = t && t !== 'none' ? t.trim().split(/\s+/).length : 0;
                    if (!n || !g.classList.contains('relaid')) return n; const f = g.querySelector(':scope > [data-ws-cell]'); const sp = f && /span\s+(\d+)/.exec(f.style.gridColumn || f.getAttribute('style') || ''); return sp && +sp[1] > 0 ? Math.round(n / +sp[1]) : n; })() });
        });
    });
    return out;
}

// EB-GAP (critic r3 S5): measured on the PIXELS, as the critic measures (a text line box carries its leading: the DOM band read
// 19.3 mm where the glyphs leave 24.8 mm). png: a data URL of the full page at 1 px = 1 CSS px. For each top-level state cell with
// a step text (indexed as measureCells indexes them: page, cell): the rows holding a pixel darker than 225 (the trace grey #949494
// counts) inside the cell's inner box; the band from the step text's last ink row to the first ink row under it; the ink rows'
// intervals (mm from the cell's top) for PT-MOD-3. Additive: read only with --model-states.
async function measureGap(arg) {
    const { scope, png } = arg;
    const MM = 96 / 25.4;
    const img = new Image(); img.src = png; await img.decode();
    const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
    const g = cv.getContext('2d'); g.drawImage(img, 0, 0);
    const visible = (e) => { const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity || '1') > 0.05; };
    const out = {};
    const sx = window.scrollX, sy = window.scrollY;
    [...document.querySelectorAll(scope)].forEach((rt, pi) => {
        const cells = [...rt.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]') && visible(c));
        cells.forEach((c, ci) => {
            const st = c.querySelector('.mq-steptop, .mq-steptext'); if (!st) return;
            const cr = c.getBoundingClientRect(), cs = getComputedStyle(c);
            const x0 = Math.ceil(cr.left + sx + parseFloat(cs.borderLeftWidth) + 2), x1 = Math.floor(cr.right + sx - parseFloat(cs.borderRightWidth) - 2);
            const y0 = Math.ceil(cr.top + sy + parseFloat(cs.borderTopWidth) + 2), y1 = Math.floor(cr.bottom + sy - parseFloat(cs.borderBottomWidth) - 2);
            if (x1 <= x0 || y1 <= y0) return;
            const d = g.getImageData(x0, y0, x1 - x0, y1 - y0).data, w = x1 - x0;
            const rows = [];
            for (let y = 0; y < y1 - y0; y++) { let ink = false; for (let x = 0; x < w && !ink; x++) { const k = (y * w + x) * 4; if ((d[k] + d[k + 1] + d[k + 2]) / 3 < 225) ink = true; } rows.push(ink); }
            const stEnd = Math.round(st.getBoundingClientRect().bottom + sy) - y0;   // the step text's own box ends here
            let tb = -1; for (let y = 0; y < Math.min(stEnd, rows.length); y++) if (rows[y]) tb = y;
            let nx = -1; for (let y = Math.max(stEnd, 0); y < rows.length; y++) if (rows[y]) { nx = y; break; }
            const iv = []; let s0 = -1;
            rows.forEach((r, y) => { if (r && s0 < 0) s0 = y; if (!r && s0 >= 0) { iv.push([s0, y]); s0 = -1; } }); if (s0 >= 0) iv.push([s0, rows.length]);
            const off = y0 - (cr.top + sy);
            out[`${pi + 1}:${ci + 1}`] = { gapMm: tb >= 0 && nx >= 0 ? +((nx - tb - 1) / MM).toFixed(1) : NaN, gapAtMm: +((tb + 1 + off) / MM).toFixed(1), iv: iv.map(([a, b]) => [+((a + off) / MM).toFixed(1), +((b + off) / MM).toFixed(1)]) };
        });
    });
    return out;
}

// MOD-MARKS / MOD-LINES / the Scripted Model page fill (opt-in --model-states; lf-ops facts-roles critic r1 S1-S3)
function measureModel(scope) {
    const MM = 96 / 25.4;
    const out = { same: [], lines: [], used: [], empty: [] };
    [...document.querySelectorAll(scope)].forEach((pg, pi) => {
        const states = [...pg.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]') && !c.classList.contains('mq-stepcell'));
        // MOD-GRID: a top-level cell of the Model grid that draws nothing (a filler place of a short row)
        [...pg.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]')).forEach((c, ci) => {
            if (!c.textContent.trim() && !c.querySelector('svg, img, canvas') && c.getBoundingClientRect().height > 10 * MM) out.empty.push(`p${pi + 1} cell ${ci + 1} (${(c.getBoundingClientRect().width / MM).toFixed(0)} x ${(c.getBoundingClientRect().height / MM).toFixed(0)} mm)`);
        });
        const numOf = (c) => { const e = c.querySelector('.mq-steptext em'); return e ? Number(e.textContent) : NaN; };
        const ink = (c) => { const x = c.cloneNode(true); x.querySelectorAll('.mq-steptop, [data-ws-label], .ws-letter').forEach((e) => e.remove()); return x.innerHTML.replace(/\sdata-ws-state="[^"]*"/g, ''); };
        for (let i = 1; i < states.length; i++) if (numOf(states[i]) === numOf(states[i - 1]) + 1 && ink(states[i]) === ink(states[i - 1])) out.same.push(`p${pi + 1} states ${numOf(states[i - 1])} and ${numOf(states[i])}`);
        for (const sp of pg.querySelectorAll('.mq-steptext span')) {
            const rg = document.createRange(); rg.selectNodeContents(sp);
            const tops = new Set([...rg.getClientRects()].filter((r) => r.width > 1).map((r) => Math.round(r.top)));
            if (tops.size > 2) out.lines.push(`p${pi + 1} step ${(sp.parentElement.querySelector('em') || {}).textContent}: ${tops.size} lines ("${sp.textContent.slice(0, 50)}")`);
        }
        const body = pg.querySelector('.ws-body') || pg; const br = body.getBoundingClientRect();
        const kids = [...body.children].filter((x) => x.getBoundingClientRect().height > 0 && !/ws-foot|ws-footer/.test(x.className));
        const last = kids.length ? Math.max(...kids.map((x) => x.getBoundingClientRect().bottom)) : br.top;
        out.used.push(Math.round((last - br.top) / br.height * 100));
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

function judge(cells, where, F, role) {
    cells.forEach((c, i) => {
        // (--slot-ink off judges the lane's KIT cells: a `legacy` cell - another skill's old print HTML, e.g. a pre-skill check's
        // prerequisite items - is listed as a note, never passed silently; its band belongs to that skill's family)
        if (!SLOT_INK && c.tmpl === 'legacy') { LEGACY_NOTES.push(`${where} p${c.page} cell ${c.label || c.cell}: legacy cell not judged by --slot-ink off (${(c.belowMm / c.hMm * 100).toFixed(1)} %)`); return; }
        const lim = BAND * c.hMm;
        if (c.belowMm >= lim && !modBandOk(role, cells, i)) F('EB-BAND', `${where} p${c.page} cell ${c.label || c.cell}`, `empty band ${c.belowMm} mm under the ink of a ${c.hMm} mm cell (${(c.belowMm / c.hMm * 100).toFixed(1)} %; limit 30 % = ${lim.toFixed(1)} mm) [${c.tmpl}]`);
        if (Number.isFinite(c.edgeMm) && c.edgeMm < EDGE_MM) F('EB-EDGE', `${where} p${c.page} cell ${c.label || c.cell}`, `ink ${c.edgeMm < 0 ? `${-c.edgeMm} mm across` : `${c.edgeMm} mm from`} the cell's border (a divider or the page frame; limit ${EDGE_MM} mm) [${c.tmpl}]`);
        if (c.sideMm >= SIDE * c.innerW) F('EB-SIDE', `${where} p${c.page} cell ${c.label || c.cell}`, `empty band ${c.sideMm} mm beside the ink of a ${c.wMm} mm wide cell (${Math.round(c.sideMm / c.innerW * 100)} %) [${c.tmpl}]`);
        // EB-SUPBAND (critic divarray r1 D4): the band directly UNDER the support drawing (not only under the item) - an
        // unframed × array in a cell sized for a 10-12-row one leaves it empty under a slot EB-BAND counts as the floor.
        if (c.supBelowMm !== null && c.supBelowMm !== undefined && c.supBelowMm >= BAND * c.hMm) F('EB-SUPBAND', `${where} p${c.page} cell ${c.label || c.cell}`, `empty band ${c.supBelowMm} mm under the support drawing of a ${c.hMm} mm cell (${(c.supBelowMm / c.hMm * 100).toFixed(1)} %; limit 30 % = ${(BAND * c.hMm).toFixed(1)} mm) [${c.tmpl}]`);
    });
}

async function main() {
    const findings = []; const notes = []; let renders = 0, cellsRead = 0;
    // (`--only R1,R2`: judge only these rules - a backtest row proves one rule alone)
    const ONLY = arg('only', null) ? arg('only').split(',') : null;
    const F = (rule, where, msg) => { if (!ONLY || ONLY.includes(rule)) findings.push({ rule, where, msg }); };
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
            notes.push(`${key}: slot ink ${SLOT_INK ? 'on' : 'off'}; card ${plan.cards.join(', ') || '(none: default roles)'}; ${plan.roles.length} roles x ${SIZES.join('/')} + ${variants.length} option variant(s) of ${vlist.length} + hosts ${HOSTS.join(', ') || 'none'}`);
            for (const j of jobs) {
                const b = await page.evaluate(async ({ categoryId, skillId, j, SEED }) => {
                    try {
                        const r = await window.buildSheet({ role: j.role, sections: [{ skills: [Object.assign({ categoryId, skillId }, j.opts ? { opts: j.opts } : {})] }], size: j.size, paper: 'A4', seed: SEED, key: false });
                        const cols = r.plan && r.plan.meta && r.plan.meta.fits && r.plan.meta.fits[0] ? r.plan.meta.fits[0].cols : null;
                        const sections = new Set((r.items || []).map((it) => it.section)).size;
                        const tries = r.plan && r.plan.meta ? Number(r.plan.meta.scoreOutOf) : NaN;
                        return { html: window.sheetDocument(r.pupilHtml, r.title || 'x', { paper: 'A4' }), cols, sections, tries, measured: (r.items || []).map((it) => (it.measured ? Object.fromEntries(Object.entries(it.measured).filter(([, v]) => v && v.hMm != null).map(([k, v]) => [k, v.hMm])) : null)) };
                    } catch (e) { return { error: String((e && e.message) || e).slice(0, 200) }; }
                }, { categoryId, skillId, j, SEED });
                if (b.error) { notes.push(`${key} ${j.tag}: not composed (${b.error})`); continue; }
                { const cap = gdpCap(j.role, j.size, b.tries); if (cap) F('EB-GDPCAP', `${key} ${j.tag}`, cap); }
                const sh = await app.browser.newPage();
                try {
                    await sh.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
                    await sh.goto(page.url(), { waitUntil: 'domcontentloaded' });
                    await sh.setContent(b.html, { waitUntil: 'networkidle0', timeout: 60000 });
                    await sh.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', { timeout: 15000 }).catch(() => {});
                    await sh.emulateMediaType('print');
                    const cells = await sh.evaluate(measureCells, 'body > section.ws-page, body > .ws-page', SLOT_INK);
                    renders++; cellsRead += cells.length;
                    if (!cells.length) { F('EB-READ', `${key} ${j.tag}`, 'no kit cell read on the page (markup changed?)'); continue; }
                    judge(cells, `${key} ${j.tag}`, F, j.role);
                    // EB-PAGE (opt-in --page-fill; lf-placevalue critic r4 E-r4-1): a page that is not the role's last leaves 30 % or more
                    // of its body empty under its last block (identify lesson L p2: 43 %, page 3 never moved up). The last page may end short.
                    if (has('model-states') && j.role === 'scripted-model' && (!arg('rule-skills', null) || arg('rule-skills').split(',').includes(key))) {
                        const mo = await sh.evaluate(measureModel, 'body > section.ws-page, body > .ws-page');
                        for (const x of mo.same) F('MOD-MARKS', `${key} ${j.tag} ${x}`, 'the two states draw the same picture: each step adds a new grey mark (PT-MOD-1)');
                        for (const x of mo.empty) F('MOD-GRID', `${key} ${j.tag} ${x}`, 'an empty state cell in the Model grid: lay the states evenly (2 + 2), the next example on a continuation page (critic r2 S4)');
                        for (const x of mo.lines) F('MOD-LINES', `${key} ${j.tag} ${x}`, 'a step text is at most 2 lines (PT-MOD-2)');
                        const png = 'data:image/png;base64,' + await sh.screenshot({ fullPage: true, encoding: 'base64' });
                        const gp = await sh.evaluate(measureGap, { scope: 'body > section.ws-page, body > .ws-page', png });
                        for (const c of cells) Object.assign(c, gp[`${c.page}:${c.cell}`] || {});
                        if (process.env.EB_GAP_DEBUG) for (const c of cells) console.log('gap', key, j.tag, c.page, c.cell, c.step, c.hMm, 'below', c.belowMm, (c.belowMm / c.hMm * 100).toFixed(1), c.gapAtMm, c.gapMm, (c.gapMm / c.hMm * 100).toFixed(1) + '%', JSON.stringify(c.iv));
                        cells.forEach((c, i) => { if (gapBad(j.role, cells, i, BAND)) F('EB-GAP', `${key} ${j.tag} p${c.page} cell ${c.cell} (state ${c.step})`, `empty band ${c.gapMm} mm between the step text and the problem in a ${c.hMm} mm cell (${(c.gapMm / c.hMm * 100).toFixed(1)} %; limit ${(BAND * 100).toFixed(0)} %, RUBRIC H13; critic r3 S5)`); });
                        mo.used.forEach((v, i) => { if (v < 70) F('EB-PAGE', `${key} ${j.tag} p${i + 1}`, `${v} % of the Scripted Model page body used (limit 70 %)`); });
                    }
                    // (Guided is exempt from EB-PAGE: lead ruling 2026-11-12, PT-GDP / PAGE_TYPES §12.1 - white under its grid is accepted)
                    if (has('page-fill') && j.role !== 'guided') {
                        const pf = await sh.evaluate((scope) => [...document.querySelectorAll(scope)].map((pg) => {
                            const body = pg.querySelector('.ws-body') || pg; const br = body.getBoundingClientRect();
                            const kids = [...body.children].filter((x) => x.getBoundingClientRect().height > 0 && !/ws-foot|ws-footer/.test(x.className));
                            const last = kids.length ? Math.max(...kids.map((x) => x.getBoundingClientRect().bottom)) : br.top;
                            return Math.round(Math.max(0, br.bottom - last) / br.height * 100);
                        }), 'body > section.ws-page, body > .ws-page');
                        pf.slice(0, -1).forEach((v, i) => { if (v >= 30) F('EB-PAGE', `${key} ${j.tag} p${i + 1}`, `${v} % of the page body is empty under its last block (not the last page; limit 30 %)`); });
                    }
                    // (`--rule-skills a:b,...`, ws-precritic opt-in: the opt-in rule judges only the opted-in lane's skills)
                    if (has('vocab-ink') && (!arg('rule-skills', null) || arg('rule-skills').split(',').includes(key))) for (const v of await sh.evaluate(measureVocab, 'body > section.ws-page, body > .ws-page')) {
                        if (v.fillH < 0.7 || v.fillW < 0.7) F('EB-VOCAB', `${key} ${j.tag} p${v.page} vocab picture ${v.pic}`, `the drawing fills ${Math.round(v.fillH * 100)} % of its ${v.hMm} mm picture box up and down, ${Math.round(v.fillW * 100)} % across (limit 70 %)`);
                    }
                    // EB-FOOT: each cell against ITS OWN item(s) by the kit's data-eb-item (critic eb-r5 m1); fallbacks are notes
                    const m = (b.measured || []).map((x) => (x && Object.keys(x).length ? x : null));
                    if (GRID_ROLES.has(j.role)) {
                        const fr = footFindings(cells, m, b.cols, b.sections, FOOT);
                        for (const n of fr.notes) notes.push(`${key} ${j.tag}: ${n}`);
                        for (const x of fr.out) F('EB-FOOT', `${key} ${j.tag} p${x.c.page} cell ${x.c.label || x.c.cell}`, `drawn ${x.c.neededMm} mm, footprint hMm ${x.fp} mm at ${x.k} columns${fr.mode === 'index' ? `, item ${x.ids.map((i) => i + 1).join('+')}` : ' (position pairing)'} (${Math.round((x.c.neededMm - x.fp) / x.fp * 100)} %)`);
                    }
                } finally { await sh.close(); }
            }
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
                const cells = await page.evaluate(measureCells, ok, SLOT_INK);
                renders++; cellsRead += cells.length;
                // EB-PARITY (opt-in --screen-parity; lf-placevalue critic nwf r1 N9, lead ruling: screen parity is a contract rule): a
                // skill whose print cell is a kit template draws THAT cell on every screen host ([data-ws-cell="<template>"]), never a
                // legacy cell, and its answer is written in it (the host's input or the cell's own boxes inside the cell) - one answer
                // place: no second, empty legacy box beside the input. Judged on --rule-skills.
                if (has('screen-parity') && (!arg('rule-skills', null) || arg('rule-skills').split(',').includes(key))) {
                    const par = await page.evaluate(({ c, k, SEED, scope }) => {
                        let tpl = null;
                        try { const q = window.generateQuestionFor({ category: c, skill: k, seed: SEED, itemIndex: 0 }); tpl = q && q.cell && q.cell.template; } catch (e) { tpl = null; }
                        if (!tpl || tpl === 'legacy') return { tpl: null };
                        const root = document.querySelector(scope);
                        const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; };
                        const kit = root ? [...root.querySelectorAll(`[data-ws-cell="${tpl}"]`)].filter(vis) : [];
                        const inputs = kit.flatMap((e) => [...e.querySelectorAll('input, textarea, [data-mq-cell], .mq-kblank')]).filter(vis);
                        // a legacy empty box: a bordered block with no text and no input, outside the kit cell (the old place chart)
                        const scr = root;
                        const legacyBoxes = scr ? [...scr.querySelectorAll('div[style*="border"]')].filter((e) => vis(e) && !e.closest('[data-ws-cell="' + tpl + '"]') && !e.textContent.trim() && !e.querySelector('input, svg, img')).length : 0;
                        return { tpl, kit: kit.length, inputs: inputs.length, legacyBoxes };
                    }, { c: categoryId, k: skillId, SEED, scope: ok });
                    if (par.tpl) {
                        if (!par.kit) F('EB-PARITY', `${key} ${host} ${w}px`, `the print cell is the kit "${par.tpl}" template but the host draws no [data-ws-cell="${par.tpl}"] (a legacy cell)`);
                        else if (!par.inputs) F('EB-PARITY', `${key} ${host} ${w}px`, `the kit "${par.tpl}" cell holds no answer place (the answer is written outside the cell)`);
                        if (par.legacyBoxes) F('EB-PARITY', `${key} ${host} ${w}px`, `${par.legacyBoxes} empty legacy box(es) beside the kit cell: a second answer place`);
                    }
                }
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
    const rules = ['EB-BAND', 'EB-SIDE', 'EB-EDGE', 'EB-SUPBAND', 'MOD-MARKS', 'MOD-LINES', 'MOD-GRID', 'EB-GAP', 'EB-FOOT', 'EB-READ', 'EB-VOCAB', 'EB-PAGE', 'EB-GDPCAP'];
    for (const n of notes.concat(LEGACY_NOTES)) console.log(`note: ${n}`);
    for (const r of rules) { const f = findings.filter((x) => x.rule === r); console.log(`${r.padEnd(8)} ${f.length ? `FAIL ${f.length}` : 'PASS'}`); for (const x of f.slice(0, 15)) console.log(`   ${x.where}: ${x.msg}`); if (f.length > 15) console.log(`   ... ${f.length - 15} more`); }
    console.log(`(${SKILLS.length} skill(s), ${renders} renders, ${cellsRead} cells, ${((Date.now() - T0) / 1000).toFixed(0)} s${pinned != null ? `; ${pinned} finding(s) within the pin ${path.relative(ROOT, BASE)}` : ''})`);
    if (arg('json', null)) fs.writeFileSync(path.resolve(process.cwd(), arg('json')), JSON.stringify({ skills: SKILLS, findings, notes, renders, cells: cellsRead }, null, 1));
    const bad = findings.length || !renders ? (findings.length || 1) : 0;
    console.log(`ws-empty-band: ${bad ? `FAIL (${findings.length || 'nothing rendered'})` : 'OK'}`);
    process.exit(bad && !has('report-only') ? 1 : 0);
}
main().catch((e) => { console.error(e); console.log('ws-empty-band: FAIL'); process.exit(1); });
