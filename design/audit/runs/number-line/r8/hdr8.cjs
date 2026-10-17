// Critic r8 probe (independent of refline-dots.cjs): band vs sticky header in timed / untimed pupil sessions.
// Usage: MQ_ROOT=<tree> node hdr8.cjs <out.jsonl> [quick]
const path = require('path');
const fs = require('fs');
const { open } = require('/home/user/mq-numberline/tests/lib/ws-harness.cjs');
const OUT = process.argv[2];
const QUICK = process.argv.includes('quick');
const LINEOFF = process.argv.includes('lineoff');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SKILLS0 = [
  ['subtraction', 'sub_100_regroup', {}],
  ['multiplication', 'nl_mult', {}],
  ['addition', 'add_facts', {}],
  ['addition', 'mixed_addition', { nlFrom: 0, nlTo: 100 }],
];
const SKILLS = process.env.ONLY ? SKILLS0.filter((s) => s[1] === process.env.ONLY) : SKILLS0;
const SIZES = process.env.SIZES ? process.env.SIZES.split(',').map((x) => ({ w: +x.split('x')[0], h: +x.split('x')[1] })) : QUICK ? [{ w: 1280, h: 600 }] : [{ w: 1366, h: 650 }, { w: 1280, h: 600 }, { w: 1366, h: 768 }, { w: 1280, h: 720 }];
const MODES = ['queue', 'T300', 'T0'];

// In-page measure. Header = every sticky/fixed element pinned at the top (not toasts / pop-ups),
// band coverage by elementFromPoint over a grid of the band (independent of the app's selector list).
function MEASURE() {
  const band = document.getElementById('mqRefLine');
  const isOverlay = (el) => { for (let p = el; p && p !== document.body; p = p.parentElement) { const c = (p.className && p.className.baseVal === undefined ? p.className : '') + ' ' + p.id; if (/toast|modal|popup|overlay|confetti/i.test(c)) return true; } return false; };
  let hdr = 0; const hdrEls = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.position !== 'sticky' && cs.position !== 'fixed') continue;
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (!(r.height > 0 && r.width > 100 && r.left < innerWidth - 20 && r.right > 20 && r.top < 20 && r.bottom > 0 && r.bottom < innerHeight / 2)) continue;
    if (isOverlay(el)) continue;
    if (band && (el.contains(band) || band.contains(el))) continue;
    hdr = Math.max(hdr, r.bottom); hdrEls.push((el.id || el.className || el.tagName).toString().slice(0, 30) + ':' + Math.round(r.bottom));
  }
  const rr = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return r.height > 0 && r.width > 0 ? { top: Math.round(r.top), bottom: Math.round(r.bottom) } : null; };
  let covered = null, labelsHidden = [];
  if (band) {
    const r = band.getBoundingClientRect(); let n = 0, bad = 0;
    for (let i = 1; i < 20; i++) for (let j = 1; j < 5; j++) {
      const x = r.left + r.width * i / 20, y = r.top + r.height * j / 5; n++;
      if (y < 0 || y > innerHeight) { bad++; continue; }
      const at = document.elementFromPoint(x, y);
      if (!at || !(band.contains(at) || isOverlay(at))) bad++;
    }
    covered = Math.round(100 * bad / n);
    for (const t of band.querySelectorAll('svg text')) {
      const q = t.getBoundingClientRect(); const y = q.top + q.height / 2;
      const at = y < 0 || y > innerHeight ? null : document.elementFromPoint(q.left + q.width / 2, y);
      if (!at || !(band.contains(at) || isOverlay(at))) labelsHidden.push((t.textContent || '').trim());
    }
  }
  const ae = document.activeElement;
  const active = ae && ae !== document.body && /INPUT|TEXTAREA/.test(ae.tagName) ? rr(ae) : null;
  const inputs = [...document.querySelectorAll('#questionCard input, #gameView input.answer-input, #answerInput')].filter((e) => { const r = e.getBoundingClientRect(); return r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; });
  const firstInput = inputs.length ? rr(inputs[0]) : null;
  const lastInput = inputs.length ? rr(inputs[inputs.length - 1]) : null;
  const chk = document.getElementById('qcCheckBtn');
  const check = chk && getComputedStyle(chk).display !== 'none' ? rr(chk) : null;
  const tc = document.getElementById('timerContainer');
  const timed = !!(tc && getComputedStyle(tc).display !== 'none' && tc.getBoundingClientRect().height > 0);
  return { sy: Math.round(scrollY), docH: document.documentElement.scrollHeight, vh: innerHeight, hdr: Math.round(hdr), hdrEls, band: rr(band), covered, labelsHidden,
    active, activeId: ae ? (ae.id || ae.className || ae.tagName) : '', firstInput, lastInput, check, timed, qi: window.state && window.state.qCount, hasAns: window.state && window.state.hasAnswered, nextShown: !!(document.getElementById("nextBtn") && document.getElementById("nextBtn").offsetParent), fb: ((document.getElementById("feedback")||{}).textContent||"").trim().slice(0,40), q: window.state && window.state.currentQ ? String(window.state.currentQ.text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 40) : '' };
}

