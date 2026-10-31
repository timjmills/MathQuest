// The two ways a set of skills prints (owner 2026-10-31, mixed pages M2): "In sections" (each skill its own part)
// and "Mixed up" (problems mixed one by one), both driven by the per-skill amounts.
//
// Checks, on the real Teacher site sheets:
//   1. the Print sheet shows the choice In sections | Mixed up (+ Single skill) for a set of 2+ skills
//   2. In sections → 'independent' requests, a section per skill
//   3. Mixed up → 'mixed-practice' requests with arrangement 'mixed', one section per skill with a count; on every
//      page the counts are the plan's page counts, the totals are the plan's totals, every page holds 2+ skills, and
//      a skill on a page gets >= 2 there where its total allows; also in Problems in all and Problems of each skill
//   4. an exact count (Problems of each skill: a number) is printed mixed at exactly that count
//   5. the share link carries Wm for Mixed up and no W token for In sections
//   6. the online quiz's mixed order: no run > 2 of a skill (where avoidable), every skill in the first third
//   7. the saved print settings carry the kind and put it back; a set saved without it changes nothing
//   8. the older print screen (teacher-print.js): In sections | Mixed up for More practice / Independent / Mixed
//      practice with 2+ skills, passed as req.arrangement
//
//   node tests/scripts/ws-teacher-arrangement.cjs
//   SHOTS=design/status/mixed-m2 node tests/scripts/ws-teacher-arrangement.cjs   # also the screenshots
const fs = require('fs');
const path = require('path');
const { open, waitFor } = require('../lib/ws-harness.cjs');

