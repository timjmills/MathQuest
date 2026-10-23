// js/modules/sheet/mixed-page.check.cjs
// THE MIXED PAGE CHECK (critic M1 r3, D1 / D2 / D3 / D4 / D6; IMPROVEMENT_PLAN 1.7: a defect that
// survived two critic rounds becomes a machine check). Builds real Mixed practice pages through
// buildSheet in Chromium and holds every one to:
//
//   repeats    sheet/interleave.js pageRepeats over the page's facts in print order, under the
//              owner's fill ruling (2026-10-23): with `fill` on (the default) the page is full, and
//              its turnarounds and exact repeats are exactly the ones the deal took on its turnaround
//              and repeat rungs (after the unique facts gave out), with a note; with `fill` off 0
//              repeats and 0 turnarounds, and a note when the page ends early; related facts
//              (8 x 10 / 80 / 10, 6 + 7 / 13 - 6, 13 - 6 / 13 - 7) only with `families: 'allow'` (D1)
//   digits     every fact prints at its ladder size (TY-30), at least the size's working digits
//              (16 / 22 / 28 pt at S / M / L, tokens.SIZES) (D2)
//   ladder     for each look, seed and skill set: problems S > M > L (L1) (D2 / D3)
//   fill       the drawn fact over its cell (TY-31) within 55-75 %, or a note that says why (D2 / D5)
//   tracks     the facts' digit tracks are the widest number on the page, no more (D4)
//   tabs       a numbered tab is the CL-31 side for the page's effective digit size (D6)
//
// Sets: the critic's 4-skill set (add_facts, subtract, mult_facts, div_facts vertical), the
// 2-skill add_facts + subtract set and add_facts : mult_facts weighted 1 : 3; 20 seeds x S / M / L
// x Daily / I Can. Every page is also one page whose shelves hold exactly the problems dealt.
//
//   node js/modules/sheet/mixed-page.check.cjs [--seeds 20] [--table] [--only 0,1,...]
// Prints `mixed-page check: OK` / `FAIL` and exits non-zero on a failure. Needs the preinstalled
// Chromium (/opt/pw-browsers, through tests/lib/ws-harness.cjs); never installs one.
const path = require('path');
const { pathToFileURL } = require('url');

// (the kit's modules are ES modules in a package without "type": the import below is meant)
process.removeAllListeners('warning');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > -1 ? process.argv[i + 1] : d; };
const SEEDS = Math.max(1, Number(arg('seeds', 20)) || 20);
const TABLE = process.argv.includes('--table');
// 'c:s', 'c:s@{opts}', 'c:s#w' (a weight)
const sk = (id) => { const [id0, w] = id.split('#'); const [base, o] = id0.split('@'); const [categoryId, skillId] = base.split(':'); return Object.assign({ categoryId, skillId, opts: o ? JSON.parse(o) : {} }, w ? { weight: Number(w) } : {}); };
const SETS = {
    critic4: ['addition:add_facts', 'subtraction:subtract', 'multiplication:mult_facts', 'division:div_facts@{"divForm":"vertical"}'],
    add_sub2: ['addition:add_facts', 'subtraction:subtract'],
    // (the 1 : 3 weighted page: its re-picked k once printed 30 problems on 25 places, 2 pages)
    weighted13: ['addition:add_facts#1', 'multiplication:mult_facts#3'],
    // (a small pool: 13 "+ 2" facts and 13 "x 2" facts, so a page runs out of unique facts)
    small2: ['addition:add_facts@{"constant":[2]}', 'multiplication:mult_facts@{"constant":[2]}'],
};
// The owner's fill ruling (2026-10-23): `fill` on (default) fills a short share with turnarounds,
// then repeats; off prints unique facts only. `families: 'allow'` alone lets related facts in.
const SCENARIOS = [
    { set: 'critic4', opts: {}, seeds: SEEDS, ladder: true },
    { set: 'add_sub2', opts: {}, seeds: SEEDS, ladder: true },
    { set: 'weighted13', opts: {}, seeds: SEEDS, ladder: true },
    { set: 'small2', opts: {}, seeds: Math.min(SEEDS, 5), ladder: true },
    { set: 'small2', opts: { fill: false }, seeds: Math.min(SEEDS, 5), ladder: false },
    { set: 'add_sub2', opts: { families: 'allow' }, seeds: Math.min(SEEDS, 3), ladder: true },
];
const SIZES_ = ['S', 'M', 'L'];
const LOOKS_ = ['daily', 'ican'];
const FILL_TOL = 0.005;   // a measured box is a fraction of a mm off the drawn formula

