// ws-lesson-fill — LESSON-FILL: a lesson part over several pages never leaves more white on a page than the next page's first
// item needs (lf-engine vocabfix item 2, 2026-11-20; lf-placevalue vocab deploy blocker 2).
//
//   node tests/scripts/ws-lesson-fill.cjs [--lessons a:b,c:d] [--sizes M,L] [--seeds 4242,1] [--parts practice]
//
// patterns:follow_given_rule / number_patterns_rule lesson Practice (p3-p4): the [6, 2] shape clamped to 1 column took the
// 1-column target of 4 rows and, being clamped, was never filled - p3 40-55 % white under 4 rows of 28.5 mm (M) while p4 carried
// 2 more that fit on p3. Built as the app prints a lesson (buildSheet role 'lesson', the skill's default options, practicePages 1,
// mixed), each page of the named parts is measured in the printed document: the white = the footer's top less the bottom of the
// page's last cell ([data-ws-cell] or .ws-cell); the next page of the same part holds a first cell of height h. FAIL when the
// white is h + 2 mm (the grid's safety) or more: that cell fits the page it was pushed off. Default lessons: the two above.
// Prints one line per lesson x size x seed and `ws-lesson-fill: OK (n)` / `FAIL (n)`.
'use strict';
const { open } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const LESSONS = arg('lessons', 'patterns:follow_given_rule,patterns:number_patterns_rule').split(',');
const SIZES = arg('sizes', 'M,L').split(',');
const SEEDS = arg('seeds', '4242,1').split(',').map(Number);
const PARTS = arg('parts', 'practice').split(',');
const SAFETY_MM = 2;
const PX_MM = 25.4 / 96;

(async () => {
    const app = await open({ seed: 1 });
    const { page } = app;
    const fails = [];
    let n = 0;
    try {
        for (const key of LESSONS) for (const size of SIZES) for (const seed of SEEDS) {
            const [categoryId, skillId] = key.split(':');
            const built = await page.evaluate(async (a) => {
                try {
                    const r = await window.buildSheet({ role: 'lesson', sections: [{ skills: [{ categoryId: a.categoryId, skillId: a.skillId }] }], size: a.size, paper: 'A4', seed: a.seed, key: true, practicePages: 1, mixed: true });
                    const parts = (r.partPlans || []).map((p) => ({ part: p.part, pages: p.plans.reduce((t, pl) => t + ((pl && pl.pages) || []).length, 0) }));
                    return { doc: window.sheetDocument(r.pupilHtml, 'pupil', { paper: 'A4' }), parts };
                } catch (e) { return { error: String((e && e.message) || e) }; }
            }, { categoryId, skillId, size, seed });
            const tag = `${key} ${size} seed ${seed}`;
            if (built.error) { fails.push(`${tag}: not composed (${built.error})`); continue; }
            const tab = await app.browser.newPage();
            try {
                await tab.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
                await tab.goto(page.url(), { waitUntil: 'domcontentloaded' });
                await tab.emulateMediaType('print');
                await tab.setContent(built.doc.replace(/http:\/\/(127\.0\.0\.1|localhost):\d+\//g, new URL(page.url()).origin + '/'), { waitUntil: 'networkidle0', timeout: 60000 });
                await tab.evaluate(() => document.fonts && document.fonts.ready);
                const geo = await tab.evaluate(() => [...document.querySelectorAll('section.ws-page')].map((pg) => {
                    const f = pg.querySelector('.ws-foot');
                    const cells = [...pg.querySelectorAll('.ws-grid > .ws-cell')].map((c) => c.getBoundingClientRect());
                    return { footTop: f ? f.getBoundingClientRect().top : pg.getBoundingClientRect().bottom, last: cells.length ? Math.max(...cells.map((r) => r.bottom)) : null, first: cells.length ? cells[0].height : null };
                }));
                let at = 0;
                const out = [];
                for (const p of built.parts) {
                    if (PARTS.includes(p.part)) for (let k = at; k < at + p.pages - 1; k++) {
                        const a = geo[k], b = geo[k + 1];
                        if (!a || !b || a.last === null || b.first === null) continue;
                        const white = (a.footTop - a.last) * PX_MM, need = b.first * PX_MM;
                        out.push(`${p.part} p${k + 1}: ${white.toFixed(1)} mm white, next p${k + 2} first cell ${need.toFixed(1)} mm`);
                        if (white >= need + SAFETY_MM) fails.push(`LESSON-FILL ${tag} ${p.part} page ${k + 1}: ${white.toFixed(1)} mm white while page ${k + 2}'s first cell (${need.toFixed(1)} mm) fits it`);
                    }
                    at += p.pages;
                }
                n++;
                console.log(`  ${tag}: ${built.parts.map((p) => `${p.part} ${p.pages}`).join(', ')}${out.length ? ' | ' + out.join('; ') : ''}`);
            } finally { await tab.close(); }
        }
    } finally { await app.close(); }
    for (const f of fails) console.log(`  FAIL ${f}`);
    console.log(fails.length ? `ws-lesson-fill: FAIL (${fails.length})` : `ws-lesson-fill: OK (${n})`);
    process.exit(fails.length ? 1 : 0);
})();
