// Wave 1 lane A2 (owner 2026-10-02): "Each answer box should turn green as it's filled if correct,
// or red if wrong." Per-box feedback on the PRACTICE CARD and the ONLINE WORKSHEET (never the quiz,
// never print), with a corner mark (tick / cross) so colour is never the only cue.
//
// Covers, at 1280 and 390, on both hosts: count_by_tables (a row of boxes), hundreds_chart_fill
// (chart gaps), add_100_regroup (column digit boxes), add_facts (a single box). For each: a right
// box turns green + tick, a wrong box turns red + cross, an empty box stays neutral, editing a red
// box clears it and a corrected box turns green, and a red box adds NO wrong try (Skip counter
// unchanged). The quiz shows no per-box colour at all. Screenshots: design/audit/runs/wave1-A2/.
//
// Run: /tmp/mq-browser-run.sh node tests/scripts/wave1-a2-perbox.cjs
const fs = require('fs');
const path = require('path');
const { open } = require('../lib/ws-harness.cjs');
const OUT = path.resolve(__dirname, '..', '..', 'design', 'audit', 'runs', 'wave1-A2');
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fails = 0;
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };

const OK_BG = 'rgb(227, 244, 234)';
const BAD_BG = 'rgb(253, 231, 228)';

const SCENARIOS = [
  { c: 'multiplication', k: 'count_by_tables', kind: 'row', shot: true },
  { c: 'composing', k: 'hundreds_chart_fill', kind: 'row', shot: true },
  { c: 'addition', k: 'add_100_regroup', kind: 'stack', shot: true },
  { c: 'addition', k: 'add_facts', kind: 'single', shot: true },
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
    if (host === 'card') {
      st.gameMode = 'practice'; st.currentQAttempts = 0;
      window.showView('gameView'); st.currentQ = window.generateQuestion(); window.renderQuestion();
    } else {
      st.gameMode = 'worksheet'; st.problemCount = 2; window.initWorksheet();
    }
  }, host, s);
  await sleep(host === 'card' ? 600 : 1100);
  await page.evaluate(() => { const d = document.getElementById('mqWorkedDismiss'); if (d) d.click(); });
}

