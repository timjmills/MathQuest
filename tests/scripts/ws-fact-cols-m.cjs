// ws-fact-cols-m — FACT SHEETS KEEP EVERYTHING when size S is dropped (owner 2026-11-13, CLAUDE.md plan item 9): a fact-rows
// sheet with 9 or 10 columns PICKED prints at Size M with exactly those columns (x facts: their own cap of 8, as at S), at the 16 pt rung (FACT_LADDER 9 / 10:
// "the column count sets the digit size"), on the teacher print path (buildSheet, role fact-rows) and on the simple print path
// (buildSimple, Columns Exactly n). ÷ facts go to 9 (the owner's ÷ maximum, 2026-11-05); + − × go to 10.
//
// Rules (each case: skill x columns x path, at M):
//   FCM-COLS  the printed grid has the picked number of facts across (the widest row on page 1, from the rendered cells)
//   FCM-PT    the fact digits print at 16 pt (FACT_LADDER[9] = FACT_LADDER[10] = 16), never smaller
//   FCM-FIT   the sheet builds (no error, at least one page, and every item printed is on a page)
//
//   node tests/scripts/ws-fact-cols-m.cjs                       # the live tree (browser; run through /tmp/mq-browser-run.sh)
//   node tests/scripts/ws-fact-cols-m.cjs --fixture <json>      # judge a saved measurement ({cases:[{tag, cols, got, pt, error}]})
//   node tests/scripts/ws-fact-cols-m.cjs --json <out>          # also write the measurement (a fixture for a backtest row)
//   MQ_ROOT=<tree>                                              # serve another checkout
// Last line `ws-fact-cols-m: OK (...)` / `FAIL - n finding(s)`; exit 1 on FAIL.
const fs = require('fs');
const path = require('path');

const TOOL = 'ws-fact-cols-m';
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const PT_WANT = 16;
const SIZE = arg('size', 'M');   // (a comparison run on an older tree: --size S)
const ONLY = arg('skills', '');

