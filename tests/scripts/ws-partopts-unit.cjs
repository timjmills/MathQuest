#!/usr/bin/env node
// ws-partopts-unit — the gate of lane lf-partopts (design/partopts/DESIGN.md §5): the per-part "how many" of a lesson.
//
//   node tests/scripts/ws-partopts-unit.cjs --unit                 # PO-4 + the pure half of PO-2 (no browser, < 1 s)
//   node tests/scripts/ws-partopts-unit.cjs                        # PO-2: every live lesson x M / L at each part's min and max
//   node tests/scripts/ws-partopts-unit.cjs --full 3               #   ... plus EVERY offered value for the first 3 lessons
//   node tests/scripts/ws-partopts-unit.cjs --lessons addition:add_facts --sizes L --parts practice
//
// PO-4 (unit, + critic A r3 R2: a snapped count's note - "half full" only between two offered values): normalizePartOpts clamps min - 1 and max + 1 into the range and drops every default (a standard lesson stores
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
//   EB-ROWFIT / PO-NOROOM (A r2 N1, A r3): the printed foot vs one row of the problems the rows DRAW (the bridge's level-1 twins,
//            res.lesson.teach.indepH; part-opts.js shortestRowMm) plus the page's printed band head, through part-opts.js rowFits -
//            the offer gate's own predicate. A sheet identical to the standard packet's is excused in EB-ROWFIT (master, lf-engine);
//            its rows' TEXT is still judged (no print): "no room" only where no row fits, "the standard sheet is kept" only there.
//   THRESHOLD BACKTESTS (A r3; design/partopts/DESIGN.md §8d - the measured plan-to-print gaps): fixed sheets on both sides of each
//   tuned threshold, so a one-step move FAILS.
//     FILL-BT    SHEET_FILL_MIN 0.76: planner used share reads up to 0.052 fuller than print near the floor (identify M We Do off),
//                so >= 0.752; add_wp_10_plain L (planned 0.762) prints well, so <= 0.762; add_facts M Vocabulary off (0.712,
//                31 % empty) stays refused. 0.75 or 0.77: FAIL.
//     ROWFIT-BT  ROWFIT_SLACK_MM 12: the printed foot reads 1.5-15.9 mm more than the plan's free height; a row fits in print at
//                plan gaps up to 11.4 mm (value M We Do 1: must be refused) and not at 13.5 (combine L rows 0: must be kept).
//                (re-pinned on the lf-partopts deploy merge, 2026-11-13: master's lesson sheets moved the old pair - expand L
//                Remember off 10.2 -> 15.9 mm, its foot no longer holds a row; value L rows 0 13.2 -> 26.4 mm.)
//                10 or 14 mm: FAIL.
//     BAND-BT    BAND_SLACK_MM 2: a planned cell band reads up to 1.0 mm narrower than printed near 30 % (div_facts M Vocabulary +
//                Remember off, 26.8 % planned / 31.4 % printed: must be flagged, needs >= 0.8 mm); div_facts M We Do 1 prints
//                under 30 % (must not be, needs < 2.6 mm). 0 or 3 mm: FAIL.
//   --bt-only runs the backtests alone (21 s); --no-bt skips them; a --lessons run skips them.
//   Sampling is deterministic (seed 4242).
//
// NARROW RUNS (ws-precritic's rows and the backtests, tests/fixtures/precritic/backtests.json rows partopts-*):
//   --lessons a,b      only these lessons: an entry equal to a lesson id (category:skill) takes that lesson (and its "(sample)"
//                      twin); any other entry is a prefix
//   --only ID,...      count only these findings: a check id (PO-2d, EB-ROWFIT, PO-CAP, FILL-BT ...) or a critic tag the
//                      message carries (F6, F7, N4, N6, R2 ...); a build that errors still counts (ERROR)
//   --no-jobs          skip the per-part min / max builds and the combinations (the walk and --state still run)
//   --walk-depth N     the N7 walk's depth (default 3; 0 judges the standard packet's texts only)
//   --state '<json>' / --state-file <file>   build and judge ONE settled state of the parts (partOpts) per lesson x size,
//                      with every check of the walk (PO-2b-d, EB-ROWFIT, EB-ROWFIT+, PO-NOROOM, PO-REM, PO-CAP, PO-VOC)
//   --coverage-only    PO-2e alone: the standard packet of every lesson x size, the floors (about 2 min, no page measured)
//   --gate-rowfit-plus EB-ROWFIT+ (critic A r3 R3) gates the changed sheets; without it the check is REPORT-ONLY
//   MQ_ROOT=<tree>     build, serve and judge another checkout (ws-backtest commit-pair rows): its part-opts.js and its app.
//                      This script and its judges (ws-empty-band, the row / band predicates part-opts.js shares with the
//                      offer gate - filled from this tree when the older engine has none) are always today's.
// Prints `ws-partopts-unit: OK` / `FAIL (n)`; exits 1 on FAIL. A check that could not run (a crash, a build that errors in
// a narrow run, a PO-4 block an older engine cannot answer when that block is asked) prints `ws-partopts-unit: ERROR (...)`
// and exits 2: it has found nothing, so it is never read as a FAIL.
'use strict';
const path = require('path');
const { pathToFileURL } = require('url');

