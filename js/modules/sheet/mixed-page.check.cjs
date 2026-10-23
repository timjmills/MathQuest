// js/modules/sheet/mixed-page.check.cjs
// THE MIXED PAGE CHECK (critic M1 r3, D1 / D2 / D3 / D4 / D6; IMPROVEMENT_PLAN 1.7: a defect that
// survived two critic rounds becomes a machine check). Builds real Mixed practice pages through
// buildSheet in Chromium and holds every one to:
//
//   repeats    sheet/interleave.js pageRepeats over the page's facts in print order: 0 exact
//              repeats, 0 turnarounds; a fact family twice only where the notes say the skills ran
//              short of different facts (D1)
//   digits     every fact prints at its ladder size (TY-30), at least the size's working digits
//              (16 / 22 / 28 pt at S / M / L, tokens.SIZES) (D2)
//   ladder     for each look, seed and skill set: problems S > M > L (L1) (D2 / D3)
//   fill       the drawn fact over its cell (TY-31) within 55-75 %, or a note that says why (D2 / D5)
//   tracks     the facts' digit tracks are the widest number on the page, no more (D4)
//   tabs       a numbered tab is the CL-31 side for the page's effective digit size (D6)
//
// Sets: the critic's 4-skill set (add_facts, subtract, mult_facts, div_facts vertical) and the
// 2-skill add_facts + subtract set; 20 seeds x S / M / L x Daily / I Can.
//
//   node js/modules/sheet/mixed-page.check.cjs [--seeds 20] [--table]
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
const sk = (id) => { const [base, o] = id.split('@'); const [categoryId, skillId] = base.split(':'); return { categoryId, skillId, opts: o ? JSON.parse(o) : {} }; };
const SETS = {
    critic4: ['addition:add_facts', 'subtraction:subtract', 'multiplication:mult_facts', 'division:div_facts@{"divForm":"vertical"}'],
    add_sub2: ['addition:add_facts', 'subtraction:subtract'],
};
const SIZES_ = ['S', 'M', 'L'];
const LOOKS_ = ['daily', 'ican'];
const FILL_TOL = 0.005;   // a measured box is a fraction of a mm off the drawn formula

async function main() {
    const { pageRepeats } = await import(pathToFileURL(path.join(__dirname, 'interleave.js')).href);
    const { SIZES, TAB_LADDER, factTab } = await import(pathToFileURL(path.join(__dirname, 'tokens.js')).href);
    const app = await open({ seed: 12345 });
    const fails = [];
    const rows = [];
    let pages = 0;
    let famPages = 0;
    try {
        for (const [setName, set] of Object.entries(SETS)) {
            for (let s = 1; s <= SEEDS; s++) {
                const seed = s * 101;
                for (const look of LOOKS_) {
                    const per = {};
                    for (const size of SIZES_) {
                        const r = await app.page.evaluate(async (req) => {
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
                            host.remove();
                            const meta = o.plan.meta || {};
                            return {
                                arr: o.arrangement, notes: o.notes || [], facts, pts: [...pts], cellPts: [...cellPts], fillMax, fillMin, tracks, tabs: [...tabs],
                                k: (meta.fits && meta.fits[0] && meta.fits[0].cols) || 0, rows: (meta.fits && meta.fits[0] && meta.fits[0].rows) || 0,
                                n: o.items.length, longest: meta.interleave ? meta.interleave.longest : null, pages: o.pageCount,
                            };
                        }, { role: 'mixed-practice', sections: [{ skills: set.map(sk) }], size, look, key: false, seed });
                        pages++;
                        const id = `${setName} ${look} ${size} seed ${seed}`;
                        const fail = (why) => fails.push(`${id}: ${why}`);
                        if (r.arr !== 'mixed') { fail(`arranged ${r.arr}`); continue; }
                        // D1: repeats
                        const rep = pageRepeats(r.facts);
                        if (rep.exact.length) fail(`${rep.exact.length} exact repeat(s): ${rep.exact.map((x) => x.key).join(', ')}`);
                        if (rep.turnarounds.length) fail(`${rep.turnarounds.length} turnaround(s): ${rep.turnarounds.map((x) => x.key).join(', ')}`);
                        const famNote = r.notes.some((t) => /fact family/.test(t));
                        if (rep.families.length && !famNote) fail(`${rep.families.length} fact famil${rep.families.length > 1 ? 'ies' : 'y'} twice with no note: ${rep.families.map((x) => x.key).join(', ')}`);
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
                    if (!(per.S > per.M && per.M > per.L)) fails.push(`${setName} ${look} seed ${seed}: problems S ${per.S} / M ${per.M} / L ${per.L} (S > M > L)`);
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
        const g = groups[`${x.set} ${x.look} ${x.size}`] = groups[`${x.set} ${x.look} ${x.size}`] || { k: new Set(), n: [], pt: new Set(), fill: [], tr: new Set(), fam: 0, notes: 0 };
        g.k.add(x.k); g.n.push(x.n); g.pt.add(x.pt); g.fill.push(x.fill); g.tr.add(x.tracks); g.fam += x.fam; g.notes += x.note ? 1 : 0;
    }
    for (const [k, g] of Object.entries(groups)) {
        console.log(`  ${k.padEnd(20)} across ${[...g.k].join('/')}  problems ${Math.min(...g.n)}-${Math.max(...g.n)}  digits ${[...g.pt].join('/')} pt  fill ${Math.min(...g.fill).toFixed(2)}-${Math.max(...g.fill).toFixed(2)} (${g.notes} noted)  tracks ${[...g.tr].join('/')}  families twice ${g.fam}`);
    }
    for (const f of fails.slice(0, 40)) console.log(`  FAIL ${f}`);
    const exact = rows.reduce((a, x) => a + x.exact, 0);
    const turn = rows.reduce((a, x) => a + x.turn, 0);
    console.log(`mixed-page check: ${fails.length ? 'FAIL' : 'OK'} (${pages} pages, ${SEEDS} seeds x S/M/L x Daily/I Can x ${Object.keys(SETS).length} sets; ${exact} exact repeats, ${turn} turnarounds, ${famPages} page(s) with a family twice (each noted); ${fails.length} failure(s))`);
    process.exit(fails.length ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
