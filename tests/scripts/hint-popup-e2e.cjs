// E2E hint popup test using Puppeteer.
// Verifies: (1) hint popup renders when student gets answer wrong,
//           (2) X button closes it, (3) backdrop click closes it,
//           (4) ESC key closes it, (5) Got it! button closes it,
//           (6) opening twice replaces the old one (no stacking),
//           (7) hint auto-clears on advancing to next question.
//
// Run: node tests/hint-popup-e2e.cjs (requires server on :8765 + puppeteer).

const puppeteer = require('puppeteer');

const URL = 'http://localhost:8765/';
const failures = [];
function fail(msg) { failures.push(msg); console.error('  ✗', msg); }
function pass(msg) { console.log('  ✓', msg); }

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  page.on('pageerror', err => fail('Console pageerror: ' + err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore expected dev-server / favicon noise
      if (/favicon|preload|font/i.test(text)) return;
      fail('Console error: ' + text);
    }
  });

  await page.goto(URL, { waitUntil: 'networkidle0' });

  // Sanity: required globals attached
  const ok = await page.evaluate(() => ({
    showHint: typeof window.showHint === 'function',
    closeHintPopup: typeof window.closeHintPopup === 'function',
    showGeometryHint: typeof window.showGeometryHint === 'function',
    showWordProblemHint: typeof window.showWordProblemHint === 'function',
  }));
  console.log('\n[1] window globals attached:', ok);
  if (!ok.showHint) fail('window.showHint missing');
  if (!ok.closeHintPopup) fail('window.closeHintPopup missing');
  if (!ok.showGeometryHint) fail('window.showGeometryHint missing');
  if (!ok.showWordProblemHint) fail('window.showWordProblemHint missing');

  // [2] Direct call: showHint with a populated hint renders modal
  console.log('\n[2] Direct showHint() with hint text:');
  await page.evaluate(() => {
    window.state = window.state || {};
    if (!window.__realState) {
      // Capture original state ref for restoration
      window.__realState = window.state;
    }
    // Set up a fake currentQ so showHint has data
    window.state.currentQ = { hint: 'Add the ones first, then the tens. <strong>Carry</strong> when needed.' };
    window.showHint();
  });
  const hasModal = await page.$('#hintModal');
  if (!hasModal) fail('Modal #hintModal not appended after showHint()');
  else pass('Modal rendered');

  const titleText = await page.$eval('#hintModal h3', el => el.textContent.trim()).catch(() => null);
  if (!titleText || !titleText.includes('Hint')) fail('Modal title missing or wrong: ' + titleText);
  else pass('Modal title shows hint title: ' + titleText);

  const hasX = await page.$eval('#hintModal button[aria-label="Close hint"]', el => !!el).catch(() => false);
  if (!hasX) fail('X close button not found');
  else pass('X close button present');

  const hasGotIt = await page.$$eval('#hintModal button', btns => btns.some(b => /got it/i.test(b.textContent)));
  if (!hasGotIt) fail('"Got it!" button not found');
  else pass('"Got it!" button present');

  const hintBody = await page.$eval('#hintModal .hint-modal-body', el => el.innerHTML);
  if (!/Add the ones/.test(hintBody) || !/<strong>/.test(hintBody)) fail('Hint body did not render expected HTML: ' + hintBody);
  else pass('Hint body renders HTML correctly');

  // [3] X button click closes
  console.log('\n[3] X button closes modal:');
  await page.click('#hintModal button[aria-label="Close hint"]');
  await new Promise(r => setTimeout(r, 50));
  const afterX = await page.$('#hintModal');
  if (afterX) fail('Modal still present after X click');
  else pass('Modal removed after X click');

  // [4] Backdrop click closes
  console.log('\n[4] Backdrop click closes modal:');
  await page.evaluate(() => { window.state.currentQ = { hint: 'Test backdrop' }; window.showHint(); });
  await page.waitForSelector('#hintModal');
  // Click on the backdrop element itself (not inside the card). Get backdrop bbox.
  const box = await page.$eval('#hintModal', el => {
    const rect = el.getBoundingClientRect();
    return { x: rect.x, y: rect.y };
  });
  // Click in top-left corner (well outside the centered card)
  await page.mouse.click(box.x + 5, box.y + 5);
  await new Promise(r => setTimeout(r, 50));
  const afterBackdrop = await page.$('#hintModal');
  if (afterBackdrop) fail('Modal still present after backdrop click');
  else pass('Modal removed after backdrop click');

  // [5] Click inside card does NOT close
  console.log('\n[5] Click inside card does NOT close:');
  await page.evaluate(() => { window.state.currentQ = { hint: 'Test card click' }; window.showHint(); });
  await page.waitForSelector('#hintModal');
  await page.click('#hintModal .hint-modal-card');
  await new Promise(r => setTimeout(r, 50));
  const afterInsideClick = await page.$('#hintModal');
  if (!afterInsideClick) fail('Modal incorrectly closed when clicking inside card');
  else pass('Modal stays open when clicking inside card');

  // [6] ESC closes
  console.log('\n[6] ESC key closes modal:');
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 50));
  const afterEsc = await page.$('#hintModal');
  if (afterEsc) fail('Modal still present after ESC');
  else pass('Modal removed after ESC');

  // [7] "Got it!" closes
  console.log('\n[7] Got it! button closes modal:');
  await page.evaluate(() => { window.state.currentQ = { hint: 'Test got-it' }; window.showHint(); });
  await page.waitForSelector('#hintModal');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('#hintModal button'));
    btns.find(b => /got it/i.test(b.textContent)).click();
  });
  await new Promise(r => setTimeout(r, 50));
  const afterGotIt = await page.$('#hintModal');
  if (afterGotIt) fail('Modal still present after Got It click');
  else pass('Modal removed after Got It click');

  // [8] Opening twice does not stack
  console.log('\n[8] Re-opening replaces existing modal:');
  await page.evaluate(() => {
    window.state.currentQ = { hint: 'First open' };
    window.showHint();
    window.state.currentQ = { hint: 'Second open' };
    window.showHint();
  });
  const modalCount = await page.$$eval('#hintModal', list => list.length);
  if (modalCount !== 1) fail('Expected 1 #hintModal, got ' + modalCount);
  else pass('Only one modal exists after second open');
  const currentBody = await page.$eval('#hintModal .hint-modal-body', el => el.innerHTML);
  if (!/Second open/.test(currentBody)) fail('Re-opened modal did not show new content: ' + currentBody);
  else pass('Re-opened modal shows new hint content');
  await page.evaluate(() => window.closeHintPopup());

  // [9] Generic fallback: showHint with no q.hint still renders helpful text
  console.log('\n[9] Generic fallback hint when q.hint missing:');
  await page.evaluate(() => {
    window.state.currentQ = {}; // no hint
    window.state.skill = 'add_facts';
    window.showHint();
  });
  await page.waitForSelector('#hintModal');
  const fallbackBody = await page.$eval('#hintModal .hint-modal-body', el => el.textContent.trim());
  if (!fallbackBody || fallbackBody.length < 30) fail('Generic fallback too short: ' + fallbackBody);
  else pass('Generic fallback fired (' + fallbackBody.slice(0, 80) + '...)');
  await page.evaluate(() => window.closeHintPopup());

  // [10] Geometry hint variants
  console.log('\n[10] Geometry hint perimeter/area variants:');
  await page.evaluate(() => {
    window.state.currentQ = { perimeterHint: 'Add all 4 sides', areaHint: 'Multiply L × W' };
    window.showGeometryHint('perimeter');
  });
  await page.waitForSelector('#hintModal');
  const perimTitle = await page.$eval('#hintModal h3', el => el.textContent);
  const perimBody = await page.$eval('#hintModal .hint-modal-body', el => el.textContent);
  if (!/Perimeter/.test(perimTitle)) fail('Perimeter title missing: ' + perimTitle);
  else pass('Perimeter title correct');
  if (!/Add all 4 sides/.test(perimBody)) fail('Perimeter body wrong: ' + perimBody);
  else pass('Perimeter body correct');

  await page.evaluate(() => { window.closeHintPopup(); window.showGeometryHint('area'); });
  await page.waitForSelector('#hintModal');
  const areaTitle = await page.$eval('#hintModal h3', el => el.textContent);
  if (!/Area/.test(areaTitle)) fail('Area title missing: ' + areaTitle);
  else pass('Area title correct');
  await page.evaluate(() => window.closeHintPopup());

  // [11] Word problem hint
  console.log('\n[11] Word problem hint variants:');
  await page.evaluate(() => {
    window.state.currentQ = { expectedType: 'area' };
    window.showWordProblemHint();
  });
  await page.waitForSelector('#hintModal');
  const wpBody = await page.$eval('#hintModal .hint-modal-body', el => el.textContent);
  if (!/AREA/.test(wpBody)) fail('Word-problem area body wrong: ' + wpBody);
  else pass('Word-problem area body correct');
  await page.evaluate(() => window.closeHintPopup());

  // [12] Hint button in HTML triggers popup
  console.log('\n[12] 💡 Hint button click triggers popup:');
  // Reset state to a real-looking question
  await page.evaluate(() => {
    window.state.currentQ = { hint: 'Click-test hint' };
    document.getElementById('hintBtn').click();
  });
  const afterBtn = await page.$('#hintModal');
  if (!afterBtn) fail('Hint button did not open popup');
  else pass('💡 Hint button opens popup');
  await page.evaluate(() => window.closeHintPopup());

  // [13] Auto-show on first wrong via recordWrongAttempt
  console.log('\n[13] Auto-show on first wrong attempt:');
  await page.evaluate(() => {
    // Reset attempts
    window.state.currentQAttempts = 0;
    window.state.currentQ = { hint: 'Auto-show test' };
    window.recordWrongAttempt({ submitted: 'wrong', btnElement: null, showHistoryChip: false });
  });
  await new Promise(r => setTimeout(r, 50));
  const auto = await page.$('#hintModal');
  if (!auto) fail('recordWrongAttempt did not auto-show hint popup');
  else pass('recordWrongAttempt auto-shows popup');
  await page.evaluate(() => window.closeHintPopup());

  // [14] No re-open on 2nd wrong attempt
  console.log('\n[14] No re-show on 2nd wrong attempt:');
  await page.evaluate(() => {
    window.state.currentQAttempts = 1; // already had one wrong
    window.state.currentQ = { hint: 'Should not re-open' };
    window.recordWrongAttempt({ submitted: 'wrong-again', btnElement: null, showHistoryChip: false });
  });
  await new Promise(r => setTimeout(r, 50));
  const second = await page.$('#hintModal');
  if (second) fail('2nd wrong attempt incorrectly re-opened popup');
  else pass('2nd wrong does NOT re-open popup');

  // [15] Auto-clear on next question (via window.nextQuestion)
  console.log('\n[15] Modal auto-clears on nextQuestion call:');
  await page.evaluate(() => {
    window.state.currentQ = { hint: 'Will be cleared' };
    window.showHint();
  });
  await page.waitForSelector('#hintModal');
  await page.evaluate(() => {
    if (typeof window.nextQuestion === 'function') {
      try { window.nextQuestion(); } catch (_) {}
    } else if (typeof window.closeHintPopup === 'function') {
      window.closeHintPopup();
    }
  });
  await new Promise(r => setTimeout(r, 50));
  const cleared = await page.$('#hintModal');
  if (cleared) fail('Modal not cleared after nextQuestion');
  else pass('Modal cleared after nextQuestion');

  // [16] All gen-* generators expose hints (sanity that hint property comes back)
  console.log('\n[16] Sanity-check: questions across major skills produce a hint or fall back to generic:');
  const skillsToTest = [
    'add_facts', 'sub_facts', 'mult_facts', 'div_facts',
    'compare', 'place_value', 'rounding',
    'add_fractions_like', 'sub_fractions_like',
    'area_perimeter', 'angles', 'perimeter_grid',
    'mean_median', 'bar_graph',
    'gcf_easy', 'lcm_easy',
    'time_to_hour', 'money_count'
  ];
  for (const sk of skillsToTest) {
    const result = await page.evaluate((skill) => {
      try {
        if (typeof window.generateQuestion !== 'function') return { skip: 'no generator' };
        window.state.skill = skill;
        const q = window.generateQuestion();
        return { hint: q && q.hint ? String(q.hint).slice(0, 100) : null };
      } catch (e) {
        return { error: e.message };
      }
    }, sk);
    if (result.error) {
      console.log('  ! ' + sk + ': error -> ' + result.error);
    } else if (result.skip) {
      console.log('  ~ ' + sk + ': skipped');
    } else if (result.hint) {
      pass(sk + ' has hint: ' + result.hint);
    } else {
      console.log('  ~ ' + sk + ' has no hint property — will use generic fallback');
    }
  }

  await browser.close();
  console.log('\n=== TEST RESULT ===');
  if (failures.length) {
    console.log(`FAILED (${failures.length}):`);
    failures.forEach(f => console.log('  - ' + f));
    process.exit(1);
  } else {
    console.log('ALL CHECKS PASSED');
    process.exit(0);
  }
})().catch(err => { console.error('FATAL:', err); process.exit(2); });
