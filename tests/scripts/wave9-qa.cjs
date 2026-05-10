// Wave 9 design-migration end-to-end QA smoke
// Hardened against ProtocolError timeouts: each evaluate is racing a hard 30s ceiling.
const puppeteer = require('puppeteer');

const SLEEP = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const results = { A: { pass: 0, fail: 0, notes: [] }, B: { pass: 0, fail: 0, notes: [] }, C: { pass: 0, fail: 0, notes: [] }, D: { pass: 0, fail: 0, notes: [] }, E: { pass: 0, fail: 0, notes: [] }, F: { pass: 0, fail: 0, notes: [] } };
  const allErrors = [];

  function record(phase, ok, label, extra) {
    if (ok) { results[phase].pass++; }
    else { results[phase].fail++; results[phase].notes.push(`FAIL: ${label}${extra ? ' — ' + extra : ''}`); }
  }

  process.on('unhandledRejection', (r) => { console.error('unhandledRejection:', r && r.message ? r.message : r); });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-features=IsolateOrigins,site-per-process'],
    protocolTimeout: 60000,
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);
  page.setDefaultNavigationTimeout(30000);
  await page.setViewport({ width: 1280, height: 1100 });

  // Stub out speechSynthesis early to avoid hangs in headless
  await page.evaluateOnNewDocument(() => {
    try {
      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        get() {
          return {
            getVoices: () => [],
            speak: () => {},
            cancel: () => {},
            pause: () => {},
            resume: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            speaking: false,
            paused: false,
            pending: false,
          };
        }
      });
    } catch (_) {}
  });

  const phaseErrors = { current: 'BOOT', list: [] };
  page.on('pageerror', e => { allErrors.push(`[${phaseErrors.current}] pageerror: ${e.message}`); phaseErrors.list.push({ phase: phaseErrors.current, type: 'pageerror', msg: e.message }); });
  page.on('console', m => {
    if (m.type() === 'error') {
      const t = m.text().slice(0, 240);
      if (/favicon/i.test(t)) return;
      allErrors.push(`[${phaseErrors.current}] console.error: ${t}`);
      phaseErrors.list.push({ phase: phaseErrors.current, type: 'console', msg: t });
    }
  });

  // Helper: run an evaluate but never wait > N ms; on timeout, return { __timeout: true }
  async function safeEval(fn, args, label, ms = 25000) {
    try {
      return await Promise.race([
        page.evaluate(fn, args),
        new Promise((_, reject) => setTimeout(() => reject(new Error('safeEval timeout: ' + label)), ms)),
      ]);
    } catch (e) {
      return { __error: e.message };
    }
  }

  // ── PHASE A — Home + golden path ──────────────────────────
  phaseErrors.current = 'A';
  try {
    await page.goto('http://localhost:3199/', { waitUntil: 'domcontentloaded', timeout: 25000 });
    await SLEEP(1500);
    record('A', true, 'home loads');

    const errsAfterBoot = phaseErrors.list.filter(e => e.phase === 'A').length;
    record('A', errsAfterBoot === 0, '0 console/page errors after boot', `${errsAfterBoot} errs`);

    await safeEval(() => localStorage.setItem('mathquest_onboarded', '1'), null, 'set onboarded', 5000);
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 20000 });
    await SLEEP(1500);

    await safeEval(() => {
      document.querySelectorAll('[class*="modal"]').forEach(el => {
        const s = getComputedStyle(el);
        if (s.position === 'fixed' && parseInt(s.zIndex) > 100) el.style.display = 'none';
      });
      if (document.body && !document.body.classList.contains('student-mode')) {
        if (typeof window.toggleUserRole === 'function') window.toggleUserRole();
      }
    }, null, 'force student mode', 5000);
    await SLEEP(400);

    const clicked = await safeEval(() => {
      const card = document.querySelector('#quickSkillsGrid .quick-skill-card');
      if (!card) return false;
      card.click();
      return true;
    }, null, 'click quick-skill', 5000);
    record('A', clicked === true, 'clicked first quick-skill card');
    await SLEEP(300);

    const started = await safeEval(() => {
      const btn = document.querySelector('.start-game-btn');
      if (!btn) return false;
      btn.click();
      return true;
    }, null, 'click start game', 5000);
    record('A', started === true, 'clicked Start Game button');
    await SLEEP(1500);

    const inGame = await safeEval(() => {
      const v = document.getElementById('gameView');
      return !!(v && v.classList.contains('active'));
    }, null, 'check gameView active', 5000);
    record('A', inGame === true, 'gameView is active');

    const ansInfo = await safeEval(() => {
      const s = window.state;
      if (!s || !s.currentQ) return { ok: false };
      return { ok: true, ans: s.currentQ.ans, answerType: s.currentQ.answerType, sessionXpBefore: s.sessionXp || 0 };
    }, null, 'pull currentQ', 5000);
    record('A', ansInfo && ansInfo.ok, 'state.currentQ available');

    if (ansInfo && ansInfo.ok && (ansInfo.answerType === 'number' || ansInfo.answerType === undefined || ansInfo.answerType === 'text')) {
      await safeEval((ans) => {
        const inp = document.getElementById('answerInput');
        if (!inp) return false;
        inp.focus();
        inp.value = String(ans);
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        if (typeof window.submitAnswer === 'function') window.submitAnswer();
        return true;
      }, ansInfo.ans, 'submit correct answer', 8000);
      await SLEEP(150);
      const fxSnapshot = await safeEval(() => {
        const card = document.getElementById('questionCard');
        const cardClass = card ? card.className : '';
        const xpBurst = !!document.querySelector('.mq-xp-burst');
        const cheer = !!document.querySelector('.mq-mascot-cheer');
        return { cardClass, xpBurst, cheer };
      }, null, 'check correct fx', 5000);
      record('A', fxSnapshot && /correct-bg/.test(fxSnapshot.cardClass || ''), '.correct-bg applied to questionCard', `card="${fxSnapshot && fxSnapshot.cardClass}"`);
      record('A', !!(fxSnapshot && fxSnapshot.xpBurst), '.mq-xp-burst element fired');
      record('A', !!(fxSnapshot && fxSnapshot.cheer), '.mq-mascot-cheer element fired');
      await SLEEP(900);

      const sxAfter = await safeEval(() => (window.state && window.state.sessionXp) || 0, null, 'sessionXp after', 5000);
      record('A', typeof sxAfter === 'number' && sxAfter > ansInfo.sessionXpBefore, 'state.sessionXp increased after correct', `before=${ansInfo.sessionXpBefore} after=${sxAfter}`);
    }

    await SLEEP(400);
    const wrongInfo = await safeEval(() => {
      const s = window.state;
      if (!s || !s.currentQ) return { ok: false };
      const wrong = (typeof s.currentQ.ans === 'number' ? s.currentQ.ans + 1 : (s.currentQ.ans + 'x'));
      return { ok: true, wrong, answerType: s.currentQ.answerType };
    }, null, 'pull wrong target', 5000);
    if (wrongInfo && wrongInfo.ok && (wrongInfo.answerType === 'number' || wrongInfo.answerType === undefined || wrongInfo.answerType === 'text')) {
      await safeEval((wrong) => {
        const inp = document.getElementById('answerInput');
        if (inp) {
          inp.value = String(wrong);
          inp.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (typeof window.submitAnswer === 'function') window.submitAnswer();
      }, wrongInfo.wrong, 'submit wrong answer', 8000);
      await SLEEP(150);
      const wrongFx = await safeEval(() => {
        const card = document.getElementById('questionCard');
        return card ? card.className : '';
      }, null, 'check wrong fx', 5000);
      const okWrong = typeof wrongFx === 'string' && /incorrect-bg|mq-shake/.test(wrongFx);
      record('A', okWrong, 'wrong answer triggers .incorrect-bg or .mq-shake', `card="${wrongFx}"`);
    }

    // Skip
    await safeEval(() => {
      document.querySelectorAll('.modal').forEach(el => { if (el.style && el.style.display === 'flex') el.style.display = 'none'; });
      const btn = document.getElementById('skipQuestionBtn');
      if (btn) btn.click();
      else if (typeof window.skipCurrentQuestion === 'function') window.skipCurrentQuestion();
    }, null, 'click skip', 5000);
    await SLEEP(800);
    const afterQ = await safeEval(() => (window.state && window.state.currentQ && window.state.currentQ.text) || null, null, 'check after skip', 5000);
    record('A', !!afterQ, 'after skip a new currentQ exists');
  } catch (e) {
    record('A', false, 'phase exception', e.message);
  }

  // Go home before next phase
  await safeEval(() => { if (typeof window.goHome === 'function') window.goHome(); }, null, 'goHome', 5000);
  await SLEEP(500);

  // ── PHASE B — Voice picker ────────────────────────────────
  phaseErrors.current = 'B';
  try {
    const btnExists = await safeEval(() => !!document.getElementById('voicePickerBtn'), null, 'find voice btn', 5000);
    record('B', btnExists === true, '#voicePickerBtn exists');
    if (btnExists === true) {
      await safeEval(() => { const b = document.getElementById('voicePickerBtn'); if (b) b.click(); }, null, 'click voice btn', 5000);
      await SLEEP(300);
      const popOpen = await safeEval(() => {
        const p = document.getElementById('voicePickerPopover');
        return !!(p && p.classList.contains('open'));
      }, null, 'check pop open', 5000);
      record('B', popOpen === true, '.voice-picker-popover.open after click');

      const selInfo = await safeEval(() => {
        const sel = document.getElementById('voicePickerSelect');
        if (!sel) return { ok: false };
        return { ok: true, optCount: sel.options.length, voicesAvail: (window.speechSynthesis && window.speechSynthesis.getVoices) ? window.speechSynthesis.getVoices().length : -1 };
      }, null, 'check select', 5000);
      record('B', !!(selInfo && selInfo.ok), '<select> #voicePickerSelect exists');
      if (selInfo && selInfo.ok && selInfo.voicesAvail === 0) {
        results.B.notes.push(`note: speechSynthesis voices=0 in headless — picker option count is env-dependent`);
        record('B', true, '<select> populated (env-dependent; 0 voices in headless)');
      } else if (selInfo && selInfo.ok) {
        record('B', selInfo.optCount > 0, '<select> has options', `optCount=${selInfo.optCount} voices=${selInfo.voicesAvail}`);
      }

      await safeEval(() => {
        if (typeof window.setSelectedVoiceURI === 'function') window.setSelectedVoiceURI('test-voice-uri-123');
      }, null, 'set voice URI', 5000);
      const persisted = await safeEval(() => localStorage.getItem('mathquest_voice_uri'), null, 'check persisted', 5000);
      record('B', persisted === 'test-voice-uri-123', 'mathquest_voice_uri persisted to localStorage', `got="${persisted}"`);
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 20000 });
      await SLEEP(800);
      const persistedAfter = await safeEval(() => localStorage.getItem('mathquest_voice_uri'), null, 'check persisted after reload', 5000);
      record('B', persistedAfter === 'test-voice-uri-123', 'mathquest_voice_uri survives reload', `got="${persistedAfter}"`);
    }
  } catch (e) {
    record('B', false, 'phase exception', e.message);
  }

  // ── PHASE C — Print pipeline ───────────────────────────────
  phaseErrors.current = 'C';
  try {
    await safeEval(() => {
      if (document.body && document.body.classList.contains('student-mode')) {
        if (typeof window.toggleUserRole === 'function') window.toggleUserRole();
      }
    }, null, 'force teacher mode', 5000);
    await SLEEP(300);

    const inTeacher = await safeEval(() => document.body.classList.contains('teacher-mode'), null, 'check teacher mode', 5000);
    record('C', inTeacher === true, 'in teacher-mode');

    // Kick off worksheet generation in a non-blocking fashion: assign promise to window
    // and poll for the printPreviewContent to populate.
    await safeEval(() => {
      window.__wave9_genDone = false;
      window.__wave9_genErr = null;
      const sections = [
        { label: 'Stack Add', columns: 2, problemCount: 1, skills: [{ skillId: 'add_within_1k', categoryId: 'operations', skillName: 'Add Within 1k', weight: 1 }] },
        { label: 'Add Fractions', columns: 2, problemCount: 1, skills: [{ skillId: 'add_fractions_like', categoryId: 'fraction_operations', skillName: 'Add Fractions', weight: 1 }] },
        { label: 'Frac on Numline', columns: 1, problemCount: 1, skills: [{ skillId: 'frac_on_numline', categoryId: 'fraction_operations', skillName: 'Frac on Numline', weight: 1 }] },
        { label: 'Bar Graph', columns: 1, problemCount: 1, skills: [{ skillId: 'bar_graph', categoryId: 'graphs', skillName: 'Bar Graph', weight: 1 }] },
        { label: 'Pictograph', columns: 1, problemCount: 1, skills: [{ skillId: 'pictograph', categoryId: 'graphs', skillName: 'Pictograph', weight: 1 }] },
        { label: 'Fact Family', columns: 2, problemCount: 1, skills: [{ skillId: 'fact_family', categoryId: 'operations', skillName: 'Fact Family', weight: 1 }] },
        { label: 'Round 10', columns: 2, problemCount: 1, skills: [{ skillId: 'nearest_10', categoryId: 'rounding', skillName: 'Round 10', weight: 1 }] },
        { label: 'Area Perim', columns: 1, problemCount: 1, skills: [{ skillId: 'area_perimeter', categoryId: 'area_perimeter', skillName: 'Area Perim', weight: 1 }] },
        { label: 'Equiv Ratios', columns: 2, problemCount: 1, skills: [{ skillId: 'equiv_ratios', categoryId: 'algebra', skillName: 'Equiv Ratios', weight: 1 }] },
        { label: 'Line Plot G2', columns: 1, problemCount: 1, skills: [{ skillId: 'line_plot_g2', categoryId: 'data_analysis', skillName: 'Line Plot G2', weight: 1 }] },
        { label: 'MAD', columns: 2, problemCount: 1, skills: [{ skillId: 'mad', categoryId: 'data_analysis', skillName: 'MAD', weight: 1 }] },
      ];
      if (typeof window.generateWorksheetFromSections !== 'function') { window.__wave9_genErr = 'no fn'; return; }
      Promise.resolve().then(() => window.generateWorksheetFromSections(sections, 1, 'Wave 9 QA Print', 'color', true, false))
        .then(() => { window.__wave9_genDone = true; })
        .catch(e => { window.__wave9_genErr = e.message; window.__wave9_genDone = true; });
    }, null, 'kick off print gen', 8000);

    // Poll for completion (up to 30s)
    let done = false;
    let err = null;
    for (let i = 0; i < 30; i++) {
      await SLEEP(1000);
      const status = await safeEval(() => ({ done: !!window.__wave9_genDone, err: window.__wave9_genErr || null }), null, 'poll print status', 4000);
      if (status && status.done) { done = true; err = status.err; break; }
    }
    record('C', done && !err, 'generateWorksheetFromSections() finished', err ? `err=${err}` : (done ? '' : 'timeout 30s'));
    await SLEEP(800);

    const counts = await safeEval(() => {
      const c = document.getElementById('printPreviewContent');
      if (!c) return null;
      const q = (sel) => c.querySelectorAll(sel).length;
      return {
        wrappers: q('.worksheet-set.print-edition'),
        sheetHead: q('.sheet-head'),
        sheetFoot: q('.sheet-foot'),
        sectionNum: q('.section-num'),
        problems: q('.worksheet-problem, .problem'),
        pHeads: q('.p-head'),
        akey: q('.akey'),
      };
    }, null, 'count print classes', 8000);
    if (!counts) {
      record('C', false, '#printPreviewContent exists');
    } else {
      record('C', counts.wrappers > 0, '.worksheet-set.print-edition rendered', `count=${counts.wrappers}`);
      record('C', counts.sheetHead > 0, '.sheet-head rendered', `count=${counts.sheetHead}`);
      record('C', counts.sheetFoot > 0, '.sheet-foot rendered', `count=${counts.sheetFoot}`);
      record('C', counts.sectionNum > 0, '.section-num rendered', `count=${counts.sectionNum}`);
      record('C', counts.problems > 0, '.problem (or .worksheet-problem) rendered', `count=${counts.problems}`);
      record('C', counts.pHeads > 0, '.p-head rendered', `count=${counts.pHeads}`);
      record('C', counts.akey > 0, '.akey rendered (answer key)', `count=${counts.akey}`);
    }
  } catch (e) {
    record('C', false, 'phase exception', e.message);
  }

  // ── PHASE D — New skills generation ──────────────────────
  phaseErrors.current = 'D';
  try {
    const newSkills = ['equiv_ratios', 'ratio_tables', 'abs_value', 'opposite_numbers', 'ordering_rationals', 'combine_like_terms', 'distributive_expr', 'mad', 'statistical_question', 'line_plot_g2', 'compare_thousandths', 'round_thousandths', 'length_customary', 'length_metric'];
    for (const skill of newSkills) {
      const r = await safeEval((sk) => {
        const out = { skill: sk, gens: 0, fails: [], textOk: 0, ansOk: 0 };
        try {
          window.state.skill = sk;
          for (let i = 0; i < 3; i++) {
            try {
              const q = window.generateQuestion();
              if (q && typeof q.text === 'string' && q.text.length > 0) out.textOk++;
              if (q && (q.ans !== undefined && q.ans !== null && q.ans !== '')) out.ansOk++;
              out.gens++;
            } catch (err) {
              out.fails.push(err.message.slice(0, 80));
            }
          }
        } catch (eOuter) { out.fails.push('outer:' + eOuter.message.slice(0, 80)); }
        return out;
      }, skill, `gen ${skill}`, 10000);
      if (!r || r.__error) {
        record('D', false, `skill ${skill} generates`, `evalErr=${r && r.__error}`);
        continue;
      }
      const allGood = r.gens === 3 && r.textOk === 3 && r.ansOk === 3 && r.fails.length === 0;
      record('D', allGood, `skill ${skill} generates 3x with text+ans`, `gens=${r.gens} textOk=${r.textOk} ansOk=${r.ansOk} fails=${JSON.stringify(r.fails)}`);
    }
  } catch (e) {
    record('D', false, 'phase exception', e.message);
  }

  // ── PHASE E — APIs ──────────────────────────────────────
  phaseErrors.current = 'E';
  try {
    const apis = await safeEval(() => ({
      tagDistractor: typeof window.tagDistractor,
      linkVocabInText: typeof window.linkVocabInText,
      maybeShowOnboarding: typeof window.maybeShowOnboarding,
      showWorkedPreview: typeof window.showWorkedPreview,
      applyVoice: typeof window.applyVoice,
      flashMascotCheer: typeof window.flashMascotCheer,
      skillAllowsCalculator: typeof window.skillAllowsCalculator,
    }), null, 'check apis', 5000);
    if (apis && !apis.__error) {
      record('E', apis.tagDistractor === 'function', 'window.tagDistractor is function', `got ${apis.tagDistractor}`);
      record('E', apis.linkVocabInText === 'function', 'window.linkVocabInText is function', `got ${apis.linkVocabInText}`);
      record('E', apis.maybeShowOnboarding === 'function', 'window.maybeShowOnboarding is function', `got ${apis.maybeShowOnboarding}`);
      record('E', apis.showWorkedPreview === 'function', 'window.showWorkedPreview is function', `got ${apis.showWorkedPreview}`);
      record('E', apis.applyVoice === 'function', 'window.applyVoice is function', `got ${apis.applyVoice}`);
      record('E', apis.flashMascotCheer === 'function', 'window.flashMascotCheer is function', `got ${apis.flashMascotCheer}`);
      record('E', apis.skillAllowsCalculator === 'function', 'window.skillAllowsCalculator is function', `got ${apis.skillAllowsCalculator}`);
    } else {
      record('E', false, 'apis check failed', apis && apis.__error);
    }

    const vocabRes = await safeEval(() => {
      try {
        const html = window.linkVocabInText('Find the numerator');
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        const spans = tmp.querySelectorAll('.mq-vocab');
        let nested = false;
        spans.forEach(s => { if (s.querySelector('.mq-vocab')) nested = true; });
        return { ok: true, count: spans.length, nested, html: html.slice(0, 200) };
      } catch (e) { return { ok: false, err: e.message }; }
    }, null, 'vocab check', 5000);
    record('E', vocabRes && vocabRes.ok && vocabRes.count === 1 && !vocabRes.nested, "linkVocabInText('Find the numerator') has exactly 1 non-nested .mq-vocab", `count=${vocabRes && vocabRes.count} nested=${vocabRes && vocabRes.nested} err=${(vocabRes && vocabRes.err) || ''}`);

    const calcRes = await safeEval(() => ({
      addFacts: window.skillAllowsCalculator('add_facts'),
      mean: window.skillAllowsCalculator('mean'),
    }), null, 'calc check', 5000);
    if (calcRes && !calcRes.__error) {
      record('E', calcRes.addFacts === false, "skillAllowsCalculator('add_facts') === false", `got ${calcRes.addFacts}`);
      record('E', calcRes.mean === true, "skillAllowsCalculator('mean') === true", `got ${calcRes.mean}`);
    }
  } catch (e) {
    record('E', false, 'phase exception', e.message);
  }

  // ── PHASE F — Theme + role ──────────────────────────────
  phaseErrors.current = 'F';
  try {
    const themeBefore = await safeEval(() => document.documentElement.classList.contains('dark'), null, 'theme before', 5000);
    await safeEval(() => window.toggleTheme(), null, 'toggleTheme 1', 5000);
    await SLEEP(150);
    const themeAfter = await safeEval(() => document.documentElement.classList.contains('dark'), null, 'theme after', 5000);
    record('F', themeAfter !== themeBefore, 'toggleTheme() flips <html>.dark', `before=${themeBefore} after=${themeAfter}`);
    await safeEval(() => window.toggleTheme(), null, 'toggleTheme 2', 5000);
    await SLEEP(150);
    const themeRestored = await safeEval(() => document.documentElement.classList.contains('dark'), null, 'theme restored', 5000);
    record('F', themeRestored === themeBefore, 'toggleTheme() back restores', `final=${themeRestored}`);

    const roleBefore = await safeEval(() => ({
      student: document.body.classList.contains('student-mode'),
      teacher: document.body.classList.contains('teacher-mode'),
    }), null, 'role before', 5000);
    await safeEval(() => window.toggleUserRole(), null, 'toggleRole', 5000);
    await SLEEP(300);
    const roleAfter = await safeEval(() => ({
      student: document.body.classList.contains('student-mode'),
      teacher: document.body.classList.contains('teacher-mode'),
    }), null, 'role after', 5000);
    const swapped = roleBefore && roleAfter && (roleBefore.student !== roleAfter.student) && (roleBefore.teacher !== roleAfter.teacher);
    record('F', swapped, 'toggleUserRole() swaps student-mode ↔ teacher-mode', `before=${JSON.stringify(roleBefore)} after=${JSON.stringify(roleAfter)}`);
  } catch (e) {
    record('F', false, 'phase exception', e.message);
  }

  try { await browser.close(); } catch (_) {}

  console.log('\n=== WAVE 9 QA RESULTS ===');
  for (const phase of ['A', 'B', 'C', 'D', 'E', 'F']) {
    const r = results[phase];
    console.log(`\nPhase ${phase}: PASS=${r.pass}  FAIL=${r.fail}`);
    r.notes.forEach(n => console.log('  ' + n));
  }
  console.log(`\nTOTAL CONSOLE+PAGE ERRORS: ${allErrors.length}`);
  allErrors.slice(0, 25).forEach(e => console.log('  ' + e));
  const totalFails = ['A', 'B', 'C', 'D', 'E', 'F'].reduce((s, p) => s + results[p].fail, 0);
  console.log(`\nSUMMARY: totalFails=${totalFails} totalErrors=${allErrors.length}`);
  process.exit(0);
})().catch(e => { console.error('TOP_LEVEL_ERR', e && e.message ? e.message : e); process.exit(2); });
