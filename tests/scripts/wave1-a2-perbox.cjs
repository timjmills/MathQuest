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
  // "every answer box" (owner 2026-10-02): the older multi-box drawings, same look
  { c: 'addition', k: 'add_sub_fact_family', kind: 'sel', sel: 'input.fact-family-input', exp: 'answer', shot: true },
  { c: 'addition', k: 'number_families_add', kind: 'sel', sel: 'input.number-family-input', exp: 'answer', shot: true },
  { c: 'multiplication', k: 'area_model_mult', kind: 'sel', sel: 'input.area-model-input, input.area-model-total', exp: 'answer', shot: true },
  { c: 'placevalue', k: 'expand', kind: 'sel', sel: { card: 'input.expanded-input-box', worksheet: 'input.ws-expanded-input' }, exp: 'expanded', shot: true },
  { c: 'area_perimeter', k: 'area_perimeter', kind: 'sel', sel: 'input.dual-answer-input', exp: 'dual', shot: true },
  { c: 'fractions', k: 'mixed_improper_visual', kind: 'sel', sel: '#mixedInput, #improperInput', exp: 'frac', shot: true },
  { c: 'integers', k: 'order_negatives', kind: 'sel', sel: { card: 'input.order-input-box', worksheet: 'input.ws-order-input' }, exp: 'order', shot: true },
  { c: 'number_theory', k: 'factors_identify', kind: 'sel', sel: 'input.fp-input', exp: 'answer', shot: true },
  { c: 'coordinates', k: 'coordinate_graph', kind: 'sel', sel: 'input.ci-x, input.ci-y', exp: 'coord', want: 'coord-input', shot: true },
  { c: 'algebra', k: 'function_table_easy', kind: 'sel', sel: 'input.mq-cellslot:not(.mq-cellslot-host)', exp: 'parts', shot: true },
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
    st.skillOptions = s.opts || null;
    if (host === 'card') {
      st.gameMode = 'practice'; st.currentQAttempts = 0;
      window.showView('gameView');
      const fits = (q) => (!s.want || q.answerType === s.want) && (!s.size || (s.size === 'big') === (String(q.ans).length >= 2));
      for (let t = 0; t < 60; t++) { st.currentQ = window.generateQuestion(); if (fits(st.currentQ)) break; }
      window.renderQuestion();
    } else {
      st.gameMode = 'worksheet'; st.problemCount = 2;
      const fits = (q) => q && (!s.want || q.answerType === s.want) && (!s.size || (s.size === 'big') === (String(q.ans).length >= 2));
      for (let t = 0; t < 60; t++) { window.initWorksheet(); if (fits(st.worksheetQs[0])) break; }
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
    } else if (s.kind === 'sel') {
      const sel = typeof s.sel === 'string' ? s.sel : s.sel[host];
      els = Array.from(root.querySelectorAll(sel)).filter((e) => e.offsetWidth > 0 && e.type !== 'hidden');
      exp = els.map((e, i) => {
        switch (s.exp) {
          case 'answer': return e.dataset.answer;
          case 'expected': return e.getAttribute('data-expected');
          case 'expanded': return String(q.expandedValues ? q.expandedValues[i] : e.getAttribute('data-expected'));
          case 'order': return q.ans.split(',')[i].trim();
          case 'dual': return String(i === 0 ? q.dualAnswers.perimeter : q.dualAnswers.area);
          case 'frac': return i === 0 ? q.dualFractionAnswers.mixed : q.dualFractionAnswers.improper;
          case 'coord': { const p = q.ans[Number(e.getAttribute('data-point'))]; return String(e.classList.contains('ci-x') ? p.x : p.y); }
          default: return q.ans.split(/\s*,\s*/)[i];
        }
      });
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
  await sleep(80);                       // the badge follows its box on the next animation frames
  return page.evaluate((i) => {
    const el = document.querySelector(`[data-t="${i}"]`);
    const cs = getComputedStyle(el);
    // a drawn answer place may keep its fill on the cell around the input (the input is then clear)
    let fill = cs.backgroundColor;
    if (fill === 'rgba(0, 0, 0, 0)' && el.parentElement) {
      const wrap = el.closest('[data-mq-cell], .mq-cellbox');
      if (wrap) fill = getComputedStyle(wrap).backgroundColor;
    }
    // the tick / cross badge: its box, and whether it touches the text the pupil wrote
    let badge = null;
    const bEl = el.dataset.mqBadge ? document.querySelector(`.mq-live-badge[data-id="${el.dataset.mqBadge}"]`) : null;
    if (bEl) {
      const br = bEl.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      const ctx = document.createElement('canvas').getContext('2d');
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const tw = ctx.measureText(el.value || '').width;
      const fs = parseFloat(cs.fontSize);
      const pl = parseFloat(cs.paddingLeft) || 0, pr = parseFloat(cs.paddingRight) || 0, bw = parseFloat(cs.borderLeftWidth) || 0;
      const left = /left|start/.test(cs.textAlign) ? er.left + bw + pl : er.left + pl + (er.width - pl - pr) / 2 - tw / 2;
      const t = { l: left, r: left + tw, t: er.top + er.height / 2 - 0.36 * fs, b: er.top + er.height / 2 + 0.36 * fs };
      const overlap = tw > 0 && !(br.right <= t.l || br.left >= t.r || br.bottom <= t.t || br.top >= t.b);
      badge = { kind: bEl.dataset.kind, show: getComputedStyle(bEl).display !== 'none', w: Math.round(br.width), h: Math.round(br.height), overlap,
        outside: br.top < er.top + 1 && br.right > er.right - 14 };
    }
    const sib = el.nextElementSibling;
    const clr = sib && sib.tagName === 'BUTTON' ? getComputedStyle(sib).display : null;
    return { os: cs.outlineStyle, bs: cs.borderStyle, badge, clr, ok: el.classList.contains("mq-live-correct"), bad: el.classList.contains("mq-live-wrong"), bg: fill, focus: document.activeElement === el, inv: el.getAttribute('aria-invalid'), val: el.value, helped: !!(el.closest('.problem-card, #questionCard') || {dataset: {}}).dataset.mqHelped };
  }, i);
}

