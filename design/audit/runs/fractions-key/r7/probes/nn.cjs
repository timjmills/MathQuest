// critic r7: how often does a fraction_of_set(_hard) item use a whole n/n? Per printed page and over 300 items.
const path = require('path');
const { open } = require(path.join(process.argv[2], 'tests/lib/ws-harness.cjs'));
(async () => {
  const app = await open({ seed: 1 });
  const out = await app.page.evaluate(async () => {
    const res = {};
    for (const k of ['fraction_of_set', 'fraction_of_set_hard']) {
      let n = 0, nn = 0, half = 0; const ex = [];
      for (let sd = 1; sd <= 50; sd++) for (let i = 0; i < 6; i++) {
        const q = window.generateQuestionFor({ category: 'fractions', skill: k, seed: sd * 101, itemIndex: i });
        const t = String(q.text || '') + ' ' + JSON.stringify((q.cell && q.cell.payload) || {});
        const p = (q.cell && q.cell.payload) || {};
        const num = p.num ?? p.n ?? p.numerator, den = p.den ?? p.d ?? p.denominator;
        let isNN = false;
        if (num != null && den != null) isNN = Number(num) === Number(den);
        else { const m = String(q.text || '').replace(/<[^>]+>/g, ' ').match(/(\d+)\s*\/\s*(\d+)/); if (m) isNN = m[1] === m[2]; }
        n++; if (isNN) { nn++; if (ex.length < 3) ex.push(String(q.text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 60)); }
      }
      res[k] = { n, nn, pct: Math.round(100 * nn / n), keys: Object.keys((window.generateQuestionFor({ category: 'fractions', skill: k, seed: 7, itemIndex: 0 }).cell || {}).payload || {}), ex };
    }
    return res;
  });
  console.log(JSON.stringify(out, null, 1));
  await app.close();
})().catch(e => { console.error(e); process.exit(1); });
