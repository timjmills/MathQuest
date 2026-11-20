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
//                                         --grid-foot --columns N
//                                         --slot-ink off --only R1,R2 --baseline f --no-baseline --write-baseline f
//
// WHAT IS RENDERED (the plan): the roles the skill's SIGNED spec card offers (tests/lib/ws-card-plan.mjs, lf-ops: §7a
// "offered" page roles minus "hidden"), each at sizes S, M and L with the skill's defaults; the card's option variants on the
// independent page at L (at most --variants, default 6, spread over the list); and the screen hosts: the practice card at 1280,
// 1366, 820 and 1024 px wide (owner 2026-11-13: no phone width; --widths 390 still runs on request), the online worksheet
// and the quiz at 1280 px. No card: the default role list below. A role buildSheet
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
//   EB-SUPBAND (critic divarray r1 D4) the empty band directly UNDER a support array drawing (÷ frame or × array), to the next ink
//             below it or the cell's foot: FAIL at >= 30 % of the cell height. A support BESIDE taller ink has no band under it.
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
//   EB-STRETCH (lead ruling 2026-11-14, lf-engine row cap) a print cell of a template that declares its writing room
//             (js/modules/sheet/layout.js ROW_ROOM_MM) in a row taller than its NATURAL height (the cell laid out of the grid with
//             no row stretch; the tallest of its row) + that room by more than 1.5 mm. A cell beside non-cell content (the Opener
//             Model beside its Steps) is not judged. --self-test checks it. EB_DUMP=1 prints every cell's height / natural height.
//   EB-PAGE   (opt-in --page-fill) a page before the role's last with 30 % or more of its body empty under its last block.
//   EB-LASTPAGE (with --page-fill; lf-ops critic cbt r3 F1) the LAST (or only) page of a fixed-capacity role (pre-skill-check,
//             true-false, reason-it, error-analysis, test) with 30 % or more of its body empty when its next row fits; every other
//             role's last page is measured and noted. --self-test checks it.
//   CAP-PARITY (with --page-fill; same root cause) items a page at L < ceil(0.7 x items a page at M) for the same skill, role and
//             seed while the L page is not full (another row fits). The counts are noted. --self-test checks it.
//   --margin N judges EB-BAND / EB-SIDE at 30 - N % (a fix must clear the limit, not graze it).
//   EB-GDPCAP a Guided page (all its pages) holding more scored tries than the PAGE_TYPES §12.1 / design-standard 12.1 ceiling for
//             its size: 10 / 8 / 6 at S / M / L, plus the Model(s) (lead ruling 2026-11-12, lf-ops facts-roles option b: the fact
//             pages had lifted it to 31 / 23 / 19 to fill the page). Read from buildSheet's plan.meta.scoreOutOf. --self-test checks it.
//   EB-REFILL (GUIDED-TIGHT-REFILL, lf-roles critic r8b D1) a one-page Guided page whose next whole row of tries keeps it within
//             its tries ceiling, with at least one drawn row (the grid's last) white under its grid: the fit counts rows as drawn.
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
//   EB-GRIDFOOT (opt-in --grid-foot, --rule-skills; lead-approved lf-placevalue compare round F1): a ONE-page Test or Review whose
//             white under the grid (the body's bottom less its last block's) is more than one row's height (the median cell
//             height on the page) AND whose grid stands in more columns than the Independent page at that size (buildSheet's
//             plan.meta.fits[0].cols, both). combine Test S, 4 across against the Independent page's 3, left about 45 % of the
//             page white under its grid. --self-test checks it.
//             With --columns N (a TEACHER-chosen, non-default column count; lead ruling 2026-11-13, WORKSHEET_DESIGN_STANDARD
//             CL-2c) the rule judges one-page Independent / More practice / Test / Review renders by the tolerance instead: the
//             white under the grid may be up to 25 % of the page body (one-line in-place items; compare 2 columns at S, 24 %).
//   EB-PARITY (opt-in --screen-parity, --rule-skills) a kit-template skill's card / worksheet / quiz host draws no kit cell of its
//             print template, or no answer place inside it, or an empty legacy box beside it (lf-placevalue critic nwf r1 N9).
//   EB-VOCAB  (opt-in --vocab-ink) a lesson vocabulary picture drawn in under 70 % of its own box (see measureVocab), or a
//             vocabulary cell 35 % or more white above + below its ink, to its drawn edge (see measureVocabCells).
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
const SW = require('../lib/ws-screen-widths.cjs');
const { ROOT, open } = require('../lib/ws-harness.cjs');
// The opt-in flags, spelled out for ws-precritic's srcHas (it reads a flag from `'--flag'` or the first 80 lines; the master merge
// of 2026-11-13 pushed EB-PARITY / EB-VOCAB's lines past line 80, so the lf-placevalue opt-in row silently ran without them)
// ONE literal for both lanes' opt-in flags (lf-checks' header list + lf-placevalue's --grid-foot / --columns), merged 2026-11-13
const OPT_IN_FLAGS = ['--vocab-ink', '--page-fill', '--screen-parity', '--model-states', '--rule-skills', '--margin', '--slot-ink', '--only', '--baseline', '--no-baseline', '--write-baseline', '--grid-foot', '--columns'];   // eslint-disable-line no-unused-vars

const argv = process.argv.slice(2);
// EB-GDPCAP: the Guided tries ceiling (PAGE_TYPES §12.1), and its verdict on one Guided render (null = within it)
const GDP_CAP = { S: 10, M: 8, L: 6 };
const gdpCap = (role, size, tries) => (role === 'guided' && GDP_CAP[size] != null && Number.isFinite(tries) && tries > GDP_CAP[size]
    ? `${tries} scored tries on the Guided page(s) at ${size}; the §12.1 ceiling is ${GDP_CAP[size]} plus the Model` : null);
// EB-LASTPAGE (lf-ops critic cbt r3 F1, 2026-11-14): EB-PAGE judged only pages BEFORE a role's last, so a ONE-page fixed-capacity
// role was never measured (count_by_tables Pre-skill check L: an 84 mm foot, ~35 % of the body, 10 items against 16 at M). The last
// (or only) page of a role whose count the ROLE fixes is judged: FAIL at >= 30 % empty when its next row fits.
// r2 (critic eblast r1): "another row fits" is white >= row + the ROW GAP as rendered (F1: placevalue:value mixed-practice L, 39.8 mm
// white against a 37.2 mm row, failed with no room for the gap); a MULTI-page role's last page is judged by PG-23 (a last page of at
// least one third of a full page's rows is legal; fewer is a missed rebalance), not by a flat 30 % (F3) - except a role whose
// contract is ONE page (pre-skill-check, PT-PRE-1: four quadrants on one body), whose spilled last page is still held to 30 %.
// pg: {pct, whiteMm, rowMm, gapMm, rows} of the page (rowMm: its tallest ROW, a row as tall as its tallest cell; gapMm: the median gap between rows
// as drawn, else the grid's computed row-gap; rows: distinct row tops).
const FIXED_CAP_ROLES = new Set(['pre-skill-check', 'true-false', 'reason-it', 'error-analysis', 'test']);
const ONE_PAGE_ROLES = new Set(['pre-skill-check']);
// r3 (critic eblast r2 G1 / G2, round cap; EBLAST-ADVISORY root cause): the rules INFERRED capacity from white space, so a page
// full BY DESIGN read as "another row fits" (Mixed practice L at its 5-row §12.1 ceiling: 10 vs 21; Scripted Model frames: 6 vs
// 10). Each role's DESIGNED ceiling is declared once in the kit (js/modules/sheet/role-capacity.js, WDS §12.1); the rules read it.
// EBLAST-BLOCKING (lead 2026-11-20, after critic eblast r3): the rules stay ADVISORY globally, but are FINDINGS on these roles.
// The list is PINNED: it may only GROW (`--pin-check` fails when an entry of the merge-base copy is gone, as no-dropped-row does for
// backtests). Seeded with every role green on all passed skills (sweep 2026-11-20); pre-skill-check is out until its owner fixes it.
// Which listed roles each rule can actually judge (critic eblast r4 P3): EB-LASTPAGE judges only FIXED_CAP_ROLES (pre-skill-check,
// true-false, reason-it, error-analysis, test); CAP-PARITY only roles whose count the role sets (guided, error-analysis, review, test,
// pre-skill-check, mixed-practice, true-false, reason-it, word-problems). independent, more-practice, stretch, scripted-model,
// opener, lesson, fact-probe and fact-rows are listed so a future rule on them blocks at once, but today neither rule judges them.
// EBLAST-BLOCKING-BEGIN
const EBLAST_BLOCKING_ROLES = [
    'independent', 'more-practice', 'guided', 'error-analysis', 'review', 'test', 'mixed-practice', 'true-false', 'reason-it',
    'word-problems', 'stretch', 'scripted-model', 'opener', 'lesson', 'fact-probe', 'fact-rows',
];
// EBLAST-BLOCKING-END
const BLOCKING = new Set(EBLAST_BLOCKING_ROLES);
/** 'finding' or 'advisory': an EB-LASTPAGE / CAP-PARITY red on `role` (blockAll: --eblast-block). Pure. */
const eblastMode = (role, blockAll, list = BLOCKING) => (blockAll || list.has(String(role || '').split(' ')[0]) ? 'finding' : 'advisory');
/** The allow-list read from a source text (between the markers), or null. Pure. */
const blockingOf = (src) => { const m = /EBLAST-BLOCKING-BEGIN([\s\S]*?)EBLAST-BLOCKING-END/.exec(String(src || '')); return m ? [...m[1].matchAll(/'([a-z-]+)'/g)].map((x) => x[1]) : null; };
/** The entries of `base` missing from `cur` (the pin: the list may only grow). Pure. */
const pinLost = (base, cur) => (base || []).filter((r) => !(cur || []).includes(r));
let CAPK = null; try { CAPK = require(path.join(__dirname, '..', '..', 'js', 'modules', 'sheet', 'role-capacity.js')); } catch (e) { CAPK = null; }
const declOf = (role) => (CAPK && role ? CAPK.roleCapacity(String(role).split(' ')[0]) : null);
const atCap = (role, size, pg) => !!(CAPK && role && size && CAPK.atCeiling(String(role).split(' ')[0], size, pg));
const rowFits = (pg) => !!pg && Number.isFinite(pg.rowMm) && pg.rowMm > 0 && pg.whiteMm >= pg.rowMm + (Number.isFinite(pg.gapMm) && pg.gapMm > 0 ? pg.gapMm : 0);
const lastPageBad = (role, pg, pages = 1, fullRows = NaN, size = null) => {
    if (!FIXED_CAP_ROLES.has(role) || !pg) return null;
    // r3: "another row fits" counts only while the page is BELOW its declared ceiling (rows or items at this size)
    if (atCap(role, size, pg)) return null;
    if (pages > 1 && !ONE_PAGE_ROLES.has(role)) return Number.isFinite(fullRows) && fullRows > 0 && Number.isFinite(pg.rows) && pg.rows * 3 < fullRows
        ? `the last of ${pages} pages holds ${pg.rows} row(s) against ${fullRows} on a full page (fewer than one third: PG-23 rebalances the rows across the pages)` : null;
    const gap = Number.isFinite(pg.gapMm) && pg.gapMm > 0 ? ` + ${pg.gapMm.toFixed(1)} mm gap` : '';
    return pg.pct >= 30 && rowFits(pg) ? `${pg.pct} % of the last page body is empty under its last block (${pg.whiteMm.toFixed(1)} mm; its next ${pg.rowMm.toFixed(1)} mm row${gap} fits; limit 30 %): the role fixes its count, so the page must fill${declOf(role) && Number.isFinite(declOf(role)[size]) ? ` (below its declared ${size} ceiling of ${declOf(role)[size]} ${declOf(role).unit})` : ''}${pages > 1 ? ` (and it spills to ${pages} pages: PT-PRE-1 is one page)` : ''}` : null;
};
// Who sets a role's item count (critic eblast r1 F2): a role module with no counts() export deals the TEACHER's count (independent,
// more-practice); a teacher column count (--columns) sets it too. Only a role that fills its own page by counts() is judged by
// CAP-PARITY. src: the role module's text (js/modules/sheet/roles/<role>.js), or null when there is none.
const countSetBy = (src, job) => (!src || !/export\s+(const|function)\s+counts\b/.test(src) ? 'teacher' : job && (job.count || job.cols) ? 'teacher' : 'role');
const roleSrc = (role) => { try { return fs.readFileSync(path.join(__dirname, '..', '..', 'js', 'modules', 'sheet', 'roles', `${role}.js`), 'utf8'); } catch (e) { return null; } };
// the note on a last page that is measured but not judged (F7: banded / fixed-layout roles are not teacher-count roles)
const lastPageNote = (role, src, job) => (FIXED_CAP_ROLES.has(role) ? '' : countSetBy(src, job) === 'teacher'
    ? ' - teacher-count role (PG-23: may end short), measured not judged' : ' - not a fixed-capacity role (PT-ENG-3 banded / fixed layout: the remainder stays blank at the foot), measured not judged');
