// P0-DEAL DIFF (lf-engine 2026-11-09): dump a detailed lesson's Prerequisite Check deal (P0) in this
// checkout - per item: the place, its skill, text, answer - from the pack's v21-pool JSON, at fixed seeds.
// Run it in two trees (MQ_ROOT) and compare; with --against <file> it prints the first difference.
// It also prints the P0 answer twins it finds (the E24b class: two items of the one page sharing an answer).
//
//   node tests/scripts/ws-lesson-deal-diff.cjs --lesson g1-oa1-bar-model-wp-20 --seeds 1,2,4242 --out a.json
//   MQ_ROOT=/tmp/master-wt node tests/scripts/ws-lesson-deal-diff.cjs ... --against a.json
//
// Prints `ws-lesson-deal-diff: OK` (no twins, and equal to --against when given) / `FAIL`.
const fs = require('fs');
const { open } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const LESSON = arg('lesson', 'g1-oa1-bar-model-wp-20');
const SEEDS = arg('seeds', '1,2,4242').split(',').map((s) => parseInt(s, 10) >>> 0);
const PAGE = arg('page', 'P0');

(async () => {
    const app = await open({ seed: 1 });
    const out = {};
    try {
        for (const seed of SEEDS) {
            out[seed] = await app.page.evaluate(async ({ LESSON, seed, PAGE }) => {
                const r = await window.buildSheet({ role: 'detailed-lesson', lessonId: LESSON, seed, paper: 'A4', year: 2026 });
                const m = /<script type="application\/json" id="v21-pool">([\s\S]*?)<\/script>/.exec(r.html || '');
                if (!m) return { error: 'no v21-pool' };
                const pool = JSON.parse(m[1]);
                return (pool.places || []).filter((x) => String(x.page) === PAGE).map((x) => ({
                    item: x.item, rep: x.rep, row: x.row,
                    skill: x.q && (x.q.skill || x.q.skillLabel || ''), text: x.q && String(x.q.text || '').replace(/\s+/g, ' ').slice(0, 60),
                }));
            }, { LESSON, seed, PAGE });
        }
    } finally { await app.close(); }
    // (the pool JSON keeps a place's item KEY - a count's number, a fact's "a+b" - not its question: the answer is read from it)
    const ansOf = (x) => { const m = /^(\d+)\+(\d+)$/.exec(String(x.item)); return m ? String(+m[1] + +m[2]) : String(x.item); };
    let bad = 0;
    for (const seed of SEEDS) {
        const its = out[seed];
        if (!Array.isArray(its)) { console.log(`seed ${seed}: ${JSON.stringify(its)}`); bad++; continue; }
        console.log(`seed ${seed} ${PAGE}: ${its.map((x) => `${x.item}=${ansOf(x)}`).join(' | ')}`);
        const by = new Map();
        for (const x of its) by.set(ansOf(x), (by.get(ansOf(x)) || 0) + 1);
        const tw = [...by].filter(([, c]) => c > 1).map(([a]) => a);
        if (tw.length) { console.log(`  TWIN answers on ${PAGE}: ${tw.join(', ')}`); bad++; }
    }
    if (arg('out')) fs.writeFileSync(arg('out'), JSON.stringify(out, null, 1));
    if (arg('against')) {
        const ref = JSON.parse(fs.readFileSync(arg('against'), 'utf8'));
        for (const seed of SEEDS) {
            const a = ref[seed] || [], b = out[seed] || [];
            const i = [...Array(Math.max(a.length, b.length)).keys()].find((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
            if (i !== undefined) { console.log(`  FIRST DIFF seed ${seed} item ${i}: against ${JSON.stringify(a[i])}  here ${JSON.stringify(b[i])}`); bad++; }
            else console.log(`  seed ${seed}: ${PAGE} identical (${b.length} items)`);
        }
    }
    console.log(`ws-lesson-deal-diff: ${bad ? `FAIL (${bad})` : 'OK'}`);
    process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
