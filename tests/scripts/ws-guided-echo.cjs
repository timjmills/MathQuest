// ws-guided-echo - two judges of a scored page's items, from lf-roles critic r8b on composing:chart_to_120 Guided M / L
// (design/status/lf-roles/critic-r8b.md, D5 and n5; lane lf-builds, 2026-11-13).
//
//   GUIDED-MODEL-ECHO  no try on a Guided page shows the Model's own prompt: the same template and the same picture (its
//                      payload with the answer places taken out - `blanks`, `targets`, `answer`, `ans`). D5: the Model was the
//                      96-120 chart window with 100 traced; try 4 was the same window with 100 blank, so the pupil copied the
//                      Model's answer. Judged on Guided at every size and seed asked.
//   SCORE-SLOTS        the "Score / N" a page prints equals the answer places the pupil writes on its scored items: the sum of
//                      each item's template `inputs(payload)` that are graded (the Model and anchors unscored). n5: Score /3
//                      over three chart windows holding 5 empty squares. Judged on guided, independent, more-practice, test and
//                      review (Error analysis: one judgement a cell, its shown work is not the pupil's), for the templates named by --score-templates (default chartwindow: a template that scores one
//                      point a cell whatever its slots - a stack, a number family - is a separate ruling, not judged here).
//
//   (chart_120 critic r1, 2026-11-13 - judged from the built plan's items, so they read what the role dealt:)
//   SCORE-SLOTS        also on opener, mixed-practice, pre-skill-check and lesson (F6: Score /2 over 4 squares on the opener,
//                      /6 over 13 on mixed practice): Score = the labelled (scored) cells, a chart window counting its empty squares.
//   TF-FALSE           True or False? deals False statements (F1: 4 of 4 True - a multi-gap window had no wrong answer): every page
//                      of 2+ statements holds at least one True and one False, and over the seeds 35-65 % are False (PT-TOF-1).
//   EA-PATTERN         Error analysis cannot be answered by counting gaps (F2: every multi-gap window Correct): over the seeds, the
//                      windows of 2+ gaps are judged both Correct and Fix it.
//   CROSS-GIVEAWAY     no window prints, as a chart number, a square another window of the SAME squares leaves empty (F4: band 120
//                      grid=rows - one window, three items copying each other's answers; F9: band 10). With --variants it also
//                      runs hundreds_chart_fill's band x grid values on independent / more-practice. Overlapping (not identical)
//                      windows that share an answer are counted and reported (OVERLAP-INFO), not failed.
//   CHART-SQUARE       on Reason It / True or False? / Error analysis, laid out at its printed size, no chart square is narrower
//                      than the 14 mm writing floor (F10: band 100 Reason It L squeezed A | B beside the response to 10.4 mm squares).
//   STRIP-NUMBERS      a lesson sheet's Steps zone and strip name no number (11 and up) that is not printed in, or a key of, a
//                      cell on its page (F5: "The number before is 109 ... Write 110." beside windows with no 109 or 110).
//
//   node tests/scripts/ws-guided-echo.cjs --skill composing:chart_to_120 [--seeds 8] [--sizes M,L] [--only GUIDED-MODEL-ECHO] [--variants]
//   MQ_ROOT=<tree> judges another checkout (ws-backtest commit-pair rows; the harness serves that tree)
// Last line `ws-guided-echo: OK (...)` / `FAIL - n finding(s)`; exit 1 on FAIL, 2 on usage or error.
'use strict';
const TOOL = 'ws-guided-echo';
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && i + 1 < argv.length ? argv[i + 1] : d; };
const list = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);

