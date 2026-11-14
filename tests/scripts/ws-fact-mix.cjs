#!/usr/bin/env node
// ws-fact-mix - two fact-rows page rules from the owner's 2026-11-14 screenshots (lf-ops mixfacts):
//
//   MIXED-ALL-OPS   "Mixed facts" (+ − × ÷ facts; the quick print, within 20, Medium, 6 columns) printed + − × in the rows and
//                   ÷ in its own "Divide." section at the bottom. On a fact-rows print of + − × AND ÷ facts in the ÷ sign's
//                   own form (div_facts Standard, the default), every pupil page that holds ÷ holds it INSIDE the shared
//                   grid: no grid of ÷ alone, one fact grid a page, all four signs on page 1, and (Mixed up, which interleaves
//                   the signs) at least half the rows of the grid holding a ÷ fact; In sections keeps each sign together in
//                   the one grid, ÷ as + − ×. Judged on the simple print (buildSets: the quick print and the dialog) at M
//                   and L, Columns 6 (the owner's) / 8 / Auto, In sections and Mixed up, Pages 1 and 2. ÷ alone stays ÷ only.
//   LDIV-FACT-ROOM  (owner 2026-11-14: "10 ⟌ 70" and "2 ⟌ 6" squished beside a fraction; the pupil writes the answer ABOVE the
//                   bar) on a fact-rows page with div_facts' long-division form, the free height above the vinculum - from
//                   the bar up to the cell's inner top edge, or 1 mm under the number tab (the label row's keep-out, CL-40) -
//                   is at least the size's writing height (SIZES[size].writeMm: M 8, L 10 mm). Judged at M and L on div_facts
//                   Long alone, Mix (long + fraction + ÷ sign) and Long in one grid with + − × facts, Auto and 9 columns.
//
//   node tests/scripts/ws-fact-mix.cjs                         # the live tree (browser; run through /tmp/mq-browser-run.sh)
//   node tests/scripts/ws-fact-mix.cjs --rules MIXED-ALL-OPS   # one rule
//   node tests/scripts/ws-fact-mix.cjs --json <out>            # also write the measurement (a fixture for a backtest row)
//   node tests/scripts/ws-fact-mix.cjs --fixture <json>        # judge a saved measurement (no browser)
//   node tests/scripts/ws-fact-mix.cjs --png <dir>             # also write page 1 of the quick print and of div Long at M
//   MQ_ROOT=<tree>                                             # serve another checkout
// Last line `ws-fact-mix: OK (...)` / `FAIL - n finding(s)`; exit 1 on FAIL.
'use strict';
const fs = require('fs');
const path = require('path');

const TOOL = 'ws-fact-mix';
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const RULES = arg('rules', 'MIXED-ALL-OPS,LDIV-FACT-ROOM').split(',');
const WRITE_MM = { M: 8, L: 10 };

/** Judge a measurement. Pure. */
function judge(m) {
    const f = [];
    for (const c of m.mix || []) {
        if (c.error) { f.push(`MIXED-ALL-OPS ${c.tag}: did not build (${String(c.error).slice(0, 120)})`); continue; }
        if (!c.pages.length) { f.push(`MIXED-ALL-OPS ${c.tag}: no pupil page`); continue; }
        if (c.divOnly) {
            for (const [i, p] of c.pages.entries()) if (p.grids.some((g) => g.ops.some((o) => o !== '÷'))) f.push(`MIXED-ALL-OPS ${c.tag} page ${i + 1}: ÷ alone printed another sign`);
            continue;
        }
        const s1 = new Set(c.pages[0].grids.flatMap((g) => g.ops));
        for (const s of ['+', '−', '×', '÷']) if (!s1.has(s)) f.push(`MIXED-ALL-OPS ${c.tag} page 1: no ${s} fact`);
        for (const [i, p] of c.pages.entries()) {
            const gs = p.grids.filter((g) => g.ops.length);
            if (gs.length > 1) f.push(`MIXED-ALL-OPS ${c.tag} page ${i + 1}: ${gs.length} fact grids (${gs.map((g) => [...new Set(g.ops)].join('')).join(' | ')}) - ÷ in its own section`);
            for (const g of gs) {
                if (g.ops.every((o) => o === '÷')) f.push(`MIXED-ALL-OPS ${c.tag} page ${i + 1}: a grid of ÷ alone (${g.ops.length} facts)`);
                // (Mixed up interleaves the signs: ÷ through the rows as the others; In sections keeps each sign's facts together
                // in the ONE grid, ÷ the same as + − ×)
                if (c.mixedUp && g.ops.includes('÷') && g.ops.some((o) => o !== '÷') && g.rows.length > 1) {
                    const withDiv = g.rows.filter((r) => r.includes('÷')).length;
                    if (withDiv * 2 < g.rows.length) f.push(`MIXED-ALL-OPS ${c.tag} page ${i + 1}: ÷ in ${withDiv} of ${g.rows.length} rows (not mixed through the rows)`);
                }
            }
        }
    }
    for (const c of m.room || []) {
        if (c.error) { f.push(`LDIV-FACT-ROOM ${c.tag}: did not build (${String(c.error).slice(0, 120)})`); continue; }
        if (!c.n) { f.push(`LDIV-FACT-ROOM ${c.tag}: no bracket fact on the page`); continue; }
        const need = WRITE_MM[c.size] || 8;
        if (c.minFree + 0.05 < need) f.push(`LDIV-FACT-ROOM ${c.tag}: ${c.minFree.toFixed(2)} mm free above the bar (fact ${c.at}), the ${c.size} writing height is ${need} mm (${c.short} of ${c.n} brackets short)`);
    }
    return f;
}

