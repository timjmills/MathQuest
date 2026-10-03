// Wave 1 lane C2 owner ruling (2026-10-02): "All rows on one page" with no rows chosen is the compact sheet exactly as it was
// before this lane: 12 tables, each a single compact line of 12 numbers at 16 pt, one page + one key page, A4 and Letter,
// with the default blanks and with every missing-number choice. This is a REAL assertion: it builds those sheets on this
// tree and on a base checkout and fails unless every pupil page and key page is byte-identical.
//
//   git archive 4911898 | tar -x -C /tmp/base-4911898
//   MQ_BASE_ROOT=/tmp/base-4911898 /tmp/mq-browser-run.sh node tests/scripts/wave1-c2-onepage.cjs
// (internally it re-runs itself with MQ_ROOT=<base> and `--digest` to read the base's digest)
const { spawnSync } = require('child_process');
const crypto = require('crypto');
const { open } = require('../lib/ws-harness.cjs');

const CASES = [
  { name: 'default', opts: { onePage: true } },
  { name: 'max blanks (100 %, first only)', opts: { onePage: true, fill: 'one', missing: 100 } },
  { name: 'max blanks (100 %, first two)', opts: { onePage: true, fill: 'two', missing: 100 } },
  { name: 'half', opts: { onePage: true, fill: 'half' } },
  { name: '20 % blank', opts: { onePage: true, missing: 20 } },
  { name: '90 % blank, first only', opts: { onePage: true, fill: 'one', missing: 90 } },
];
const PAPERS = ['A4', 'Letter'];
const sha = (s) => crypto.createHash('sha1').update(String(s)).digest('hex').slice(0, 12);

async function digest() {
  const app = await open({ seed: 1 });
  const out = await app.page.evaluate(async (CASES, PAPERS) => {
    const res = {};
    for (const paper of PAPERS) for (const c of CASES) {
      const r = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId: 'multiplication', skillId: 'count_by_tables', opts: c.opts }], count: 12, pages: 1, columns: 1 }], size: 'S', paper, seed: 4242, key: true });
      res[`${paper} | ${c.name}`] = { pupil: r.pupilHtml, key: r.keyHtml, pages: r.pageCount, keyPages: r.keyPageCount, items: r.items.length };
    }
    return res;
  }, CASES, PAPERS);
  await app.close();
  const dig = {};
  for (const [k, v] of Object.entries(out)) dig[k] = { pupil: sha(v.pupil), key: sha(v.key), pages: v.pages, keyPages: v.keyPages, items: v.items };
  return dig;
}


// CHOSEN ROWS (owner 2026-10-02 round 3): each chosen row ONCE, in the teacher's order, as many as fit; always 1 pupil page + 1 key page
// on A4 and Letter; when more rows are chosen than fit the sheet prints what fits (and the panel says how many).
const R = (step, start, at, dir) => Object.assign({ step }, start ? { start } : {}, at !== undefined ? { at } : {}, dir ? { dir } : {});
const ROW_CASES = [
  { name: 'five rows', rows: [R(3), R(7), R(25, 'zero'), R(100, 'custom', 2300), R(12, undefined, undefined, 'down')] },
  { name: 'wide rows first', rows: [R(100000, 'custom', 1000000), R(1000, 'custom', 14000), R(4), R(9), R(6), R(2), R(8), R(11)] },
  { name: 'twelve rows, shuffled order', rows: [9, 3, 12, 5, 1, 8, 2, 11, 6, 4, 10, 7].map((n) => R(n)) },
  { name: 'twelve wide rows (cut)', rows: [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 25000, 50000, 75000].map((n) => R(n, 'custom', 14000)) },
  { name: 'one row', rows: [R(25, 'custom', 100)] },
  { name: 'seven rows by 1,000s (cut)', rows: [1000, 2000, 3000, 4000, 5000, 6000, 7000].map((n) => R(n, 'custom', 14000)) },
  { name: 'wide and plain mixed (cut)', rows: [R(100000, 'custom', 1000000), R(3), R(1000, 'custom', 14000), R(7), R(2000, 'custom', 14000), R(9), R(3000, 'custom', 14000), R(11), R(4000, 'custom', 14000), R(6), R(5000, 'custom', 14000), R(8)] },
  { name: 'wide row in the middle', rows: [R(3), R(7), R(25, 'zero'), R(100, 'custom', 2300), R(12, undefined, undefined, 'down'), R(1000, 'custom', 14000), R(5, 'custom', 3)] },
];
async function rowsCheck() {
  const app = await open({ seed: 1 });
  const res = await app.page.evaluate(async (ROW_CASES, PAPERS) => {
    const cr = await import('./js/modules/count-rows.js');
    const ui = document.createElement('div');
    const out = [];
    const build = (rows, paper) => window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId: 'multiplication', skillId: 'count_by_tables', opts: { onePage: true, rows } }], count: 12, pages: 1, columns: 1 }], size: 'S', paper, seed: 4242, key: true });
    for (const paper of PAPERS) for (const c of ROW_CASES) {
      const r = await build(c.rows, paper);
      const d = document.createElement('div'); d.innerHTML = r.pupilHtml;
      const tabs = [...d.querySelectorAll('[data-ws-steptab]')].map((e) => Number(e.getAttribute('data-ws-steptab').replace(/[^0-9]/g, '')));
      // the step tab's type size on the page (critic C2 r4: never below 14 pt on the one-page sheet)
      const tabPts = [...d.querySelectorAll('[data-ws-steptab] text')].map((t) => Number(t.getAttribute('font-size')) * 72 / 25.4);
      // TIGHT: with the cap lifted, the printed rows plus the next chosen row make a second page
      let tight = null;
      if (r.items.length < c.rows.length) {
        cr.setOnePageBodyOverride(10000);
        try { const r2 = await build(c.rows.slice(0, r.items.length + 1), paper); tight = r2.pageCount; } finally { cr.setOnePageBodyOverride(0); }
      }
      out.push({ paper, name: c.name, chosen: c.rows.map((x) => x.step), pages: r.pageCount, keyPages: r.keyPageCount, items: r.items.length, tabs, tight, panel: cr.onePagePlan(c.rows, paper).rows.length, minTab: Math.min(...tabPts) });
    }
    return out;
  }, ROW_CASES, PAPERS);
  await app.close();
  return res;
}

