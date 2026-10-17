const path = require('path');
const { open } = require(path.join(process.argv[2], 'tests/lib/ws-harness.cjs'));
const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
(async () => { const app = await open({ seed: 1 });
  for (const sk of (process.argv[3] || 'fractions:fraction_of_set').split(',')) for (const size of (process.argv[4] || 'S,M,L').split(',')) {
    const [c, s] = sk.split(':');
    const r = await app.page.evaluate(async ({ c, s, size, seed }) => { const o = await window.buildSheet({ role: 'review', sections: [{ skills: [{ categoryId: c, skillId: s }] }], size, look: 'auto', seed, key: true });
      return { n: o.items.length, fits: o.fits && (o.fits.note || JSON.stringify(o.fits).slice(0, 200)), skills: [...new Set(o.items.map(it => it.skill))].join(" ") , m: o.items.map(it=>it.q && it.q.skillId===s ? 'M' : 'E').join('') }; }, { c, s, size, seed: hash(`${c}__${s}:print`) });
    console.log(s, size, JSON.stringify(r));
  }
  await app.close(); })();
