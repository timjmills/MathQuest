// ws-ansbox-shape — does the answer-box option DRAW what it says, on paper, on the key and on screen?
// (ansBox lane rebuild r2, 2026-10-31; critic r1 design/audit/critic/2026-10-30/ansbox.md)
//
// The r1 verifier passed a broken option because it only asked "is a marker class somewhere in the
// HTML?". This check measures the RENDERED boxes instead (computed borders and geometry in Chrome):
//
//   b  KEY = PUPIL      per cell, the key's answer-place boxes and lines have the same shapes and
//                       places as the pupil page's (the key is a facsimile; no box the pupil lacks)
//   c  DIGIT WIDTH      a digit box is at least as wide as the question's digit track (a grid
//                       track, or the advance of one digit at the question's size)
//   d  KEY DIGIT SIZE   the key writes its answer digits at >= 0.9 x the question's digit size
//   e  SAME COUNT       every cell of one section draws the same number of digit boxes (SL-2)
//   f  PANEL            no two OFFERED values of the option draw the same answer place, on the
//                       pupil page, the key, the practice card, the online worksheet or the quiz
//                       (screen boxes compared UNFOCUSED: no caret, no next-box pulse, no animation)
//
//   node tests/scripts/ws-ansbox-shape.cjs                       # the sample below, every check
//   node tests/scripts/ws-ansbox-shape.cjs --skill add_facts,addition:add_10_regroup --check b,f
//   node tests/scripts/ws-ansbox-shape.cjs --sizes S,L --shots <dir>   # also save cropped PNGs
//   node tests/scripts/ws-ansbox-shape.cjs --verbose
//   node tests/scripts/ws-ansbox-shape.cjs --fixture tests/fixtures/precritic/ansbox/x.html --check c   # a saved sheet (backtests)
//   node tests/scripts/ws-ansbox-shape.cjs --save-fixture out.html --skill add_facts --value digit --sizes L
//
// Checks b and f run on every offered value (automatic included); c, d and e on the teacher's values: the
// automatic pages are held byte-identical by ws-ansbox-default-parity.mjs (a passed skill's review page deals
// legacy items), and their pre-existing findings are listed in design/status/ansbox.md. Pages at each size.
// f excuses one pair only: "per digit" and "one box" on a screen strip of ONE input (a one-place answer is one box). Output: `ws-ansbox-shape: OK` or
// `ws-ansbox-shape: FAIL (n)`; exit 1 on FAIL.
const fs = require('fs');
const path = require('path');
const { open } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const has = (k) => process.argv.includes('--' + k);
const SAMPLE = [
    'addition:add_10_regroup', 'addition:add_10_mixed', 'subtraction:sub_20_regroup', 'addition:equal_sign',   // legacy stack
    'addition:add_100_regroup', 'subtraction:sub_1k_regroup',                                                // kit stack
    'addition:add_facts', 'multiplication:mult_facts', 'subtraction:subtract',                               // fact
    'division:div_facts', 'addition:add_sub_10s', 'division:divide',                                          // equation
    'multiplication:multiply', 'subtraction:sub_facts',                                                       // legacy fact
];
const CHECKS = new Set((arg('check', 'b,c,d,e,f') || '').split(',').map((s) => s.trim()).filter(Boolean));
const SIZES = (arg('sizes', 'S,L') || 'S,L').split(',').map((s) => s.trim().toUpperCase());
const SHOTS = arg('shots', null);
const VERBOSE = has('verbose');

/** In the page: the live category:skill keys for the --skill tokens. */
async function resolveSkills(page, tokens) {
    return page.evaluate((tokens) => {
        const out = [];
        for (const t of tokens) {
            if (t.includes(':')) { out.push(t); continue; }
            for (const [c, l] of Object.entries(window.SKILLS)) if ((l || []).some((s) => s && s.v === t && !s.retired)) { out.push(`${c}:${t}`); break; }
        }
        return out;
    }, tokens);
}

