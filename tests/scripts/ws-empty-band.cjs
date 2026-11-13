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
//   node tests/scripts/ws-empty-band.cjs --html <page.html>                   # measure a saved page as is (fixtures, no pin)
//   opt-in flags (each described below): --vocab-ink --page-fill --screen-parity --model-states --rule-skills a:b --margin N
//                                         --slot-ink off --only R1,R2 --baseline f --no-baseline --write-baseline f
//
// WHAT IS RENDERED (the plan): the roles the skill's SIGNED spec card offers (tests/lib/ws-card-plan.mjs, lf-ops: §7a
// "offered" page roles minus "hidden"), each at sizes S, M and L with the skill's defaults; the card's option variants on the
// independent page at L (at most --variants, default 6, spread over the list); and the screen hosts: the practice card at 390,
// 820 and 1280 px wide, the online worksheet and the quiz at 1280 px. No card: the default role list below. A role buildSheet
// cannot compose for the skill is listed as "not composed", never passed.
//
// WHAT IS MEASURED, per kit cell ([data-ws-cell], top-level; print pupil pages; the B&W screen cell on a host):
//   EB-BAND   the largest empty band in the cell - UNDER the lowest ink, ABOVE the highest, or BETWEEN two blocks of ink
//             (critic eb-r1 D2) - at >= 30 % of the cell height FAILS (lead ruling 2026-11-08: RUBRIC H13's 30 % of the
//             full cell is the shared rule; lf-placevalue's H13-ABS aligns to it). Ink is measured primitive by primitive: text
//             line boxes, each painting SVG shape (not the whole <svg> box), images, bordered boxes, and every answer slot
//             (an empty slot is the item's own writing room, as in H13-ABS); the tab / letter label does not count. Compared
//             unrounded. NOT a separating threshold: approved fact pages sit at 29.8-34 % on some roles (add_facts independent
//             L 29.8 %, test M 30.1 %, review 34.1 %) and critic-failed bands at 32-57 %; the lead ruled the approved ones
//             real defects (facts-lane task), pinned below, so the rule is H13's and the pin carries the known debt.
//             PT-MOD-3 (lead ruling 2026-11-12): on a Scripted Model, a state that is not its example's last is excused when its
//             band is <= 35 % AND a later state of the same example draws ink in that band (the room kept for a later mark).
//             --self-test checks it (the ink appears later: excused; it never appears: FAIL).
//   EB-SIDE   the empty band BESIDE the ink (left or right of the ink box): FAIL at >= 30 % of the cell width (RUBRIC H13). On a
//             SCREEN cell only when the content is pinned to one side (>= 30 % one side, <= 10 % the other): a centred fact in a
//             wide card is not a band.
//             Also BETWEEN two pieces of ink, side to side (critic eb-r7 m5: a 95 mm screen slot with only its right edge drawn
//             left an 85 mm hole between the written digit and that edge): the widest run of columns with no ink from top to bottom
//             of the cell, between its first and last inked column, at >= 30 % of the cell width (read on the pixels; a gap that
//             other ink above or below covers is not a band, so the spaces of one text line never count).
//   EB-ROLE   a role the signed card offers that buildSheet cannot compose for the skill (critic eb-r1 D3).
//   EB-FOOT   the drawn height vs the footprint: the cell's needed height (top pad + ink + empty slots + bottom pad) against
//             the hMm the bridge measured for the item at the page's column count (buildSheet items[i].measured[cols].hMm);
//             FAIL when they differ by more than 10 %. Judged on the grid roles that lay out from that measure (independent,
//             more-practice, test, review, mixed-practice). EVERY cell is judged against the items it holds (the kit writes
//             data-eb-item: one index, or the list for a cell holding several; lead ruling 2026-11-13), on any page shape
//             (several sections, a Review drawing 16 of 28 dealt). LIMIT (critic eb-r7 m4): a MULTI-ITEM cell (data-eb-item="3,4")
//             is NOTED, NOT JUDGED - the bridge measures items one by one and emits no measure of a combination (`b.combo` has no
//             writer today), and no live grid role draws one (the facts pin raises no such note). So is a cell matched to only
//             part of its items (data-eb-partial, critic ebitem-r1 m2), a cell with no index, an index out of range and an item
//             with no measure at the cell's own column count (no fallback to the page's first fit, critic ebitem-r1 m1). Each is a
//             NOTE, never a silent pass. With no index on the page, the old one-to-one position pairing. A role that draws its own
//             cell (fact-probe rows, word-problems stories, the guided model) is not judged by it.
//   EB-ITEMKEY  on the grid roles: the pupil page's sequence of data-eb-item equals its key's (the key answers the item the pupil
//             sees in that place), and no index appears twice on one pupil page (critic ebitem-r1 m3, its "key leak" probe).
//   EB-ITEMPARITY on the grid roles: the pupil page and key, with data-eb-item / data-eb-partial removed, are byte-identical to the
//             same sheet built with no tags (buildSheet `ebItem: false`): the tags change nothing a pupil sees (critic ebitem-r1
//             m3, its parity probe). With --html: the fixture's <template id="eb-key"> / <template id="eb-plain">.
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
// every rule this script judges (printed in this order); --self-test asserts each has a live backtest row (critic eb-r3 D5)
const RULES = ['EB-BAND', 'EB-SIDE', 'EB-EDGE', 'MOD-MARKS', 'MOD-LINES', 'MOD-GRID', 'EB-GAP', 'EB-FOOT', 'EB-ROLE', 'EB-READ', 'EB-VOCAB', 'EB-PAGE', 'EB-GDPCAP', 'EB-PARITY', 'EB-ITEMKEY', 'EB-ITEMPARITY'];
// the measured cases inside a rule that need a row of their own (named in the row's `rule` field)
// --slot-ink off (opt-in, lf-vocab r6, critic r4 #1; carried into the pixel tool by lf-checks 2026-11-13): an empty PRINT answer
// slot counts only for the pixels it draws (its line or box), never as one block over its whole box - the band reads as the
// critic's row-ink scan of the PNG sees it. A `legacy` cell (another skill's old print HTML) is printed as a note, not judged.
// The default stays on (a print slot is its whole box, the writing room). Screen slots are unchanged (drawn edges + one digit).
const SLOT_INK = (() => { const i = process.argv.indexOf('--slot-ink'); return i < 0 || process.argv[i + 1] !== 'off'; })();
const LEGACY_NOTES = [];
// the run's slot-ink mode, printed on every run (critic eb-r7 m3: the pixel port dropped master's per-run "slot ink on/off" note).
// Under off the kit's top pad STAYS EXCLUDED from the band above, as under on (the DOM tool counted the padding); documented here.
function slotInkNote(on) {
    return on ? 'slot ink on: an empty PRINT answer slot is ink over its whole box (the writing room)'
        : 'slot ink off: an empty PRINT answer slot counts only the pixels it draws (its line or box edges); a legacy cell is noted with its band, not judged; the kit\'s top pad stays excluded from the band above (as with slot ink on; the old DOM tool counted the padding)';
}
// a legacy cell skipped by --slot-ink off, with its measured band (critic eb-r7 m3: the port lost master's %)
function legacyNote(where, c) {
    const b = [['under', c.belowMm], ['between the blocks of', c.betweenMm], ['above', c.aboveMm]].map(([w, v]) => [w, Number(v) || 0]).sort((x, y) => y[1] - x[1])[0];
    const pct = c.noInk ? 'no ink' : `largest band ${b[1].toFixed(1)} mm ${b[0]} the ink, ${(b[1] / (c.hRaw || c.hMm) * 100).toFixed(1)} %`;
    return `${where} p${c.page} cell ${c.label || c.cell}: legacy cell not judged by --slot-ink off (${pct})`;
}
const RULE_CASES = ['EB-BAND (centred)', 'EB-BAND (above)', 'EB-BAND (between)', 'EB-SIDE (screen)', 'EB-BAND (screen slot)', 'EB-BAND (top pad)', 'EB-SIDE (slot width)', 'EB-SIDE (between)'];
// a rule with no row, and why: EB-ROLE judges buildSheet against the signed card (a role the card offers that the app cannot
// compose), which a saved --html page cannot express, and no commit has failed it (lf-checks 2026-11-13; EB-FOOT has eb-foot-div-facts)
const RULE_EXEMPT = {
    'EB-ROLE': 'needs the signed card and buildSheet (the app), not expressible as --html; every carded role composes today, so no fail commit exists',
};
/** The rules / cases with no backtest row (not pending) whose command runs this script and whose `rule` names it. Pure. */
function uncovered(rows) {
    const mine = (rows || []).filter((r) => /ws-empty-band\.cjs/.test(r.command || '') && !r.pending);
    const names = (id) => mine.some((r) => (/\(/.test(id) ? String(r.rule || '').includes(id) : new RegExp(`(^|[^\\w-])${id}([^\\w-]|$)`).test(String(r.rule || ''))));
    return [...RULES, ...RULE_CASES].filter((id) => !RULE_EXEMPT[id] && !names(id));
}
// EB-FOOT's column count for a cell (lf-roles 4e8eca14, accepted by lf-checks 2026-11-13): the column count of the grid that
// lays it (a lone last-row cell of a 2-column grid is still at 2; a full-width problem in its own 1-column grid at 1); with no
// grid read, the cells across its row (lf-placevalue 2026-11-08: mixed-practice's fits[0].cols is not the cells across)
function footCols(c, cells) { return c.gridCols || cells.filter((d) => d.page === c.page && Math.abs(d.topPx - c.topPx) <= 4).length; }
// EB-FOOT pairing, pure (critic eb-r5 m1; scope widened by lead ruling 2026-11-13 to every cell of every grid-role page).
//  - 'index': the kit writes data-eb-item on each grid cell - the bridge's index of the item it holds, or the list of the items
//    it holds ("3,4,5") - so EVERY indexed cell is judged against ITS OWN items, on any page: several sections, a Review that
//    deals more items than it draws (28 dealt, 16 drawn), a mixed band at its own column count. One item: its measure at the
//    cell's column count. Several: the bridge's measure for that combination (`combo(ids, k)`); with none, a NOTE. A cell with
//    no index on an indexed page, an index outside the items or an unmeasured item is a NOTE too: never a silent pass.
//  - 'position' (fallback, no cell indexed): only where cells and measured items are one to one, by dealt order, or BY HEIGHT
//    (lf-ops-props, guarded) when every page's rows are sorted tallest first and that pairing fits every cell;
//  - '' : not paired (the caller notes it). Returns { mode, byH, out: [{c, fp, k, ids}], notes }.
const idsOf = (c) => (Array.isArray(c.items) && c.items.length ? c.items : (Number.isInteger(c.item) && c.item >= 0 ? [c.item] : []));
function footFindings(cells, m, cols, sections, FOOT = 0.10, combo = () => null) {   // FOOT: the EB-FOOT limit (the const below)
    const out = [], notes = [];
    // the measure at the cell's OWN column count, never the page's first fit (critic ebitem-r1 m1: the silent fallback to mi[cols])
    const fpOf = (mi, k) => (mi && mi[k] != null ? mi[k] : null);
    const unmeasured = (i, k) => `item ${i + 1} fallback (unmeasured at ${k} across; measured at ${Object.keys(m[i] || {}).filter((x) => m[i][x] != null).join(', ') || 'none'}), footprint not judged`;
    const off = (c, fp) => fp != null && Math.abs(c.neededMm - fp) > FOOT * fp;
    if (cells.some((c) => idsOf(c).length)) {
        for (const c of cells) {
            const ids = idsOf(c), k = footCols(c, cells), nm = `p${c.page} cell ${c.label || c.cell}`;
            if (!ids.length) { notes.push(`${nm}: no item index on an indexed page, footprint not judged`); continue; }
            if (c.partial) { notes.push(`${nm}: partly indexed (${c.partial} of its questions matched a bridge item: ${ids.map((i) => i + 1).join('+')}), footprint not judged`); continue; }
            if (ids.some((i) => !Number.isInteger(i) || i < 0 || i >= m.length)) { notes.push(`${nm}: item index ${ids.join(',')} outside the ${m.length} measured items, footprint not judged`); continue; }
            const fp = ids.length === 1 ? fpOf(m[ids[0]], k) : combo(ids, k);
            if (fp == null) { notes.push(ids.length > 1 ? `${nm}: holds items ${ids.map((i) => i + 1).join('+')}; the bridge gives no measure for that combination at ${k} across (multi-item cells are noted, not judged), footprint not judged` : `${nm}: ${unmeasured(ids[0], k)}`); continue; }
            if (off(c, fp)) out.push({ c, fp, k, ids });
        }
        // critic eb-r6 m1: a partly judged index page says so in one line naming the mode, beside the per-cell notes
        if (notes.length) notes.unshift(`pairing mode 'index': ${notes.length} of ${cells.length} cells not judged (listed below)`);
        return { mode: 'index', byH: false, out, notes };
    }
    // critic eb-r6 m1: the fallback is never silent - every non-index pairing names its mode
    if (!(sections <= 1 && m.length === cells.length && m.every((x) => x != null))) {
        notes.push(`pairing mode '' (not paired): no cell carries an item index, and the page is not one to one (${cells.length} cells, ${m.length} items, ${m.filter((x) => x == null).length} unmeasured, ${sections} section(s)); footprint not judged`);
        return { mode: '', byH: false, out, notes };
    }
    const sortedPages = [...new Set(cells.map((c) => c.page))].every((pg) => { const rows = []; for (const c of cells.filter((d) => d.page === pg)) { const r = rows.find((x) => Math.abs(x.top - c.topPx) <= 4); if (r) r.h = Math.max(r.h, c.hMm); else rows.push({ top: c.topPx, h: c.hMm }); } rows.sort((x, y) => x.top - y.top); return rows.every((r, q) => !q || r.h <= rows[q - 1].h + 1); });
    const cs2 = cells.slice().sort((x, y) => y.neededMm - x.neededMm), ord = m.map((_, i) => i).sort((x, y) => (fpOf(m[y], cols) || 0) - (fpOf(m[x], cols) || 0));
    const byH = sortedPages && cells.some((c, i) => off(c, fpOf(m[i], footCols(c, cells)))) && !cs2.some((c, q) => off(c, fpOf(m[ord[q]], footCols(c, cells))));
    if (!byH) cells.forEach((c, i) => { const k = footCols(c, cells); const fp = fpOf(m[i], k); if (fp == null) notes.push(`p${c.page} cell ${c.label || c.cell}: ${unmeasured(i, k)}`); if (off(c, fp)) out.push({ c, fp, k, ids: [i] }); });
    notes.push(`pairing mode 'position' (fallback): no cell carries an item index, so cells are paired with items ${byH ? 'BY HEIGHT (the page sorts its rows tallest first)' : 'by dealt order'}`);
    return { mode: 'position', byH, out, notes };
}
// EB-ITEMKEY / EB-ITEMPARITY (critic ebitem-r1 m3: the parity and key-order probes made gates). Pure, on the HTML strings.
const EB_ATTR = / data-eb-(?:item|partial)="[^"]*"/g;
/** The data-eb-item values of an HTML string, page by page (a page starts at an element of class ws-page). */
function ebPages(html) {
    return String(html || '').split(/(?=<[a-z]+ class="ws-page[\s"])/).map((pg) => [...pg.matchAll(/ data-eb-item="([^"]*)"/g)].map((m) => m[1])).filter((l) => l.length);
}
/** Findings (strings) of the key-order rule: the pupil sequence equals the key's; no index twice on one pupil page. */
function itemKeyFindings(pupilHtml, keyHtml) {
    const out = [], pp = ebPages(pupilHtml), p = pp.flat(), k = ebPages(keyHtml).flat();
    if (keyHtml != null && p.join('|') !== k.join('|')) {
        const i = p.findIndex((v, j) => v !== k[j]); const at = i < 0 ? p.length : i;
        out.push(`the key's item order differs from the pupil page's at cell ${at + 1} (pupil item ${p[at] != null ? p[at].split(',').map((x) => +x + 1).join('+') : '-'}, key item ${k[at] != null ? k[at].split(',').map((x) => +x + 1).join('+') : '-'}; ${p.length} pupil / ${k.length} key cells): the key answers another item in that place`);
    }
    pp.forEach((l, pi) => { const ids = l.flatMap((v) => v.split(',')); const d = ids.find((v, j) => ids.indexOf(v) !== j); if (d != null) out.push(`pupil page ${pi + 1} draws item ${+d + 1} twice`); });
    return out;
}
/** The parity rule: `tagged` with its data-eb-* attributes removed is byte-identical to `plain` ('' when it is). */
function itemParityFinding(tagged, plain, what) {
    const a = String(tagged || '').replace(EB_ATTR, ''), b = String(plain || '').replace(EB_ATTR, '');
    if (a === b) return '';
    let i = 0; while (i < a.length && a[i] === b[i]) i++;
    return `the ${what} with its data-eb-item tags removed differs from the same sheet built with no tags at byte ${i} ("${a.slice(Math.max(0, i - 30), i + 30).replace(/\s+/g, ' ')}" vs "${b.slice(Math.max(0, i - 30), i + 30).replace(/\s+/g, ' ')}"): the tags changed what is drawn`;
}
// (the limits are defined before --self-test: its centred EB-BAND cases call judge())
const MARGIN = Math.max(0, Number((process.argv.includes('--margin') && process.argv[process.argv.indexOf('--margin') + 1]) || 0)) / 100;
const BAND = 0.30 - MARGIN, SIDE = 0.30 - MARGIN, FOOT = 0.10, MIN_MM = 10, EDGE_MM = 1.5;
if (argv.includes('--self-test')) {
    {   // rule coverage (critic eb-r3 D5): every rule of RULES and every case of RULE_CASES names a live backtest row, or is exempt
        const t = [['all named', uncovered([{ command: 'node tests/scripts/ws-empty-band.cjs --html x', rule: `${RULES.join(' ')} ${RULE_CASES.join(' ')}` }]).length, 0],
            ['pending does not count', uncovered([{ command: 'node tests/scripts/ws-empty-band.cjs', rule: 'EB-READ', pending: true }]).includes('EB-READ'), true],
            ['EB-GAP is not EB-GAPX', uncovered([{ command: 'node tests/scripts/ws-empty-band.cjs', rule: 'EB-GAPX' }]).includes('EB-GAP'), true]];
        const tb = t.filter(([, got, want]) => got !== want);
        for (const [n] of tb) console.log(`self-test FAIL: coverage reader: ${n}`);
        let rows = [];
        try { rows = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'precritic', 'backtests.json'), 'utf8')).rows; } catch (e) { console.log(`self-test FAIL: cannot read backtests.json (${e.message})`); process.exit(1); }
        const miss = uncovered(rows);
        for (const id of miss) console.log(`self-test FAIL: ${id} has no live backtest row (tests/fixtures/precritic/backtests.json, its \`rule\` field) and no exemption`);
        if (tb.length || miss.length) { console.log(`ws-empty-band self-test: FAIL (rule coverage)`); process.exit(1); }
        console.log(`rule coverage: ${RULES.length + RULE_CASES.length - Object.keys(RULE_EXEMPT).length} rules / cases with a row; exempt ${Object.entries(RULE_EXEMPT).map(([k, v]) => `${k} (${v})`).join('; ')}`);
    }
    {   // EB-FOOT column count (lf-roles 4e8eca14): lone last-row cell of a 2-column grid -> 2; full-width cell in a 1-column grid -> 1; no grid -> across
        const a = { page: 1, topPx: 10, gridCols: 2 }, b = { page: 1, topPx: 10, gridCols: 2 }, lone = { page: 1, topPx: 300, gridCols: 2 }, wide = { page: 1, topPx: 500, gridCols: 1 };
        const n1 = { page: 1, topPx: 10, gridCols: 0 }, n2 = { page: 1, topPx: 12, gridCols: 0 };
        const fc = [['lone last-row cell', footCols(lone, [a, b, lone, wide]), 2], ['full-width cell', footCols(wide, [a, b, lone, wide]), 1], ['no grid: across', footCols(n1, [n1, n2]), 2]];
        const fbad = fc.filter(([, got, want]) => got !== want);
        for (const [n, got, want] of fbad) console.log(`self-test FAIL: EB-FOOT columns ${n}: ${got}, want ${want}`);
        if (fbad.length) { console.log(`ws-empty-band self-test: FAIL (EB-FOOT columns)`); process.exit(1); }
    }
    {   // EB-FOOT pairs by the kit's item index (critic eb-r5 m1): two equal-height cells whose items the page swapped, each
        // drawn at the OTHER item's footprint, are 2 findings by index; the old by-height fallback hides both (no index)
        const mk = (item, needed, cell) => ({ page: 1, cell, topPx: 10, hMm: 45, neededMm: needed, gridCols: 2, item });
        const m = [{ 2: 20 }, { 2: 40 }];
        const swapped = [mk(0, 40, 1), mk(1, 20, 2)], noIdx = swapped.map((c) => Object.assign({}, c, { item: -1 })), right = [mk(1, 40, 1), mk(0, 20, 2)];
        // widened scope (lead 2026-11-13): a Review that deals 4 and draws 2, two sections, a cell holding several items
        const m4 = [{ 2: 20 }, { 2: 40 }, { 1: 30, 2: 25 }, { 2: 22 }];
        const review = [mk(3, 22, 1), mk(1, 48, 2)];                       // item 2 drawn 20 % over: 1 finding; item 4 fine
        const twoSec = [mk(0, 20, 1), Object.assign(mk(2, 36, 2), { gridCols: 1 })];   // the mixed band at 1 across: 30 mm -> 20 % over
        const multi = [Object.assign(mk(0, 40, 1), { items: [0, 1] })];
        const unIdx = [mk(0, 20, 1), mk(-1, 90, 2)];
        const pc = [['index: swapped footprints', footFindings(swapped, m, 2, 1).out.length, 2], ['index: own footprints', footFindings(right, m, 2, 1).out.length, 0],
            ['no index: by-height fallback', footFindings(noIdx, m, 2, 1).mode, 'position'], ['index out of range: noted', footFindings([mk(5, 40, 1), mk(1, 20, 2)], m, 2, 1).notes.filter((n) => /outside/.test(n)).length, 1],
            ['index out of range: the other cell judged', footFindings([mk(5, 40, 1), mk(1, 20, 2)], m, 2, 1).out.length, 1],
            ['two sections: judged by index', footFindings(swapped, m, 2, 2).out.length, 2], ['fewer cells than items: judged by index', footFindings([mk(1, 48, 1)], m, 2, 1).out.length, 1],
            ['review 4 dealt 2 drawn', footFindings(review, m4, 2, 1).out.length, 1], ['two sections, own column count', footFindings(twoSec, m4, 2, 2).out.map((x) => x.fp).join(), '30'],
            ['multi-item cell, no bridge measure: noted', footFindings(multi, m4, 2, 1).notes.filter((n) => /combination/.test(n)).length, 1], ['multi-item cell, no bridge measure: not passed silently', footFindings(multi, m4, 2, 1).out.length + footFindings(multi, m4, 2, 1).notes.filter((n) => /combination/.test(n)).length, 1],
            ['multi-item cell, measured combination: judged', footFindings(multi, m4, 2, 1, 0.10, (ids, k) => (ids.join() === '0,1' && k === 2 ? 30 : null)).out.length, 1],
            ['unindexed cell on an indexed page: noted', footFindings(unIdx, m4, 2, 1).notes.filter((n) => /no item index/.test(n)).length, 1],
            ['no index, two sections: not paired', footFindings(noIdx, m, 2, 2).mode, ''], ['no index, fewer cells: not paired', footFindings([mk(-1, 40, 1)], m, 2, 1).mode, ''],
            // critic eb-r6 m1: never silent - every mode but a fully judged 'index' page prints a note naming its mode
            ['position fallback: noted with its mode', footFindings(noIdx, m, 2, 1).notes.filter((n) => /mode 'position'/.test(n)).length, 1],
            ['not paired: noted with its mode', footFindings(noIdx, m, 2, 2).notes.filter((n) => /mode '' \(not paired\)/.test(n)).length, 1],
            ['unmeasured item, position mode: not paired, noted', footFindings([mk(-1, 40, 1), mk(-1, 20, 2)], [{ 2: 20 }, null], 2, 1).notes.filter((n) => /mode ''/.test(n)).length, 1],
            ['unmeasured item, index mode: noted with its mode', footFindings([mk(0, 20, 1), mk(1, 20, 2)], [{ 2: 20 }, null], 2, 1).notes.filter((n) => /mode 'index': 1 of 2/.test(n)).length, 1],
            ['some cells unindexed: noted with its mode', footFindings(unIdx, m4, 2, 1).notes.filter((n) => /mode 'index'/.test(n)).length, 1],
            ['fully judged index page: silent', footFindings(right, m, 2, 1).notes.length, 0]];
        const pbad = pc.filter(([, got, want]) => got !== want);
        for (const [n, got, want] of pbad) console.log(`self-test FAIL: EB-FOOT pairing ${n}: ${got}, want ${want}`);
        if (pbad.length) { console.log(`ws-empty-band self-test: FAIL (EB-FOOT pairing)`); process.exit(1); }
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
    {   // critic ebitem-r1 m1 / m2 / m3 and eb-r7 m3 (pure parts; the kit's ebItemOf is checked async below)
        const mk = (item, needed, cell, x) => Object.assign({ page: 1, cell, topPx: 10, hMm: 45, neededMm: needed, gridCols: 2, item }, x || {});
        const m1 = [{ 2: 20 }, { 2: 40 }];
        const at3 = [mk(0, 20, 1, { gridCols: 3 }), mk(1, 40, 2)];
        const part = [mk(0, 20, 1, { items: [0], partial: '1/2' }), mk(1, 40, 2)];
        const pg = (ids) => `<section class="ws-page x">${ids.map((v) => `<div class="ws-cell" data-eb-item="${v}">a</div>`).join('')}</section>`;
        const xc = [['m1 unmeasured at k: noted as a fallback', footFindings(at3, m1, 2, 1).notes.filter((n) => /fallback \(unmeasured at 3 across/.test(n)).length, 1],
            ['m1 unmeasured at k: not judged against the first fit', footFindings([mk(0, 90, 1, { gridCols: 3 })], m1, 2, 1).out.length, 0],
            ['m1 position mode unmeasured: noted', footFindings([mk(-1, 20, 1, { gridCols: 3 }), mk(-1, 40, 2, { gridCols: 3 })], m1, 2, 1).notes.filter((n) => /unmeasured at 3 across/.test(n)).length, 2],
            ['m2 partly indexed cell: noted', footFindings(part, m1, 2, 1).notes.filter((n) => /partly indexed \(1\/2/.test(n)).length, 1],
            ['m2 partly indexed cell: not judged', footFindings([mk(1, 90, 1, { items: [1], partial: '1/2' })], m1, 2, 1).out.length, 0],
            ['m3 key order equal', itemKeyFindings(pg([2, 0, 1]), pg([2, 0, 1])).length, 0],
            ['m3 key order swapped', itemKeyFindings(pg([2, 0, 1]), pg([0, 2, 1])).length, 1],
            ['m3 index twice on a page', itemKeyFindings(pg([2, 2]), pg([2, 2])).length, 1],
            ['m3 parity: tags only', itemParityFinding(pg([1, 0]), '<section class="ws-page x"><div class="ws-cell">a</div><div class="ws-cell">a</div></section>', 'page'), ''],
            ['m3 parity: a style moved', !!itemParityFinding(pg([1, 0]), '<section class="ws-page x"><div class="ws-cell" style="x">a</div><div class="ws-cell">a</div></section>', 'page'), true],
            ['eb-r7 m3 slot ink off note names the mode and the top pad', /slot ink off/.test(slotInkNote(false)) && /top pad stays excluded/.test(slotInkNote(false)), true],
            ['eb-r7 m3 slot ink on note', /slot ink on/.test(slotInkNote(true)), true],
            ['eb-r7 m3 legacy note gives its %', /legacy cell not judged by --slot-ink off \(largest band 12\.0 mm under the ink, 30\.0 %\)/.test(legacyNote('x', { page: 1, cell: 2, belowMm: 12, betweenMm: 3, aboveMm: 1, hRaw: 40, hMm: 40 })), true]];
        const xbad = xc.filter(([, got, want]) => got !== want);
        for (const [n, got, want] of xbad) console.log(`self-test FAIL: ${n}: ${got}, want ${want}`);
        if (xbad.length) { console.log(`ws-empty-band self-test: FAIL (ebitem / slot-ink notes)`); process.exit(1); }
    }
    const cases = [['guided', 'S', 10, false], ['guided', 'S', 11, true], ['guided', 'M', 8, false], ['guided', 'M', 23, true], ['guided', 'L', 6, false],
        ['guided', 'L', 7, true], ['guided', 'L', 19, true], ['independent', 'L', 30, false], ['guided', 'M', undefined, false]];
    const bad = cases.filter(([r, z, n, want]) => !!gdpCap(r, z, n) !== want);
    for (const c of bad) console.log(`self-test FAIL: gdpCap(${c.slice(0, 3).join(', ')}) should ${c[3] ? '' : 'not '}fail`);
    // the kit's ebItemOf (critic ebitem-r1 m2): a plan item matched in part carries ebPartial "k/n"; cell() writes data-eb-partial
    import(require('url').pathToFileURL(path.join(ROOT, 'js', 'modules', 'sheet', 'index.js')).href).then(({ ebItemOf, cell }) => {
        const q = [{}, {}, {}], idx = new Map([[q[0], 4], [q[1], 7]]);
        const kc = [['one question', JSON.stringify(ebItemOf({ q: q[0] }, idx)), '{"ebItem":4}'],
            ['all of several', JSON.stringify(ebItemOf({ qs: [q[0], q[1]] }, idx)), '{"ebItem":[4,7]}'],
            ['two of three: partial', JSON.stringify(ebItemOf({ qs: [q[0], q[1], q[2]] }, idx)), '{"ebItem":[4,7],"ebPartial":"2/3"}'],
            ['one of two: partial, not judged as item 5 alone', JSON.stringify(ebItemOf({ q: q[0], qs: [q[0], q[2]] }, idx)), '{"ebItem":[4],"ebPartial":"1/2"}'],
            ['none matched', JSON.stringify(ebItemOf({ qs: [q[2]] }, idx)), '{}'],
            ['cell writes data-eb-partial', / data-eb-item="4" data-eb-partial="1\/2"/.test(cell('x', { ebItem: [4], ebPartial: '1/2' })), true],
            ['cell without a partial writes none', /data-eb-partial/.test(cell('x', { ebItem: 4 })), false]];
        const kbad = kc.filter(([, got, want]) => got !== want);
        for (const [n, got, want] of kbad) console.log(`self-test FAIL: ebItemOf ${n}: ${got}, want ${want}`);
        // centred cells (lf-builds chart_120 fix): white above + under is one band; 23 % passes, 44 % fails, as top-aligned
        const ccell = (centreMm, belowMm) => ({ page: 1, cell: 1, hMm: 76.5, belowMm, centreMm, sideMm: 0, innerW: 86, edgeMm: 5, tmpl: 'chartwindow' });
        const crun = (c) => { const got = []; judge([c], 't', (rule) => got.push(rule), 'independent'); return got.includes('EB-BAND'); };
        const cc = [['centred 8.7 + 8.7 mm of 76.5 (23 %)', crun(ccell(8.7, 8.7)), false], ['centred 17 + 17 mm of 76.5 (44 %)', crun(ccell(17, 17)), true],
            ['top-aligned 25 mm under of 76.5 (33 %)', crun(ccell(0, 25)), true]];
        const cbad = cc.filter(([, got, want]) => got !== want);
        for (const [nm, , want] of cbad) console.log(`self-test FAIL: EB-BAND centred ${nm} should ${want ? 'fail' : 'pass'}`);
        const n = bad.length + kbad.length + cbad.length;
        console.log(`ws-empty-band self-test: ${n ? "FAIL" : "OK"} (${cases.length} EB-GDPCAP + 6 PT-MOD-3 + 6 EB-GAP cases; EB-FOOT pairing 21 + columns 3; ebitem / slot-ink notes 13; ebItemOf ${kc.length}; EB-BAND centred ${cc.length})`);
        process.exit(n ? 1 : 0);
    }).catch((e) => { console.log(`self-test FAIL: cannot import the sheet kit (${e.message})`); console.log('ws-empty-band self-test: FAIL'); process.exit(1); });
    return;
}
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const SKILLS = (arg('skill', '') || arg('skills', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
const HTML = arg('html', null);
if (require.main === module && !HTML && !arg('judge-fixture', null) && (!SKILLS.length || SKILLS.some((s) => !s.includes(':')))) { console.log('usage: ws-empty-band.cjs --skill cat:skill[,cat:skill] [--roles r,..] [--sizes S,M,L] [--hosts card,worksheet,quiz|none] [--variants 6] [--opts json] [--seed 7] [--json f] [--report-only]'); console.log('ws-empty-band: FAIL (usage)'); process.exit(2); }
const SIZES = (arg('sizes', 'S,M,L')).split(',').map((s) => s.trim()).filter(Boolean);
const HOSTS = arg('hosts', 'card,worksheet,quiz') === 'none' ? [] : arg('hosts', 'card,worksheet,quiz').split(',').map((s) => s.trim());
const SEED = parseInt(arg('seed', '7'), 10);
const NVAR = parseInt(arg('variants', '6'), 10);
const OPTS = arg('opts', null) ? JSON.parse(arg('opts')) : null;
// (`--only R1,R2`: judge only these rules - a backtest row proves one rule alone)
const ONLY = arg('only', null) ? arg('only').split(',') : null;
const DEFAULT_ROLES = ['independent', 'more-practice', 'guided', 'error-analysis', 'review', 'test', 'true-false', 'reason-it', 'lesson'];
// (`--margin N`, lf-placevalue critic r4 N-r4-1, owner 2026-11-09 "every finding a check": a fix that clears the 30 % limit by under
// N points is fragile - G2 passed at 29.9 % - so the band and side limits are judged at 30 - N %; absent, 30 % as before)
// the roles that lay their grid out from the items' measured footprints (buildSheet items[i].measured[cols].hMm)
const GRID_ROLES = new Set(['independent', 'more-practice', 'test', 'review', 'mixed-practice']);

/** The render plan of a skill from its signed card (lf-ops' ws-card-plan.mjs), or the default roles. */
function planOf(key) {
    // (`--roles none`: no print page, only the screen hosts, at the defaults AND the card's option variants - a host row)
    const none = arg('roles', null) === 'none';
    if (arg('roles', null) && !none) return { roles: arg('roles').split(','), variants: [], cards: ['--roles'] };
    try {
        const out = execFileSync(process.execPath, [path.join(__dirname, '..', 'lib', 'ws-card-plan.mjs'), '--skill', key, '--root', ROOT], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
        const p = JSON.parse(out)[0];
        if (p && p.cards && p.cards.length && p.roles.length) return none ? Object.assign({}, p, { roles: [], cards: ["--roles"] }) : p;
    } catch (e) { /* no card plan in this tree, or no card */ }
    return { roles: none ? [] : DEFAULT_ROLES, variants: [], cards: none ? ["--roles"] : [] };
}

/* ------------------------------------------------------------------ in the page */
// Serialisable. scope: a CSS selector of the containers to read (print: the pupil pages; screen: the host's paper).
function measureCells(scope) {
    const MM = 96 / 25.4;
    const visible = (e) => { const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity || '1') > 0.05; };
    const out = [];
    const roots = [...document.querySelectorAll(scope)];
    roots.forEach((rt, pi) => {
        // a print page's kit cells; on a screen host the B&W screen cell (.mq-scell, screen-cell.js) when it holds no kit cell
        let cells = [...rt.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]') && visible(c));
        if (!cells.length) cells = (rt.matches('.mq-scell') ? [rt] : [...rt.querySelectorAll('.mq-scell')]).filter(visible);
        cells.forEach((c, ci) => {
            const cr = c.getBoundingClientRect(); if (cr.height < 10 * MM || cr.width < 10 * MM) return;
            const cs = getComputedStyle(c);
            const inner = { t: cr.top + parseFloat(cs.paddingTop) + parseFloat(cs.borderTopWidth), b: cr.bottom - parseFloat(cs.paddingBottom) - parseFloat(cs.borderBottomWidth), l: cr.left + parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth), r: cr.right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth) };
            // the ink, primitive by primitive: text line boxes, each SVG shape that paints (not the whole <svg> box: critic
            // eb-r1 D2), images / canvases / inputs, bordered boxes, and every answer slot (the item's own writing room)
            let box = null; const rects = [];
            const take = (r) => { if (!r.width || !r.height) return; rects.push({ t: r.top, b: r.bottom }); box = box ? { t: Math.min(box.t, r.top), b: Math.max(box.b, r.bottom), l: Math.min(box.l, r.left), r: Math.max(box.r, r.right) } : { t: r.top, b: r.bottom, l: r.left, r: r.right }; };
            const SHAPES = /^(text|rect|circle|ellipse|line|path|polygon|polyline|image|use)$/i;
            for (const d of c.querySelectorAll('*')) {
                if (d.closest('[data-ws-label], .ws-letter, .ws-tab') || !visible(d)) continue;
                const st = getComputedStyle(d);
                const ownText = !(d instanceof SVGElement) && [...d.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
                // transparent only when its ALPHA is 0 (critic eb-r2 D7: the old pattern also matched rgb(0, 0, 0), so black
                // SVG ink was invisible); white paints nothing on white paper
                const paints = (v) => !!v && v !== 'none' && v !== 'transparent' && !/^rgba\([^)]*,\s*0(?:\.0+)?\)$/.test(v) && !/^(#fff(fff)?|white|rgb\(255,\s*255,\s*255\))$/i.test(v);
                // a border is ink only when it is drawn in a colour that paints (critic eb-r3 m1: a transparent or white border is not ink)
                const edgeInk = (k) => parseFloat(st[`border${k}Width`]) > 0 && st[`border${k}Style`] !== 'none' && st[`border${k}Style`] !== 'hidden' && paints(st[`border${k}Color`]);
                const stroked = edgeInk('Top') || edgeInk('Bottom') || edgeInk('Left') || edgeInk('Right');
                // an SVG paint with fill-opacity / stroke-opacity 0 is not ink (critic eb-r3 m2)
                const svgInk = d instanceof SVGElement && SHAPES.test(d.tagName) && (d.tagName.toLowerCase() === 'text' || (paints(st.stroke) && parseFloat(st.strokeOpacity || '1') > 0 && parseFloat(st.strokeWidth || '1') > 0) || (paints(st.fill) && parseFloat(st.fillOpacity || '1') > 0));
                const drawn = !(d instanceof SVGElement) && /^(img|canvas|input)$/i.test(d.tagName);
                const slot = d.hasAttribute('data-ws-slot');
                if (ownText) { const rg = document.createRange(); rg.selectNodeContents(d); for (const r of rg.getClientRects()) take(r); continue; }
                if (svgInk || drawn || stroked || slot) take(d.getBoundingClientRect());
            }
            // the cell is marked for the pixel read (measurePix) under the same page:cell index
            c.setAttribute('data-eb-i', `${pi + 1}:${ci + 1}`);
            // the kit's MANDATORY TOP PAD (lead ruling 2026-11-13, critic eb-r4 minor): the cell's own padding-top, up to the kit's
            // top inset (WORKSHEET_DESIGN_STANDARD CL-40 / section 796: 3 mm, or the label side + 1 mm). It is structural, the same
            // on every cell, so it is neither band nor cell: judge() takes it off the band above the ink and off the cell height.
            const labSide = Math.max(0, ...[...c.querySelectorAll(':scope > [data-ws-label], :scope > .ws-letter, :scope > .ws-tab, :scope > .ws-modeltab')].map((e) => e.getBoundingClientRect().height));
            const padMm = Math.max(0, Math.min(parseFloat(cs.paddingTop) || 0, Math.max(3 * MM, labSide + 1 * MM))) / MM;
            const label = ((c.querySelector('[data-ws-label], .ws-letter') || {}).textContent || '').trim();
            const tmpl = c.getAttribute('data-ws-cell') || (c.classList.contains('mq-scell') ? 'screen-cell' : '');
            // a cell with no ink is recorded, never dropped (critic eb-r2 D7 / eb-r3 D2): judge() reports it as EB-READ
            if (!box) { out.push({ page: pi + 1, cell: ci + 1, label, tmpl, padMm, noInk: true, hMm: +(cr.height / MM).toFixed(1), wMm: +(cr.width / MM).toFixed(1), hRaw: cr.height / MM, topPx: Math.round(cr.top) }); return; }
            // the largest empty band BETWEEN blocks of ink (merged vertical intervals)
            rects.sort((a, b) => a.t - b.t); let between = 0, reach = rects.length ? rects[0].b : 0;
            for (const r of rects) { if (r.t > reach) between = Math.max(between, r.t - reach); reach = Math.max(reach, r.b); }
            const H = inner.b - inner.t, W = inner.r - inner.l;
            const below = Math.max(inner.b - box.b, 0), above = Math.max(box.t - inner.t, 0);
            const gl = Math.max(box.l - inner.l, 0), gr = Math.max(inner.r - box.r, 0);
            // print cells: the wider gap beside the ink (RUBRIC H13, as before); a SCREEN cell (a fact centred in a wide card)
            // counts only when the content is pinned to one side - a wide gap on one side and (almost) none on the other
            const screen = !c.hasAttribute('data-ws-cell') || !!c.closest('#gameView, #worksheetView, #quizTakeView');
            const side = !screen || Math.min(gl, gr) <= 0.10 * (inner.r - inner.l) ? Math.max(gl, gr) : 0;
            // EB-EDGE: the ink's nearest approach to the cell's own border, left or right (negative: across it)
            const edge = Math.min(box.l - cr.left, cr.right - box.r);
            // a cell that CENTRES its flow (justify-content center: chartwindow, clock, number line ...) in a taller row holds equal
            // white above and below it; EB-BAND counts the two halves as ONE band, as it would under a top-aligned cell (lf-builds
            // chart_120 fix: a window centred beside the Guided Model, 24.5 + 23.9 mm of 115 mm, read 21 % under-only). Only when
            // the flow's top and bottom slack match within 1 mm.
            let centreMm = 0;
            if (/center/.test(cs.justifyContent) && /column/.test(cs.flexDirection)) {
                let ft = Infinity, fb = -Infinity;
                for (const k of c.children) {
                    if (k.matches('[data-ws-label], .ws-letter, .ws-tab, .ws-modeltab') || !visible(k)) continue;
                    const ks = getComputedStyle(k);
                    if (ks.position === 'absolute' || ks.position === 'fixed') continue;
                    const kr = k.getBoundingClientRect();
                    ft = Math.min(ft, kr.top - (parseFloat(ks.marginTop) || 0)); fb = Math.max(fb, kr.bottom + (parseFloat(ks.marginBottom) || 0));
                }
                const top = ft - inner.t, bot = inner.b - fb;
                if (Number.isFinite(top) && top > 0 && bot > 0 && Math.abs(top - bot) < MM) centreMm = top / MM;
            }
            out.push({ page: pi + 1, cell: ci + 1, label, padMm, centreMm, hMm: +(cr.height / MM).toFixed(1), wMm: +(cr.width / MM).toFixed(1),
                innerMm: H / MM, belowMm: below / MM, aboveMm: above / MM, betweenMm: between / MM, sideMm: side / MM, innerW: W / MM, hRaw: cr.height / MM, edgeMm: +(edge / MM).toFixed(1),
                // EB-FOOT without the centring offset (lf-ops-props 2026-11-13, accepted by lf-checks): a cell whose content is CENTRED
                // in a taller row shares that free space out above its first block; it is not drawn height (EB-BAND still judges it)
                neededMm: +(((box.b - cr.top - ((() => { const kids = [...c.children].filter((k) => !k.matches('[data-ws-label], .ws-letter, .ws-tab') && getComputedStyle(k).position !== 'absolute' && k.getBoundingClientRect().height > 0); return /center/.test(cs.justifyContent) && kids.length ? Math.max(0, kids[0].getBoundingClientRect().top - inner.t) : 0; })())) + (cr.bottom - inner.b)) / MM).toFixed(1), topPx: Math.round(cr.top), tmpl,
                screen, step: Number(((c.querySelector('.mq-steptext em') || {}).textContent) || NaN),
                // the bridge's item index the kit wrote on the cell (critic eb-r5 m1): EB-FOOT pairs by it; -1 when absent
                item: c.hasAttribute('data-eb-item') ? Number(c.getAttribute('data-eb-item').split(',')[0]) : -1, items: c.hasAttribute('data-eb-item') ? c.getAttribute('data-eb-item').split(',').map(Number) : [], partial: c.getAttribute('data-eb-partial') || '', inkMm: +((box.b - cr.top) / MM).toFixed(1),
                // the column count of the grid that LAYS this cell (lf-roles 4e8eca14, accepted by lf-checks 2026-11-13): a lone cell
                // on a 2-column grid's last row is still laid at 2 columns; a full-width problem in its own 1-column grid at 1
                gridCols: (() => { const g = c.closest('.ws-grid'); if (!g) return 0; const t = getComputedStyle(g).gridTemplateColumns || ''; const n = t && t !== 'none' ? t.trim().split(/\s+/).length : 0;
                    // a RE-LAID grid (grid.js PG-15) is cut into lcm(cols, rem) tracks: its columns are the tracks over a full row's span
                    if (!n || !g.classList.contains('relaid')) return n; const f = g.querySelector(':scope > [data-ws-cell]'); const sp = f && /span\s+(\d+)/.exec(f.style.gridColumn || f.getAttribute('style') || ''); return sp && +sp[1] > 0 ? Math.round(n / +sp[1]) : n; })() });
        });
    });
    return out;
}

// EB-BAND / EB-SIDE on the PIXELS (critic eb-r3 D1: the DOM read went from the padding box to the text LINE box, leading
// included, and under-read the visible band by up to 18 points; RUBRIC H13 is the band the pupil sees). For every cell measureCells
// marked (data-eb-i = "page:cell"): the rows and columns inside the cell's BORDER box (the border stroke and 2 px of its
// anti-aliasing left out) that hold a pixel darker than 225 (the trace grey #949494 counts), the tab / letter label masked out,
// plus every answer slot's own box (an empty slot is the item's writing room, as before). The bands run from the inside of the
// border to the ink. png: a data URL of the whole document at 1 px = 1 CSS px (print pages); shots: {"page:cell": data URL of
// that cell's own box} (screen hosts, where a full-page capture would relayout the app). Returns {"page:cell": {...} | {noInk}}.
async function measurePix(arg) {
    const { png, shots } = arg;
    const MM = 96 / 25.4;
    const load = async (src) => { const img = new Image(); img.src = src; await img.decode(); const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height; const g = cv.getContext('2d'); g.drawImage(img, 0, 0); return { g, w: img.width, h: img.height }; };
    const full = png ? await load(png) : null;
    const out = {};
    for (const c of document.querySelectorAll('[data-eb-i]')) {
        const id = c.getAttribute('data-eb-i');
        const cr = c.getBoundingClientRect(), cs = getComputedStyle(c);
        let im, ox, oy;
        if (full) { im = full; ox = cr.left + window.scrollX; oy = cr.top + window.scrollY; } else if (shots && shots[id]) { im = await load(shots[id]); ox = 0; oy = 0; } else continue;
        const bt = parseFloat(cs.borderTopWidth) || 0, bb = parseFloat(cs.borderBottomWidth) || 0, bl = parseFloat(cs.borderLeftWidth) || 0, br = parseFloat(cs.borderRightWidth) || 0;
        const IN = 2;
        const x0 = Math.max(0, Math.ceil(ox + bl + IN)), x1 = Math.min(im.w, Math.floor(ox + cr.width - br - IN));
        const y0 = Math.max(0, Math.ceil(oy + bt + IN)), y1 = Math.min(im.h, Math.floor(oy + cr.height - bb - IN));
        if (x1 <= x0 || y1 <= y0) continue;
        const w = x1 - x0, h = y1 - y0;
        const d = im.g.getImageData(x0, y0, w, h).data;
        // image coords of a descendant's box (relative to this read window)
        const rel = (r, pad) => ({ l: Math.floor(r.left - cr.left + ox - x0 - pad), r: Math.ceil(r.right - cr.left + ox - x0 + pad), t: Math.floor(r.top - cr.top + oy - y0 - pad), b: Math.ceil(r.bottom - cr.top + oy - y0 + pad) });
        const masks = [...c.querySelectorAll('[data-ws-label], .ws-letter, .ws-tab, .ws-modeltab')].map((e) => e.getBoundingClientRect()).filter((r) => r.width && r.height).map((r) => rel(r, 1));
        const rows = new Uint8Array(h), cols = new Uint8Array(w);
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
            const k = (y * w + x) * 4;
            if ((d[k] + d[k + 1] + d[k + 2]) / 3 >= 225 || d[k + 3] < 32) continue;
            if (masks.some((m) => x >= m.l && x < m.r && y >= m.t && y < m.b)) continue;
            rows[y] = 1; cols[x] = 1;
        }
        // a SCREEN answer slot (critic eb-r4 D1, lead ruling 2026-11-13 (a)) counts only over what it draws: a closed box (inked
        // top AND bottom edge) is its whole box; otherwise its inked edges plus the height of ONE written digit (Hw = 0.75 x its
        // font size) where the digit is written - centred in an input's content box, on the line of any other slot. A 48 px
        // underline-only touch input is not ink over its blank top. A PRINT slot is its whole box, as before (the writing room).
        const screen = !c.hasAttribute('data-ws-cell') || !!c.closest('#gameView, #worksheetView, #quizTakeView');
        const paints = (v) => !!v && v !== 'none' && v !== 'transparent' && !/^rgba\([^)]*,\s*0(?:\.0+)?\)$/.test(v) && !/^(#fff(fff)?|white|rgb\(255,\s*255,\s*255\))$/i.test(v);
        const slots = screen ? c.querySelectorAll('[data-ws-slot], input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"])') : c.querySelectorAll('[data-ws-slot]');
        for (const sl of slots) {
            const cs2 = getComputedStyle(sl); if (cs2.display === 'none' || cs2.visibility === 'hidden' || parseFloat(cs2.opacity || '1') <= 0.05) continue;
            const r = sl.getBoundingClientRect(); if (!r.width || !r.height) continue;
            const q = rel(r, 0);
            const spans = [];
            let xs = [[q.l, q.r]];
            if (!screen) { if (arg.slotInk === false) continue; spans.push([q.t, q.b]); }
            else {
                // an edge counts only when it is drawn DARKER than the 225 pixel ink threshold (critic eb-r5 D1: a 1 px #eee closed
                // border, no pixel of which is ink, read as one 150 px block of ink and hid the band)
                const dark = (v) => { if (!paints(v)) return false; const m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?/.exec(v); if (!m) return true; const a = m[4] == null ? 1 : (/%$/.test(m[4]) ? parseFloat(m[4]) / 100 : parseFloat(m[4])); return a * 255 >= 32 && (255 - a * (255 - (+m[1] + +m[2] + +m[3]) / 3)) < 225; };
                const ew = (k) => (parseFloat(cs2[`border${k}Width`]) > 0 && !/^(none|hidden)$/.test(cs2[`border${k}Style`]) && dark(cs2[`border${k}Color`]) ? parseFloat(cs2[`border${k}Width`]) : 0);
                const bt = ew('Top'), bb2 = ew('Bottom');
                if (bt && bb2) spans.push([q.t, q.b]);
                else {
                    if (bt) spans.push([q.t, q.t + Math.ceil(bt)]);
                    if (bb2) spans.push([q.b - Math.ceil(bb2), q.b]);
                    const hw = 0.75 * (parseFloat(cs2.fontSize) || 16);
                    const ct = q.t + (parseFloat(cs2.borderTopWidth) || 0) + (parseFloat(cs2.paddingTop) || 0), cb = q.b - (parseFloat(cs2.borderBottomWidth) || 0) - (parseFloat(cs2.paddingBottom) || 0);
                    const mid = sl.tagName === 'INPUT' ? (ct + cb) / 2 : cb - hw / 2;
                    spans.push([Math.floor(mid - hw / 2), Math.ceil(mid + hw / 2)]);
                }
                // the WIDTH (critic eb-r6 D1, the horizontal twin of r5 D1): a slot is ink across its whole width only where it draws
                // a dark top or bottom line (an underline or a closed box); a dark left / right edge is ink at that edge. Otherwise
                // (no edge, or a faint #eee one) it counts as ONE written digit (Ww = 0.6 x its font size) where the slot writes its
                // text: at the content box's start, centre or end by its computed text-align (an input writes at its start by
                // default). A 95 mm borderless input is not ink across an empty side band.
                xs = [];
                const bl2 = ew('Left'), br2 = ew('Right');
                if (bt || bb2) xs.push([q.l, q.r]);
                else {
                    if (bl2) xs.push([q.l, q.l + Math.ceil(bl2)]);
                    if (br2) xs.push([q.r - Math.ceil(br2), q.r]);
                    const ww = 0.6 * (parseFloat(cs2.fontSize) || 16);
                    const cl = q.l + (parseFloat(cs2.borderLeftWidth) || 0) + (parseFloat(cs2.paddingLeft) || 0), cr2 = q.r - (parseFloat(cs2.borderRightWidth) || 0) - (parseFloat(cs2.paddingRight) || 0);
                    const ta = cs2.textAlign, rtl = cs2.direction === 'rtl';
                    const atEnd = ta === 'right' || (ta === 'end' && !rtl) || (ta === 'start' && rtl);
                    const xa = ta === 'center' || ta === '-webkit-center' ? (cl + cr2) / 2 - ww / 2 : atEnd ? cr2 - ww : cl;
                    xs.push([Math.floor(Math.max(cl, xa)), Math.ceil(Math.min(Math.max(cl, xa) + ww, Math.max(cr2, cl + ww)))]);
                }
            }
            for (const [a, b] of spans) for (let y = Math.max(0, a); y < Math.min(h, b); y++) rows[y] = 1;
            for (const [a, b] of xs) for (let x = Math.max(0, a); x < Math.min(w, b); x++) cols[x] = 1;
        }
        const fr = rows.indexOf(1); if (fr < 0) { out[id] = { noInk: true }; continue; }
        const lr = rows.lastIndexOf(1), fc = cols.indexOf(1), lc = cols.lastIndexOf(1);
        let between = 0, run = 0; for (let y = fr; y <= lr; y++) { if (rows[y]) { between = Math.max(between, run); run = 0; } else run++; }
        // side to side (critic eb-r7 m5): the widest run of columns with no ink anywhere in the cell, between its first and last ink
        let betweenX = 0; run = 0; for (let x = fc; x <= lc; x++) { if (cols[x]) { betweenX = Math.max(betweenX, run); run = 0; } else run++; }
        // bands from the inside of the border stroke (the read window starts IN px inside it: those px are empty paper)
        const above = (y0 + fr) - (oy + bt), below = (oy + cr.height - bb) - (y0 + lr + 1);
        const gl = (x0 + fc) - (ox + bl), gr = (ox + cr.width - br) - (x0 + lc + 1);
        out[id] = { aboveMm: Math.max(above, 0) / MM, belowMm: Math.max(below, 0) / MM, betweenMm: between / MM, betweenXMm: betweenX / MM, gl: Math.max(gl, 0) / MM, gr: Math.max(gr, 0) / MM, innerW: (cr.width - bl - br) / MM };
    }
    return out;
}
/** Merge measurePix's read into measureCells' records: the bands and the side are the pixels'; a cell with no pixel ink is noInk. */
function applyPix(cells, px) {
    for (const c of cells) {
        const p = px[`${c.page}:${c.cell}`]; if (!p) continue;
        if (p.noInk) { c.noInk = true; continue; }
        c.pix = true; c.belowMm = p.belowMm; c.aboveMm = p.aboveMm; c.betweenMm = p.betweenMm; c.innerW = p.innerW; c.betweenXMm = p.betweenXMm || 0;
        // print cells: the wider gap beside the ink (RUBRIC H13); a SCREEN cell only when the content is pinned to one side
        c.sideMm = !c.screen || Math.min(p.gl, p.gr) <= 0.10 * p.innerW ? Math.max(p.gl, p.gr) : 0;
    }
    return cells;
}
/** Read the pixels of the cells measureCells marked on page `pg` and merge them in. screen: per-cell captures (no relayout). */
async function pixRead(pg, cells, screen) {
    if (!cells.length) return cells;
    let px;
    if (screen) {
        const shots = {};
        for (const h of await pg.$$('[data-eb-i]')) {
            const id = await h.evaluate((e) => e.getAttribute('data-eb-i'));
            try { shots[id] = 'data:image/png;base64,' + await h.screenshot({ encoding: 'base64' }); } catch (e) { /* not capturable: the DOM read stands */ }
        }
        px = await pg.evaluate(measurePix, { shots, slotInk: SLOT_INK });
    } else {
        const png = 'data:image/png;base64,' + await pg.screenshot({ fullPage: true, encoding: 'base64' });
        px = await pg.evaluate(measurePix, { png, slotInk: SLOT_INK });
    }
    await pg.evaluate(() => { for (const e of document.querySelectorAll('[data-eb-i]')) e.removeAttribute('data-eb-i'); });
    return applyPix(cells, px);
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
        // --slot-ink off judges the lane's KIT cells: a `legacy` cell (another skill's old print HTML) is a note (lf-vocab r6)
        if (!SLOT_INK && c.tmpl === 'legacy') { LEGACY_NOTES.push(legacyNote(where, c)); return; }
        // a cell with no ink at all (critic eb-r3 D2: it was dropped, so a blank cell beside a good one read OK)
        if (c.noInk) { F('EB-READ', `${where} p${c.page} cell ${c.label || c.cell}`, `cell ${c.cell} has no ink (a ${c.hMm} mm kit cell with no pixel darker than the ink threshold 225 of 255: blank, or only ink too faint to count, e.g. #eee) [${c.tmpl}]`); return; }
        // compared unrounded (critic eb-r1 D5); the largest of the bands under, between and above the ink (critic eb-r1 D2)
        // the kit's mandatory top pad is not band (lead ruling 2026-11-13): it comes off the band above the ink; the limit stays
        // 30 % of the whole cell, so the exclusion never makes a band under or between the ink count more than before
        const pad = c.pix ? Math.min(c.padMm || 0, c.aboveMm || 0) : 0,   // (the DOM read's band already starts inside the padding)
            hJ = c.hRaw || c.hMm, aboveJ = Math.max(0, (c.aboveMm || 0) - pad);
        const lim = BAND * hJ;
        // (a Scripted Model's interior band - step text to the problem, room kept for a later mark - is EB-GAP's, read on the
        // pixels with PT-MOD-3; here a model state is judged under and above its ink only)
        const bands = [['under', c.belowMm], ['between the blocks of', role === 'scripted-model' ? 0 : c.betweenMm], ['above', aboveJ]];
        // a CENTRED cell (centreMm > 0): the row's stretch above its flow (centreMm, measured inside the padding, so the top pad
        // and the letter label's rows are never in it) + the white under its ink is one band (lf-builds chart_120 fix, backtest
        // eb-centred-band). The pixel band above is NOT used here: it runs over the label's rows, which a critic's scan inks.
        if (c.centreMm > 0) bands.push(['around (above + under)', (c.belowMm || 0) + c.centreMm]);
        for (const b of bands) b[1] = Number(b[1]) || 0;   // (a fixture cell may lack a band: undefined broke the sort)
        bands.sort((a, b) => b[1] - a[1]);
        const [where2, band] = bands[0];
        if (band >= lim && !modBandOk(role, cells, i)) F('EB-BAND', `${where} p${c.page} cell ${c.label || c.cell}`, `empty band ${band.toFixed(1)} mm ${where2} the ink of a ${c.hMm} mm cell (${(band / hJ * 100).toFixed(1)} %; limit ${(BAND * 100).toFixed(0)} % = ${lim.toFixed(1)} mm${pad > 0.05 ? `; the ${pad.toFixed(1)} mm top pad excluded` : ''}) [${c.tmpl}]`);
        if (c.tmpl !== 'screen-cell' && !String(role || '').startsWith('host:') && Number.isFinite(c.edgeMm) && c.edgeMm < EDGE_MM) F('EB-EDGE', `${where} p${c.page} cell ${c.label || c.cell}`, `ink ${c.edgeMm < 0 ? `${-c.edgeMm} mm across` : `${c.edgeMm} mm from`} the cell's border (a divider or the page frame; limit ${EDGE_MM} mm) [${c.tmpl}]`);
        if (c.pix && c.betweenXMm >= SIDE * c.innerW) F('EB-SIDE', `${where} p${c.page} cell ${c.label || c.cell}`, `${c.betweenXMm.toFixed(1)} mm empty BETWEEN two pieces of ink, side to side (no ink above or below it), in a ${c.innerW.toFixed(1)} mm wide cell interior (${(c.betweenXMm / c.innerW * 100).toFixed(1)} %; limit ${(SIDE * 100).toFixed(0)} %) [${c.tmpl}]`);
        if (c.sideMm >= SIDE * c.innerW) F('EB-SIDE', `${where} p${c.page} cell ${c.label || c.cell}`, `${c.tmpl === 'screen-cell' || String(role || '').startsWith('host:') ? 'content pinned to one side: ' : ''}${c.sideMm.toFixed(1)} mm empty beside the ink of a ${c.innerW.toFixed(1)} mm wide cell interior (${(c.sideMm / c.innerW * 100).toFixed(1)} %; limit ${(SIDE * 100).toFixed(0)} %) [${c.tmpl}]`);
    });
}

