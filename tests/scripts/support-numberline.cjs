// Wave 5.2 lane test: the custom number line at the top of the page (design/MASTER_PLAN.md 5.2).
//
//   node tests/scripts/support-numberline.cjs            the gate
//   node tests/scripts/support-numberline.cjs --shots    also write the proof images to
//                                                        tests/compliance/shots/support-numberline/ (git-ignored)
//
// Checks (in the real app):
//   1. OFFERED where it fits: every skill numberLineFits() names offers the seven nl* controls in
//      one disclosure (never among the resting controls), and a skill that does not fit offers none.
//   2. SHARE CODES: the option round-trips through the option payload and a skill code, signed and
//      decimal ends included (−10, 2.5), and a code with every option at its default is unchanged.
//   3. COVERAGE: for the sampled skills, buildSheet's line covers every number of every item on the
//      page (Auto ends), and a teacher range that misses them warns (sheet note + panel warning).
//   4. THE PAGE FITS: the band prints on every pupil page AND every key page, under the header, and
//      no page body overflows (no split cell); the line takes the live width at S and at L.
//   5. SCREEN: the line mounts above the practice card and above the online worksheet when the
//      option is on, and not otherwise; the quiz draws none.
// Prints `support-numberline: OK` or `support-numberline: FAIL` and exits non-zero on failure.
const fs = require('fs');
const path = require('path');
const { ROOT, open, waitFor, hideOverlays } = require('../lib/ws-harness.cjs');

const SHOTS = process.argv.includes('--shots');
const SHOT_DIR = path.join(ROOT, 'tests', 'compliance', 'shots', 'support-numberline');
const fails = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };
const log = (...a) => console.log(...a);

const SAMPLES = [
    { id: 'add_facts', cat: 'addition', skill: 'add_facts', opts: { nlOn: true } },
    { id: 'add_100', cat: 'addition', skill: 'add_100_mixed', opts: { nlOn: true } },
    { id: 'frac_quarters', cat: 'fractions', skill: 'compare', opts: { nlOn: true, nlFrom: 0, nlTo: 2, nlStep: '1/4' } },
    { id: 'dec_tenths', cat: 'decimals', skill: 'add_decimal', opts: { nlOn: true, nlStep: '0.1' } },
    { id: 'int_10', cat: 'integers', skill: 'integer_nl_drag', opts: { nlOn: true, nlFrom: -10, nlTo: 10 } },
];