// ------------------------------------------------------------------------------------------------
// IN THE PAGE: measuring helpers (installed once as window.__ab)
// ------------------------------------------------------------------------------------------------
function installHelpers() {
    const visibleSide = (cs, s) => cs[`border${s}Style`] !== 'none' && cs[`border${s}Style`] !== 'hidden' && parseFloat(cs[`border${s}Width`]) > 0.2
        && !/rgba\(\d+, \d+, \d+, 0\)|transparent/.test(cs[`border${s}Color`]);
    const isDigitText = (s) => /^[0-9]$/.test(s);
    /**
     * The answer-place shapes of one cell, relative to its box: `box` = all four edges drawn (by
     * borders, or by inset box-shadow edges on screen), `line` = only the bottom edge. Chrome only
     * (the cell's own border and the number tab are not answer places).
     */
    function shapes(cell, w) {
        const cb = cell.getBoundingClientRect();
        const out = [];
        for (const e of [cell, ...cell.querySelectorAll('*')]) {
            if (e === cell || e.closest('.ws-tab, [data-ws-label="tab"], svg, .mq-wsbar, .hint-popup')) continue;
            const cs = w.getComputedStyle(e);
            if (cs.display === 'none' || cs.visibility === 'hidden') continue;
            const b = e.getBoundingClientRect();
            if (b.width < 6 || b.height < 6) continue;
            let sides = ['Top', 'Right', 'Bottom', 'Left'].map((s) => (visibleSide(cs, s) ? 1 : 0));
            // screen strips draw their edges with inset shadows (screen-cell.css): read them as edges
            const sh = cs.boxShadow || '';
            if (sh && sh !== 'none') {
                for (const m of sh.matchAll(/rgba?\(([^)]*)\)\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+inset/g)) {
                    const alpha = m[1].split(',').length === 4 ? parseFloat(m[1].split(',')[3]) : 1;
                    if (alpha === 0) continue;
                    const x = parseFloat(m[2]), y = parseFloat(m[3]), spread = parseFloat(m[5]);
                    if (spread > 0 && !x && !y) sides = [1, 1, 1, 1];
                    if (y > 0) sides[0] = 1; if (y < 0) sides[2] = 1; if (x > 0) sides[3] = 1; if (x < 0) sides[1] = 1;
                }
            }
            const n = sides.reduce((a, c) => a + c, 0);
            if (!n) continue;
            if (e.classList.contains('rule') || (n === 1 && sides[0] === 1)) continue;   // a sum rule (top edge only)
            const kind = n === 1 && sides[2] ? 'line' : n >= 3 || (sides[0] && sides[2]) ? 'box' : null;
            if (!kind) continue;
            out.push({ kind, x: b.left - cb.left, y: b.top - cb.top, w: b.width, h: b.height, sides: sides.join(''), el: e, input: e.tagName === 'INPUT' });
        }
        return out;
    }
    /** Runs of >= 2 boxes side by side (same row, touching): the digit boxes. */
    function digitBoxes(list, minH = 10, aboveY = -Infinity) {
        // answer digit boxes are at least ~0.8 of the question's digit size tall, and never above the question's
        // first digit: a regroup / carry strip is not an answer place (it would make a regrouping item count more)
        const boxes = list.filter((s) => s.kind === 'box' && s.h >= minH && s.y + s.h > aboveY + 2).sort((a, b) => a.y - b.y || a.x - b.x);
        const used = new Set(); const out = [];
        for (let i = 0; i < boxes.length; i++) {
            const run = [boxes[i]];
            for (let j = 0; j < boxes.length; j++) {
                const last = run[run.length - 1], c = boxes[j];
                if (run.includes(c)) continue;
                if (Math.abs(c.y - last.y) <= 2 && Math.abs(c.h - last.h) <= 2 && Math.abs(c.x - (last.x + last.w)) <= 3) { run.push(c); j = -1; }
            }
            if (run.length >= 2) for (const r of run) if (!used.has(r)) { used.add(r); out.push(r); }
        }
        // a box that CONTAINS a digit run is the strip's outline, not a box of its own
        return out;
    }
    /** The question's digit size (px): the largest digit glyph outside the tab and the key's ink. */
    function questionDigitPx(cell, w) {
        let best = 0, track = 0, top = Infinity;
        const tw = cell.ownerDocument.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
        let t;
        while ((t = tw.nextNode())) {
            const s = t.textContent.trim(); const el = t.parentElement;
            if (!s || !/\d/.test(s) || !el || el.closest('.ws-tab, [data-ws-label="tab"], [data-ws-key-ans], [data-ws-ink], .mq-wsbar, .hint-popup, input, .rg, .ws-regroup')) continue;
            const cs = w.getComputedStyle(el);
            if (cs.visibility === 'hidden' || cs.display === 'none') continue;
            const px = parseFloat(cs.fontSize);
            if (px > best) best = px;
            const rb = el.getBoundingClientRect(); if (rb.width) top = Math.min(top, rb.top - cell.getBoundingClientRect().top);
            // a grid track holding one digit: its width is the digit column
            if (isDigitText(s) && el.parentElement && w.getComputedStyle(el.parentElement).display === 'grid') track = Math.max(track, el.getBoundingClientRect().width);
        }
        if (!track && best) {   // no grid: the advance of one digit at the question's size
            const p = cell.ownerDocument.createElement('span');
            p.style.cssText = `position:absolute;visibility:hidden;font-size:${best}px;font-family:Andika,sans-serif;font-variant-numeric:tabular-nums;white-space:pre`;
            p.textContent = '0'; cell.appendChild(p); track = p.getBoundingClientRect().width; p.remove();
        }
        return { px: best, track, top };
    }
    /** The key's answer digits: the largest font of a digit written in key ink in the cell. */
    function keyDigitPx(cell, w) {
        let best = 0;
        const tw = cell.ownerDocument.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
        let t;
        while ((t = tw.nextNode())) {
            const s = t.textContent.trim(); const el = t.parentElement;
            if (!s || !/^[\d,.\s]+$/.test(s) || !el || !el.closest('[data-ws-key-ans], [data-ws-ink="solid"]') || el.closest('.ws-tab, .rg, .ws-regroup')) continue;
            const r = el.getBoundingClientRect(); if (r.width < 1) continue;
            best = Math.max(best, parseFloat(w.getComputedStyle(el).fontSize));
        }
        return best;
    }
    const sig = (list) => list.map((s) => `${s.kind}:${Math.round(s.x / 2)}:${Math.round(s.y / 2)}:${Math.round(s.w / 2)}:${Math.round(s.h / 2)}`).sort().join(' ');
    window.__ab = { shapes, digitBoxes, questionDigitPx, keyDigitPx, sig };
}

