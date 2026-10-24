// s3 r1 fix N1b: sub_2d_1d b = 1 rate over 120 generateQuestionFor items and per Independent page.
const { open } = require('../../../../../tests/lib/ws-harness.cjs');
(async () => {
  const app = await open({ seed: 7 });
  const res = await app.page.evaluate(async () => {
    const parse = (x) => { const m = String(x.text).replace(/,/g, '').match(/(\d+)\s*[−-]\s*(\d+)/); return m ? [Number(m[1]), Number(m[2])] : null; };
    let b1 = 0, n = 0;
    for (let i = 0; i < 120; i++) {
      window.state && (window.state.itemIndex = i % 20);
      const q = window.generateQuestionFor({ category: 'subtraction', skill: 'sub_2d_1d', seed: 1000 + i, itemIndex: i % 20 });
      const p = parse(q); if (p) { n++; if (p[1] === 1) b1++; }
    }
    const pages = [];
    for (const seed of [11, 22, 33, 44, 55, 66, 77, 88, 99, 123]) {
      const r = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId: 'subtraction', skillId: 'sub_2d_1d', opts: {} }] }], size: 'S', seed, key: true });
      const it = (r.items || []).map(parse).filter(Boolean);
      let near = 0; for (let k = 1; k < it.length; k++) if (Math.floor(it[k][0] / 10) === Math.floor(it[k - 1][0] / 10) && Math.abs(it[k][1] - it[k - 1][1]) <= 1) near++;
      pages.push({ seed, n: it.length, b1: it.filter(x => x[1] === 1).length, near, first: it.slice(0, 5).map(x => x.join('-')).join(' ') });
    }
    return { gen: { n, b1, pct: (100 * b1 / n).toFixed(1) }, pages };
  });
  console.log(JSON.stringify(res, null, 1));
  await app.close();
})();
