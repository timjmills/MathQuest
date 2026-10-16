// Small fixes item 4 (2026-10-09): QUIZ word problems.
//  (a) Going back to a word problem put the joined answer ("816") into the FIRST digit box ([816|_|_|_]): the row joins
//      its digits with no separator, and the restore split on ",". Each box must get its own digit back, holes and all.
//  (b) The "partial" rule grouped boxes by .mq-wwans, which wraps EACH digit box, so "[_|8|1|_]" (ones box empty) counted
//      as answered. It groups by the answer row now: a box left empty right of a filled one is partial.
// Run: node tests/scripts/small-fixes-quiz-wordrow.cjs
const { open } = require('../lib/ws-harness.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fails = 0;
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };

const SKILLS = [['addition', 'add_word_problems'], ['subtraction', 'sub_word_problems']];
const SIZES = [{ width: 1366, height: 650 }, { width: 1280, height: 600 }];

(async () => {
  for (const vp of SIZES) {
    for (const [c, k] of SKILLS) {
      const app = await open({ viewport: { ...vp, deviceScaleFactor: 1 } });
      const { page } = app;
      const errs = [];
      page.on('pageerror', (e) => errs.push(String(e)));
      const tag = `[${vp.width}x${vp.height} quiz ${k}]`;
      try {
        await page.waitForFunction(() => typeof window.generateQuestionFor === 'function', { timeout: 30000 });
        const res = await page.evaluate((c, k) => {
          try {
            window.state.range = 100; window.state.decimalPlaces = 0;
            const qs = [0, 1].map((i) => window.generateQuestionFor({ category: c, skill: k, seed: 5 + i, itemIndex: i }));
            const questions = qs.map((q, i) => ({ id: i, skillId: k, points: 1, questionData: window.quizQuestionData(Object.assign({ categoryId: c }, q)) }));
            const test = { id: null, name: 'WP', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }],
              settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
            window.handleQuizURL(window.compressTestForURL(test));
            const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input'));
            window.startQuizTest();
            return { ans: qs.map((q) => String(q.ans)), tpl: qs.map((q) => q.cell && q.cell.template) };
          } catch (e) { return { err: String(e.message || e) }; }
        }, c, k);
        await sleep(800);
        if (res.err) { check(false, `${tag} built (${res.err})`); continue; }
        const boxesOf = () => page.evaluate(() => [...document.querySelectorAll('.qt-question-card .mq-wwans input.mq-cellslot')].map((e) => e.value));
        const n = (await boxesOf()).length;
        check(n >= 2, `${tag} the answer row has ${n} digit boxes (${res.tpl[0]})`);
        if (n < 2) continue;
        const ans = res.ans[0].replace(/\D/g, '');
        // (a) type the answer into the rightmost boxes, go on, come back
        const typeRow = async (vals) => {
          for (let i = 0; i < vals.length; i++) {
            if (!vals[i]) continue;
            await page.evaluate((i) => { const el = document.querySelectorAll('.qt-question-card .mq-wwans input.mq-cellslot')[i]; el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); el.focus(); el.value = ''; }, i);
            await page.keyboard.type(vals[i], { delay: 15 });
          }
          await page.evaluate(() => document.activeElement && document.activeElement.blur());
          await sleep(150);
        };
        const full = [...Array(n - ans.length).fill(''), ...ans];
        await typeRow(full);
        await page.evaluate(() => window.navigateQuizQuestion(1)); await sleep(500);
        await page.evaluate(() => window.navigateQuizQuestion(-1)); await sleep(700);
        const back = await boxesOf();
        check(JSON.stringify(back) === JSON.stringify(full), `${tag} back on the item, each box holds its own digit: [${back.join('|')}] (typed [${full.join('|')}])`);
        const rec = await page.evaluate(() => document.getElementById('qtAnswerInput').value);
        check(rec === ans, `${tag} the answer still reads ${ans} (${rec})`);
        // (c) the working: every copy box, the sign box and the tapped sign come back too (critic r1 D4)
        const work = await page.evaluate(() => {
          const card = document.querySelector('.qt-question-card');
          const ops = [...card.querySelectorAll('button.mq-wwop')];
          if (ops.length) ops[ops.length - 1].click();
          const ins = [...card.querySelectorAll('input.mq-wwork')];
          ins.forEach((e, i) => { e.value = e.matches('[data-mq-kind="sign"]') ? '+' : String((i % 9) + 1); e.dispatchEvent(new Event('input', { bubbles: true })); });
          return { boxes: ins.map((e) => e.value), pressed: ops.map((b) => b.getAttribute('aria-pressed') === 'true') };
        });
        await page.evaluate(() => window.navigateQuizQuestion(1)); await sleep(500);
        await page.evaluate(() => window.navigateQuizQuestion(-1)); await sleep(700);
        const work2 = await page.evaluate(() => {
          const card = document.querySelector('.qt-question-card');
          return { boxes: [...card.querySelectorAll('input.mq-wwork')].map((e) => e.value), pressed: [...card.querySelectorAll('button.mq-wwop')].map((b) => b.getAttribute('aria-pressed') === 'true') };
        });
        check(work.boxes.length > 0 && JSON.stringify(work2) === JSON.stringify(work), `${tag} the working (${work.boxes.length} boxes, sign ${work.pressed.indexOf(true)}) comes back as left: ${JSON.stringify(work2.boxes)} sign ${work2.pressed.indexOf(true)}`);
        check(JSON.stringify(await boxesOf()) === JSON.stringify(full), `${tag} the answer row is still as typed after the working round trip`);
        // (b) a hole on the right: [_|8|1|_]
        const holey = full.slice(); holey[n - 1] = '';
        await page.evaluate(() => { document.querySelectorAll('.qt-question-card .mq-wwans input.mq-cellslot').forEach((e) => { e.value = ''; e.dispatchEvent(new Event('input', { bubbles: true })); }); });
        await typeRow(holey);
        const dot = await page.evaluate(() => { const d = document.querySelectorAll('.qt-q-grid .qt-q-dot')[0]; return d ? d.classList.contains('answered') : null; });
        await page.evaluate(() => window.navigateQuizQuestion(1)); await sleep(400);
        await page.evaluate(() => window.navigateQuizQuestion(-1)); await sleep(700);
        const back2 = await boxesOf();
        check(JSON.stringify(back2) === JSON.stringify(holey), `${tag} a row with the ones box empty comes back as typed: [${back2.join('|')}]`);
        // the page dot and the answered count treat it as not finished (a full row is answered)
        const st = await page.evaluate(() => ({ dot: document.querySelectorAll('.qt-q-grid .qt-q-dot')[0].classList.contains('answered'),
          count: (document.querySelector('#quizTakeView .qt-topbar-right > span:last-child') || {}).textContent }));
        check(dot === false && st.dot === false && /^0\//.test(st.count || ''), `${tag} the row with the ones box empty is not answered (dot ${st.dot}, "${st.count}"; live dot before: ${dot})`);
        await typeRow(full);
        const st2 = await page.evaluate(() => ({ dot: document.querySelectorAll('.qt-q-grid .qt-q-dot')[0].classList.contains('answered'),
          count: (document.querySelector('#quizTakeView .qt-topbar-right > span:last-child') || {}).textContent }));
        check(st2.dot === true && /^1\//.test(st2.count || ''), `${tag} filling the ones box answers it (dot ${st2.dot}, "${st2.count}")`);
        check(errs.length === 0, `${tag} no page errors ${errs.join(' ')}`);
      } catch (e) {
        check(false, `${tag} ${e.message}`);
      } finally { await app.close(); }
    }
  }
  console.log(fails ? `small-fixes-quiz-wordrow: FAIL (${fails})` : 'small-fixes-quiz-wordrow: OK');
  process.exit(fails ? 1 : 0);
})();