// The boxes of the item with the value each should hold. Marks them data-t="i" so the test can address them.
async function tag(page, host, s) {
  return page.evaluate((host, s) => {
    const q = host === 'card' ? window.state.currentQ : window.state.worksheetQs[0];
    const root = host === 'card' ? document.getElementById('questionCard') : document.getElementById('ws_card_0');
    let els = []; let exp = [];
    const ans = String(q.ans);
    if (s.kind === 'row') {
      els = Array.from(root.querySelectorAll('input.mq-cellslot:not(.mq-cellslot-host)'));
      exp = ans.split(/\s*,\s*/);
    } else if (s.kind === 'stack') {
      const d = ans.replace(/[^0-9]/g, '');
      els = Array.from(root.querySelectorAll('input.mq-digit')).filter((e) => /^ans-\d+$/.test(e.getAttribute('data-ws-slot') || ''));
      els = els.filter((e) => Number(e.getAttribute('data-ws-slot').slice(4)) < d.length)
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

const wrongOf = (e) => { const d = e.replace(/[0-9]$/, (m) => String((Number(m) + 1) % 10)); return d === e ? e + '9' : d; };

async function typeInto(page, i, text) {
  await page.evaluate((i) => { const el = document.querySelector(`[data-t="${i}"]`); el.focus(); el.select && el.select(); el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); }, i);
  await page.keyboard.type(text, { delay: 15 });
}

async function info(page, i) {
  return page.evaluate((i) => {
    const el = document.querySelector(`[data-t="${i}"]`);
    const cs = getComputedStyle(el);
    // a drawn answer place may keep its fill on the cell around the input (the input is then clear)
    let fill = cs.backgroundColor;
    if (fill === 'rgba(0, 0, 0, 0)' && el.parentElement) {
      const wrap = el.closest('[data-mq-cell], .mq-cellbox');
      if (wrap) fill = getComputedStyle(wrap).backgroundColor;
    }
    return { ok: el.classList.contains("mq-live-correct"), bad: el.classList.contains("mq-live-wrong"), img: cs.backgroundImage, bg: fill, focus: document.activeElement === el, inv: el.getAttribute('aria-invalid'), val: el.value };
  }, i);
}

const blurAll = (page) => page.evaluate(() => { const a = document.activeElement; if (a && a.blur) a.blur(); });
const hasMark = (r) => /url\(/.test(r.img);

async function run(w) {
  const { page, problems, close } = await open({ seed: 5, viewport: { width: w, height: 900, deviceScaleFactor: 1 } });
  page.on('dialog', (d) => d.accept().catch(() => {}));
  for (const host of ['card', 'worksheet']) {
    for (const s of SCENARIOS) {
      const tag0 = `[${w} ${host} ${s.k}]`;
      await boot(page);
      await setup(page, host, s);
      const t = await tag(page, host, s);
      if (t.n < 1) { check(false, `${tag0} found its answer boxes (${t.n})`); continue; }
      check(true, `${tag0} ${t.n} box(es), expected ${JSON.stringify(t.exp)}`);
      const wrongTries0 = await page.evaluate((host) => host === 'card' ? (window.state.currentQAttempts || 0) : 0, host);
      if (s.kind === 'single') {
        // a single numeric box: judged on fill, no Check needed
        const bad = wrongOf(t.exp[0]);
        await typeInto(page, 0, bad);
        let r = await info(page, 0);
        check(r.bad && !r.ok && hasMark(r), `${tag0} wrong single box turns red with a cross as soon as it is filled (${JSON.stringify({ bad: r.bad, img: hasMark(r) })})`);
        await blurAll(page);
        r = await info(page, 0);
        check(r.bad && r.bg === BAD_BG, `${tag0} red fill once the pupil leaves it (${r.bg})`);
        check(r.inv === 'true', `${tag0} red box carries aria-invalid`);
        const tries = await page.evaluate((host) => host === 'card' ? (window.state.currentQAttempts || 0) : 0, host);
        check(tries === wrongTries0, `${tag0} red box added no wrong try (${wrongTries0} -> ${tries})`);
        if (s.shot) { await page.evaluate((host) => { (host === 'card' ? document.getElementById('questionCard') : document.getElementById('ws_card_0')).scrollIntoView({ block: 'center' }); }, host); await sleep(150); await shot(page, host, s, w, 'red'); }
        await page.evaluate(() => { const el = document.querySelector('[data-t="0"]'); el.focus(); }); await page.keyboard.press('Backspace');
        r = await info(page, 0);
        check(!r.bad && !r.ok, `${tag0} editing the red box clears its red (${JSON.stringify({ bad: r.bad, val: r.val })})`);
        await typeInto(page, 0, t.exp[0]);
        await blurAll(page); await sleep(100);
        r = await info(page, 0);
        // a worksheet's right answer disables its box and advances; the class stays
        check(r.ok && !r.bad && hasMark(r) && r.bg === OK_BG, `${tag0} corrected box turns green with a tick (${r.bg})`);
        if (host === 'worksheet') await shotAfter(page, host, s, w, 'green');
        continue;
      }
      // a row / stack: box 0 right, box 1 wrong, the rest empty
      await typeInto(page, 0, t.exp[0]);
      if (t.n > 1) await typeInto(page, 1, wrongOf(t.exp[1]));
      await blurAll(page); await sleep(150);
      const r0 = await info(page, 0);
      check(r0.ok && !r0.bad && hasMark(r0) && r0.bg === OK_BG, `${tag0} right box turns green with a tick (${r0.bg})`);
      let r1 = null;
      if (t.n > 1) {
        r1 = await info(page, 1);
        check(r1.bad && !r1.ok && hasMark(r1) && r1.bg === BAD_BG && r1.inv === 'true', `${tag0} wrong box turns red with a cross (${r1.bg})`);
      }
      if (t.n > 2) {
        const r2 = await info(page, 2);
        check(!r2.ok && !r2.bad && !hasMark(r2), `${tag0} an empty box stays neutral`);
      }
      const tries = await page.evaluate((host) => host === 'card' ? (window.state.currentQAttempts || 0) : 0, host);
      check(tries === wrongTries0, `${tag0} red box added no wrong try (${wrongTries0} -> ${tries})`);
      const skipVis = await page.evaluate((host) => {
        const b = host === 'card' ? document.getElementById('skipQuestionBtn') : document.querySelector('#ws_card_0 .ws-skip-btn');
        return !!b && getComputedStyle(b).display !== 'none';
      }, host);
      check(!skipVis, `${tag0} Skip stays hidden (per-box red is not a wrong try)`);
      if (s.shot) { await page.evaluate((host) => { (host === 'card' ? document.getElementById('questionCard') : document.getElementById('ws_card_0')).scrollIntoView({ block: 'center' }); }, host); await sleep(150); await shot(page, host, s, w, 'green-red-empty'); }
      if (t.n > 1) {
        // edit the red box: Backspace clears its red; filling it right turns it green
        await page.evaluate(() => { document.querySelector('[data-t="1"]').focus(); });
        await page.keyboard.press('Backspace');
        let e1 = await info(page, 1);
        const full = t.exp[1].length;
        check(!e1.bad || (e1.val.length >= full), `${tag0} editing the red box clears its red (${JSON.stringify({ bad: e1.bad, val: e1.val })})`);
        await typeInto(page, 1, t.exp[1]);
        await blurAll(page); await sleep(100);
        e1 = await info(page, 1);
        check(e1.ok && !e1.bad && hasMark(e1) && e1.bg === OK_BG, `${tag0} corrected box turns green with a tick (${e1.bg})`);
      }
    }
  }
  // the quiz: no per-box colour, even with instant feedback
  {
    await boot(page);
    const res = await page.evaluate(async () => {
      try {
        const c = 'multiplication', k = 'count_by_tables';
        window.state.range = 100; window.state.decimalPlaces = 0;
        const q = window.generateQuestionFor({ category: c, skill: k, seed: 7, itemIndex: 0 });
        const questions = [{ id: 0, skillId: k, points: 1, questionData: window.quizQuestionData(Object.assign({ categoryId: c }, q)) }];
        const test = { id: null, name: 'A2', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }],
          settings: { timeLimit: null, randomOrder: false, showFeedback: 'instant', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
        window.handleQuizURL(window.compressTestForURL(test));
        const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input'));
        window.startQuizTest();
        return { ans: String(q.ans) };
      } catch (e) { return { err: String(e.message || e) }; }
    });
    await sleep(700);
    if (res.err) check(false, `[${w} quiz] built (${res.err})`);
    else {
      const exp = res.ans.split(/\s*,\s*/);
      const n = await page.evaluate(() => document.querySelectorAll('#quizTakeView input.mq-cellslot:not(.mq-cellslot-host)').length);
      check(n >= 1, `[${w} quiz] the quiz item has ${n} answer box(es)`);
      for (let i = 0; i < Math.min(n, 2); i++) {
        await page.evaluate((i) => { const els = Array.from(document.querySelectorAll('#quizTakeView input.mq-cellslot:not(.mq-cellslot-host)')); els.forEach((e, j) => e.setAttribute('data-t', String(j))); }, i);
        await typeInto(page, i, i === 0 ? exp[0] : wrongOf(exp[1]));
      }
      await blurAll(page); await sleep(150);
      const any = await page.evaluate(() => document.querySelectorAll('#quizTakeView .mq-live-correct, #quizTakeView .mq-live-wrong').length);
      check(any === 0, `[${w} quiz] no per-box green or red in the quiz (${any})`);
      const bgs = await page.evaluate(() => Array.from(document.querySelectorAll('#quizTakeView input.mq-cellslot')).map((e) => getComputedStyle(e).backgroundImage).filter((b) => /url\(/.test(b)).length);
      check(bgs === 0, `[${w} quiz] no corner marks in the quiz (${bgs})`);
    }
  }
  const errs = problems.filter((p) => !/favicon/.test(p.text));
  check(errs.length === 0, `[${w}] no console errors ${errs.length ? JSON.stringify(errs.slice(0, 3)) : ''}`);
  await close();
}

async function shot(page, host, s, w, tagName) {
  const sel = host === 'card' ? '#questionCard' : '#ws_card_0';
  const el = await page.$(sel);
  if (el) await el.screenshot({ path: path.join(OUT, `${host}-${s.k}-${tagName}-${w}.png`) });
}
const shotAfter = shot;

(async () => {
  for (const w of [1280, 390]) await run(w);
  console.log(fails ? 'wave1-a2-perbox: FAIL' : 'wave1-a2-perbox: OK');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); console.log('wave1-a2-perbox: FAIL'); process.exit(1); });