/** One sheet at one size: per-cell measures for pupil and key. */
async function measureSheet(page, key, opts, size, docHtml = null) {
    return page.evaluate(async (key, opts, size, docHtml) => {
        let doc = docHtml;
        if (!doc) {
            const [categoryId, skillId] = key.split(':');
            const rs = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId, skillId, opts }], count: 6, columns: 'auto' }], size, seed: 777, key: true });
            doc = window.sheetDocument(rs.docHtml, 'ab');
        } else doc = doc.replace(/<head>/i, `<head><base href="${location.origin}/">`);   // a saved fixture: its stylesheets relative to the repo
        let f = document.getElementById('__abframe');
        if (!f) { f = document.createElement('iframe'); f.id = '__abframe'; f.style.cssText = 'position:absolute;left:-4000px;top:0;width:1000px;height:3000px;border:0'; document.body.appendChild(f); }
        f.srcdoc = doc; await new Promise((ok) => { f.onload = ok; });
        const d = f.contentDocument, w = f.contentWindow;
        try { await d.fonts.ready; } catch (e) { /* fonts optional */ }
        const A = window.__ab;
        const top = (pg) => (pg ? [...pg.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]')) : []);
        const pupilCells = [...d.querySelectorAll('section.ws-page[data-ws-mode="print"]')].flatMap(top);
        const keyCells = [...d.querySelectorAll('section.ws-page[data-ws-mode="key"]')].flatMap(top);
        const cell = (c, isKey) => {
            const sh = A.shapes(c, w);
            const q = A.questionDigitPx(c, w);
            const dig = A.digitBoxes(sh, Math.max(10, 0.8 * (q.px || 0)), q.top);
            return { sig: A.sig(sh), n: sh.length, digits: dig.length, minDigitW: dig.length ? Math.min(...dig.map((s) => s.w)) : null, qpx: q.px, track: q.track, kpx: isKey ? A.keyDigitPx(c, w) : null };
        };
        return { pupil: pupilCells.map((c) => cell(c, false)), key: keyCells.map((c) => cell(c, true)) };
    }, key, opts, size, docHtml);
}

