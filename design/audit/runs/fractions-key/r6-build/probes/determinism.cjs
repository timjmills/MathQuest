// r6 R5-2: the same request built 4 times (with unrelated live generations between builds) gives
// byte-identical pupilHtml and keyHtml; and the fos kind sequence over 30 items does not cycle.
const path = require('path');
const ROOT = process.argv[2];
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const SK = [['fractions', 'fraction_of_set'], ['fractions', 'fraction_of_set_hard'], ['fraction_operations', 'add_fractions_like'], ['fraction_operations', 'sub_fractions_like'], ['fraction_operations', 'add_frac_unlike']];
(async () => {
  const app = await open({ seed: 1 });
  const { page } = app;
  let bad = 0, rows = 0;
  for (const [c, s] of SK) for (const role of ['independent', 'more-practice', 'test']) for (const size of ['S', 'L']) {
    const r = await page.evaluate(async ({ c, s, role, size }) => {
      const out = [];
      for (const seed of [1, 5, 11, 23, 42]) {
        const h = [];
        for (let b = 0; b < 4; b++) {
          // unrelated live play between builds (the old session counter moved here)
          for (let j = 0; j < b * 3 + 1; j++) { window.generateQuestionFor({ category: c, skill: s, seed: 1000 + j * 17 + b }); window.generateQuestionFor({ category: 'fractions', skill: 'fraction_of_set_hard', seed: 77 + j }); }
          const o = await window.buildSheet({ role, sections: [{ skills: [{ categoryId: c, skillId: s }] }], size, look: 'ican', seed, key: true });
          h.push(o.pupilHtml + '\u0000' + o.keyHtml);
        }
        out.push({ seed, distinct: new Set(h).size, bytes: h[0].length });
      }
      return out;
    }, { c, s, role, size });
    rows++;
    const d = r.filter(x => x.distinct !== 1);
    if (d.length) bad++;
    console.log(`${s.padEnd(22)} ${role.padEnd(13)} ${size}  seeds ${r.map(x => `${x.seed}:${x.distinct}`).join(' ')}  ${d.length ? 'DIFFERS' : 'identical'}`);
  }
  // kind sequence (fos): 30 items of one page, itemIndex 0..29
  for (const s of ['fraction_of_set', 'fraction_of_set_hard']) for (const seed of [3, 9]) {
    const seq = await page.evaluate((s, seed) => {
      const k = []; for (let i = 0; i < 30; i++) { const q = window.generateQuestionFor({ category: 'fractions', skill: s, seed: seed * 1000 + i, itemIndex: i }); k.push(q.printFormat === 'multi-select' ? 'L' : (q.cell && q.cell.payload && q.cell.payload.task || '?')[0].toUpperCase()); }
      return k.join('');
    }, s, seed);
    const per = (p) => { for (let i = p; i < seq.length; i++) if (seq[i] !== seq[i - p]) return false; return true; };
    const cyc = [2, 3, 4, 5, 6].filter(per);
    console.log(`${s} seed ${seed} kinds over 30: ${seq}  cycle: ${cyc.length ? 'YES ' + cyc : 'none'}`);
  }
  console.log(`determinism: ${rows - bad}/${rows} rows byte-identical`);
  await app.close();
})().catch(e => { console.error(e); process.exit(1); });
