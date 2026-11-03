// tests/scripts/ws-mixed-render.cjs - render a mixed-practice print (pupil + key) to PNGs, page by page.
//   node tests/scripts/ws-mixed-render.cjs --out <dir> [--set owner|a|b|c|d|<cat:skill,...>] [--sizes S,M,L]
//        [--counts 7,7,7,7,7,6] [--arr mixed|sections] [--look daily|ican] [--seed 4242] [--key] [--columns N]
// The owner's set (2026-11-03): add / sub facts within 20, mult / div facts 1-12, missing numbers +/-, missing factors x/÷,
// 41 problems (7,7,7,7,7,6).
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..');
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const SETS = {
    owner: ['addition:add_facts', 'subtraction:sub_facts', 'multiplication:mult_facts', 'division:div_facts', 'subtraction:missing_add_sub', 'multiplication:missing_mult_div'],
    a: ['multiplication:multiply', 'addition:add_facts'], b: ['addition:add_facts', 'multiplication:mult_2by2_standard'],
    c: ['addition:add_facts', 'addition:add_word_problems'], d: ['fractions:identify', 'subtraction:subtract'],
};
(async () => {
    const out = path.resolve(arg('out', 'mixed-render'));
    fs.mkdirSync(out, { recursive: true });
    const setName = arg('set', 'owner');
    const set = SETS[setName] || setName.split(',');
    const tag = SETS[setName] ? setName : 'set';
    const counts = arg('counts', setName === 'owner' ? '7,7,7,7,7,6' : '').split(',').filter(Boolean).map(Number);
    const sk = (id) => { const [categoryId, skillId] = id.split(':'); return { categoryId, skillId, opts: {} }; };
    const app = await open({ seed: 12345 });
    for (const size of arg('sizes', 'S,M,L').split(',')) {
        const sections = counts.length ? set.map((id, i) => ({ skills: [sk(id)], count: counts[i] })) : [{ skills: set.map(sk) }];
        const req = { role: 'mixed-practice', arrangement: arg('arr', 'mixed'), sections, size, look: arg('look', 'daily'), seed: Number(arg('seed', 4242)), key: process.argv.includes('--key') };
        if (arg('columns')) req.columns = Number(arg('columns'));
        const r = await app.page.evaluate(async (req) => {
            const o = await window.buildSheet(req);
            const doc = window.sheetDocument || (await import('./js/modules/print-sheet.js')).sheetDocument;
            return { pupil: doc(o.pupilHtml, 'pupil'), key: o.keyHtml ? doc(o.keyHtml, 'key') : '', pages: o.pageCount, notes: o.notes || [], perPage: o.fits && o.fits.perPage };
        }, req);
        console.log(`${tag} ${size}: ${r.pages} page(s), perPage ${r.perPage}; notes: ${r.notes.join(' | ')}`);
        for (const [kind, html] of [['pupil', r.pupil], ['key', r.key]]) {
            if (!html) continue;
            const p = await app.page.browser().newPage();
            await p.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1.5 });
            await p.goto(app.page.url());
            await p.setContent(html, { waitUntil: 'networkidle0' }).catch(() => {});
            await new Promise((res) => setTimeout(res, 500));
            const els = await p.$$('.ws-page');
            for (let i = 0; i < els.length; i++) await els[i].screenshot({ path: path.join(out, `${tag}-${size}-${kind}-p${i + 1}.png`) });
            await p.close();
        }
    }
    process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
