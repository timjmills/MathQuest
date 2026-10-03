// Wave 1 lane C2, owner 2026-10-03: count_by_tables "Answer spaces: Lines" (WORKSHEET_DESIGN_STANDARD.md SL-3a) and the short
// jump arrows between neighbours (no arcs over the row).
//  - every missing number is a write-on LINE (data-ws-shape="line", a bottom rule only), never a box, on the pupil page; the key
//    writes each answer on its line;
//  - a table row (1-2 and 3 digits) holds its 12 numbers on ONE line at S, M and L; wide numbers take two lines of 6;
//  - an independent page at S fits MORE rows with Lines than with Boxes; the one-page sheet stays 1 page + 1 key page;
//  - a jump arrow sits in every gap (n - 1 per line), centred on the row, no arcs anywhere;
//  - the card and the worksheet at 390 px take an answer in every line.
// Run: /tmp/mq-browser-run.sh node tests/scripts/wave1-c2-lines.cjs
const { open } = require('../lib/ws-harness.cjs');
let fails = 0;
const check = (ok, msg) => { console.log((ok ? 'ok   ' : 'FAIL ') + msg); if (!ok) fails++; };

(async () => {
  const app = await open({ seed: 1, viewport: { width: 1000, height: 1000, deviceScaleFactor: 1 } });
  const { page } = app;
  const res = await page.evaluate(async () => {
    const build = (size, opts, role = 'independent') => window.buildSheet({ role, sections: [{ skills: [{ categoryId: 'multiplication', skillId: 'count_by_tables', opts }], count: 12, pages: 1, columns: 1 }], size, paper: 'Letter', seed: 4242, key: true });
    const dom = (html) => { const d = document.createElement('div'); d.innerHTML = html; return d; };
    const out = {};
    for (const size of ['S', 'M', 'L']) {
      for (const [name, opts] of [['tables', { spaces: 'line' }], ['3-digit', { spaces: 'line', rows: [{ step: 25, start: 'custom', at: 100 }] }], ['5-digit', { spaces: 'line', rows: [{ step: 1000, start: 'custom', at: 14000 }] }], ['boxes', {}]]) {
        const r = await build(size, opts);
        const d = dom(r.pupilHtml), k = dom(r.keyHtml);
        const firstRow = d.querySelector('.k2-countrow-body');
        out[`${size} ${name}`] = {
          perPage: r.items.length / Math.max(1, r.pageCount),
          pages: r.pageCount,
          lines: d.querySelectorAll('[data-ws-shape="line"]').length,
          boxes: d.querySelectorAll('.k2-countrow [data-ws-shape="box"]').length,
          firstLines: firstRow ? firstRow.querySelectorAll('.k2-countrow-line').length : 0,
          perLine: firstRow ? firstRow.querySelector('.k2-countrow-line [style*="display:flex;align-items:flex-start"]').children.length : 0,
          arrows: firstRow ? firstRow.querySelectorAll('.k2-jump').length : 0,
          arcs: d.querySelectorAll('path[d*=" Q"]').length - d.querySelectorAll('.k2-countrow-line > span svg path[d*=" Q"]').length,
          keyFilled: [...k.querySelectorAll('[data-ws-shape="line"]')].every((e) => e.textContent.trim() !== ''),
        };
      }
    }
    const one = await build('S', { onePage: true, spaces: 'line' });
    out.onePage = { pages: one.pageCount, keyPages: one.keyPageCount, items: one.items.length };
    return out;
  });
  for (const size of ['S', 'M', 'L']) {
    const t = res[`${size} tables`], b = res[`${size} boxes`];
    check(t.lines > 0 && t.boxes === 0, `${size}: Lines draws ${t.lines} write-on lines and no answer boxes`);
    check(t.keyFilled, `${size}: the key writes every answer on its line`);
    check(t.firstLines === 1 && t.perLine === 12 && t.arrows === 11, `${size}: a table row is ONE line of 12 with 11 jump arrows (lines ${t.firstLines}, ${t.perLine} per line, ${t.arrows} arrows)`);
    check(t.perPage > b.perPage, `${size}: Lines fits more rows on a page than Boxes (${t.perPage} vs ${b.perPage})`);
    for (const n of ['3-digit', '5-digit']) console.log(`     ${size} ${n}: ${res[`${size} ${n}`].firstLines} line(s), ${res[`${size} ${n}`].perLine} numbers per line`);
  }
  check(res.onePage.pages === 1 && res.onePage.keyPages === 1 && res.onePage.items === 12, `one-page sheet with Lines: ${res.onePage.items} rows, ${res.onePage.pages} page + ${res.onePage.keyPages} key page`);
  // screen: every line takes an answer on the card and the worksheet at 390
  await page.setViewport({ width: 390, height: 900, deviceScaleFactor: 1 });
  for (const host of ['card', 'worksheet']) {
    const n = await page.evaluate(async (host) => {
      const st = window.state;
      window.clearSetOptions({ silent: true });
      window.setSetOptions('multiplication', 'count_by_tables', { spaces: 'line' }, { silent: true });
      st.category = 'multiplication'; st.skill = 'count_by_tables'; st.isMixedMode = false; st.quizMode = false; st.hasAnswered = false;
      if (host === 'card') { st.gameMode = 'practice'; window.showView('gameView'); st.currentQ = window.generateQuestion(); window.renderQuestion(); }
      else { st.gameMode = 'worksheet'; window.showView('worksheetView'); window.initWorksheet(); }
      await new Promise((r) => setTimeout(r, 900));
      const root = [...document.querySelectorAll('.k2-countrow')].find((x) => x.offsetParent);
      return { lines: root ? root.querySelectorAll('[data-ws-shape="line"]').length : 0, inputs: root ? root.querySelectorAll('[data-ws-shape="line"] input').length : 0 };
    }, host);
    check(n.lines > 0 && n.inputs === n.lines, `${host} 390: every line holds an input (${n.inputs}/${n.lines})`);
  }
  check(!app.problems.some((p) => p.type === 'pageerror'), 'no page errors');
  await app.close();
  console.log(fails ? `wave1-c2-lines: FAIL (${fails})` : 'wave1-c2-lines: OK');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
