// Confirm onboarding fix: flag sets on first show, card stays on-screen,
// dismiss methods all work, doesn't return on reload.
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });

  // Step 1: fresh user → tour fires
  await page.goto('http://localhost:3199/', { waitUntil: 'networkidle0', timeout: 25000 });
  await page.evaluate(() => { try { localStorage.removeItem('mathquest_onboarded'); } catch {} });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => {
    document.querySelectorAll('.mq-celebration-modal').forEach(el => el.remove());
  });

  const fresh = await page.evaluate(() => {
    const overlay = document.querySelector('.mq-onb-overlay');
    if (!overlay) return { overlayVisible: false };
    const card = overlay.querySelector('.mq-onb-card');
    const closeBtn = overlay.querySelector('.mq-onb-close');
    const skipBtn = overlay.querySelector('.mq-onb-skip');
    const nextBtn = overlay.querySelector('.mq-onb-next');
    if (!card) return { overlayVisible: true, cardVisible: false };
    const cs = getComputedStyle(card);
    const r = card.getBoundingClientRect();
    return {
      overlayVisible: true,
      cardVisible: true,
      flagSet: localStorage.getItem('mathquest_onboarded') === '1',  // should be true ALREADY
      cardOnScreen: r.left >= 0 && r.top >= 0 && r.right <= window.innerWidth && r.bottom <= window.innerHeight,
      cardLeft: Math.round(r.left),
      cardTop: Math.round(r.top),
      cardWidth: Math.round(r.width),
      cardHeight: Math.round(r.height),
      hasCloseBtn: !!closeBtn,
      hasSkipBtn: !!skipBtn,
      hasNextBtn: !!nextBtn,
    };
  });
  console.log('fresh user step 1:', fresh);

  // Step 2: dismiss with the ✕ close button
  await page.evaluate(() => document.querySelector('.mq-onb-close')?.click());
  await new Promise(r => setTimeout(r, 400));
  const afterClose = await page.evaluate(() => ({
    overlayGone: !document.querySelector('.mq-onb-overlay'),
    flagSet: localStorage.getItem('mathquest_onboarded') === '1',
  }));
  console.log('after close-btn:', afterClose);

  // Step 3: reload — should NOT show again
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  const afterReload = await page.evaluate(() => ({
    overlay: !!document.querySelector('.mq-onb-overlay'),
    flag: localStorage.getItem('mathquest_onboarded'),
  }));
  console.log('after reload:', afterReload);

  // Step 4: reset + manual trigger via window.startOnboarding()
  await page.evaluate(() => {
    localStorage.removeItem('mathquest_onboarded');
    window.startOnboarding();
  });
  await new Promise(r => setTimeout(r, 400));
  const manual = await page.evaluate(() => ({
    overlay: !!document.querySelector('.mq-onb-overlay'),
    flagSetOnStart: localStorage.getItem('mathquest_onboarded') === '1',
  }));
  console.log('manual start:', manual);

  // Step 5: dismiss via Escape
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 400));
  const afterEsc = await page.evaluate(() => !document.querySelector('.mq-onb-overlay'));
  console.log('after Esc:', { overlayGone: afterEsc });

  // Step 6: reset + dismiss via backdrop click
  await page.evaluate(() => {
    localStorage.removeItem('mathquest_onboarded');
    window.startOnboarding();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => {
    const ov = document.querySelector('.mq-onb-overlay');
    if (ov) {
      ov.dispatchEvent(new MouseEvent('click', { bubbles: true, target: ov }));
      // The handler checks e.target === overlay — synthesize that
      // by clicking at a coord far from the card.
      ov.click();
    }
  });
  await new Promise(r => setTimeout(r, 400));
  const afterBackdrop = await page.evaluate(() => !document.querySelector('.mq-onb-overlay'));
  console.log('after backdrop click:', { overlayGone: afterBackdrop });

  console.log('errors:', errs.length, errs.slice(0, 5));
  await page.screenshot({ path: 'tests/screenshots/smoke-onboarding.png' });
  await browser.close();
})();
