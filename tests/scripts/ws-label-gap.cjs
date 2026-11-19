// ws-label-gap — LABEL-GAP (lf-ops bugs 2026-11-19; lf-engine roles critic r2 F6: integers:add_int with a −23..1 window
// printed number-line numerals that touch). Adjacent tick numerals of a number line keep a clear gap: their glyph boxes
// never touch or overlap, and the white between two neighbours is at least GAP_MM.
//
//   node tests/scripts/ws-label-gap.cjs [--skills integers:add_int,integers:sub_int] [--shots <dir>]
//
// Measured in the rendered page (getBoundingClientRect of every <text> in an svg[aria-label^="number line"], in mm at
// 96 px an inch; the screen in px scaled to mm the same way, since the screen line scales with its numerals):
//   paper   every page that draws the line - independent, guided, more practice and test, pupil + key, at M and L,
//           page seeds 1-4, Max Number 100 and 1000 - and the PINNED window −23..1 (the critic's case: start −22, + 21)
//           drawn through the kit at M and L;
//   screen  the practice card's tap-to-jump line (.mq-nl-lab numerals) at 1280 and 820 on an item whose window is at least 24 numbers wide with a 2-digit
//           negative end (found by a seed sweep; FAILS if none is found, so the case cannot pass unseen).
// A skill x host that draws no line FAILS. Prints `ws-label-gap: OK` / `FAIL (n)`.
const fs = require('fs');
const path = require('path');
const { open, hideOverlays } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const SKILLS = String(arg('skills', 'integers:add_int')).split(',').map((s) => s.trim()).filter(Boolean);
const SHOTS = arg('shots', null);
const GAP_MM = 1.0;
const ROLES = ['independent', 'guided', 'more-practice', 'test'];
const PINNED = { min: -23, max: 1, start: -22, add: 21, op: '+', unknown: 'result' };
const PX_MM = 25.4 / 96;

/** In the frame: per number line, the numerals left to right and the smallest clear gap between neighbours (mm). */
function GAPS(frameSel, pxMm) {
    const doc = frameSel ? document.querySelector(frameSel).contentDocument : document;
    const lines = Array.from(doc.querySelectorAll('svg[aria-label^="number line"]'));
    return lines.map((svg) => {
        const tx = Array.from(svg.querySelectorAll('text')).map((t) => { const r = t.getBoundingClientRect(); return { s: t.textContent, l: r.left, r: r.right, w: r.width }; })
            .filter((b) => b.w > 0).sort((a, b) => a.l - b.l);
        let min = Infinity, at = '';
        for (let i = 1; i < tx.length; i++) {
            const g = (tx[i].l - tx[i - 1].r) * pxMm;
            if (g < min) { min = g; at = `${tx[i - 1].s} | ${tx[i].s}`; }
        }
        return { label: svg.getAttribute('aria-label'), n: tx.length, min: Number.isFinite(min) ? min : null, at, labels: tx.map((b) => b.s).join(' ') };
    });
}

/** On screen: the tap-to-jump line's numerals (.mq-nl-lab in each line), measured as GAPS does. */
function SCREENGAPS(pxMm) {
    const card = document.getElementById('questionCard') || document;
    const labs = Array.from(card.querySelectorAll('.mq-nl-lab'));
    const lines = new Map();
    for (const e of labs) { const k = e.closest('.mq-nl-tick') ? e.closest('.mq-nl-tick').parentElement : e.parentElement; if (!lines.has(k)) lines.set(k, []); lines.get(k).push(e); }
    return Array.from(lines.values()).map((els) => {
        const tx = els.map((t) => { const r = t.getBoundingClientRect(); return { s: t.textContent.trim(), l: r.left, r: r.right, w: r.width }; })
            .filter((b) => b.w > 0 && b.s).sort((a, b) => a.l - b.l);
        let min = Infinity, at = '';
        for (let i = 1; i < tx.length; i++) { const g = (tx[i].l - tx[i - 1].r) * pxMm; if (g < min) { min = g; at = `${tx[i - 1].s} | ${tx[i].s}`; } }
        return { label: 'screen tap-to-jump line', n: tx.length, min: Number.isFinite(min) ? min : null, at, labels: tx.map((b) => b.s).join(' ') };
    });
}

async function frameDoc(page, html) {
    await page.evaluate(async (h) => {
        let f = document.getElementById('mqGapPaper');
        if (!f) { f = document.createElement('iframe'); f.id = 'mqGapPaper'; f.style.cssText = 'position:fixed;left:0;top:0;width:900px;height:1300px;border:0;z-index:2147483647;background:#fff'; document.body.appendChild(f); }
        await new Promise((res) => { f.onload = res; f.srcdoc = h; });
        await f.contentDocument.fonts.ready;
    }, html);
}