function verdict(m) {
  const bad = [];
  const target = m.active || m.firstInput;
  const inView = (r) => r && r.top >= m.hdr - 1 && r.bottom <= m.vh + 1;
  if (target && !inView(target)) bad.push('BOX-OUT');
  if (m.check && !inView(m.check)) bad.push('CHECK-OUT');
  if (m.band && m.band.top < m.hdr - 1) {
    // could the page put the band below the header and still show the box and Check?
    const d = Math.min(m.sy, m.hdr - m.band.top);
    const fits = [target, m.check].every((r) => !r || r.bottom + d <= m.vh);
    bad.push(fits ? 'BAND-UNDER-HDR(fits)' : 'band-under-hdr(too-tall)');
  }
  if (m.labelsHidden && m.labelsHidden.length) bad.push('LABELS-HIDDEN:' + m.labelsHidden.join(','));
  return bad;
}

(async () => {
  const h = await open({ viewport: { width: 1280, height: 600, deviceScaleFactor: 1 } });
  const { page } = h;
  const base = page.url().split('?')[0];
  const out = fs.createWriteStream(OUT);
  const touchSets = [false, true];
  const cases = [];
  for (const size of SIZES) for (const [cat, skill, extra] of SKILLS) for (const mode of MODES) for (const touch of touchSets) for (const line of process.env.OFFONLY ? [false] : LINEOFF ? [true, false] : [true]) cases.push({ size, cat, skill, extra, mode, touch, line });
  if (!QUICK && !process.env.SIZES) for (const [cat, skill, extra] of SKILLS) for (const mode of ['queue', 'T0']) cases.push({ size: { w: 390, h: 844, phone: true }, cat, skill, extra, mode, touch: true, line: true });
  for (const c of cases) {
    const tag = `${c.size.w}x${c.size.h} ${c.skill} ${c.mode} ${c.touch ? 'touch' : 'mouse'} ${c.line ? 'line' : 'OFF'}`;
    const rec = { tag, steps: [] };
    try {
      await page.setViewport({ width: c.size.w, height: c.size.h, deviceScaleFactor: 1, hasTouch: c.touch, isMobile: !!c.size.phone });
      await page.goto(base, { waitUntil: 'networkidle2' });
      await page.waitForFunction(() => typeof window.playSelectedSkills === 'function' && window.UnifiedSkills && typeof window.generateSkillCode === 'function', { timeout: 30000 });
      const code = await page.evaluate((cat, skill, extra, line) => {
        window.clearSetOptions && window.clearSetOptions({ silent: true });
        const U = window.UnifiedSkills; U.clear();
        U.add({ categoryId: cat, skillId: skill, skillLabel: skill, opts: line ? Object.assign({ nlOn: true }, extra) : {} });
        return window.generateSkillCode();
      }, c.cat, c.skill, c.extra, c.line);
      const startTrace = async () => page.evaluate(() => { window.__tr = []; window.__trOn = true; const f = () => { if (!window.__trOn) return; const b = document.getElementById('mqRefLine'); window.__tr.push([Math.round(performance.now()), Math.round(scrollY), b ? Math.round(b.getBoundingClientRect().top) : null]); requestAnimationFrame(f); }; requestAnimationFrame(f); });
      const stopTrace = async () => page.evaluate(() => { window.__trOn = false; const t = window.__tr || []; const ys = []; for (const [, y] of t) if (!ys.length || ys[ys.length - 1] !== y) ys.push(y); const seg = []; for (const [tm, y, b] of t) { if (!seg.length || seg[seg.length - 1][1] !== y) seg.push([tm, y, b, 1]); else seg[seg.length - 1][3]++; } return { frames: t.length, ys, seg: seg.map(([tm, y, b, n]) => `${y}/${b}x${n}`) }; });
      if (c.mode !== 'queue') {
        await page.goto(base + '?c=' + encodeURIComponent(`${code}|Gp-N10-${c.mode}`), { waitUntil: 'networkidle2' });
        await page.waitForFunction(() => window.state && window.state.landingSettings && typeof window.startFromLanding === 'function', { timeout: 30000 });
        await startTrace();
        await page.evaluate(() => window.startFromLanding());
      } else {
        await startTrace();
        await page.evaluate(() => window.playSelectedSkills('practice'));
      }
      await sleep(1600);
      try { await page.waitForFunction(() => document.fonts.status === 'loaded', { timeout: 8000 }); } catch (e) { /* measured anyway */ }
      for (let qn = 1; qn <= 3; qn++) {
        const tr = await stopTrace();
        const m = await page.evaluate(MEASURE);
        rec.steps.push({ at: 'q' + qn, m, trace: tr, bad: verdict(m) });
        // tap / click the answer box (touch: does the page jump?)
        const target = m.active || m.firstInput;
        if (target) {
          const pt = await page.evaluate(() => { const ae = document.activeElement; const el = ae && /INPUT/.test(ae.tagName) ? ae : document.querySelector('#questionCard input, #answerInput'); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, sy: scrollY }; });
          if (pt && pt.y > 0 && pt.y < c.size.h) {
            if (c.touch) await page.touchscreen.tap(pt.x, pt.y); else await page.mouse.click(pt.x, pt.y);
            await sleep(400);
            const sy2 = await page.evaluate(() => scrollY);
            rec.steps.push({ at: 'q' + qn + '-tap', dy: Math.round(sy2 - pt.sy) });
          }
        }
        // type the answer and Check
        const ans = await page.evaluate(() => { const a = window.state.currentQ && window.state.currentQ.ans; return a == null ? '1' : String(a); });
        const rtl = await page.evaluate(() => !!(document.activeElement && /column-answer-input/.test(document.activeElement.className)));
        const clean = ans.replace(/[^0-9.\-\/ ]/g, '') || '1';
        await page.keyboard.type(rtl ? clean.split('').reverse().join('') : clean, { delay: 20 });
        await startTrace();
        const ck = await page.evaluate(() => { const b = document.getElementById('qcCheckBtn'); if (!b) return null; const r = b.getBoundingClientRect(); return r.height ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; });
        if (ck && ck.y > 0 && ck.y < c.size.h) { if (c.touch) await page.touchscreen.tap(ck.x, ck.y); else await page.mouse.click(ck.x, ck.y); }
        else await page.evaluate(() => window.submitAnswer());
        await sleep(1200);
        const trc = await stopTrace();
        const mc = await page.evaluate(MEASURE);
        rec.steps.push({ at: 'q' + qn + '-checked', m: mc, trace: trc, bad: verdict(mc).filter((b) => b !== 'CHECK-OUT' && b !== 'BOX-OUT') });
        if (qn === 3) break;
        // next question: practice auto-advances after a correct answer (~2.5 s); wait for it
        await startTrace();
        let adv = false;
        for (let k = 0; k < 25 && !adv; k++) { await sleep(200); adv = await page.evaluate((qi) => window.state.qCount !== qi, m.qi); }
        if (!adv) { const nx = await page.evaluate(() => { const b = document.getElementById('nextBtn'); if (b && b.offsetParent) { const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; } return null; }); if (nx) { if (c.touch) await page.touchscreen.tap(nx.x, nx.y); else await page.mouse.click(nx.x, nx.y); await sleep(300); adv = await page.evaluate((qi) => window.state.qCount !== qi, m.qi); } }
        if (!adv) { rec.steps.push({ at: 'q' + qn + '-forced' }); await page.evaluate(() => { const st = window.state; st.hasAnswered = false; st.currentQ = window.generateQuestion(); window.renderQuestion(); }); }
        await sleep(1400);
      }
    } catch (e) { rec.error = e.message; }
    rec.errors = h.problems.splice(0).map((p) => p.text.slice(0, 120));
    out.write(JSON.stringify(rec) + '\n');
    const s = rec.steps.filter((x) => x.m).map((x) => `${x.at}:sy${x.m.sy} h${x.m.hdr} b${x.m.band ? x.m.band.top : '-'} cov${x.m.covered}${x.bad.length ? ' [' + x.bad.join(' ') + ']' : ''}`).join(' | ');
    console.log(`${tag}${rec.error ? ' ERROR ' + rec.error : ''} ${s}`);
  }
  out.end();
  await h.close();
})();
