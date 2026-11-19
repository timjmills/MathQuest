// ws-guided-model-alone - GUIDED-MODEL-ALONE on the REAL two-step skills (lf-roles r12, lead decision X2 of 2026-11-14).
//
//   A two-step Guided Model is sometimes a column-step story (117-124 mm at M): the Model and its first try then do not share
//   page 1, which held the Model alone (~4 % of M sheets). Guided promotes a dealt item that is shorter as the Model so a try
//   shares page 1. This check builds the Guided sheet of each skill through buildSheet over the seeds and FAILS when page 1
//   holds the Model alone while some item the sheet dealt, set in front as the Model (the rest in their dealt order), gives a
//   page 1 of the Model and a try (re-planned by guided.js plan() on the same dealt items). A lone Model no dealt item can
//   lift is the ruled exception and is counted, not failed.
//
//   node tests/scripts/ws-guided-model-alone.cjs [--skills cat:skill,..] [--seeds 20] [--sizes M]
//   MQ_ROOT=<tree> judges another checkout (ws-backtest commit-pair rows).
// Last line `ws-guided-model-alone: OK (...)` / `FAIL - n finding(s)`; exit 1 on FAIL, 2 on error.
'use strict';
const TOOL = 'ws-guided-model-alone';
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && i + 1 < argv.length ? argv[i + 1] : d; };
const list = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);
const DEFAULT = ['algebra:two_step_mult_div_first', 'algebra:two_step_add_then_mult', 'algebra:two_step_add_then_div',
    'algebra:two_step_letter_equation', 'algebra:two_step_estimate_check', 'algebra:multi_step_word', 'algebra:multi_step_word_plain'];

(async () => {
    const keys = list(arg('skills', arg('skill', DEFAULT.join(','))));
    const N = Number(arg('seeds', '20'));
    const sizes = list(arg('sizes', 'M'));
    const H = require((process.env.MQ_ROOT || '/home/user/MathQuest') + '/tests/lib/ws-harness.cjs');
    let app;
    try {
        app = await H.open({ seed: 1 });
        // (one evaluate per sheet: a whole run in one call passed the browser's protocol timeout)
        const one = (key, size, s) => app.page.evaluate(async ({ key, size, s }) => {
            const GD = (await import(new URL('js/modules/sheet/roles/guided.js', location.href).href)).default;
            const gridItems = (plan) => {
                const its = [];
                const walk = (x) => { if (!x || typeof x !== 'object') return; if (Array.isArray(x)) { x.forEach(walk); return; } if (x.kind === 'grid' && Array.isArray(x.items)) its.push(...x.items.filter(Boolean)); for (const k of ['sections', 'parts', 'content']) if (x[k]) walk(x[k]); };
                (plan.pages || []).forEach(walk);
                return its;
            };
            const p1Alone = (plan) => { const f0 = ((plan.meta || {}).fits || [])[0] || {}; return (f0.rows || 0) * (f0.cols || 0) < 2; };
            const [categoryId, skillId] = key.split(':');
            let r;
            try { r = await window.buildSheet({ role: 'guided', sections: [{ skills: [{ categoryId, skillId }] }], size, paper: 'A4', seed: s, key: false }); }
            catch (e) { return { err: `${key} ${size} seed ${s}: not built (${String(e && e.message || e).slice(0, 100)})` }; }
            const plan = r.plan;
            if (!plan || !p1Alone(plan)) return { lone: false };
            // (a plan cell carries its bridge item's index, ebItem: its measure and template are read there; the word-work
            // footprint is the template's static one)
            const dealt = gridItems(plan).map((it) => { const bi = (r.items || [])[it.ebItem]; return bi && bi.measured ? Object.assign({}, it, { model: undefined, nolabel: undefined, template: bi.template, measured: bi.measured, pool: 'main', footprint: { measure: true, wMm: 93, hMm: null, maxCols: 2, restacks: true } }) : null; }).filter(Boolean);
            const skills = [{ categoryId, skillId, iCan: 'I can', grade: 3 }];
            for (let j = 1; j < dealt.length; j++) {
                try { if (!p1Alone(GD.plan({ ctx: { size }, skills, items: [dealt[j], ...dealt.filter((x, k) => k !== j)] }))) return { lone: true, lift: j }; } catch (e) { /* not a lift */ }
            }
            return { lone: true, lift: null };
        }, { key, size, s });
        const res = { out: [], sheets: 0, lone: 0, ruled: 0 };
        for (const key of keys) for (const size of sizes) for (let s = 1; s <= N; s++) {
            const x = await one(key, size, s);
            if (x.err) { res.out.push(x.err); continue; }
            res.sheets++;
            if (!x.lone) continue;
            res.lone++;
            if (x.lift !== null) res.out.push(`GUIDED-MODEL-ALONE ${key} ${size} seed ${s}: page 1 holds the Model alone, but dealt item ${x.lift + 1} as the Model shares page 1 with a try`);
            else { res.ruled++; console.log(`  (ruled) ${key} ${size} seed ${s}: lone Model, no dealt item lifts it`); }
        }
        res.out.forEach((l) => console.log('  ' + l));
        const tail = `${res.sheets} sheets, ${res.lone} lone-Model page 1 (${(100 * res.lone / Math.max(1, res.sheets)).toFixed(1)} %), ${res.ruled} ruled exception`;
        if (res.out.length) { console.log(`${TOOL}: FAIL - ${res.out.length} finding(s) (${tail})`); process.exitCode = 1; }
        else console.log(`${TOOL}: OK (${tail})`);
    } catch (e) { console.log(`${TOOL}: FAIL - error ${String(e && e.stack || e).split('\n').slice(0, 3).join(' ')}`); process.exitCode = 2; }
    finally { if (app) await app.close(); }
})();