async function htmlMain() {
    // --html honours --only, --json and --report-only as a --skill run does (critic eb-r3 m3)
    const findings = []; const F = (rule, where, msg) => { if (!ONLY || ONLY.includes(rule)) findings.push({ rule, where, msg }); };
    const app = await open({ seed: 1 });
    try {
        const sh = await app.browser.newPage();
        await sh.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
        await sh.goto(app.page.url(), { waitUntil: 'domcontentloaded' });
        await sh.setContent(fs.readFileSync(path.resolve(process.cwd(), HTML), 'utf8'), { waitUntil: 'networkidle0', timeout: 60000 });
        // a screen fixture (critic eb-r3 D5): a B&W screen cell (.mq-scell) inside #gameView, read as a host reads it (no print media)
        const screen = await sh.evaluate(() => !document.querySelector('.ws-page') && !!document.querySelector('#gameView .mq-scell, #worksheetView .mq-scell, #quizTakeView .mq-scell'));
        if (!screen) await sh.emulateMediaType('print');
        const scope = screen ? '#gameView, #worksheetView, #quizTakeView' : 'body > section.ws-page, body > .ws-page';
        const cells = await pixRead(sh, await sh.evaluate(measureCells, scope), screen);
        if (!cells.length) F('EB-READ', HTML, 'no kit cell and no screen cell (.mq-scell) on the page (markup changed?)');
        judge(cells, path.basename(HTML), F, screen ? 'host:fixture' : undefined);
        // EB-ITEMKEY / EB-ITEMPARITY on a fixture: <template id="eb-pupil">, "eb-key", "eb-plain", "eb-plain-key" (the file's text)
        const src = fs.readFileSync(path.resolve(process.cwd(), HTML), 'utf8');
        const tpl = (id) => { const m = new RegExp(`<template id="${id}">([\\s\\S]*?)</template>`).exec(src); return m ? m[1] : null; };
        if (tpl('eb-pupil') != null) {
            if (tpl('eb-key') != null) for (const msg of itemKeyFindings(tpl('eb-pupil'), tpl('eb-key'))) F('EB-ITEMKEY', path.basename(HTML), msg);
            for (const [what, t, pl] of [['pupil page', tpl('eb-pupil'), tpl('eb-plain')], ['key', tpl('eb-key'), tpl('eb-plain-key')]]) { if (t == null || pl == null) continue; const msg = itemParityFinding(t, pl, what); if (msg) F('EB-ITEMPARITY', path.basename(HTML), msg); }
        }
        console.log(`note: ${slotInkNote(SLOT_INK)}`);
        for (const n of LEGACY_NOTES) console.log(`note: ${n}`);
        for (const x of findings) console.log(`${x.rule} ${x.where}: ${x.msg}`);
        console.log(`(${cells.length} cells${ONLY ? `; --only ${ONLY.join(',')}` : ''})`);
        if (arg('json', null)) fs.writeFileSync(path.resolve(process.cwd(), arg('json')), JSON.stringify({ html: HTML, findings, cells }, null, 1));
    } finally { await app.close(); }
    console.log(`ws-empty-band: ${findings.length ? `FAIL (${findings.length})` : 'OK'}`);
    process.exit(findings.length && !has('report-only') ? 1 : 0);
}

