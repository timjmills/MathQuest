// critic r5: does the same seed reprint the same fraction_of_set sheet? and task mix per sheet.
const path = require('path');
const ROOT = process.argv[2];
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
(async () => {
  const app = await open({ seed: 1 });
  const { page } = app;
  for (const s of ['fraction_of_set', 'fraction_of_set_hard']) for (const role of ['independent', 'test']) for (const size of ['S', 'L']) {
    const r = await page.evaluate(async ({ s, role, size }) => {
      const sig = async (seed) => { const o = await window.buildSheet({ role, sections: [{ skills: [{ categoryId: 'fractions', skillId: s }] }], size, look: 'ican', seed, key: true });
        return o.items.map((it) => { const t = it.text; const k = it.template === 'fos' ? (/missing/i.test(t) ? 'missing' : /^Find the fraction/.test(t) ? 'of' : 'word') : (it.template || '?'); return k + ':' + t.slice(0, 40) + '=' + JSON.stringify(it.ans); }); };
      const a = await sig(5); window.generateQuestionFor({ category: 'fractions', skill: s, seed: 99 }); const b = await sig(5);
      const mix = {}; for (let sd = 1; sd <= 20; sd++) (await sig(sd)).forEach((x) => { const k = x.split(':')[0]; mix[k] = (mix[k] || 0) + 1; });
      return { same: JSON.stringify(a) === JSON.stringify(b), a, b, mix };
    }, { s, role, size });
    console.log(s, role, size, 'reprint-same', r.same, 'mix20', JSON.stringify(r.mix), '\n  A', r.a.join(' | '), '\n  B', r.b.join(' | '));
  }
  await app.close();
})().catch(e => { console.error(e); process.exit(1); });
