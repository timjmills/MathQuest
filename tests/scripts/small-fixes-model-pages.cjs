// Small-fixes lane, item 7 (critic r2 N3): the count row that wraps in the Model cell must never cost a page.
// For every count_by_tables option combo, size S/M/L and paper A4/Letter, the Opener and the Scripted Model
// print no more pupil pages (and no more key pages) on this tree than on a base checkout (main before the lane).
// It also asserts the Scripted Model is byte-identical to the base (it never overflowed there) and prints the
// Opener's Independent row count per sheet beside the base's, so a fuller page shows up in the log.
//   git archive 72e05d7 | tar -x -C /tmp/base-72e05d7
//   MQ_BASE_ROOT=/tmp/base-72e05d7 node tests/scripts/small-fixes-model-pages.cjs
// (it re-runs itself with MQ_ROOT=<base> and `--digest` to read the base's numbers)
const { spawnSync } = require('child_process');
const crypto = require('crypto');
const { open } = require('../lib/ws-harness.cjs');

const R = (step, start, at) => Object.assign({ step }, start ? { start } : {}, at !== undefined ? { at } : {});
const COMBOS = [
  { name: 'default', opts: {} },
  { name: 'one page', opts: { onePage: true } },
  { name: 'Lines', opts: { spaces: 'line' } },
  { name: 'Lines + one page', opts: { spaces: 'line', onePage: true } },
  { name: 'step 25', opts: { rows: [R(25)] } },
  { name: 'step 25 + one page', opts: { rows: [R(25)], onePage: true } },
  { name: '1,000 from 14,000', opts: { rows: [R(1000, 'custom', 14000)] } },
  { name: '1,000 from 14,000 + one page', opts: { rows: [R(1000, 'custom', 14000)], onePage: true } },
  { name: 'step 25,000', opts: { rows: [R(25000)] } },
  { name: 'step 25,000 + one page', opts: { rows: [R(25000)], onePage: true } },
  { name: '100,000 from 1,000,000', opts: { rows: [R(100000, 'custom', 1000000)] } },
  { name: '100,000 from 1,000,000 + Lines', opts: { rows: [R(100000, 'custom', 1000000)], spaces: 'line' } },
  { name: 'times under each', opts: { rows: [R(7)], times: 'each' } },
];
const ROLES = ['opener', 'scripted-model'];
const SIZES = ['S', 'M', 'L'];
const PAPERS = ['A4', 'Letter'];
const sha = (s) => crypto.createHash('sha1').update(String(s)).digest('hex').slice(0, 12);

async function digest() {
  const app = await open({ seed: 1 });
  const out = await app.page.evaluate(async (COMBOS, ROLES, SIZES, PAPERS) => {
    const res = {};
    for (const c of COMBOS) for (const role of ROLES) for (const size of SIZES) for (const paper of PAPERS) {
      const k = `${c.name} | ${role} | ${size} | ${paper}`;
      try {
        const r = await window.buildSheet({ role, sections: [{ skills: [{ categoryId: 'multiplication', skillId: 'count_by_tables', opts: c.opts }] }], size, paper, seed: 4242, key: true });
        const note = String((r.fits && r.fits.note) || '');
        const ind = /(\d+) independent/.exec(note);
        res[k] = { pages: r.pageCount, keyPages: r.keyPageCount, html: r.pupilHtml + r.keyHtml, indep: ind ? Number(ind[1]) : null };
      } catch (e) { res[k] = { error: String(e && e.message || e).slice(0, 80) }; }
    }
    return res;
  }, COMBOS, ROLES, SIZES, PAPERS);
  await app.close();
  for (const v of Object.values(out)) if (v.html !== undefined) { v.sha = sha(v.html); delete v.html; }
  return out;
}

(async () => {
  if (process.argv.includes('--digest')) { console.log('DIGEST ' + JSON.stringify(await digest())); return; }
  const base = process.env.MQ_BASE_ROOT;
  if (!base) { console.log('small-fixes-model-pages: set MQ_BASE_ROOT to a checkout of main before the lane (git archive 72e05d7 | tar -x -C <dir>)'); process.exit(2); }
  const r = spawnSync(process.execPath, [__filename, '--digest'], { env: Object.assign({}, process.env, { MQ_ROOT: base }), encoding: 'utf8', maxBuffer: 1 << 26 });
  const line = String(r.stdout || '').split('\n').find((l) => l.startsWith('DIGEST '));
  if (!line) { console.log(r.stdout, r.stderr); console.log('small-fixes-model-pages: FAIL - no base digest'); process.exit(1); }
  const was = JSON.parse(line.slice(7));
  const now = await digest();
  let bad = 0;
  for (const k of Object.keys(now)) {
    const a = now[k], b = was[k] || {};
    const errs = [];
    if (a.error) errs.push(`error ${a.error}`);
    if (!a.error && !b.error) {
      if (a.pages > b.pages) errs.push(`pupil pages ${b.pages} -> ${a.pages}`);
      if (a.keyPages > b.keyPages) errs.push(`key pages ${b.keyPages} -> ${a.keyPages}`);
      if (k.includes('| scripted-model |') && a.sha !== b.sha) errs.push('scripted model differs from base');
    }
    if (errs.length) bad++;
    const ind = k.includes('| opener |') ? `  independent rows ${b.indep} -> ${a.indep}` : '';
    console.log(`${errs.length ? 'FAIL' : 'ok  '} ${k.padEnd(52)} pages ${b.pages}/${b.keyPages} -> ${a.pages}/${a.keyPages}${ind}${errs.length ? '  ' + errs.join('; ') : ''}`);
  }
  console.log(`small-fixes-model-pages: ${bad ? 'FAIL' : 'OK'} (${Object.keys(now).length} sheets${bad ? `, ${bad} failing` : ''})`);
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); console.log('small-fixes-model-pages: FAIL'); process.exit(1); });