// The page built and measured in the app (run in the browser).
const PAGE_FN = async (req) => {
                            const o = await window.buildSheet(req);
                            const facts = [];
                            for (const pg of o.plan.pages || []) for (const sec of pg.sections || []) {
                                if (sec.kind !== 'band') continue;
                                for (const g of sec.contents || [sec.content]) for (const it of (g && g.items) || []) {
                                    const p = (it.q && it.q.cell && it.q.cell.payload) || {};
                                    facts.push({ op: p.op, a: p.a, b: p.b, ans: it.q && it.q.ans, tpl: it.q && it.q.cell && it.q.cell.template });
                                }
                            }
                            // Measure the printed page: the fact digits, the fill, the tracks, the tabs.
                            const host = document.createElement('div');
                            host.style.cssText = 'position:absolute;left:-12000px;top:0;width:230mm;visibility:hidden';
                            host.innerHTML = o.pupilHtml;
                            document.body.appendChild(host);
                            const mm = 96 / 25.4;
                            const pts = new Set();
                            const cellPts = new Set();
                            let fillMax = 0;
                            let fillMin = 9;
                            let tracks = 0;
                            const tabs = new Set();
                            for (const c of host.querySelectorAll('.ws-band .ws-grid .ws-cell')) {
                                const f = c.querySelector('.ws-fact');
                                if (!f) continue;
                                // the digits' own size (the fact's font), and the size the cell says it is
                                const px = parseFloat(getComputedStyle(f).fontSize);
                                pts.add(Math.round(px * 0.75 * 10) / 10);
                                cellPts.add(parseFloat(getComputedStyle(c).getPropertyValue('--fd')));
                                const fw = f.getBoundingClientRect().width;
                                const cw = c.getBoundingClientRect().width;
                                fillMax = Math.max(fillMax, fw / cw);
                                fillMin = Math.min(fillMin, fw / cw);
                                tracks = Math.max(tracks, getComputedStyle(f).gridTemplateColumns.split(' ').length - 1);
                                const t = c.querySelector('.ws-tab');
                                if (t) tabs.add(Math.round((t.getBoundingClientRect().height / mm) * 10) / 10);
                            }
                            // no box without a problem; the shelf (row) height
                            const empty = [...host.querySelectorAll('.ws-band .ws-cell')].filter((c) => c.classList.contains('blankrun') || !c.textContent.trim()).length;
                            const c0 = host.querySelector('.ws-band .ws-grid .ws-cell');
                            const rowH = c0 ? c0.getBoundingClientRect().height / mm : 0;
                            host.remove();
                            const meta = o.plan.meta || {};
                            return {
                                arr: o.arrangement, notes: o.notes || [], facts, pts: [...pts], cellPts: [...cellPts], fillMax, fillMin, tracks, tabs: [...tabs],
                                k: (meta.fits && meta.fits[0] && meta.fits[0].cols) || 0, rows: (meta.fits && meta.fits[0] && meta.fits[0].rows) || 0,
                                n: o.items.length, longest: meta.interleave ? meta.interleave.longest : null, pages: o.pageCount,
                                dealt: o.items.map((x) => x.dealtAs || 'unique'), mr: o.mixedRepeats, empty, rowH,
                            };
                        };