const argv = process.argv.slice(2);
const has = (k) => argv.includes('--' + k);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const HERE = path.resolve(__dirname, '..', '..');
const ROOT = process.env.MQ_ROOT ? path.resolve(process.env.MQ_ROOT) : HERE;
const fails = [];
const errors = [];
const ONLY = arg('only') ? arg('only').split(',').map((x) => x.trim()).filter(Boolean) : null;
const reEsc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** A finding counts when no --only is given, or its id or a tag in its message is listed. */
const counts = (id, msg) => !ONLY || ONLY.some((t) => t === id || new RegExp(`(^|[^\\w-])${reEsc(t)}([^\\w-]|$)`).test(String(msg)));
const F = (id, msg) => { if (counts(id, msg)) fails.push(`${id} ${msg}`); };
/** A build that errored: a finding of PO-2a, and in a narrow run that does not judge PO-2a, a check that could not run. */
const Fbuild = (where, err) => { if (ONLY && !counts('PO-2a', '')) errors.push(`PO-2a ${where}: ${err}`); else F('PO-2a', `${where}: ${err}`); };
/** A PO-4 block: an older engine that cannot answer it (a missing export) is ERROR when the block is asked, a note otherwise. */
const blk = (tag, fn) => {
    try { fn(); } catch (e) {
        const m = `${tag}: threw on this engine - ${String((e && e.message) || e).split('\n')[0].slice(0, 160)}`;
        if (counts('PO-4', m)) errors.push(`PO-4 ${m}`); else console.log(`  (not judged: PO-4 ${m})`);
    }
};
// PO-2e's We Do floor (lead ruling 2026-11-13): the measured 7 of 52 lesson x size cases, a RATCHET - raised only, never
// lowered. A run asked for a lower floor FAILS at once (PO-2e-RATCHET), whatever else it was going to check: a floor that
// can be argued down on the day is no floor.
const WEDO_FLOOR = 7 / 52;
const askedFloorW = arg('floor-wedo') === undefined ? null : Number(arg('floor-wedo'));
if (askedFloorW !== null && !(askedFloorW >= WEDO_FLOOR - 1e-9)) {
    console.log(`PO-2e-RATCHET FAIL: --floor-wedo ${arg('floor-wedo')} is under the ratchet ${WEDO_FLOOR.toFixed(4)} (7 of 52, lead 2026-11-13); the We Do floor may only rise`);
    console.log('ws-partopts-unit: FAIL (1)');
    process.exit(1);
}
const STATE = arg('state') ? JSON.parse(arg('state')) : arg('state-file') ? JSON.parse(require('fs').readFileSync(path.resolve(arg('state-file')), 'utf8')) : null;

/** The engine's part-opts.js (MQ_ROOT's), with the judge predicates it shares with the offer gate filled from today's
 *  copy when an older engine has none (rowFits, shortestRowMm, bandFails are the checks' own measure, not the code under test). */
async function engineOpts() {
    const eng = await import(pathToFileURL(path.join(ROOT, 'js/modules/sheet/part-opts.js')).href);
    if (ROOT === HERE) return eng;
    const today = await import(pathToFileURL(path.join(HERE, 'js/modules/sheet/part-opts.js')).href);
    const out = Object.assign({}, eng);
    for (const k of ['rowFits', 'shortestRowMm', 'bandFails', 'EB_BAND_MAX', 'EB_MIN_CELL_MM']) if (out[k] === undefined) out[k] = today[k];
    return out;
}