function report(m, f) {
    for (const c of m.mix || []) console.log(`  ${c.tag}: ${c.error ? 'ERROR' : c.pages.map((p, i) => `p${i + 1} ${p.grids.map((g) => `[${g.cols}c ${g.rows.length}r ${Object.entries(g.ops.reduce((t, o) => (t[o] = (t[o] || 0) + 1, t), {})).map(([k, v]) => k + v).join(' ')}]`).join(' ')}`).join(' · ')}`);
    for (const c of m.room || []) console.log(`  ${c.tag}: ${c.error ? 'ERROR' : `${c.n} brackets, least free above the bar ${(c.minFree || 0).toFixed(2)} mm (need ${WRITE_MM[c.size]})`}`);
    for (const x of f) console.log(`  FAIL ${x}`);
    console.log(f.length ? `${TOOL}: FAIL - ${f.length} finding(s)` : `${TOOL}: OK (${(m.mix || []).length} mixed-facts prints, ${(m.room || []).length} long-division fact pages)`);
    process.exit(f.length ? 1 : 0);
}

if (arg('fixture', null)) {
    const fx = JSON.parse(fs.readFileSync(path.resolve(arg('fixture')), 'utf8'));
    const m = { mix: RULES.includes('MIXED-ALL-OPS') ? fx.mix : [], room: RULES.includes('LDIV-FACT-ROOM') ? fx.room : [] };
    report(m, judge(m));
}

const F = (c, k, opts = {}) => ({ categoryId: c, skillId: k, opts, amt: '' });
const MIXED = [F('addition', 'add_facts', { band: 20 }), F('subtraction', 'sub_facts', { band: 20 }), F('multiplication', 'mult_facts'), F('division', 'div_facts')];
const MIX_CASES = [];
for (const size of ['M', 'L']) for (const cols of [6, 8, 'auto']) for (const arrange of ['sections', 'mixed']) MIX_CASES.push({ size, cols, arrange, n: 1 });
MIX_CASES.push({ size: 'M', cols: 6, arrange: 'sections', n: 2 });
MIX_CASES.push({ size: 'M', cols: 6, arrange: 'sections', n: 1, divOnly: true });
const DL = (form) => F('division', 'div_facts', { divForm: form });
const ROOM_CASES = [];
for (const size of ['M', 'L']) for (const cols of ['auto', 9]) {
    ROOM_CASES.push({ size, cols, name: 'div Long', sections: [{ skills: [DL('long')] }] });
    ROOM_CASES.push({ size, cols, name: 'div Mix', sections: [{ skills: [DL('mix')] }] });
    ROOM_CASES.push({ size, cols, name: 'Long + − ×', sections: [{ skills: [F('addition', 'add_facts', { band: 20 }), F('subtraction', 'sub_facts', { band: 20 }), F('multiplication', 'mult_facts'), DL('long')] }] });
}
// the simple print (quick prints and the dialog): ÷ forms beside + − × share the page, so their rows are laid shorter
for (const size of ['M', 'L']) for (const cols of ['auto', 6, 9]) for (const form of ['long', 'mix']) for (const arrange of ['sections', 'mixed']) {
    ROOM_CASES.push({ size, cols, name: `simple + − × ÷ ${form} ${arrange === 'mixed' ? 'Mixed up' : 'In sections'}`, simple: { arrange, list: [...MIXED.slice(0, 3), DL(form)] } });
}
for (const size of ['M', 'L']) for (const cols of ['auto', 9]) ROOM_CASES.push({ size, cols, name: 'simple ÷ mix alone', simple: { arrange: 'sections', list: [DL('mix')] } });

