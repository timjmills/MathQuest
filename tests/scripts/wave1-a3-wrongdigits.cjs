// Wave 1 lane A3 (owner 2026-10-03): "If an answer is wrong, highlight/blink the wrong digits in red.
// When a child clicks in the answer box, the answer disappears so they can write a new answer."
//
// On the PRACTICE CARD and the ONLINE WORKSHEET, at 1280 and 390, for add_facts, add_100_regroup (column
// stack), a single multi-digit box (add_facts with a 2-digit answer) and count_by_tables (a row of boxes):
//   - only the wrong digits get the red class (by place value, right-aligned); right digits stay black;
//     a missing digit gets an empty red box;
//   - the blink runs, then stops and leaves steady red; under prefers-reduced-motion there is no animation;
//   - tapping (or Tabbing into) a red box empties it and removes the red; a green box never clears;
//     the item stays "helped" (a cleared box still went red).
// The quiz: no marks, no clearing. Screenshots: design/audit/runs/wave1-A3/.
//
// Run: /tmp/mq-browser-run.sh node tests/scripts/wave1-a3-wrongdigits.cjs
const fs = require('fs');
const path = require('path');
const { open } = require('../lib/ws-harness.cjs');
const OUT = path.resolve(__dirname, '..', '..', 'design', 'audit', 'runs', 'wave1-A3');
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fails = 0;
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };
const RED = 'rgb(179, 38, 30)';

const SCENARIOS = [
  { c: 'addition', k: 'add_facts', kind: 'single', size: 'small' },          // one digit in one box: the box IS the digit
  { c: 'addition', k: 'add_100_regroup', kind: 'stack' },                    // a column stack, one digit per box
  { c: 'addition', k: 'add_facts', kind: 'single', size: 'big', tagName: 'add_facts_2digit' },   // several digits in one box: mirror
  { c: 'multiplication', k: 'count_by_tables', kind: 'row' },               // a row of boxes, several digits each
];

async function boot(page) {
  await page.reload({ waitUntil: 'networkidle2' });
  await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
  await page.evaluate(() => { try { localStorage.setItem('mathquest_onboarded', '1'); } catch (e) { /* ignore */ } });
}

async function setup(page, host, s) {
  await page.evaluate((host, s) => {
    const st = window.state;
    st.category = s.c; st.skill = s.k; st.range = 100; st.decimalPlaces = 0; st.isMixedMode = false; st.quizMode = false; st.hasAnswered = false;
    st.skillOptions = null;
    const fits = (q) => q && (!s.size || (s.size === 'big') === (String(q.ans).length >= 2))
      && (s.kind !== 'row' || String(q.ans).split(',').some((x) => x.trim().length >= 2));
    if (host === 'card') {
      st.gameMode = 'practice'; st.currentQAttempts = 0;
      window.showView('gameView');
      for (let t = 0; t < 80; t++) { st.currentQ = window.generateQuestion(); if (fits(st.currentQ)) break; }
      window.renderQuestion();
    } else {
      st.gameMode = 'worksheet'; st.problemCount = 2;
      for (let t = 0; t < 80; t++) { window.initWorksheet(); if (fits(st.worksheetQs[0])) break; }
    }
  }, host, s);
  await sleep(host === 'card' ? 600 : 1100);
  await page.evaluate(() => { const d = document.getElementById('mqWorkedDismiss'); if (d) d.click(); });
}

async function tag(page, host, s) {
  return page.evaluate((host, s) => {
    const q = host === 'card' ? window.state.currentQ : window.state.worksheetQs[0];
    const root = host === 'card' ? document.getElementById('questionCard') : document.getElementById('ws_card_0');
    document.querySelectorAll('[data-t]').forEach((e) => e.removeAttribute('data-t'));
    const ans = String(q.ans);
    let els = []; let exp = [];
    if (s.kind === 'row') {
      els = Array.from(root.querySelectorAll('input.mq-cellslot:not(.mq-cellslot-host)'));
      exp = ans.split(/\s*,\s*/);
    } else if (s.kind === 'stack') {
      const d = ans.replace(/[^0-9]/g, '');
      els = Array.from(root.querySelectorAll('input.mq-digit')).filter((e) => /^ans-\d+$/.test(e.getAttribute('data-ws-slot') || ''))
        .filter((e) => Number(e.getAttribute('data-ws-slot').slice(4)) < d.length)
        .sort((a, b) => Number(b.getAttribute('data-ws-slot').slice(4)) - Number(a.getAttribute('data-ws-slot').slice(4)));
      exp = els.map((e) => d[d.length - 1 - Number(e.getAttribute('data-ws-slot').slice(4))]);
    } else {
      els = [document.getElementById(host === 'card' ? 'answerInput' : 'ws_input_0')];
      exp = [ans];
    }
    els.forEach((e, i) => e.setAttribute('data-t', String(i)));
    return { n: els.length, exp, ans };
  }, host, s);
}