async function unit() {
    const po = await import(pathToFileURL(path.join(ROOT, 'js/modules/sheet/part-opts.js')).href);
    let n = 0;
    blk('PO-4 limits', () => {
    const fit = { prereq: { total: 4 }, chart: { designed: 2, min: 1 }, vocab: { words: 3, values: [1, 2, 3], canOff: true }, remember: { has: true, canOff: true }, wedo: { fit: 3, values: [1, 2, 3], canOff: true }, rows: { fit: 2, perRow: 3, values: [1, 2], canOff: true }, practice: { perPage: 15, cols: 3, rows: 5, minRows: 4, pages: 1 }, mixed: { count: 10 } };
    const lims = po.allPartLimits(fit);
    n = 0;
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
    });
    // (critic A r1 F7, F6: their own blocks, so an engine without the §8a totals still answers them)
    blk('F7', () => {
        const rl = po.partLimits('rows', { fit: { rows: { fit: 0, perRow: 3 } } });
        if (!rl.none || rl.canOff !== false || Object.keys(po.normalizePartOpts({ rows: { on: false } }, { rows: rl })).length) F('PO-4', 'rows with no room is not "none" (F7)');
    });
    blk('F6', () => {
        const rl = po.partLimits('rows', { fit: { rows: { fit: 0, perRow: 3 } } });
        if (/^\d+ · /.test(po.rangeText('rows', rl)) || !/^Fixed: /.test(po.rangeText('wedo', po.partLimits('wedo', { fit: { wedo: { fit: 3, values: [3] } } })))) F('PO-4', 'a fixed count is not written once as "Fixed: n (...)" (F6)');
    });
    // §8a: Practice and Mixed counts are TOTALS - equal pages of whole rows, the pages follow; an old section's pages x the page
    blk('8a', () => {
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
    });
    // critic A r3 R2: the note under a snapped count gives the true reason - a clamp past the new max / under the new min says
    // "the most / fewest", only a count between two offered values is "rounded so no page is under half full". (An engine
    // without po.snapNote: the 389a69c screen's one text for every snapped Practice / Mixed count - the state the critic failed.)
    blk('R2', () => {
        const note = po.snapNote || ((p, asked, got) => (p === 'practice' || p === 'mixed' ? `Rounded to ${got} so no page is under half full` : `Now ${got}: ${asked} would leave the lesson sheet short`));
        const mx = po.partLimits('mixed', { fit: { mixed: { count: 15 } } });          // (Y4.B1.S14 at L: 15 or 30)
        const pr = po.partLimits('practice', { fit: { practice: { perPage: 15, cols: 3, rows: 5, minRows: 4, pages: 1 } } });
        const cases = [
            ['mixed', 42, mx, false, /most/],                                           // (Mixed 42 at M, then L: the critic's case)
            ['mixed', 6, mx, false, /fewest/],
            ['practice', 27, pr, true, null],                                           // (between 24 and 30: a true rounding)
            ['practice', 90, pr, false, /most/],
        ];
        for (const [p, asked, lim, between, want] of cases) {
            const got = po.snapCount(asked, lim);
            const t = note(p, asked, got, lim, 'L');
            if (/half full/.test(t) !== between) F('PO-4', `${p} ${asked} -> ${got}: note "${t}" (R2: "half full" only for a count between two offered values)`);
            if (want && !want.test(t)) F('PO-4', `${p} ${asked} -> ${got}: note "${t}" does not say ${want} (R2)`);
        }
    });
    // the save / load round trip: a section's partOpts as JSON, read back, normalised again
    blk('PO-4 save/load', () => {
    const lims = po.allPartLimits({ prereq: { total: 4 }, chart: { designed: 2, min: 1 }, vocab: { words: 3, values: [1, 2, 3], canOff: true }, remember: { has: true, canOff: true }, wedo: { fit: 3, values: [1, 2, 3], canOff: true }, rows: { fit: 2, perRow: 3, values: [1, 2], canOff: true }, practice: { perPage: 15, cols: 3, rows: 5, minRows: 4, pages: 1 }, mixed: { count: 10 } });
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
    });
    // (critic A r2 N4) a Vocabulary match of one pair is no task: 1 is never offered
    blk('N4', () => {
        const vl = po.partLimits('vocab', { fit: { vocab: { words: 3, values: [1, 2, 3], canOff: true } } });
        if (po.offeredValues(vl).includes(1)) F('PO-4', `N4: Vocabulary offers ${po.offeredValues(vl)} - a one-pair match`);
        const vl2 = po.partLimits('vocab', { fit: { vocab: { words: 3 } } });
        if (po.offeredValues(vl2).includes(1)) F('PO-4', `N4: Vocabulary (unprobed) offers ${po.offeredValues(vl2)}`);
    });
    // (critic A r2 N6) one form of range text: no "<n> a page" on a total
    blk('N6', () => {
        const ml = po.partLimits('mixed', { fit: { mixed: { count: 15 } } });
        const t = po.partRowText ? po.partRowText('mixed', ml, 15) : po.rangeText('mixed', ml);
        if (/\d+ a page\b/.test(t)) F('PO-4', `N6: the Mixed range reads "${t}"`);
    });
    // (A r3) the offer gate's EB-BAND predicate IS the judge's: part-opts.js bandFails agrees with ws-empty-band judge at its edges
    blk('8d band', () => {
        const { judge } = require('./ws-empty-band.cjs');
        const cases = [[20, 6], [20, 5.99], [40, 12], [40, 11.9], [9.9, 9], [10, 3]];
        for (const [h, b] of cases) {
            let j = false; judge([{ page: 1, cell: 1, hMm: h, hRaw: h, belowMm: b, aboveMm: 0, betweenMm: 0, sideMm: 0, innerW: 100, wMm: 100 }], 'x', (rule) => { if (rule === 'EB-BAND') j = true; }, 'lesson');
            // (lf-checks 2026-11-13 changed the judge: it reads the unrounded height `hRaw` and the largest of the bands under,
            // between and above the ink - so the probe cell carries hRaw and no other band, and the edge is still the band under)
            const jj = h >= 10 && j;   // (the judge's cells come from measureCells, which drops cells under 10 mm)
            if (jj !== po.bandFails(b, h)) F('PO-4', `EB-BAND predicate: part-opts bandFails(${b}, ${h}) = ${po.bandFails(b, h)}, ws-empty-band judge = ${jj}`);
        }
    });
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
    const rowfitPlus = [];   // (EB-ROWFIT+, report-only - critic A r3 R3)
    // (the lessons critic A r2 graded: always walked)
    const MUST_WALK = ['number_sense:nearest_10', 'addition:add_wp_10', 'subtraction:sub_10k_no_regroup', 'addition:add_facts'];
    try {
        const { page, browser } = app;
        let lessons = await page.evaluate(async () => Object.keys((await import('./js/modules/lessons/prereqs.js')).LESSONS));
        lessons = [{ id: 'addition:add_facts (sample)', skill: { categoryId: 'addition', skillId: 'add_facts', opts: { band: 10, constant: [1, 2, 3] } } }]
            .concat(lessons.map((k) => ({ id: k, skill: { categoryId: k.split(':')[0], skillId: k.split(':')[1] } })));
        if (arg('lessons')) {
            const want = arg('lessons').split(',').map((x) => x.trim()).filter(Boolean);
            const exact = (x) => lessons.some((l) => l.id === x);
            lessons = lessons.filter((l) => want.some((x) => l.id === x || l.id.startsWith(x + ' ') || (!exact(x) && l.id.startsWith(x))));
            if (!lessons.length) errors.push(`--lessons ${arg('lessons')}: no such lesson`);
        }
        if (has('bt-only')) lessons = [];   // (only the threshold backtests)
        const sizes = arg('sizes', 'M,L').split(',');
        const onlyParts = arg('parts') ? arg('parts').split(',') : null;
        const onlyCombos = has('combos-only');
        const full = Number(arg('full', 0)) || 0;
        const po = await engineOpts();
        const PAGES = 2;   // (Practice prints 2 pages, so a total count re-paginates and its last page is judged too)

        const build = (skill, size, partOpts) => page.evaluate(async ({ skill, size, partOpts, PAGES }) => {
            try {
                const r = await window.buildSheet({ role: 'lesson', sections: [{ skills: [skill] }], size, paper: 'A4', seed: 4242, key: true, practicePages: PAGES, mixed: true, partOpts });
                const prac = (r.items || []).filter((it) => it.part === 'practice');
                const mixed = (r.items || []).filter((it) => it.part === 'mixed');
                // (EB-ROWFIT: the shortest whole row at c across of the problems the rows draw - read from the bridge's
                // heights, the tallest of them - read from the bridge's measurements, not from the planner under test)
                // (A r3: the problems the rows DRAW - the bridge's level-1 twins of the main pool, `lesson.teach.indepH`; the Warm-up
                // pools' shorter items never print as lesson rows - identify's 30.5 mm Warm-up cells read a 36.5 mm row where its
                // place-value rows are 49.3 mm. An engine without indepH: the main pool's own measured items.)
                const PO = await import('./js/modules/sheet/part-opts.js');
                const ih = r.lesson.teach && r.lesson.teach.indepH;
                const mainIts = (r.items || []).filter((it) => it.part === 'teach' && it.pool === 'main' && it.measured && !/^lesson/.test(it.template || ''));
                const rowH = {};
                // (an engine older than shortestRowMm: the same rule - the c-th shortest height - written here)
                const shortest = PO.shortestRowMm || ((hs, c) => { const s = (hs || []).filter((h) => Number(h) > 0).map(Number).sort((a, b) => a - b); return s.length >= c && c >= 1 ? s[c - 1] : null; });
                for (const c of [1, 2, 3, 4]) { const hs = ih ? ih[c] || [] : mainIts.map((it) => it.measured[c] && it.measured[c].fits !== false ? it.measured[c].hMm : null); const h = shortest(hs, c); if (h !== null) rowH[c] = h; }
                const L = await import('./js/modules/lessons/prereqs.js');
                const ld = L.lessonFor(skill.categoryId, skill.skillId) || {};
                const remTexts = [ld.concepts && ld.concepts[0] && ld.concepts[0].text, ld.chant, r.lesson.chant].filter((x) => typeof x === 'string' && x.trim().length >= 6);
                return {
                    rowH, remTexts,
                    pupil: r.pupilHtml, doc: window.sheetDocument(r.pupilHtml, 'x', { paper: 'A4' }), keyLen: (r.keyHtml || '').length, keyPages: r.keyPageCount, pages: r.pageCount,
                    teach: r.lesson.teach ? { fill: r.lesson.teach.fill, freeMm: r.lesson.teach.freeMm, rowMm: r.lesson.teach.rowMm, independent: r.lesson.teach.independent, cellBands: r.lesson.teach.cellBands } : null,
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
                        emptyMm: +(Math.max(0, br.bottom - last) / (96 / 25.4)).toFixed(1), bodyMm: +(br.height / (96 / 25.4)).toFixed(1), stripMm: strips.length ? +(Math.max(...strips) / (96 / 25.4)).toFixed(1) : 0,
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
        let textNoteOnce = 0;
        const judgeWalk = (where, b, cur, m, std, rowH) => {
            const lims = po.allPartLimits(b.fit);
            const sheetPgs = m.pages.map((x, i) => Object.assign({ i }, x)).filter((x) => x.sheet === 'lesson-sheet');
            const lastSheet = sheetPgs[sheetPgs.length - 1];
            const changed = (pg) => !std.pages.has(pg.h);
            const perRow = (lims.rows && lims.rows.perRow) || (b.fit.rows && b.fit.rows.perRow) || 1;
            const rowNeed = rowH[perRow] ? +(rowH[perRow] + (lastSheet ? lastSheet.stripMm : 0)).toFixed(1) : null;
            const rowsPrinted = Math.round((b.got.rowsItems || 0) / perRow);
            // (b) EB-ROWFIT: no lesson rows (0, off, or "no room") yet the sheet's foot holds a whole Independent row and its band head
            // (part-opts.js rowFits - the offer gate's own predicate, here on the PRINTED foot, margin 0). A sheet identical to the
            // standard packet's is the master state (routed to lf-engine): excused here, its text still judged in (c).
            const fits = lastSheet && rowNeed && po.rowFits(lastSheet.emptyMm, rowNeed, 0);
            if (fits && rowsPrinted === 0 && changed(lastSheet)) F('EB-ROWFIT', `${where} p${lastSheet.i + 1}: no lesson rows, yet ${lastSheet.emptyMm} mm of the foot is empty - one Independent row and its head is ${rowNeed} mm`);
            // (b+) EB-ROWFIT+ (critic A r3 R3): lesson rows printed, the teacher may not add one (rows fixed by the planner, or at
            // their stepper's last value), yet the printed foot holds one more row of the rows' own cells (no head: the band
            // exists). REPORT-ONLY (--gate-rowfit-plus makes it gating): the planner sizes rows from its plan, which reads
            // 1.5-15.9 mm less free height than the print (DESIGN §8d) - see DESIGN §8d "R3".
            const rl = lims.rows;
            if (rl && !rl.none && rowsPrinted >= 1 && lastSheet && rowH[perRow] && (rl.fixed || countOf(cur, 'rows', rl) >= rl.max) && po.rowFits(lastSheet.emptyMm, rowH[perRow], 0)) {
                const msg = `${where} p${lastSheet.i + 1}: ${rowsPrinted} lesson row(s), "${rl.fixed ? 'Fixed' : 'at the most offered'}", yet ${lastSheet.emptyMm} mm of the foot is empty - one more row is ${rowH[perRow]} mm${changed(lastSheet) ? '' : ' (the standard sheet)'}`;
                rowfitPlus.push(msg);
                if (has('gate-rowfit-plus') && changed(lastSheet)) F('EB-ROWFIT+', msg);
            }
            // (c) the rows' text is true, the standard packet included (the screen's text is no print: not in the print baseline):
            // "no room" only where a row does not fit; "the standard sheet is kept" only on a sheet identical to the standard's
            const rt = lims.rows && lims.rows.none ? (po.partRowText ? po.partRowText('rows', lims.rows, 0) : po.rangeText('rows', lims.rows)) : '';   // (an engine before partRowText: the screen wrote rangeText)
            if (/no room/.test(rt) && fits) F('PO-NOROOM', `${where}: rows "${rt}", yet ${lastSheet.emptyMm} mm is empty at the sheet's foot and one row with its head is ${rowNeed} mm`);
            if (rt === po.NOT_ADDED_STD && lastSheet && changed(lastSheet)) F('PO-NOROOM', `${where}: rows "${rt}" on a lesson sheet that differs from the standard packet's`);
            // (d) Remember off: neither the Remember line nor the rule prints anywhere on the lesson sheet
            if (cur.remember && cur.remember.on === false) for (const t of b.remTexts) if (sheetPgs.some((x) => x.text.includes(t.replace(/\s+/g, ' ').trim()))) F('PO-REM', `${where}: Remember is off, yet the lesson sheet prints "${t}"`);
            // (f) N4: no one-pair match
            if (lims.vocab && po.offeredValues(lims.vocab).includes(1)) F('PO-VOC', `${where}: Vocabulary offers 1 word - a one-pair "Draw a line to match"`);
            if (cur.vocab && cur.vocab.n === 1) F('PO-VOC', `${where}: Vocabulary prints 1 pair`);
            // (e) the screen's texts tell the truth about pages. (An engine older than the text writers - totalPages,
            // partRowText, sheetCaption - cannot answer this one: on a narrow run that does not ask for PO-CAP it is a
            // note, and when PO-CAP IS asked it is an ERROR, never a silent pass.)
            let tx;
            try { tx = textsOf(b.fit, lims, cur); } catch (e) {
                const msg = `${where}: the part texts cannot be read on this engine - ${String((e && e.message) || e).split('\n')[0].slice(0, 120)}`;
                if (counts('PO-CAP', msg)) errors.push(`PO-CAP ${msg}`); else if (!textNoteOnce++) console.log(`  (not judged: PO-CAP ${msg})`);
                return;
            }
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
            if (b0.error) { Fbuild(`${where0} standard packet`, b0.error); continue; }
            const lims = po.allPartLimits(b0.fit);
            // (F2 coverage: a real range - two values or more - on We Do and on Practice)
            cover.cases++;
            const nv = (p) => (lims[p] ? po.offeredValues(lims[p]).length : 0);
            if (nv('wedo') >= 2) cover.wedo++;
            if (nv('practice') >= 2) cover.practice++;
            cover.list.push(`${where0}: wedo ${lims.wedo ? po.offeredValues(lims.wedo).join('/') : '-'} · practice ${lims.practice ? po.offeredValues(lims.practice).join('/') : '-'}`);
            if (has('coverage-only')) continue;
            const m0 = await measure(b0.doc);
            const std = { pages: new Set(m0.pages.map((p) => p.h)), cellKeys: stdKeys(m0) };
            // (--state: ONE settled state, judged by every check of the walk)
            if (STATE) {
                const { b, cur } = await settle(l.skill, size, STATE);
                const where = `${where0} [state] ${JSON.stringify(STATE)}${JSON.stringify(cur) !== JSON.stringify(po.normalizePartOpts(STATE, null)) ? ` (settled: ${JSON.stringify(cur)})` : ''}`;
                console.log(`  ${where}`);
                if (b.error) { Fbuild(where, b.error); continue; }
                const m = await measure(b.doc);
                if (m.pages.some((x) => x.over)) F('PO-2c', `${where}: content past its page (overflow or a split cell) on p${m.pages.findIndex((x) => x.over) + 1}`);
                for (const x of findingsOf(m, where, std)) F('PO-2d', x);
                judgeWalk(where, b, cur, m, std, b0.rowH);
                walk.states++; walk.cases++;
                continue;
            }
            const jobs = [];
            if (!onlyCombos && !has('no-jobs')) for (const [p, lim] of Object.entries(lims)) {
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
            if (!has('no-jobs')) {
                jobs.push({ partOpts: allMin, tag: 'everything at min' });
                jobs.push({ partOpts: Object.assign({}, allMin, { wedo: { on: false } }), tag: 'everything at min, We Do off' });
                if (lims.vocab && lims.wedo) jobs.push({ partOpts: { vocab: { n: 0 }, wedo: { on: false } }, tag: 'Vocabulary 0, We Do off' });
                if (lims.remember && lims.rows) jobs.push({ partOpts: { remember: { on: false }, rows: { n: 0 } }, tag: 'Remember off, rows 0' });
            }
            for (const j of jobs) {
                const { b, cur } = await settle(l.skill, size, j.partOpts);
                const where = `${where0} ${j.tag}${JSON.stringify(cur) !== JSON.stringify(po.normalizePartOpts(j.partOpts, null)) ? ` (offered: ${JSON.stringify(cur)})` : ''}`;
                if (b.error) { Fbuild(where, b.error); continue; }
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
                        if (b.error) { Fbuild(where, b.error); continue; }
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
        // ---------------------------------------------------------------- THRESHOLD BACKTESTS (A r3; DESIGN §8d)
        // Each tuned plan-to-print threshold of the offer gate is pinned by fixed sheets on BOTH sides, so a move by the stated
        // step fails here: the sheets are built as asked (no settle loop - some are values the gate refuses), printed and
        // measured; the planner's figures (res.lesson.teach) and the printed page are read side by side.
        // (with --only, a backtest block runs only when it is asked)
        const runBt = (id) => !ONLY || ONLY.includes(id);
        if (!has('no-bt') && !arg('lessons') && !has('coverage-only') && !STATE) {
            const K = await page.evaluate(async () => { const L = await import('./js/modules/sheet/roles/lesson.js'); const P = await import('./js/modules/sheet/part-opts.js'); return { FILL: L.SHEET_FILL_MIN, ROW: P.ROWFIT_SLACK_MM, BAND: P.BAND_SLACK_MM }; });
            // (--bt-k-file <json>: judge as if a threshold had moved, e.g. {"FILL": 0.75} - the mutation backtest. The BT sheets are
            // built as asked, never through the offer gate, so what they print does not depend on the threshold: moving it in
            // the judge is moving it in the engine, for these sheets.)
            if (arg('bt-k-file')) { const mv = JSON.parse(require('fs').readFileSync(path.resolve(arg('bt-k-file')), 'utf8')); Object.assign(K, mv); console.log(`(thresholds judged as moved: ${JSON.stringify(mv)})`); }
            const sk = (id) => ({ categoryId: id.split(':')[0], skillId: id.split(':')[1] });
            const printed = async (id, size, partOpts) => {
                const b = await build(sk(id), size, partOpts); builds++;
                if (b.error) return { b };
                const m = await measure(b.doc);
                const sheets = m.pages.filter((x) => x.sheet === 'lesson-sheet');
                const last = sheets[sheets.length - 1];
                const perRow = (b.fit.rows && b.fit.rows.perRow) || 1;
                const rowNeed = b.rowH[perRow] ? b.rowH[perRow] + last.stripMm : null;
                const sheetPg = new Set(m.pages.map((x, i) => (x.sheet === 'lesson-sheet' ? i + 1 : 0)));
                const bands = m.cells.filter((c) => sheetPg.has(c.page) && !/^lesson/.test(c.tmpl) && c.hMm >= 10).map((c) => c.belowMm / c.hMm);
                return { b, last, rowNeed, maxBand: bands.length ? Math.max(...bands) : 0 };
            };
            const BT = (id, ok, msg) => { if (!ok) F(id, msg); };
            // FILL-BT: SHEET_FILL_MIN 0.76. (1) the largest plan-to-print gap measured near the floor, placevalue:identify M We Do
            // off (plan 0.797, printed 0.745: 0.052) - a floor under 0.70 + that gap lets a sheet planned at the floor print a
            // 30 % foot (moved to 0.75: FAIL). (2) the lowest-planned good sheet over the floor, add_wp_10_plain L Vocabulary off
            // and rows 0 (plan 0.762, prints 24 % empty) - a floor over it refuses a good sheet (moved to 0.77: FAIL). (3) the
            // highest-planned bad sheet, add_facts M Vocabulary off (plan 0.712, prints 31 % empty) - refused (moved to 0.71: FAIL).
            // (critic A r3: (3) pins nothing two-sided - any floor > 0.712 passes it, so the floor rests on (1)+(2). It is kept
            //  as a REGRESSION GUARD: the worst swept foot (0.712) stays refused at the live floor, so a later drop below it
            //  fails here. DESIGN §8d "8d follow-up" says this.)
            if (runBt('FILL-BT')) {
                const g = await printed('placevalue:identify', 'M', { wedo: { on: false } });
                const gap = g.b.error ? NaN : g.b.teach.fill[0] - (1 - g.last.emptyMm / g.last.bodyMm);
                BT('FILL-BT', Number.isFinite(gap) && K.FILL >= 0.70 + gap - 1e-9, `identify M We Do off: plan ${g.b.teach && g.b.teach.fill} vs printed ${g.last && (1 - g.last.emptyMm / g.last.bodyMm).toFixed(3)} (gap ${gap.toFixed(3)}) - SHEET_FILL_MIN ${K.FILL} < 0.70 + the gap`);
                const ok = await printed('addition:add_wp_10_plain', 'L', { vocab: { on: false }, rows: { n: 0 } });
                BT('FILL-BT', !ok.b.error && ok.b.teach.fill[0] >= K.FILL && ok.last.empty < 30, `add_wp_10_plain L Vocabulary off, rows 0: plan ${ok.b.teach && ok.b.teach.fill}, printed ${ok.last && ok.last.empty} % empty - a good sheet the floor ${K.FILL} refuses`);
                const bad = await printed('addition:add_facts', 'M', { vocab: { on: false } });
                BT('FILL-BT', !bad.b.error && bad.b.teach.fill[0] < K.FILL && bad.last.empty >= 30, `add_facts M Vocabulary off: plan ${bad.b.teach && bad.b.teach.fill}, printed ${bad.last && bad.last.empty} % empty - a bad sheet the floor ${K.FILL} lets through`);
                console.log(`FILL-BT ${fails.some((x) => x.startsWith('FILL-BT ')) ? 'FAIL' : 'PASS'}: gap ${gap.toFixed(3)} (floor >= ${(0.70 + gap).toFixed(3)}), good sheet planned ${ok.b.teach && ok.b.teach.fill[0]} (floor <=), bad sheet planned ${bad.b.teach && bad.b.teach.fill[0]} (floor >) - SHEET_FILL_MIN ${K.FILL}`);
            }
            // ROWFIT-BT: ROWFIT_SLACK_MM 12. (1) placevalue:value M We Do 1: no rows, plan free 24.8 / row 36.2 mm (11.4 apart),
            // printed foot 35.0 >= one row and head 33.7 - the gate must refuse it (moved to 10 mm: FAIL). (2) placevalue:combine L
            // rows 0: plan free 18.4 / row 31.9 (13.5 apart), printed foot 28.5 < 29.4 - the gate must keep it (moved to 14: FAIL).
            // (deploy merge 2026-11-13: re-pinned from expand L Remember off / value L rows 0, which master's sheets moved to
            //  15.9 / 26.4 mm; the pair was found by a 672-state sweep of the merged tree.)
            if (runBt('ROWFIT-BT')) {
                const a = await printed('placevalue:value', 'M', { wedo: { n: 1 } });
                const aFits = a.rowNeed && a.last.emptyMm >= a.rowNeed;
                BT('ROWFIT-BT', !a.b.error && !(a.b.teach.independent > 0) && aFits && po.rowFits(a.b.teach.freeMm, a.b.teach.rowMm, K.ROW), `value M We Do 1: plan free ${a.b.teach && a.b.teach.freeMm} / row ${a.b.teach && a.b.teach.rowMm} mm, printed foot ${a.last && a.last.emptyMm} / row ${a.rowNeed} - margin ${K.ROW} lets a sheet whose foot holds a row through`);
                const v = await printed('placevalue:combine', 'L', { rows: { n: 0 } });
                const vFits = v.rowNeed && v.last.emptyMm >= v.rowNeed;
                BT('ROWFIT-BT', !v.b.error && !vFits && !po.rowFits(v.b.teach.freeMm, v.b.teach.rowMm, K.ROW), `combine L rows 0: plan free ${v.b.teach && v.b.teach.freeMm} / row ${v.b.teach && v.b.teach.rowMm} mm, printed foot ${v.last && v.last.emptyMm} / row ${v.rowNeed} - margin ${K.ROW} refuses a sheet whose foot holds no row`);
                console.log(`ROWFIT-BT ${fails.some((x) => x.startsWith('ROWFIT-BT ')) ? 'FAIL' : 'PASS'}: must-refuse gap ${a.b.teach ? (a.b.teach.rowMm - a.b.teach.freeMm).toFixed(1) : '-'} mm (margin >=), must-keep gap ${v.b.teach ? (v.b.teach.rowMm - v.b.teach.freeMm).toFixed(1) : '-'} mm (margin <) - ROWFIT_SLACK_MM ${K.ROW}`);
            }
            // BAND-BT: BAND_SLACK_MM 2. (1) division:div_facts M Vocabulary and Remember off: We Do cells planned 24.6 mm with 6.6 mm
            // under the ink (26.8 %), printed 31.4 % - the gate must flag them (moved to 0 mm: FAIL). (2) div_facts M We Do 1: its
            // cell prints under 30 % - the gate must not flag it (moved to 3 mm: FAIL).
            if (runBt('BAND-BT')) {
                const f = await printed('division:div_facts', 'M', { vocab: { on: false }, remember: { on: false } });
                const flagged = (b) => ((b.teach && b.teach.cellBands) || []).some((c) => po.bandFails(c.belowMm + K.BAND, c.hMm));
                BT('BAND-BT', !f.b.error && f.maxBand >= 0.30 && flagged(f.b), `div_facts M Vocabulary + Remember off: printed band ${(f.maxBand * 100).toFixed(1)} %, planned ${JSON.stringify((f.b.teach && f.b.teach.cellBands || []).slice(0, 2))} - slack ${K.BAND} mm lets it through`);
                const w = await printed('division:div_facts', 'M', { wedo: { n: 1 } });
                BT('BAND-BT', !w.b.error && w.maxBand < 0.30 && !flagged(w.b), `div_facts M We Do 1: printed band ${(w.maxBand * 100).toFixed(1)} % - slack ${K.BAND} mm flags a good sheet`);
                const tight = (b) => Math.min(...((b.teach && b.teach.cellBands) || []).filter((c) => c.hMm >= 10).map((c) => 0.30 * c.hMm - c.belowMm));
                console.log(`BAND-BT ${fails.some((x) => x.startsWith('BAND-BT ')) ? 'FAIL' : 'PASS'}: must-flag needs slack >= ${tight(f.b).toFixed(1)} mm, must-keep needs slack < ${tight(w.b).toFixed(1)} mm - BAND_SLACK_MM ${K.BAND}`);
            }
        }
    } finally { await app.close(); }
    const ids = ['PO-2a', 'PO-2b', 'PO-2c', 'PO-2d', 'EB-ROWFIT', 'EB-ROWFIT+', 'PO-NOROOM', 'PO-REM', 'PO-CAP', 'PO-VOC'];
    console.log(`EB-ROWFIT+ (report-only${has('gate-rowfit-plus') ? ', gating changed sheets' : ''}): ${rowfitPlus.length} state(s) with a row-sized foot under rows the teacher cannot add to (${rowfitPlus.filter((x) => !/the standard sheet\)$/.test(x)).length} on changed sheets)`);
    for (const x of rowfitPlus.slice(0, 12)) console.log(`  ${x}`);
    console.log(`PO-2w walk: ${walk.states} settled states beyond the standard packet in ${walk.cases} lesson x size cases (depth ${arg('walk-depth', 3)})`);
    for (const id of ids) { const f = fails.filter((x) => x.startsWith(id + ' ')); console.log(`${id} ${f.length ? `FAIL ${f.length}` : 'PASS'}`); for (const x of f.slice(0, Number(arg('show', 25)))) console.log(`   ${x}`); }
    // F2 (critic A r1): how many lesson x size cases offer a real We Do range and a real Practice range (2 values or more)
    // PO-2e We Do floor = the measured 7/52 (lead, 2026-11-13): a ratchet, raise it only (a wider We Do layout is its own entry).
    const floorW = Number(arg('floor-wedo', WEDO_FLOOR)), floorP = Number(arg('floor-practice', 0.9));
    const cw = cover.cases ? cover.wedo / cover.cases : 1, cp = cover.cases ? cover.practice / cover.cases : 1;
    if (has('verbose')) for (const x of cover.list) console.log(`   ${x}`);
    const covOk = !cover.cases || arg('lessons') || (cw >= floorW && cp >= floorP);
    console.log(`PO-2e ${covOk ? 'PASS' : 'FAIL'} coverage: We Do range ${cover.wedo}/${cover.cases}, Practice range ${cover.practice}/${cover.cases} (floors ${Math.round(floorW * 100)} % / ${Math.round(floorP * 100)} %)${arg('lessons') ? ' (a --lessons run: not judged)' : ''}`);
    if (!covOk) F('PO-2e', `coverage under its floor (We Do ${cover.wedo}/${cover.cases}, Practice ${cover.practice}/${cover.cases})`);
    console.log(`(${builds} builds, ${((Date.now() - T0) / 1000).toFixed(0)} s)`);
}

(async () => {
    await unit();
    if (!has('unit')) await browser();
    if (ONLY) console.log(`(--only ${ONLY.join(',')}: other findings not counted)`);
    if (errors.length) {
        for (const x of errors.slice(0, 12)) console.log(`  ERROR ${x}`);
        console.log(`ws-partopts-unit: ERROR (${errors.length} check(s) could not run${fails.length ? `; ${fails.length} finding(s)` : ''})`);
        process.exit(2);
    }
    console.log(fails.length ? `ws-partopts-unit: FAIL (${fails.length})` : 'ws-partopts-unit: OK');
    process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); console.log(`ws-partopts-unit: ERROR (crashed: ${String((e && e.message) || e).split('\n')[0].slice(0, 160)})`); process.exit(2); });