const SHOTS = process.env.SHOTS || '';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const failures = [];
  const check = (ok, msg) => { if (!ok) failures.push(msg); };
  if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
  const app = await open({ viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
  const { page } = app;
  page.on('dialog', (d) => d.accept());
  try {
    await page.evaluate(() => {
      try { localStorage.removeItem('mq_teacher_sheet'); } catch (e) { /* */ }
      window.setUserRole('teacher');
      window.UnifiedSkills.clear();
      const add = (c, s) => window.UnifiedSkills.add({ domainId: window.getDomainByCategory(c), categoryId: c, skillId: s, skillLabel: s });
      add('addition', 'add_facts'); add('subtraction', 'sub_facts'); add('multiplication', 'mult_facts');
      window.skillQueue = [...window.UnifiedSkills.skills];
    });
    await waitFor(page, () => document.body.classList.contains('teacher-mode'), 10000, 'teacher mode');
    await page.evaluate(() => window.tvOpenSheet('print'));
    await sleep(600);

    /* 1 the choice */
    const ui = await page.evaluate(() => {
      const g = document.querySelector('[data-tvs-arrange]');
      const btns = g ? [...g.querySelectorAll('[data-act="kind"]')] : [];
      return { has: !!g, names: btns.map((b) => (b.querySelector('.tvs-kind-name') || {}).textContent), subs: btns.map((b) => (b.querySelector('.tvs-kind-sub') || {}).textContent), on: ((btns.find((b) => b.getAttribute('aria-checked') === 'true') || {}).dataset || {}).v };
    });
    check(ui.has, 'no In sections | Mixed up choice on the Print sheet for 3 skills');
    check(ui.names.includes('In sections') && ui.names.includes('Mixed up'), `the choice reads ${ui.names.join(' | ')}`);
    check(ui.subs.includes('Each skill in its own part') && ui.subs.includes('Problems mixed one by one'), `the sub-lines read ${ui.subs.join(' | ')}`);
    check(ui.on === 'mixed', `a 3-skill set does not default to Mixed up (${JSON.stringify(ui.on)} ${JSON.stringify(ui.names)})`);

    const clickKind = async (v) => { await page.evaluate((v) => document.querySelector(`.tvs-kinds [data-act="kind"][data-v="${v}"]`).click(), v); await sleep(300); };
    const reqs = () => page.evaluate(() => (window.tvSheetChecks ? window.tvSheetChecks.requests() : null));
    const planOf = () => page.evaluate(() => window.tvSheetState().plan);

    /* 2 In sections */
    await clickKind('sections');
    let r = await reqs();
    check(Array.isArray(r) && r.length && r.every((x) => x.req.role === 'independent' && x.req.arrangement !== 'mixed' && x.req.sections.length >= 2), `In sections does not send independent section requests (${JSON.stringify((r || []).map((x) => x.req.role))})`);

    /* 3 Mixed up, in every How much mode */
    await clickKind('mixed');
    if (SHOTS) { await page.screenshot({ path: path.join(SHOTS, 'dialog-print-mixed.png') }); }
    const mixedOk = async (label) => {
      const rq = await reqs(); const p = await planOf();
      if (!rq || !rq.length || !p) { check(false, `${label}: no requests or plan`); return; }
      check(rq.every((x) => x.req.role === 'mixed-practice' && x.req.arrangement === 'mixed'), `${label}: Mixed up sends ${JSON.stringify(rq.map((x) => [x.req.role, x.req.arrangement]))}`);
      check(rq.every((x) => x.req.sections.every((s) => s.skills.length === 1 && s.count > 0)), `${label}: a mixed request section has no exact count`);
      const tot = {};
      rq.forEach((x, i) => {
        const pg = {}; (p.pageItems[i] || []).forEach((k) => { pg[k] = (pg[k] || 0) + 1; });
        x.keys.forEach((k, j) => { tot[k] = (tot[k] || 0) + x.req.sections[j].count * x.copies; check(x.req.sections[j].count === pg[k], `${label}: page ${i + 1} sends ${x.req.sections[j].count} of ${k}, the plan has ${pg[k]}`); });
        check(x.keys.length >= 2, `${label}: page ${i + 1} is not mixed (${x.keys.join(', ')})`);
        x.keys.forEach((k, j) => check(x.req.sections[j].count >= 2 || (p.byKey[k] || 0) < 2, `${label}: page ${i + 1} has a lone ${k}`));
      });
      Object.keys(p.byKey).forEach((k) => check((tot[k] || 0) === p.byKey[k], `${label}: ${k} prints ${tot[k] || 0}, the plan says ${p.byKey[k]}`));
      return { pages: rq.length, total: Object.values(tot).reduce((a, b) => a + b, 0) };
    };
    const m1 = await mixedOk('Pages 1');
    await page.evaluate(() => { const b = document.querySelector('[data-act="pages"][data-v="3"]'); if (b) b.click(); });
    await sleep(300);
    const m3 = await mixedOk('Pages 3');
    check(m3 && m3.pages === 3, `Pages 3 sends ${m3 && m3.pages} page requests`);
    await page.evaluate(() => { const b = document.querySelector('[data-act="mode"][data-v="total"]'); if (b) b.click(); });
    await sleep(300);
    await page.evaluate(() => { const b = document.querySelector('[data-act="ntotal"][data-v="20"]'); if (b) b.click(); });
    await sleep(300);
    const mt = await mixedOk('20 in all');
    check(mt && mt.total === 20, `20 problems in all print ${mt && mt.total}`);
    await page.evaluate(() => { const b = document.querySelector('[data-act="mode"][data-v="each"]'); if (b) b.click(); });
    await sleep(300);
    await page.evaluate(() => { const b = document.querySelector('[data-act="neach"][data-v="6"]'); if (b) b.click(); });
    await sleep(300);
    const me = await mixedOk('6 of each');
    check(me && me.total === 18, `6 of each skill (3 skills) print ${me && me.total}`);

    /* 4 an exact count drives the mix */
    await page.evaluate(() => { const b = document.querySelector('[data-act="mode"][data-v="pages"]'); if (b) b.click(); });
    await sleep(200);
    await page.evaluate(() => {
      const it = window.UnifiedSkills.skills;
      const s = it.find((x) => x.skillId === 'mult_facts'); if (s) s.count = 5;
      window.tvOpenSheet('print');
    });
    await sleep(400);
    const mc = await mixedOk('a count of 5');
    const pc = await planOf();
    check(pc && pc.byKey['multiplication:mult_facts'] === 5, `a count of 5 plans ${pc && pc.byKey['multiplication:mult_facts']}`);
    await page.evaluate(() => { const it = window.UnifiedSkills.skills; it.forEach((x) => { delete x.count; }); });
    void m1; void mc;

    /* 7 saved settings */
    const saved = await page.evaluate(() => window.tvSheetPrint.get());
    check(saved && saved.kind === 'mixed', `the saved print settings carry kind ${saved && saved.kind}`);
    await page.evaluate(() => window.tvSheetPrint.set({ opts: {}, kind: 'sections' }));
    check((await page.evaluate(() => window.tvSheetState().kind)) === 'sections', 'a saved kind is not put back');
    await page.evaluate(() => window.tvSheetPrint.set({ opts: {} }));
    check((await page.evaluate(() => window.tvSheetState().kind)) === 'sections', 'a set saved without a kind changed the kind');

    /* 5 the share link */
    const linkFor = async (v) => {
      await page.evaluate(() => window.tvCloseSheet());
      await page.evaluate(() => window.tvOpenSheet('print'));
      await sleep(200);
      await clickKind(v);
      await page.evaluate(() => { window.tvCloseSheet(); window.tvOpenSheet('share'); });
      await sleep(600);
      const st = await page.evaluate(() => window.tvSheetState().share);
      return st ? decodeURIComponent(String(st.link).split('&set=')[0]) : '';
    };
    const lm = await linkFor('mixed');
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'dialog-share-mixed.png') });
    check(/[|-]Wm(-|$|&)/.test(lm), `the Mixed up share link has no Wm (${lm})`);
    const ls = await linkFor('sections');
    check(ls && !/[|-]W[a-z](-|$|&)/.test(ls), `the In sections share link carries a W token (${ls})`);

    /* 6 the online quiz order */
    await page.evaluate(() => window.tvCloseSheet());
    await page.evaluate(() => window.tvOpenSheet('quiz'));
    await sleep(300);
    const qz = await page.evaluate(() => document.querySelector('[data-tvs-arrange] [data-act="kind"][data-v="mixed"]') ? 1 : 0);
    check(qz === 1, 'the Quiz sheet has no In sections | Mixed up choice');
    await clickKind('mixed');
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'dialog-quiz-mixed.png') });
    const qt = await page.evaluate(async () => { const t = await window.tvSheetChecks.quizTest(); return t.sections.map((s) => s.questions.map((q) => q.skillId)); });
    const seq = qt.flat();
    const keys = [...new Set(seq)];
    let run = 1, longest = 1;
    for (let i = 1; i < seq.length; i++) { run = seq[i] === seq[i - 1] ? run + 1 : 1; longest = Math.max(longest, run); }
    check(qt.length === 1 && keys.length >= 3, `the mixed quiz is not one mixed section (${qt.length} sections, ${keys.length} skills)`);
    check(longest <= 2, `the mixed quiz has a run of ${longest} of one skill`);
    const third = Math.ceil(seq.length / 3);
    check(keys.every((k) => seq.indexOf(k) < third), 'a skill is missing from the first third of the mixed quiz');
    // the order helper itself: 8 of one, 4 and 4 of two others -> runs of 2 at most
    const ord = await page.evaluate(() => window.tvSheetChecks.mixedOrder([{ key: 'a', qs: Array.from({ length: 8 }, (_, i) => 'a' + i) }, { key: 'b', qs: ['b0', 'b1', 'b2', 'b3'] }, { key: 'c', qs: ['c0', 'c1', 'c2', 'c3'] }], 12345));
    let r2 = 1, l2 = 1;
    for (let i = 1; i < ord.length; i++) { r2 = ord[i][0] === ord[i - 1][0] ? r2 + 1 : 1; l2 = Math.max(l2, r2); }
    check(ord.length === 16 && l2 <= 2, `mixedOrder 8:4:4 has a run of ${l2} (${ord.join(' ')})`);
    check(ord.filter((x) => x[0] === 'a').join() === 'a0,a1,a2,a3,a4,a5,a6,a7', 'mixedOrder does not keep each skill in its order');
    await page.evaluate(() => window.tvCloseSheet());

    /* 8 the older print screen */
    await page.evaluate(() => window.tvOpenPrintWith([{ categoryId: 'addition', skillId: 'add_facts' }, { categoryId: 'subtraction', skillId: 'sub_facts' }]));
    await sleep(800);
    const old = await page.evaluate(() => ({ choice: !!document.querySelector('[data-tv-arrange] [data-act="arrange"][data-v="mixed"]'), req: window.tvPrintChecks && window.tvPrintChecks.req() }));
    check(old.choice, 'the print screen has no In sections | Mixed up choice for More practice with 2 skills');
    check(old.req && old.req.parts[0] && old.req.parts[0].arrangement === 'sections', `More practice sends arrangement ${old.req && old.req.parts[0] && old.req.parts[0].arrangement}`);
    await page.evaluate(() => document.querySelector('[data-tv-arrange] [data-act="arrange"][data-v="mixed"]').click());
    await sleep(300);
    if (SHOTS) { await page.evaluate(() => document.querySelector('[data-tv-arrange]').scrollIntoView({ block: 'center' })); await page.screenshot({ path: path.join(SHOTS, 'dialog-print-screen.png') }); }
    const old2 = await page.evaluate(() => window.tvPrintChecks.req());
    check(old2.parts[0].arrangement === 'mixed', `Mixed up on the print screen sends ${old2.parts[0].arrangement}`);

    const errs = app.problems.filter((p) => !/ERR_ABORTED/.test(p.text));
    check(!errs.length, `console errors: ${errs.map((p) => p.text).slice(0, 3).join(' | ')}`);
  } catch (e) {
    failures.push('crashed: ' + (e && e.stack || e));
  }
  await app.close();
  if (failures.length) { failures.forEach((f) => console.log('  FAIL ' + f)); console.log(`ws-teacher-arrangement: FAIL (${failures.length})`); process.exit(1); }
  console.log('ws-teacher-arrangement: OK');
  process.exit(0);
})();