async function typeInto(page, i, text) {
  await page.evaluate((i) => { const el = document.querySelector(`[data-t="${i}"]`); el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); el.focus(); el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); }, i);
  await page.keyboard.type(text, { delay: 15 });
}
const blurAll = (page) => page.evaluate(() => { const a = document.activeElement; if (a && a.blur) a.blur(); document.body.focus(); });
const tap = (page, i) => page.evaluate((i) => { const el = document.querySelector(`[data-t="${i}"]`); el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); el.focus(); }, i);

// one box's state: value, red / green, wrong-digit class, its mirror's digits (b = bad, m = missing, . = right), running animations
const info = (page, i) => page.evaluate((i) => {
  const el = document.querySelector(`[data-t="${i}"]`);
  const mir = Array.from(document.querySelectorAll('.mq-wd-mirror')).find((m) => {
    const a = m.getBoundingClientRect(), b = el.getBoundingClientRect(); return Math.abs(a.left - b.left) < 2 && Math.abs(a.top - b.top) < 2;
  });
  const anims = (x) => (x.getAnimations ? x.getAnimations().filter((a) => a.playState === 'running').length : 0);
  let nAnim = anims(el);
  let digits = null; let badColor = null;
  if (mir) {
    digits = Array.from(mir.children).map((s) => (s.classList.contains('mq-wd-bad') ? 'b' : s.classList.contains('mq-wd-miss') ? 'm' : '.')).join('');
    mir.querySelectorAll('.mq-wd').forEach((s) => { nAnim += anims(s); });
    const b = mir.querySelector('.mq-wd-bad'); if (b) badColor = getComputedStyle(b).color;
    const plain = mir.querySelector('.mq-wd:not(.mq-wd-bad):not(.mq-wd-miss)'); if (plain) mir.dataset.plain = getComputedStyle(plain).color;
  }
  const cs = getComputedStyle(el);
  return { v: el.value, bad: el.classList.contains('mq-live-wrong'), ok: el.classList.contains('mq-live-correct'),
    wd: el.classList.contains('mq-wrong-digit'), empty: el.classList.contains('mq-wd-empty'), digits, badColor, plain: mir ? mir.dataset.plain : null,
    color: cs.webkitTextFillColor || cs.color, anim: nAnim, opacity: cs.opacity };
}, i);
const helped = (page, host) => page.evaluate((host) => { const r = host === 'card' ? document.getElementById('questionCard') : document.getElementById('ws_card_0'); return r.dataset.mqHelped === '1'; }, host);

async function shot(page, host, name, w) {
  const el = await page.$(host === 'card' ? '#questionCard' : '#ws_card_0');
  if (el) await el.screenshot({ path: path.join(OUT, `${host}-${name}-${w}.png`) });
}
const flip = (d) => String((Number(d) + 1) % 10);

