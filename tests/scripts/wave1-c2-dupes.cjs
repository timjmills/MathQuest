// Wave 1 lane C2: no two count-by items on a printed page share both their numbers and their gaps, whatever the role and size
// (the critic's "a and c open 7 14 21 [ ]"), and no page has every row opening on the same printed run. Builds real sheets.
//   /tmp/mq-browser-run.sh node tests/scripts/wave1-c2-dupes.cjs
const { open } = require('../lib/ws-harness.cjs');
const R = (step, start, at, dir) => Object.assign({ step }, start ? { start } : {}, at !== undefined ? { at } : {}, dir ? { dir } : {});
const CASES = {
  'one step, times each': { rows: [R(7)], times: 'each' },
  'one step': { rows: [R(25)] },
  'typed start': { rows: [R(5, 'custom', 3)] },
  'two rows': { rows: [R(2, 'zero'), R(9)] },
  'default tables': {},
  'ticked 7, 8': { constant: [7, 8] },
  'half filled': { rows: [R(7)], fill: 'half' },
};
(async () => {
  const app = await open({ seed: 1 });
  const res = await app.page.evaluate(async (CASES) => {
    const out = [];
    for (const [name, opts] of Object.entries(CASES)) for (const role of ['independent', 'more-practice', 'test', 'guided']) for (const size of ['S', 'L']) {
      const r = await window.buildSheet({ role, sections: [{ skills: [{ categoryId: 'multiplication', skillId: 'count_by_tables', opts }], count: 12, columns: 'auto' }], size, seed: 244652, key: false });
      const d = document.createElement('div'); d.innerHTML = r.pupilHtml;
      // one signature per drawn row: its printed numbers and its gaps (a gap is a writing slot)
      // each printed page on its own (More practice letters are separate sheets handed out alone)
      const pages = [...d.querySelectorAll('[data-ws-page], .ws-page')];
      const sigOf = (root) => [...root.querySelectorAll('.k2-countrow-body')].map((b) => [...b.querySelectorAll('.k2-given, .k2-tile')].map((e) => (e.hasAttribute('data-ws-slot') ? '_' : e.textContent.trim())).join(' '));
      (pages.length ? pages : [d]).forEach((pg, k) => { const sigs = sigOf(pg); if (sigs.length) out.push({ name, role, size, sigs, page: k + 1 }); });
    }
    return out;
  }, CASES);
  let fail = 0;
  for (const x of res) {
    const dup = x.sigs.filter((s, i) => x.sigs.indexOf(s) !== i);
    // the first four numbers' printed / gap pattern may repeat, but not on every row of a page of 4 or more
    const pre = x.sigs.map((s) => s.split(' ').slice(0, 5).map((t) => (t === '_' ? '_' : 'n')).join(''));
    const allSamePrefix = x.sigs.length >= 4 && new Set(pre).size === 1;
    // no two rows of one step open with the same first line (its numbers and gaps) while the page has fewer rows than line-1 patterns
    const l1 = x.sigs.map((s) => s.split(' ').slice(0, 6).join(' '));
    const dupLine1 = x.page === 1 && x.sigs.length <= 6 && (l1.length - new Set(l1).size) >= 2 && new Set(x.sigs.map((s) => s.split(' ').filter((t) => t !== '_').slice(0, 1).join())).size === 1;   // at most one repeated first line per page
    const ok = !dup.length && !allSamePrefix && !dupLine1;
    if (!ok) fail++;
    if (!ok || x.role === 'independent' && x.page === 1) console.log(`${ok ? 'ok  ' : 'FAIL'} ${x.name.padEnd(22)} ${x.role.padEnd(13)} ${x.size} p${x.page} ${x.sigs.length} rows${dup.length ? `; duplicate: ${dup[0]}` : ''}${allSamePrefix ? `; every row opens ${pre[0]}` : ''}${dupLine1 ? '; two rows share their first line' : ''}`);
  }
  await app.close();
  console.log(fail ? `wave1-c2-dupes: FAIL (${fail})` : 'wave1-c2-dupes: OK');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
