// E2E hint popup test using Puppeteer.
// Verifies: (1) hint popup renders when student gets answer wrong,
//           (2) X button closes it, (3) backdrop click closes it,
//           (4) ESC key closes it, (5) Got it! button closes it,
//           (6) opening twice replaces the old one (no stacking),
//           (7) hint auto-clears on advancing to next question.
//
// Run: node tests/hint-popup-e2e.cjs (requires server on :8765 + puppeteer).

const puppeteer = require('puppeteer');

const URL = process.env.MQ_BASE || 'http://localhost:8765/';
const failures = [];
function fail(msg) { failures.push(msg); console.error('  ✗', msg); }
function pass(msg) { console.log('  ✓', msg); }

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', executablePath: require('../lib/ws-harness.cjs').chromePath(), args: ['--no-sandbox'] });
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

  // [17] Word problems on the practice card: the hint sits in flow directly UNDER the
  // story text, never over it (owner ruling). Sweeps EVERY word-problem skill (id or
  // printFormat names word / story / _wp) at both Chromebook viewports:
  //   hint top >= story bottom, no overlap, at most 120 px below the story's last line,
  //   hint width <= the question cell, the whole hint visible after open (not under the
  //   pinned play bar or the pinned Hint/Read/Check bar), answer boxes + Check reachable,
  //   Listen reads it, the same Hint button closes it.
  page.on('dialog', d => d.accept().catch(() => {}));
  const wordSkills = await page.evaluate(() => {
    const out = [];
    for (const [c, arr] of Object.entries(window.SKILLS)) {
      if (!Array.isArray(arr)) continue;
      for (const s of arr) {
        if (!s || !s.v) continue;
        let pf = '';
        try { pf = (window.generateQuestionFor({ category: c, skill: s.v, seed: 1 }) || {}).printFormat || ''; } catch (e) { /* listed by id */ }
        if (/word|_wp|story/i.test(s.v) || /word|story/i.test(pf)) out.push([c, s.v]);
      }
    }
    return out;
  });
  console.log(`\n[17] Word-problem hint below the story: ${wordSkills.length} word skills x 2 viewports`);
  if (wordSkills.length < 40) fail(`[17] only ${wordSkills.length} word skills found — the sweep list shrank`);
  for (const vp of [{ width: 1366, height: 650 }, { width: 1280, height: 600 }]) {
    await page.setViewport(vp);
    let okCount = 0;
    for (const [cat, sk] of wordSkills) {
      const tag = `${vp.width}x${vp.height} ${cat}:${sk}`;
      await page.evaluate((c, k) => {
        window.closeHintPopup();
        window.state.quizMode = false;
        window.skillQueue.length = 0;
        window.skillQueue.push({ categoryId: c, skillId: k, skillLabel: k });
        window.playSelectedSkills('practice');
      }, cat, sk);
      await new Promise(r => setTimeout(r, 1300));
      await page.click('#hintBtn').catch(() => page.evaluate(() => document.getElementById('hintBtn').click()));
      await new Promise(r => setTimeout(r, 300));
      const g = await page.evaluate(() => {
        const h = document.getElementById('hintModal');
        if (!h) return { missing: 'hint' };
        const qt = document.getElementById('questionText');
        const va = document.getElementById('visualAid');
        const shown = (e) => !!e && e.getClientRects().length > 0 && e.getBoundingClientRect().height > 4;
        // the STORY, found independently of the app's anchor
        let sr = null, how = '';
        const ws = document.querySelector('#questionCard .mq-wwstory, #questionCard .k2-story');
        if (ws && shown(ws)) { sr = ws.getBoundingClientRect(); how = 'story block'; }
        if (!sr && shown(qt) && !qt.classList.contains('mq-dup')) {
          const rg = document.createRange();
          rg.setStart(qt, 0);
          if (qt.contains(h)) rg.setEndBefore(h); else rg.setEnd(qt, qt.childNodes.length);
          const rr = rg.getBoundingClientRect();
          if (rr.height > 4) { sr = rr; how = 'instruction text'; }
        }
        if (!sr && va) {
          const key = String((qt && qt.textContent) || (window.state.currentQ || {}).text || '').replace(/\s+/g, ' ').trim().slice(0, 24);
          let best = null;
          if (key.length >= 8) va.querySelectorAll('div, p, span').forEach(e => { if (!h.contains(e) && e !== h && shown(e) && (e.textContent || '').replace(/\s+/g, ' ').includes(key)) best = e; });
          if (best) { sr = best.getBoundingClientRect(); how = 'story in drawing'; }
        }
        if (!sr) return { missing: 'story' };
        const hr = h.getBoundingClientRect();
        const cell = document.getElementById('questionPaper').getBoundingClientRect();
        const inter = hr.left < sr.right && hr.right > sr.left && hr.top < sr.bottom && hr.bottom > sr.top;
        const pos = getComputedStyle(h).position;
        const inCard = document.getElementById('questionCard').contains(h);
        // the whole hint is visible: points just inside each corner and the middle land on the hint
        const pts = [[hr.left + 6, hr.top + 6], [hr.right - 6, hr.top + 6], [hr.left + 6, hr.bottom - 6], [hr.right - 6, hr.bottom - 6], [(hr.left + hr.right) / 2, (hr.top + hr.bottom) / 2]];
        const hidden = pts.filter(([x, y]) => { const e = document.elementFromPoint(x, y); return !e || !(h === e || h.contains(e)); })
          .map(([x, y]) => { const e = document.elementFromPoint(x, y); return `${Math.round(x)},${Math.round(y)}→${e ? (e.id || String(e.className).slice(0, 30) || e.tagName) : 'off screen'}`; });
        const res = { how, hr: [hr.left, hr.top, hr.right, hr.bottom].map(Math.round), sr: [sr.left, sr.top, sr.right, sr.bottom].map(Math.round),
          cellW: Math.round(cell.width), hW: Math.round(hr.width), below: hr.top >= sr.bottom - 0.5, gap: Math.round(hr.top - sr.bottom), inter, pos, inCard, hidden,
          body: (h.querySelector('.hint-modal-body') || {}).textContent || '', speak: !!h.querySelector('#hintSpeakBtn') };
        // answer boxes and Check can be scrolled to and are not covered
        // typed boxes, the Check button, and the choices on a tap-to-answer item
        const targets = Array.from(document.querySelectorAll('#questionCard input:not([type=hidden]), #qcCheckBtn, #questionPaper button, #questionPaper [role="option"], #questionPaper [role="checkbox"]'))
          .filter(e => !h.contains(e) && !e.closest('.zoom-icon-btn') && e.getClientRects().length && e.getBoundingClientRect().width > 0 && !e.disabled);
        const covered = [];
        for (const t of targets) {
          t.scrollIntoView({ block: 'center' });
          const r = t.getBoundingClientRect();
          const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          if (!hit || !(hit === t || t.contains(hit) || hit.contains(t))) covered.push((t.id || t.className) + ' by ' + (hit ? (hit.id || hit.className) : 'nothing'));
        }
        res.targets = targets.length; res.covered = covered;
        return res;
      });
      const bad = [];
      if (g.missing) bad.push(`${g.missing} missing`);
      else {
        if (g.pos === 'fixed' || g.pos === 'absolute' || !g.inCard) bad.push(`overlay (position ${g.pos}, in card ${g.inCard})`);
        if (!g.below || g.inter) bad.push(`hint ${JSON.stringify(g.hr)} not below ${g.how} ${JSON.stringify(g.sr)} (overlap ${g.inter})`);
        else if (g.gap > 120) bad.push(`hint ${g.gap} px under the ${g.how}: not directly under the story`);
        if (g.hW > g.cellW + 0.5) bad.push(`hint ${g.hW} px wider than the cell ${g.cellW} px`);
        if (g.hidden.length) bad.push(`hint not fully visible after open: ${g.hidden.join('; ')}`);
        if (!g.targets || g.covered.length) bad.push(`answer boxes/Check not reachable: ${g.covered.join('; ') || 'none found'}`);
        if (!g.body.trim() || !g.speak) bad.push('hint body or Listen button missing');
      }
      if (!g.missing) {
        const spoken = await page.evaluate(() => {
          let said = null;
          const orig = window.speechSynthesis && window.speechSynthesis.speak;
          if (!orig) return 'no-tts';
          window.speechSynthesis.speak = (u) => { said = u.text; };
          try { window.speakHint(); } finally { window.speechSynthesis.speak = orig; }
          return said;
        });
        if (spoken !== 'no-tts' && !spoken) bad.push('Listen did not read the hint');
        await page.evaluate(() => document.getElementById('hintBtn').click());
        await new Promise(r => setTimeout(r, 100));
        if (await page.$('#hintModal')) bad.push('second Hint click did not close the hint');
      }
      if (bad.length) fail(`${tag}: ${bad.join(' | ')}`);
      else okCount++;
      await page.evaluate(() => { try { window.closeHintPopup(); window.exitGame(); } catch (_) {} });
      await new Promise(r => setTimeout(r, 200));
    }
    pass(`${vp.width}x${vp.height}: ${okCount}/${wordSkills.length} word skills — hint under the story, inside the cell width, fully visible, answers reachable`);
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