async function main() {
    const { pageRepeats } = await import(pathToFileURL(path.join(__dirname, 'interleave.js')).href);
    const { SIZES, TAB_LADDER, factTab } = await import(pathToFileURL(path.join(__dirname, 'tokens.js')).href);
    const app = await open({ seed: 12345 });
    const fails = [];
    const rows = [];
    let pages = 0;
    let famPages = 0;
    try {
        // (--only 0,3: run some scenarios, by index - the full run takes about an hour, so it can be split)
        const only = arg('only', '') ? String(arg('only', '')).split(',').map(Number) : null;
        for (const sc of SCENARIOS.filter((_, i) => !only || only.includes(i))) {
            const set = SETS[sc.set];
            const fillOn = sc.opts.fill !== false;
            const famOn = sc.opts.families === 'allow';
            const setName = `${sc.set}${fillOn ? '' : ' fill-off'}${famOn ? ' families' : ''}`;
            for (let s = 1; s <= sc.seeds; s++) {
                const seed = s * 101;
                for (const look of LOOKS_) {
                    const per = {};
                    for (const size of SIZES_) {
                        const req = Object.assign({ role: 'mixed-practice', sections: [{ skills: set.map(sk) }], size, look, key: false, seed }, sc.opts);
                        const r = await app.page.evaluate(PAGE_FN, req);
                        pages++;
                        const id = `${setName} ${look} ${size} seed ${seed}`;
                        const fail = (why) => fails.push(`${id}: ${why}`);
                        if (r.arr !== 'mixed') { fail(`arranged ${r.arr}`); continue; }
                        // the shelves hold exactly the problems dealt, on one page (no spill)
                        if (r.pages !== 1) fail(`${r.pages} pages`);
                        const full = r.n === r.k * r.rows;
                        if (fillOn && !full) fail(`fill on, but ${r.n} problems on ${r.rows} shelves of ${r.k}`);
                        // D1 + the fill ruling: what the options allow, and only in its turn
                        const rep = pageRepeats(r.facts);
                        const dealt = { unique: 0, related: 0, turn: 0, repeat: 0 };
                        for (const d of r.dealt) dealt[d]++;
                        if (!fillOn && rep.exact.length) fail(`fill off, ${rep.exact.length} exact repeat(s): ${rep.exact.map((x) => x.key).join(', ')}`);
                        if (!fillOn && rep.turnarounds.length) fail(`fill off, ${rep.turnarounds.length} turnaround(s): ${rep.turnarounds.map((x) => x.key).join(', ')}`);
                        if (!famOn && rep.families.length) fail(`${rep.families.length} related fact(s) with families off: ${rep.families.map((x) => x.key).join(', ')}`);
                        // every repeat / turnaround on the page is one the deal took at that rung (after
                        // the rungs before it gave out), never one that slipped past a rule
                        if (rep.exact.length !== dealt.repeat) fail(`${rep.exact.length} exact repeats on the page, ${dealt.repeat} dealt as repeats`);
                        if (rep.turnarounds.length !== dealt.turn) fail(`${rep.turnarounds.length} turnarounds on the page, ${dealt.turn} dealt as turnarounds`);
                        // a share with repeats used its turnarounds first: the pool has dealt some, or has none to deal
                        if (!fillOn && !full && !r.notes.some((t) => /run out at \d+/.test(t))) fail('fill off, the page ends early with no note');
                        if ((dealt.turn || dealt.repeat) && !r.notes.some((t) => /so the page is filled with/.test(t))) fail('turnarounds / repeats with no note');
                        // critic M1 r4: repeats spread evenly - per skill, each fact (a fact and its
                        // turnaround counted as one) appears within 1 of every other's count; no
                        // identical fact twice on one shelf
                        const pk = (f) => (f.op === '+' || f.op === '*' || f.op === '\u00d7' ? `${f.op}:${[Number(f.a), Number(f.b)].sort((x, y) => x - y)}` : `${f.op}:${f.a},${f.b}`);
                        const per2 = {};
                        r.facts.forEach((f) => { const m = per2[f.op] = per2[f.op] || {}; m[pk(f)] = (m[pk(f)] || 0) + 1; });
                        for (const [op, m] of Object.entries(per2)) {
                            const c = Object.values(m);
                            if (Math.max(...c) - Math.min(...c) > 1) fail(`${op} facts appear ${Math.min(...c)} to ${Math.max(...c)} times (uneven repeats)`);
                        }
                        const shelfDup = r.facts.filter((f, i) => r.facts.some((g, h) => h < i && Math.floor(h / r.k) === Math.floor(i / r.k) && g.op === f.op && String(g.a) === String(f.a) && String(g.b) === String(f.b))).length;
                        if (shelfDup) fail(`${shelfDup} identical fact(s) twice on one shelf`);
                        // critic M1 r4: no empty box; a short page keeps the full page's row height
                        if (r.empty) fail(`${r.empty} box(es) without a problem`);
                        if (!fillOn) {
                            const twin = await app.page.evaluate(PAGE_FN, Object.assign({}, req, { fill: true }));
                            if (Math.abs(twin.rowH - r.rowH) > 0.3) fail(`row height ${r.rowH.toFixed(1)} mm, ${twin.rowH.toFixed(1)} mm with fill on`);
                        }
                        if (rep.families.length) famPages++;
                        // D2: digits at the ladder size, never under the working digits
                        const floor = SIZES[size].digitPt;
                        if (!r.pts.length) fail('no fact cells measured');
                        if (r.pts.length > 1) fail(`fact digits differ across the page: ${r.pts.join(', ')} pt`);
                        const pt = Math.min(...r.pts);
                        if (pt < floor) fail(`fact digits ${pt} pt under the ${size} working digits ${floor} pt`);
                        if (r.cellPts.length !== 1 || Math.abs(r.cellPts[0] - pt) > 0.05) fail(`the cells say ${r.cellPts.join('/')} pt for ${pt} pt digits`);
                        // D2 / D5: the fill, or a note
                        const fillNote = r.notes.some((t) => /fill \d+% of each box/.test(t));
                        if ((r.fillMax > 0.75 + FILL_TOL || r.fillMin < 0.55 - FILL_TOL) && !fillNote) fail(`fill ${r.fillMin.toFixed(3)}-${r.fillMax.toFixed(3)} outside 55-75% with no note`);
                        // D4: the tracks are the widest number dealt
                        const widest = Math.max(2, ...r.facts.filter((f) => f.tpl === 'fact').map((f) => Math.max(String(f.a).length, String(f.b).length, String(f.ans ?? '').length)));
                        if (r.tracks !== widest) fail(`${r.tracks} digit tracks for a widest number of ${widest} digits`);
                        // D6: CL-31 tab side for the effective digit size
                        const side = TAB_LADDER[factTab(pt)].sideMm;
                        if (r.tabs.some((t) => Math.abs(t - side) > 0.3)) fail(`tab ${r.tabs.join('/')} mm for ${pt} pt digits (CL-31: ${side} mm)`);
                        per[size] = r.n;
                        rows.push({ set: setName, look, size, seed, k: r.k, rows: r.rows, n: r.n, pt, fill: r.fillMax, tracks: r.tracks, longest: r.longest, exact: rep.exact.length, turn: rep.turnarounds.length, fam: rep.families.length, pages: r.pages, note: fillNote });
                    }
                    // D2 / D3: the size ladder
                    if (sc.ladder && !(per.S > per.M && per.M > per.L)) fails.push(`${setName} ${look} seed ${seed}: problems S ${per.S} / M ${per.M} / L ${per.L} (S > M > L)`);
                }
            }
        }
    } finally {
        if (app.problems.length) console.log('page problems:', JSON.stringify(app.problems.filter((p) => p.type !== 'requestfailed').slice(0, 5)));
        await app.close();
    }
    if (TABLE) {
        console.log('set       look  size seed  k rows  n  pt  fill  tracks run ex/turn/fam');
        for (const x of rows) console.log(`${x.set.padEnd(9)} ${x.look.padEnd(5)} ${x.size}   ${String(x.seed).padStart(4)} ${String(x.k).padStart(2)} ${String(x.rows).padStart(3)} ${String(x.n).padStart(3)} ${x.pt} ${x.fill.toFixed(3)} ${x.tracks}      ${x.longest}   ${x.exact}/${x.turn}/${x.fam}${x.note ? '  (fill note)' : ''}`);
    }
    // A summary per set x look x size: the across counts, problems and digit sizes seen.
    const groups = {};
    for (const x of rows) {
        const g = groups[`${x.set} ${x.look} ${x.size}`] = groups[`${x.set} ${x.look} ${x.size}`] || { k: new Set(), n: [], pt: new Set(), fill: [], tr: new Set(), fam: 0, ex: 0, turn: 0, notes: 0 };
        g.k.add(x.k); g.n.push(x.n); g.pt.add(x.pt); g.fill.push(x.fill); g.tr.add(x.tracks); g.fam += x.fam; g.ex += x.exact; g.turn += x.turn; g.notes += x.note ? 1 : 0;
    }
    for (const [k, g] of Object.entries(groups)) {
        console.log(`  ${k.padEnd(20)} across ${[...g.k].join('/')}  problems ${Math.min(...g.n)}-${Math.max(...g.n)}  digits ${[...g.pt].join('/')} pt  fill ${Math.min(...g.fill).toFixed(2)}-${Math.max(...g.fill).toFixed(2)} (${g.notes} noted)  tracks ${[...g.tr].join('/')}  repeats/turnarounds/related ${g.ex}/${g.turn}/${g.fam}`);
    }
    for (const f of fails.slice(0, 40)) console.log(`  FAIL ${f}`);
    const exact = rows.reduce((a, x) => a + x.exact, 0);
    const turn = rows.reduce((a, x) => a + x.turn, 0);
    console.log(`mixed-page check: ${fails.length ? 'FAIL' : 'OK'} (${pages} pages, ${SCENARIOS.length} scenarios x S/M/L x Daily/I Can, up to ${SEEDS} seeds; ${exact} exact repeats and ${turn} turnarounds, all on fill-on pages after the unique facts ran out; ${famPages} page(s) with related facts, all with families allowed; ${fails.length} failure(s))`);
    process.exit(fails.length ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
