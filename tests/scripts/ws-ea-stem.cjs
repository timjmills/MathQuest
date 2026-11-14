// ws-ea-stem - EA-STEM (lead 2026-11-14, the class of TOF-STEM): an Error Analysis story item writes the pupil's number sentence
// "a op b = shown" (error-analysis.js storyWork). On an item the key judges CORRECT the sentence must be TRUE: its operands,
// combined by its operation, give the shown number. A missing-part or unknown-start story printed "44 - 8 = 44" as correct work.
//
//   node tests/scripts/ws-ea-stem.cjs [--skills cat:skill,..] [--sizes M] [--seeds 7,23]   # default: every live skill
// Last line `ws-ea-stem: OK (...)` / `FAIL - n finding(s)`; exit 1 on FAIL. MQ_ROOT=<tree> measures another checkout.
const H = require('../lib/ws-harness.cjs');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const list = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);
// --fixture <key.html>: judge one saved key page without the app (a planted state for the backtest row)
function judgeHtml(html, label) {
    const OPS = { '+': (a, b) => a + b, '−': (a, b) => a - b, '-': (a, b) => a - b, '×': (a, b) => a * b, 'x': (a, b) => a * b, '÷': (a, b) => a / b };
    const num = (s) => Number(String(s).replace(/,/g, ''));
    const bad = [];
    const cells = String(html).split(/<div class="ws-cell/).slice(1);
    for (const c of cells) {
        const w = /class="mq-pupilwork[^"]*"[^>]*>([^<]*)</.exec(c);
        if (!w) continue;
        const txt = w[1].replace(/\s+/g, ' ').trim();
        const m = /^(-?[\d,.]+)((?:\s*[+−\-×x÷]\s*-?[\d,.]+)+)\s*=\s*(-?[\d,.]+)$/.exec(txt);
        if (!m || !/data-judge="correct"/.test(c)) continue;
        const terms = [...m[2].matchAll(/\s*([+−\-×x÷])\s*(-?[\d,.]+)/g)];
        const val = terms.reduce((a, t) => OPS[t[1]](a, num(t[2])), num(m[1]));
        if (Math.abs(val - num(m[3])) > 1e-9) bad.push(`${label}: correct work "${txt}" is false (= ${val})`);
    }
    return bad;
}
(async () => {
    const fx = arg('fixture', '');
    if (fx) {
        const bad = judgeHtml(require('fs').readFileSync(fx, 'utf8'), fx);
        for (const b of bad) console.log('  FAIL ' + b);
        console.log(bad.length ? `ws-ea-stem: FAIL - ${bad.length} finding(s) (fixture)` : 'ws-ea-stem: OK (fixture)');
        process.exit(bad.length ? 1 : 0);
    }
    let app = await H.open({});
    const only = list(arg('skills', ''));
    const all = only.length ? only : await app.page.evaluate(() => Object.entries(window.SKILLS || {}).flatMap(([c, arr]) => (Array.isArray(arr) ? arr : []).filter((s) => s && s.v && !s.retired).map((s) => `${c}:${s.v}`)));
    const out = { bad: [], seen: { works: 0, eq: 0, correct: 0, skills: 0 }, total: 0 };
    const SIZES = list(arg('sizes', 'M')), SEEDS = list(arg('seeds', '7,23')).map(Number);
    let n = 0;
    for (const k of [...new Set(all)]) {
        out.total++;
        // (a fresh browser every 80 skills: one page building every skill's Error Analysis sheet ran out of memory)
        if (++n % 80 === 0) { await app.close(); app = await H.open({}); }
        const r = await app.page.evaluate(async ({ k, SIZES, SEEDS }) => {
            const OPS = { '+': (a, b) => a + b, '−': (a, b) => a - b, '-': (a, b) => a - b, '×': (a, b) => a * b, 'x': (a, b) => a * b, '÷': (a, b) => a / b };
            const num = (s) => Number(String(s).replace(/,/g, ''));
            const bad = [], seen = { works: 0, eq: 0, correct: 0 };
            const [cat, id] = k.split(':');
            for (const size of SIZES) for (const seed of SEEDS) {
                let r; try { r = await window.buildSheet({ role: 'error-analysis', sections: [{ skills: [{ categoryId: cat, skillId: id }], columns: 'auto' }], size, look: 'auto', paper: 'A4', seed, form: 'A', key: true, anchors: 'off' }); } catch (e) { continue; }
                const d = document.createElement('div'); d.innerHTML = r.keyHtml || '';
                for (const w of d.querySelectorAll('.mq-pupilwork')) {
                    seen.works++;
                    const txt = w.textContent.replace(/\s+/g, ' ').trim();
                    const m = /^(-?[\d,.]+)((?:\s*[+−\-×x÷]\s*-?[\d,.]+)+)\s*=\s*(-?[\d,.]+)$/.exec(txt);
                    if (!m) continue;
                    seen.eq++;
                    let cell = w; for (let i = 0; i < 10 && cell && !cell.querySelector('.mq-checkline'); i++) cell = cell.parentElement;
                    const checks = cell ? [...cell.querySelectorAll('.mq-checkline')] : [];
                    if (!checks.length || !/✓/.test(checks[0].textContent)) continue;   // judged Fix it: the shown result is the pupil's error
                    seen.correct++;
                    const terms = [...m[2].matchAll(/\s*([+−\-×x÷])\s*(-?[\d,.]+)/g)];
                    const val = terms.reduce((a, t) => OPS[t[1]](a, num(t[2])), num(m[1]));
                    if (Math.abs(val - num(m[3])) > 1e-9) bad.push(`${k} ${size} seed ${seed}: correct work "${txt}" is false (= ${val})`);
                }
            }
            return { bad, seen };
        }, { k, SIZES, SEEDS });
        out.bad.push(...r.bad);
        for (const x of ['works', 'eq', 'correct']) out.seen[x] += r.seen[x];
        if (r.seen.works) out.seen.skills++;
    }
    await app.close();
    const hit = [...new Set(out.bad.map((b) => b.split(' ')[0]))];
    for (const b of out.bad.slice(0, 60)) console.log('  FAIL ' + b);
    if (out.bad.length > 60) console.log(`  ... ${out.bad.length - 60} more`);
    if (hit.length) console.log(`  skills hit (${hit.length}): ${hit.join(', ')}`);
    console.log(out.bad.length ? `ws-ea-stem: FAIL - ${out.bad.length} finding(s) in ${hit.length} skill(s)` : `ws-ea-stem: OK (${out.total} skills, ${out.seen.skills} with story work, ${out.seen.eq} sentences, ${out.seen.correct} judged correct)`);
    process.exit(out.bad.length ? 1 : 0);
})();
