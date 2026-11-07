// Render-hash baseline for the lesson engine refactors (lessons-phase0, lead decision D3: every refactor step keeps
// the three sample packets AND the detailed lessons byte-identical).
//
//   node tests/scripts/ws-lesson-baseline.cjs --write <file.json>     # record the hashes
//   node tests/scripts/ws-lesson-baseline.cjs --check <file.json>     # compare; exits 1 on any difference
//
// Hashes (sha1) every page of the pupil and key HTML strings window.buildSheet returns for:
//   - the three sample packets of ws-lesson-samples.cjs (sizes L and M, seeds 4242 and 1001, practicePages 1, mixed);
//   - every detailed lesson of js/modules/lessons/detailed/index.js (seed 4242), every `.ws-page` of its html.
// --verbose prints each build with its time. Prints `ws-lesson-baseline: OK (n hashes identical)` / `FAIL (n differ)`. Not a design gate: a refactor guard.
const fs = require('fs');
const crypto = require('crypto');
const { open } = require('../lib/ws-harness.cjs');

const arg = (k) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : null; };
const WRITE = arg('write');
const CHECK = arg('check');
const SAMPLES = [
    { id: 'add', skill: { categoryId: 'addition', skillId: 'add_facts', opts: { band: 10, constant: [1, 2, 3] } } },
    { id: 'sub', skill: { categoryId: 'subtraction', skillId: 'sub_100_regroup' } },
    { id: 'round', skill: { categoryId: 'number_sense', skillId: 'nearest_10' } },
];
const sha = (s) => crypto.createHash('sha1').update(String(s)).digest('hex');
const t0 = Date.now();
const log = (s) => { if (process.argv.includes('--verbose')) console.log(`  [${((Date.now() - t0) / 1000).toFixed(0)} s] ${s}`); };

/** Run `fn(arg)` in the page without one long protocol call (a detailed lesson can take minutes): start, then poll. */
async function inPage(page, fn, arg) {
    await page.evaluate(`window.__wsLB = undefined; (${fn.toString()})(${JSON.stringify(arg)}).then((r) => { window.__wsLB = r; }, (e) => { window.__wsLB = { error: String((e && e.stack) || e) }; }); 0`);
    await page.waitForFunction(() => window.__wsLB !== undefined, { timeout: 0, polling: 500 });
    return page.evaluate(() => window.__wsLB);
}