(async () => {
  if (process.argv.includes('--digest')) { console.log('DIGEST ' + JSON.stringify(await digest())); return; }
  const base = process.env.MQ_BASE_ROOT;
  if (!base) { console.error('set MQ_BASE_ROOT to a checkout of the base commit (git archive 4911898 | tar -x -C <dir>)'); process.exit(2); }
  const now = await digest();
  const r = spawnSync(process.execPath, [__filename, '--digest'], { env: Object.assign({}, process.env, { MQ_ROOT: base }), encoding: 'utf8', maxBuffer: 1 << 26 });
  const line = (r.stdout || '').split('\n').find((l) => l.startsWith('DIGEST '));
  if (!line) { console.error('the base run printed no digest:\n' + (r.stderr || r.stdout)); process.exit(1); }
  const old = JSON.parse(line.slice(7));
  let fail = 0;
  for (const k of Object.keys(now)) {
    const same = JSON.stringify(now[k]) === JSON.stringify(old[k]);
    const one = now[k].pages === 1 && now[k].keyPages === 1 && now[k].items === 12;
    if (!same || !one) fail++;
    console.log(`${same && one ? 'ok  ' : 'FAIL'} ${k.padEnd(44)} ${same ? 'identical to base' : 'DIFFERS from base'}; ${now[k].pages} page + ${now[k].keyPages} key page, ${now[k].items} items`);
  }
  for (const x of await rowsCheck()) {
    // printed order: the tabs read in the order the rows were chosen (the one-line rows keep their heights within 1.6x, so nothing is regrouped)
    const want = x.chosen.slice(0, x.items);
    const inOrder = JSON.stringify(x.tabs) === JSON.stringify(want);
    const tightOk = x.tight === null || x.tight === 2;
    const ok = x.pages === 1 && x.keyPages === 1 && x.items >= 1 && x.items <= x.chosen.length && inOrder && new Set(x.tabs).size === x.tabs.length && tightOk && x.panel === x.items && x.minTab >= 14 - 0.05;
    if (!ok) fail++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${x.paper} | rows: ${x.name.padEnd(28)} ${x.items} of ${x.chosen.length} rows, ${x.pages} page + ${x.keyPages} key page, each once${inOrder ? ', in order' : ', ORDER WRONG ' + JSON.stringify(x.tabs)}`
      + `${x.tight === null ? '' : x.tight === 2 ? '; tight: one more row makes 2 pages' : `; NOT TIGHT: one more row still ${x.tight} page`}; panel says ${x.panel}${x.panel === x.items ? '' : ' (WRONG)'}; tab text >= ${x.minTab.toFixed(1)} pt`);
  }
  console.log(fail ? `wave1-c2-onepage: FAIL (${fail})` : 'wave1-c2-onepage: OK');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
