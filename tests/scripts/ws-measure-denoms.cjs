// Which denominators does each fraction skill really draw, and how often?  (P12 development aid)
//
//   node tests/scripts/ws-measure-denoms.cjs [--category fraction_operations] [--n 150]
//
// Samples seeded items at the app defaults and counts, per skill, the share of items whose
// fractions use each denominator (itemDenominators() in generate-question.js — the same reader the
// `denoms` option's accept layer uses). A denominator is worth offering in the skill's
// "Denominators" control only when enough items use it that a redraw finds one quickly.
const { open } = require('../lib/ws-harness.cjs');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const CATS = (arg('category', 'fractions,fraction_operations,conversions,composing,decimals')).split(',');
(async () => {
    const app = await open({ seed: 11 });
    const out = await app.page.evaluate(async ({ cats, n }) => {
        const G = await import('/js/modules/generate-question.js');
        const res = {};
        for (const c of cats) {
            for (const s of (window.SKILLS[c] || [])) {
                if (s.retired) continue;
                const count = {}; let withAny = 0;
                for (let i = 0; i < n; i++) {
                    let q; try { q = window.generateQuestionFor({ category: c, skill: s.v, range: 100, decimals: 0, seed: 5000 + i, itemIndex: i % 6 }); } catch (e) { continue; }
                    const d = [...new Set(G.itemDenominators(q))];
                    if (d.length) withAny++;
                    for (const x of d) count[x] = (count[x] || 0) + 1;
                }
                res[`${c}:${s.v}`] = { withAny, count };
            }
        }
        return res;
    }, { cats: CATS, n: parseInt(arg('n', '150'), 10) });
    for (const [k, v] of Object.entries(out)) {
        const list = Object.entries(v.count).sort((a, b) => Number(a[0]) - Number(b[0])).map(([d, c]) => `${d}:${c}`).join(' ');
        console.log(`${k.padEnd(44)} items-with-fractions ${String(v.withAny).padStart(3)}  ${list}`);
    }
    await app.close();
})();
