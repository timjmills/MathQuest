// Scratch: the tallest cells of a skill's 16-item run (not a gate; deleted before commit).
//   node tests/scripts/tmp-tall.cjs cat:skill,cat:skill [S|L] [role]
const { open } = require('../lib/ws-harness.cjs');
const SK = process.argv[2].split(',');
const SIZE = process.argv[3] || 'L';
const ROLE = process.argv[4] || 'independent';
(async () => {
    const app = await open({ seed: 7 });
    for (const key of SK) {
        const [c, s] = key.split(':');
        const res = await app.page.evaluate(async (c, s, size, role) => {
            const o = await window.buildSheet({ role, sections: [{ skills: [{ categoryId: c, skillId: s, opts: {} }], count: 16 }], size, look: 'ican', key: false, seed: 11 });
            return { html: window.sheetDocument(o.pupilHtml, 'x'), fits: o.fits };
        }, c, s, SIZE, ROLE);
        const p2 = await app.browser.newPage();
        await p2.setContent(res.html, { waitUntil: 'load' });
        await p2.evaluate(() => document.fonts && document.fonts.ready);
        const m = await p2.evaluate(() => {
            const mm = (v) => Math.round(v * 25.4 / 96 * 10) / 10;
            return Array.from(document.querySelectorAll('[data-ws-cell]')).map((el) => {
                const r = el.getBoundingClientRect();
                let t = Infinity, b = -Infinity, l = Infinity, rr = -Infinity;
                el.querySelectorAll('svg, span, table, [data-ws-slot], div').forEach((k) => {
                    if (k.children.length && k.tagName === 'DIV') return;
                    const q = k.getBoundingClientRect(); if (q.height && q.width) { t = Math.min(t, q.top); b = Math.max(b, q.bottom); l = Math.min(l, q.left); rr = Math.max(rr, q.right); }
                });
                return { cell: mm(r.height), h: mm(b - t), w: mm(rr - l), cw: mm(r.width), txt: el.textContent.replace(/\s+/g, ' ').slice(0, 70) };
            });
        });
        await p2.close();
        const f = res.fits.sections[0];
        console.log(`${key} ${SIZE} ${f.cols}x${f.rows} hMin ${f.hMin} cellH ${f.cellH}`);
        m.sort((a, b) => b.h - a.h).slice(0, 4).forEach((x) => console.log('   ', x.h, 'x', x.w, '/', x.cw, x.txt));
    }
    await app.close();
})().catch((e) => { console.error(e); process.exit(1); });
