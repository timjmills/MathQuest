// Scratch: screenshot one kit page (not a gate; deleted before commit).
//   node tests/scripts/tmp-shot.cjs cat:skill role size out.png [optsJSON] [key]
const { open } = require('../lib/ws-harness.cjs');
const [key, role, size, out, optsJson, which] = process.argv.slice(2);
(async () => {
    const app = await open({ seed: 7 });
    const [c, s] = key.split(':');
    const res = await app.page.evaluate(async (c, s, role, size, opts, which, CNT) => {
        const o = await window.buildSheet({ role, sections: [{ skills: [{ categoryId: c, skillId: s, opts }], count: CNT }], size, look: 'ican', key: true, seed: 11 });
        return { html: window.sheetDocument(which === 'key' ? o.keyHtml : o.pupilHtml, 'x'), n: o.pageCount };
    }, c, s, role, size, JSON.parse(optsJson || "{}"), which || "pupil", Number(process.env.COUNT) || null);
    if (/\.html$/.test(out)) { require('fs').writeFileSync(out, res.html); await app.close(); return; }
    const p2 = await app.browser.newPage();
    await p2.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.5 });
    await p2.setContent(res.html, { waitUntil: 'load' });
    await p2.evaluate(() => document.fonts && document.fonts.ready);
    await p2.screenshot({ path: out, fullPage: true });
    console.log('pages', res.n);
    await app.close();
})().catch((e) => { console.error(e); process.exit(1); });
