// Critic s3-stack r1: page-level dealing. buildSheet independent at S, 8 seeds per skill; items parsed from text.
const { open } = require('../../../../../tests/lib/ws-harness.cjs');
const SK = ['sub_50_no_regroup','sub_100_no_regroup','sub_1k_no_regroup','sub_2d_1d'];
(async () => {
  const app = await open({ seed: 7 });
  const res = await app.page.evaluate(async (SK) => {
    const out = {};
    for (const s of SK) {
      const pages = []; const agg = { n: 0, b1: 0, tens: {}, ones9: 0, zero: 0 };
      for (const seed of [11, 22, 33, 44, 55, 66, 77, 88]) {
        const r = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId: 'subtraction', skillId: s, opts: {} }] }], size: 'S', seed, key: true });
        const it = (r.items || []).map(x => { const m = String(x.text).replace(/,/g, '').match(/(\d+)\s*[−-]\s*(\d+)/); return m ? [Number(m[1]), Number(m[2]), String(x.ans)] : null; }).filter(Boolean);
        const mA = {}, mAns = {}; it.forEach(([a, b, ans]) => { mA[a] = (mA[a] || 0) + 1; mAns[ans] = (mAns[ans] || 0) + 1; agg.n++; if (b === 1) agg.b1++; const t = Math.floor(a / 10) % 10; agg.tens[t] = (agg.tens[t] || 0) + 1; if (a % 10 === 9) agg.ones9++; if (/0/.test(String(a))) agg.zero++; });
        pages.push({ seed, n: it.length, maxA: Math.max(...Object.values(mA)), maxAns: Math.max(...Object.values(mAns)), zeroPos: it.map((x, i) => (/0/.test(String(x[0])) ? i : -1)).filter(i => i >= 0), b1: it.filter(x => x[1] === 1).length });
      }
      out[s] = { agg, pages };
    }
    return out;
  }, SK);
  console.log(JSON.stringify(res, null, 1));
  await app.close();
})();