(async () => {
    const keys = list(arg('skill', arg('skills', '')));
    if (!keys.length || keys.some((k) => !k.includes(':'))) { console.log(`${TOOL}: FAIL - usage: --skill cat:skill[,..]`); process.exit(2); }
    const N = Number(arg('seeds', '8'));
    const sizes = list(arg('sizes', 'M,L'));
    const only = arg('only', null) ? list(arg('only')) : null;
    const scoreTpl = list(arg('score-templates', 'chartwindow'));
    const scoreRoles = list(arg('score-roles', 'guided,independent,more-practice,test,review,error-analysis,opener,mixed-practice,pre-skill-check,lesson,true-false,reason-it'));
    const variants = argv.includes('--variants');
    const H = require('../lib/ws-harness.cjs');
    const app = await H.open({});
    let res;
    try {
        // (one evaluate per key x size x seed, and per key x band for --variants: a whole run in one call passed the browser's
        // protocol timeout once --variants was added; the TF / EA / overlap tallies live on window.__geState between calls)
        const call = (part) => app.page.evaluate(async ({ keys, N, sizes, only, scoreTpl, scoreRoles, part }) => {
            const { seedFrom = 1, seedTo = N, vBand = null, finalize = false } = part || {};
            const variantsOnly = vBand !== null;
            const on = (id) => !only || only.includes(id);
            const pageRule = ['SCORE-SLOTS', 'TF-FALSE', 'EA-PATTERN', 'CROSS-GIVEAWAY', 'STRIP-NUMBERS', 'CHART-SQUARE'].some(on);
            const out = []; let pages = 0;
            // a cell's PICTURE with its answers taken out. A chart window (table.k2-chart): its shape and the number its first
            // square stands for, read from any printed square (across +1, down +10) - so two windows with other blanks are one
            // picture. Any other template: its markup with every answer place's content emptied.
            const picture = (c) => {
                const tpl = c.getAttribute('data-ws-cell');
                const tb = c.querySelector('table.k2-chart');
                if (tb) {
                    const rows = [...tb.querySelectorAll('tr')]; const C = rows.length ? rows[0].querySelectorAll('td').length : 0;
                    let base = null;
                    rows.forEach((tr, r) => [...tr.querySelectorAll('td')].forEach((td, k) => {
                        if (base !== null || td.querySelector('[data-ws-slot]')) return;
                        const v = parseInt(td.textContent.replace(/[^0-9]/g, ''), 10); if (Number.isFinite(v)) base = v - (r * 10 + k);
                    }));
                    return `${tpl}|${rows.length}x${C}@${base}`;
                }
                const x = c.cloneNode(true);
                x.querySelectorAll('[data-ws-slot]').forEach((e) => { e.innerHTML = ''; });
                x.querySelectorAll('.ws-modeltab, [data-ws-label], .ws-letter').forEach((e) => e.remove());
                return `${tpl}|${x.innerHTML.replace(/\sdata-ws-ink="[^"]*"/g, '').replace(/\s+/g, ' ')}`;
            };
            const cellsOf = (html) => {
                const d = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
                return [...d.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]'));
            };
            // the built plan, page by page: its grid items (q, key, nolabel) and its html parts (the lesson's Steps zone and strip)
            const planPages = (plan) => (plan && Array.isArray(plan.pages) ? plan.pages : []).map((pg) => {
                const items = [], htmls = [];
                const walk = (x) => {
                    if (!x || typeof x !== 'object') return;
                    if (Array.isArray(x)) { x.forEach(walk); return; }
                    if (x.kind === 'grid' && Array.isArray(x.items)) items.push(...x.items.filter(Boolean));
                    if (typeof x.html === 'string') htmls.push(x.html);
                    for (const k of ['sections', 'parts', 'content']) if (x[k]) walk(x[k]);
                };
                walk(pg);
                return { items, htmls };
            });
            const winOf = (q) => {
                const w = q && q.chartWindow;
                if (!w || !Array.isArray(w.rows) || !Array.isArray(w.cols)) return null;
                const raw = Array.isArray(q.keyParts) && q.keyParts.length ? q.keyParts : String(q.ans === undefined ? '' : q.ans).split(/\s*,\s*/);
                return { rows: w.rows.map(Number), cols: w.cols.map(Number), gaps: raw.map((x) => Number(String(x).replace(/,/g, ''))).filter(Number.isFinite) };
            };
            const printsN = (c, n) => !c.gaps.includes(n) && c.rows.includes(Math.floor((n - 1) / 10)) && c.cols.includes((n - 1) % 10);
            const nums = (t) => (String(t || '').replace(/<[^>]+>/g, ' ').replace(/(\d),(?=\d{3})/g, '$1').match(/\d+/g) || []).map(Number);
            const itemNums = (q) => {
                const s = new Set();
                const c = winOf(q);
                if (c) for (const r of c.rows) for (const k of c.cols) s.add(r * 10 + k + 1);
                else nums(JSON.stringify((q && q.cell && q.cell.payload) || {})).forEach((n) => s.add(n));
                nums(q && q.text).forEach((n) => s.add(n));
                nums(Array.isArray(q && q.ans) ? q.ans.join(' ') : q && q.ans).forEach((n) => s.add(n));
                return s;
            };
            const st = window.__geState || (window.__geState = { tf: { pages: 0, falseN: 0, all: 0 }, ea: { multiCorrect: 0, multiFix: 0 }, overlap: 0 });
            const tf = st.tf, ea = st.ea;
            const judgeGiveaway = (label, items) => {
                const ws = items.map((it) => winOf(it.q)).filter(Boolean);
                for (let i = 0; i < ws.length; i++) for (let j = 0; j < ws.length; j++) {
                    if (i === j) continue;
                    const a = ws[i], b = ws[j];
                    const hit = a.gaps.filter((n) => printsN(b, n));
                    if (!hit.length) continue;
                    if (a.rows.join() === b.rows.join() && a.cols.join() === b.cols.join()) out.push(`CROSS-GIVEAWAY ${label}: window ${i + 1}'s answer ${hit.join(', ')} is printed in window ${j + 1} (the same squares)`);
                    else st.overlap++;
                }
            };
            for (const key of keys) {
                const [categoryId, skillId] = key.split(':');
                if (variantsOnly && on('CROSS-GIVEAWAY') && /^(hundreds_chart_fill|chart_to_120|number_chart_fill)$/.test(skillId)) {
                    const base = skillId === 'chart_to_120' ? { band: 120 } : {};
                    // (the chart's option values, card chartwindow §7a: "Numbers to" and the grid)
                    const bands = skillId === 'chart_to_120' ? [120] : skillId === 'hundreds_chart_fill' ? [10, 20, 30, 40, 50, 100, 120] : [undefined];
                    const grids = skillId === 'number_chart_fill' ? [undefined] : ['window', 'rows', 'whole'];
                    for (const band of bands.filter((b) => vBand === 'all' || String(b) === String(vBand))) for (const grid of grids) for (const role of ['independent', 'more-practice']) for (let s = 1; s <= Math.min(N, 4); s++) {
                        const opts = Object.assign({}, base, band !== undefined ? { band } : {}, grid ? { grid } : {});
                        let r; try { r = await window.buildSheet({ role, sections: [{ skills: [{ categoryId, skillId, opts }] }], size: 'L', paper: 'A4', seed: s, key: false }); } catch (e) { continue; }
                        pages++;
                        planPages(r.plan).forEach((pg, pi) => judgeGiveaway(`${key} ${JSON.stringify(opts)} ${role} L seed ${s} p${pi + 1}`, pg.items));
                    }
                }
                if (!variantsOnly && !finalize) for (const size of sizes) for (let s = seedFrom; s <= seedTo; s++) {
                    for (const role of pageRule ? scoreRoles : ['guided']) {
                        if (role !== 'guided' && !pageRule) continue;
                        let r;
                        try { r = await window.buildSheet({ role, sections: [{ skills: [{ categoryId, skillId }] }], size, paper: 'A4', seed: s, key: false }); } catch (e) { out.push(`${key} ${role} ${size} seed ${s}: not composed (${String(e && e.message || e).slice(0, 120)})`); continue; }
                        pages++;
                        const meta = (r.plan && r.plan.meta) || {};
                        const cells = cellsOf(r.pupilHtml);
                        if (role === 'guided' && on('GUIDED-MODEL-ECHO') && cells.length > 1) {
                            const m = picture(cells[0]);
                            cells.slice(1).forEach((c, i) => { if (picture(c) === m) out.push(`GUIDED-MODEL-ECHO ${key} guided ${size} seed ${s}: try ${i + 1} shows the Model's own picture (${m.slice(0, 80)}) - the pupil can copy the Model's answer`); });
                        }
                        const pp = planPages(r.plan);
                        const scoredItems = pp.flatMap((pg) => pg.items).filter((it) => !it.nolabel && !it.anchor && it.q);
                        if (on('SCORE-SLOTS') && Number.isFinite(Number(meta.scoreOutOf)) && scoredItems.some((it) => it.q.cell && scoreTpl.includes(it.q.cell.template))) {
                            // (Error analysis and True or False?: ONE judgement a cell - the shown work's squares are not the pupil's)
                            const one = role === 'error-analysis' || role === 'true-false' || role === 'reason-it';
                            const want = scoredItems.reduce((a, it) => a + (!one && it.q.cell && scoreTpl.includes(it.q.cell.template) ? Math.max(1, (Array.isArray(it.q.keyParts) && it.q.keyParts.length) || 1) : 1), 0);
                            if (Number(meta.scoreOutOf) !== want) out.push(`SCORE-SLOTS ${key} ${role} ${size} seed ${s}: Score /${meta.scoreOutOf} but its ${scoredItems.length} scored cell(s) hold ${want} answer places`);
                        }
                        if (on('TF-FALSE') && role === 'true-false') {
                            const flags = scoredItems.map((it) => /^False/.test(String((it.key && it.key.short) || '')));
                            tf.pages++; tf.all += flags.length; tf.falseN += flags.filter(Boolean).length;
                            if (flags.length >= 2 && (flags.every(Boolean) || !flags.some(Boolean))) out.push(`TF-FALSE ${key} true-false ${size} seed ${s}: ${flags.filter(Boolean).length} of ${flags.length} statements False (every page holds a True and a False)`);
                        }
                        if (on('EA-PATTERN') && role === 'error-analysis') {
                            for (const it of scoredItems) {
                                const c = winOf(it.q); if (!c || c.gaps.length < 2) continue;
                                if (/^Correct/i.test(String((it.key && it.key.short) || ''))) ea.multiCorrect++; else ea.multiFix++;
                            }
                        }
                        if (on('CROSS-GIVEAWAY')) pp.forEach((pg, pi) => judgeGiveaway(`${key} ${role} ${size} seed ${s} p${pi + 1}`, pg.items));
                        if (on('CHART-SQUARE') && ['reason-it', 'true-false', 'error-analysis'].includes(role) && /chartwindow/.test(r.pupilHtml)) {
                            // laid out on the page at its printed size: no square of a chart window narrower than the 14 mm writing floor (H9)
                            const host = document.createElement('div');
                            host.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden';
                            host.innerHTML = r.pupilHtml;
                            document.body.appendChild(host);
                            const PX = 96 / 25.4;
                            const tds = [...host.querySelectorAll('table.k2-chart td')];
                            const min = tds.length ? Math.min(...tds.map((td) => td.getBoundingClientRect().width / PX)) : Infinity;
                            host.remove();
                            if (min < 14) out.push(`CHART-SQUARE ${key} ${role} ${size} seed ${s}: a chart square is ${min.toFixed(1)} mm wide (floor 14 mm, H9) - the window is squeezed beside its work`);
                        }
                        if (on('STRIP-NUMBERS') && role === 'lesson') pp.forEach((pg, pi) => {
                            // (the step names only: the strip's and the zone's list items, their step numerals left out)
                            const doc = new DOMParser().parseFromString(`<div>${pg.htmls.join(' ')}</div>`, 'text/html');
                            const strip = [...doc.querySelectorAll('.mq-lstrip li span, .mq-lstepszone li span, ol.mq-lsteps li span')].map((e) => e.textContent).join(' ');
                            if (!strip) return;
                            const have = new Set(); pg.items.forEach((it) => itemNums(it.q).forEach((n) => have.add(n)));
                            const stray = [...new Set(nums(strip).filter((n) => n >= 11 && !have.has(n)))];
                            if (stray.length) out.push(`STRIP-NUMBERS ${key} lesson ${size} seed ${s} p${pi + 1}: the Steps name ${stray.join(', ')}, printed in no cell of the page`);
                        });
                    }
                }
            }
            if (finalize && on('TF-FALSE') && tf.all) { const sh = tf.falseN / tf.all; if (sh < 0.35 || sh > 0.65) out.push(`TF-FALSE ${keys.join(',')}: ${tf.falseN} of ${tf.all} statements False over ${tf.pages} pages (${Math.round(sh * 100)} %, PT-TOF-1 40-60 %)`); }
            if (finalize && on('EA-PATTERN') && ea.multiCorrect + ea.multiFix >= 4 && (!ea.multiCorrect || !ea.multiFix)) out.push(`EA-PATTERN ${keys.join(',')}: windows of 2+ gaps judged Correct ${ea.multiCorrect}, Fix it ${ea.multiFix} - the judgement follows the gap count`);
            if (finalize) out.push(`OVERLAP-INFO ${st.overlap} answer(s) shared by overlapping (not identical) windows; TF ${tf.falseN}/${tf.all} False; EA multi-gap Correct ${ea.multiCorrect} / Fix it ${ea.multiFix}`);
            return { out, pages };
        }, { keys: (part && part.keys) || keys, N, sizes: (part && part.sizes) || sizes, only, scoreTpl, scoreRoles, part });
        res = { out: [], pages: 0 };
        const add = (r) => { res.out.push(...r.out); res.pages += r.pages; };
        for (const key of keys) {
            const sk = key.split(':')[1];
            if (variants && (!only || only.includes('CROSS-GIVEAWAY')) && /^(hundreds_chart_fill|chart_to_120|number_chart_fill)$/.test(sk)) {
                const bands = sk === 'hundreds_chart_fill' ? [10, 20, 30, 40, 50, 100, 120] : ['all'];
                for (const b of bands) add(await call({ keys: [key], vBand: b, seedFrom: 1, seedTo: 0 }).then((r) => r, (e) => ({ out: [`${key} band ${b}: not composed (${String(e && e.message || e).slice(0, 120)})`], pages: 0 })));
            }
        }
        for (const key of keys) for (const size of sizes) for (let s = 1; s <= N; s++) add(await call({ keys: [key], sizes: [size], seedFrom: s, seedTo: s }));
        add(await call({ finalize: true }));
    } catch (e) { console.log(`${TOOL}: FAIL - error ${String(e && e.message || e).slice(0, 200)}`); await app.close(); process.exit(2); }
    await app.close();
    for (const f of res.out) console.log('  ' + f);
    const bad = res.out.filter((f) => /^(GUIDED-MODEL-ECHO|SCORE-SLOTS|TF-FALSE|EA-PATTERN|CROSS-GIVEAWAY|STRIP-NUMBERS|CHART-SQUARE) /.test(f));
    const notComposed = res.out.filter((f) => / not composed /.test(f)).length;
    console.log(`${TOOL}: ${bad.length ? `FAIL - ${bad.length} finding(s)` : 'OK'} (${res.pages} pages, ${keys.join(', ')}, sizes ${sizes.join('/')}, ${N} seeds${notComposed ? `; ${notComposed} not composed` : ''})`);
    process.exit(bad.length ? 1 : 0);
})();