(async () => {
    const h = await open();
    const { page } = h;
    if (SHOTS) fs.mkdirSync(SHOT_DIR, { recursive: true });
    try {
        await waitFor(page, () => typeof window.buildSheet === 'function' && typeof window.encodeOptionPayload === 'function', 30000, 'kit');

        /* 1 + 2: offered, resting, codec */
        const u = await page.evaluate(async () => {
            const W = window;
            const out = { fails: [], offered: 0, skills: 0 };
            const fail = (m) => { if (out.fails.length < 40) out.fails.push(m); };
            const mod = await import('./js/modules/skill-options.js');
            const NL = ['nlOn', 'nlFrom', 'nlTo', 'nlStep', 'nlLabels', 'nlMinor', 'nlHops'];
            for (const [cat, list] of Object.entries(W.SKILLS)) {
                if (!Array.isArray(list)) continue;
                for (const s of list) {
                    if (!s || s.retired) continue;
                    out.skills++;
                    const fits = mod.numberLineFits(cat, s.v);
                    const ids = W.offeredOptionsFor(cat, s.v).map((d) => d.id);
                    const has = NL.filter((x) => ids.includes(x));
                    if (fits && has.length !== NL.length) fail(`${cat}:${s.v} fits but offers ${has.join(',')}`);
                    if (!fits && has.length) fail(`${cat}:${s.v} does not fit but offers ${has.join(',')}`);
                    if (!fits) continue;
                    out.offered++;
                    const defs = W.offeredOptionsFor(cat, s.v);
                    const on = W.normalizeOptions(cat, s.v, { nlOn: true });
                    if (mod.restingOptions(defs, on).some((d) => NL.includes(d.id))) fail(`${cat}:${s.v} shows a number-line control at rest`);
                    if (defs.filter((d) => NL.includes(d.id)).some((d) => !d.help)) fail(`${cat}:${s.v} a number-line control has no help line`);
                    // round trips
                    for (const want of [{ nlOn: true }, { nlOn: true, nlFrom: -10, nlTo: 10 }, { nlOn: true, nlFrom: 0, nlTo: 2.5, nlStep: '1/4', nlLabels: '5', nlMinor: '2', nlHops: true },
                        { nlOn: true, nlStep: '0.01', nlLabels: 'ends' }, { nlOn: true, nlFrom: -0.5, nlTo: 1000000, nlStep: '1000', nlMinor: '10', nlLabels: 'none' }]) {
                        const packed = W.packOptions(cat, s.v, want);
                        const pay = W.encodeOptionPayload(cat, s.v, packed);
                        if (!/^[A-Z0-9_]*$/.test(pay)) fail(`${cat}:${s.v} payload not URL-safe: ${pay}`);
                        const back = W.decodeOptionPayload(cat, s.v, '~' + pay);
                        if (JSON.stringify(back) !== JSON.stringify(packed)) fail(`${cat}:${s.v} ${JSON.stringify(packed)} -> ${pay} -> ${JSON.stringify(back)}`);
                        const code = W.SKILL_CODES[`${cat}:${s.v}`];
                        if (code) {
                            const parts = W.parseSkillCodeParts(code + '~' + pay);
                            if (parts.length !== 1 || JSON.stringify(parts[0].opts) !== JSON.stringify(packed)) fail(`${cat}:${s.v} skill code ${code}~${pay} -> ${JSON.stringify(parts)}`);
                        }
                    }
                    if (W.encodeOptionPayload(cat, s.v, W.packOptions(cat, s.v, {})) !== W.encodeOptionPayload(cat, s.v, {})) fail(`${cat}:${s.v} default payload changed`);
                    // the line off writes nothing
                    if (W.encodeOptionPayload(cat, s.v, W.packOptions(cat, s.v, { nlOn: false, nlFrom: null }))) fail(`${cat}:${s.v} the line off still writes a payload`);
                }
            }
            return out;
        });
        u.fails.forEach((m) => check(false, m));
        log(`  offered on ${u.offered} of ${u.skills} skills; codec round trips checked`);

        /* 3 + 4: coverage and fit, S and L */
        for (const size of ['S', 'L']) {
            for (const smp of SAMPLES) {
                const r = await page.evaluate(async ({ smp, size }) => {
                    const W = window;
                    const req = { role: 'independent', sections: [{ skills: [{ categoryId: smp.cat, skillId: smp.skill, opts: smp.opts }] }], size, look: 'ican', key: true, seed: 4242 };
                    const out = await W.buildSheet(req);
                    const kit = await import('./js/modules/sheet/index.js');
                    const items = (out.items || []);
                    // every number of every item on the page lies on the line
                    const nl = out.numberLine;
                    const miss = [];
                    if (nl) {
                        for (const it of items) for (const x of kit.nlLineNumbers({ text: it.text, ans: it.ans })) if (x.v < nl.from - 1e-9 || x.v > nl.to + 1e-9) miss.push(`${x.v} in "${it.text}"`);
                    }
                    // render and measure
                    const host = document.createElement('div');
                    host.style.cssText = 'position:absolute;left:0;top:0;width:210mm;background:#fff';
                    host.innerHTML = `<style>${document.querySelector('style[data-mq-sheet-engine]') ? '' : ''}</style>` + out.pupilHtml + out.keyHtml;
                    document.body.appendChild(host);
                    await new Promise((res) => setTimeout(res, 50));
                    const pages = [...host.querySelectorAll('.ws-page')];
                    const pg = pages.map((p) => {
                        const band = p.querySelector('.ws-refline');
                        const head = p.querySelector('.ws-head');
                        const body = p.querySelector('.ws-body');
                        const svg = band && band.querySelector('svg');
                        return {
                            key: p.classList.contains('ws-key') || p.getAttribute('data-ws-mode') === 'key',
                            band: !!band,
                            under: !!(band && head && band.previousElementSibling === head),
                            overflow: body ? Math.max(0, body.scrollHeight - body.clientHeight) : 0,
                            pageOverflow: Math.max(0, p.scrollHeight - p.clientHeight),
                            svgW: svg ? svg.getBoundingClientRect().width : 0,
                            pageW: p.getBoundingClientRect().width,
                        };
                    });
                    host.remove();
                    return { nl, miss, pages: pg, pageCount: out.pageCount, keyPageCount: out.keyPageCount, fits: out.fits && out.fits.note };
                }, { smp, size });
                const tag = `${smp.id} @${size}`;
                check(!!r.nl, `${tag}: no number line on the sheet`);
                if (!r.nl) continue;
                check(r.nl.covers && !r.miss.length, `${tag}: the line ${r.nl.from}..${r.nl.to} misses ${r.miss.slice(0, 4).join("; ")} ${JSON.stringify(r.nl.missing)}`);
                check(r.pages.length === r.pageCount + r.keyPageCount, `${tag}: ${r.pages.length} pages rendered, ${r.pageCount}+${r.keyPageCount} expected`);
                check(r.pages.every((p) => p.band && p.under), `${tag}: a page has no band under its header`);
                check(r.pages.some((p) => p.key && p.band), `${tag}: the key has no band`);
                check(r.pages.every((p) => p.overflow <= 1 && p.pageOverflow <= 1), `${tag}: a page overflows (${JSON.stringify(r.pages.map((p) => [p.overflow, p.pageOverflow]))})`);
                // full live width: 186 of 210 mm
                const ratio = r.pages[0].svgW / r.pages[0].pageW;
                check(ratio > 0.85 && ratio < 0.92, `${tag}: the line is ${(ratio * 100).toFixed(1)}% of the page width (want the live width, ~88.6%)`);
                log(`  ${tag}: line ${r.nl.from} to ${r.nl.to} by ${r.nl.step}, band ${r.nl.hMm} mm, ${r.pageCount}+${r.keyPageCount} pages${r.nl.notes && r.nl.notes.length ? ' (' + r.nl.notes.join('; ') + ')' : ''}`);
            }
        }
        // a teacher range that misses the page warns
        const warn = await page.evaluate(async () => {
            const out = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId: 'addition', skillId: 'add_facts', opts: { nlOn: true, nlFrom: 0, nlTo: 5 } }] }], size: 'M', key: false, seed: 7 });
            const m = await import('./js/modules/refline-screen.js');
            return { covers: out.numberLine && out.numberLine.covers, note: out.fits && out.fits.note, panel: m.numberLineCoverWarning('addition', 'add_facts', { nlOn: true, nlFrom: 0, nlTo: 5 }), ok: m.numberLineCoverWarning('addition', 'add_facts', { nlOn: true }) };
        });
        check(warn.covers === false && /number line runs 0 to 5/.test(warn.note || ''), `custom range 0-5 on add_facts: no sheet warning (${JSON.stringify(warn)})`);
        check(/number line runs/.test(warn.panel) && !warn.ok, `panel warning wrong: ${JSON.stringify(warn)}`);

        /* 5: screen */
        const scr = await page.evaluate(async () => {
            const W = window;
            const st = (await import('./js/modules/state.js')).state;
            const m = await import('./js/modules/refline-screen.js');
            const q = W.generateQuestionFor({ category: 'addition', skill: 'add_facts', seed: 3 });
            m.syncPracticeRefLine(q, { categoryId: 'addition', skillId: 'add_facts', opts: { nlOn: true } });
            const on = !!document.querySelector('#mqRefLine svg');
            const before = document.getElementById('mqRefLine') && document.getElementById('mqRefLine').nextElementSibling && document.getElementById('mqRefLine').nextElementSibling.id;
            m.syncPracticeRefLine(q, { categoryId: 'addition', skillId: 'add_facts', opts: {} });
            const off = !document.getElementById('mqRefLine');
            const qs = [1, 2, 3].map((i) => W.generateQuestionFor({ category: 'addition', skill: 'add_facts', seed: i }));
            m.syncWorksheetRefLine(qs, { categoryId: 'addition', skillId: 'add_facts', opts: { nlOn: true } });
            const ws = !!document.querySelector('#mqWsRefLine svg') && document.getElementById('mqWsRefLine').nextElementSibling.id === 'worksheetGrid';
            m.syncWorksheetRefLine(qs, { categoryId: 'addition', skillId: 'add_facts', opts: {} });
            const wsOff = !document.getElementById('mqWsRefLine');
            const quizSrc = await (await fetch('./js/modules/quiz-take.js')).text();
            return { on, before, off, ws, wsOff, quiz: !/refline/i.test(quizSrc), st: !!st };
        });
        check(scr.on && scr.before === 'questionCard', `practice card: line not mounted above the card (${JSON.stringify(scr)})`);
        check(scr.off, 'practice card: line still shown with the option off');
        check(scr.ws && scr.wsOff, `online worksheet: line not mounted above the grid / not removed (${JSON.stringify(scr)})`);
        check(scr.quiz, 'the quiz draws the line (it draws no supports)');

        if (SHOTS) await shots(h);
        check(!h.problems.length, `console problems: ${JSON.stringify(h.problems.slice(0, 5))}`);
    } catch (e) {
        fails.push(`run error: ${e.stack || e.message}`);
    } finally {
        await h.close();
    }
    if (fails.length) {
        fails.slice(0, 60).forEach((m) => log('  FAIL ' + m));
        log('support-numberline: FAIL');
        process.exit(1);
    }
    log('support-numberline: OK');
})();

