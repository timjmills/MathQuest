const puppeteer = require('puppeteer');
const http = require('http'), fs = require('fs'), path = require('path');
const types = {'.js':'application/javascript','.html':'text/html','.css':'text/css','.svg':'image/svg+xml','.json':'application/json'};
const srv = http.createServer((req, res) => {
  let p = req.url.split('?')[0]; if (p === '/') p = '/index.html';
  const f = path.join(process.cwd(), decodeURIComponent(p));
  fs.readFile(f, (err, data) => {
    if (err) { res.statusCode = 404; return res.end('404'); }
    res.setHeader('Content-Type', types[path.extname(f)] || 'text/plain');
    res.end(data);
  });
});

async function watchSelector(page, label, seconds) {
  let redirected = null;
  let when = -1;
  for (let s = 1; s <= seconds; s++) {
    await new Promise(r => setTimeout(r, 1000));
    const active = await page.evaluate(() => {
      const v = document.querySelector('.view.active');
      return v ? v.id : null;
    });
    if (active !== 'mapSelectorView') {
      console.log(`  [${label}] AT ${s}s: redirected to ${active}`);
      redirected = active; when = s;
      break;
    } else if (s % 5 === 0) {
      console.log(`  [${label}] ${s}s: still on selector`);
    }
  }
  if (!redirected) console.log(`  [${label}] stayed on selector for ${seconds}s OK`);
  return { redirected, when };
}

(async () => {
  const PORT = 8765;
  await new Promise(r => srv.listen(PORT, r));
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('[PAGE ERROR]', e.message));
  page.on('console', m => { if (['error','warning'].includes(m.type())) console.log('[' + m.type() + ']', m.text()); });
  await page.goto('http://localhost:' + PORT + '/index.html', { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.state && typeof window.openMapTest === 'function');

  // ============================================================
  // SCENARIO A: Fresh page, teacher mode → MAP selector
  // ============================================================
  console.log('\n=== SCENARIO A: Fresh page, teacher mode ===');
  for (const tier of ['k2', '35']) {
    console.log(`-- TIER ${tier} --`);
    await page.evaluate(t => window.openMapTest(t), tier);
    await page.waitForFunction(() => document.getElementById('mapSelectorView') && document.getElementById('mapSelectorView').classList.contains('active'));
    await watchSelector(page, 'A-' + tier, 22);
    await page.evaluate(() => window.showView && window.showView('homeView'));
    await new Promise(r => setTimeout(r, 200));
  }

  // ============================================================
  // SCENARIO B: Student mode toggled (no game yet) → MAP selector
  // ============================================================
  console.log('\n=== SCENARIO B: Student mode (no prior game) ===');
  await page.evaluate(() => {
    document.body.classList.add('student-mode');
    if (window.state) window.state.userRole = 'student';
  });
  for (const tier of ['k2', '35']) {
    console.log(`-- STUDENT TIER ${tier} --`);
    await page.evaluate(t => window.openMapTest(t), tier);
    await page.waitForFunction(() => document.getElementById('mapSelectorView') && document.getElementById('mapSelectorView').classList.contains('active'));
    await watchSelector(page, 'B-' + tier, 22);
    await page.evaluate(() => window.showView && window.showView('homeView'));
    await new Promise(r => setTimeout(r, 200));
  }

  // ============================================================
  // SCENARIO C: Student played a game, ended it via exitGame, then opens MAP selector
  // ============================================================
  console.log('\n=== SCENARIO C: Student mode AFTER a regular game session ===');
  // Start a regular game in student mode
  await page.evaluate(() => {
    if (window.state) {
      window.state.gameMode = 'practice';
      window.state.timerDuration = 0; // no timer
      window.state.skill = 'add_facts';
      window.state.category = 'addition';
      window.state.problemCount = 20;
    }
    if (typeof window.startGame === 'function') window.startGame();
  });
  await new Promise(r => setTimeout(r, 800));
  // Exit immediately back to home — leaves any unhandled timers
  await page.evaluate(() => {
    // Try goHome (which re-shows homeView); or directly navigate
    if (typeof window.goHome === 'function') window.goHome();
    else if (typeof window.showView === 'function') window.showView('homeView');
  });
  await new Promise(r => setTimeout(r, 500));

  // Now open MAP K-2 selector
  for (const tier of ['k2', '35']) {
    console.log(`-- AFTER-GAME TIER ${tier} --`);
    await page.evaluate(t => window.openMapTest(t), tier);
    await page.waitForFunction(() => document.getElementById('mapSelectorView') && document.getElementById('mapSelectorView').classList.contains('active'));
    await watchSelector(page, 'C-' + tier, 22);
    await page.evaluate(() => window.showView && window.showView('homeView'));
    await new Promise(r => setTimeout(r, 200));
  }

  // ============================================================
  // SCENARIO D: Student played a game without exiting, just navigated via showView('mapSelectorView') (most realistic if a button does that directly)
  // ============================================================
  console.log('\n=== SCENARIO D: Student in middle of game, jumps to MAP via showView() ===');
  await page.evaluate(() => {
    if (window.state) {
      window.state.gameMode = 'practice';
      window.state.timerDuration = 0;
      window.state.skill = 'add_facts';
      window.state.category = 'addition';
      window.state.problemCount = 20;
    }
    if (typeof window.startGame === 'function') window.startGame();
  });
  await new Promise(r => setTimeout(r, 800));

  // Jump to MAP selector by direct showView (does NOT call exitGame)
  await page.evaluate(() => window.openMapTest('k2'));
  await page.waitForFunction(() => document.getElementById('mapSelectorView') && document.getElementById('mapSelectorView').classList.contains('active'));
  await watchSelector(page, 'D-k2', 22);

  await browser.close();
  srv.close();
})();
