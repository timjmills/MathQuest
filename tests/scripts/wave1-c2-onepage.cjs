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
  console.log(fail ? `wave1-c2-onepage: FAIL (${fail})` : 'wave1-c2-onepage: OK');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