async function main() {
    const findings = []; const notes = []; let renders = 0, cellsRead = 0;
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
            const vSize = ['L', 'M', 'S'].find((z) => SIZES.includes(z)) || SIZES[0];
            if (arg('roles', null) !== 'none') for (const v of variants) jobs.push({ role: 'independent', size: vSize, opts: Object.assign({}, OPTS || {}, v.opts), tag: `independent ${vSize} {${v.option}: ${v.value}}` });
            if (!plan.cards.length) notes.push(`${key}: no signed card - EB-ROLE not judged (default roles)`);
            notes.push(`${key}: slot ink ${SLOT_INK ? 'on' : 'off'}; card ${plan.cards.join(', ') || '(none: default roles)'}; ${plan.roles.length} roles x ${SIZES.join('/')} + ${variants.length} option variant(s) of ${vlist.length} + hosts ${HOSTS.join(', ') || 'none'}`);
            for (const j of jobs) {
                const grid = GRID_ROLES.has(j.role);
                const b = await page.evaluate(async ({ categoryId, skillId, j, SEED, grid }) => {
                    try {
                        // a grid role is built with its key (EB-ITEMKEY) and a second time with no data-eb-item tags (EB-ITEMPARITY)
                        const req = { role: j.role, sections: [{ skills: [Object.assign({ categoryId, skillId }, j.opts ? { opts: j.opts } : {})] }], size: j.size, paper: 'A4', seed: SEED, key: grid };
                        const r = await window.buildSheet(req);
                        const plain = grid ? await window.buildSheet(Object.assign({}, req, { ebItem: false })) : null;
                        const cols = r.plan && r.plan.meta && r.plan.meta.fits && r.plan.meta.fits[0] ? r.plan.meta.fits[0].cols : null;
                        const sections = new Set((r.items || []).map((it) => it.section)).size;
                        const tries = r.plan && r.plan.meta ? Number(r.plan.meta.scoreOutOf) : NaN;
                        return { html: window.sheetDocument(r.pupilHtml, r.title || 'x', { paper: 'A4' }), pupilHtml: grid ? r.pupilHtml : null, keyHtml: grid ? r.keyHtml : null, plainPupil: plain ? plain.pupilHtml : null, plainKey: plain ? plain.keyHtml : null, cols, sections, tries, measured: (r.items || []).map((it) => (it.measured ? Object.fromEntries(Object.entries(it.measured).map(([k, v]) => [k, v && v.hMm])) : null)) };
                    } catch (e) { return { error: String((e && e.message) || e).slice(0, 200) }; }
                }, { categoryId, skillId, j, SEED, grid });
                // a role the signed card OFFERS that the app cannot compose is a failure, not a note (critic eb-r1 D3); with no
                // card (the default role list) it is a note
                if (b.error) { if (plan.cards.length && plan.cards[0] !== '--roles') F('EB-ROLE', `${key} ${j.tag}`, `the card offers it, the app does not compose it: ${b.error}`); else notes.push(`${key} ${j.tag}: not composed (${b.error})`); continue; }
                { const cap = gdpCap(j.role, j.size, b.tries); if (cap) F('EB-GDPCAP', `${key} ${j.tag}`, cap); }
                if (grid) {   // critic ebitem-r1 m3: the key-order and parity probes as gates
                    for (const msg of itemKeyFindings(b.pupilHtml, b.keyHtml)) F('EB-ITEMKEY', `${key} ${j.tag}`, msg);
                    for (const [what, t, pl] of [['pupil page', b.pupilHtml, b.plainPupil], ['key', b.keyHtml, b.plainKey]]) { const msg = itemParityFinding(t, pl, what); if (msg) F('EB-ITEMPARITY', `${key} ${j.tag}`, msg); }
                }
                const sh = await app.browser.newPage();
                try {
                    await sh.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
                    await sh.goto(page.url(), { waitUntil: 'domcontentloaded' });
                    await sh.setContent(b.html, { waitUntil: 'networkidle0', timeout: 60000 });
                    await sh.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', { timeout: 15000 }).catch(() => {});
                    await sh.emulateMediaType('print');
                    const cells = await pixRead(sh, await sh.evaluate(measureCells, 'body > section.ws-page, body > .ws-page'), false);
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
                    // EB-FOOT: pairs only where the page's cells and the measured items are one to one
                    const m = b.measured;
                    // (every cell against the items it holds, any page shape: lead ruling 2026-11-13; b.combo: the bridge's measure of
                    // a multi-item cell, when it gives one - none today, so such a cell is a note, never a silent pass)
                    if (GRID_ROLES.has(j.role)) { const fr = footFindings(cells, m, b.cols, b.sections, FOOT, (ids, k) => (b.combo && b.combo[`${ids.join(',')}@${k}`]) || null);
                        for (const n of fr.notes) notes.push(`${key} ${j.tag} EB-FOOT ${n}`);
                        for (const x of fr.out) F('EB-FOOT', `${key} ${j.tag} p${x.c.page} cell ${x.c.label || x.c.cell}`, `drawn ${x.c.neededMm} mm, footprint hMm ${x.fp} mm at ${x.k} across${fr.mode === 'index' ? `, item ${x.ids.map((i) => i + 1).join('+')}` : ''} (${Math.round((x.c.neededMm - x.fp) / x.fp * 100)} %; limit ${FOOT * 100} %)`); }
                } finally { await sh.close(); }
            }
            // screen hosts
            const widths = { card: [390, 820, 1280], worksheet: [1280], quiz: [1280] };
            // every host at the skill's defaults AND at each sampled option variant (lf-checks hosts lane 2026-11-12: unit_form's
            // worksheet band appeared only at rename=more, an option no host run had rendered)
            const hostOpts = [{ tag: '', opts: OPTS }, ...variants.map((v) => ({ tag: ` {${v.option}: ${v.value}}`, opts: Object.assign({}, OPTS || {}, v.opts) }))];
            for (const ho of hostOpts) for (const host of HOSTS) for (const w of widths[host] || []) {
                await page.setViewport({ width: w, height: w < 500 ? 844 : 900, deviceScaleFactor: 1 });
                const ok = await page.evaluate(async ({ c, k, host, SEED, OPTS }) => {
                    try {
                        const st = window.state;
                        if (window.clearSetOptions) window.clearSetOptions({ silent: true }); if (OPTS && window.setSetOptions) window.setSetOptions(c, k, OPTS, { silent: true });
                        if (host === 'card') { st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false; window.showView('gameView'); st.currentQ = window.generateQuestionFor({ category: c, skill: k, seed: SEED }); window.renderQuestion(); return '#gameView'; }
                        if (host === 'worksheet') { st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 6; window.initWorksheet(); return '#worksheetView .mq-wspaper'; }
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
                }, { c: categoryId, k: skillId, host, SEED, OPTS: ho.opts });
                // a host that does not render is a failure, like a host that reads no cell (critic eb-r2 D9)
                if (!ok || /^ERR/.test(ok)) { F('EB-READ', `${key} ${host} ${w}px${ho.tag}`, `the host did not render (${ok})`); continue; }
                await new Promise((r) => setTimeout(r, 450));
                const cells = await pixRead(page, await page.evaluate(measureCells, ok), true);
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
                // a host that reads no cell is a failure (critic eb-r1 D1: the card was silently unmeasured)
                if (!cells.length) { F('EB-READ', `${key} ${host} ${w}px${ho.tag}`, 'no kit cell and no screen cell (.mq-scell) read on the host'); continue; }
                judge(cells, `${key} ${host} ${w}px${ho.tag}`, F, `host:${host}`);
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
    const rules = RULES;
    console.log(`note: ${slotInkNote(SLOT_INK)}`);
    for (const n of notes) console.log(`note: ${n}`);
    for (const n of LEGACY_NOTES) console.log(`note: ${n}`);
    for (const r of rules) { const f = findings.filter((x) => x.rule === r); console.log(`${r.padEnd(8)} ${f.length ? `FAIL ${f.length}` : 'PASS'}`); for (const x of f.slice(0, 15)) console.log(`   ${x.where}: ${x.msg}`); if (f.length > 15) console.log(`   ... ${f.length - 15} more`); }
    console.log(`(${SKILLS.length} skill(s), ${renders} renders, ${cellsRead} cells, ${((Date.now() - T0) / 1000).toFixed(0)} s${pinned != null ? `; ${pinned} finding(s) within the pin ${path.relative(ROOT, BASE)}` : ''})`);
    if (arg('json', null)) fs.writeFileSync(path.resolve(process.cwd(), arg('json')), JSON.stringify({ skills: SKILLS, findings, notes, renders, cells: cellsRead }, null, 1));
    const bad = findings.length || !renders ? (findings.length || 1) : 0;
    console.log(`ws-empty-band: ${bad ? `FAIL (${findings.length || 'nothing rendered'})` : 'OK'}`);
    process.exit(bad && !has('report-only') ? 1 : 0);
}
// (lf-partopts: the measure and the judge are shared - ws-partopts-unit.cjs judges every part count by these same rules)
// `--judge-fixture file.json` ({role, where, cells: [measured cells]}): judges measured cells as a page would (EB-BAND / EB-SIDE /
// EB-EDGE), no browser - the backtest of a measure (lf-builds chart_120 fix: a centred cell's white above + under is one band)
if (require.main === module && arg('judge-fixture', null)) {
    const fx = JSON.parse(fs.readFileSync(path.resolve(arg('judge-fixture')), 'utf8'));
    const got = [];
    judge(fx.cells || [], fx.where || 'fixture', (rule, where, msg) => got.push(`${rule} ${where}: ${msg}`), fx.role || 'independent');
    for (const g of got) console.log('   ' + g);
    console.log(`ws-empty-band: ${got.length ? `FAIL (${got.length})` : 'OK (fixture)'}`);
    process.exit(got.length ? 1 : 0);
}
if (require.main === module && !arg('judge-fixture', null)) (HTML ? htmlMain() : main()).catch((e) => { console.error(e); console.log('ws-empty-band: FAIL'); process.exit(1); });
module.exports = { measureCells, judge };
