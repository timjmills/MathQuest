// Skip-count lane r2 (critic r1 D5): the Scripted Model page of a count row.
//  - panel k shows, traced, the answers its steps 2..k wrote (at least k-1 traced answers, never fewer than the panel before);
//  - the model fits ONE page at S, M and L.
// Run: node tests/scripts/wave1-c2-model.cjs [outdir]   (outdir: also saves each page as a PNG)
const { open } = require('../lib/ws-harness.cjs');
const OUT = process.argv[2] || '';
let fails = 0;
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };
// critic r2 D8: count_by_tables with a taller drawing (a fact under each number, 15 numbers, a 7-digit row) keeps ONE page too
const SKILLS = [['multiplication', 'count_by_tables', {}, [7]], ['patterns', 'skip_count_grid', {}, [7]], ['patterns', 'skip_count_line', {}, [7]],
  ['multiplication', 'count_by_tables', { times: 'each' }, [7, 11, 23]], ['multiplication', 'count_by_tables', { jumps: 15 }, [7, 11, 23]],
  ['multiplication', 'count_by_tables', { rows: [{ step: 100000, start: 'custom', at: 1000000 }] }, [7, 11, 23]]];
(async () => {
  const app = await open({ seed: 3, viewport: { width: 1000, height: 1400, deviceScaleFactor: 1 } });
  const { page } = app;
  for (const [cat, skill, opts, seeds] of SKILLS) for (const seed of seeds) for (const size of ['S', 'M', 'L']) {
    const r = await page.evaluate(async ({ cat, skill, size, opts, seed }) => {
      const out = await window.buildSheet({ role: 'scripted-model', sections: [{ skills: [{ categoryId: cat, skillId: skill, opts }], count: 1 }], size, seed });
      const d = document.createElement('div'); d.innerHTML = out.pupilHtml;
      const panels = [...d.querySelectorAll('.k2-countrow')];
      const traced = panels.map((p) => [...p.querySelectorAll('[data-ws-slot]')].filter((s) => s.getAttribute('data-ws-ink') === 'trace' && s.textContent.trim()).length);
      const steps = [...d.querySelectorAll('.mq-steptext span')].map((s) => s.textContent);
      return { pages: out.pageCount, traced, steps, html: out.pupilHtml };
    }, { cat, skill, size, opts, seed });
    const oname = Object.keys(opts).length ? JSON.stringify(opts) : '';
    const tag = `${skill}${oname} seed ${seed} ${size}`;
    check(r.traced.length >= 3, `${tag}: ${r.traced.length} model states`);
    check(r.traced.every((n, k) => n >= k && (k === 0 || n >= r.traced[k - 1])), `${tag}: state k traces the answers of steps 2..k (traced per state ${r.traced.join(',')})`);
    r.steps.forEach((t, k) => { const m = /Write ([\d,]+)\./.exec(t); if (m) check(r.traced[k] >= 1, `${tag}: step ${k + 1} "${t}" shows its written answer`); });
    // one page; where two are unavoidable (15 numbers at L: three lines of 5 per state) no page holds a lone state
    const unavoidable = !!opts.jumps && size === 'L';
    check(r.pages === 1 || (unavoidable && r.traced.length >= 2 * r.pages), `${tag}: the model fits one page${unavoidable ? ', or no page holds a lone state' : ''} (${r.pages} page(s), ${r.traced.length} states)`);
    if (OUT) {
      const p2 = await app.browser.newPage();
      await p2.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
      const docHtml = await page.evaluate((h) => window.sheetDocument(h, 'Model'), r.html);
      await p2.setContent(docHtml, { waitUntil: 'networkidle0' }).catch(() => {});
      await p2.screenshot({ path: `${OUT}/model-${skill}${Object.keys(opts).length ? '-' + Object.keys(opts)[0] : ''}-s${seed}-${size}.png`, fullPage: true });
      await p2.close();
    }
  }
  check(!app.problems.some((p) => p.type === 'pageerror'), 'no page errors');
  await app.close();
  console.log(fails ? `wave1-c2-model: FAIL (${fails})` : 'wave1-c2-model: OK');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