const blurAll = (page) => page.evaluate(() => { const a = document.activeElement; if (a && a.blur) a.blur(); });
const hasMark = (r) => !!r.badge && r.badge.show && ((r.bad && r.badge.kind === 'bad') || (r.ok && r.badge.kind === 'ok'));
const noOverlap = (r) => !!r.badge && !r.badge.overlap;
const dashedWrong = (r) => r.os === 'dashed';
const bigMark = (r) => !!r.badge && r.badge.w >= 16 && r.badge.w <= 18 && r.badge.outside;

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
        check(r.bad && !r.ok && hasMark(r), `${tag0} wrong single box turns red with a cross as soon as it is filled (${JSON.stringify({ bad: r.bad, badge: r.badge })})`);
        check(noOverlap(r), `${tag0} the badge does not touch the digit (${JSON.stringify(r.badge)})`);
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
        if (host === 'worksheet') { await shotAfter(page, host, s, w, 'green'); check(await page.evaluate(() => window.state.worksheetQs[0]._helped === true), `${tag0} the item is recorded as helped (a box went red first)`);
          const prog = await page.evaluate((p0) => {
            const sk = window.state.worksheetQs[0].skillId || window.state.skill;
            const before = (window.state.skillProgress[sk] || { total: 0 }).total;
            window.checkAllWorksheet();
            window.checkAllWorksheet();          // twice: recorded once
            const after = (window.state.skillProgress[sk] || { total: 0 }).total;
            return { d: after - before, txt: document.getElementById('worksheetResult').textContent };
          });
          check(prog.d === 2, `${tag0} Check all records the helped item like a second-try correct: a miss then a hit, once (${prog.d})`);
          check(/Helped: 1/.test(prog.txt), `${tag0} the worksheet result says how many were helped (${prog.txt.replace(/\s+/g, ' ').trim()})`); }
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
        check(dashedWrong(r1) && !dashedWrong(r0) && bigMark(r1) && bigMark(r0), `${tag0} wrong box has a dashed edge (right is solid) and the badges are 16-18 px on the outer corner (${r1.os}/${r0.os}, ${JSON.stringify(r0.badge)})`);
        check(noOverlap(r0) && noOverlap(r1), `${tag0} the badges do not touch the digits (${JSON.stringify([r0.badge && r0.badge.overlap, r1.badge && r1.badge.overlap])})`);
        if (s.kind === 'stack') check(r1.bs === 'dashed', `${tag0} a column stack's wrong digit box has a dashed edge (${r1.bs})`);
        if (s.exp === 'order' && host === 'card') check(r1.clr === 'none', `${tag0} a red ordering box shows no second x (${r1.clr})`);
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
        check(e1.ok && !e1.bad && hasMark(e1) && e1.bg === OK_BG, `${tag0} corrected box turns green with a tick (${e1.bg} ${JSON.stringify(e1.badge)} ${e1.ok})`);
      }
    }
  }
  // blur must not judge a half-typed entry when the pupil goes to the item's own Hint; a leading 0 is not red
  for (const host of ['card', 'worksheet']) {
    for (const mode of ['big', 'small']) {
      const tag0 = `[${w} ${host} add_facts ${mode === 'big' ? 'Hint after a half-typed entry' : 'leading zero'}]`;
      await boot(page);
      await setup(page, host, { c: 'addition', k: 'add_facts', kind: 'single', size: mode });
      const t = await tag(page, host, { kind: 'single' });
      const ans = String(t.exp[0]);
      if ((mode === 'big') !== (ans.length >= 2)) { check(false, `${tag0} item has a ${mode} answer (${ans})`); continue; }
      if (mode === 'big') {
        await typeInto(page, 0, ans[0]);
        await page.click(host === 'card' ? '#hintBtn' : '#ws_card_0 .hint-btn'); await sleep(250);
        const r = await info(page, 0);
        check(!r.bad && !r.ok, `${tag0} the box stays neutral (${JSON.stringify({ bad: r.bad, val: r.val })})`);
        await page.evaluate(() => { if (window.closeHintPopup) window.closeHintPopup(); });
        // leaving for nothing else (the page) does judge it
        await page.evaluate(() => { const el = document.querySelector('[data-t="0"]'); el.focus(); }); await sleep(800);
        await blurAll(page); await sleep(100);
        const r2 = await info(page, 0);
        check(r2.bad, `${tag0} leaving the item to nothing else does judge it (${r2.bad})`);
      } else {
        await typeInto(page, 0, '0');
        let r = await info(page, 0);
        check(!r.bad && !r.ok, `${tag0} "0" for ${ans} is neutral while typing (${JSON.stringify({ bad: r.bad })})`);
        await typeInto(page, 0, '0' + ans);
        r = await info(page, 0);
        check(r.ok && !r.bad, `${tag0} "0${ans}" for ${ans} turns green (${JSON.stringify({ ok: r.ok })})`);
      }
    }
  }
  // owner XP ruling (2026-10-02): an item whose box went red before it was checked right is "helped":
  // still correct, half XP, the streak not extended, progress records a miss then a hit
  for (const helped of [false, true]) {
    const tag0 = `[${w} card add_facts ${helped ? 'red then green' : 'clean'}]`;
    await boot(page);
    await setup(page, 'card', { c: 'addition', k: 'add_facts', kind: 'single' });
    const t = await tag(page, 'card', { kind: 'single' });
    const ans = String(t.exp[0]);
    await page.evaluate(() => {
      window.__xp = []; window.flashXpBurst = (c, txt) => window.__xp.push(String(txt));
      window.state.sessionStreak = 2;
      const sp = window.state.skillProgress && window.state.skillProgress[window.state.skill];
      window.__p0 = sp ? sp.total : 0;
    });
    if (helped) {
      const bad = ans.length === 1 ? String(Number(ans) === 9 ? 8 : Number(ans) + 1) : wrongOf(ans);
      await typeInto(page, 0, bad);
      const r = await info(page, 0);
      check(r.bad, `${tag0} the wrong entry "${bad}" turns the box red first`);
    }
    await typeInto(page, 0, ans);
    await sleep(500);
    const got = await page.evaluate(() => {
      const sp = window.state.skillProgress && window.state.skillProgress[window.state.skill];
      return { xp: window.__xp.slice(), streak: window.state.sessionStreak, dp: (sp ? sp.total : 0) - window.__p0, correct: window.state.lastAnswerCorrect, tries: window.state.currentQAttempts || 0 };
    });
    check(got.correct === true, `${tag0} the item counts as correct`);
    check(got.xp.length === 1 && got.xp[0] === (helped ? '+5 XP' : '+10 XP'), `${tag0} XP ${helped ? 'halved' : 'full'} (${JSON.stringify(got.xp)})`);
    check(got.streak === (helped ? 2 : 3), `${tag0} streak ${helped ? 'not extended (2)' : 'extended (3)'} (${got.streak})`);
    check(got.dp === (helped ? 2 : 1), `${tag0} progress records ${helped ? 'a miss then a hit (2)' : 'one hit (1)'} (${got.dp})`);
    check(got.tries === 0, `${tag0} the red box added no wrong try (${got.tries})`);
  }
  // a "make your own" rule table has no fixed answer: each box is judged from the rule
  for (const host of ['card', 'worksheet']) {
    const tag0 = `[${w} ${host} function_table make]`;
    await boot(page);
    await setup(page, host, { c: 'algebra', k: 'function_table_easy', kind: 'sel', opts: { task: 'make' } });
    const t = await page.evaluate((host) => {
      const q = host === 'card' ? window.state.currentQ : window.state.worksheetQs[0];
      const root = host === 'card' ? document.getElementById('questionCard') : document.getElementById('ws_card_0');
      const els = Array.from(root.querySelectorAll('input.mq-cellslot:not(.mq-cellslot-host)'));
      els.forEach((e, i) => e.setAttribute('data-t', String(i)));
      const p = q.ftCheck;
      const ap = (x) => { let v = x; for (const st of p.rule) v = st.op === '+' ? v + st.n : st.op === '-' ? v - st.n : st.op === 'x' ? v * st.n : v / st.n; return v; };
      return { task: p && p.task, n: els.length, rows: (p && p.rows || []).length, rule: JSON.stringify(p && p.rule), ap: [3, 4].map(ap) };
    }, host);
    if (t.task !== 'make' || t.n < 4) { check(false, `${tag0} a make table with In/Out boxes (${JSON.stringify(t)})`); continue; }
    // row 0: In 3, Out right; row 1: In 4, Out wrong
    await typeInto(page, 0, '3'); await typeInto(page, 1, String(t.ap[0])); await typeInto(page, 2, '4'); await typeInto(page, 3, String(t.ap[1] + 1));
    await blurAll(page); await sleep(150);
    const r = [];
    for (let i = 0; i < 4; i++) r.push(await info(page, i));
    check(r[0].ok && r[1].ok && r[2].ok && !r[3].ok && r[3].bad && hasMark(r[1]) && hasMark(r[3]), `${tag0} Out judged from the rule on its In box: right row green, wrong Out red (${JSON.stringify(r.map((x) => x.ok ? 'ok' : x.bad ? 'bad' : '-'))})`);
    await typeInto(page, 3, String(t.ap[1])); await blurAll(page); await sleep(100);
    const fixed = await info(page, 3);
    check(fixed.ok && !fixed.bad, `${tag0} the corrected Out turns green`);
    await typeInto(page, 2, '3'); await blurAll(page); await sleep(100);
    const dup = await info(page, 2);
    check(dup.bad && !dup.ok, `${tag0} an In number another row already uses turns red`);
    // key by key (row 1 In = 1; row 2 In typed 1 then 0 toward 10): nothing goes red on the way, no "helped" flag
    await boot(page);
    await setup(page, host, { c: 'algebra', k: 'function_table_easy', kind: 'sel', opts: { task: 'make' } });
    await page.evaluate((host) => {
      const root = host === 'card' ? document.getElementById('questionCard') : document.getElementById('ws_card_0');
      Array.from(root.querySelectorAll('input.mq-cellslot:not(.mq-cellslot-host)')).forEach((e, i) => e.setAttribute('data-t', String(i)));
    }, host);
    await typeInto(page, 0, '1');                       // row 1 In
    await page.evaluate(() => { document.querySelector('[data-t="2"]').focus(); });
    const walk = [];
    for (const key of ['1', '0']) {
      await page.keyboard.type(key, { delay: 15 }); await sleep(120);
      const st = await page.evaluate((host) => {
        const root = host === 'card' ? document.getElementById('questionCard') : document.getElementById('ws_card_0');
        return { red: root.querySelectorAll('.mq-live-wrong').length, helped: !!root.dataset.mqHelped };
      }, host);
      walk.push(st);
    }
    check(walk.every((x) => x.red === 0 && !x.helped), `${tag0} typing 1 then 0 toward 10 turns nothing red and flags nothing helped (${JSON.stringify(walk)})`);
  }
  // the quiz: no per-box colour, even with instant feedback
  for (const [c, k, sel] of [['multiplication', 'count_by_tables', 'input.mq-cellslot'], ['addition', 'add_sub_fact_family', 'input.fact-family-input'], ['multiplication', 'area_model_mult', 'input.area-model-input, input.area-model-total']]) {
    await boot(page);
    const res = await page.evaluate(async (c, k) => {
      try {
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
    }, c, k);
    await sleep(700);
    const tag0 = `[${w} quiz ${k}]`;
    if (res.err) { check(false, `${tag0} built (${res.err})`); continue; }
    const exp = res.ans.split(/\s*,\s*/);
    const n = await page.evaluate((sel) => { const els = Array.from(document.querySelectorAll('#quizTakeView ' + sel.split(',').map((x) => x.trim()).join(', #quizTakeView '))).filter((e) => e.offsetWidth > 0 && !e.classList.contains('mq-cellslot-host')); els.forEach((e, j) => e.setAttribute('data-t', String(j))); return els.length; }, sel);
    check(n >= 1, `${tag0} the quiz item has ${n} answer box(es)`);
    for (let i = 0; i < Math.min(n, 2); i++) await typeInto(page, i, i === 0 ? exp[0] : wrongOf(exp[1] || exp[0]));
    await blurAll(page); await sleep(150);
    const any = await page.evaluate(() => document.querySelectorAll('#quizTakeView .mq-live-correct, #quizTakeView .mq-live-wrong').length);
    check(any === 0, `${tag0} no per-box green or red in the quiz (${any})`);
    const bgs = await page.evaluate(() => document.querySelectorAll('.mq-live-badge').length);
    check(bgs === 0, `${tag0} no corner marks in the quiz (${bgs})`);
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
