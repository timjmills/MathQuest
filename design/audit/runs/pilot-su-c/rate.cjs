// per-cell rate: print-lint findings of one rule / cells (data-ws-cell) in pupil+key, same request
const { execFileSync } = require('child_process');
const { open } = require('/home/user/MathQuest/tests/lib/ws-harness.cjs');
const fs = require('fs');
const CASES = JSON.parse(process.argv[2]);
(async () => {
  const out = [];
  for (const c of CASES) {
    const jf = `${process.env.SP}/rate-${out.length}.json`;
    const args = ['tests/scripts/ws-print-lint.cjs', '--source', 'kit', '--skills', c.skills.join(','), '--size', c.size, '--json', jf, '--report-only', ...c.args];
    try { execFileSync('node', args, { stdio: 'ignore', timeout: 590000 }); } catch (e) {}
    const j = JSON.parse(fs.readFileSync(jf, 'utf8'));
    for (const d of j.documents) {
      const n = d.findings.filter((f) => f.rule === c.rule).length;
      const cells = new Set(d.findings.filter((f) => f.rule === c.rule).map((f) => f.page + ':' + f.cell)).size;
      out.push({ cls: c.cls, size: c.size, row: c.args.join(' '), doc: d.id, findings: n, flaggedCells: cells, pages: d.pages });
    }
  }
  // cells per doc via buildSheet
  const { page, close } = await open({ seed: 1 });
  for (const o of out) {
    const c = CASES.find((x) => x.cls === o.cls && x.size === o.size);
    const [cat, sk] = o.doc.split('#')[0].split(':');
    const r = await page.evaluate(async (cat, sk, c) => {
      const cols = c.args.includes('--columns') ? Number(c.args[c.args.indexOf('--columns') + 1]) : undefined;
      const anchors = c.args.includes('--anchors') ? c.args[c.args.indexOf('--anchors') + 1] : 'off';
      const role = c.args.includes('--roles') ? c.args[c.args.indexOf('--roles') + 1] : 'independent';
      const res = await window.buildSheet({ role, sections: [{ skills: [{ categoryId: cat, skillId: sk }], columns: cols }], size: c.size, look: 'ican', key: true, seed: 1, anchors });
      const h = (res.pupilHtml || '') + (res.keyHtml || '');
      return { cells: (h.match(/data-ws-cell=/g) || []).length, ems: (h.match(/<em[ >]/g) || []).length };
    }, cat, sk, c);
    o.cells = r.cells; o.stepNums = r.ems;
  }
  await close();
  for (const o of out) console.log([o.cls, o.size, o.doc.padEnd(34), 'findings', o.findings, 'flaggedCells', o.flaggedCells, 'cells', o.cells, 'rate/cell', o.cells ? (o.flaggedCells / o.cells).toFixed(2) : '-', o.cls === 'TY-11' ? 'per <em> ' + (o.stepNums ? (o.findings / o.stepNums).toFixed(2) : '-') : ''].join(' '));
})();