/** One screen host, unfocused: the answer-place shapes of the first question. */
async function measureScreen(page, key, opts, host) {
    const out = await page.evaluate(async (key, opts, host) => {
        const [c, k] = key.split(':');
        const st = window.state;
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        let sel;
        try {
            window.clearSetOptions({ silent: true });
            if (host === 'card') {
                if (Object.keys(opts).length) window.setSetOptions(c, k, opts, { silent: true });
                window.__wsReseed && window.__wsReseed(5);
                st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false; st.skillOptions = null; st.range = 100;
                window.showView('gameView'); st.currentQ = window.generateQuestion(); window.renderQuestion();
                await sleep(300); sel = '#visualAid';
            } else if (host === 'worksheet') {
                if (Object.keys(opts).length) window.setSetOptions(c, k, opts, { silent: true });
                window.__wsReseed && window.__wsReseed(7);
                st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 4; st.range = 100;
                window.initWorksheet(); await sleep(900); sel = '#ws_card_0 .ws-cell, #ws_card_0';
            } else {
                const q = window.generateQuestionFor({ category: c, skill: k, seed: 905, itemIndex: 0, opts });
                const test = { id: null, name: 'Boxes', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions: [{ id: 0, skillId: k, points: 1, questionData: window.quizQuestionData(q) }] }],
                    settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
                window.handleQuizURL(window.compressTestForURL(test));
                const name = document.getElementById('qtStudentName'); if (name) { name.value = 'A'; name.dispatchEvent(new Event('input')); }
                window.startQuizTest(); await sleep(500); sel = '#quizTakeView .qt-cell';
            }
            const el = document.querySelector(sel);
            if (!el) return { error: `no ${sel}` };
            // `animation: none !important` loses to the next-box glow's own `!important` (higher specificity):
            // every running animation is frozen at its start before each read, so a read is deterministic
            const read = () => {
                try { document.getAnimations().forEach((a) => { a.pause(); a.currentTime = 0; }); } catch (e) { /* no WAAPI */ }
                const sh = window.__ab.shapes(el, window).filter((s) => s.input || s.kind === 'line' || s.el.closest('[data-ws-slot], .ab, .mq-ansoff, .ws-stack'));
                const inputs = [...el.querySelectorAll('input')].filter((e) => e.type !== 'hidden' && e.getBoundingClientRect().width > 0 && !e.classList.contains('mq-carry'));
                const look = inputs.map((e) => { const cs = getComputedStyle(e); return ['Top', 'Right', 'Bottom', 'Left'].map((s) => `${cs[`border${s}Width`]} ${cs[`border${s}Style`]} ${cs[`border${s}Color`]}`).join(',') + `|${cs.boxShadow}|${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}|${cs.backgroundColor}|${Math.round(e.getBoundingClientRect().width)}`; });
                return { sig: window.__ab.sig(sh) + ' || ' + look.join(' ; '), inputs: inputs.length };
            };
            // AS SHOWN: the pupil's first view (the next box marked), animations frozen at rest
            await sleep(60);
            const shown = read();
            // AT REST, UNFOCUSED: no caret, no next-box pulse (active-box.js skips [data-mq-no-pulse])
            el.setAttribute('data-mq-no-pulse', '1');
            if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
            if (window.refreshActiveBox) window.refreshActiveBox();
            document.querySelectorAll('.mq-active-box').forEach((e) => e.classList.remove('mq-active-box'));
            await sleep(60);
            const rest = read();
            el.removeAttribute('data-mq-no-pulse');
            return { shown: shown.sig, rest: rest.sig, inputs: rest.inputs };
        } catch (e) { return { error: String(e && e.message || e) }; }
        finally {
            try { window.clearSetOptions({ silent: true }); st.quizMode = false; window.showView('homeView'); } catch (e) { /* best effort */ }
        }
    }, key, opts, host);
    return out;
}

async function shot(page, key, opts, size, file) {
    // the first three cells of the pupil page above the first three of the key
    const rects = await page.evaluate(async (key, opts, size) => {
        const [categoryId, skillId] = key.split(':');
        const rs = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId, skillId, opts }], count: 6, columns: 'auto' }], size, seed: 777, key: true });
        let f = document.getElementById('__abshot');
        if (!f) { f = document.createElement('iframe'); f.id = '__abshot'; f.style.cssText = 'position:absolute;left:0;top:0;width:1000px;height:3000px;border:0;z-index:2147483647;background:#fff'; document.body.appendChild(f); }
        f.srcdoc = window.sheetDocument(rs.docHtml, 'ab'); await new Promise((ok) => { f.onload = ok; });
        const d = f.contentDocument; try { await d.fonts.ready; } catch (e) { /* */ }
        f.style.height = d.documentElement.scrollHeight + 'px';
        await new Promise((r) => setTimeout(r, 80));
        const top = (pg) => (pg ? [...pg.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]')) : []);
        const box = (cells) => { const r = cells.slice(0, 3).map((c) => c.getBoundingClientRect()); if (!r.length) return null; const x0 = Math.min(...r.map((b) => b.left)), y0 = Math.min(...r.map((b) => b.top)); return { x: x0 - 3, y: y0 - 3, w: Math.max(...r.map((b) => b.right)) - x0 + 6, h: Math.max(...r.map((b) => b.bottom)) - y0 + 6 }; };
        return { p: box(top(d.querySelector('section.ws-page[data-ws-mode="print"]'))), k: box(top(d.querySelector('section.ws-page[data-ws-mode="key"]'))) };
    }, key, opts, size);
    for (const [which, r] of Object.entries(rects)) {
        if (!r) continue;
        await page.screenshot({ path: file.replace(/\.png$/, `-${which === 'p' ? 'pupil' : 'key'}.png`), clip: { x: Math.max(0, r.x), y: Math.max(0, r.y), width: r.w, height: r.h }, captureBeyondViewport: true });
    }
    await page.evaluate(() => { const f = document.getElementById('__abshot'); if (f) f.remove(); });
}