(async () => {
    const { open } = require('../lib/ws-harness.cjs');
    const app = await open({ seed: 7 });
    const page = app.page;
    const m = { mix: [], room: [] };
    const pngDir = arg('png', null);
    try {
        await page.evaluate(() => (window.__mqLoadDeferred ? window.__mqLoadDeferred() : null));
        // one shared measuring helper on the page: render a pupil document in an iframe and read it
        await page.evaluate(() => {
            window.__fmLook = async (html, onScreen) => {
                const f = document.createElement('iframe');
                f.id = 'fm-frame';
                f.style.cssText = onScreen ? 'position:absolute;left:0;top:0;width:820px;height:1200px;border:0;background:#fff;z-index:99999' : 'position:fixed;left:-3000px;top:0;width:900px;height:1200px;border:0';
                document.body.appendChild(f);
                await new Promise((res) => { f.onload = res; f.srcdoc = window.sheetDocument(html, 'm', { paper: 'A4' }); });
                for (let i = 0; i < 40; i++) { if (f.contentDocument.documentElement.getAttribute('data-ws-fonts') === 'ready') break; await new Promise((x) => setTimeout(x, 100)); }
                return f;
            };
            window.__fmSign = (c) => { const o = c.querySelector('.ws-fact .op'); if (o) return o.textContent.trim().replace('-', '−').replace('x', '×'); const d = c.querySelector('[data-ws-ops]'); if (d && d.getAttribute('data-ws-ops') === 'division') return '÷'; const t = c.textContent || ''; return /÷/.test(t) || c.querySelector('[data-ws-cell="equation"] .ws-frac, .ws-frac') ? '÷' : /×/.test(t) ? '×' : /−/.test(t) ? '−' : /\+/.test(t) ? '+' : '?'; };
        });
        if (RULES.includes('MIXED-ALL-OPS')) for (const c of MIX_CASES) {
            const tag = `${c.divOnly ? '÷ alone' : 'Mixed facts'} ${c.size} Columns ${c.cols} ${c.arrange === 'mixed' ? 'Mixed up' : 'In sections'} Pages ${c.n}`;
            const r = await page.evaluate(async ({ c, list }) => {
                try {
                    const mod = await import('/js/modules/simple-print.js');
                    const o = { how: 'pages', n: c.n, sets: 1, size: c.size, cols: c.cols, colsMode: 'aim', key: true, arrange: c.arrange, seed: 4242, title: true, paper: 'A4' };
                    const b = await mod.buildSets(list, o);
                    const f = await window.__fmLook(b.pupilHtml);
                    const pages = [...f.contentDocument.querySelectorAll('.ws-page')].filter((pg) => !/key/i.test(pg.className) && !pg.querySelector('[data-ws-key-ans]')).map((pg) => ({
                        grids: [...pg.querySelectorAll('.ws-grid')].map((g) => {
                            const cells = [...g.querySelectorAll(':scope > .ws-cell:not(.blankrun)')].filter((x) => x.getBoundingClientRect().width > 0);
                            const rows = new Map();
                            for (const x of cells) { const t = Math.round(x.getBoundingClientRect().top); if (!rows.has(t)) rows.set(t, []); rows.get(t).push(window.__fmSign(x)); }
                            return { ops: cells.map(window.__fmSign), rows: [...rows.values()], cols: Math.max(0, ...[...rows.values()].map((x) => x.length)) };
                        }).filter((g) => g.ops.length),
                    }));
                    f.remove();
                    return { pages };
                } catch (e) { return { error: (e && e.stack) || String(e) }; }
            }, { c, list: c.divOnly ? MIXED.slice(3) : MIXED });
            m.mix.push(Object.assign({ tag, divOnly: !!c.divOnly, mixedUp: c.arrange === 'mixed' }, r));
        }
        if (RULES.includes('LDIV-FACT-ROOM')) for (const c of ROOM_CASES) {
            const tag = `${c.name} ${c.size} Columns ${c.cols}`;
            const r = await page.evaluate(async ({ c }) => {
                try {
                    const b = c.simple ? await (await import('/js/modules/simple-print.js')).buildSets(c.simple.list, { how: 'pages', n: 1, sets: 1, size: c.size, cols: c.cols, colsMode: 'aim', key: false, arrange: c.simple.arrange, seed: 4242, title: true, paper: 'A4' })
                        : await window.buildSheet({ role: 'fact-rows', look: 'auto', sections: c.sections.map((s) => ({ skills: s.skills.map((k) => ({ categoryId: k.categoryId, skillId: k.skillId, opts: k.opts })), pages: 1, ...(c.cols !== 'auto' ? { columns: c.cols } : {}) })), size: c.size, paper: 'A4', seed: 4242, key: false });
                    const f = await window.__fmLook(b.pupilHtml);
                    const px = 25.4 / 96;
                    let n = 0, short = 0, minFree = Infinity, at = '';
                    const need = { M: 8, L: 10 }[c.size];
                    for (const d of f.contentDocument.querySelectorAll('.ws-page [data-ws-ops="division"]')) {
                        const grp = d.querySelector('[role="group"]');
                        const bar = grp && [...grp.querySelectorAll(':scope > span[aria-hidden="true"]')].find((s) => /border-top/.test(s.getAttribute('style') || ''));
                        const cell = d.closest('.ws-cell');
                        if (!bar || !cell) continue;
                        n++;
                        const br = bar.getBoundingClientRect();
                        const cr = cell.getBoundingClientRect();
                        const cs = getComputedStyle(cell);
                        let top = cr.top + (parseFloat(cs.borderTopWidth) || 0);
                        // (the number tab's band - the tab and the 1 mm keep-out under it, CL-40 - is the label row, not writing room,
                        // wherever the bracket stands across the cell)
                        for (const t of cell.querySelectorAll('.ws-tab')) top = Math.max(top, t.getBoundingClientRect().bottom + 1 / px);
                        const free = (br.top - top) * px;
                        if (free + 0.05 < need) short++;
                        if (free < minFree) { minFree = free; at = (grp.getAttribute('aria-label') || '').replace(' divided by ', ' ÷ '); }
                    }
                    f.remove();
                    return { n, short, minFree: Number.isFinite(minFree) ? Math.round(minFree * 100) / 100 : 0, at };
                } catch (e) { return { error: (e && e.stack) || String(e) }; }
            }, { c });
            m.room.push(Object.assign({ tag, size: c.size }, r));
        }
        if (pngDir) {
            fs.mkdirSync(path.resolve(pngDir), { recursive: true });
            const shots = [
                ['quick-print-mixed-facts-M-6cols', async () => { const mod = await import('/js/modules/simple-print.js'); return (await mod.buildSets(window.__fmList, { how: 'pages', n: 1, sets: 1, size: 'M', cols: 6, colsMode: 'aim', key: true, arrange: 'sections', seed: 4242, title: true, paper: 'A4' })).pupilHtml; }],
                ['div-facts-long-M', async () => (await window.buildSheet({ role: 'fact-rows', look: 'auto', sections: [{ skills: [{ categoryId: 'division', skillId: 'div_facts', opts: { divForm: 'long' } }], pages: 1 }], size: 'M', paper: 'A4', seed: 4242, key: false })).pupilHtml],
                ['div-facts-mix-M', async () => (await window.buildSheet({ role: 'fact-rows', look: 'auto', sections: [{ skills: [{ categoryId: 'division', skillId: 'div_facts', opts: { divForm: 'mix' } }], pages: 1 }], size: 'M', paper: 'A4', seed: 4242, key: false })).pupilHtml],
            ];
            await page.evaluate((l) => { window.__fmList = l; }, MIXED);
            await page.setViewport({ width: 820, height: 1200, deviceScaleFactor: 2 });
            for (const [name, fn] of shots) {
                await page.evaluate(async (src) => { const html = await (new Function('return ' + src)())(); await window.__fmLook(html, true); }, fn.toString());
                const fh = await page.$('#fm-frame');
                const fr = await fh.contentFrame();
                const el = await fr.$('.ws-page');
                await el.screenshot({ path: path.join(path.resolve(pngDir), `${name}.png`) });
                await page.evaluate(() => document.getElementById('fm-frame').remove());
                console.log(`  png ${path.join(path.resolve(pngDir), `${name}.png`)}`);
            }
        }
    } finally { await app.close(); }
    if (arg('json', null)) fs.writeFileSync(path.resolve(arg('json')), JSON.stringify(Object.assign({ note: `${TOOL} measurement` }, m), null, 1) + '\n');
    report(m, judge(m));
})().catch((e) => { console.log(String(e && e.stack || e)); console.log(`${TOOL}: FAIL - crashed`); process.exit(1); });
