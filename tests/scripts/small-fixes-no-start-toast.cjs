// Small fixes item 6 (2026-10-09): the green "Starting Practice with N skill(s)!" banner showed over the first question.
// Owner rule: in pupil play the only pop-ups are the XP message after a right answer and the 5-minute idle pop-up.
// Starts each mode from the skill queue (playSelectedSkills, the real path) and watches the screen for 3 s: no toast or
// notification may be on screen while the play view is up, and a toast raised just before play is taken down.
// Run: node tests/scripts/small-fixes-no-start-toast.cjs
const { open } = require('../lib/ws-harness.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fails = 0;
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };

(async () => {
  for (const vp of [{ width: 1366, height: 650 }, { width: 1280, height: 600 }]) {
    for (const mode of ['practice', 'boss', 'race', 'worksheet']) {
      const app = await open({ viewport: { ...vp, deviceScaleFactor: 1 } });
      const { page } = app;
      const tag = `[${vp.width}x${vp.height} ${mode}]`;
      try {
        await page.waitForFunction(() => typeof window.playSelectedSkills === 'function' && !!window.SKILLS, { timeout: 30000 });
        await page.evaluate((mode) => {
          try { localStorage.setItem('mathquest_onboarded', '1'); } catch (e) { /* ignore */ }
          window.skillQueue.length = 0;
          window.skillQueue.push({ categoryId: 'addition', skillId: 'add_facts', weight: 1 }, { categoryId: 'subtraction', skillId: 'sub_facts', weight: 1 });
          window.__seen = [];
          const look = () => {
            document.querySelectorAll('.mq-notify, .toast-notification, .mixed-play-toast').forEach((el) => {
              const r = el.getBoundingClientRect();
              if (r.width > 0 && getComputedStyle(el).opacity !== '0') window.__seen.push(el.textContent.trim().slice(0, 60));
            });
            if (window.__look !== false) requestAnimationFrame(look);
          };
          requestAnimationFrame(look);
          window.playSelectedSkills(mode);
        }, mode);
        await sleep(3000);
        const r = await page.evaluate(() => { window.__look = false; return { seen: [...new Set(window.__seen)], view: (document.querySelector('.view.active') || {}).id }; });
        check(/gameView|worksheetView/.test(r.view || ''), `${tag} play started (${r.view})`);
        check(r.seen.length === 0, `${tag} no pop-up over play: ${JSON.stringify(r.seen)}`);
        // a toast raised just BEFORE play (on the home screen) does not stay into play
        await page.evaluate(() => { window.showView('homeView'); window.showToast('Saved!', 'success'); window.showNotification('Saved!', 'info'); window.showMixedPlayToast('Playing all skills at easy difficulty!'); window.showView('gameView'); });
        await sleep(400);
        const left = await page.evaluate(() => [...document.querySelectorAll('.mq-notify, .toast-notification, .mixed-play-toast')].filter((e) => e.isConnected).length);
        check(left === 0, `${tag} a toast from just before play is gone once play shows (${left})`);
        // the XP message is still allowed
        await page.evaluate(() => window.showToast('+5 XP', 'success'));
        await sleep(100);
        const xp = await page.evaluate(() => !!document.querySelector('.toast-notification'));
        check(xp, `${tag} the XP toast still shows in play`);
      } catch (e) { check(false, `${tag} ${e.message}`); } finally { await app.close(); }
    }
  }
  console.log(fails ? `small-fixes-no-start-toast: FAIL (${fails})` : 'small-fixes-no-start-toast: OK');
  process.exit(fails ? 1 : 0);
})();