(async () => {
    const app = await open({ seed: 1, viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
    const { page } = app;
    const fails = [];
    const fail = (msg) => { fails.push(msg); };
    try {
        await page.evaluate(installHelpers);
        await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' });
        // --save-fixture <file> --skill k --value v --size S: write one real sheet (pupil + key) as a fixture document
        if (arg('save-fixture', null)) {
            const [k0] = await resolveSkills(page, [arg('skill', '')]);
            const v0 = arg('value', 'null');
            const html = await page.evaluate(async (key, v, size) => {
                const [categoryId, skillId] = key.split(':');
                const rs = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId, skillId, opts: v === 'null' ? {} : { ansBox: v } }], count: 6, columns: 'auto' }], size, seed: 777, key: true });
                return window.sheetDocument(rs.docHtml, 'ab fixture').split(location.origin + '/').join('');
            }, k0, v0, SIZES[0]);
            fs.writeFileSync(arg('save-fixture'), html);
            console.log(`wrote ${arg('save-fixture')} (${k0} ansBox=${v0} size ${SIZES[0]})`);
            await app.close(); process.exit(0);
        }
        // --fixture <file.html>: checks b-e on a saved sheet document (ws-backtest's fixture rows)
        if (arg('fixture', null)) {
            const m = await measureSheet(page, 'fixture', {}, 'L', fs.readFileSync(arg('fixture'), 'utf8'));
            const where = path.basename(arg('fixture'));
            if (!m.pupil.length) fail(`${where}: no cells`);
            if (CHECKS.has('b')) m.key.forEach((kc, i) => { const pc = m.pupil[i]; if (pc && kc.sig !== pc.sig) fail(`b ${where} cell ${i + 1}: the key's answer place is not the pupil's`); });
            if (CHECKS.has('c')) m.pupil.forEach((pc, i) => { if (pc.minDigitW != null && pc.track && pc.minDigitW < pc.track - 1) fail(`c ${where} cell ${i + 1}: a digit box is ${pc.minDigitW.toFixed(1)}px wide, narrower than the digit track ${pc.track.toFixed(1)}px`); });
            if (CHECKS.has('d')) m.key.forEach((kc, i) => { if (kc.kpx && kc.qpx && kc.kpx < 0.9 * kc.qpx) fail(`d ${where} cell ${i + 1}: key digits ${kc.kpx.toFixed(1)}px < 0.9 x ${kc.qpx.toFixed(1)}px`); });
            if (CHECKS.has('e')) { const counts = [...new Set(m.pupil.map((x) => x.digits))]; if (counts.length > 1) fail(`e ${where}: ${counts.join(' / ')} digit boxes in one section`); }
            console.log(`${where}: ${m.pupil.length} pupil cell(s), ${m.key.length} key cell(s), digit boxes ${m.pupil.map((x) => x.digits).join(',')}`);
        }
        const tokens = (arg('skill', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
        const skills = arg('fixture', null) ? [] : await resolveSkills(page, tokens.length ? tokens : SAMPLE);
        if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
        for (const key of skills) {
            const [c, k] = key.split(':');
            const values = await page.evaluate((c, k) => {
                const def = window.offeredOptionsFor(c, k).find((d) => d.id === 'ansBox');
                return def ? def.values.map((x) => ({ v: x.v, l: x.l })) : null;
            }, c, k);
            if (!values) { fail(`${key}: the Answer boxes option is not offered`); continue; }
            const per = {};   // value -> host -> signature
            for (const { v, l } of values) {
                const opts = v === null ? {} : { ansBox: v };
                const name = v === null ? 'auto' : v;
                per[name] = { label: l };
                for (const size of SIZES) {
                    const m = await measureSheet(page, key, opts, size);
                    per[name][`pupil-${size}`] = m.pupil.map((x) => x.sig).join(' | ');
                    per[name][`key-${size}`] = m.key.map((x) => x.sig).join(' | ');
                    const where = `${key} ${name} ${size}`;
                    if (!m.pupil.length || !m.key.length) { fail(`${where}: no cells (pupil ${m.pupil.length}, key ${m.key.length})`); continue; }
                    if (CHECKS.has('b')) m.key.forEach((kc, i) => {
                        const pc = m.pupil[i]; if (!pc) return;
                        if (kc.sig !== pc.sig) fail(`b ${where} cell ${i + 1}: the key's answer place is not the pupil's (pupil [${pc.sig}] key [${kc.sig}])`);
                    });
                    if (CHECKS.has('c') && v !== null) m.pupil.forEach((pc, i) => {
                        if (pc.minDigitW != null && pc.track && pc.minDigitW < pc.track - 1) fail(`c ${where} cell ${i + 1}: a digit box is ${pc.minDigitW.toFixed(1)}px wide, narrower than the digit track ${pc.track.toFixed(1)}px`);
                    });
                    // d holds a teacher's value (critic r1 #4); the automatic page is guarded byte for byte by ws-ansbox-default-parity
                    if (CHECKS.has('d') && v !== null) m.key.forEach((kc, i) => {
                        if (kc.kpx && kc.qpx && kc.kpx < 0.9 * kc.qpx) fail(`d ${where} cell ${i + 1}: the key writes its answer at ${kc.kpx.toFixed(1)}px, under 0.9 x the question's ${kc.qpx.toFixed(1)}px digits`);
                        if (!kc.kpx) fail(`d ${where} cell ${i + 1}: no answer digit written in key ink`);
                    });
                    if (CHECKS.has('e') && v !== null) {
                        const counts = [...new Set(m.pupil.map((x) => x.digits))];
                        if (counts.length > 1) fail(`e ${where}: the section's cells draw ${counts.join(' / ')} digit boxes (SL-2: one band per section)`);
                    }
                    if (VERBOSE) console.log(`  ${where}: cells ${m.pupil.length}, digit boxes ${m.pupil.map((x) => x.digits).join(',')}, q ${m.pupil[0].qpx}px track ${m.pupil[0].track && m.pupil[0].track.toFixed(1)}, key ${m.key.map((x) => x.kpx).join(',')}`);
                    if (SHOTS) await shot(page, key, opts, size, path.join(SHOTS, `${k}-${name}-${size}.png`));
                }
                if (CHECKS.has('f')) for (const host of ['card', 'worksheet', 'quiz']) {
                    const s = await measureScreen(page, key, opts, host);
                    if (s.error) { fail(`f ${key} ${name} ${host}: ${s.error}`); continue; }
                    per[name][`${host}-shown`] = s.shown;
                    per[name][`${host}-rest`] = s.rest;
                    per[name][`${host}-inputs`] = s.inputs;
                    if (VERBOSE) console.log(`  ${key} ${name} ${host}: ${s.inputs} input(s) shown ${s.shown.slice(0, 200)}\n      rest ${s.rest.slice(0, 200)}`);
                }
            }
            if (CHECKS.has('f')) {
                const names = Object.keys(per);
                const hosts = Object.keys(per[names[0]] || {}).filter((h) => h !== 'label' && !/-inputs$/.test(h));
                for (const h of hosts) for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) {
                    const a = names[i], b = names[j];
                    const onePlace = /^(card|worksheet|quiz)-/.test(h) && per[a][`${h.split('-')[0]}-inputs`] === 1 && per[b][`${h.split('-')[0]}-inputs`] === 1
                        && [a, b].includes('one') && [a, b].some((x) => x === 'digit' || (x === 'auto' && /per digit/.test(per[x].label)));
                    if (per[a][h] !== undefined && per[a][h] === per[b][h] && !onePlace) fail(`f ${key} ${h}: "${per[a].label}" and "${per[b].label}" draw the same answer place`);
                }
            }
            console.log(`${key} measured (${values.map((x) => (x.v === null ? 'auto' : x.v)).join(' / ')})`);
        }
    } catch (e) { fail(`crashed: ${e && e.stack || e}`); }
    finally { await app.close(); }
    for (const f of fails) console.log(`  FAIL ${f}`);
    console.log(fails.length ? `ws-ansbox-shape: FAIL (${fails.length})` : 'ws-ansbox-shape: OK');
    process.exit(fails.length ? 1 : 0);
})();
