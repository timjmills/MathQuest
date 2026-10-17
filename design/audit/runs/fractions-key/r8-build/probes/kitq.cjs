const path = require('path');
const { open } = require(path.join(process.argv[2], 'tests/lib/ws-harness.cjs'));
(async () => { const app = await open({ seed: 1 });
  const r = await app.page.evaluate(async (list) => { const m = await import('/js/modules/print-generate.js'); const out = {};
    for (const s of list) { const [c, k] = s.split(':'); out[k] = []; for (let i = 0; i < 4; i++) { const q = window.generateQuestionFor({ category: c, skill: k, seed: 100 + i }); const sp = m.kitCellSpec(q); out[k].push(sp ? sp.template : 'LEGACY:' + (q.printFormat || '') + ':' + (q.cell && q.cell.template)); } }
    return out; }, process.argv[3].split(','));
  console.log(JSON.stringify(r)); await app.close(); })();
