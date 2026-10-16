// critic r5: page deal over seeds. usage: node deal.cjs <repo> <seeds> > out
const path = require('path');
const ROOT = process.argv[2];
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const SEEDS = parseInt(process.argv[3] || '30', 10);
const SK = [['fraction_operations','add_fractions_like'],['fraction_operations','sub_fractions_like'],['fraction_operations','add_frac_unlike'],['composing','mixed_composing'],['fractions','fraction_of_set'],['fractions','fraction_of_set_hard']];
const ROLES = (process.argv[4] || 'independent,more-practice').split(',');
const SIZES = (process.argv[5] || 'S,M,L').split(',');
(async () => {
  const app = await open({ seed: 1 });
  const { page } = app;
  for (const [c, s] of SK) for (const role of ROLES) for (const size of SIZES) {
    const rows = [];
    for (let seed = 1; seed <= SEEDS; seed++) {
      const r = await page.evaluate(async ({ c, s, role, size, seed }) => {
        try {
          const out = await window.buildSheet({ role, sections: [{ skills: [{ categoryId: c, skillId: s }] }], size, look: 'ican', seed, key: true });
          const pages = (out.pupilPages || []).map((h) => {
            const d = new DOMParser().parseFromString(typeof h === 'string' ? h : (h.html || ''), 'text/html');
            const cells = [...d.querySelectorAll('.ws-cell')].filter((x) => !x.parentElement.closest('.ws-cell'));
            const lists = cells.filter((x) => x.querySelector('span.opt')).length;
            return { n: cells.length, lists };
          });
          return { pages };
        } catch (e) { return { err: String(e && e.message || e) }; }
      }, { c, s, role, size, seed });
      rows.push({ seed, ...r });
    }
    const errs = rows.filter(r => r.err);
    const pages = rows.flatMap(r => (r.pages || []).map(p => ({ ...p, seed: r.seed })));
    const noProd = pages.filter(p => p.n > 0 && p.lists === p.n && !s.startsWith('fraction_of_set'));
    const multi = pages.filter(p => p.lists > 1);
    const counts = {}; pages.forEach(p => { counts[p.n] = (counts[p.n] || 0) + 1; });
    const pc = {}; rows.forEach(r => { const k = (r.pages||[]).length; pc[k] = (pc[k]||0)+1; });
    console.log(`${s} ${role} ${size}: pages/sheet ${JSON.stringify(pc)} items/page ${JSON.stringify(counts)} noProd ${noProd.length} [${noProd.map(p=>p.seed).join(',')}] multiList ${multi.length} [${multi.map(p=>p.seed+':'+p.lists).join(',')}] errs ${errs.length}${errs.length? ' '+errs[0].err:''}`);
  }
  await app.close();
})().catch(e => { console.error(e); process.exit(1); });