async function scenario(page, host, s, w, reduce) {
  const name = s.tagName || s.k;
  const t0 = `[${w} ${host} ${name}${reduce ? ' reduced-motion' : ''}]`;
  await boot(page);
  await setup(page, host, s);
  const t = await tag(page, host, s);
  if (!t.n) { check(false, `${t0} has answer boxes`); return; }
  if (s.kind === 'stack') {
    // tens right, ones wrong (others right): only the ones box is the wrong digit
    if (t.n < 2) { check(false, `${t0} a 2+ digit stack (${t.n})`); return; }
    for (let i = 0; i < t.n; i++) await typeInto(page, i, i === t.n - 1 ? flip(t.exp[i]) : t.exp[i]);
    await blurAll(page); await sleep(200);
    const r = []; for (let i = 0; i < t.n; i++) r.push(await info(page, i));
    const last = r[t.n - 1];
    check(last.bad && last.wd && r.slice(0, -1).every((x) => x.ok && !x.wd), `${t0} only the wrong ones digit gets the class (${r.map((x) => (x.wd ? 'W' : x.ok ? 'g' : '-')).join('')})`);
    if (!reduce) check(last.anim > 0, `${t0} the wrong digit blinks (${last.anim} animation)`);
    else check(last.anim === 0 && last.color === RED, `${t0} reduced motion: no blink, steady red (${last.anim}, ${last.color})`);
    if (!reduce) { await shot(page, host, name + '-wrong', w); await sleep(3800); const a = await info(page, t.n - 1); check(a.anim === 0 && a.color === RED && Number(a.opacity) === 1, `${t0} after 3 cycles the blink stops and holds steady red (${a.anim}, ${a.color}, ${a.opacity})`); }
    // Tab into the red box from the box before it: it empties, its red goes; a green box tapped keeps its digit
    await page.evaluate((i) => document.querySelector(`[data-t="${i}"]`).focus(), t.n - 2);
    await page.keyboard.press('Tab'); await sleep(150);
    const tb = await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-t'));
    if (tb === String(t.n - 1)) { const c = await info(page, t.n - 1); check(c.v === '' && !c.bad && !c.wd, `${t0} Tab into the red box empties it and removes the red (${JSON.stringify(c.v)}, ${c.bad})`); }
    else { await tap(page, t.n - 1); await sleep(100); const c = await info(page, t.n - 1); check(c.v === '' && !c.bad && !c.wd, `${t0} tap on the red box empties it and removes the red (Tab went to ${tb})`); }
    await tap(page, 0); await sleep(100);
    const g = await info(page, 0);
    check(g.ok && g.v === t.exp[0], `${t0} a green box tapped keeps its digit (${g.v})`);
    check(await helped(page, host), `${t0} the item stays "helped" after the red box is emptied`);
    // a missing digit: Check with the top answer box empty
    await boot(page); await setup(page, host, s); await tag(page, host, s);
    for (let i = 1; i < t.n; i++) await typeInto(page, i, t.exp[i]);
    await blurAll(page);
    await page.evaluate((host) => { if (host === 'card') { window.submitAnswer && window.submitAnswer(); } else { window.checkWorksheetAnswer && window.checkWorksheetAnswer(0); } }, host);
    await sleep(300);
    const m = await info(page, 0);
    // the worksheet waits for every box of a stack before it judges (a partly filled stack is not wrong yet)
    if (host === 'card') check(m.bad && m.empty && m.v === '', `${t0} a missing digit at Check: its empty box is marked red (${JSON.stringify(m)})`);
    else check(!m.bad && !m.empty, `${t0} a partly filled stack is not judged yet: its empty box stays neutral`);
    if (!reduce) await shot(page, host, name + '-missing', w);
    return;
  }
  if (s.kind === 'row') {
    const k = t.exp.findIndex((x) => x.length >= 2);
    if (k < 0) { check(false, `${t0} a 2-digit box in the row`); return; }
    const right = t.exp.findIndex((x, j) => j !== k);
    const wrong = flip(t.exp[k][0]) + t.exp[k].slice(1);       // tens wrong, ones right
    await typeInto(page, k, wrong);
    if (right >= 0) await typeInto(page, right, t.exp[right]);
    await blurAll(page); await sleep(200);
    // swipe the wrong box into view (a count-by row scrolls); its digits must travel with it
    await page.evaluate((k) => { const el = document.querySelector(`[data-t="${k}"]`); const w = el.closest('[data-mq-swiperow]');
      if (w) { const v = w.getBoundingClientRect(), r = el.getBoundingClientRect(); if (r.left < v.left) w.scrollLeft -= v.left - r.left + 4; else if (r.right > v.right) w.scrollLeft += r.right - v.right + 4; } }, k);
    await sleep(200);
    const r = await info(page, k);
    const want = 'b'+ '.'.repeat(t.exp[k].length - 1);
    check(r.bad && r.digits === want, `${t0} only the wrong tens digit is red in a 2-digit box (${r.digits} want ${want})`);
    check(r.plain === 'rgb(0, 0, 0)' && r.badColor === RED, `${t0} right digit black, wrong digit red (${r.plain}, ${r.badColor})`);
    if (!reduce) check(r.anim > 0, `${t0} the wrong digit blinks`); else check(r.anim === 0, `${t0} reduced motion: no blink (${r.anim})`);
    if (!reduce) { await shot(page, host, name + '-wrong', w); await sleep(3800); const a = await info(page, k); check(a.anim === 0 && a.badColor === RED, `${t0} the blink stops and holds steady red (${a.anim}, ${a.badColor})`); }
    await tap(page, k); await sleep(120);
    const c = await info(page, k);
    check(c.v === '' && !c.bad && c.digits === null, `${t0} tapping the red box empties it, removes the red and its digits (${JSON.stringify(c.v)})`);
    if (right >= 0) { await tap(page, right); await sleep(80); const g = await info(page, right); check(g.ok && g.v === t.exp[right], `${t0} a green box of the same row keeps its answer (${g.v})`); }
    check(await helped(page, host), `${t0} the item stays "helped"`);
    return;
  }
  // a single box
  const a = t.exp[0];
  if (a.length === 1) {
    await typeInto(page, 0, flip(a)); await blurAll(page); await sleep(200);
    const r = await info(page, 0);
    check(r.bad && r.wd && r.digits === null && r.color === RED, `${t0} a one-digit answer: the box itself is the wrong digit, red (${JSON.stringify(r)})`);
    if (!reduce) check(r.anim > 0, `${t0} it blinks`); else check(r.anim === 0, `${t0} reduced motion: no blink`);
  } else {
    // ones wrong
    await typeInto(page, 0, a.slice(0, -1) + flip(a.slice(-1))); await blurAll(page); await sleep(200);
    const r = await info(page, 0);
    const want = '.'.repeat(a.length - 1) + 'b';
    check(r.bad && r.digits === want, `${t0} only the wrong ones digit is red (${r.digits} want ${want})`);
    if (!reduce) check(r.anim > 0, `${t0} it blinks`); else check(r.anim === 0 && r.badColor === RED, `${t0} reduced motion: no blink, steady red`);
    if (!reduce) { await shot(page, host, name + '-wrong', w); await sleep(3800); const b = await info(page, 0); check(b.anim === 0 && b.badColor === RED, `${t0} the blink stops, steady red (${b.anim})`); }
    // a missing digit: only the ones digit typed
    await typeInto(page, 0, a.slice(-1)); await blurAll(page); await sleep(200);
    const m = await info(page, 0);
    const wantM = 'm'.repeat(a.length - 1) + '.';
    check(m.bad && m.digits === wantM, `${t0} a missing digit is an empty red box at its place (${m.digits} want ${wantM})`);
    if (!reduce) await shot(page, host, name + '-missing', w);
  }
  await tap(page, 0); await sleep(120);
  const c = await info(page, 0);
  check(c.v === '' && !c.bad && !c.wd && c.digits === null, `${t0} tapping the red box empties it and removes the red`);
  check(await helped(page, host), `${t0} the item stays "helped"`);
  // a green box never clears
  await typeInto(page, 0, a); await blurAll(page); await sleep(150);
  await tap(page, 0); await sleep(100);
  const g = await info(page, 0);
  check(g.v === a, `${t0} a right box tapped keeps its answer (${g.v})`);
}