(async () => {
    const app = await open({ seed: 1, viewport: { width: 900, height: 1300, deviceScaleFactor: 1 } });
    const { page } = app;
    let fails = 0;
    const judge = (where, lines) => {
        let worst = null;
        for (const m of lines) {
            if (m.min === null) continue;
            if (!worst || m.min < worst.min) worst = m;
            if (m.min < GAP_MM) { fails++; console.log(`FAIL LABEL-GAP ${where}: ${m.label}: "${m.at}" ${m.min.toFixed(2)} mm < ${GAP_MM} mm  (${m.labels})`); }
        }
        return worst;
    };
    try {
        for (const key of SKILLS) {
            const [categoryId, skillId] = key.split(':');
            // paper: the role pages
            for (const range of [100, 1000]) for (const role of ROLES) for (const size of ['M', 'L']) {
                let lines = 0, worst = null;
                for (const seed of [1, 2, 3, 4]) {
                    const docs = await page.evaluate(async (a) => {
                        const r = await window.buildSheet({ role: a.role, size: a.size, seed: a.seed, key: true, sections: [{ skills: [{ categoryId: a.categoryId, skillId: a.skillId, opts: {}, range: a.range }] }] });
                        return [window.sheetDocument(r.pupilHtml, 'gap'), window.sheetDocument(r.keyHtml || '', 'gap')];
                    }, { categoryId, skillId, role, size, seed, range });
                    for (const d of docs) {
                        await frameDoc(page, d);
                        const m = await page.evaluate(GAPS, '#mqGapPaper', PX_MM);
                        lines += m.length;
                        const w = judge(`${key} ${role} ${size} range ${range} seed ${seed}`, m);
                        if (w && (!worst || w.min < worst.min)) worst = w;
                    }
                }
                // (past Max Number 100 a window over 32 numbers keeps its old cell, so a short role page may draw none there)
                if (!lines) { if (range <= 100) fails++; console.log(`${range <= 100 ? 'FAIL' : 'note'} LABEL-GAP ${key} ${role} ${size} range ${range}: no number line drawn`); continue; }
                console.log(`${worst && worst.min < GAP_MM ? 'FAIL' : 'PASS'} LABEL-GAP ${key} ${role} ${size} range ${range}: ${lines} line(s), closest numerals ${worst ? `${worst.min.toFixed(2)} mm ("${worst.at}", ${worst.label})` : '-'}`);
            }
            // paper: the pinned window through the kit, M and L
            for (const size of ['M', 'L']) {
                const doc = await page.evaluate(async (a) => {
                    const kit = await import('/js/modules/sheet/index.js');
                    const ctx = kit.resolveCtx({ mode: 'print', size: a.size, look: 'ican', state: 'blank' });
                    const html = kit.renderCell({ cell: { template: 'number-line', v: 1, payload: a.p } }, ctx);
                    return window.sheetDocument(`<div class="ws-page"><div class="ws-sheet ws-${a.size}">${html}</div></div>`, 'gap');
                }, { size, p: PINNED });
                await frameDoc(page, doc);
                const m = await page.evaluate(GAPS, '#mqGapPaper', PX_MM);
                if (!m.length) { fails++; console.log(`FAIL LABEL-GAP pinned −23..1 ${size}: no number line drawn`); continue; }
                const w = judge(`pinned −23..1 ${size}`, m);
                console.log(`${w.min < GAP_MM ? 'FAIL' : 'PASS'} LABEL-GAP pinned −23..1 (start −22, + 21) ${size}: closest numerals ${w.min.toFixed(2)} mm ("${w.at}"): ${w.labels}`);
                if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); const fr = await (await page.$('#mqGapPaper')).contentFrame(); const el = await fr.$('svg[aria-label^="number line"]'); if (el) await el.screenshot({ path: path.join(SHOTS, `label-gap-pinned-${size}.png`) }); }
            }
            await page.evaluate(() => { const f = document.getElementById('mqGapPaper'); if (f) f.remove(); });
            // screen: the practice card on a wide window
            const found = await page.evaluate((a) => {
                for (let s = 1; s < 4000; s++) {
                    const q = window.generateQuestionFor({ category: a.categoryId, skill: a.skillId, range: 100, opts: {}, seed: s });
                    const p = q && q.cell && q.cell.template === 'number-line' && q.cell.payload;
                    if (p && p.max - p.min >= 24 && p.min <= -10) return { seed: s, min: p.min, max: p.max };
                }
                return null;
            }, { categoryId, skillId });
            if (!found) { fails++; console.log(`FAIL LABEL-GAP ${key} screen: no item with a wide negative window found`); continue; }
            for (const w of [1280, 820]) {
                await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
                await hideOverlays(page);
                const ok = await page.evaluate((a) => {
                    const st = window.state;
                    st.category = a.categoryId; st.skill = a.skillId; st.range = 100; st.gameMode = 'practice'; st.isMixedMode = false;
                    if (window.showView) window.showView('gameView');
                    const q = window.generateQuestionFor({ category: a.categoryId, skill: a.skillId, range: 100, opts: {}, seed: a.seed });
                    st.currentQ = q; window.renderQuestion();
                    return true;
                }, { categoryId, skillId, seed: found.seed });
                if (!ok) { fails++; continue; }
                await new Promise((r) => setTimeout(r, 300));
                const m = [...await page.evaluate(GAPS, null, PX_MM), ...await page.evaluate(SCREENGAPS, PX_MM)].filter((x) => x.n > 1);
                if (!m.length) { fails++; console.log(`FAIL LABEL-GAP ${key} screen card ${w}: no number line drawn (seed ${found.seed}, ${found.min}..${found.max})`); continue; }
                const wst = judge(`${key} screen card ${w}`, m);
                console.log(`${wst.min < GAP_MM ? 'FAIL' : 'PASS'} LABEL-GAP ${key} screen card ${w} (seed ${found.seed}, ${found.min}..${found.max}): closest numerals ${wst.min.toFixed(2)} mm ("${wst.at}")`);
                if (SHOTS) { const el = await page.$('#questionCard'); if (el) await el.screenshot({ path: path.join(SHOTS, `label-gap-card-${w}.png`) }); }
            }
        }
        const errs = app.problems.filter((p) => p.type !== 'requestfailed');
        if (errs.length) { fails++; errs.slice(0, 5).forEach((e) => console.log(`FAIL console: ${e.text}`)); }
    } catch (e) { console.log('FAIL ' + (e.stack || e.message)); fails++; } finally { await app.close(); }
    console.log(fails ? `ws-label-gap: FAIL (${fails})` : 'ws-label-gap: OK');
    process.exit(fails ? 1 : 0);
})();