/** Judge measured cases. Pure. */
function judge(cases) {
    const f = [];
    for (const c of cases) {
        if (c.error) { f.push(`FCM-FIT ${c.tag}: did not build (${String(c.error).slice(0, 120)})`); continue; }
        if (!(c.pages >= 1)) f.push(`FCM-FIT ${c.tag}: no page printed`);
        const want = Math.min(c.cols, c.cap || c.cols);
        if (c.got !== want) f.push(`FCM-COLS ${c.tag}: ${c.got} facts across, ${want} expected (${c.cols} picked${c.cap ? `, the skill's own cap ${c.cap}` : ''})`);
        if (!(Math.abs(c.pt - PT_WANT) < 0.6)) f.push(`FCM-PT ${c.tag}: digits at ${c.pt} pt, the ${c.cols}-column rung is ${PT_WANT} pt`);
    }
    return f;
}

function report(cases, f) {
    for (const c of cases) console.log(`  ${c.tag}: ${c.error ? 'ERROR' : `${c.got} across, ${c.pt} pt, ${c.pages} page(s)`}`);
    for (const x of f) console.log(`  FAIL ${x}`);
    console.log(f.length ? `${TOOL}: FAIL - ${f.length} finding(s)` : `${TOOL}: OK (${cases.length} fact sheets at M: 9 / 10 columns as picked, 16 pt)`);
    process.exit(f.length ? 1 : 0);
}

if (arg('fixture', null)) {
    const fx = JSON.parse(fs.readFileSync(path.resolve(arg('fixture')), 'utf8'));
    report(fx.cases || [], judge(fx.cases || []));
}

const CASES = [
    ['addition', 'add_facts', [9, 10]],
    ['subtraction', 'sub_facts', [9, 10]],
    ['multiplication', 'mult_facts', [9, 10]],
    ['division', 'div_facts', [9]],
];
// A skill's OWN cap, not a size cap: × facts print at most 8 across (the widest product, 12 × 12 = 144, fills the cell at
// 16 pt). Measured the same at S on 76bc11c6 (the tree before S was dropped): 8 across at 9 and 10 picked.
const CAP = { mult_facts: 8 };

(async () => {
    const { open } = require('../lib/ws-harness.cjs');
    const app = await open({ seed: 7 });
    const page = app.page;
    const cases = [];
    try {
        await page.evaluate(() => (window.__mqLoadDeferred ? window.__mqLoadDeferred() : null));
        for (const [categoryId, skillId, colsList] of CASES.filter((c) => !ONLY || ONLY.split(',').includes(c[1]))) for (const cols of colsList) for (const via of ['teacher', 'simple']) {
            const tag = `${skillId} ${SIZE} ${cols} cols (${via} print)`;
            const r = await page.evaluate(async ({ categoryId, skillId, cols, via, SIZE }) => {
                try {
                    let html;
                    let pages = 0;
                    if (via === 'teacher') {
                        const b = await window.buildSheet({ role: 'fact-rows', sections: [{ skills: [{ categoryId, skillId }], columns: cols, pages: 1 }], size: SIZE, paper: 'A4', seed: 4242, key: false });
                        html = b.pupilHtml; pages = b.pageCount;
                    } else {
                        const m = await import('/js/modules/simple-print.js');
                        const o = { how: 'pages', n: 1, sets: 1, size: SIZE, cols, colsMode: 'exact', key: false, arrange: 'sections', seed: 4242, title: true, paper: 'A4' };
                        const b = await m.buildSimple([{ categoryId, skillId, amt: '' }], o);
                        html = b.pupilHtml || b.html || (b.doc && b.doc.pupilHtml) || '';
                        pages = b.pages && b.pages.length != null ? b.pages.length : Number(b.pages) || (html.match(/class="ws-page[ "]/g) || []).length;
                    }
                    const host = document.createElement('div');
                    host.style.cssText = 'position:absolute;left:0;top:0;width:210mm;';
                    host.innerHTML = html;
                    document.body.appendChild(host);
                    await new Promise((x) => requestAnimationFrame(() => requestAnimationFrame(x)));
                    const pg = host.querySelector('.ws-page');
                    // the fact cells of page 1: the ws-cell boxes; facts across = the most cells sharing one top edge
                    const cells = [...(pg || host).querySelectorAll('.ws-cell')].filter((c) => c.getBoundingClientRect().width > 0);
                    const rows = new Map();
                    for (const c of cells) { const t = Math.round(c.getBoundingClientRect().top); rows.set(t, (rows.get(t) || 0) + 1); }
                    const got = rows.size ? Math.max(...rows.values()) : 0;
                    // the digit size: the largest font-size of a text node holding a digit inside a cell (px -> pt)
                    let px = 0;
                    for (const c of cells.slice(0, 12)) {
                        const w = document.createTreeWalker(c, NodeFilter.SHOW_TEXT);
                        for (let n = w.nextNode(); n; n = w.nextNode()) if (/\d/.test(n.textContent) && n.parentElement) px = Math.max(px, parseFloat(getComputedStyle(n.parentElement).fontSize) || 0);
                    }
                    host.remove();
                    return { got, pt: Math.round(px * 72 / 96 * 10) / 10, pages };
                } catch (e) { return { error: (e && e.stack) || String(e) }; }
            }, { categoryId, skillId, cols, via, SIZE });
            cases.push(Object.assign({ tag, cols, cap: CAP[skillId] || null }, r));
        }
    } finally { await app.close(); }
    if (arg('json', null)) fs.writeFileSync(path.resolve(arg('json')), JSON.stringify({ note: `${TOOL} measurement`, cases }, null, 1) + '\n');
    report(cases, judge(cases));
})().catch((e) => { console.log(String(e && e.stack || e)); console.log(`${TOOL}: FAIL - crashed`); process.exit(1); });