/* ------------------------------------------------------------------ proof images */
async function shots(h) {
    const { page, browser, base } = h;
    for (const size of ['S', 'L']) {
        for (const smp of SAMPLES) {
            const doc = await page.evaluate(async ({ smp, size }) => {
                const out = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId: smp.cat, skillId: smp.skill, opts: smp.opts }] }], size, look: 'ican', key: true, seed: 4242 });
                return window.sheetDocument(out.pupilHtml + '\n' + out.keyHtml, smp.id);
            }, { smp, size });
            const p = await browser.newPage();
            await p.setViewport({ width: 900, height: 1300, deviceScaleFactor: 1.5 });
            await p.goto(base + '/index.html', { waitUntil: 'domcontentloaded' });
            await p.setContent(doc, { waitUntil: 'networkidle0', timeout: 60000 });
            await p.evaluate(() => document.fonts && document.fonts.ready);
            const els = await p.$$('.ws-page');
            const keyEl = (await p.$$('.ws-page.ws-key'))[0];
            if (els[0]) await els[0].screenshot({ path: path.join(SHOT_DIR, `${smp.id}-${size}-pupil.png`) });
            if (keyEl) await keyEl.screenshot({ path: path.join(SHOT_DIR, `${smp.id}-${size}-key.png`) });
            await p.close();
        }
    }
    // the card and the online worksheet at 390 and 1280, for two skills
    for (const smp of [SAMPLES[0], SAMPLES[2]]) {
        for (const w of [390, 1280]) {
            await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1.5 });
            await page.evaluate(({ smp }) => {
                window.showView('gameView');
                const q = window.generateQuestionFor({ category: smp.cat, skill: smp.skill, opts: smp.opts, seed: 11 });
                return import('./js/modules/refline-screen.js').then((m) => m.syncPracticeRefLine(q, { categoryId: smp.cat, skillId: smp.skill, opts: smp.opts }));
            }, { smp });
            await hideOverlays(page);
            const host = await page.$('#mqRefLine');
            if (host) {
                const box = await host.boundingBox();
                const card = await (await page.$('#questionCard')).boundingBox();
                await page.screenshot({ path: path.join(SHOT_DIR, `${smp.id}-card-${w}.png`), clip: { x: 0, y: Math.max(0, box.y - 10), width: w, height: Math.min(700, box.height + (card ? card.height : 300) + 30) } });
            }
            await page.evaluate(({ smp }) => {
                window.showView('worksheetView');
                const qs = [0, 1, 2, 3, 4, 5].map((i) => window.generateQuestionFor({ category: smp.cat, skill: smp.skill, opts: smp.opts, seed: 20 + i }));
                return import('./js/modules/refline-screen.js').then((m) => m.syncWorksheetRefLine(qs, { categoryId: smp.cat, skillId: smp.skill, opts: smp.opts }));
            }, { smp });
            const wh = await page.$('#mqWsRefLine');
            if (wh) {
                const box = await wh.boundingBox();
                await page.screenshot({ path: path.join(SHOT_DIR, `${smp.id}-worksheet-${w}.png`), clip: { x: 0, y: Math.max(0, box.y - 10), width: w, height: Math.min(600, box.height + 300) } });
            }
        }
    }
    // the option panel, with the disclosure open and a warning
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1.5 });
    await page.evaluate(() => {
        window.showView('homeView');
        const d = document.createElement('div');
        d.id = 'nlPanelShot';
        d.style.cssText = 'position:fixed;left:20px;top:20px;width:420px;max-height:860px;overflow:auto;z-index:99999;background:var(--bg-card,#fff);padding:10px;border:1px solid #888';
        document.body.appendChild(d);
    });
    await page.evaluate(async () => {
        const ui = await import('./js/modules/skill-options-ui.js');
        const so = await import('./js/modules/skill-options.js');
        ui.skoNlineOpen(true);
        const cur = so.normalizeOptions('addition', 'add_facts', { nlOn: true, nlFrom: 0, nlTo: 5 });
        const defs = so.offeredOptionsFor('addition', 'add_facts');
        const handlers = { set: () => '', toggle: () => '', all: () => '' };
        document.getElementById('nlPanelShot').innerHTML = ui.groupedOptionRowsHTML(defs, cur, (def) => `<div style="padding:7px 0;border-bottom:1px solid var(--border);">${ui.optionControlHTML(def, cur, '#8b5cf6', handlers)}<div style="font-size:0.7rem;color:var(--text-dim);margin-top:3px;">${ui.optionHelpLine(def)}</div></div>`);
    });
    const panel = await page.$('#nlPanelShot');
    await panel.screenshot({ path: path.join(SHOT_DIR, 'option-panel.png') });
    await page.evaluate(async () => {
        const ui = await import('./js/modules/skill-options-ui.js');
        ui.skoNlineOpen(false);
        const so = await import('./js/modules/skill-options.js');
        const cur = so.normalizeOptions('addition', 'add_facts', {});
        const handlers = { set: () => '', toggle: () => '', all: () => '' };
        document.getElementById('nlPanelShot').innerHTML = ui.groupedOptionRowsHTML(so.offeredOptionsFor('addition', 'add_facts'), cur, (def) => `<div style="padding:7px 0;border-bottom:1px solid var(--border);">${ui.optionControlHTML(def, cur, '#8b5cf6', handlers)}</div>`);
    });
    await panel.screenshot({ path: path.join(SHOT_DIR, 'option-panel-closed.png') });
    log(`  proof images in ${path.relative(ROOT, SHOT_DIR)}`);
}
