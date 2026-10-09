// Wave 1 lane C2, owner ruling 2026-10-09: on the online worksheet at Chromebook width (1366 x 768 and 1280 x 720, three cards
// per row) a count row shows the WHOLE row inside its card, wrapped, with no "Swipe -> for more boxes"; a phone (390) keeps the swipe.
//  - every answer input lies inside its card (left/right) and is not clipped by any ancestor;
//  - no swipe cue is visible; no count row scrolls sideways;
//  - at 390 no row is wrapped (the phone keeps the swipe).
// Run: /tmp/mq-browser-run.sh node tests/scripts/wave1-c2-cbwrap.cjs
const { open } = require('../lib/ws-harness.cjs');
let fails = 0;
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };
const CASES = [
  ['multiplication', 'count_by_tables', {}],
  ['multiplication', 'count_by_tables', { spaces: 'line' }],
  ['multiplication', 'count_by_tables', { rows: [{ step: 1000, start: 'custom', at: 14000 }] }],
  ['patterns', 'skip_count_grid', {}],
  ['patterns', 'skip_count_line', {}],
];

const MEASURE = () => {
  const rows = [...document.querySelectorAll('#worksheetView [data-mq-swiperow]')].filter((e) => e.offsetParent);
  const out = { rows: rows.length, inputs: 0, outside: [], clipped: [], cues: 0, scrolls: 0, wrapped: 0, page: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  rows.forEach((w, ri) => {
    if (w.hasAttribute('data-mq-wrapfit')) out.wrapped++;
    if (w.scrollWidth > w.clientWidth + 1 && getComputedStyle(w).overflowX !== 'visible') out.scrolls++;
    w.querySelectorAll('.k2-swipe-cue').forEach((c) => { if (c.offsetParent && getComputedStyle(c).display !== 'none') out.cues++; });
    const cell = w.closest('.mq-scell');
    const cr = cell.getBoundingClientRect();
    w.querySelectorAll('input.mq-cellslot').forEach((el, i) => {
      out.inputs++;
      const r = el.getBoundingClientRect();
      if (r.left < cr.left - 1 || r.right > cr.right + 1) out.outside.push(`row ${ri} #${i}`);
      for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
        if (a.classList.contains('k2-tile-slot') || a.classList.contains('k2-shape-line')) continue;   // the input's own field and line frame (they size the input)
        const cs = getComputedStyle(a);
        if (!/(hidden|auto|scroll|clip)/.test(cs.overflowX + cs.overflowY)) continue;
        const b = a.getBoundingClientRect();
        if (r.left < b.left - 1 || r.right > b.right + 1 || r.top < b.top - 1 || r.bottom > b.bottom + 1) { out.clipped.push(`row ${ri} #${i} by ${a.className || a.tagName}`); break; }
      }
    });
  });
  return out;
};

(async () => {
  const app = await open({ seed: 5, viewport: { width: 1366, height: 768, deviceScaleFactor: 1 } });
  const { page } = app;
  for (const [vw, vh] of [[1366, 768], [1280, 720], [390, 900]]) {
    await page.setViewport({ width: vw, height: vh, deviceScaleFactor: 1 });
    for (const [cat, skill, opts] of CASES) {
      if (vw === 390 && (skill !== 'count_by_tables' || Object.keys(opts).length)) continue;
      await page.evaluate(async ({ cat, skill, opts }) => {
        const st = window.state;
        window.clearSetOptions({ silent: true });
        window.setSetOptions(cat, skill, opts, { silent: true });
        st.category = cat; st.skill = skill; st.isMixedMode = false; st.quizMode = false; st.hasAnswered = false;
        st.gameMode = 'worksheet'; window.showView('worksheetView'); window.initWorksheet();
        await new Promise((r) => setTimeout(r, 1200));
        window.dispatchEvent(new Event('resize'));
        await new Promise((r) => setTimeout(r, 400));
      }, { cat, skill, opts });
      const m = await page.evaluate(MEASURE);
      const tag = `${vw} ${skill} ${JSON.stringify(opts)}`;
      if (vw === 390) {
        check(m.wrapped === 0, `${tag}: the phone never wraps a row (it keeps the swipe where a row is too wide: ${m.cues} cue(s) shown, ${m.wrapped} wrapped)`);
        check(m.page <= 0, `${tag}: no sideways page scroll (${m.page})`);
        continue;
      }
      check(m.rows > 0 && m.inputs > 0, `${tag}: ${m.rows} count rows, ${m.inputs} inputs`);
      check(m.cues === 0, `${tag}: no swipe cue shows (${m.cues})`);
      check(m.scrolls === 0, `${tag}: no count row scrolls sideways (${m.scrolls})`);
      check(!m.outside.length, `${tag}: every input inside its card${m.outside.length ? ' - ' + m.outside.slice(0, 4).join(', ') : ''}`);
      check(!m.clipped.length, `${tag}: no input clipped${m.clipped.length ? ' - ' + m.clipped.slice(0, 4).join(', ') : ''}`);
      check(m.page <= 0, `${tag}: no sideways page scroll (${m.page})`);
    }
  }
  check(!app.problems.some((p) => p.type === 'pageerror'), 'no page errors');
  await app.close();
  console.log(fails ? `wave1-c2-cbwrap: FAIL (${fails})` : 'wave1-c2-cbwrap: OK');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
