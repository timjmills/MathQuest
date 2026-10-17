// critic r4 (skip-count lane): D9 check. At 390x844 touch, the practice card for each of the 3 skills, 30 questions
// dealt by generateQuestionFor({seed 1..30}), both loaded fresh at 390 and after a resize 683 -> 390 with no reload.
// For each swipe/wrap row: every given tile and answer box must end inside the NEAREST clipping ancestor (any
// ancestor with overflow-x != visible, its inner right edge = right - border - padding) AND inside the row window,
// i.e. no column straddles a clip. Also records the window width, columns shown and box widths.
// node design/audit/runs/skip-count/evidence-r4/critic-390-clip-r4.cjs <outdir>
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '../../../../..');
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const SK = [['patterns', 'skip_count_line'], ['patterns', 'skip_count_grid'], ['multiplication', 'count_by_tables']];
(async () => {
  const app = await open({ seed: 9, viewport: { width: 390, height: 844, deviceScaleFactor: 2, hasTouch: true, isMobile: true } });
  const { page } = app;
  const lines = []; let fails = 0, checks = 0;
  for (const mode of ['fresh', 'resize']) for (const [cat, skill] of SK) for (let seed = 1; seed <= 30; seed++) {
    await page.setViewport({ width: mode === 'resize' ? 683 : 390, height: mode === 'resize' ? 650 : 844, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
    await page.evaluate(async ({ cat, skill, seed }) => {
      const st = window.state;
      window.clearSetOptions({ silent: true }); window.setSetOptions(cat, skill, {}, { silent: true });
      st.category = cat; st.skill = skill; st.isMixedMode = false; st.quizMode = false; st.hasAnswered = false;
      st.gameMode = 'practice'; window.showView('gameView');
      st.currentQ = window.generateQuestionFor({ category: cat, skill, seed, itemIndex: 0, opts: {} }); window.renderQuestion();
      await new Promise((r) => setTimeout(r, 900));
    }, { cat, skill, seed });
    if (mode === 'resize') { await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, hasTouch: true, isMobile: true }); await new Promise((r) => setTimeout(r, 900)); }
    const g = await page.evaluate(() => {
      const card = document.querySelector('#questionCard'); if (!card) return { err: 'no card' };
      const rows = [...card.querySelectorAll('.k2-countrow-body')]; if (!rows.length) return { rows: [], note: 'no count row' };
      const out = [];
      for (const row of rows) {
        let edge = Infinity, edgeName = '';
        for (let e = row.parentElement; e && e !== document.documentElement; e = e.parentElement) {
          const cs = getComputedStyle(e);
          if (cs.overflowX !== 'visible' || cs.clipPath !== 'none') {
            const r = e.getBoundingClientRect();
            const inner = r.right - parseFloat(cs.borderRightWidth) - (cs.overflowX !== 'visible' ? 0 : 0);
            if (inner < edge) { edge = inner; edgeName = `${e.tagName}.${String(e.className).split(' ')[0]}#${e.id}`; }
          }
        }
        const win = row.closest('[data-mq-swiperow]');
        const wr = win ? win.getBoundingClientRect() : null;
        const vis = Math.min(edge, wr ? wr.right : Infinity, window.innerWidth);
        const items = [...row.querySelectorAll('.k2-given, .k2-tile-slot')].filter((e) => e.getClientRects().length);
        let straddle = [];
        let shown = 0;
        for (const it of items) {
          const r = it.getBoundingClientRect(); if (r.width < 2) continue;
          if (r.left >= vis - 0.5) continue;               // fully beyond: swiped off, fine
          shown++;
          if (r.right > vis + 0.5) straddle.push(`${(it.value || it.textContent || '').trim() || 'box'}:${r.left.toFixed(0)}-${r.right.toFixed(0)}>${vis.toFixed(0)}`);
        }
        const boxes = items.filter((e) => e.matches('.k2-tile-slot')).map((e) => e.getBoundingClientRect().width);
        out.push({ edge: edgeName, vis: Math.round(vis), win: wr ? Math.round(wr.width) : null, shown, straddle, minBox: boxes.length ? Math.round(Math.min(...boxes)) : null, hscroll: document.documentElement.scrollWidth > window.innerWidth + 1 });
      }
      return { rows: out };
    });
    checks++;
    const bad = !!g.err || g.rows.some((r) => r.straddle.length || r.hscroll || (r.minBox !== null && r.minBox < 44));
    if (bad) {
      fails++;
      const el = await page.$('#questionCard'); if (el) await el.screenshot({ path: `${OUT}/fail-${mode}-${skill}-s${seed}.png` });
    }
    lines.push(`${bad ? 'FAIL' : 'ok  '} ${mode} ${skill} seed ${seed}: ${JSON.stringify(g)}`);
  }
  fs.writeFileSync(path.join(OUT, 'clip390-r4.txt'), lines.join('\n') + '\n');
  console.log(`critic-390-clip-r4: ${checks - fails}/${checks} clean; page errors ${app.problems.filter((p) => p.type === 'pageerror').length}`);
  console.log(fails ? 'critic-390-clip-r4: FAIL' : 'critic-390-clip-r4: OK');
  await app.close();
})().catch((e) => { console.error(e); process.exit(1); });
