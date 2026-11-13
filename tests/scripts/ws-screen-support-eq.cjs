// ws-screen-support-eq — a fact skill's supports on SCREEN are paper's supports (lane lf-ops, critic div_facts screen r1).
//
// Three rules, each judged per support value the skill offers (its `support` option's render values), on the practice
// card (1280, 820, 390), the online worksheet (1280, 820) and the quiz (1280):
//   SCREEN-SUPPORT-EQ    (D1, D2) every screen cell draws the SAME support structure as the paper cell of the same
//                        support: the ÷ array a framed TRUE array (the section frame's size, the item's rows x cols, an
//                        empty frame on 0 ÷ n), the touch tally the same count, the skip strip the same terms, the think
//                        box; a cell that draws nothing where paper draws the support (0 ÷ n) fails.
//   SCREEN-CUE-SIZE      (D3) the text a cue carries (.ws-factcue: skip strip numbers, think box) stands to the fact's digit at
//                        >= 0.9 x paper's ratio (paper's ratio measured on the Independent page at M: about 0.38).
//   SCREEN-SUPPORT-PLACE (D4) on one online worksheet the support stands at ONE place (beside or under the fact) in
//                        every card.
//   ARRAY-ORIENT         (owner 2026-11-13, "arrays landscape so they can be bigger") a ÷ fact's framed array whose item has
//                        2 or more rows (the divisor) is drawn LANDSCAPE: its frame's drawn width >= its height, on every
//                        screen host and on the paper Independent page at S, M and L (0 ÷ n: the empty frame too).
//   ARRAY-DOT-MIN        (same ruling) the screen array dot stands to the fact digit at >= paper's ratio (CUE-SIZE's
//                        convention, paper measured on the Independent page at M): never smaller than the print dot.
//
//   node tests/scripts/ws-screen-support-eq.cjs                          # division:div_facts
//   node tests/scripts/ws-screen-support-eq.cjs --skills division:div_facts --only EQ,CUE,PLACE,ORIENT,DOTMIN
//   node tests/scripts/ws-screen-support-eq.cjs --self-test             # the pure rules, no browser
// A skill with no supports model is reported "no supports" (nothing to compare). Prints one line per finding, then
// `ws-screen-support-eq: OK` or `FAIL (n)`; exits 1 on FAIL.
const NAME = 'ws-screen-support-eq';
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && i + 1 < argv.length ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);

/* ------------------------------------------------------------------ pure rules */

/** 'beside' | 'under' from the problem's and the support's rects ({top, bottom, left, right}). */
function placeOf(prob, pane) {
    if (!prob || !pane) return null;
    return pane.top >= prob.bottom - 2 ? 'under' : 'beside';
}
/** The support signature a cell's support drawing carries (data read off the DOM, see sigInPage). */
function sigKey(s) {
    if (!s) return 'none';
    if (s.kind === 'frame-array') return `frame-array ${s.frame}`;
    if (s.kind === 'tally') return `tally ${s.n}`;
    if (s.kind === 'skip') return `skip ${s.n}`;
    return s.kind;
}
/** EQ: does a screen item's signature equal paper's, and is the array's content the item's own? */
function eqFinding(id, paper, screen, item) {
    const pk = sigKey(paper), sk = sigKey(screen);
    if (pk !== sk) return `${id}: screen draws "${sk}", paper "${pk}"`;
    if (screen && screen.kind === 'frame-array' && item) {
        // (owner 2026-11-13: landscape - the divisor's rows of the quotient's dots)
        const want = item.a === 0 ? 'no dots' : `array, ${item.b} rows of ${item.a / item.b}`;
        if (screen.label !== want) return `${id}: ${item.a} ÷ ${item.b} array "${screen.label}", want "${want}"`;
    }
    return null;
}
/** CUE: the screen ratio (cue text px / fact digit px) against paper's. */
function cueFinding(id, paperRatio, screenRatio) {
    if (!(paperRatio > 0) || !(screenRatio > 0)) return null;
    return screenRatio < 0.9 * paperRatio ? `${id}: cue text ${screenRatio.toFixed(2)} x the fact digit, paper ${paperRatio.toFixed(2)} (needs >= ${(0.9 * paperRatio).toFixed(2)})` : null;
}
/** ORIENT: a framed array of 2 or more rows (the item's divisor) is drawn landscape (width >= height). */
function orientFinding(id, sig, item) {
    if (!sig || sig.kind !== 'frame-array' || !item || !(item.b >= 2) || !(sig.wPx > 0)) return null;
    return sig.wPx + 0.5 < sig.hPx ? `${id}: ${item.a} ÷ ${item.b} array ${sig.wPx.toFixed(0)} x ${sig.hPx.toFixed(0)} px is portrait (want width >= height)` : null;
}
/** DOTMIN: the screen dot (diameter / fact digit) against paper's. */
function dotFinding(id, paperRatio, screenRatio) {
    if (!(paperRatio > 0) || !(screenRatio > 0)) return null;
    return screenRatio < 0.98 * paperRatio ? `${id}: array dot ${screenRatio.toFixed(3)} x the fact digit, paper ${paperRatio.toFixed(3)} (never smaller than the print dot)` : null;
}
/** PLACE: one place across a worksheet's cards. */
function placeFinding(id, places) {
    const set = [...new Set(places.filter(Boolean))];
    return set.length > 1 ? `${id}: worksheet places ${places.map((p, i) => `${i + 1}:${p}`).join(' ')}` : null;
}

