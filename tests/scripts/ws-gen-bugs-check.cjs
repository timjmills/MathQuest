// Regression check for two generator bugs (WRM-tagging critics, 2026-10):
//   1. measurement:mass_volume_liquid kg dials read 0 (kg max divided by gram steps).
//   2. fraction_operations add_*_unlike ignored `denoms` in their click-all / sort forms.
//   node tests/scripts/ws-gen-bugs-check.cjs   -> prints OK / FAIL, exits non-zero on FAIL
const { open } = require('../lib/ws-harness.cjs');
(async () => {
    const app = await open({ seed: 3 });
    const out = await app.page.evaluate(async () => {
        const G = await import('/js/modules/generate-question.js');
        const res = { zero: {}, denoms: {} };
        for (const opts of [{}, { forms: [0] }, { forms: [1] }]) {
            let z = 0, n = 0, samples = [];
            for (let i = 0; i < 100; i++) {
                const q = window.generateQuestionFor({ category: 'measurement', skill: 'mass_volume_liquid', range: 100, decimals: 0, opts, seed: 9000 + i });
                n++;
                if (Number(q.ans) === 0) { z++; if (samples.length < 3) samples.push(q.text); }
            }
            res.zero[JSON.stringify(opts)] = { z, n, samples };
        }
        const O = await import('/js/modules/skill-options.js');
        for (const skill of ['add_frac_unlike', 'sub_frac_unlike', 'add_mixed_unlike', 'sub_mixed_unlike',
            'add_frac_like_nv', 'sub_frac_like_nv', 'add_frac_unlike_nv', 'sub_frac_unlike_nv', 'add_mixed_unlike_nv', 'sub_mixed_unlike_nv']) {
            // Each family the skill offers on its own (a ticked set equal to the default is inactive).
            const def = O.optionsFor('fraction_operations', skill).find(o => o.id === 'denoms');
            for (const fam of def.values.map(v => [v.v])) {
                let bad = 0, n = 0, samples = [];
                for (let i = 0; i < 60; i++) {
                    const q = window.generateQuestionFor({ category: 'fraction_operations', skill, range: 100, decimals: 0, opts: { denoms: fam }, seed: 7000 + i });
                    n++;
                    const d = G.itemDenominators(q);
                    const opt = (q.options || []).join(' ');
                    const extra = [...String((q.options||[]).map(o => typeof o === "object" && o ? o.label : o).join(" ") + " " + (q.tiles||[]).map(t => t.label).join(" ")).matchAll(/(\d+)\s*\/\s*(\d+)/g)].map(m => Number(m[2]));
                    const all = [...d, ...extra];
                    if (!all.every(x => G.denomAllowed(x, fam))) { bad++; if (samples.length < 2) samples.push((q.text + ' | ' + opt + ' | ' + q.answerType).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 200)); }
                }
                res.denoms[`${skill} ${JSON.stringify(fam)}`] = { bad, n, samples };
            }
        }
        return res;
    });
    let fail = false;
    for (const [k, v] of Object.entries(out.zero)) { console.log(`mass_volume_liquid ${k}: answer 0 in ${v.z}/${v.n}`, v.samples); if (v.z) fail = true; }
    for (const [k, v] of Object.entries(out.denoms)) { console.log(`${k}: off-family ${v.bad}/${v.n}`, v.samples); if (v.bad) fail = true; }
    console.log(fail ? 'ws-gen-bugs-check: FAIL' : 'ws-gen-bugs-check: OK');
    await app.close();
    process.exit(fail ? 1 : 0);
})();
