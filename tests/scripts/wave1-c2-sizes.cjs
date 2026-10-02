// Wave 1 lane C2: every count_by_tables item is EXACTLY two lines of six numbers (three of five for 15 numbers), filling the
// cell's width, with digits no smaller than the 9 pt floor (WORKSHEET_DESIGN_STANDARD.md TY-10a). Builds real sheets for each
// case, role and size, reads the printed cells and prints the measured digit size. Exit 1 when a rule is missed.
//   /tmp/mq-browser-run.sh node tests/scripts/wave1-c2-sizes.cjs
const { open } = require('../lib/ws-harness.cjs');
const R = (step, start, at, dir) => Object.assign({ step }, start ? { start } : {}, at !== undefined ? { at } : {}, dir ? { dir } : {});
const CASES = {
  'default tables': {},
  'by 25': { rows: [R(25)] },
  'by 1,000 from 14,000': { rows: [R(1000, 'custom', 14000)] },
  'by 100,000 from 1,000,000 (15)': { rows: [R(100000, 'custom', 1000000)], jumps: 15 },
  'back by 12': { rows: [R(12, undefined, undefined, 'down')] },
  'back by 5 from 12 (raised)': { rows: [R(5, 'custom', 12, 'down')] },
  'mixed list': { rows: [R(2, 'zero'), R(5, 'custom', 3), R(25, 'custom', 100, 'down'), R(1000, 'custom', 2000, 'down')] },
  'times each': { rows: [R(7)], times: 'each' },
  'times each large': { rows: [R(1000, 'custom', 14000)], times: 'each' },
  'hexagons large': { rows: [R(25000)], shape: 'hex' },
};
(async () => {
  const app = await open({ seed: 1 });
  const res = await app.page.evaluate(async (CASES) => {
    const out = [];
    for (const size of ['S', 'M', 'L']) for (const [name, opts] of Object.entries(CASES)) for (const role of ['independent', 'test']) {
      const r = await window.buildSheet({ role, sections: [{ skills: [{ categoryId: 'multiplication', skillId: 'count_by_tables', opts }], count: 12, columns: 'auto' }], size, seed: 7, key: false });
      const d = document.createElement('div'); d.innerHTML = r.pupilHtml;
      const bodies = [...d.querySelectorAll('.k2-countrow-body')];
      const lineCounts = bodies.map((b) => [...b.querySelectorAll('.k2-countrow-line')].map((l) => l.querySelectorAll('.k2-given, .k2-tile').length));
      const pts = [...d.querySelectorAll('.k2-given, .k2-tile')].map((e) => parseFloat((/font-size:([\d.]+)pt/.exec(e.getAttribute('style') || '') || [])[1])).filter(Number.isFinite);
      const lbl = [...d.querySelectorAll('.k2-timeslbl')].map((e) => parseFloat((/font-size:([\d.]+)pt/.exec(e.getAttribute('style') || '') || [])[1])).filter(Number.isFinite);
      out.push({ size, name, role, items: bodies.length, lines: [...new Set(lineCounts.map((l) => l.join('+')))], pt: pts.length ? Math.min(...pts) : null, ptMax: pts.length ? Math.max(...pts) : null, lbl: lbl.length ? Math.min(...lbl) : null, pages: r.pageCount });
    }
    return out;
  }, CASES);
  let fail = 0;
  for (const x of res) {
    const want = /15/.test(x.name) ? '5+5+5' : '6+6';
    const ok = x.items > 0 && x.lines.length === 1 && x.lines[0] === want && x.pt >= 9 && (x.lbl === null || x.lbl >= 8);
    if (!ok) fail++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${x.size} ${x.role.padEnd(11)} ${x.name.padEnd(32)} items ${String(x.items).padStart(2)}  lines ${x.lines.join(' | ')}  digits ${x.pt}pt${x.ptMax !== x.pt ? ` (max ${x.ptMax})` : ''}${x.lbl ? `  labels ${x.lbl}pt` : ''}  pages ${x.pages}`);
  }
  await app.close();
  console.log(fail ? `wave1-c2-sizes: FAIL (${fail})` : 'wave1-c2-sizes: OK');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
