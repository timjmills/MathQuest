// Print a few seeded items per skill, text + answer, for a quick look at what a generator deals.
//
//   node tests/scripts/ws-sample-items.cjs --category fractions [--n 4] [--opts '{"denoms":[2]}']
//   node tests/scripts/ws-sample-items.cjs --skill time_quarter --n 6
//
// A development aid for option work (P12): see what each skill really draws before declaring an
// option, and check a value by passing --opts. Not a gate.
const { open } = require('../lib/ws-harness.cjs');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
(async () => {
    const app = await open({ seed: 7 });
    const out = await app.page.evaluate(({ dist, cat, skill, n, opts, fields }) => {
        const plain = (s) => { const d = document.createElement('div'); d.innerHTML = String(s == null ? '' : s); return d.textContent.replace(/\s+/g, ' ').trim(); };
        const res = [];
        for (const [c, list] of Object.entries(window.SKILLS)) {
            if (!Array.isArray(list) || (cat && c !== cat)) continue;
            for (const s of list) {
                if (s.retired || (skill && s.v !== skill)) continue;
                if (dist) {
                    // --dist: how often each answer and each opening of the question occurs.
                    const A = {}, T = {};
                    for (let i = 0; i < dist; i++) {
                        let q; try { q = window.generateQuestionFor({ category: c, skill: s.v, range: 100, decimals: 0, opts, seed: 3000 + i, itemIndex: i % 6 }); } catch (e) { continue; }
                        const a = typeof q.ans === 'object' ? 'obj' : String(q.ans); A[a] = (A[a] || 0) + 1;
                        const t = plain(q.text).replace(/\d+/g, '#').slice(0, 38); T[t] = (T[t] || 0) + 1;
                    }
                    const top = (o) => Object.entries(o).sort((x, y) => y[1] - x[1]).slice(0, 14).map(([k, v]) => `${k}:${v}`).join(' | ');
                    res.push(`== ${c}:${s.v}\n   ANS  ${top(A)}\n   TEXT ${top(T)}`);
                    continue;
                }
                const rows = [];
                for (let i = 0; i < n; i++) {
                    let q; try { q = window.generateQuestionFor({ category: c, skill: s.v, range: 100, decimals: 0, opts, seed: 1000 + i, itemIndex: i }); } catch (e) { rows.push('THROW ' + e.message); continue; }
                    const extra = fields.map(f => `${f}=${JSON.stringify(q[f])}`.slice(0, 80)).join(' ');
                    rows.push(`${plain(q.text).slice(0, 110)} | ans=${JSON.stringify(q.ans).slice(0, 40)} | ${q.printFormat || ''} ${q.cell ? 'cell:' + q.cell.template : ''} ${extra}`);
                }
                res.push(`== ${c}:${s.v} (${s.l})\n   ` + rows.join('\n   '));
            }
        }
        return res.join('\n');
    }, { dist: parseInt(arg('dist', '0'), 10), cat: arg('category', null), skill: arg('skill', null), n: parseInt(arg('n', '3'), 10), opts: JSON.parse(arg('opts', 'null')), fields: (arg('fields', '') || '').split(',').filter(Boolean) });
    console.log(out);
    await app.close();
})();
