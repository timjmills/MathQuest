// Verify zoom modal scales the visual to 2× the original (capped at viewport).
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  page.on('pageerror', (e) => console.log('[PAGE ERR]', e.message));

  await page.goto('http://localhost:8080/index.html', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    document.body.classList.remove('student-mode');
    document.body.classList.add('teacher-mode');
  });

  // Force-render a question whose visual is a contained SVG (arrays_groups).
  await page.evaluate(() => {
    window.state.gameMode = 'practice';
    window.state.skill = 'arrays_groups';
    window.state.category = 'multiplication';
    window.state.range = 100;
    // generateQuestion() in this codebase RETURNS the question rather than
    // assigning to state. Assign manually.
    const q = window.generateQuestion();
    if (q) {
      window.state.currentQ = q;
      window.state.currentQ.skillId = 'arrays_groups';
    }
    // Show gameView so visualAid is in DOM.
    if (window.showView) window.showView('gameView');
    window.renderQuestion();
  });
  await new Promise(r => setTimeout(r, 600));

  // Measure the original SVG.
  const before = await page.evaluate(() => {
    const v = document.getElementById('visualAid');
    const svg = v && v.querySelector('svg');
    if (!svg) return null;
    const r = svg.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height) };
  });
  console.log('[ZOOM] original SVG:', before);

  // Open the zoom modal — click visualAid.
  await page.evaluate(() => {
    const v = document.getElementById('visualAid');
    if (v && v.onclick) v.onclick({ target: v, stopPropagation: () => {}, preventDefault: () => {} });
  });
  await new Promise(r => setTimeout(r, 500));

  // Measure the cloned SVG inside the overlay.
  const after = await page.evaluate(() => {
    const overlay = document.querySelector('.zoom-overlay');
    if (!overlay) return null;
    const svg = overlay.querySelector('svg');
    if (!svg) return null;
    const r = svg.getBoundingClientRect();
    return {
      w: Math.round(r.width),
      h: Math.round(r.height),
      inlineWidth: svg.style.width,
      inlineHeight: svg.style.height,
      attrWidth: svg.getAttribute('width'),
      attrHeight: svg.getAttribute('height'),
    };
  });
  console.log('[ZOOM] popup SVG:', after);

  // Assert popup is approximately 2× original (allow ±10% tolerance).
  if (!before || !after) {
    console.log('[ZOOM] FAIL — could not measure SVGs');
    await browser.close();
    process.exit(2);
  }
  const ratioW = after.w / before.w;
  const ratioH = after.h / before.h;
  console.log(`[ZOOM] scale: width=${ratioW.toFixed(2)}× height=${ratioH.toFixed(2)}×`);
  // Capture a screenshot for the user.
  await page.screenshot({ path: 'test-zoom-2x-popup.png' });
  console.log('[ZOOM] screenshot: test-zoom-2x-popup.png');

  // Both ratios should be > 1.7 (close to 2× — viewport may cap slightly under).
  const pass = ratioW > 1.7 && ratioH > 1.7;
  console.log(pass ? '[ZOOM] OVERALL: PASS (≥1.7× scale achieved)' : `[ZOOM] OVERALL: FAIL (scale <1.7×: w=${ratioW}, h=${ratioH})`);
  await browser.close();
  process.exit(pass ? 0 : 1);
})();