async function quiz(page, w) {
  for (const [c, k] of [['addition', 'add_facts'], ['multiplication', 'count_by_tables']]) {
    await boot(page);
    const res = await page.evaluate(async (c, k) => {
      try {
        window.state.range = 100; window.state.decimalPlaces = 0;
        const q = window.generateQuestionFor({ category: c, skill: k, seed: 7, itemIndex: 0 });
        const questions = [{ id: 0, skillId: k, points: 1, questionData: window.quizQuestionData(Object.assign({ categoryId: c }, q)) }];
        const test = { id: null, name: 'A3', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }],
          settings: { timeLimit: null, randomOrder: false, showFeedback: 'instant', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
        window.handleQuizURL(window.compressTestForURL(test));
        const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input'));
        window.startQuizTest();
        return { ans: String(q.ans) };
      } catch (e) { return { err: String(e.message || e) }; }
    }, c, k);
    await sleep(700);
    const t0 = `[${w} quiz ${k}]`;
    if (res.err) { check(false, `${t0} built (${res.err})`); continue; }
    const n = await page.evaluate(() => { const els = Array.from(document.querySelectorAll('#quizTakeView input')).filter((e) => e.offsetWidth > 0 && e.type !== 'hidden' && !e.classList.contains('mq-cellslot-host') && e.type !== 'checkbox'); els.forEach((e, j) => e.setAttribute('data-t', String(j))); return els.length; });
    if (!n) { check(false, `${t0} has a box`); continue; }
    const wrong = '9' + res.ans.split(/\s*,\s*/)[0];
    await typeInto(page, 0, wrong); await blurAll(page); await sleep(200);
    const marks = await page.evaluate(() => document.querySelectorAll('#quizTakeView .mq-wrong-digit, #quizTakeView .mq-live-wrong, .mq-wd-mirror').length);
    check(marks === 0, `${t0} no wrong-digit marks in the quiz (${marks})`);
    const v = await page.evaluate(() => { const el = Array.from(document.querySelectorAll('#quizTakeView input')).find((e) => e.offsetWidth > 0 && e.value); if (!el) return null;
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); el.focus(); return el.value; });
    check(v === wrong, `${t0} tapping the box in the quiz keeps the answer (${v})`);
  }
}

async function run(w) {
  const { page, problems, close } = await open({ seed: 5, viewport: { width: w, height: 900, deviceScaleFactor: 1 } });
  for (const host of ['card', 'worksheet']) for (const s of SCENARIOS) await scenario(page, host, s, w, false);
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  for (const host of ['card', 'worksheet']) for (const s of SCENARIOS) await scenario(page, host, s, w, true);
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await quiz(page, w);
  const errs = problems.filter((p) => !/favicon/.test(p.text));
  check(errs.length === 0, `[${w}] no console errors ${errs.length ? JSON.stringify(errs.slice(0, 3)) : ''}`);
  await close();
}

(async () => {
  for (const w of [1280, 390]) await run(w);
  console.log(fails ? 'wave1-a3-wrongdigits: FAIL' : 'wave1-a3-wrongdigits: OK');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); console.log('wave1-a3-wrongdigits: FAIL'); process.exit(1); });
