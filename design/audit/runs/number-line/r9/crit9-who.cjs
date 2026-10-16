// Critic r9: who scrolls the page during the mixed-pool flicker? Wraps every programmatic scroll
// (scrollTo / scrollBy / scrollIntoView / focus without preventScroll) and logs its caller, per frame.
// Usage: MQ_ROOT=<tree> LINE=1|0 SIZE=1280x600 node crit9-who.cjs <out.txt>
const fs = require('fs');
const { open } = require('/home/user/mq-numberline/tests/lib/ws-harness.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const OUT = process.argv[2];
const LINE = process.env.LINE !== '0';
const [W, H] = (process.env.SIZE || '1280x600').split('x').map(Number);
const RUNS = +(process.env.RUNS || 6);

function WRAP() {
  window.__who = [];
  const t0 = performance.now();
  const who = () => { const s = (new Error().stack || '').split('\n').slice(3, 6).map((l) => l.trim().replace(/^at /, '').replace(/https?:\/\/[^/]+\/js\/modules\//, '').replace(/\?v=[^:]+/, '')).join(' < '); return s; };
  const log = (k) => window.__who.push(`${Math.round(performance.now() - t0)} ${k} sy${Math.round(scrollY)} ${who()}`);
  for (const k of ['scrollTo', 'scrollBy', 'scroll']) { const o = window[k].bind(window); window[k] = function (...a) { log(k + JSON.stringify(a)); return o(...a); }; }
  const sv = Element.prototype.scrollIntoView; Element.prototype.scrollIntoView = function (...a) { log('scrollIntoView(' + (this.id || this.className) + ')'); return sv.apply(this, a); };
  const fc = HTMLElement.prototype.focus; HTMLElement.prototype.focus = function (o) { if (!(o && o.preventScroll)) log('focus(' + (this.id || this.className) + ')'); return fc.call(this, o); };
  const sv2 = Element.prototype.scrollIntoViewIfNeeded; if (sv2) Element.prototype.scrollIntoViewIfNeeded = function (...a) { log('scrollIntoViewIfNeeded(' + (this.id || this.className) + ')'); return sv2.apply(this, a); };
  for (const k of ['select', 'setSelectionRange']) { const o = HTMLInputElement.prototype[k]; HTMLInputElement.prototype[k] = function (...a) { log(k + '(' + (this.id || this.className) + ')'); return o.apply(this, a); }; }
  const fsv = SVGElement.prototype.focus; SVGElement.prototype.focus = function (o) { if (!(o && o.preventScroll)) log('svgfocus'); return fsv.call(this, o); };
  for (const proto of [Element.prototype]) { const d = Object.getOwnPropertyDescriptor(proto, 'scrollTop'); Object.defineProperty(proto, 'scrollTop', { get() { return d.get.call(this); }, set(v) { if (this === document.documentElement || this === document.body) log('scrollTop=' + v); d.set.call(this, v); }, configurable: true }); }
  window.addEventListener('scroll', () => { window.__who.push(`${Math.round(performance.now() - t0)} scroll-event sy${Math.round(scrollY)} docH ${document.documentElement.scrollHeight} ae ${(document.activeElement && (document.activeElement.id || String(document.activeElement.className).slice(0, 25)))}`); }, { passive: true });
  let last = scrollY; const f = () => { if (scrollY !== last) { window.__who.push(`${Math.round(performance.now() - t0)} FRAME sy ${Math.round(last)}>${Math.round(scrollY)} docH ${document.documentElement.scrollHeight}`); last = scrollY; } requestAnimationFrame(f); }; requestAnimationFrame(f);
}

(async () => {
  const h = await open({ viewport: { width: W, height: H, deviceScaleFactor: 1 } });
  const { page } = h;
  const base = page.url().split('?')[0];
  const out = [];
  for (let run = 0; run < RUNS; run++) {
    await page.goto(base, { waitUntil: 'networkidle2' });
    await page.waitForFunction(() => typeof window.playSelectedSkills === 'function' && window.UnifiedSkills, { timeout: 30000 });
    const code = await page.evaluate((line) => { window.clearSetOptions && window.clearSetOptions({ silent: true }); const U = window.UnifiedSkills; U.clear(); U.add({ categoryId: 'addition', skillId: 'mixed_addition', skillLabel: 'mixed', opts: line ? { nlOn: true, nlFrom: 0, nlTo: 100 } : {} }); return window.generateSkillCode(); }, LINE);
    await page.goto(base + '?c=' + encodeURIComponent(`${code}|Gp-N10-T300`), { waitUntil: 'networkidle2' });
    await page.waitForFunction(() => window.state && typeof window.startFromLanding === 'function', { timeout: 30000 });
    await page.evaluate(WRAP);
    await page.evaluate(() => window.startFromLanding());
    await sleep(2500);
    for (let qn = 1; qn <= 4; qn++) {
      const info = await page.evaluate(() => ({ q: String((window.state.currentQ || {}).text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 50), pf: (window.state.currentQ || {}).printFormat, cell: ((window.state.currentQ || {}).cell || {}).template, skill: (window.state.currentQ || {}).skillId, stack: !!document.querySelector('#questionCard .column-answer-input'), who: window.__who.splice(0) }));
      const moves = info.who.filter((l) => / FRAME /.test(l)).length;
      out.push(`run${run} q${qn} ${info.skill} ${info.cell || info.pf} stack:${info.stack} frames-moved:${moves} | ${info.q}`);
      for (const l of info.who) out.push('    ' + l);
      // answer and let it advance
      const ans = await page.evaluate(() => String(window.state.currentQ && window.state.currentQ.ans));
      const rtl = await page.evaluate(() => !!(document.activeElement && /column-answer-input/.test(document.activeElement.className)));
      const clean = ans.replace(/[^0-9.\-\/ ]/g, '') || '1';
      await page.keyboard.type(rtl ? clean.split('').reverse().join('') : clean, { delay: 20 });
      await page.evaluate(() => window.submitAnswer());
      const qi = await page.evaluate(() => window.state.qCount);
      for (let k = 0; k < 25; k++) { await sleep(200); if (await page.evaluate((qi) => window.state.qCount !== qi, qi)) break; }
      await page.evaluate(() => { window.__who.push('---- next question rendered'); });
      await sleep(2000);
    }
  }
  fs.writeFileSync(OUT, out.join('\n') + '\n');
  await h.close();
})();
