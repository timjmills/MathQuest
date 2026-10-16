const path = require('path');
const { open } = require(path.join(process.argv[2], 'tests/lib/ws-harness.cjs'));
(async () => {
  const app = await open({ seed: 1 });
  const r = await app.page.evaluate(() => {
    const out = {};
    for (const k of ['add_fractions_like', 'sub_fractions_like', 'add_frac_unlike']) {
      const h = {}; let lists = 0;
      for (let sd = 1; sd <= 600; sd++) {
        const q = window.generateQuestionFor({ category: 'fraction_operations', skill: k, seed: sd, itemIndex: sd % 7 });
        if (q.printFormat !== 'multi-select') continue;
        lists++; const ids = Array.isArray(q.ans) ? q.ans : JSON.parse(q.ans); const key = ids.length + '/' + q.options.length; h[key] = (h[key] || 0) + 1;
      }
      out[k] = { lists, h };
    }
    return out;
  });
  console.log(JSON.stringify(r));
  await app.close();
})();
