const path = require('path');
const { open } = require(path.join(process.argv[2], 'tests/lib/ws-harness.cjs'));
const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
(async () => {
  const app = await open({ seed: 1 });
  for (const [c, s] of [['addition', 'mixed_addition'], ['composing', 'mixed_composing']]) {
    const seed = hash(`${c}__${s}:print`);
    await app.page.evaluate(sd => { if (window.__wsReseed) window.__wsReseed(sd); }, seed);
    const r = await app.page.evaluate(async ({ c, s, seed }) => { const o = await window.buildSheet({ role: 'more-practice', sections: [{ skills: [{ categoryId: c, skillId: s }] }], size: 'S', look: 'ican', key: true, seed });
      const per = {}; o.items.forEach(it => { per[it.letter || '?'] = (per[it.letter || '?'] || 0) + 1; }); return { pages: o.pageCount, keyPages: o.keyPageCount, per, fits: o.fits && o.fits.note }; }, { c, s, seed });
    console.log(s, JSON.stringify(r));
  }
  await app.close();
})();