function selfTest() {
    const bad = []; let n = 0;
    const eq = (name, got, want) => { n++; if (JSON.stringify(got) !== JSON.stringify(want)) bad.push(`${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); };
    eq('under', placeOf({ top: 0, bottom: 50 }, { top: 60, bottom: 90 }), 'under');
    eq('beside', placeOf({ top: 0, bottom: 50 }, { top: 0, bottom: 90 }), 'beside');
    eq('array same', eqFinding('array', { kind: 'frame-array', frame: '12.0x34.6' }, { kind: 'frame-array', frame: '12.0x34.6', label: 'array, 4 rows of 3' }, { a: 12, b: 4 }), null);
    eq('array loose (D1)', !!eqFinding('array', { kind: 'frame-array', frame: '12.0x34.6' }, { kind: 'pane' }, { a: 12, b: 4 }), true);
    eq('array none on 0 (D2)', !!eqFinding('array', { kind: 'frame-array', frame: '12.0x34.6' }, null, { a: 0, b: 2 }), true);
    eq('array empty frame on 0', eqFinding('array', { kind: 'frame-array', frame: '12.0x34.6' }, { kind: 'frame-array', frame: '12.0x34.6', label: 'no dots' }, { a: 0, b: 2 }), null);
    eq('array wrong rows', !!eqFinding('array', { kind: 'frame-array', frame: 'f' }, { kind: 'frame-array', frame: 'f', label: 'array, 2 rows of 4' }, { a: 12, b: 4 }), true);
    eq('array portrait rows (old)', !!eqFinding('array', { kind: 'frame-array', frame: 'f' }, { kind: 'frame-array', frame: 'f', label: 'array, 3 rows of 4' }, { a: 12, b: 4 }), true);
    eq('orient portrait', !!orientFinding('array', { kind: 'frame-array', wPx: 40, hPx: 120 }, { a: 28, b: 4 }), true);
    eq('orient landscape', orientFinding('array', { kind: 'frame-array', wPx: 160, hPx: 50 }, { a: 28, b: 4 }), null);
    eq('orient empty frame portrait', !!orientFinding('array', { kind: 'frame-array', wPx: 40, hPx: 120 }, { a: 0, b: 3 }), true);
    eq('orient 1 row free', orientFinding('array', { kind: 'frame-array', wPx: 40, hPx: 120 }, { a: 7, b: 1 }), null);
    eq('dot small', !!dotFinding('array', 0.33, 0.15), true);
    eq('dot ok', dotFinding('array', 0.33, 0.40), null);
    eq('tally count', !!eqFinding('touch', { kind: 'tally', n: 12 }, { kind: 'tally', n: 10 }), true);
    eq('cue small (D3)', !!cueFinding('skip', 0.38, 0.20), true);
    eq('cue ok', cueFinding('skip', 0.38, 0.36), null);
    eq('place mixed (D4)', !!placeFinding('touch', ['under', 'beside', 'beside']), true);
    eq('place one', placeFinding('touch', ['beside', 'beside', null]), null);
    for (const b of bad) console.log('  ' + b);
    console.log(`${NAME} --self-test: ${n - bad.length}/${n}`);
    console.log(`${NAME}: ${bad.length ? 'FAIL' : 'OK'}`);
    process.exit(bad.length ? 1 : 0);
}
if (has('self-test')) selfTest();

/* ------------------------------------------------------------------ in the page */

// One function string run in the page: the support signature and cue ratio of every support drawn in `root`'s cells.
function readCellsInPage({ sel, cellSel }) {
    const root = document.querySelector(sel);
    if (!root) return { error: `no ${sel}` };
    const out = [];
    const cells = [...root.querySelectorAll(cellSel)];
    const seen = new Set();
    for (const cell of cells) {
        const eqEl = cell.querySelector('.ws-eq, .ws-fact');
        if (!eqEl || seen.has(eqEl)) continue;
        seen.add(eqEl);
        const label = (eqEl && eqEl.getAttribute('aria-label')) || '';
        const m = /(\d+) divided by (\d+)/.exec(label) || /(\d+)\s*÷\s*(\d+)/.exec(eqEl ? eqEl.textContent : '');
        const item = m ? { a: Number(m[1]), b: Number(m[2]) } : null;
        const digitPx = eqEl ? parseFloat(getComputedStyle(eqEl.querySelector('span') || eqEl).fontSize) : 0;
        const sups = {};
        for (const s of cell.querySelectorAll('.ws-support[data-ws-support-on]')) {
            const id = s.getAttribute('data-ws-support-on');
            const tally = s.querySelector('[data-ws-tally]');
            const skip = s.querySelector('[data-ws-skipstrip]');
            const svg = s.querySelector('svg');
            let sig = { kind: 'other' };
            if (tally) sig = { kind: 'tally', n: Number(tally.getAttribute('data-ws-tally')) };
            else if (skip) sig = { kind: 'skip', n: skip.querySelectorAll('[data-ws-term]').length };
            else if (svg && /^(array, \d+ rows of \d+|no dots)$/.test(svg.getAttribute('aria-label') || '') && svg.firstElementChild && svg.firstElementChild.tagName.toLowerCase() === 'rect') {
                const vb = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
                const br = svg.getBoundingClientRect(), k = br.width / (vb[2] || 1);
                const c0 = svg.querySelector('circle');
                sig = { kind: 'frame-array', frame: `${(vb[2] || 0).toFixed(1)}x${(vb[3] || 0).toFixed(1)}`, label: svg.getAttribute('aria-label'),
                    wPx: br.width, hPx: br.height, dotPx: c0 ? 2 * Number(c0.getAttribute('r')) * k : 0 };
            } else if (svg && /^think/.test(svg.getAttribute('aria-label') || '')) sig = { kind: 'think' };
            else if (id === 'array' && s.querySelector('svg, [data-ws-pane]')) sig = { kind: 'pane' };
            else if (svg) sig = { kind: 'svg:' + ((svg.getAttribute('class') || '').split(/\s+/)[0] || 'svg') };
            // the cue text's rendered font size: SVG units scaled by the drawn width over the viewBox width
            let textPx = 0;
            const texts = [...s.querySelectorAll('.ws-factcue svg text')];
            const csvg = texts.length ? texts[0].closest('svg') : null;
            if (csvg) {
                const vb = (csvg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
                const k = csvg.getBoundingClientRect().width / (vb[2] || 1);
                textPx = Math.max(...texts.map((t) => Number(t.getAttribute('font-size')) * k));
            }
            // where it stands: beside or under the fact
            let place = null;
            const wp = s.closest('.ws-with-pane');
            const pb = wp && wp.querySelector(':scope > .ws-pane-problem');
            if (pb && s.getBoundingClientRect().height > 0) {
                const a = pb.getBoundingClientRect(), b = s.getBoundingClientRect();
                place = b.top >= a.bottom - 2 ? 'under' : 'beside';
            }
            sups[id] = { sig, ratio: textPx && digitPx ? textPx / digitPx : 0, dotRatio: sig.dotPx && digitPx ? sig.dotPx / digitPx : 0, place };
        }
        out.push({ item, sups, digitPx });
    }
    return { cells: out };
}

/* ------------------------------------------------------------------ the run */

(async () => {
    const { open } = require('../lib/ws-harness.cjs');
    const ONLY = (arg('only', 'EQ,CUE,PLACE,ORIENT,DOTMIN') || '').split(',').map((s) => s.trim().toUpperCase());
    const keys = (arg('skills', 'division:div_facts') || '').split(',').map((s) => s.trim()).filter(Boolean);
    const app = await open({ seed: 1 });
    const { page } = app;
    const findings = [];
    let renders = 0;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    try {
        for (const key of keys) {
            const [cat, skill] = key.split(':');
            const def = await page.evaluate(({ cat, skill }) => {
                try {
                    const d = window.offeredOptionsFor(cat, skill).find((x) => x.id === 'support' && x.supportsModel);
                    return d ? { render: d.render, base: d.valueBase || null } : null;
                } catch (e) { return { error: e.message }; }
            }, { cat, skill });
            if (!def) { console.log(`${key}: no supports (nothing to compare)`); continue; }
            if (def.error) { findings.push(`${key}: ${def.error}`); continue; }
            for (const sup of def.render) {
                const opts = Object.assign({ support: [sup] }, (def.base && def.base[sup]) || {});
                const tag = `${key} ${sup}`;
                // ---- paper: the Independent page at M (one frame for the section, the section's tally / strip)
                const paperAt = async (size) => {
                    const paperDoc = await page.evaluate(async ({ cat, skill, opts, size }) => {
                        const r = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId: cat, skillId: skill, opts }] }], size, paper: 'A4', seed: 7, key: false });
                        return window.sheetDocument(r.pupilHtml, 'x', { paper: 'A4' });
                    }, { cat, skill, opts, size });
                    const sh = await app.browser.newPage();
                    await sh.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
                    await sh.goto(page.url());
                    await sh.setContent(paperDoc, { waitUntil: 'networkidle0' });
                    await sh.evaluate(() => document.fonts.ready);
                    const r = await sh.evaluate(readCellsInPage, { sel: 'body', cellSel: '.ws-cell' });
                    await sh.close();
                    renders++;
                    return r;
                };
                const paper = await paperAt('M');
                // ARRAY-ORIENT on paper: the Independent page at S, M and L
                if (ONLY.includes('ORIENT') && sup === 'array') {
                    for (const size of ['S', 'M', 'L']) {
                        const pr = size === 'M' ? paper : await paperAt(size);
                        for (const c of (pr.cells || []).filter((x) => x.item && x.sups[sup])) {
                            const f = orientFinding(sup, c.sups[sup].sig, c.item);
                            if (f) findings.push(`ARRAY-ORIENT ${key} paper ${size} ${c.item.a} ÷ ${c.item.b}: ${f}`);
                        }
                    }
                }
                const pCells = (paper.cells || []).filter((c) => c.sups[sup]);
                if (!pCells.length) { console.log(`${tag}: paper draws no ${sup} (nothing to compare)`); continue; }
                const pSig = pCells[0].sups[sup].sig;
                const pRatio = Math.max(...pCells.map((c) => c.sups[sup].ratio || 0));
                const pDot = Math.max(...pCells.map((c) => c.sups[sup].dotRatio || 0));
                // ---- screen hosts
                const hosts = [];
                await page.evaluate(({ cat, skill, opts }) => { window.clearSetOptions({ silent: true }); window.setSetOptions(cat, skill, opts, { silent: true }); }, { cat, skill, opts });
                // the card: the zero item (0 ÷ n) first when the set deals one, then two more
                const cardItems = await page.evaluate(({ cat, skill, opts }) => {
                    const qs = []; let zero = null;
                    for (let s = 1; s <= 200 && (!zero || qs.length < 2); s++) {
                        const q = window.generateQuestionFor({ category: cat, skill, opts, seed: s });
                        if (!q) continue;
                        if (Number(q.ans) === 0 && !zero) zero = s; else if (qs.length < 2) qs.push(s);
                    }
                    return [zero, ...qs].filter(Boolean);
                }, { cat, skill, opts });
                for (const [w, h] of [[1280, 900], [820, 1180], [390, 844]]) {
                    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
                    for (const seed of cardItems) {
                        const ok = await page.evaluate(({ cat, skill, opts, seed }) => {
                            const st = window.state; st.category = cat; st.skill = skill; st.gameMode = 'practice'; st.isMixedMode = false;
                            window.showView('gameView');
                            const q = window.generateQuestionFor({ category: cat, skill, opts, seed });
                            st.currentQ = q; window.renderQuestion(); return !!q;
                        }, { cat, skill, opts, seed });
                        if (!ok) continue;
                        await sleep(150);
                        hosts.push({ host: `card@${w} seed ${seed}`, r: await page.evaluate(readCellsInPage, { sel: '#questionCard', cellSel: '#questionPaper' }) });
                    }
                }
                for (const [w, h] of [[1280, 900], [820, 1180]]) {
                    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
                    await page.evaluate(() => { if (window.__wsReseed) window.__wsReseed(4242); const st = window.state; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 6; window.initWorksheet(); });
                    await sleep(400);
                    await page.waitForFunction(() => { const g = document.getElementById('worksheetGrid'); return !g || g.dataset.mqLaidOut !== '0'; }, { timeout: 5000 }).catch(() => {});
                    hosts.push({ host: `worksheet@${w}`, worksheet: true, r: await page.evaluate(readCellsInPage, { sel: '#worksheetGrid', cellSel: '.problem-card .ws-card-visual' }) });
                }
                await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
                const quizOk = await page.evaluate(({ cat, skill, opts, seeds }) => {
                    try {
                        const questions = seeds.map((seed, i) => {
                            const q = window.generateQuestionFor({ category: cat, skill, opts, seed });
                            const qd = window.quizQuestionData(q);
                            return { id: i, skillId: skill, points: 1, questionData: qd };
                        });
                        const test = { id: null, name: 'Support check', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }],
                            settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
                        window.handleQuizURL(window.compressTestForURL(test));
                        const nm = document.getElementById('qtStudentName'); nm.value = 'Check'; nm.dispatchEvent(new Event('input'));
                        window.startQuizTest();
                        return true;
                    } catch (e) { return e.message; }
                }, { cat, skill, opts, seeds: cardItems });
                if (quizOk === true) {
                    await sleep(400);
                    hosts.push({ host: 'quiz@1280', r: await page.evaluate(readCellsInPage, { sel: '#quizTakeView', cellSel: '.ws-cell, .mq-scell' }) });
                    await page.evaluate(() => { try { window.state.quizMode = false; } catch (e) {} });
                } else findings.push(`${tag} quiz: ${quizOk}`);
                // ---- judge
                for (const h of hosts) {
                    renders++;
                    if (h.r.error) { findings.push(`${tag} ${h.host}: ${h.r.error}`); continue; }
                    const cells = h.r.cells.filter((c) => c.item);
                    if (!cells.length) { findings.push(`${tag} ${h.host}: no ÷ fact cell rendered`); continue; }
                    for (const c of cells) {
                        const s = c.sups[sup];
                        if (ONLY.includes('EQ')) {
                            const f = eqFinding(sup, pSig, s ? s.sig : null, c.item);
                            if (f) findings.push(`SCREEN-SUPPORT-EQ ${key} ${h.host} ${c.item.a} ÷ ${c.item.b}: ${f}`);
                        }
                        if (ONLY.includes('ORIENT') && s) {
                            const f = orientFinding(sup, s.sig, c.item);
                            if (f) findings.push(`ARRAY-ORIENT ${key} ${h.host} ${c.item.a} ÷ ${c.item.b}: ${f}`);
                        }
                        if (ONLY.includes('DOTMIN') && s && s.dotRatio) {
                            const f = dotFinding(sup, pDot, s.dotRatio);
                            if (f) findings.push(`ARRAY-DOT-MIN ${key} ${h.host} ${c.item.a} ÷ ${c.item.b}: ${f}`);
                        }
                        if (ONLY.includes('CUE') && s && s.ratio) {
                            const f = cueFinding(sup, pRatio, s.ratio);
                            if (f) findings.push(`SCREEN-CUE-SIZE ${key} ${h.host} ${c.item.a} ÷ ${c.item.b}: ${f}`);
                        }
                    }
                    if (ONLY.includes('PLACE') && h.worksheet) {
                        const f = placeFinding(sup, cells.map((c) => (c.sups[sup] ? c.sups[sup].place : null)));
                        if (f) findings.push(`SCREEN-SUPPORT-PLACE ${key} ${h.host}: ${f}`);
                    }
                }
                const sDots = hosts.flatMap((h) => ((h.r && h.r.cells) || []).map((c) => (c.sups[sup] && c.sups[sup].dotRatio) || 0)).filter((x) => x > 0);
                console.log(`${tag}: paper "${sigKey(pSig)}"${pRatio ? ` cue ratio ${pRatio.toFixed(2)}` : ''}${pDot ? ` dot ratio ${pDot.toFixed(3)}` : ''}${sDots.length ? ` (screen ${Math.min(...sDots).toFixed(3)}-${Math.max(...sDots).toFixed(3)})` : ''}; ${hosts.length} screen renders`);
            }
            await page.evaluate(() => { try { window.clearSetOptions({ silent: true }); } catch (e) {} });
        }
        if (app.problems.length) findings.push(`console: ${app.problems.slice(0, 3).map((p) => p.text).join(' | ')}`);
    } catch (e) {
        findings.push(`crash: ${e.message}`);
    } finally { await app.close(); }
    for (const f of findings) console.log('  ' + f);
    if (!renders && !findings.length) { console.log(`${NAME}: ${keys.join(', ')} — no renders`); }
    console.log(`${NAME}: ${findings.length ? `FAIL (${findings.length})` : 'OK'}`);
    process.exit(findings.length ? 1 : 0);
})();

module.exports = { placeOf, sigKey, eqFinding, cueFinding, placeFinding, orientFinding, dotFinding };
