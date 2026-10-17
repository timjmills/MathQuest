// critic r2: the scripted model (D5) over many seeds and options, and the titles (D4) on review and test,
// at S, M and L. Run from the tree root: node design/audit/runs/skip-count/evidence-r2/critic-model-probe-r2.cjs
const path = require('path');
const ROOT = path.resolve(__dirname, '../../../../..');
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
let fails = 0;
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };
const CASES = [
  ['multiplication', 'count_by_tables', {}],
  ['multiplication', 'count_by_tables', { rows: [{ step: 1000, start: 'custom', at: 14000 }] }],
  ['multiplication', 'count_by_tables', { rows: [{ step: 100000, start: 'custom', at: 1000000 }] }],
  ['multiplication', 'count_by_tables', { rows: [{ step: 7, start: 'custom', at: 3 }] }],
  ['multiplication', 'count_by_tables', { jumps: 15 }],
  ['multiplication', 'count_by_tables', { times: 'each' }],
  ['multiplication', 'count_by_tables', { spaces: 'line' }],
  ['patterns', 'skip_count_grid', {}],
  ['patterns', 'skip_count_line', {}],
];
(async () => {
  const app = await open({ seed: 3, viewport: { width: 1000, height: 1400, deviceScaleFactor: 1 } });
  const { page } = app;
  const pagesSeen = {};
  for (const [cat, skill, opts] of CASES) for (const size of ['S', 'M', 'L']) for (let seed = 1; seed <= 12; seed++) {
    const r = await page.evaluate(async ({ cat, skill, opts, size, seed }) => {
      const out = await window.buildSheet({ role: 'scripted-model', sections: [{ skills: [{ categoryId: cat, skillId: skill, opts }], count: 1 }], size, seed });
      const d = document.createElement('div'); d.innerHTML = out.pupilHtml;
      const panels = [...d.querySelectorAll('.k2-countrow')];
      const traced = panels.map((p) => [...p.querySelectorAll('[data-ws-slot]')].filter((s) => s.getAttribute('data-ws-ink') === 'trace' && s.textContent.trim()).map((s) => s.textContent.trim()));
      const steps = [...d.querySelectorAll('.mq-steptext span')].map((s) => s.textContent);
      return { pages: out.pageCount, traced, steps };
    }, { cat, skill, opts, size, seed });
    const tag = `${skill} ${JSON.stringify(opts)} ${size} seed ${seed}`;
    const k = `${skill} ${JSON.stringify(opts)} ${size}`;
    pagesSeen[k] = pagesSeen[k] || {}; pagesSeen[k][r.pages] = (pagesSeen[k][r.pages] || 0) + 1;
    // each "Write N." step shows N traced in its own panel
    const bad = r.steps.map((t, i) => { const m = /Write ([\d,]+)\./.exec(t); return m && !(r.traced[i] || []).includes(m[1]) && !(r.traced[i] || []).includes(m[1].replace(/,/g, '')) ? `step ${i + 1} "${t}" not traced (${(r.traced[i] || []).join('|')})` : null; }).filter(Boolean);
    if (bad.length || r.pages !== 1) check(false, `${tag}: pages ${r.pages}; ${bad.join('; ')}`);
  }
  Object.entries(pagesSeen).forEach(([k, v]) => check(Object.keys(v).length === 1 && v[1], `${k}: model page counts over 12 seeds ${JSON.stringify(v)}`));
  // D4 titles
  for (const [cat, skill] of [['patterns', 'skip_count_grid'], ['patterns', 'skip_count_line'], ['multiplication', 'count_by_tables']]) for (const role of ['review', 'test', 'guided', 'independent', 'more-practice', 'scripted-model']) {
    const t = await page.evaluate(async ({ cat, skill, role }) => {
      const out = await window.buildSheet({ role, sections: [{ skills: [{ categoryId: cat, skillId: skill }] }], size: 'M', seed: 4 });
      const d = document.createElement('div'); d.innerHTML = out.pupilHtml + out.keyHtml;
      return [...new Set([...d.querySelectorAll('h1, h2, .ws-title, .mq-title, [class*="title"]')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()).filter((x) => x && x.length < 90))].slice(0, 4);
    }, { cat, skill, role });
    check(!t.some((x) => /\b\w+iping\b/.test(x)), `${skill} ${role}: titles ${JSON.stringify(t)}`);
  }
  await app.close();
  console.log(fails ? `model-probe-r2: FAIL (${fails})` : 'model-probe-r2: OK');
})().catch((e) => { console.error(e); process.exit(1); });