(async () => {
    const PARTS = process.argv.includes('--parts');
    if (!WRITE && !CHECK && !PARTS) { console.log('usage: --write <file> | --check <file> | --parts'); process.exit(2); }
    const app0 = await open({ seed: 1 });
    // (a detailed lesson can keep the page busy past puppeteer's 180 s protocol timeout: the same page, reconnected
    // without one)
    const conn = await require('puppeteer').connect({ browserWSEndpoint: app0.browser.wsEndpoint(), protocolTimeout: 0, defaultViewport: null });
    const pages = await conn.pages();
    const app = { page: pages.find((p) => p.url() === app0.page.url()) || pages[pages.length - 1], close: async () => { conn.disconnect(); await app0.close(); } };
    const out = {};
    if (PARTS) {
        // LR-18 (lessons-phase0 step 3): each part printed alone is its page in the packet; each part refreshed
        // (refresh 1) changes that part and its key and no other part. Seed 4242, L, every sample.
        const fails = [];
        try {
            for (const l of SAMPLES) {
                const r = await inPage(app.page, async ({ skill }) => {
                    const base = { role: 'lesson', sections: [{ skills: [skill] }], size: 'L', paper: 'A4', seed: 4242, key: true, practicePages: 1, mixed: true };
                    const whole = await window.buildSheet(base);
                    const ids = window.LESSON_PARTS;
                    const out = { ids, alone: {}, fresh: {}, refreshed: {} };
                    for (const x of ids) {
                        const a = await window.buildSheet(Object.assign({}, base, { parts: [x] }));
                        // (the part's own HTML before the key is arranged for print; the printed pupil pages are exactly it)
                        out.alone[x] = a.pupilHtml === whole.lesson.partHtml[x].pupil && a.lesson.partHtml[x].key === whole.lesson.partHtml[x].key && a.pupilHtml.length > 0;
                        const f = await window.buildSheet(Object.assign({}, base, { lessonSeeds: { [x]: window.lessonPartSeed(4242, x, 1) } }));
                        out.refreshed[x] = f.lesson.refreshed;
                        out.fresh[x] = Object.fromEntries(ids.map((y) => [y, { pupil: f.lesson.partHtml[y].pupil === whole.lesson.partHtml[y].pupil, key: f.lesson.partHtml[y].key === whole.lesson.partHtml[y].key }]));
                    }
                    return out;
                }, { skill: l.skill });
                if (r.error) { fails.push(`${l.id}: ${r.error.split('\n')[0]}`); continue; }
                for (const x of r.ids) {
                    if (!r.alone[x]) fails.push(`${l.id}: part ${x} printed alone differs from its packet page`);
                    for (const y of r.ids) {
                        const same = r.fresh[x][y];
                        if (y === x && (same.pupil || same.key)) fails.push(`${l.id}: refreshing ${x} left its ${same.pupil ? 'pupil page' : 'key'} unchanged`);
                        if (y !== x && !(same.pupil && same.key)) fails.push(`${l.id}: refreshing ${x} changed ${y}`);
                    }
                }
                log(`${l.id} parts`);
            }
        } finally { await app.close(); }
        for (const f of fails) console.log(`  ${f}`);
        console.log(fails.length ? `ws-lesson-baseline --parts: FAIL (${fails.length})` : `ws-lesson-baseline --parts: OK (${SAMPLES.length} lessons x every part: alone = packet page; refresh changes only its part)`);
        process.exit(fails.length ? 1 : 0);
    }
    try {
        for (const l of SAMPLES) for (const size of ['L', 'M']) for (const seed of [4242, 1001]) {
            const r = await inPage(app.page, async ({ skill, size, seed }) => {
                try {
                    const r = await window.buildSheet({ role: 'lesson', sections: [{ skills: [skill] }], size, paper: 'A4', seed, key: true, practicePages: 1, mixed: true });
                    const split = (h) => { const d = document.createElement('div'); d.innerHTML = h; return [...d.querySelectorAll('.ws-page')].map((p) => p.outerHTML); };
                    return { pupil: split(r.pupilHtml), key: split(r.keyHtml), whole: [r.pupilHtml, r.keyHtml] };
                } catch (e) { return { error: (e && e.stack) || String(e) }; }
            }, { skill: l.skill, size, seed });
            const k = `${l.id}/${size}/${seed}`;
            log(k);
            if (r.error) { out[k + '/error'] = r.error.split('\n')[0]; continue; }
            r.pupil.forEach((h, i) => { out[`${k}/pupil-p${i + 1}`] = sha(h); });
            r.key.forEach((h, i) => { out[`${k}/key-p${i + 1}`] = sha(h); });
            out[`${k}/pupilHtml`] = sha(r.whole[0]);
            out[`${k}/keyHtml`] = sha(r.whole[1]);
        }
        const ids = await app.page.evaluate(async () => (await import('./js/modules/lessons/detailed/index.js')).detailedLessonList().map((d) => d.id));
        for (const id of ids) {
            const r = await inPage(app.page, async (id) => {
                try {
                    const r = await window.buildSheet({ role: 'detailed-lesson', lessonId: id, seed: 4242, paper: 'A4', year: 2026 });
                    const d = document.createElement('div'); d.innerHTML = r.html;
                    return { pages: [...d.querySelectorAll('.ws-page')].map((p) => p.outerHTML), html: r.html };
                } catch (e) { return { error: (e && e.stack) || String(e) }; }
            }, id);
            log(`detailed/${id}`);
            if (r.error) { out[`detailed/${id}/error`] = r.error.split('\n')[0]; continue; }
            r.pages.forEach((h, i) => { out[`detailed/${id}/p${String(i + 1).padStart(2, '0')}`] = sha(h); });
            out[`detailed/${id}/html`] = sha(String(r.html).replace(/https?:\/\/127\.0\.0\.1:\d+/g, 'ORIGIN'));   // (the doc links the served css: the port is the run's own)
        }
    } finally { await app.close(); }
    if (WRITE) {
        fs.writeFileSync(WRITE, JSON.stringify(out, null, 1));
        const errs = Object.keys(out).filter((k) => k.endsWith('/error'));
        console.log(`ws-lesson-baseline: wrote ${Object.keys(out).length} hashes to ${WRITE}${errs.length ? ` (${errs.length} builds errored: ${errs.join(', ')})` : ''}`);
        return;
    }
    const base = JSON.parse(fs.readFileSync(CHECK, 'utf8'));
    const keys = Object.keys(base).sort();   // (a key the baseline lacks is not compared)
    const diff = keys.filter((k) => base[k] !== out[k]);
    for (const k of diff) console.log(`  ${k}: ${base[k] === undefined ? 'NEW' : out[k] === undefined ? 'MISSING' : 'CHANGED'}`);
    console.log(diff.length ? `ws-lesson-baseline: FAIL (${diff.length} of ${keys.length} differ)` : `ws-lesson-baseline: OK (${keys.length} hashes identical)`);
    process.exit(diff.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
