// critic r5: two consecutive buildSheet calls, same request (preview, then print) - same items?
const path = require('path');
const { open } = require(path.join(process.argv[2], 'tests/lib/ws-harness.cjs'));
(async () => {
  const app = await open({ seed: 1 });
  for (const s of ['fraction_of_set', 'fraction_of_set_hard', 'add_fractions_like']) for (const role of ['independent', 'test']) for (const size of ['S', 'L']) {
    const c = s.startsWith('fraction_of_set') ? 'fractions' : 'fraction_operations';
    const r = await app.page.evaluate(async ({ c, s, role, size }) => {
      const sig = async () => (await window.buildSheet({ role, sections: [{ skills: [{ categoryId: c, skillId: s }] }], size, look: 'ican', seed: 11, key: true })).items.map(it => it.text.slice(0, 30) + '=' + JSON.stringify(it.ans)).join(' | ');
      const out = []; for (let i = 0; i < 4; i++) out.push(await sig());
      return { distinct: new Set(out).size, first: out[0], second: out[1] };
    }, { c, s, role, size });
    console.log(s, role, size, 'distinct sheets over 4 identical builds:', r.distinct, r.distinct > 1 ? '\n  1: ' + r.first + '\n  2: ' + r.second : '');
  }
  await app.close();
})().catch(e => { console.error(e); process.exit(1); });
