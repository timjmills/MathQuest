// Critic s3-stack r1: content probe. generateQuestionFor 120 seeded items per skill x opts, plus
// buildSheet independent pages (5 seeds) for page-level repeats and zero-item position.
const { open } = require('../../../../../tests/lib/ws-harness.cjs');
const SK = ['sub_50_no_regroup','sub_100_no_regroup','sub_1k_no_regroup','sub_10k_no_regroup','sub_100k_no_regroup','sub_1m_no_regroup','sub_2d_1d'];
(async () => {
  const app = await open({ seed: 7 });
  const { page } = app;
  const res = await page.evaluate(async (SK) => {
    const out = {};
    const borrow = (a, b) => { const A = String(a).split('').reverse(), B = String(b).split('').reverse(); return B.some((d, i) => Number(d) > Number(A[i])); };
    for (const s of SK) {
      for (const [tag, opts] of [['default', {}], ['zeros', { zeros: 'on' }], ['shorter', { lengths: 'shorter' }]]) {
        const rows = [];
        for (let i = 0; i < 120; i++) {
          try {
            const q = await window.generateQuestionFor({ category: 'subtraction', skill: s, opts, seed: 1000 + i * 7919 });
            const p = q.cell && q.cell.payload || {};
            let a = (p.operands||[])[0] ?? p.a, b = (p.operands||[])[1] ?? p.b;
            if (a == null && Array.isArray(p.rows)) { a = p.rows[0]; b = p.rows[1]; }
            rows.push({ a: Number(String(a).replace(/,/g, '')), b: Number(String(b).replace(/,/g, '')), ans: Number(String(q.ans).replace(/,/g, '')), tpl: q.cell && q.cell.template, text: q.text && q.text.slice(0, 30) });
          } catch (e) { rows.push({ err: String(e) }); }
        }
        const ok = rows.filter(r => !r.err);
        const cnt = (f) => { const m = {}; ok.forEach(r => { const k = f(r); m[k] = (m[k] || 0) + 1; }); return m; };
        const top = (m) => Object.entries(m).sort((x, y) => y[1] - x[1]).slice(0, 4);
        out[s + '|' + tag] = {
          n: ok.length, errs: rows.length - ok.length,
          notStack: ok.filter(r => r.tpl !== 'stack').length,
          wrongKey: ok.filter(r => r.a - r.b !== r.ans).length,
          regroup: ok.filter(r => borrow(r.a, r.b)).length,
          zeroCase: ok.filter(r => /0/.test(String(r.a)) || /0/.test(String(r.b)) || String(r.ans).length < String(r.a).length || String(r.a - r.b).split('').some((d, i, arr) => false)).length,
          minA: Math.min(...ok.map(r => r.a)), maxA: Math.max(...ok.map(r => r.a)),
          topOnes9: ok.filter(r => r.a % 10 === 9).length,
          b1: ok.filter(r => r.b === 1).length,
          topMinuend: top(cnt(r => r.a)), topAns: top(cnt(r => r.ans)),
          sample: ok.slice(0, 6).map(r => `${r.a}-${r.b}=${r.ans}`), tpl: [...new Set(ok.map(r => r.tpl))],
        };
      }
      // page-level: 5 seeds, independent S
      out[s + '|pages'] = [];
      for (const seed of [11, 22, 33, 44, 55]) {
        try {
          const r = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId: 'subtraction', skillId: s, opts: {} }] }], size: 'S', seed, key: true });
          const keys0 = r.items && r.items[0] ? Object.keys(r.items[0]).join(',') : 'none'; const items = (r.items || []).map(it => { const q = it.q || it.question || it; const p = (q.cell && q.cell.payload) || it.payload || {}; return { a: Number(String((p.operands||[])[0]).replace(/,/g, '')), b: Number(String((p.operands||[])[1]).replace(/,/g, '')), ans: String(q.ans ?? (p.ans)) }; });
          const mA = {}, mAns = {}; items.forEach(x => { mA[x.a] = (mA[x.a] || 0) + 1; mAns[x.ans] = (mAns[x.ans] || 0) + 1; });
          out[s + '|pages'].push({ seed, keys0, n: items.length, maxMinuendRepeat: Math.max(...Object.values(mA)), maxAnsRepeat: Math.max(...Object.values(mAns)), zeroPos: items.map((x, i) => (/0/.test(String(x.a)) ? i : -1)).filter(i => i >= 0), dups: items.length - new Set(items.map(x => x.a + '-' + x.b)).size, first: items.slice(0, 4).map(x => `${x.a}-${x.b}`) });
        } catch (e) { out[s + '|pages'].push({ seed, err: String(e) }); }
      }
    }
    return out;
  }, SK);
  console.log(JSON.stringify(res, null, 1));
  await app.close();
})();
