const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.argv[2]; const SHOTDIR = process.argv[3];
const SK = ['conversions:double_num_line','coordinates:coordinates_read_all','data_analysis:box_plot_intro','data_analysis:box_plot_quartiles','data_analysis:histogram_read','graphs:line_plot','shapes_classify:hotspot_quads','multiplication:mult_chart_easy','coordinates:geo_translate'];
const RUNS = [
  { name: '1024', w: 1024, h: 768, touch: true, skills: SK },
  { name: '820', w: 820, h: 1180, touch: true, skills: SK },
  { name: '1280', w: 1280, h: 1000, touch: false, skills: ['data_analysis:histogram_read'] },
  { name: '1366', w: 1366, h: 768, touch: false, skills: ['shapes_classify:hotspot_quads'] },
  { name: '1024-classic', w: 1024, h: 768, touch: false, skills: ['shapes_classify:hotspot_quads','conversions:double_num_line'] },
];
const shotsWanted = new Set(['1024|shapes_classify:hotspot_quads','820|data_analysis:histogram_read','1024|conversions:double_num_line','820|graphs:line_plot','1366|shapes_classify:hotspot_quads','1024-classic|shapes_classify:hotspot_quads','820|multiplication:mult_chart_easy']);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const res = [];
  for (const run of RUNS) {
    const browser = await chromium.launch(run.touch ? {} : { args: ['--hide-scrollbars=false'] , ignoreDefaultArgs: ['--hide-scrollbars'] });
    const ctx = await browser.newContext({ viewport: { width: run.w, height: run.h }, hasTouch: run.touch, isMobile: false });
    const page = await ctx.newPage();
    const errs = []; page.on('pageerror', e => errs.push(String(e)));
    await page.goto('http://localhost:5177/index.html'); await sleep(2500);
    for (const ref of run.skills) {
      const [categoryId, skillId] = ref.split(':');
      await page.evaluate(() => { if (window.closeSkillOptionsPanel) window.closeSkillOptionsPanel(); });
      await page.evaluate(({ categoryId, skillId }) => {
        if (!document.body.classList.contains('teacher-mode') && window.toggleUserRole) window.toggleUserRole();
        const s = (window.SKILLS[categoryId] || []).find((x) => x.v === skillId);
        window.UnifiedSkills.clear();
        window.UnifiedSkills.add({ domainId: 'x', categoryId, skillId, skillLabel: s ? s.l : skillId, categoryIcon: '', categoryName: categoryId, domainColor: '#8b5cf6' });
        window.UnifiedSkills._syncAllImmediate(); window.tvGo('sets');
      }, { categoryId, skillId });
      const sel = `.tv-opt-btn[data-key="${categoryId}|${skillId}"]`;
      await page.waitForSelector(sel, { timeout: 10000 });
      await page.evaluate((sel) => document.querySelector(sel).scrollIntoView({ block: 'center' }), sel);
      if (run.touch) await page.tap(sel); else await page.click(sel);
      await page.waitForSelector('#skillOptionsPopover', { timeout: 5000 }); await sleep(1200);
      const parts = []; let shot = false;
      for (let i = 0; i < 12; i++) {
        const m = await page.evaluate(() => {
          const pop = document.querySelector('#skillOptionsPopover'); const frame = pop && pop.querySelector('.tv-sko-frame');
          if (!frame) return { noFrame: true };
          const cue = frame.parentElement.querySelector(':scope > [data-sko-scroll-cue]');
          const cr = cue && cue.getBoundingClientRect(); const fr = frame.getBoundingClientRect();
          const done = [...pop.querySelectorAll('button')].find(b => /^\s*Done\s*$/.test(b.textContent));
          const dr = done && done.getBoundingClientRect();
          const ctrls = [...pop.querySelectorAll('input,select,button')].filter(e => e.getClientRects().length).map(e => e.getBoundingClientRect());
          const outCtrl = ctrls.filter(r => r.right > innerWidth + 1 || r.left < -1).length;
          const partEl = pop.querySelector('.tv-sko-part:not([hidden]) .tv-sko-part-n');
          return { part: partEl ? partEl.textContent.trim() : '', isScroll: frame.classList.contains('is-scroll'), ox: frame.scrollWidth - frame.clientWidth, oy: frame.scrollHeight - frame.clientHeight,
            gutter: frame.offsetHeight - frame.clientHeight - frame.clientTop*2, cue: cue ? cue.textContent : null, cueVis: !!cr && cr.height > 0 && cr.top >= 0 && cr.bottom <= innerHeight, cueFs: cue ? getComputedStyle(cue).fontSize : null, cueGapToFrame: cr ? Math.round(cr.top - fr.bottom) : null,
            tabindex: frame.getAttribute('tabindex'), done: dr ? { inWin: dr.top >= 0 && dr.bottom <= innerHeight && dr.left >= 0 && dr.right <= innerWidth, top: Math.round(dr.top), bottom: Math.round(dr.bottom) } : null, outCtrl,
            popBottom: Math.round(pop.getBoundingClientRect().bottom), vh: innerHeight };
        });
        // reachability on a scrolling part
        if (m.ox > 8 || m.oy > 8) {
          const fb = await page.evaluate(() => { const f = document.querySelector('#skillOptionsPopover .tv-sko-frame'); const r = f.getBoundingClientRect(); f.scrollLeft = 0; f.scrollTop = 0; return { x: r.left + r.width/2, y: r.top + r.height/2 }; });
          if (run.touch) {
            const cdp = await ctx.newCDPSession(page);
            const dx = m.ox > 8 ? -150 : 0, dy = m.oy > 8 ? -150 : 0;
            await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: fb.x, y: fb.y }] });
            for (let s = 1; s <= 10; s++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: fb.x + dx*s/10, y: fb.y + dy*s/10 }] }); await sleep(16); }
            await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(400);
            m.drag = await page.evaluate(() => { const f = document.querySelector('#skillOptionsPopover .tv-sko-frame'); return { l: Math.round(f.scrollLeft), t: Math.round(f.scrollTop) }; });
          } else {
            await page.mouse.move(fb.x, fb.y); await page.mouse.wheel(m.ox > 8 ? 200 : 0, m.oy > 8 ? 200 : 0); await sleep(300);
            m.wheel = await page.evaluate(() => { const f = document.querySelector('#skillOptionsPopover .tv-sko-frame'); return { l: Math.round(f.scrollLeft), t: Math.round(f.scrollTop) }; });
          }
          await page.evaluate(() => { const f = document.querySelector('#skillOptionsPopover .tv-sko-frame'); f.scrollLeft = 0; f.scrollTop = 0; f.focus(); });
          m.focused = await page.evaluate(() => document.activeElement && document.activeElement.classList.contains('tv-sko-frame'));
          for (let k = 0; k < 6; k++) await page.keyboard.press(m.ox > 8 ? 'ArrowRight' : 'ArrowDown');
          await sleep(300);
          m.key = await page.evaluate(() => { const f = document.querySelector('#skillOptionsPopover .tv-sko-frame'); return { l: Math.round(f.scrollLeft), t: Math.round(f.scrollTop) }; });
          await page.evaluate(() => { const f = document.querySelector('#skillOptionsPopover .tv-sko-frame'); f.scrollLeft = 0; f.scrollTop = 0; });
          if (!shot && shotsWanted.has(`${run.name}|${ref}`)) { shot = true; const pop = await page.$('#skillOptionsPopover'); await page.screenshot({ path: `${SHOTDIR}/${run.name}-${skillId}-${(m.part||'p').replace(/\W+/g,'_')}.png` }); }
        }
        parts.push(m);
        const nxt = await page.evaluate(() => { const b = document.querySelector('#skillOptionsPopover .tv-sko-part:not([hidden]) [data-sko-part="1"]'); if (!b || b.disabled) return false; b.click(); return true; });
        if (!nxt) break; await sleep(500);
      }
      if (!shot && shotsWanted.has(`${run.name}|${ref}`)) await page.screenshot({ path: `${SHOTDIR}/${run.name}-${skillId}.png` });
      res.push({ run: run.name, ref, parts });
    }
    res.push({ run: run.name, errs });
    await browser.close();
  }
  fs.writeFileSync(OUT, JSON.stringify(res, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
