// Scratch measure for the geometry lane pre-flight: items per page and the largest empty band per
// cell, at S and L, for independent and test pages (not a gate; deleted before commit).
const { open } = require('../lib/ws-harness.cjs');
const SK = (process.argv[2] || '').split(',').filter(Boolean);
(async () => {
    const app = await open({ seed: 7 });
    const { page } = app;
    for (const key of SK) {
        const [c, s] = key.split(':');
        const row = [];
        for (const role of ['independent', 'test']) {
            for (const size of ['S', 'L']) {
                const res = await page.evaluate(async (c, s, role, size) => {
                    let out;
                    try { out = await window.buildSheet({ role, sections: [{ skills: [{ categoryId: c, skillId: s, opts: {} }] }], size, look: 'ican', key: true, seed: 11 }); }
                    catch (e) { return { err: String(e.message || e).slice(0, 80) }; }
                    return { html: window.sheetDocument(out.pupilHtml, 'x'), pages: out.pageCount };
                }, c, s, role, size);
                if (res.err) { row.push(`${role}@${size}: ${res.err}`); continue; }
                const p2 = await app.browser.newPage();
                await p2.setContent(res.html, { waitUntil: 'load' });
                await p2.evaluate(() => document.fonts && document.fonts.ready);
                const m = await p2.evaluate(() => {
                    const cells = Array.from(document.querySelectorAll('[data-ws-cell]'));
                    let worst = 0;
                    for (const el of cells) {
                        const r = el.getBoundingClientRect();
                        let top = Infinity, bot = -Infinity;
                        el.querySelectorAll('svg, span, b, div > text, table, input, [data-ws-slot]').forEach((k) => {
                            const q = k.getBoundingClientRect();
                            if (!q.height || !q.width) return;
                            top = Math.min(top, q.top); bot = Math.max(bot, q.bottom);
                        });
                        if (top === Infinity) continue;
                        const band = Math.max(top - r.top, r.bottom - bot) / r.height;
                        worst = Math.max(worst, band);
                    }
                    const pages = document.querySelectorAll('.ws-page').length || 1;
                    const mm = (v) => Math.round(v * 25.4 / 96);
                    const hs = cells.slice(0, 3).map((el) => { const r = el.getBoundingClientRect(); let t = Infinity, b = -Infinity; el.querySelectorAll('svg, span, table, [data-ws-slot]').forEach((k) => { const q = k.getBoundingClientRect(); if (q.height && q.width) { t = Math.min(t, q.top); b = Math.max(b, q.bottom); } }); return mm(r.height) + '/' + mm(b - t); });
                    return { cells: cells.length, pages, worst: Math.round(worst * 100) + '% ' + hs.join(' ') };
                });
                await p2.close();
                row.push(`${role}@${size}: ${m.cells} cells / ${m.pages} p (${(m.cells / m.pages).toFixed(1)}/p), band ${m.worst}`);
            }
        }
        console.log(key.padEnd(40), row.join(' | '));
    }
    await app.close();
})().catch((e) => { console.error(e); process.exit(1); });
