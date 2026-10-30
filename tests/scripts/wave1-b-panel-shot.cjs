// Wave 1 lane B: shoot the teacher option panel of a + − × ÷ skill with the "Answer boxes"
// disclosure closed and open, at 1280 and 390, into the folder given.
//   node tests/scripts/wave1-b-panel-shot.cjs [outDir]
const path = require('path');
const fs = require('fs');
const { open, ROOT } = require('../lib/ws-harness.cjs');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'design/audit/runs/wave1-B/final/panel'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
    fs.mkdirSync(OUT, { recursive: true });
    for (const w of [1280, 390]) {
        const app = await open({ seed: 1, viewport: { width: w, height: 900, deviceScaleFactor: 1 } });
        const { page } = app;
        for (const [c, k] of [['addition', 'add_100_regroup'], ['division', 'div_facts']]) {
            await page.evaluate((c, k) => { try { window.closeSkillOptionsPanel(); } catch (e) { /* */ } window.openSkillOptionsPanel(c, k, document.body); }, c, k);
            await sleep(500);
            const pop = await page.$('#skillOptionsPopover');
            if (!pop) { console.log('no popover for', k); continue; }
            await pop.screenshot({ path: path.join(OUT, `${k}-closed-${w}.png`) });
            await page.evaluate(() => { const d = document.querySelector('#skillOptionsPopover details.sko-boxes'); if (d) { d.open = true; d.scrollIntoView({ block: 'center' }); } });
            await sleep(300);
            const txt = await page.evaluate(() => { const d = document.querySelector('#skillOptionsPopover details.sko-boxes'); return d ? d.innerText.replace(/\s+/g, ' ').slice(0, 300) : 'NO ANSWER-BOXES DISCLOSURE'; });
            console.log(w, k, txt);
            const box = await page.$('#skillOptionsPopover details.sko-boxes');
            await (box || pop).screenshot({ path: path.join(OUT, `${k}-open-${w}.png`) });
        }
        await app.close();
    }
})().catch((e) => { console.error(e); process.exit(1); });
