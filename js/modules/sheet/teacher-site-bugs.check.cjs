// Regression checks for four app defects found by the teacher-site T1 lane (critic r6, 2026-10-24).
//   node js/modules/sheet/teacher-site-bugs.check.cjs
// 1. buildSheet honours its seed: the same seed reprints the same page, and different seeds deal
//    different first items (add_facts, shade_fraction).
// 2. statistical_question prints its four choices.
// 3. mixed_coordinates: a coordinates item whose grid is only read starts at the top of its cell
//    (ws-legacy--readfig), never centred under a blank band.
// 4. Add/Subtract Fractions (Unlike Denom) (No Visuals): a missing numerator prints as a stacked
//    fraction (box over bar over denominator), never as "? 10".
const { open } = require('../../../tests/lib/ws-harness.cjs');

(async () => {
    const fails = [];
    let pass = 0;
    const ok = (c, what) => { if (c) pass++; else fails.push(what); };
    const app = await open({ seed: 1 });
    try {
        const r = await app.page.evaluate(async () => {
            const out = {};
            const build = (c, s, seed, count) => window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId: c, skillId: s }], count }], seed });
            const first = (b) => String(b.items[0].text).replace(/<[^>]+>/g, '');
            for (const [c, s] of [['addition', 'add_facts'], ['fractions', 'shade_fraction']]) {
                const firsts = [];
                for (let k = 0; k < 24; k++) firsts.push(first(await build(c, s, 100003 + k * 7717, 6)));
                const again = first(await build(c, s, 100003, 6));
                out[s] = { distinct: new Set(firsts).size, n: firsts.length, same: again === firsts[0] };
            }
            const d = document.createElement('div');
            d.innerHTML = (await build('data_analysis', 'statistical_question', 4101, 4)).pupilHtml;
            out.stat = [...d.querySelectorAll('.ws-cell[data-ws-cell]')].map((c) => c.querySelectorAll('.mc-opt').length);
            d.innerHTML = (await build('coordinates', 'mixed_coordinates', 4101, 8)).pupilHtml;
            out.coord = [...d.querySelectorAll('.ws-cell[data-ws-cell]')].map((c) => ({
                read: !!c.querySelector('.ws-legacy--readfig'), plot: /Plot/i.test(c.textContent), q: (c.querySelector('.p-prompt') || {}).textContent || '',
            }));
            out.frac = [];
            for (const s of ['add_frac_unlike_nv', 'sub_frac_unlike_nv']) {
                for (let seed = 1; seed < 60; seed++) {
                    d.innerHTML = (await build('fraction_operations', s, seed, 6)).pupilHtml;
                    for (const c of d.querySelectorAll('.ws-cell[data-ws-cell]')) {
                        if (!/missing numerator/i.test(c.textContent)) continue;
                        out.frac.push({ s, seed, stacked: !!c.querySelector('.fraction-display .frac-miss-num'), loose: /\?\s*\d/.test(c.textContent) });
                    }
                    if (out.frac.filter((f) => f.s === s).length >= 2) break;
                }
            }
            return out;
        });
        for (const s of ['add_facts', 'shade_fraction']) {
            ok(r[s].same, `${s}: the same seed did not reprint the same first item`);
            ok(r[s].distinct >= Math.ceil(r[s].n / 3), `${s}: ${r[s].distinct} distinct first items over ${r[s].n} seeds`);
        }
        ok(r.stat.length > 0 && r.stat.every((n) => n === 4), `statistical_question choices per cell: ${JSON.stringify(r.stat)}`);
        const readable = r.coord.filter((c) => /length|distance|coordinates|Which/i.test(c.q) && !c.plot);
        ok(readable.length > 0 && readable.every((c) => c.read), `mixed_coordinates read-only cells not top-aligned: ${JSON.stringify(r.coord)}`);
        ok(r.coord.filter((c) => c.plot).every((c) => !c.read), 'mixed_coordinates: a plot cell lost its centred workspace');
        for (const s of ['add_frac_unlike_nv', 'sub_frac_unlike_nv']) {
            const f = r.frac.filter((x) => x.s === s);
            ok(f.length > 0, `${s}: no missing-numerator item found to check`);
            ok(f.every((x) => x.stacked && !x.loose), `${s}: missing numerator not stacked: ${JSON.stringify(f)}`);
        }
        if (app.problems.length) fails.push(`console errors: ${app.problems.slice(0, 3).map((p) => p.text).join(' | ')}`);
    } catch (e) {
        fails.push(e.message);
    } finally {
        await app.close();
    }
    if (fails.length) { console.error(`teacher-site-bugs check: FAIL (${fails.length})`); fails.forEach((f) => console.error('  - ' + f)); process.exit(1); }
    console.log(`teacher-site-bugs check: OK (${pass})`);
})();
