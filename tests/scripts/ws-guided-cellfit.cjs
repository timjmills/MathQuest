#!/usr/bin/env node
// ws-guided-cellfit.cjs - CELL-FITS (lf-roles r16 F3, lead 2026-11-20): on every Guided page after the first, every top-level
// [data-ws-cell] holds its content (scrollHeight <= clientHeight + 1 px). A two-step story Guided L carried its hinted try on page
// 2 in a row sized without the hint line: the grey line sat on the cell's bottom edge and the rule did not print.
//   node tests/scripts/ws-guided-cellfit.cjs [--skills cat:skill,..] [--sizes M,L] [--seeds 1,2,591220]
//   MQ_ROOT=<tree> ... (ws-backtest commit-pair)
// Prints `ws-guided-cellfit: OK` / `FAIL (n)`.
const path = require('path');
const H = require(path.join(__dirname, '..', 'lib', 'ws-harness.cjs'));
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const SKILLS = arg('skills', 'algebra:multi_step_word_plain,algebra:two_step_add_then_div,algebra:two_step_mult_div_first').split(',');
const SIZES = arg('sizes', 'M,L').split(',');
const SEEDS = arg('seeds', '1,2,591220').split(',').map(Number);
(async () => {
    const app = await H.open({});
    const bad = await app.page.evaluate(async (SKILLS, SIZES, SEEDS) => {
        const out = [];
        for (const k of SKILLS) for (const size of SIZES) for (const seed of SEEDS) {
            const [categoryId, skillId] = k.split(':');
            const b = await window.buildSheet({ role: 'guided', sections: [{ skills: [{ categoryId, skillId }], columns: 'auto' }], size, paper: 'A4', seed, key: false });
            if (b.error) { out.push(`${k} ${size} seed ${seed}: ${b.error}`); continue; }
            const d = document.createElement('div'); d.innerHTML = b.pupilHtml; document.body.appendChild(d); await document.fonts.ready;
            [...d.querySelectorAll('.ws-page')].forEach((pg, pi) => { if (!pi) return; [...pg.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]')).forEach((c, ci) => {
                const over = c.scrollHeight - c.clientHeight; if (over > 1) out.push(`CELL-FITS ${k} guided ${size} seed ${seed} p${pi + 1} cell ${ci + 1}: content ${over} px past the cell`); }); });
            d.remove();
        }
        return out;
    }, SKILLS, SIZES, SEEDS);
    bad.forEach((x) => console.log('  ' + x));
    console.log(bad.length ? `ws-guided-cellfit: FAIL (${bad.length})` : 'ws-guided-cellfit: OK');
    process.exit(bad.length ? 1 : 0);
})().catch((e) => { console.log('ws-guided-cellfit: FAIL (error ' + (e && e.message) + ')'); process.exit(1); });
