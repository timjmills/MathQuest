// critic r2 probe (skip-count lane): every screen host (card, worksheet, quiz) x 5 cases x mouse/touch,
// fresh loads at 1366x650, 1280x600, 683x650, 390x844, and resize cycles with NO reload in both directions:
//   up:   fresh 390  -> 1366 -> 390 -> 1280 -> 683 -> 1366
//   down: fresh 1366 -> 390 -> 1366 -> 1280 -> 683 -> 390
// At each step: the gate's own LAYOUT checks (read from wave1-c2-cbwrap.cjs so they are the same checks), plus
// the critic's: box >= 44 px, digit size, page h-scroll, and the state compared with a FRESH render of the SAME
// questions at that width (Math.random reseeded before each render).
// Run from the tree root: node design/audit/runs/skip-count/evidence-r2/critic-probe-r2.cjs <outdir> [quick]
const fs = require('fs'); const path = require('path');
const ROOT = path.resolve(__dirname, '../../../../..');
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const src = fs.readFileSync(path.join(ROOT, 'tests/scripts/wave1-c2-cbwrap.cjs'), 'utf8');
// eslint-disable-next-line no-eval
const { LAYOUT, SHOW } = eval(`(() => { ${src.slice(src.indexOf('const LAYOUT = () =>'), src.indexOf('const sleep ='))}; return { LAYOUT, SHOW }; })()`);
const OUT = process.argv[2]; const QUICK = process.argv[3] === 'quick';
fs.mkdirSync(OUT, { recursive: true });
let fails = 0; const log = [];
const check = (ok, msg) => { const l = (ok ? 'PASS ' : 'FAIL ') + msg; console.log(l); log.push(l); if (!ok) fails++; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CASES = [
  ['multiplication', 'count_by_tables', {}],
  ['multiplication', 'count_by_tables', { spaces: 'line' }],
  ['multiplication', 'count_by_tables', { rows: [{ step: 1000, start: 'custom', at: 14000 }] }],
  ['patterns', 'skip_count_grid', {}],
  ['patterns', 'skip_count_line', {}],
];
const W = { 1366: [1366, 650], 1280: [1280, 600], 683: [683, 650], 390: [390, 844] };
const EXTRA = () => {
  const rows = [...document.querySelectorAll('[data-mq-swiperow]')].filter((e) => e.offsetParent);
  const ins = rows.flatMap((w) => [...w.querySelectorAll('input.mq-cellslot')]).filter((e) => e.getBoundingClientRect().width > 0);
  const small = ins.length ? Math.min(...ins.map((e) => { const r = e.getBoundingClientRect(); return Math.min(r.width, r.height); })) : 0;
  const fsz = ins.length ? Math.min(...ins.map((e) => parseFloat(getComputedStyle(e).fontSize))) : 0;
  const giv = rows.flatMap((w) => [...w.querySelectorAll('.k2-given')]);
  const gfs = giv.length ? Math.min(...giv.map((e) => parseFloat(getComputedStyle(e).fontSize))) : 0;
  const cues = rows.map((w) => { const c = w.querySelector('.k2-swipe-cue'); return !!c && !!c.offsetParent && getComputedStyle(c).display !== 'none'; });
  return { rows: rows.length, small: Math.round(small), inFs: fsz, givFs: gfs, hscroll: document.documentElement.scrollWidth - document.documentElement.clientWidth, cues: cues.filter(Boolean).length };
};
const render = async (page, host, c, seed) => { await page.evaluate((s) => window.__wsReseed && window.__wsReseed(s), seed); await SHOW(page, host, ...c); await sleep(700); };
const snap = async (page) => { const L = await page.evaluate(LAYOUT); const X = await page.evaluate(EXTRA); return { L, X, st: L.map((r) => r.state) }; };
const summary = (s) => `${s.L.length} rows, wrapped ${s.L.filter((r) => r.wrapped).length}, swipes ${s.L.filter((r) => r.swipes).length}, cues ${s.X.cues}, box>=${s.X.small}px, digits ${s.X.givFs}/${s.X.inFs}px, hscroll ${s.X.hscroll}`;
(async () => {
  const hosts = ['card', 'worksheet', 'quiz'];
  const table = [];
  for (const touch of (QUICK ? [true] : [true, false])) {
    for (const host of hosts) {
      for (const c of CASES) {
        // a fresh browser per case (a shared machine detached the frame once in a long single session)
        const app = await open({ seed: 9, viewport: { width: 1366, height: 650, deviceScaleFactor: 1, hasTouch: touch } });
        const { page } = app;
        const tag = `${touch ? 'touch' : 'mouse'} ${host} ${c[1]} ${JSON.stringify(c[2])}`;
        const fresh = {};
        let seed = 1000 + hosts.indexOf(host) * 10 + CASES.indexOf(c);
        for (const w of [1366, 1280, 683, 390]) {
          await page.setViewport({ width: W[w][0], height: W[w][1], deviceScaleFactor: 1, hasTouch: touch });
          await sleep(500);
          await render(page, host, c, seed);
          fresh[w] = await snap(page);
          const errs = fresh[w].L.flatMap((r, i) => r.errs.map((e) => `row ${i}: ${e}`));
          check(!errs.length && fresh[w].X.hscroll <= 0, `${tag} fresh ${w}: ${summary(fresh[w])}${errs.length ? ' - ' + errs.slice(0, 3).join('; ') : ''}`);
          table.push([touch ? 'touch' : 'mouse', host, c[1] + (Object.keys(c[2]).join('') ? '+' + Object.keys(c[2]).join('') : ''), w, summary(fresh[w])]);
          if (touch && Object.keys(c[2]).length === 0) await page.screenshot({ path: `${OUT}/${host}-${w}-${c[1]}.png`, fullPage: host === 'worksheet' && w !== 390 ? false : false });
        }
        for (const [dir, start, seq] of [['up', 390, [1366, 390, 1280, 683, 1366]], ['down', 1366, [390, 1366, 1280, 683, 390]]]) {
          await page.setViewport({ width: W[start][0], height: W[start][1], deviceScaleFactor: 1, hasTouch: touch });
          await sleep(500);
          await render(page, host, c, seed);
          for (const w of seq) {
            await page.setViewport({ width: W[w][0], height: W[w][1], deviceScaleFactor: 1, hasTouch: touch });
            await sleep(1400);
            const s = await snap(page);
            const errs = s.L.flatMap((r, i) => r.errs.map((e) => `row ${i}: ${e}`));
            const same = JSON.stringify(s.st) === JSON.stringify(fresh[w].st);
            const i = s.st.findIndex((x, j) => x !== fresh[w].st[j]);
            check(!errs.length && same && s.X.cues === fresh[w].X.cues && s.X.hscroll <= 0,
              `${tag} ${dir}-cycle ->${w}: ${summary(s)}${errs.length ? ' - ' + errs.slice(0, 2).join('; ') : ''}${same ? '' : ` | differs from fresh ${w} at row ${i}: ${s.st[i]} vs ${fresh[w].st[i]}`}${s.X.cues !== fresh[w].X.cues ? ` | cues ${s.X.cues} vs fresh ${fresh[w].X.cues}` : ''}`);
          }
          if (touch && Object.keys(c[2]).length === 0) await page.screenshot({ path: `${OUT}/${host}-${dir}cycle-end-${seq[seq.length - 1]}-${c[1]}.png` });
        }
        check(!app.problems.some((p) => p.type === 'pageerror'), `${tag}: no page errors ${JSON.stringify(app.problems.filter((p) => p.type === 'pageerror').slice(0, 3))}`);
        await app.close();
      }
    }
  }
  fs.writeFileSync(path.join(OUT, 'probe-r2-fresh-table.tsv'), table.map((r) => r.join('\t')).join('\n') + '\n');
  fs.writeFileSync(path.join(OUT, 'probe-r2.log'), log.join('\n') + '\n');
  console.log(fails ? `probe-r2: FAIL (${fails})` : 'probe-r2: OK');
})().catch((e) => { console.error(e); process.exit(1); });
