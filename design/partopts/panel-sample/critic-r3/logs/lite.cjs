// Critic r3 driver (independent of ws-options-shots): open each skill's options panel as a teacher, walk every part by
// keyboard, change one option by a real click, measure and screenshot.
const { chromium } = require('playwright');
const http = require('http'); const fs = require('fs'); const path = require('path');
const ROOT = process.env.ROOT || '/home/user/wt-critic-r3';
const OUT = process.env.OUT || path.join(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });
const SKILLS = (process.env.SKILLS || '').split(',').filter(Boolean);
const VPS = (process.env.VPS || '1280x1000,1366x768,1024x768,820x1180,1280x720').split(',').map(s => { const [w, h] = s.split('x').map(Number); return { w, h }; });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(ROOT, p); fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const MEASURE = () => {
  const pop = document.getElementById('skillOptionsPopover'); if (!pop) return { nopop: 1 };
  const R = e => { const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; };
  const frame = pop.querySelector('.tv-sko-frame'); const stage = frame && frame.querySelector('.tvp-stage');
  const out = { vw: innerWidth, vh: innerHeight, hscroll: document.documentElement.scrollWidth > innerWidth + 1, pop: R(pop) };
  const foot = pop.querySelector('.tv-sko-foot'); out.foot = foot && R(foot);
  const done = [...pop.querySelectorAll('.tv-sko-foot button')].map(b => ({ t: b.textContent.trim(), r: R(b) }));
  out.done = done;
  const part = pop.querySelector('.tv-sko-part'); out.part = part && !part.hidden ? pop.querySelector('.tv-sko-part-n').textContent.trim() : '';
  const sum = pop.querySelector('.tv-sko-sum'); const more = pop.querySelector('.tv-sko-more');
  out.sum = sum && { clamped: sum.scrollHeight > sum.clientHeight + 1, text: sum.textContent.slice(0, 80), moreVisible: !!more && !more.hidden && more.offsetParent !== null, moreR: more && !more.hidden ? R(more) : null };
  const body = pop.querySelector('.tv-sko-body'); out.body = body && R(body);
  // control sizes (option inputs) for touch targets
  const ctr = body ? [...body.querySelectorAll('select,input,button')].filter(e => e.offsetParent).map(e => { const b = e.getBoundingClientRect(); return Math.round(Math.min(b.height, e.type === 'checkbox' || e.type === 'radio' ? b.height : 999)); }) : [];
  out.minCtrlH = ctr.length ? Math.min(...ctr) : null;
  if (!frame) return out;
  out.frame = R(frame);
  if (frame.classList.contains('is-unavailable')) { out.unavailable = frame.textContent.trim().slice(0, 100); return out; }
  if (!stage) return out;
  out.stage = R(stage);
  const fb = frame.getBoundingClientRect();
  // clipped boxes inside the stage
  const clips = []; const over = [];
  for (const e of stage.querySelectorAll('*')) {
    if (e.closest('[hidden]') || getComputedStyle(e).display === 'none' || getComputedStyle(e).visibility === 'hidden') continue;
    const cs = getComputedStyle(e);
    if ((cs.overflowX !== 'visible' && e.scrollWidth > e.clientWidth + 1) || (cs.overflowY !== 'visible' && e.scrollHeight > e.clientHeight + 1)) clips.push(`${e.tagName}.${String(e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className).slice(0, 30)} ${e.scrollWidth}x${e.scrollHeight}>${e.clientWidth}x${e.clientHeight}`);
  }
  out.clips = clips.slice(0, 5);
  // visible leaves: text and svg text sizes, overflow past frame
  let minH = 99, minHt = '', minS = 99, minSt = ''; const texts = [];
  const tw = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
  let n; while ((n = tw.nextNode())) {
    const t = n.textContent.trim(); if (!t) continue; const el = n.parentElement; if (!el) continue;
    const r = document.createRange(); r.selectNodeContents(n); const b = r.getBoundingClientRect(); if (!b.width || !b.height) continue;
    const visible = b.right > fb.left + 1 && b.left < fb.right - 1 && b.bottom > fb.top + 1 && b.top < fb.bottom - 1;
    if (!visible) continue;
    const cut = b.left < fb.left - 1 || b.right > fb.right + 1 || b.top < fb.top - 1 || b.bottom > fb.bottom + 1;
    if (cut) over.push(t.slice(0, 20));
    texts.push(t);
    const fs_ = parseFloat(getComputedStyle(el).fontSize);
    const svg = el.closest('svg');
    if (svg) { const m = el.getScreenCTM ? el.getScreenCTM() : null; const k = m ? Math.hypot(m.a, m.b) : 1; const px = fs_ * k; if (px < minS) { minS = px; minSt = t.slice(0, 20); } }
    else { const lw = el.offsetWidth || 0; const k = lw ? el.getBoundingClientRect().width / lw : 1; const px = fs_ * k; if (px < minH) { minH = px; minHt = t.slice(0, 20); } }
  }
  out.minHtml = +minH.toFixed(1); out.minHtmlT = minHt; out.minSvg = +minS.toFixed(1); out.minSvgT = minSt; out.cut = over.slice(0, 6);
  out.text = texts.join(' | ').slice(0, 600);
  // repeated sentence
  const sents = texts.join(' ').split(/(?<=[.?!])\s+/).map(s => s.trim()).filter(s => s.length >= 20);
  const seen = new Set(); out.repeat = []; for (const s of sents) { if (seen.has(s)) out.repeat.push(s.slice(0, 40)); seen.add(s); }
  // content ink box vs frame
  let L = 1e9, T = 1e9, Rr = -1e9, B = -1e9;
  for (const e of stage.querySelectorAll('*')) { if (e.children.length && e.tagName !== 'svg') continue; const b = e.getBoundingClientRect(); if (!b.width || !b.height) continue; if (b.right < fb.left || b.left > fb.right || b.bottom < fb.top || b.top > fb.bottom) continue; L = Math.min(L, b.left); T = Math.min(T, b.top); Rr = Math.max(Rr, b.right); B = Math.max(B, b.bottom); }
  out.fill = L < 1e9 ? +(((Math.min(Rr, fb.right) - Math.max(L, fb.left)) * (Math.min(B, fb.bottom) - Math.max(T, fb.top))) / (fb.width * fb.height)).toFixed(2) : 0;
  out.sliceCut = []; out.sliced = 0;
  for (const svg of stage.querySelectorAll('svg')) { if (!svg.dataset.skoVb) continue; out.sliced++; const vb = svg.viewBox.baseVal; if (!vb) continue;
    for (const t of svg.querySelectorAll('text')) { let b; try { b = t.getBBox(); } catch (e) { continue; } if (!b.width) continue;
      const inter = b.x < vb.x + vb.width && b.x + b.width > vb.x && b.y < vb.y + vb.height && b.y + b.height > vb.y;
      const inside = b.x >= vb.x - 0.5 && b.x + b.width <= vb.x + vb.width + 0.5 && b.y >= vb.y - 0.5 && b.y + b.height <= vb.y + vb.height + 0.5;
      if (inter && !inside) out.sliceCut.push(t.textContent.trim().slice(0, 15)); } }
  const tr = getComputedStyle(stage).transform; out.transform = tr === 'none' ? 1 : +(+tr.split('(')[1].split(',')[0]).toFixed(3);
  return out;
};
(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const base = `http://127.0.0.1:${srv.address().port}`;
  const browser = await chromium.launch();
  const results = [];
  for (const vp of VPS) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0, 150)));
    await page.goto(base + '/index.html'); await page.waitForFunction(() => window.UnifiedSkills && window.tvGo, null, { timeout: 30000 }); await sleep(800);
    for (const ref of SKILLS) {
      const [c, s] = ref.split(':'); const tag = `${s}-${vp.w}x${vp.h}`; const e0 = errs.length;
      const rec = { ref, vp: `${vp.w}x${vp.h}`, reads: [] };
      try {
        await page.evaluate(() => { if (window.closeSkillOptionsPanel) window.closeSkillOptionsPanel(); });
        await page.evaluate(({ c, s }) => { if (!document.body.classList.contains('teacher-mode') && window.toggleUserRole) window.toggleUserRole(); const k = (window.SKILLS[c] || []).find(x => x.v === s); window.UnifiedSkills.clear(); window.UnifiedSkills.add({ domainId: 'x', categoryId: c, skillId: s, skillLabel: k ? k.l : s, categoryIcon: '', categoryName: c, domainColor: '#8b5cf6' }); window.UnifiedSkills._syncAllImmediate(); window.tvGo('sets'); }, { c, s });
        const sel = `.tv-opt-btn[data-key="${c}|${s}"]`; await page.waitForSelector(sel, { timeout: 10000 });
        await page.locator(sel).first().scrollIntoViewIfNeeded(); await page.locator(sel).first().click();
        await page.waitForSelector('#skillOptionsPopover'); await sleep(+(process.env.WAIT||1500));
        let m = await page.evaluate(MEASURE); rec.reads.push({ at: 'open', ...m });
        if(!process.env.NOSHOT) await page.locator('#skillOptionsPopover').screenshot({ path: path.join(OUT, `${tag}-p1.png`) });
        // walk parts by keyboard
        for (let i = 2; i < 30; i++) {
          const nb = page.locator('#skillOptionsPopover .tv-sko-part:not([hidden]) [data-sko-part="1"]').first();
          if (!(await nb.count()) || !(await nb.isVisible()) || await nb.isDisabled()) break;
          await nb.focus(); await page.keyboard.press(i % 2 ? 'Space' : 'Enter'); await sleep(250);
          m = await page.evaluate(MEASURE); rec.reads.push({ at: 'part' + i, ...m });
          if(!process.env.NOSHOT) await page.locator('#skillOptionsPopover').screenshot({ path: path.join(OUT, `${tag}-p${i}.png`) });
        }
        rec.focusAfterLast = await page.evaluate(() => document.activeElement && (document.activeElement.getAttribute('aria-label') || document.activeElement.textContent.trim()).slice(0, 40));
        // change first option by a real click
        const ctl = page.locator('#skillOptionsPopover .tv-sko-body select, #skillOptionsPopover .tv-sko-body input[type=checkbox], #skillOptionsPopover .tv-sko-body input[type=radio]').first();
        if (!process.env.NOCHANGE && await ctl.count()) {
          const tg = await ctl.evaluate(e => e.tagName + (e.type ? ':' + e.type : ''));
          await ctl.scrollIntoViewIfNeeded();
          if (tg.startsWith('SELECT')) { const vals = await ctl.evaluate(e => [...e.options].map(o => o.value)); const cur = await ctl.inputValue(); const nv = vals.find(v => v !== cur); await ctl.selectOption(nv); rec.change = `select ${cur}->${nv}`; }
          else { await ctl.click({ force: true }); rec.change = tg + ' click'; }
          await sleep(60); m = await page.evaluate(MEASURE); rec.reads.push({ at: 'chg50', ...m });
          await sleep(1450); m = await page.evaluate(MEASURE); rec.reads.push({ at: 'chg1500', ...m });
          if(!process.env.NOSHOT) await page.locator('#skillOptionsPopover').screenshot({ path: path.join(OUT, `${tag}-chg.png`) });
          for (let i = 2; i < 30; i++) {
            const nb = page.locator('#skillOptionsPopover .tv-sko-part:not([hidden]) [data-sko-part="1"]').first();
            if (!(await nb.count()) || !(await nb.isVisible()) || await nb.isDisabled()) break;
            await nb.click(); await sleep(250); m = await page.evaluate(MEASURE); rec.reads.push({ at: 'chgpart' + i, ...m });
            if(!process.env.NOSHOT) await page.locator('#skillOptionsPopover').screenshot({ path: path.join(OUT, `${tag}-chg-p${i}.png`) });
          }
        } else rec.change = 'no control';
      } catch (e) { rec.error = String(e).slice(0, 200); }
      rec.pageerrors = errs.slice(e0);
      results.push(rec); console.error(ref, vp.w, rec.reads.length, rec.error || '');
    }
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 1));
  await browser.close(); srv.close();
})();
