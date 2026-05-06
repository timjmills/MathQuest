// E2E test: MAP redo updates the bubble color but never mutates RIT.
// Verifies:
//   (1) Wrong  -> redo correct  => bubble turns wrong-then-right green; RIT unchanged
//   (2) Skipped -> redo correct  => bubble turns wrong-then-right green; skipped flag clears
//   (3) Correct -> redo (any)    => history unchanged (immutable)
//   (4) Wrong  -> redo wrong     => bubble stays red (no downgrade)
//   (5) Tooltip text reflects each state
//
// Run: node tests/map-redo-bubble-e2e.cjs (requires npx serve on :8765 + puppeteer).

const puppeteer = require('puppeteer');
const URL = 'http://localhost:8765/';
const failures = [];
function fail(msg) { failures.push(msg); console.error('  ✗', msg); }
function pass(msg) { console.log('  ✓', msg); }

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  page.on('pageerror', err => fail('pageerror: ' + err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (/favicon|preload|font/i.test(text)) return;
      fail('console.error: ' + text);
    }
  });
  await page.goto(URL, { waitUntil: 'networkidle0' });

  // Helper: install a fake MAP session and simulate a redo answer.
  // Returns the resulting mapHistory entry + observable side effects.
  const setup = async () => page.evaluate(() => {
    window.state.mapMode = true;
    window.state.mapSessionMode = 'practice';
    window.state.mapItemCount = 3;
    window.state.mapItemCountTarget = 5;
    window.state.mapCurrentRit = 200;
    window.state.mapCorrectStreak = 1;
    window.state.mapIncorrectStreak = 0;
    window.state.mapPerDomainItems = { algebra: 3 };
    window.state.mapPerDomainCorrect = { algebra: 1 };
    window.state.mapPerDomainRitSum = { algebra: 600 };
    window.state.mapSkippedCount = 1;
    window.state.mapHistory = [
      { skillId: 'add', correct: false, skipped: false, ritBefore: 200, ritAfter: 195 },     // wrong
      { skillId: 'add', correct: false, skipped: true,  ritBefore: 195, ritAfter: 195 },     // skipped
      { skillId: 'add', correct: true,  skipped: false, ritBefore: 195, ritAfter: 200 },     // correct
    ];
  });

  // --- [1] Wrong -> redo correct ---
  console.log('\n[1] Wrong → redo CORRECT becomes wrong-then-right green:');
  await setup();
  const before1 = await page.evaluate(() => ({
    rit: window.state.mapCurrentRit,
    correctStreak: window.state.mapCorrectStreak,
    perDomainCorrect: { ...window.state.mapPerDomainCorrect },
    perDomainItems: { ...window.state.mapPerDomainItems },
    itemCount: window.state.mapItemCount,
  }));
  await page.evaluate(() => {
    window.state.currentQ = {
      _mapSkillId: 'add', _mapDomain: 'algebra',
      _isMapReview: true, _mapReviewIndex: 0,
    };
    window.recordMapAnswer({ correct: true });
  });
  const after1 = await page.evaluate(() => ({
    h: window.state.mapHistory[0],
    rit: window.state.mapCurrentRit,
    correctStreak: window.state.mapCorrectStreak,
    perDomainCorrect: { ...window.state.mapPerDomainCorrect },
    perDomainItems: { ...window.state.mapPerDomainItems },
    itemCount: window.state.mapItemCount,
  }));
  if (after1.h.correct === true && after1.h.wasWrong === true) pass('history[0].correct=true, wasWrong=true');
  else fail('history[0] not upgraded properly: ' + JSON.stringify(after1.h));
  if (after1.rit === before1.rit) pass('RIT unchanged (' + after1.rit + ')');
  else fail('RIT changed: ' + before1.rit + ' -> ' + after1.rit);
  if (after1.correctStreak === before1.correctStreak) pass('mapCorrectStreak unchanged');
  else fail('mapCorrectStreak changed: ' + before1.correctStreak + ' -> ' + after1.correctStreak);
  if (after1.perDomainCorrect.algebra === before1.perDomainCorrect.algebra) pass('per-domain correct unchanged');
  else fail('per-domain correct changed');
  if (after1.perDomainItems.algebra === before1.perDomainItems.algebra) pass('per-domain items unchanged');
  else fail('per-domain items changed');
  if (after1.itemCount === before1.itemCount) pass('mapItemCount unchanged');
  else fail('mapItemCount changed');

  // Verify dot CSS class
  const dot1cls = await page.$eval('.map-nav-dot[data-i="0"]', el => el.className);
  if (/wrong-then-right/.test(dot1cls)) pass('Dot class includes wrong-then-right: ' + dot1cls);
  else fail('Dot class missing wrong-then-right: ' + dot1cls);
  const dot1tip = await page.$eval('.map-nav-dot[data-i="0"]', el => el.title);
  if (/Got it right after a wrong try/.test(dot1tip)) pass('Tooltip reflects redo win: ' + dot1tip);
  else fail('Tooltip wrong: ' + dot1tip);

  // --- [2] Skipped -> redo correct ---
  console.log('\n[2] Skipped → redo CORRECT becomes wrong-then-right green; skipped clears:');
  await setup();
  const beforeSkipCount = await page.evaluate(() => window.state.mapSkippedCount);
  await page.evaluate(() => {
    window.state.currentQ = {
      _mapSkillId: 'add', _mapDomain: 'algebra',
      _isMapReview: true, _mapReviewIndex: 1,
    };
    window.recordMapAnswer({ correct: true });
  });
  const after2 = await page.evaluate(() => ({
    h: window.state.mapHistory[1],
    skipCount: window.state.mapSkippedCount,
  }));
  if (after2.h.correct === true && after2.h.skipped === false && after2.h.wasWrong === true) pass('Skipped→correct: history[1] correct=true, skipped=false, wasWrong=true');
  else fail('Skipped→correct flags wrong: ' + JSON.stringify(after2.h));
  if (after2.skipCount === beforeSkipCount - 1) pass('mapSkippedCount decremented (' + beforeSkipCount + '→' + after2.skipCount + ')');
  else fail('skipCount expected ' + (beforeSkipCount - 1) + ' got ' + after2.skipCount);
  const dot2cls = await page.$eval('.map-nav-dot[data-i="1"]', el => el.className);
  if (/wrong-then-right/.test(dot2cls) && !/skipped/.test(dot2cls)) pass('Dot[1] now wrong-then-right (no skipped class)');
  else fail('Dot[1] class wrong: ' + dot2cls);

  // --- [3] Correct -> redo (anything) leaves history alone ---
  console.log('\n[3] Already-correct items are immutable on redo:');
  await setup();
  const beforeH2 = await page.evaluate(() => ({ ...window.state.mapHistory[2] }));
  // Try a wrong redo on the originally correct item
  await page.evaluate(() => {
    window.state.currentQ = {
      _mapSkillId: 'add', _mapDomain: 'algebra',
      _isMapReview: true, _mapReviewIndex: 2,
    };
    window.recordMapAnswer({ correct: false });
  });
  const after3 = await page.evaluate(() => window.state.mapHistory[2]);
  if (after3.correct === beforeH2.correct && !after3.wasWrong) pass('Correct item unchanged after redo-wrong');
  else fail('Correct item mutated: ' + JSON.stringify(after3));

  // --- [4] Wrong -> redo wrong stays wrong (no downgrade beyond original) ---
  console.log('\n[4] Wrong → redo WRONG: history unchanged:');
  await setup();
  const beforeH0 = await page.evaluate(() => ({ ...window.state.mapHistory[0] }));
  await page.evaluate(() => {
    window.state.currentQ = {
      _mapSkillId: 'add', _mapDomain: 'algebra',
      _isMapReview: true, _mapReviewIndex: 0,
    };
    window.recordMapAnswer({ correct: false });
  });
  const after4 = await page.evaluate(() => window.state.mapHistory[0]);
  if (after4.correct === false && !after4.wasWrong) pass('Wrong-on-redo-wrong: dot stays red');
  else fail('Wrong-on-redo-wrong mutated unexpectedly: ' + JSON.stringify(after4));

  // --- [5] Skipped -> redo wrong stays skipped ---
  console.log('\n[5] Skipped → redo WRONG: bubble stays skipped (student can keep trying):');
  await setup();
  await page.evaluate(() => {
    window.state.currentQ = {
      _mapSkillId: 'add', _mapDomain: 'algebra',
      _isMapReview: true, _mapReviewIndex: 1,
    };
    window.recordMapAnswer({ correct: false });
  });
  const after5 = await page.evaluate(() => window.state.mapHistory[1]);
  if (after5.skipped === true && after5.correct === false) pass('Skipped-on-redo-wrong: stays skipped');
  else fail('Skipped-on-redo-wrong mutated: ' + JSON.stringify(after5));

  // --- [6] Tooltip wording for each state ---
  console.log('\n[6] Tooltip text per state:');
  await setup();
  // Redo item 0 to correct so we have all 4 dot states (correct, wrong-then-right
  // [item 0], skipped [item 1], correct [item 2]) plus an unanswered [item 3].
  await page.evaluate(() => {
    window.state.currentQ = {
      _mapSkillId: 'add', _mapDomain: 'algebra',
      _isMapReview: true, _mapReviewIndex: 0,
    };
    window.recordMapAnswer({ correct: true });
  });
  const tips = await page.$$eval('.map-nav-dot', els => els.map(e => e.title));
  if (/Got it right after a wrong try/.test(tips[0])) pass('Item 1 tooltip: ' + tips[0]);
  else fail('Item 1 tooltip wrong: ' + tips[0]);
  if (/Skipped/.test(tips[1])) pass('Item 2 tooltip: ' + tips[1]);
  else fail('Item 2 tooltip wrong: ' + tips[1]);
  if (/Correct/.test(tips[2]) && !/wrong/.test(tips[2])) pass('Item 3 tooltip: ' + tips[2]);
  else fail('Item 3 tooltip wrong: ' + tips[2]);
  if (tips[3] && /Not yet answered|Current/.test(tips[3])) pass('Item 4 tooltip: ' + tips[3]);
  else fail('Item 4 tooltip wrong: ' + tips[3]);

  await browser.close();
  console.log('\n=== TEST RESULT ===');
  if (failures.length) {
    console.log('FAILED (' + failures.length + '):');
    failures.forEach(f => console.log('  - ' + f));
    process.exit(1);
  } else {
    console.log('ALL CHECKS PASSED');
    process.exit(0);
  }
})().catch(err => { console.error('FATAL:', err); process.exit(2); });