// CAP-PARITY (same root cause): items a page at L >= ceil(0.7 x items a page at M), for the same skill, role and seed, unless the
// L page is full (its fill measure: no room for another row and its gap). m / l: {items, full} of page 1 at M and at L.
// r3 (critic eblast r2 G1 / G2): with a role, it reads the role's DECLARED capacity - only a role that sets its own count ('role')
// is judged (teacher-count and fixed-layout roles such as scripted-model are not: their L count is not a capacity); an L page AT
// its declared L ceiling passes; the need is capped at the L ceiling (in items). capNotJudged says why a role is not judged.
const capNotJudged = (role) => { const d = declOf(role); if (!d) return 'declares no capacity ceiling (js/modules/sheet/role-capacity.js)';
    return d.by === 'role' ? null : d.by === 'teacher' ? 'the teacher sets the count (PG-23)' : d.by === 'fixed' ? `a fixed layout, not a capacity (${d.cite})` : `capacity by table, not one ceiling (${d.cite})`; };
const capParityBad = (m, l, role = null) => {
    if (!m || !l || !(m.items > 0) || !(l.items >= 0)) return null;
    let need = Math.ceil(0.7 * m.items); let cap = '';
    if (role) {
        if (capNotJudged(role)) return null;
        if (atCap(role, 'L', l)) return null;
        const d = declOf(role);
        if (d.unit === 'items' && d.L < need) { need = d.L; cap = `, capped at the declared L ceiling ${d.L}`; }
    }
    return l.items < need && !l.full ? `${l.items} items a page at L against ${m.items} at M (needs >= ${need} = ceil(0.7 x ${m.items})${cap}), and the L page is not full (another row and its gap fit)${role ? ` and is below its declared L ceiling (${declOf(role).L} ${declOf(role).unit})` : ''}` : null;
};
// The capacity-declaration check (r3 machine check first): every page role a skill in js/modules/redesign-passed.js renders (its
// signed card's offered roles, else DEFAULT_ROLES) declares its ceiling. Returns {roles, gaps}.
// r4 (critic eblast r3 G1, drift): the table restates 8 ceilings the role modules hold as their own constants; the check reads
// each role's OWN constant from its source and fails when the two differ (role, size, both values, file). The role modules are
// not refactored (other lanes own them). ROLE_CONST: role -> the constant's name in js/modules/sheet/roles/<role>.js.
const ROLE_CONST = { 'guided': 'CEILING', 'error-analysis': 'CEILING', 'review': 'CEILING', 'test': 'CEILING', 'true-false': 'CEILING',
    'reason-it': 'ROWS', 'word-problems': 'PER_PAGE', 'mixed-practice': 'MAX_SHELVES' };
/** The {S, M, L} a role source declares as `const NAME = { S: n, M: n, L: n }` (or Object.freeze({...})), or null. Pure. */
const roleConstOf = (src, name) => { const m = new RegExp(`(?:^|\\n)\\s*(?:export\\s+)?const\\s+${name}\\s*=\\s*(?:Object\\.freeze\\(\\s*)?\\{\\s*S:\\s*(\\d+),\\s*M:\\s*(\\d+),\\s*L:\\s*(\\d+)\\s*\\}`).exec(String(src || ''));
    return m ? { S: +m[1], M: +m[2], L: +m[3] } : null; };
/** The drift defects between the table and the role constants. table: {role: {M, L}}; srcOf(role) -> [file, text]. */
function capacityDrift(table, srcOf) {
    const out = [];
    for (const [role, name] of Object.entries(ROLE_CONST)) {
        const [file, src] = srcOf(role); const c = roleConstOf(src, name); const d = table[role];
        if (!c) { out.push(`${role}: ${file} declares no ${name} = { S, M, L } to compare (role-capacity.js copies it)`); continue; }
        if (!d) continue;
        for (const z of ['M', 'L']) if (c[z] !== d[z]) out.push(`${role} ${z}: role-capacity.js says ${d[z]}, ${file} ${name} says ${c[z]}`);
    }
    return out;
}
// `--role-src role=path[,role=path]`: read that role's constant from another file (the backtest's drift fixture)
const ROLE_SRC = Object.fromEntries(((process.argv.includes('--role-src') && process.argv[process.argv.indexOf('--role-src') + 1]) || '').split(',').filter(Boolean).map((x) => x.split('=')));
const roleSrcFile = (role) => { const f = ROLE_SRC[role] ? path.resolve(ROLE_SRC[role]) : path.join(__dirname, '..', '..', 'js', 'modules', 'sheet', 'roles', `${role}.js`);
    let t = null; try { t = fs.readFileSync(f, 'utf8'); } catch (e) { t = null; } return [path.relative(ROOT, f), t]; };
function capacityCheck() {
    const src = fs.readFileSync(path.join(__dirname, '..', '..', 'js', 'modules', 'redesign-passed.js'), 'utf8');
    const ids = [...new Set([...src.matchAll(/^\s*'([a-z0-9_]+:[a-z0-9_]+)',?\s*$/gm)].map((m) => m[1]))];
    const roles = new Set();
    for (const key of ids) {
        let r = null;
        try { const p = JSON.parse(execFileSync(process.execPath, [path.join(__dirname, '..', 'lib', 'ws-card-plan.mjs'), '--skill', key, '--root', ROOT], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }))[0]; if (p && p.cards && p.cards.length && p.roles.length) r = p.roles; } catch (e) { r = null; }
        for (const x of (r || ['independent', 'more-practice', 'guided', 'error-analysis', 'review', 'test', 'true-false', 'reason-it', 'lesson'])) roles.add(x);
    }
    return { ids, roles: [...roles], gaps: CAPK ? [...CAPK.capacityGaps([...roles]), ...capacityDrift(CAPK.ROLE_CAPACITY, roleSrcFile)] : ['js/modules/sheet/role-capacity.js: no declared capacity table'] };
}
// the page-fill measure of every page in scope (browser side): {pct, whiteMm, rowMm, gapMm, rows, items, size}
const measurePageFill = (scope) => [...document.querySelectorAll(scope)].map((pg) => {
    const MM = 96 / 25.4; const size = pg.getAttribute('data-eb-size') || null;
    const gapOf = (el) => { const g = el ? parseFloat(getComputedStyle(el).rowGap) : NaN; return Number.isFinite(g) ? g / MM : 0; };
    // (ONE-ROW, lead ruling R1 / R4a: a page of one row held to its work - layout.oneRowMm, mq-onerow - keeps the ruled strip)
    // (tightened after critic r9: only while the white under it is shorter than its one row - else another row fits)
    const og = pg.querySelector('.ws-grid.mq-onerow');
    if (og) { const b0 = (pg.querySelector('.ws-body') || pg).getBoundingClientRect(); const gr = og.getBoundingClientRect(); if (b0.bottom - gr.bottom < gr.height) return { pct: 0, whiteMm: (b0.bottom - gr.bottom) / MM, rowMm: gr.height / MM, gapMm: gapOf(og), rows: 1, items: pg.querySelectorAll('.ws-grid.mq-onerow > [data-ws-cell]').length || 1, size }; }
    const body = pg.querySelector('.ws-body') || pg; const br = body.getBoundingClientRect();
    const kids = [...body.children].filter((x) => x.getBoundingClientRect().height > 0 && !/ws-foot|ws-footer/.test(x.className));
    const last = kids.length ? Math.max(...kids.map((x) => x.getBoundingClientRect().bottom)) : br.top;
    const tops = [...pg.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]') && c.getBoundingClientRect().height > 0);
    const hs = tops.map((c) => c.getBoundingClientRect().height).sort((a, b) => a - b);
    // rows: cells grouped by their top; the gap: next row's top less the row's lowest bottom (median), else the grid's row-gap
    const rows = []; for (const c of tops) { const r = c.getBoundingClientRect(); const row = rows.find((x) => Math.abs(x.top - r.top) < 0.5); if (row) row.bottom = Math.max(row.bottom, r.bottom); else rows.push({ top: r.top, bottom: r.bottom }); }
    rows.sort((a, b) => a.top - b.top);
    const gaps = rows.slice(1).map((r, i) => r.top - rows[i].bottom).filter((g) => g >= 0).sort((a, b) => a - b);
    const gapMm = gaps.length ? gaps[Math.floor(gaps.length / 2)] / MM : gapOf(tops[0] && tops[0].parentElement);
    // (the next row is a ROW - as tall as its tallest cell - not the median cell: on a mixed page the two differ, critic eblast r1 F1;
    // the TALLEST row drawn, so "another row fits" is claimed only when any row of the page would fit again - no false red)
    const rh = rows.map((r) => r.bottom - r.top).sort((a, b) => a - b);
    return { pct: Math.round(Math.max(0, br.bottom - last) / br.height * 100), whiteMm: Math.max(0, br.bottom - last) / MM, rowMm: rh.length ? rh[rh.length - 1] / MM : hs.length ? hs[Math.floor(hs.length / 2)] / MM : NaN, gapMm, rows: rows.length, items: tops.length, size };
});
// EB-GRIDFOOT (opt-in --grid-foot): the verdict on one Test / Review render (null = fine). pages: its page count; whiteMm: the white
// under the grid on its page; rowMm: one row's height (the median cell); cols / indCols: its columns and the Independent page's.
// teacherFootBad: the --columns tolerance (CL-2c): white under the grid over 25 % of the body on a one-page practice / Test / Review.
const teacherFootBad = (role, pages, whiteMm, bodyMm) => (/^(independent|more-practice|test|review)$/.test(role) && pages === 1
    && Number.isFinite(whiteMm) && Number.isFinite(bodyMm) && bodyMm > 0 && whiteMm / bodyMm > 0.25
    ? `${Math.round(whiteMm / bodyMm * 1000) / 10} % of the body white under the grid at the teacher's columns (CL-2c tolerance 25 %)` : null);
