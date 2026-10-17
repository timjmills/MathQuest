// critic r3: where the card's phone number line is clipped. For given seeds (generateQuestionFor) at 390x844 touch:
// screenshot the card, and list the row's window, its scroll width, and every ancestor that clips (overflow != visible)
// with its right edge, plus each number/box's right edge.  node critic-390-clip-r3.cjs <outdir> seed...
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '../../../../..');
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const seeds = process.argv.slice(3).map(Number);
(async () => {
  const app = await open({ seed: 9, viewport: { width: 390, height: 844, deviceScaleFactor: 2, hasTouch: true } });
  const { page } = app;
  for (const seed of seeds) {
    const g = await page.evaluate(async (seed) => {
      const st = window.state; const cat = 'patterns', skill = 'skip_count_line';
      window.clearSetOptions({ silent: true }); window.setSetOptions(cat, skill, {}, { silent: true });
      st.category = cat; st.skill = skill; st.isMixedMode = false; st.quizMode = false; st.hasAnswered = false;
      st.gameMode = 'practice'; window.showView('gameView'); st.currentQ = window.generateQuestionFor({ category: cat, skill, seed, itemIndex: 0, opts: {} }); window.renderQuestion();
      await new Promise((r) => setTimeout(r, 1800));
      const w = document.querySelector('[data-mq-swiperow]'); if (!w) return null;
      w.scrollIntoView({ block: 'center' });
      const v = w.getBoundingClientRect();
      const clips = []; for (let e = w; e && e !== document.body; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.overflowX !== 'visible' || cs.clipPath !== 'none') { const r = e.getBoundingClientRect(); clips.push(`${e.tagName}.${String(e.className).split(' ')[0]} ov=${cs.overflowX} L${Math.round(r.left)} R${Math.round(r.right)} padR=${cs.paddingRight}`); } }
      const items = [...w.querySelectorAll('.k2-countrow-body .k2-given, .k2-countrow-body .k2-tile-slot')].map((e) => { const r = e.getBoundingClientRect(); return `${(e.textContent || '').trim() || 'box'}:${Math.round(r.left)}-${Math.round(r.right)}`; });
      return { win: `${Math.round(v.left)}-${Math.round(v.right)} (w ${v.width.toFixed(1)}, scrollW ${w.scrollWidth}, clientW ${w.clientWidth}, style.width ${w.style.width})`, clips, items };
    }, seed);
    await new Promise((r) => setTimeout(r, 300));
    const el = await page.$('.mq-scell');
    if (el) { const b = await el.boundingBox(); const sy = await page.evaluate(() => window.scrollY); await page.screenshot({ path: `${OUT}/card-390-seed${seed}.png`, clip: { x: 0, y: sy + b.y - 10, width: 390, height: b.height + 20 } }); }
    console.log(`seed ${seed}: ${JSON.stringify(g)}`);
  }
  await app.close();
})().catch((e) => { console.error(e); process.exit(1); });
