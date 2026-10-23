// Speed audit (2026-10-23): wall time of window.buildSheet(req) for one skill at S/M/L with its key,
// per role. Times the call only (app already booted); boot time printed separately.
// node tests/audit-runs/speed/time-buildsheet.cjs [--roles independent,guided,test] [--reps 3]
const { open } = require('../../lib/ws-harness.cjs');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const SKILLS = (arg('skills', 'addition:add_20_regroup,multiplication:multiply,fractions:equiv_frac_visual,placevalue:identify,multiplication:count_by_tables')).split(',');
const ROLES = arg('roles', 'independent,guided,review,test').split(',');
const REPS = +arg('reps', '3');
(async () => {
  const t0 = Date.now();
  const { page, close } = await open({ seed: 1 });
  console.log(`boot ${(Date.now() - t0) / 1000}s`);
  const rows = [];
  for (const sk of SKILLS) {
    const [categoryId, skillId] = sk.split(':');
    for (const role of ROLES) for (const size of ['S', 'M', 'L']) {
      const r = await page.evaluate(async ({ categoryId, skillId, role, size, REPS }) => {
        const practice = role === 'independent' || role === 'more-practice';
        const times = []; let pages = null, err = null;
        for (let i = 0; i < REPS; i++) {
          const req = { role, sections: [{ skills: [{ categoryId, skillId }] }], size, look: practice ? 'ican' : 'auto', key: true, seed: 1000 + i };
          const t = performance.now();
          try { const out = await window.buildSheet(req); pages = [out.pageCount, out.keyPageCount]; }
          catch (e) { err = String(e && e.message || e).slice(0, 80); break; }
          times.push(performance.now() - t);
        }
        return { times, pages, err };
      }, { categoryId, skillId, role, size, REPS });
      const ms = r.times.length ? Math.round(r.times.reduce((a, b) => a + b, 0) / r.times.length) : null;
      const first = r.times.length ? Math.round(r.times[0]) : null;
      rows.push({ skill: sk, role, size, meanMs: ms, firstMs: first, pages: r.pages, err: r.err });
      console.log(`${sk}\t${role}\t${size}\tmean ${ms} ms\tfirst ${first} ms\tpages ${JSON.stringify(r.pages)}${r.err ? '\tERR ' + r.err : ''}`);
    }
  }
  require('fs').writeFileSync(require('path').join(__dirname, 'buildsheet-times.json'), JSON.stringify({ date: new Date().toISOString(), rows }, null, 1));
  await close();
})().catch(e => { console.error(e); process.exit(1); });
