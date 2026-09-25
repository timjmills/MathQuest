// Screenshot the live option panel of a few skills, the way a teacher opens it (P12 evidence).
//
//   node tests/scripts/ws-options-shots.cjs fractions:add_frac_like_nv measurement:time_quarter ...
//
// Teacher mode → Sets screen → the skill's Options button → the shared editor
// (window.openSkillOptionsPanel). Each panel is saved to design/audit/options-panels/<cat>-<skill>.png.
const path = require('path');
const { ROOT, open } = require('../lib/ws-harness.cjs');

(async () => {
    const refs = process.argv.slice(2).filter(a => a.includes(':'));
    const app = await open({ seed: 1, viewport: { width: 1280, height: 1000, deviceScaleFactor: 1 } });
    const { page } = app;
    for (const ref of refs) {
        const [categoryId, skillId] = ref.split(':');
        await page.evaluate(({ categoryId, skillId }) => {
            if (!document.body.classList.contains('teacher-mode') && window.toggleUserRole) window.toggleUserRole();
            const s = (window.SKILLS[categoryId] || []).find(x => x.v === skillId);
            window.UnifiedSkills.clear();
            window.UnifiedSkills.add({ domainId: 'x', categoryId, skillId, skillLabel: s ? s.l : skillId, categoryIcon: '', categoryName: categoryId, domainColor: '#8b5cf6' });
            window.UnifiedSkills._syncAllImmediate();
            window.tvGo('sets');
        }, { categoryId, skillId });
        const sel = `.tv-opt-btn[data-key="${categoryId}|${skillId}"]`;
        try {
            await page.waitForSelector(sel, { timeout: 10000 });
            await page.click(sel);
            await page.waitForSelector('#skillOptionsPopover', { timeout: 5000 });
            await new Promise(r => setTimeout(r, 300));
            const el = await page.$('#skillOptionsPopover');
            const file = path.join(ROOT, 'design', 'audit', 'options-panels', `${categoryId}-${skillId}.png`);
            await el.screenshot({ path: file });
            const text = await page.evaluate(() => document.getElementById('skillOptionsPopover').innerText.replace(/\n+/g, ' | ').slice(0, 600));
            console.log(`${ref} -> ${path.relative(ROOT, file)}\n   ${text}`);
            await page.evaluate(() => { const p = document.getElementById('skillOptionsPopover'); if (p) p.remove(); });
        } catch (e) {
            console.log(`${ref}: FAILED ${e.message}`);
        }
    }
    const errs = app.problems.filter(p => p.type === 'pageerror');
    if (errs.length) console.log('page errors:', errs.map(e => e.text).slice(0, 5));
    await app.close();
})();