const gridFootBad = (role, pages, whiteMm, rowMm, cols, indCols) => ((role === 'test' || role === 'review') && pages === 1
    && Number.isFinite(whiteMm) && Number.isFinite(rowMm) && rowMm > 0 && whiteMm > rowMm + 0.5
    && Number.isFinite(cols) && Number.isFinite(indCols) && cols > indCols
    ? `${Math.round(whiteMm * 10) / 10} mm white under the grid (one row is ${Math.round(rowMm * 10) / 10} mm) in ${cols} columns; the Independent page stands in ${indCols} (use its columns, or fill the page)` : null);
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
const RULES = ['EB-BAND', 'EB-SIDE', 'EB-EDGE', 'EB-SUPBAND', 'MOD-MARKS', 'MOD-LINES', 'MOD-GRID', 'EB-GAP', 'EB-FOOT', 'EB-ROLE', 'EB-READ', 'EB-VOCAB', 'EB-PAGE', 'EB-GDPCAP', 'EB-REFILL', 'EB-PARITY', 'EB-ITEMKEY', 'EB-ITEMPARITY', 'EB-GRIDFOOT', 'EB-STRETCH', 'EB-CLIP', 'TAB-CLEAR', 'EB-LASTPAGE', 'CAP-PARITY'];
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
    // (lf-ops divship merge: its row supband-below-support-multfacts-array is PENDING - the mult_facts array work is parked, lead
    // 2026-11-13; un-exempt when that row goes live)
    'EB-SUPBAND': 'parked with the mult_facts arrays: its backtest row supband-below-support-multfacts-array is pending (lead 2026-11-13)',
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
// EB-STRETCH's tolerance (mm) and its room table, read once from layout.js (rowRoom, below)
const STRETCH_TOL_MM = 1.5;
const STATIC_TOL_MM = 3;
let ROW_ROOM = null;
const STRETCH_ROLES = new Set(['independent', 'more-practice', 'mixed-practice', 'test', 'review', 'lesson', 'opener', 'guided', 'scripted-model', 'error-analysis', 'pre-skill-check']);
const STRETCH_NOTES = [];
if (argv.includes('--pin-check')) {
    // the merge-base with the main branch (or --base <rev>); a base with no list yet has nothing to lose
    const i = argv.indexOf('--base'); let base = i > -1 ? argv[i + 1] : null; let src = null;
    // fail CLOSED (critic eblast r4 P2): a base that cannot be resolved, or whose copy of this file cannot be read, is a FAIL;
    // only a base that resolves to a copy with no EBLAST-BLOCKING markers yet has nothing to lose
    try { if (!base) base = execFileSync('git', ['merge-base', 'HEAD', 'origin/master'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
        src = execFileSync('git', ['show', `${base}:tests/scripts/ws-empty-band.cjs`], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 26 }); } catch (e) {
        console.log(`ws-empty-band --pin-check: FAIL (the base ${base || '(merge-base with origin/master)'} cannot be resolved or read: ${String(e.message || e).split('\n')[0].slice(0, 120)})`); process.exit(1); }
    const fi = argv.indexOf('--file'); const cur = fi > -1 ? blockingOf(fs.readFileSync(path.resolve(argv[fi + 1]), 'utf8')) : EBLAST_BLOCKING_ROLES;
    const lost = pinLost(blockingOf(src), cur);
    for (const r of lost) console.log(`  FAIL EBLAST_BLOCKING_ROLES lost '${r}' (in ${base}; the list may only grow)`);
    console.log(`ws-empty-band --pin-check: ${lost.length ? `FAIL (${lost.length})` : 'OK'} (${(cur || []).length} blocking roles; base ${base || '-'} ${blockingOf(src) ? `has ${blockingOf(src).length}` : 'has no list'})`);
    process.exit(lost.length ? 1 : 0);
}
if (argv.includes('--capacity-check')) {
    const r = capacityCheck();
    for (const g of r.gaps) console.log(`  FAIL ${g}`);
    console.log(`ws-empty-band --capacity-check: ${r.gaps.length ? `FAIL (${r.gaps.length})` : 'OK'} (${r.roles.length} roles used by ${r.ids.length} passed skills)`);
    process.exit(r.gaps.length ? 1 : 0);
}
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
    {   // EB-GRIDFOOT: combine Test S on a837b8d4 (4 across, ~45 % white) FAILS; the Independent page's 3 across, or a full page, PASS
        const fc = [['combine Test S, 4 vs 3 across, 110 mm white', gridFootBad('test', 1, 110, 25, 4, 3), true],
            ['3 across like the Independent page', gridFootBad('test', 1, 110, 25, 3, 3), false],
            ['4 across, white under one row', gridFootBad('test', 1, 20, 25, 4, 3), false],
            ['two pages', gridFootBad('review', 2, 110, 25, 4, 3), false], ['independent', gridFootBad('independent', 1, 110, 25, 4, 3), false],
            ['review M, 3 vs 2 across', gridFootBad('review', 1, 60, 30, 3, 2), true]];
        const fbad = fc.filter(([, got, want]) => !!got !== want);
        for (const [n, , want] of fbad) console.log(`self-test FAIL: EB-GRIDFOOT ${n} should ${want ? 'fail' : 'pass'}`);
        const tc = [['compare 2 cols S at 1.2 x, 31 %', teacherFootBad('independent', 1, 79, 255), true], ['compare 2 cols S at 1.3 x, 24 %', teacherFootBad('independent', 1, 61, 255), false],
            ['two pages', teacherFootBad('independent', 2, 120, 255), false], ['guided not judged', teacherFootBad('guided', 1, 120, 255), false]];
        for (const [n, v, want] of tc) if (!!v !== want) fbad.push([n, v, want]);
        for (const [n, , want] of fbad.slice(fc.filter(([, v, w]) => !!v !== w).length)) console.log(`self-test FAIL: EB-GRIDFOOT teacher ${n} should ${want ? 'fail' : 'pass'}`);
        if (fbad.length) { console.log(`ws-empty-band self-test: FAIL (EB-GRIDFOOT)`); process.exit(1); }
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
    {   // EB-LASTPAGE / CAP-PARITY (lf-ops critic cbt r3 F1): the count_by_tables Pre-skill check L (one page, 35 % / 84 mm empty,
        // rows 42 mm; 10 items vs 16 at M) FAILS both; a full page, a teacher-count role, or a foot shorter than its row PASS
        const cbtL = { pct: 35, whiteMm: 84, rowMm: 42 };
        const lc = [['cbt pre-skill-check L one page', !!lastPageBad('pre-skill-check', cbtL), true],
            ['true-false last page 31 %, row fits', !!lastPageBad('true-false', { pct: 31, whiteMm: 70, rowMm: 50 }), true],
            ['test last page 29 %', !!lastPageBad('test', { pct: 29, whiteMm: 70, rowMm: 30 }), false],
            ['reason-it 40 % but the row does not fit', !!lastPageBad('reason-it', { pct: 40, whiteMm: 60, rowMm: 61 }), false],
            ['independent last page ends short (teacher count)', !!lastPageBad('independent', cbtL), false],
            ['no measure', !!lastPageBad('test', null), false],
            ['CAP-PARITY cbt 10 vs 16, L not full', !!capParityBad({ items: 16, full: true }, { items: 10, full: false }), true],
            ['CAP-PARITY 12 vs 16 (= ceil 11.2)', !!capParityBad({ items: 16 }, { items: 12, full: false }), false],
            ['CAP-PARITY 11 vs 16 (< 12)', !!capParityBad({ items: 16 }, { items: 11, full: false }), true],
            ['CAP-PARITY 6 vs 16 but the L page is full', !!capParityBad({ items: 16 }, { items: 6, full: true }), false],
            ['CAP-PARITY no M count', !!capParityBad({ items: 0 }, { items: 3, full: false }), false],
            // r2 (critic eblast r1 F1): the row GAP counts - placevalue:value mixed-practice L, 39.8 mm white, 37.2 mm row, 4 mm gap
            ['F1 white between row and row + gap: no row fits', rowFits({ whiteMm: 39.8, rowMm: 37.2, gapMm: 4 }), false],
            ['F1 white = row + gap/2 (the critic case) is full', rowFits({ whiteMm: 37.2 + 2, rowMm: 37.2, gapMm: 4 }), false],
            ['F1 white = row + gap + 0.1: a row fits', rowFits({ whiteMm: 41.3, rowMm: 37.2, gapMm: 4 }), true],
            ['F1 no gap measured: row alone', rowFits({ whiteMm: 37.3, rowMm: 37.2, gapMm: NaN }), true],
            ['F1 CAP-PARITY pv mixed 10 vs 21, L full with its gap', !!capParityBad({ items: 21 }, { items: 10, full: !rowFits({ whiteMm: 39.8, rowMm: 37.2, gapMm: 4 }) }), false],
            ['F1 EB-LASTPAGE 35 % but white < row + gap', !!lastPageBad('test', { pct: 35, whiteMm: 44, rowMm: 42, gapMm: 4 }), false],
            // r2 F2: who sets the count
            ['F2 no counts() export: teacher count', countSetBy('export function plan() {}', null), 'teacher'],
            ['F2 counts() export: the role fills its page', countSetBy('export const counts = () => ({ main: 20 });', null), 'role'],
            ['F2 teacher columns set the count', countSetBy('export function counts(p, i) {}', { cols: 3 }), 'teacher'],
            ['F2 no role module', countSetBy(null, null), 'teacher'],
            ['F2 independent reads as teacher count (live module)', countSetBy(roleSrc('independent'), {}), 'teacher'],
            ['F2 pre-skill-check reads as role count (live module)', countSetBy(roleSrc('pre-skill-check'), {}), 'role'],
            // r2 F3: PG-23 on a multi-page fixed role; PT-PRE-1 keeps pre-skill-check to one page
            ['F3 test 2 pages, last 2 of 4 rows at 45 %: legal (PG-23)', !!lastPageBad('test', { pct: 45, whiteMm: 107, rowMm: 44, gapMm: 3, rows: 2 }, 2, 4), false],
            ['F3 test 2 pages, last 1 of 4 rows: missed rebalance', !!lastPageBad('test', { pct: 70, whiteMm: 160, rowMm: 44, gapMm: 3, rows: 1 }, 2, 4), true],
            ['F3 test 2 pages, last 1 of 3 rows: exactly one third, legal', !!lastPageBad('test', { pct: 66, whiteMm: 150, rowMm: 44, gapMm: 3, rows: 1 }, 2, 3), false],
            ['F3 pre-skill-check spills, p2 45 %, row fits: FAIL (PT-PRE-1)', !!lastPageBad('pre-skill-check', { pct: 45, whiteMm: 107.2, rowMm: 44.1, gapMm: 3, rows: 2 }, 2, 2), true],
            // r2 F7: the note names the role's kind
            ['F7 review note: banded, not teacher-count', /PT-ENG-3 banded/.test(lastPageNote('review', roleSrc('review'), {})), true],
            ['F7 independent note: teacher count', /teacher-count role \(PG-23/.test(lastPageNote('independent', roleSrc('independent'), {})), true],
            // r3 (critic eblast r2 G1 / G2): the DECLARED ceiling (js/modules/sheet/role-capacity.js, WDS §12.1)
            ['r3 the capacity table loads', !!CAPK, true],
            ['r3 every role used by a passed skill declares its ceiling', capacityCheck().gaps.length, 0],
            ['r3 a role with no declaration is a gap', CAPK ? CAPK.capacityGaps(['no-such-role']).length : 1, 1],
            ['r3 mixed-practice L at 5 rows (its ceiling), a row fits: CAP-PARITY OK', !!capParityBad({ items: 21 }, { items: 10, rows: 5, full: false }, 'mixed-practice'), false],
            ['r3 mixed-practice L at 5 rows: EB-LASTPAGE OK', !!lastPageBad('mixed-practice', { pct: 17, whiteMm: 39.8, rowMm: 37.2, gapMm: 0.5, rows: 5, items: 10 }, 1, 5, 'L'), false],
            ['r3 mixed-practice L at 4 rows (below 5), 10 vs 21: CAP-PARITY FAIL', !!capParityBad({ items: 21 }, { items: 8, rows: 4, full: false }, 'mixed-practice'), true],
            ['r3 pre-skill-check M, 1 of its declared rows used (4 of 20 items), row fits: FAIL', !!lastPageBad('pre-skill-check', { pct: 78, whiteMm: 186, rowMm: 44, gapMm: 3, rows: 1, items: 4 }, 1, 1, 'M'), true],
            ['r3 pre-skill-check L at its 16-item ceiling: EB-LASTPAGE OK', !!lastPageBad('pre-skill-check', { pct: 35, whiteMm: 84, rowMm: 42, gapMm: 3, rows: 4, items: 16 }, 1, 4, 'L'), false],
            ['r3 scripted-model: CAP-PARITY not judged', capNotJudged('scripted-model') !== null && !capParityBad({ items: 10 }, { items: 6, rows: 3, full: false }, 'scripted-model'), true],
            ['r3 independent: CAP-PARITY not judged (teacher count)', /teacher/.test(capNotJudged('independent') || ''), true],
            ['r3 pre-skill-check is judged', capNotJudged('pre-skill-check'), null],
            ['r3 true-false 4 vs 6 at its L ceiling 4: OK', !!capParityBad({ items: 6 }, { items: 4, rows: 2, full: false }, 'true-false'), false],
            ['r3 value pre-skill-check 3 vs 6 (L ceiling 16): FAIL', !!capParityBad({ items: 6 }, { items: 3, rows: 1, full: false }, 'pre-skill-check'), true],
            // r4 (critic eblast r3 G1): the table is compared with each role's own constant
            ['r4 the real tree: no drift', CAPK ? capacityDrift(CAPK.ROLE_CAPACITY, roleSrcFile).length : 1, 0],
            ['r4 planted guided CEILING M 9 vs 8: FAIL naming role, size, values, file', CAPK ? capacityDrift(CAPK.ROLE_CAPACITY, (r) => (r === 'guided' ? ['x/guided.js', 'const CEILING = { S: 10, M: 9, L: 6 };'] : roleSrcFile(r))).join('|') : '', 'guided M: role-capacity.js says 8, x/guided.js CEILING says 9'],
            ['r4 Object.freeze constant read', JSON.stringify(roleConstOf('const MAX_SHELVES = Object.freeze({ S: 9, M: 7, L: 5 });', 'MAX_SHELVES')), '{"S":9,"M":7,"L":5}'],
            // EBLAST-BLOCKING: per-role findings, pinned list
            ['blocking: an allow-listed role red is a finding', eblastMode('test', false), 'finding'],
            ['blocking: pre-skill-check (not listed) red is advisory', eblastMode('pre-skill-check', false), 'advisory'],
            ['blocking: --eblast-block makes every red a finding', eblastMode('pre-skill-check', true), 'finding'],
            ['blocking: a role key with columns reads its role', eblastMode('review cols 3', false), 'finding'],
            ['blocking: pre-skill-check is not seeded', BLOCKING.has('pre-skill-check'), false],
            ['pin: the list reads from its markers', JSON.stringify(blockingOf("// EBLAST-BLOCKING-BEGIN\nconst X = ['test', 'review'];\n// EBLAST-BLOCKING-END")), '["test","review"]'],
            ['pin: removing an entry FAILs', pinLost(['test', 'review'], ['test']).join(), 'review'],
            ['pin: growing is OK', pinLost(['test'], ['test', 'pre-skill-check']).length, 0],
            ['pin: the live source parses to the live list', JSON.stringify(blockingOf(fs.readFileSync(__filename, 'utf8'))), JSON.stringify(EBLAST_BLOCKING_ROLES)],
            ['r4 constant missing: FAIL', CAPK ? capacityDrift(CAPK.ROLE_CAPACITY, (r) => (r === 'test' ? ['x/test.js', 'const OTHER = 1;'] : roleSrcFile(r))).length : 0, 1]];
        const lbad = lc.filter(([, v, w]) => v !== w);
        for (const [n, got, want] of lbad) console.log(`self-test FAIL: ${n}: ${got}, want ${want}`);
        if (lbad.length) { console.log(`ws-empty-band self-test: FAIL (EB-LASTPAGE / CAP-PARITY)`); process.exit(1); }
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
        // EB-STRETCH (lf-engine row cap): a declared template's row over its natural height + room by more than the tolerance fails;
        // at the cap it passes; an undeclared template, a cell beside its Steps, and a short cell beside a taller one in its row pass
        const sc = (h, nat, x) => Object.assign({ page: 1, cell: 1, topPx: 10, hMm: h, natMm: nat, tmpl: 'vocab-match3' }, x || {});
        const R = { 'vocab-match3': 2 };
        const st = [['57 mm row, 50 mm drawn (master Match 3 L)', stretchFindings([sc(57, 50)], R).length, 1], ['52.5 mm row, 50 mm drawn (capped)', stretchFindings([sc(52.5, 50)], R).length, 0],
            ['undeclared template', stretchFindings([sc(57, 50, { tmpl: 'fact' })], R).length, 0], ['beside its Steps', stretchFindings([sc(70, 55, { beside: true })], R).length, 0],
            ['short beside a tall one', stretchFindings([sc(57, 50), sc(57, 56, { cell: 2 })], R).length, 0]];
        // stage 2 (critic rowcap r1 F4): the full table - an UNLISTED template is judged at the default room, an exempt one and a
        // working-space cell are not, and a Guided page is a FAIL, not a note
        const RT = { rooms: { 'vocab-match3': 2 }, exempt: { division: 'LDIV-ROOM' }, def: 3, work: ['word', 'long'] };
        st.push(['unlisted template, default room (57 mm row, 50 drawn)', stretchFindings([sc(57, 50, { tmpl: 'fact' })], RT).length, 1],
            ['unlisted template within the default room (53 mm, 50 drawn)', stretchFindings([sc(53, 50, { tmpl: 'stack' })], RT).length, 0],
            ['exempt template (LDIV-ROOM)', stretchFindings([sc(80, 50, { tmpl: 'division' })], RT).length, 0],
            ['working-space cell (word / long)', stretchFindings([sc(80, 50, { tmpl: 'legacy', workSpace: true })], RT).length, 0],
            ['a row holding an exempt cell', stretchFindings([sc(80, 50, { tmpl: 'fact' }), sc(80, 78, { tmpl: 'division', cell: 2 })], RT).length, 0]);
        { const got = []; const n0 = STRETCH_NOTES.length; ROW_ROOM = RT; judge([sc(70, 50, { tmpl: 'fact' })], 't', (rule) => got.push(rule), 'guided'); ROW_ROOM = null;
            st.push(['Guided over the cap: FAIL, not a note', got.filter((r) => r === 'EB-STRETCH').length + (STRETCH_NOTES.length - n0), 1]); }
        // EB-CLIP / TAB-CLEAR (critic rowcap-s2 F1-F3): ink past or on the row's rule fails, 0.5 mm clear passes; a legacy cell is
        // judged too; a tab 0.4 mm from its text fails, 2.5 mm passes, an across fact needs 1 mm
        const ct = (x) => { const got = []; clipTabFindings([Object.assign({ page: 1, cell: 1, hMm: 40, tmpl: 'word-work' }, x)], 't', (r) => got.push(r)); return got.join(','); };
        st.push(['EB-CLIP ink 2 mm past the rule', ct({ inkFootMm: -2 }) === 'EB-CLIP' ? 1 : 0, 1], ['EB-CLIP ink 0.2 mm above', ct({ inkFootMm: 0.2 }) === 'EB-CLIP' ? 1 : 0, 1],
            ['EB-CLIP 0.6 mm clear', ct({ inkFootMm: 0.6 }) ? 1 : 0, 0], ['EB-CLIP a legacy cell is judged', ct({ inkFootMm: -1, tmpl: 'legacy' }) === 'EB-CLIP' ? 1 : 0, 1],
            ['TAB-CLEAR text 0.4 mm', ct({ inkFootMm: 3, tabGapMm: 0.4, tabNeed: 2, tabOnText: true }) === 'TAB-CLEAR' ? 1 : 0, 1], ['TAB-CLEAR text 1.6 mm', ct({ inkFootMm: 3, tabGapMm: 1.6, tabNeed: 2, tabOnText: true }) === 'TAB-CLEAR' ? 1 : 0, 1],
            ['TAB-CLEAR text 2.5 mm', ct({ inkFootMm: 3, tabGapMm: 2.5, tabNeed: 2, tabOnText: true }) ? 1 : 0, 0], ['TAB-CLEAR across fact 1.2 mm', ct({ inkFootMm: 3, tabGapMm: 1.2, tabNeed: 1, tabOnText: true }) ? 1 : 0, 0],
            ['TAB-CLEAR a box 1.3 mm (CL-40)', ct({ inkFootMm: 3, tabGapMm: 1.3, tabNeed: 2 }) ? 1 : 0, 0], ['TAB-CLEAR a box touching', ct({ inkFootMm: 3, tabGapMm: 0, tabNeed: 2 }) === 'TAB-CLEAR' ? 1 : 0, 1]);
        const sbad = st.filter(([, got, want]) => got !== want);
        for (const [nm, got, want] of sbad) console.log(`self-test FAIL: EB-STRETCH ${nm}: ${got} finding(s), want ${want}`);
        const n = bad.length + kbad.length + cbad.length + sbad.length;
        console.log(`ws-empty-band self-test: ${n ? "FAIL" : "OK"} (EB-STRETCH ${st.length}; ${cases.length} EB-GDPCAP + 6 PT-MOD-3 + 6 EB-GAP + 6 EB-GRIDFOOT + 4 teacher-columns cases; EB-FOOT pairing 21 + columns 3; ebitem / slot-ink notes 13; ebItemOf ${kc.length}; EB-BAND centred ${cc.length}; EB-LASTPAGE 6 + CAP-PARITY 5; r2 gap 6 + count 6 + PG-23 4 + notes 2; r3 declared ceilings 13; r4 drift 4; blocking 5 + pin 4)`);
        process.exit(n ? 1 : 0);
    }).catch((e) => { console.log(`self-test FAIL: cannot import the sheet kit (${e.message})`); console.log('ws-empty-band self-test: FAIL'); process.exit(1); });
    return;
}
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const SKILLS = (arg('skill', '') || arg('skills', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
const HTML = arg('html', null);
if (require.main === module && !HTML && !arg('judge-fixture', null) && (!SKILLS.length || SKILLS.some((s) => !s.includes(':')))) { console.log('usage: ws-empty-band.cjs --skill cat:skill[,cat:skill] [--roles r,..] [--sizes S,M,L] [--hosts card,worksheet,quiz|none] [--variants 6] [--opts json] [--seed 7] [--json f] [--report-only]'); console.log('ws-empty-band: FAIL (usage)'); process.exit(2); }
const SIZES = (arg('sizes', 'M,L')).split(',').map((s) => s.trim()).filter(Boolean); // owner 2026-11-13: sizes M and L (S dropped; an explicit S still runs)
const HOSTS = arg('hosts', 'card,worksheet,quiz') === 'none' ? [] : arg('hosts', 'card,worksheet,quiz').split(',').map((s) => s.trim());
const SEED = parseInt(arg('seed', '7'), 10);
const NVAR = parseInt(arg('variants', '6'), 10);
const OPTS = arg('opts', null) ? JSON.parse(arg('opts')) : null;
// --columns N: the teacher's column count (buildSheet section `columns`) on every role render (lead ruling 2026-11-13, CL-2c)
const TCOLS = arg('columns', null) ? Number(arg('columns')) : null;
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
            const inks = [];   // each ink box (for EB-SUPBAND: the gap under the support drawing, and what stands beside it)
            // the support array drawing (÷ frame or × array): its bottom edge, so EB-SUPBAND can read the band below IT (D4)
            const supSvg = [...c.querySelectorAll('[data-ws-support-on] svg, [data-ws-supports] svg, .ws-support svg')].find((v) => /rows? of \d+|^no dots$/.test(v.getAttribute('aria-label') || ''));
            const take = (r) => { if (!r.width || !r.height) return; rects.push({ t: r.top, b: r.bottom }); inks.push({ t: r.top, b: r.bottom, l: r.left, r: r.right, sup: !!supSvg }); box = box ? { t: Math.min(box.t, r.top), b: Math.max(box.b, r.bottom), l: Math.min(box.l, r.left), r: Math.max(box.r, r.right) } : { t: r.top, b: r.bottom, l: r.left, r: r.right }; };
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
            // EB-SUPBAND (critic divarray r1 D4): the empty band directly under the support drawing - from its bottom to the
            // nearest ink below it (the answer slot), or to the cell's inner bottom when nothing is below. An unframed × array
            // sat in a cell sized for a 10-12-row one, 36-44 % empty below it, under a slot that EB-BAND counted as the floor.
            // (r2: a support BESIDE ink that runs lower - the fact beside the × band frame - has no empty band under it: the strip
            // under the frame holds the fact's lower rows, and the band under the cell's LAST ink is EB-BAND's)
            let supBelow = null;
            if (supSvg) {
                const sr = supSvg.getBoundingClientRect();
                const own = (r) => r.t >= sr.top - 0.5 && r.b <= sr.bottom + 0.5 && r.l >= sr.left - 0.5 && r.r <= sr.right + 0.5;
                const beside = inks.some((r) => !own(r) && r.t < sr.bottom - 1 && r.b > sr.bottom + 1 && (r.r <= sr.left + 1 || r.l >= sr.right - 1));
                if (sr.height > 0 && beside) supBelow = 0;
                else if (sr.height > 0) {
                    const below = inks.filter((r) => r.t >= sr.bottom - 1);
                    const nextTop = below.length ? Math.min(...below.map((r) => r.t)) : inner.b;
                    supBelow = Math.max(Math.min(nextTop, inner.b) - sr.bottom, 0);
                }
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
            // EB-STRETCH: the cell's NATURAL height - what it draws with no row stretch: a copy laid out of the grid's flow (the grid's
            // own classes kept, so the kit's selectors still match) at the cell's width, its height and its grid row released
            let natMm = null;
            try {
                const g = c.parentElement; const host = g.cloneNode(false);
                host.removeAttribute('style'); host.style.cssText = `position:absolute;left:0;top:0;visibility:hidden;display:block;height:auto;width:${cr.width}px`;
                const k = c.cloneNode(true); k.removeAttribute('data-eb-i');
                k.style.height = 'auto'; k.style.minHeight = '0'; k.style.maxHeight = 'none'; k.style.width = `${cr.width}px`; k.style.flex = 'none';
                host.appendChild(k); g.parentElement.appendChild(host);
                natMm = +(k.getBoundingClientRect().height / MM).toFixed(1); host.remove();
            } catch (e) { natMm = null; }
            // (a cell whose grid shares its row with content that is not a kit cell - the Opener's Model beside its Steps - is sized
            // by that content: EB-STRETCH does not judge it, `beside`)
            let beside = false;
            try {
                // (any ancestor under the page body that lays its children ACROSS, with a branch beside the cell's that holds no kit cell)
                for (let br = c.parentElement, up = br && br.parentElement; up && !beside && !up.matches('.ws-body, .ws-page, body'); br = up, up = up.parentElement) {
                    const rs = getComputedStyle(up);
                    const across = (/grid/.test(rs.display) && (rs.gridTemplateColumns || '').trim().split(/\s+/).length > 1) || (/flex/.test(rs.display) && !/column/.test(rs.flexDirection));
                    beside = across && [...up.children].some((k) => k !== br && !k.querySelector('[data-ws-cell]') && k.getBoundingClientRect().height > 0 && (k.textContent || '').trim().length > 0);
                }
            } catch (e) { beside = false; }
            // EB-CLIP (critic rowcap-s2 F1 / F2): how far the cell's lowest ink ends ABOVE its row's rule (the cell's outer foot), in mm -
            // negative when the ink runs past it (clipped by the cell, or onto the next band); the ink box is the DOM's, so a clipped frame
            // still reports its full rect
            const inkFootMm = +((cr.bottom - box.b) / MM).toFixed(2);
            // TAB-CLEAR (critic rowcap-s2 F3; the ws-lesson-samples rule on every role): the item-number tab's gap to the nearest ink of
            // its cell (text from its glyphs' ink top, a slot, a bordered box, an SVG shape), mm; an across fact keeps CL-40's 1 mm
            let tabGapMm = null, tabWhat = '', tabNeed = 2, tabText2 = false;
            const tabEl = c.querySelector(':scope > [data-ws-label]');
            if (tabEl && tabEl.getBoundingClientRect().width) {
                const t = tabEl.getBoundingClientRect(); let best = Infinity;
                for (const d of c.querySelectorAll('*')) {
                    if (d.closest('[data-ws-label]') || !visible(d)) continue;
                    const st = getComputedStyle(d);
                    let r = d.getBoundingClientRect(); if (!r.width || !r.height) continue;
                    const inSvg = d instanceof SVGElement;
                    if (inSvg && !/^(rect|line|path|circle|ellipse|polygon|polyline|text)$/i.test(d.tagName)) continue;
                    const text = !inSvg && [...d.childNodes].some((x) => x.nodeType === 3 && x.textContent.trim());
                    const leaf = inSvg || /^(img)$/i.test(d.tagName) || d.hasAttribute('data-ws-slot');
                    const bordered = !inSvg && (parseFloat(st.borderTopWidth) || parseFloat(st.borderBottomWidth) || parseFloat(st.borderLeftWidth));
                    if (!text && !leaf && !bordered) continue;
                    if (text && !bordered) { const rg = document.createRange(); rg.selectNodeContents(d); const q = [...rg.getClientRects()].filter((x) => x.width && x.height);
                        if (q.length) r = { left: Math.min(...q.map((x) => x.left)), right: Math.max(...q.map((x) => x.right)), top: Math.min(...q.map((x) => x.top)), bottom: Math.max(...q.map((x) => x.bottom)) }; }
                    let top = r.top;
                    if (text && !bordered) { const cv = (measureCells.cv = measureCells.cv || document.createElement('canvas').getContext('2d')); cv.font = `${st.fontStyle} ${st.fontWeight} ${st.fontSize} ${st.fontFamily}`;
                        const mt = cv.measureText(d.textContent.trim()); top = r.top + Math.max(0, (mt.fontBoundingBoxAscent || 0) - (mt.actualBoundingBoxAscent || 0)); }
                    const dx = Math.max(0, r.left - t.right, t.left - r.right), dy = Math.max(0, top - t.bottom, t.top - r.bottom);
                    const gap = Math.hypot(dx, dy) / MM;
                    if (gap < best) { best = gap; tabWhat = text ? `"${d.textContent.trim().slice(0, 16)}"` : d.tagName.toLowerCase(); tabText2 = !!text && !bordered; }
                }
                if (Number.isFinite(best)) { tabGapMm = +best.toFixed(2); tabNeed = c.querySelector(':scope > .ws-eq[data-ws-across]') ? 1 : 2; }
            }
            out.push({ page: pi + 1, cell: ci + 1, label, padMm, centreMm, natMm, beside, factGrid: !!c.closest('.ws-grid.facts'), inkFootMm, tabGapMm, tabWhat, tabNeed, tabOnText: tabText2, tabText: tabEl ? tabEl.textContent.trim() : '', hMm: +(cr.height / MM).toFixed(1), wMm: +(cr.width / MM).toFixed(1),
                innerMm: H / MM, belowMm: below / MM, aboveMm: above / MM, betweenMm: between / MM, sideMm: side / MM, innerW: W / MM, hRaw: cr.height / MM, edgeMm: +(edge / MM).toFixed(1),
                // EB-FOOT without the centring offset (lf-ops-props 2026-11-13, accepted by lf-checks): a cell whose content is CENTRED
                // in a taller row shares that free space out above its first block; it is not drawn height (EB-BAND still judges it)
                neededMm: +((c.matches('.ws-rowstretch') && c.querySelector(':scope > [data-ws-stretchmid]')
                    // (CL-4d, lead 2026-11-13: a stretched one-line cell is CENTRED down its box - the white above its line is the row's
                    // stretch, not height it needs: it needs its pads, the tab clearance it draws (::before) and its line's box, as measured)
                    ? (inner.t - cr.top) + (() => { const bs = getComputedStyle(c, '::before'); return bs.content && bs.content !== 'none' ? parseFloat(bs.height) || 0 : 0; })() + c.querySelector(':scope > [data-ws-stretchmid]').getBoundingClientRect().height + (cr.bottom - inner.b)
                    : (box.b - cr.top - (() => { const kids = [...c.children].filter((k) => !k.matches('[data-ws-label], .ws-letter, .ws-tab') && getComputedStyle(k).position !== 'absolute' && k.getBoundingClientRect().height > 0); return /center/.test(cs.justifyContent) && kids.length ? Math.max(0, kids[0].getBoundingClientRect().top - inner.t) : 0; })()) + (cr.bottom - inner.b)) / MM).toFixed(1), topPx: Math.round(cr.top), tmpl,
                supBelowMm: supBelow === null ? null : +(supBelow / MM).toFixed(1),
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
// EB-VOCAB cell (same flag; lf-placevalue checks pass 2026-11-13, critic r5 N-r5-2 / ledger line 21): the lesson's vocabulary CELL
// (.mq-lvocabcell) that grew into the height another part freed - lesson.js capIfEmpty - leaves its white split above AND below
// its ink, which no single-band rule sees (r5: 24 % the larger band, ~43 % in all by the critic's pixel rows). Read to the
// cell's drawn edge (pads included, the critic's convention): white above + below the ink at or over 35 % of the cell fails (r5 38.5 %; the
// lane's lessons on 2026-11-13 at most 32 %, placevalue:value S).
function measureVocabCells(scope) {
    const out = [];
    const MM = 96 / 25.4;
    [...document.querySelectorAll(scope)].forEach((rt, pi) => {
        [...rt.querySelectorAll('.mq-lvocabcell')].forEach((c, i) => {
            const cr = c.getBoundingClientRect(); if (!cr.height) return;
            let t = Infinity, b = -Infinity;
            for (const d of c.querySelectorAll('*')) {
                const ink = [...d.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) || /^(svg|img)$/i.test(d.tagName);
                if (!ink) continue;
                const r = d.getBoundingClientRect(); if (!r.height) continue;
                t = Math.min(t, r.top); b = Math.max(b, r.bottom);
            }
            if (t === Infinity) return;
            out.push({ page: pi + 1, cell: i + 1, hMm: +(cr.height / MM).toFixed(1), aboveMm: +((t - cr.top) / MM).toFixed(1), belowMm: +((cr.bottom - b) / MM).toFixed(1), white: +(((t - cr.top) + (cr.bottom - b)) / cr.height).toFixed(3) });
        });
    });
    return out;
}
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

// EB-STRETCH (lead ruling 2026-11-14, lf-placevalue vocab deploy item (d); lf-engine row-stretch cap): a print row stretches
// only to its DRAWN height plus the template's declared writing room (js/modules/sheet/layout.js ROW_ROOM_MM). A cell of a
// declared template whose height passes the tallest drawn height of its row (its natural height, the cell
// laid out with no row stretch, natMm) plus that room by more than STRETCH_TOL_MM FAILS: the page's spare height was shared into the row (the
// lesson Vocabulary match asked 39.4 mm and got 50.7, the Opener count row 31.7 and got 39.2 / 43.4, the Match 3 practice row
// 46 and got 57.5). The table is read from THIS script's tree, so a commit-pair backtest judges an old render by today's rule.
// Screen hosts are not judged (their card is the app's). Pure: stretchFindings(cells, room, tol).
function rowRoom() {
    if (ROW_ROOM) return ROW_ROOM;
    // (read from the ESM source's frozen literals - stage 2, critic rowcap r1 F4: EVERY template is capped at drawn +
    // ROW_ROOM_DEFAULT_MM unless ROW_ROOM_MM names its own room or ROW_STRETCH_EXEMPT exempts it)
    ROW_ROOM = { rooms: {}, exempt: {}, def: null, work: [] };
    try {
        const src = fs.readFileSync(path.join(__dirname, '..', '..', 'js', 'modules', 'sheet', 'layout.js'), 'utf8');
        const m = /export const ROW_ROOM_MM = Object\.freeze\(\{([^}]*)\}\)/.exec(src);
        if (m) for (const [, k, v] of m[1].matchAll(/'([\w-]+)'\s*:\s*([\d.]+)/g)) ROW_ROOM.rooms[k] = Number(v);
        const d = /export const ROW_ROOM_DEFAULT_MM = ([\d.]+)/.exec(src);
        if (d) ROW_ROOM.def = Number(d[1]);
        const x = /export const ROW_STRETCH_EXEMPT = Object\.freeze\(\{([^\n]*)\}\);/.exec(src);
        if (x) for (const [, k, why] of x[1].matchAll(/'([\w-]+)'\s*:\s*'([^']*)'/g)) ROW_ROOM.exempt[k] = why;
        const w = /export const WORK_SPACE_CLASSES = Object\.freeze\(\[([^\]]*)\]\)/.exec(src);
        if (w) ROW_ROOM.work = [...w[1].matchAll(/'([\w-]+)'/g)].map((k) => k[1]);
    } catch (e) { /* no table: nothing is judged */ }
    return ROW_ROOM;
}
// the room a template gets under table R (mm), or null when it is not judged: R is the layout table ({rooms, exempt, def}) or a
// plain {template: mm} list (the self-test's stage-1 form: only the listed templates)
function roomOf(R, t) {
    const own = (o, k) => !!o && Object.prototype.hasOwnProperty.call(o, k);
    if (!R || !R.rooms) return own(R, t) ? R[t] : null;
    if (own(R.exempt, t)) return null;
    return own(R.rooms, t) ? R.rooms[t] : (Number.isFinite(R.def) ? R.def : null);
}
// EB-CLIP (critic lf-engine-rowcap-s2 F1 / F2, the second side of EB-STRETCH): every print cell's ink - legacy and template-less cells
// included (critic ruling b) - ends at least CLIP_MM above its row's rule; ink past it is clipped by the cell or lies on the next band.
// TAB-CLEAR (F3): a cell's item-number tab stands at least 2 mm (an across fact 1 mm, CL-40) from its ink. Pure: clipTabFindings.
function clipTabFindings(cells, where, F) {
    const CLIP_MM = 0.5;   // (the ink's least clearance over the row's rule, mm; local: the self-test runs before module-level consts)
    for (const c of cells || []) {
        if (!c || c.noInk) continue;
        const at = `${where} p${c.page} cell ${c.label || c.cell}`;
        if (Number.isFinite(c.inkFootMm) && c.inkFootMm < CLIP_MM) F('EB-CLIP', at, `the cell's ink ends ${c.inkFootMm < 0 ? `${(-c.inkFootMm).toFixed(1)} mm PAST` : `${c.inkFootMm.toFixed(1)} mm above`} its row's rule (a ${c.hMm} mm row; at least ${CLIP_MM} mm above): clipped or on the next band [${c.tmpl || 'no template'}]`);
        // (TEXT the pupil reads - a "Sam chose:" tag, a story line - keeps 2 mm (F3); a one-line fact or equation keeps CL-40's 1 mm; a box,
        // frame or drawing may sit in CL-40's 1 mm but never touch the tab)
        const need = c.tabOnText ? ((c.tabNeed === 1 || /^(equation|fact)$/.test(c.tmpl || '')) ? 1 : 2) : 1;
        if (Number.isFinite(c.tabGapMm) && c.tabGapMm < need) F('TAB-CLEAR', at, `the number tab "${c.tabText}" is ${c.tabGapMm.toFixed(1)} mm from ${c.tabWhat} (at least ${need} mm) [${c.tmpl || 'no template'}]`);
    }
}
function stretchFindings(cells, room = rowRoom(), tol = STRETCH_TOL_MM) {
    const out = [];
    // (drawn = the cell's NATURAL height, natMm: the cell laid out with no row stretch - a template that flexes into its row
    // (the Match 3 work, the vocabulary match lines) inks a stretched row, so its ink is not what it asks)
    const live = (cells || []).filter((c) => c && !c.noInk && Number.isFinite(c.natMm) && c.natMm > 0 && Number.isFinite(c.hMm));
    for (const c of live) {
        const rm = roomOf(room, c.tmpl);
        // (a cell whose item is of a working-space class - word / long, WORK_SPACE_CLASSES - keeps its row: c.workSpace)
        // (a `legacy` cell - a skill's old print HTML the kit wraps - is MEASURED taller than it draws (its own text and answer line,
        // pre-skill-check routedLayout), so its natural height is not what the composer sized: noted by judge(), not judged)
        // (a cell of the fact-row engine's grid - .ws-grid.facts, layout.js ROW_STRETCH_EXEMPT_LAYOUTS - is sized by its own FULLPAGE rule)
        // (and a cell with no template - a lesson panel, the I-do box - is no template's row)
        if (rm === null || !c.tmpl || c.beside || c.workSpace || c.tmpl === 'legacy' || c.factGrid) continue;
        // (a Scripted Model's states are ONE drawing at successive steps, laid at one height (MOD-GRID; PT-MOD-3 keeps the room a
        // later mark needs): its "row" is every state cell of the page, the tallest state the drawn height - c.oneHeight)
        const row = live.filter((d) => d.page === c.page && (c.oneHeight || Math.abs((d.topPx || 0) - (c.topPx || 0)) < 2));
        // (a row that also holds an exempt cell is sized by it)
        if (row.some((d) => roomOf(room, d.tmpl) === null || d.workSpace)) continue;
        // (drawn: the larger of what the cell lays out to with no stretch and the bridge's measure + 1 mm, measMm - the height the
        // engine reckons drawn; EB-FOOT keeps that measure honest)
        const need = Math.max(...row.map((d) => Math.max(d.natMm, Number(d.measMm) || 0)));
        const cap = need + Math.max(...row.map((d) => roomOf(room, d.tmpl)));
        // (a row whose cells carry no bridge measure is drawn at its STATIC footprint - the engine's only drawn height for it, held
        // to the drawing within 10 % by EB-FOOT - so it is judged with STATIC_TOL_MM; a measured row with `tol`)
        const t = row.every((d) => Number(d.measMm) > 0) ? tol : Math.max(tol, STATIC_TOL_MM);
        if (c.hMm - cap > t) out.push({ c, need, cap, room: +(cap - need).toFixed(1), over: +(c.hMm - cap).toFixed(1) });
    }
    return out;
}
// EB-STRETCH judges every role whose composer holds its rows to the cap: the grid roles (layout.resolveSectionLayout + the
// practice spread), roles/lesson.js and lesson-pages, roles/opener.js, and (stage 2, critic rowcap r1 F4) the self-built rows of
// Guided, Scripted Model, Error Analysis and Pre-skill check - a FAIL there now, not a note. The roles not yet capped (Reason It,
// True or False, Stretch, Word problems ...) are NOTED with their over-cap cell count.
function judge(cells, where, F, role) {
    if (role === 'scripted-model') for (const c of cells) c.oneHeight = true;
    if (!String(role || '').startsWith('host:')) clipTabFindings(cells, where, F);
    if (process.env.EB_DUMP) for (const c of cells) console.log("DUMP", where, c.page, c.cell, c.tmpl, c.hMm, c.neededMm, c.natMm, c.topPx, c.beside ? 'beside' : '');
    if (!String(role || '').startsWith('host:') && role && !STRETCH_ROLES.has(role)) { const n = stretchFindings(cells).length; if (n) STRETCH_NOTES.push(`${where}: EB-STRETCH not judged on this role yet (its composer sizes its own rows): ${n} cell(s) over the cap`); }
    if (!String(role || '').startsWith('host:')) { const lg = cells.filter((c) => c.tmpl === 'legacy' && Number.isFinite(c.natMm) && c.hMm - c.natMm - 3 > STRETCH_TOL_MM).length; if (lg) STRETCH_NOTES.push(`${where}: EB-STRETCH not judged on ${lg} legacy cell(s) over natural + 3 mm (old print HTML, measured taller than it draws)`); }
    if (!String(role || '').startsWith('host:') && role && !STRETCH_ROLES.has(role)) { /* noted above */ }
    else if (!String(role || '').startsWith('host:')) for (const x of stretchFindings(cells)) F('EB-STRETCH', `${where} p${x.c.page} cell ${x.c.label || x.c.cell}`, `a ${x.c.hMm} mm row holds a cell drawn ${x.need.toFixed(1)} mm: its cap is drawn + ${x.room} mm writing room = ${x.cap.toFixed(1)} mm, ${x.over} mm over (tolerance ${STRETCH_TOL_MM} mm; layout.js ROW_ROOM_MM / ROW_ROOM_DEFAULT_MM) [${x.c.tmpl}]`);
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
        // EB-SUPBAND (critic divarray r1 D4): the band directly UNDER the support drawing (not only under the item) - an
        // unframed × array in a cell sized for a 10-12-row one leaves it empty under a slot EB-BAND counts as the floor.
        if (c.supBelowMm !== null && c.supBelowMm !== undefined && c.supBelowMm >= BAND * c.hMm) F('EB-SUPBAND', `${where} p${c.page} cell ${c.label || c.cell}`, `empty band ${c.supBelowMm} mm under the support drawing of a ${c.hMm} mm cell (${(c.supBelowMm / c.hMm * 100).toFixed(1)} %; limit 30 % = ${(BAND * c.hMm).toFixed(1)} mm) [${c.tmpl}]`);
        if (c.sideMm >= SIDE * c.innerW) F('EB-SIDE', `${where} p${c.page} cell ${c.label || c.cell}`, `${c.tmpl === 'screen-cell' || String(role || '').startsWith('host:') ? 'content pinned to one side: ' : ''}${c.sideMm.toFixed(1)} mm empty beside the ink of a ${c.innerW.toFixed(1)} mm wide cell interior (${(c.sideMm / c.innerW * 100).toFixed(1)} %; limit ${(SIDE * 100).toFixed(0)} %) [${c.tmpl}]`);
    });
}

async function htmlMain() {
    // --html honours --only, --json and --report-only as a --skill run does (critic eb-r3 m3)
    const findings = []; const F = (rule, where, msg) => { if (!ONLY || ONLY.includes(rule)) findings.push({ rule, where, msg }); };
    // EBLAST-ADVISORY (lead 2026-11-20, critic eblast r2: false reds on passed skills): EB-LASTPAGE and CAP-PARITY REPORT only
    // (printed, never blocking) until critic r3 passes the rebuilt rules; --eblast-block makes them findings (backtest rows)
    const FA = (rule, where, msg, role) => { if (eblastMode(role, has('eblast-block')) === 'finding') return F(rule, where, msg); if (!ONLY || ONLY.includes(rule)) console.log(`  ADVISORY (not critic-passed) ${rule} ${where}: ${msg}`); };
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
        // EB-LASTPAGE / CAP-PARITY on a fixture (critic eblast r1 F4): <meta name="eb-role" content="..."> names the role; pages
        // carry data-eb-size="M" / "L" (one group when none); each group's last page is judged, M against L for parity
        if (has('page-fill') && !screen) {
            const role = (/<meta name="eb-role" content="([^"]+)"/.exec(src) || [])[1] || arg('role', null);
            const groups = {}; for (const p of await sh.evaluate(measurePageFill, scope)) (groups[p.size || '-'] = groups[p.size || '-'] || []).push(p);
            for (const [z, pf] of Object.entries(groups)) {
                const why = lastPageBad(role, pf[pf.length - 1], pf.length, pf[0].rows, z === '-' ? null : z);
                if (why) FA('EB-LASTPAGE', `${path.basename(HTML)} ${role} ${z} p${pf.length}`, why, role);
            }
            if (groups.M && groups.L) { const by = countSetBy(roleSrc(role), null);
                const why = by === 'role' ? capParityBad({ items: groups.M[0].items, rows: groups.M[0].rows, full: !rowFits(groups.M[0]) }, { items: groups.L[0].items, rows: groups.L[0].rows, full: !rowFits(groups.L[0]) }, role) : null;
                if (why) FA('CAP-PARITY', `${path.basename(HTML)} ${role} M/L`, why, role); }
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
    // EBLAST-ADVISORY (lead 2026-11-20, critic eblast r2: false reds on passed skills): EB-LASTPAGE and CAP-PARITY REPORT only
    // (printed, never blocking) until critic r3 passes the rebuilt rules; --eblast-block makes them findings (backtest rows)
    const FA = (rule, where, msg, role) => { if (eblastMode(role, has('eblast-block')) === 'finding') return F(rule, where, msg); if (!ONLY || ONLY.includes(rule)) console.log(`  ADVISORY (not critic-passed) ${rule} ${where}: ${msg}`); };
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
            const jobs = []; const capRec = {};
            for (const role of plan.roles) for (const size of SIZES) jobs.push({ role, size, opts: OPTS, cols: TCOLS, tag: `${role} ${size}${TCOLS ? ` cols ${TCOLS}` : ''}` });
            const vSize = ['L', 'M'].find((z) => SIZES.includes(z)) || SIZES[0];
            if (arg('roles', null) !== 'none') for (const v of variants) jobs.push({ role: 'independent', size: vSize, opts: Object.assign({}, OPTS || {}, v.opts), tag: `independent ${vSize} {${v.option}: ${v.value}}` });
            if (!plan.cards.length) notes.push(`${key}: no signed card - EB-ROLE not judged (default roles)`);
            notes.push(`${key}: slot ink ${SLOT_INK ? 'on' : 'off'}; card ${plan.cards.join(', ') || '(none: default roles)'}; ${plan.roles.length} roles x ${SIZES.join('/')} + ${variants.length} option variant(s) of ${vlist.length} + hosts ${HOSTS.join(', ') || 'none'}`);
            for (const j of jobs) {
                const grid = GRID_ROLES.has(j.role);
                const b = await page.evaluate(async ({ categoryId, skillId, j, SEED, grid }) => {
                    try {
                        // a grid role is built with its key (EB-ITEMKEY) and a second time with no data-eb-item tags (EB-ITEMPARITY)
                        const req = { role: j.role, sections: [Object.assign({ skills: [Object.assign({ categoryId, skillId }, j.opts ? { opts: j.opts } : {})] }, j.cols ? { columns: j.cols } : {})], size: j.size, paper: 'A4', seed: SEED, key: grid };
                        const r = await window.buildSheet(req);
                        const plain = grid ? await window.buildSheet(Object.assign({}, req, { ebItem: false })) : null;
                        const cols = r.plan && r.plan.meta && r.plan.meta.fits && r.plan.meta.fits[0] ? r.plan.meta.fits[0].cols : null;
                        const sections = new Set((r.items || []).map((it) => it.section)).size;
                        const tries = r.plan && r.plan.meta ? Number(r.plan.meta.scoreOutOf) : NaN;
                        return { html: window.sheetDocument(r.pupilHtml, r.title || 'x', { paper: 'A4' }), keyDoc: r.keyHtml ? window.sheetDocument(r.keyHtml, (r.title || 'x') + ' key', { paper: 'A4' }) : null, pupilHtml: grid ? r.pupilHtml : null, keyHtml: grid ? r.keyHtml : null, plainPupil: plain ? plain.pupilHtml : null, plainKey: plain ? plain.keyHtml : null, cols, sections, tries, fclass: (r.items || []).map((it) => (it && it.fclass) || ''), measured: (r.items || []).map((it) => (it.measured ? Object.fromEntries(Object.entries(it.measured).map(([k, v]) => [k, v && v.hMm])) : null)) };
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
                    // (EB-STRETCH: a cell whose item is of a working-space class - layout WORK_SPACE_CLASSES - keeps its row)
                    for (const c of cells) if ((c.items && c.items.length ? c.items : [c.item]).some((i) => i >= 0 && rowRoom().work.includes((b.fclass || [])[i]))) c.workSpace = true;
                    // (EB-STRETCH: the bridge's MEASURE of the cell's item at its grid's columns - the height the engine reckons drawn
                    // (layout.drawnRowMm: the measure + 1 mm); EB-FOOT holds that measure to the drawn height within 10 %)
                    for (const c of cells) { const ids = c.items && c.items.length ? c.items : [c.item]; const k = footCols(c, cells); const ms = ids.map((i) => (i >= 0 && b.measured && b.measured[i] ? Number(b.measured[i][k]) : NaN)); if (ms.length && ms.every((x) => x > 0)) c.measMm = Math.max(...ms) + 1; }
                    judge(cells, `${key} ${j.tag}`, F, j.role);
                    // EB-CLIP / TAB-CLEAR on the KEY too (critic rowcap-s2 F3: the tab covered the text on the pupil page AND the key)
                    if (b.keyDoc && !has('no-key-clip')) {
                        const kp = await app.browser.newPage();
                        try {
                            await kp.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
                            await kp.goto(page.url(), { waitUntil: 'domcontentloaded' });
                            await kp.setContent(b.keyDoc, { waitUntil: 'networkidle0', timeout: 60000 });
                            await kp.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', { timeout: 15000 }).catch(() => {});
                            await kp.emulateMediaType('print');
                            clipTabFindings(await kp.evaluate(measureCells, 'body > section.ws-page, body > .ws-page'), `${key} ${j.tag} key`, F);
                        } finally { await kp.close(); }
                    }
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
                    // EB-REFILL (GUIDED-TIGHT-REFILL, lf-roles critic r8b D1): a one-page Guided page under its §12.1 tries ceiling leaves
                    // white under its grid of at least one drawn row of tries (the grid's last row) - the fit counted rows at a taller
                    // height than the page draws them (tight rows held to their ink AFTER the fit), so more tries fit and were never dealt.
                    // White under a page AT the ceiling is accepted (PT-ENG-3), as is white under a Guided page in general (EB-PAGE note).
                    if (j.role === 'guided' && GDP_CAP[j.size] != null && Number.isFinite(b.tries) && b.tries < GDP_CAP[j.size]) {
                        const rf = await sh.evaluate((scope) => {
                            const mm = 96 / 25.4;
                            const pgs = [...document.querySelectorAll(scope)];
                            if (pgs.length !== 1) return null;
                            const body = pgs[0].querySelector('.ws-body'); const grids = [...pgs[0].querySelectorAll('.ws-grid')];
                            if (!body || !grids.length) return null;
                            const g = grids[grids.length - 1]; const gr = g.getBoundingClientRect();
                            const cells = [...g.children].filter((c) => c.classList.contains('ws-cell') && !c.classList.contains('blankrun'));
                            const lastTop = Math.max(...cells.map((c) => c.getBoundingClientRect().top));
                            const row = cells.filter((c) => Math.abs(c.getBoundingClientRect().top - lastTop) < 0.5).map((c) => c.getBoundingClientRect().height);
                            return { spare: (body.getBoundingClientRect().bottom - gr.bottom) / mm, row: Math.max(...row) / mm };
                        }, 'body > section.ws-page, body > .ws-page');
                        // (a row adds `cols` tries: only a page the next whole row keeps within the ceiling can be refilled - a 4-column fact
                        // page at 5 of 6 is trimmed to whole rows, not under-filled)
                        if (rf && rf.spare >= rf.row && b.tries + Math.max(1, Number(b.cols) || 1) <= GDP_CAP[j.size]) F('EB-REFILL', `${key} ${j.tag}`, `${rf.spare.toFixed(1)} mm white under the grid holds another ${rf.row.toFixed(1)} mm row of tries, but the page prints ${b.tries} of the ${GDP_CAP[j.size]} the ceiling allows (the fit counted rows taller than they are drawn)`);
                    }
                    // (Guided is exempt from EB-PAGE: lead ruling 2026-11-12, PT-GDP / PAGE_TYPES §12.1 - white under its grid is accepted)
                    if (has('page-fill') && j.role !== 'guided') {
                        const pf = await sh.evaluate(measurePageFill, 'body > section.ws-page, body > .ws-page');
                        pf.slice(0, -1).forEach((v, i) => { if (v.pct >= 30) F('EB-PAGE', `${key} ${j.tag} p${i + 1}`, `${v.pct} % of the page body is empty under its last block (not the last page; limit 30 %)`); });
                        // EB-LASTPAGE (critic cbt r3 F1): the last (or only) page is measured too - judged on a fixed-capacity role
                        if (pf.length) {
                            const lp = pf[pf.length - 1]; const why = lastPageBad(j.role, lp, pf.length, pf[0].rows, j.size);
                            if (why) FA('EB-LASTPAGE', `${key} ${j.tag} p${pf.length}`, why, j.role);
                            else notes.push(`${key} ${j.tag} EB-LASTPAGE p${pf.length}/${pf.length}: ${lp.pct} % empty (${lp.whiteMm.toFixed(1)} mm, row ${Number.isFinite(lp.rowMm) ? lp.rowMm.toFixed(1) : '-'} mm, gap ${Number.isFinite(lp.gapMm) ? lp.gapMm.toFixed(1) : '-'} mm, ${lp.rows} row(s) of ${pf[0].rows} on p1)${lastPageNote(j.role, roleSrc(j.role), j)}`);
                        }
                        // CAP-PARITY: page 1's items and fill, per role and size (judged after the skill's jobs)
                        if (pf.length && !j.tag.includes('{')) capRec[`${j.role}${j.cols ? ` cols ${j.cols}` : ''}`] = Object.assign(capRec[`${j.role}${j.cols ? ` cols ${j.cols}` : ''}`] || {}, { [j.size]: { items: pf[0].items, rows: pf[0].rows, full: !rowFits(pf[0]), pages: pf.length, by: countSetBy(roleSrc(j.role), j) } });
                    }
                    if (has('grid-foot') && (j.cols ? /^(independent|more-practice|test|review)$/.test(j.role) : (j.role === 'test' || j.role === 'review')) && (!arg('rule-skills', null) || arg('rule-skills').split(',').includes(key))) {
                        const gf = await sh.evaluate((scope) => {
                            const MM = 96 / 25.4;
                            const pgs = [...document.querySelectorAll(scope)];
                            const pg = pgs[0]; if (!pg) return { pages: 0 };
                            const body = pg.querySelector('.ws-body') || pg; const br = body.getBoundingClientRect();
                            const kids = [...body.children].filter((x) => x.getBoundingClientRect().height > 0 && !/ws-foot|ws-footer/.test(x.className));
                            const last = kids.length ? Math.max(...kids.map((x) => x.getBoundingClientRect().bottom)) : br.top;
                            const hs = [...pg.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]')).map((c) => c.getBoundingClientRect().height).filter((h) => h > 0).sort((a, b) => a - b);
                            return { pages: pgs.length, bodyMm: br.height / MM, whiteMm: Math.max(0, br.bottom - last) / MM, rowMm: hs.length ? hs[Math.floor(hs.length / 2)] / MM : NaN };
                        }, 'body > section.ws-page, body > .ws-page');
                        if (j.cols) { const why = teacherFootBad(j.role, gf.pages, gf.whiteMm, gf.bodyMm); if (why) F('EB-GRIDFOOT', `${key} ${j.tag} p1`, why); }
                        else if (gf.pages === 1 && gf.whiteMm > gf.rowMm + 0.5) {
                            const ind = await page.evaluate(async ({ categoryId, skillId, j, SEED }) => {
                                try {
                                    const r = await window.buildSheet({ role: 'independent', sections: [{ skills: [Object.assign({ categoryId, skillId }, j.opts ? { opts: j.opts } : {})] }], size: j.size, paper: 'A4', seed: SEED, key: false });
                                    return r.plan && r.plan.meta && r.plan.meta.fits && r.plan.meta.fits[0] ? r.plan.meta.fits[0].cols : null;
                                } catch (e) { return null; }
                            }, { categoryId, skillId, j, SEED });
                            const why = gridFootBad(j.role, gf.pages, gf.whiteMm, gf.rowMm, Number(b.cols), Number(ind));
                            if (why) F('EB-GRIDFOOT', `${key} ${j.tag} p1`, why);
                        }
                    }
                    // (`--rule-skills a:b,...`, ws-precritic opt-in: the opt-in rule judges only the opted-in lane's skills)
                    if (has('vocab-ink') && (!arg('rule-skills', null) || arg('rule-skills').split(',').includes(key))) for (const v of await sh.evaluate(measureVocab, 'body > section.ws-page, body > .ws-page')) {
                        if (v.fillH < 0.7 || v.fillW < 0.7) F('EB-VOCAB', `${key} ${j.tag} p${v.page} vocab picture ${v.pic}`, `the drawing fills ${Math.round(v.fillH * 100)} % of its ${v.hMm} mm picture box up and down, ${Math.round(v.fillW * 100)} % across (limit 70 %)`);
                    }
                    if (has('vocab-ink') && (!arg('rule-skills', null) || arg('rule-skills').split(',').includes(key))) for (const v of await sh.evaluate(measureVocabCells, 'body > section.ws-page, body > .ws-page')) {
                        if (v.white >= 0.35) F('EB-VOCAB', `${key} ${j.tag} p${v.page} vocab cell ${v.cell}`, `${Math.round(v.white * 100)} % of the ${v.hMm} mm vocabulary cell is white above (${v.aboveMm} mm) and below (${v.belowMm} mm) its ink, to its drawn edge (limit 35 %: the cell grew into freed height, critic r5 N-r5-2)`);
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
            // CAP-PARITY (lf-ops critic cbt r3 F1): items a page at L >= ceil(0.7 x M) unless the L page is full; the counts are reported
            for (const [rk, z] of Object.entries(capRec)) if (z.M && z.L) {
                if (z.M.by === 'teacher' || z.L.by === 'teacher') { notes.push(`${key} ${rk} CAP-PARITY not judged: the teacher sets the count (M ${z.M.items}/page, L ${z.L.items}/page)`); continue; }
                { const nj = capNotJudged(rk); if (nj) { notes.push(`${key} ${rk} CAP-PARITY not judged: ${nj} (M ${z.M.items}/page, L ${z.L.items}/page)`); continue; } }
                if (atCap(rk, 'L', z.L)) { notes.push(`${key} ${rk} CAP-PARITY: L at its declared ceiling (${declOf(rk).L} ${declOf(rk).unit}; M ${z.M.items}/page, L ${z.L.items}/page) - OK`); continue; }
                const why = capParityBad(z.M, z.L, rk);
                if (why) FA('CAP-PARITY', `${key} ${rk} M/L`, why, rk);
                else notes.push(`${key} ${rk} CAP-PARITY: M ${z.M.items}/page, L ${z.L.items}/page${z.L.full ? ' (L page full)' : ''} - OK`);
            }
            // screen hosts
            // owner 2026-11-13: no phone width; the card at the computer / Chromebook and tablet widths (--widths overrides)
            const widths = { card: SW.widthsArg(process.argv), worksheet: [1280], quiz: [1280] };
            // every host at the skill's defaults AND at each sampled option variant (lf-checks hosts lane 2026-11-12: unit_form's
            // worksheet band appeared only at rename=more, an option no host run had rendered)
            const hostOpts = [{ tag: '', opts: OPTS }, ...variants.map((v) => ({ tag: ` {${v.option}: ${v.value}}`, opts: Object.assign({}, OPTS || {}, v.opts) }))];
            for (const ho of hostOpts) for (const host of HOSTS) for (const w of widths[host] || []) {
                await page.setViewport({ width: w, height: w < 500 ? 844 : (w === 1366 || w === 1024) ? 768 : 900, deviceScaleFactor: 1 });
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
    for (const n of STRETCH_NOTES) console.log(`note: ${n}`);
    for (const r of rules) { const f = findings.filter((x) => x.rule === r); console.log(`${r.padEnd(8)} ${f.length ? `FAIL ${f.length}` : 'PASS'}`); for (const x of f.slice(0, process.env.EB_ALL ? 1e9 : 15)) console.log(`   ${x.where}: ${x.msg}`); if (f.length > 15) console.log(`   ... ${f.length - 15} more`); }
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
module.exports = { measureCells, judge, stretchFindings };
