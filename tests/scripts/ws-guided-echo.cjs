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
//                      (chart_120 critic r2 N2) and on the SCREEN hosts: the online worksheet's cards (initWorksheet, 6 cards) and
//                      the quiz builder's questions (addMultipleQuestions, 3), over --screen-seeds (default 20) - the screen deal
//                      repeated a band-120 window, so two cards printed each other's answers (L13 paper = screen).
//   (lead 2026-11-14, chart_120 r3 n1 upgraded; "Numbers to fill in" ruling:)
//   CROSS-GIVEAWAY     now ANY value missing in one window and printed in another window of the same sheet FAILS, the same squares
//                      or only overlapping (chart_to_120 independent M seed 18144 on 448bc5e74: item 1 missing 94, item 3 prints it);
//                      a Model / anchor's traced answers count as printed. The dealers blank shared squares consistently
//                      (chart-giveaway.js setChartSheet; band 120 repeats one pattern every five columns).
//   BLANK-COUNT        every dealt window holds exactly the chosen number of blanks (--tiles, default 5), capped silently at the
//                      legal maximum min(half, R x min(ceil(C/2), C-2)); row counts differ by at most 1; no whole row blank; never
//                      more than half the squares; every blank a printed neighbour; the key holds one answer a blank (Score /N =
//                      SCORE-SLOTS); a Guided page holds 3 (lead ruling (a)). Every role drawn, the online worksheet, the quiz and the practice card. --seed-list a,b picks seeds.
//   (critic blanks, 2026-11-14:)
//   LESSON-EMPTY-PAGE  no lesson packet page past the first is empty, and pupil and key (when built) print the same page count (B1).
//   CROSS-GIVEAWAY     on a lesson, the whole PACKET is one sheet and its worked examples (plan.meta.exampleQs) count as printed (B2).
//   OPTION-ITEMS       (--variants) every offered tiles value 2/3/4/6/8 deals Independent / Test windows >= 2/3 of the default's,
//                      each holding min(N, cap) - band 120's 3 x 5 cap is 6 (B3).
//   GUIDED-TRY-COUNT   a Guided chart page deals 2+ tries after its Model (B4).
//   (chart_120 critic r2, 2026-11-14:)
//   MODEL-STATE-MARKS  every Scripted Model state and lesson-anchor panel whose step says "Write N" (or "Write a, b and c") draws N
//                      in that state's drawing, and each state adds one mark group: what it draws newly is trace grey, what an
//                      earlier state drew is solid. Judged when the Model's template is one of scripted-model.js TRACE_TEMPLATES
//                      (N1: a two-gap chart window's "Write 101." state drew no 101, and its last state traced 101 and 104 both).
//   SAY-AGREE          every Say frame a page prints - the opener's UNFILLED one among them - agrees in number with the page's
//                      Model item (N3: "The missing number is __." under a two-gap Model): an item of k > 1 answer parts
//                      (`keyParts`) prints a plural frame, with k blanks when it is unfilled. Judged on chart windows.
//   CHART-SQUARE       on Reason It / True or False? / Error analysis, laid out at its printed size, no chart square is narrower
//                      than the 14 mm writing floor (F10: band 100 Reason It L squeezed A | B beside the response to 10.4 mm squares).
//   (chart blanks critic r2, 2026-11-20:)
//   LESSON-TWIN        no two pupil windows of one lesson packet hold the same squares and gaps (worked example left out; R2-1).
//   ANSWER-VARIETY     on a page of 4+ pupil windows no one answer set covers half of them or more (R2-1; r4 F1: was more than half).
//   CROSSING-IN-PLAY   a chart_to_120 lesson packet leaves a pupil gap at 100, 101, 110 or 111 (R2-1).
//   STEP-COVER         on a page with a Steps band every gap is solved by a printed step from a printed neighbour (R2-2).
//   SHEET-ANSWER-SET   no two pupil windows on one lesson page share their sorted answer set (r4 F1).
//   ANSWER-REUSE       at most a third of a lesson practice page's answers were asked on an earlier page of the packet (r4 F2).
//   NEAR-TWIN          no two pupil windows of a lesson packet share 60 % of the larger's squares with the same gaps there (r4 F2).
//   PRACTICE-FILL      a lesson practice page prints at least its capacity minus 1 items, or rows-of-ten grids (r4 F2).
//   BLANK-COUNT        the band-120 lesson's practice page prints three rows of ten (the ruled fallback): its count is what the
//                      packet leaves free, judged by the other blank rules, not the 3 of the windows.
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
    const scoreRoles = list(arg('score-roles', 'guided,independent,more-practice,test,review,error-analysis,opener,mixed-practice,pre-skill-check,lesson,true-false,reason-it,scripted-model'));
    const variants = argv.includes('--variants');
    const tilesOpt = arg('tiles', null) ? Number(arg('tiles')) : null;   // (BLANK-COUNT: "Numbers to fill in" to deal and judge)
    const H = require('../lib/ws-harness.cjs');
    // (a seeded Math.random: the screen deals - the worksheet and the quiz builder - draw from it; `__wsReseed` per seed)
    const app = await H.open({ seed: 1 });
    let res;
    try {
        // (one evaluate per key x size x seed, and per key x band for --variants: a whole run in one call passed the browser's
        // protocol timeout once --variants was added; the TF / EA / overlap tallies live on window.__geState between calls)
        const call = (part) => app.page.evaluate(async ({ keys, N, sizes, only, scoreTpl, scoreRoles, part }) => {
            const { seedFrom = 1, seedTo = N, vBand = null, finalize = false, screen = 0, tilesOpt = null } = part || {};
            // (BLANK-COUNT's chosen number: --tiles, else the skill's default 5; number_chart_fill keeps "1 to 3, dealt" - not judged)
            const tilesWant = tilesOpt || 5;
            const variantsOnly = vBand !== null;
            const on = (id) => !only || only.includes(id);
            const pageRule = ['SCORE-SLOTS', 'TF-FALSE', 'EA-PATTERN', 'CROSS-GIVEAWAY', 'BLANK-COUNT', 'LESSON-EMPTY-PAGE', 'GUIDED-TRY-COUNT', 'OPTION-ITEMS', 'STRIP-NUMBERS', 'CHART-SQUARE', 'MODEL-STATE-MARKS', 'SAY-AGREE', 'LESSON-TWIN', 'ANSWER-VARIETY', 'CROSSING-IN-PLAY', 'STEP-COVER', 'SHEET-ANSWER-SET', 'ANSWER-REUSE', 'NEAR-TWIN', 'PRACTICE-FILL'].some(on);
            // (the templates whose Model states draw their marks; absent on a tree without the export - every template then)
            let TRACE = null;
            try { const SMm = await import(new URL('js/modules/sheet/roles/scripted-model.js', location.href).href); TRACE = SMm.TRACE_TEMPLATES || null; } catch (e) { TRACE = null; }
            // MODEL-STATE-MARKS: states = [{text, drawn: Map(value -> ink)}] in order
            const writeVals = (t) => { const m = String(t).match(/\bWrite ((?:\d[\d,]*)(?:(?:, | and )\d[\d,]*)*)\./); return m ? m[1].split(/, | and /).map((x) => x.replace(/,/g, '')) : []; };
            const drawnOf = (el) => { const d = new Map(); el.querySelectorAll('[data-ws-slot], [data-ws-aslot]').forEach((e) => { const v = e.textContent.replace(/[,\s]/g, ''); if (!v) return; const inkEl = e.hasAttribute('data-ws-ink') ? e : e.querySelector('[data-ws-ink]'); d.set(v, inkEl ? inkEl.getAttribute('data-ws-ink') : (/949494/i.test(e.getAttribute('style') || '') ? 'trace' : 'solid')); }); return d; };
            const judgeStates = (label, states) => {
                let prev = new Map();
                states.forEach((st, k) => {
                    const miss = writeVals(st.text).filter((v) => !st.drawn.has(v));
                    if (miss.length) out.push(`MODEL-STATE-MARKS ${label} state ${k + 1}: "${st.text}" but its drawing shows no ${miss.join(', ')}`);
                    const oldGrey = [...st.drawn].filter(([v, ink]) => prev.has(v) && ink === 'trace').map(([v]) => v);
                    const newSolid = [...st.drawn].filter(([v, ink]) => !prev.has(v) && ink !== 'trace' && writeVals(st.text).includes(v)).map(([v]) => v);
                    if (oldGrey.length) out.push(`MODEL-STATE-MARKS ${label} state ${k + 1}: ${oldGrey.join(', ')} (written in an earlier state) is still trace grey - one new mark group a state, earlier marks solid`);
                    if (newSolid.length) out.push(`MODEL-STATE-MARKS ${label} state ${k + 1}: ${newSolid.join(', ')} is new in this state but not trace grey`);
                    prev = st.drawn;
                });
            };
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
                // (a quiz question keeps the chartwindow cell, not `chartWindow`: its payload is the window)
                const cp = q && q.cell && q.cell.template === 'chartwindow' && q.cell.payload;
                const w = (q && q.chartWindow) || (cp ? { rows: cp.rows, cols: cp.cols } : null);
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
                // (lead 2026-11-14, chart_120 r3 n1 upgraded: ANY value missing in one window and printed in another window of the
                // same sheet fails - the same squares or only overlapping ones. A Model / anchor draws its answers (traced), so
                // its gaps count as printed.)
                const ws = items.map((it) => { const w = winOf(it.q); return w && Object.assign(w, { shows: !!(it.anchor || it.model) }); }).filter(Boolean);
                for (let i = 0; i < ws.length; i++) for (let j = 0; j < ws.length; j++) {
                    if (i === j) continue;
                    const a = ws[i], b = ws[j];
                    if (a.shows) continue;
                    const hit = a.gaps.filter((n) => printsN(b, n) || (b.shows && b.gaps.includes(n)));
                    if (!hit.length) continue;
                    const twin = a.rows.join() === b.rows.join() && a.cols.join() === b.cols.join();
                    out.push(`CROSS-GIVEAWAY ${label}: window ${i + 1}'s missing ${hit.join(', ')} is printed in window ${j + 1}${twin ? ' (the same squares)' : ' (an overlapping window)'}`);
                }
            };
            // BLANK-COUNT (lead ruling 2026-11-14, "Numbers to fill in"): every dealt window holds exactly the chosen number of
            // blanks - capped, silently, at the most its R x C squares can legally hold - spread across its rows (row counts differ
            // by at most 1), no whole row blank, never more than half its squares, every blank a printed neighbour in the window.
            // (band 120's 3 x 5 window - rows 91-120 - shares one pattern every five columns: at most 2 a row, 6 a window; critic blanks B3)
            const capOf = (R, C, rows) => Math.max(1, Math.min(Math.floor(R * C / 2), R * Math.min(Math.ceil(C / 2), Math.max(1, C - 2)), rows && rows.join() === '9,10,11' && C === 5 ? 6 : Infinity));
            const judgeBlanks = (label, items, want) => {
                if (/number_chart_fill/.test(label)) return;
                items.forEach((it, k) => {
                    const q = it && it.q; const w = winOf(q); if (!w) return;
                    const cp = q.cell && q.cell.template === 'chartwindow' && q.cell.payload;
                    const blanks = cp && Array.isArray(cp.blanks) ? cp.blanks.map(Number) : w.gaps;
                    const R = w.rows.length, C = w.cols.length;
                    // (want may be a function of the window: the band-120 lesson's practice rows grid holds what the packet leaves free)
                    const wantW = typeof want === 'function' ? want(w, blanks) : want;
                    const exp = Math.min(capOf(R, C, w.rows), wantW);
                    const f = [];
                    if (blanks.length !== exp) f.push(`${blanks.length} blank(s), want ${exp}${exp < wantW ? ` (${wantW} capped)` : ''}`);
                    if (w.gaps.length !== blanks.length) f.push(`key holds ${w.gaps.length} answer(s) for ${blanks.length} blank(s)`);
                    if (blanks.length * 2 > R * C) f.push(`${blanks.length} of ${R * C} squares blank (more than half)`);
                    const per = w.rows.map((r) => blanks.filter((n) => Math.floor((n - 1) / 10) === r).length);
                    if (per.some((x) => x >= C)) f.push('a whole row is blank');
                    if (Math.max(...per) - Math.min(...per) > 1 && blanks.length >= R) f.push(`blanks bunched by row (${per.join('/')})`);
                    if (blanks.length < R && per.some((x) => x > 1)) f.push(`blanks bunched by row (${per.join('/')})`);
                    const isB = new Set(blanks);
                    const inW = (n) => w.rows.includes(Math.floor((n - 1) / 10)) && w.cols.includes((n - 1) % 10);
                    const lone = blanks.filter((n) => { const c = (n - 1) % 10; return ![c > 0 ? n - 1 : null, c < 9 ? n + 1 : null, n - 10, n + 10].some((m) => m && inW(m) && !isB.has(m)); });
                    if (lone.length) f.push(`blank ${lone.join(', ')} has no printed neighbour`);
                    if (f.length) out.push(`BLANK-COUNT ${label} item ${k + 1}: ${f.join('; ')}`);
                });
            };
            if (screen) {
                // CROSS-GIVEAWAY on the screen hosts (r2 N2): the app's own deals, Math.random reseeded per seed
                if (window.__mqLoadWorksheet) await window.__mqLoadWorksheet();
                if (window.__mqLoadDeferred) await window.__mqLoadDeferred();
                for (const key of keys) {
                    const [categoryId, skillId] = key.split(':');
                    for (let s = 1; s <= screen; s++) {
                        const st0 = window.state;
                        try {
                            if (window.__wsReseed) window.__wsReseed(s);
                            st0.category = categoryId; st0.skill = skillId; st0.gameMode = 'worksheet'; st0.isMixedMode = false; st0.problemCount = 6;
                            st0.skillOptions = tilesOpt ? { tiles: tilesOpt } : null;
                            await window.initWorksheet();
                            pages++;
                            if (on('CROSS-GIVEAWAY')) judgeGiveaway(`${key} online worksheet seed ${s}`, (st0.worksheetQs || []).map((q) => ({ q })));
                            if (on('BLANK-COUNT')) judgeBlanks(`${key} online worksheet seed ${s}`, (st0.worksheetQs || []).map((q) => ({ q })), tilesWant);
                        } catch (e) { out.push(`${key} worksheet seed ${s}: not composed (${String(e && e.message || e).slice(0, 120)})`); }
                        try {
                            if (window.__wsReseed) window.__wsReseed(s);
                            window.openQuizBuilder();
                            window.addMultipleQuestions(skillId, 3, categoryId);
                            await window.saveQuiz();
                            const tests = (await window.listTests()) || [];
                            const t = tests.slice().sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')))[0];
                            pages++;
                            const qq = (t ? t.sections.flatMap((x) => x.questions) : []).map((x) => ({ q: x.questionData }));
                            if (on('CROSS-GIVEAWAY')) judgeGiveaway(`${key} quiz seed ${s}`, qq);
                            if (on('BLANK-COUNT')) judgeBlanks(`${key} quiz seed ${s}`, qq, tilesWant);
                            if (t && window.deleteTest) await window.deleteTest(t.id);
                        } catch (e) { out.push(`${key} quiz seed ${s}: not composed (${String(e && e.message || e).slice(0, 120)})`); }
                        // (the practice card: one window, BLANK-COUNT)
                        if (on('BLANK-COUNT')) try {
                            const q = window.generateQuestionFor({ category: categoryId, skill: skillId, seed: s, ...(tilesOpt ? { opts: { tiles: tilesOpt } } : {}) });
                            pages++;
                            judgeBlanks(`${key} practice card seed ${s}`, [{ q }], tilesWant);
                        } catch (e) { out.push(`${key} card seed ${s}: not composed (${String(e && e.message || e).slice(0, 120)})`); }
                    }
                }
                return { out, pages };
            }
            for (const key of keys) {
                const [categoryId, skillId] = key.split(':');
                if (variantsOnly && on('CROSS-GIVEAWAY') && /^(hundreds_chart_fill|chart_to_120|number_chart_fill)$/.test(skillId)) {
                    const base = skillId === 'chart_to_120' ? { band: 120 } : {};
                    // (the chart's option values, card chartwindow §7a: "Numbers to" and the grid)
                    const bands = skillId === 'chart_to_120' ? [120] : skillId === 'hundreds_chart_fill' ? [10, 20, 30, 40, 50, 100, 120] : [undefined];
                    const grids = skillId === 'number_chart_fill' ? [undefined] : ['window', 'rows', 'whole'];
                    for (const band of bands.filter((b) => vBand === 'all' || String(b) === String(vBand))) for (const grid of grids) for (const role of ['independent', 'more-practice']) for (let s = 1; s <= Math.min(N, 4); s++) {
                        const opts = Object.assign({}, base, band !== undefined ? { band } : {}, grid ? { grid } : {}, tilesOpt ? { tiles: tilesOpt } : {});
                        let r; try { r = await window.buildSheet({ role, sections: [{ skills: [{ categoryId, skillId, opts }] }], size: 'L', paper: 'A4', seed: s, key: false }); } catch (e) { continue; }
                        pages++;
                        planPages(r.plan).forEach((pg, pi) => judgeGiveaway(`${key} ${JSON.stringify(opts)} ${role} L seed ${s} p${pi + 1}`, pg.items));
                        if (on('BLANK-COUNT')) judgeBlanks(`${key} ${JSON.stringify(opts)} ${role} L seed ${s}`, planPages(r.plan).flatMap((pg) => pg.items), tilesWant);
                    }
                }
                // OPTION-ITEMS (critic blanks B3): every offered "Numbers to fill in" keeps the page dense - Independent and Test deal at
                // least two thirds of the default's windows - and each window holds min(N, the legal cap) (BLANK-COUNT)
                if (variantsOnly && vBand === 'tiles' && on('OPTION-ITEMS') && /^(hundreds_chart_fill|chart_to_120)$/.test(skillId)) {
                    for (const role of ['independent', 'test']) for (const size of sizes) for (let s = 1; s <= Math.min(N, 2); s++) {
                        const count = async (tiles) => { const r = await window.buildSheet({ role, sections: [{ skills: [{ categoryId, skillId, ...(tiles ? { opts: { tiles } } : {}) }] }], size, paper: 'A4', seed: s, key: false }); pages++; return planPages(r.plan).flatMap((pg) => pg.items); };
                        const base = (await count(null)).filter((it) => winOf(it.q)).length;
                        for (const t of [2, 3, 4, 6, 8]) {
                            const its = await count(t);
                            const n = its.filter((it) => winOf(it.q)).length;
                            if (n * 3 < base * 2) out.push(`OPTION-ITEMS ${key} tiles ${t} ${role} ${size} seed ${s}: ${n} window(s) where the default deals ${base}`);
                            if (on('BLANK-COUNT')) judgeBlanks(`${key} tiles ${t} ${role} ${size} seed ${s}`, its, t);
                        }
                    }
                }
                if (!variantsOnly && !finalize) for (const size of sizes) for (let s = seedFrom; s <= seedTo; s++) {
                    for (const role of pageRule ? scoreRoles : ['guided']) {
                        if (role !== 'guided' && !pageRule) continue;
                        let r;
                        try { r = await window.buildSheet({ role, sections: [{ skills: [{ categoryId, skillId, ...(tilesOpt ? { opts: { tiles: tilesOpt } } : {}) }] }], size, paper: 'A4', seed: s, key: false }); } catch (e) { out.push(`${key} ${role} ${size} seed ${s}: not composed (${String(e && e.message || e).slice(0, 120)})`); continue; }
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
                        // (critic blanks B2: a lesson PACKET is one sheet - every page's windows together, its worked examples printed)
                        const packet = role === 'lesson' ? (r.keyPlans || [r.plan]).flatMap((pl) => planPages(pl)) : null;
                        if (packet && on('CROSS-GIVEAWAY') && /chart/.test(skillId)) {
                            // (every part's worked examples - the chart page's and the teaching sheet's - are printed windows of the packet)
                            const exQs = (r.partPlans || [{ plans: [r.plan] }]).flatMap((pp0) => (pp0.plans || []).flatMap((pl) => (pl && pl.meta && pl.meta.exampleQs) || []));
                            const ex = (exQs.length ? exQs : ((r.plan && r.plan.meta && r.plan.meta.exampleQs) || [])).map((q) => ({ q, anchor: true }));
                            judgeGiveaway(`${key} lesson packet ${size} seed ${s}`, ex.concat(packet.flatMap((pg) => pg.items).filter((it) => it && it.q && !it.anchor && !it.model)));
                        }
                        // (chart blanks critic r2, 2026-11-20 - R2-1 / R2-2:)
                        // LESSON-TWIN: no two pupil windows of one lesson packet are the same squares with the same gaps (the
                        // worked example is shown, not answered: left out). ANSWER-VARIETY: on a page of 4+ pupil windows no one
                        // answer set (a window's sorted gaps) covers more than half of them. CROSSING-IN-PLAY: a band-120 lesson
                        // packet leaves at least one pupil gap at 100, 101, 110 or 111. STEP-COVER: on a page with a Steps band,
                        // every gap is solved by a printed step from a printed neighbour (left +1, up +10, top row: down -10,
                        // and right -1 only when "Look right" is printed).
                        const pupilWins = (its) => its.filter((it) => it && it.q && !it.anchor && !it.model).map((it) => winOf(it.q)).filter(Boolean);
                        const pagesJ = packet || pp;
                        if (packet && on('LESSON-TWIN') && /chart/.test(skillId)) {
                            const seenTw = new Map();
                            packet.forEach((pg, pi) => pupilWins(pg.items).forEach((w, wi) => {
                                const k = `${w.rows.join('.')}|${w.cols.join('.')}|${w.gaps.slice().sort((a, b) => a - b).join('.')}`;
                                if (seenTw.has(k)) out.push(`LESSON-TWIN ${key} lesson ${size} seed ${s}: p${pi + 1} window ${wi + 1} is ${seenTw.get(k)} again (the same squares and gaps)`);
                                else seenTw.set(k, `p${pi + 1} window ${wi + 1}`);
                            }));
                        }
                        // (not a Scripted Model: its cells are the states of ONE worked window)
                        if (on('ANSWER-VARIETY') && /chart/.test(skillId) && role !== 'scripted-model') pagesJ.forEach((pg, pi) => {
                            const ws = pupilWins(pg.items); if (ws.length < 4) return;
                            const cnt = new Map(); ws.forEach((w) => { const k = w.gaps.slice().sort((a, b) => a - b).join(', '); cnt.set(k, (cnt.get(k) || 0) + 1); });
                            const [topSet, topN] = [...cnt].sort((a, b) => b[1] - a[1])[0];
                            if (topN * 2 >= ws.length) out.push(`ANSWER-VARIETY ${key} ${role} ${size} seed ${s} p${pi + 1}: ${topN} of ${ws.length} windows answer ${topSet}`);
                        });
                        if (packet && on('CROSSING-IN-PLAY') && skillId === 'chart_to_120') {
                            const all = packet.flatMap((pg) => pupilWins(pg.items)).flatMap((w) => w.gaps);
                            if (!all.some((n) => [100, 101, 110, 111].includes(n))) out.push(`CROSSING-IN-PLAY ${key} lesson ${size} seed ${s}: no pupil gap at 100, 101, 110 or 111 in the packet (gaps ${[...new Set(all)].sort((a, b) => a - b).join(', ')})`);
                        }
                        if (on('STEP-COVER') && /chart/.test(skillId)) pagesJ.forEach((pg, pi) => {
                            const doc = new DOMParser().parseFromString(`<div>${pg.htmls.join(' ')}</div>`, 'text/html');
                            const stp = [...doc.querySelectorAll('.mq-lstrip li, .mq-lstepszone li, ol.mq-lsteps li')].map((e) => e.textContent).join(' | ');
                            if (!/Look (left|up)/i.test(stp)) return;
                            const has = { L: /Look left/i.test(stp), U: /Look up/i.test(stp), D: /Look down/i.test(stp), R: /Look right/i.test(stp) };
                            pupilWins(pg.items).forEach((w, wi) => {
                                const inW = (n) => w.rows.includes(Math.floor((n - 1) / 10)) && w.cols.includes((n - 1) % 10);
                                const pr = (n) => inW(n) && !w.gaps.includes(n);
                                const top = Math.min(...w.rows);
                                const bad = w.gaps.filter((n) => {
                                    const c = (n - 1) % 10, r = Math.floor((n - 1) / 10);
                                    return !((has.L && c > 0 && pr(n - 1)) || (has.U && pr(n - 10)) || (has.D && r === top && pr(n + 10)) || (has.R && c < 9 && pr(n + 1)));
                                });
                                if (bad.length) out.push(`STEP-COVER ${key} ${role} ${size} seed ${s} p${pi + 1} window ${wi + 1}: no printed step solves ${bad.join(', ')} from a printed neighbour (steps: ${Object.keys(has).filter((k) => has[k]).join('')})`);
                            });
                        });
                        // (chart blanks critic r4, 2026-11-20 - F1 / F2:)
                        // SHEET-ANSWER-SET: no two pupil windows on one lesson page share their sorted answer set. ANSWER-REUSE: at most a
                        // third of a lesson practice page's answers were already answers of a pupil window on an earlier page. NEAR-TWIN:
                        // no two pupil windows of the packet share 60 % or more of the larger one's squares with the same gaps in the shared
                        // squares (and at least one gap there). PRACTICE-FILL: the lesson practice page prints at least its capacity minus
                        // 1 items, or is filled with rows-of-ten grids (3 x 10).
                        const pkParts = packet && /chart/.test(skillId) ? (r.partPlans || []).flatMap((x) => (x.plans || []).flatMap((pl) => planPages(pl).map((pg) => ({ part: x.part, items: pg.items, plan: pl })))) : null;
                        if (pkParts && on('SHEET-ANSWER-SET')) pkParts.forEach((pg, pi) => {
                            const seenS = new Map();
                            pupilWins(pg.items).forEach((w, wi) => {
                                const k = w.gaps.slice().sort((a, b) => a - b).join(', ');
                                if (!k) return;
                                if (seenS.has(k)) out.push(`SHEET-ANSWER-SET ${key} lesson ${size} seed ${s} p${pi + 1}: window ${wi + 1} answers ${k}, as window ${seenS.get(k)} on the same page`);
                                else seenS.set(k, wi + 1);
                            });
                        });
                        if (pkParts && on('ANSWER-REUSE')) {
                            const earlier = new Set();
                            pkParts.forEach((pg, pi) => {
                                const gs = pupilWins(pg.items).flatMap((w) => w.gaps);
                                if (pg.part === 'practice' && gs.length) {
                                    const re = gs.filter((n) => earlier.has(n)).length;
                                    if (re * 3 > gs.length) out.push(`ANSWER-REUSE ${key} lesson ${size} seed ${s} p${pi + 1}: ${re} of ${gs.length} practice answers were asked on an earlier page (at most a third)`);
                                }
                                gs.forEach((n) => earlier.add(n));
                            });
                        }
                        if (pkParts && on('NEAR-TWIN')) {
                            const all = pkParts.flatMap((pg, pi) => pupilWins(pg.items).map((w, wi) => ({ w, at: `p${pi + 1} window ${wi + 1}` })));
                            const sq = (w) => { const z = new Set(); for (const rr of w.rows) for (const c of w.cols) z.add(rr * 10 + c + 1); return z; };
                            for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
                                const A = sq(all[i].w), B = sq(all[j].w);
                                const sh = [...A].filter((n) => B.has(n));
                                if (sh.length * 10 < Math.max(A.size, B.size) * 6) continue;
                                const gA = sh.filter((n) => all[i].w.gaps.includes(n)).sort((a, b) => a - b).join('.'), gB = sh.filter((n) => all[j].w.gaps.includes(n)).sort((a, b) => a - b).join('.');
                                if (gA && gA === gB) out.push(`NEAR-TWIN ${key} lesson ${size} seed ${s}: ${all[j].at} shares ${sh.length} of ${Math.max(A.size, B.size)} squares with ${all[i].at}, the same gaps (${gA.replace(/\./g, ', ')}) in them`);
                            }
                        }
                        if (pkParts && on('PRACTICE-FILL')) pkParts.forEach((pg, pi) => {
                            if (pg.part !== 'practice') return;
                            const f0 = pg.plan && pg.plan.meta && Array.isArray(pg.plan.meta.fits) && pg.plan.meta.fits[0];
                            const cap = f0 && Number(f0.perPage);
                            const its = pg.items.filter((it) => it && it.q && !it.anchor && !it.model);
                            const ws = its.map((it) => winOf(it.q)).filter(Boolean);
                            const rowsGrids = ws.length && ws.every((w) => w.rows.length === 3 && w.cols.length === 10);
                            if (cap && its.length < cap - 1 && !rowsGrids) out.push(`PRACTICE-FILL ${key} lesson ${size} seed ${s} p${pi + 1}: ${its.length} item(s) on a practice page that holds ${cap} (at least ${cap - 1}, or rows-of-ten grids)`);
                        });
                        // LESSON-EMPTY-PAGE (critic blanks B1): no page of a lesson packet past its first is printed empty, and the key
                        // prints as many pages as the pupil copy
                        if (packet && on('LESSON-EMPTY-PAGE')) {
                            packet.forEach((pg, pi) => { if (pi > 0 && !pg.items.some((it) => it && (it.q || it.source || it.anchor))) out.push(`LESSON-EMPTY-PAGE ${key} lesson ${size} seed ${s}: page ${pi + 1} of ${packet.length} holds no item`); });
                            // (B1 on 335e6cc2b: the practice part drew a page from a plan of none - pageCount 3 over 2 planned pages)
                            if (Number(r.pageCount) > packet.length) out.push(`LESSON-EMPTY-PAGE ${key} lesson ${size} seed ${s}: ${r.pageCount} pupil page(s) printed, ${packet.length} with a plan (an empty page)`);
                            if (Number(r.keyPageCount) > 0 && Number(r.pageCount) !== Number(r.keyPageCount)) out.push(`LESSON-EMPTY-PAGE ${key} lesson ${size} seed ${s}: ${r.pageCount} pupil page(s), ${r.keyPageCount} key page(s)`);
                        }
                        // GUIDED-TRY-COUNT (critic blanks B4): a Guided chart page deals at least two tries after its Model
                        if (role === 'guided' && on('GUIDED-TRY-COUNT') && /chart/.test(skillId)) {
                            const tries = scoredItems.filter((it) => winOf(it.q)).length;
                            if (tries < 2) out.push(`GUIDED-TRY-COUNT ${key} guided ${size} seed ${s}: ${tries} try window(s) after the Model (want 2 or more)`);
                        }
                        // (BLANK-COUNT: the whole sheet's windows; Score /N equals their blanks is SCORE-SLOTS, judged above)
                        // (lead ruling (a) 2026-11-14: Guided 3; a band-120 LESSON's pupil windows 3 - its whole packet is judged, B2)
                        const lesson120 = role === 'lesson' && skillId === 'chart_to_120';
                        if (on('BLANK-COUNT')) judgeBlanks(`${key} ${role} ${size} seed ${s}`, packet ? packet.flatMap((pg) => pg.items).filter((it) => it && it.q && !it.anchor && !it.model) : pp.flatMap((pg) => pg.items), role === 'guided' ? 3 : lesson120 ? (w, b) => (w.rows.length === 3 && w.cols.length === 10 ? b.length : 3) : tilesWant);
                        const modelIt = pp.flatMap((pg) => pg.items).find((it) => it && it.q && it.q.cell);
                        const modelTpl = modelIt && modelIt.q.cell.template;
                        if (on('MODEL-STATE-MARKS') && (role === 'scripted-model' || role === 'lesson') && modelTpl && (!TRACE || TRACE.has(modelTpl))) {
                            const d = new DOMParser().parseFromString(`<div>${r.pupilHtml}</div>`, 'text/html');
                            const states = [];
                            if (role === 'lesson') {
                                const p1 = d.querySelector('section.ws-page');
                                (p1 ? [...p1.querySelectorAll('.mq-cstate')] : []).forEach((e) => { const h = e.querySelector('.mq-chead b'); const dr = e.querySelector('.mq-cdraw'); if (h && dr) states.push({ text: h.textContent.trim(), drawn: drawnOf(dr) }); });
                            } else {
                                // a state cell holds its drawing and (one column) its step text; beside it (two columns) a text cell
                                cellsOf(r.pupilHtml).forEach((c) => {
                                    const t = c.querySelector('.mq-steptext span');
                                    const draws = c.querySelector('[data-ws-slot], [data-ws-aslot], table, svg');
                                    if (draws) states.push({ text: t ? t.textContent.trim() : '', drawn: drawnOf(c) });
                                    else if (t && states.length && !states[states.length - 1].text) states[states.length - 1].text = t.textContent.trim();
                                });
                            }
                            if (states.length >= 2) judgeStates(`${key} ${role} ${size} seed ${s}`, states);
                        }
                        if (on('SAY-AGREE') && modelIt && /chartwindow/.test(String(modelTpl))) {
                            const d = new DOMParser().parseFromString(`<div>${r.pupilHtml}</div>`, 'text/html');
                            const f = d.querySelector('.ws-sayframe');
                            const kp = Array.isArray(modelIt.q.keyParts) ? modelIt.q.keyParts.length : 1;
                            if (f && kp > 1) {
                                const txt = f.textContent;
                                const blanks = f.querySelectorAll('.ws-line, [data-ws-blank], .ws-sayblank').length || (txt.match(/_{2,}/g) || []).length;
                                if (/\bnumber is\b/.test(txt) || (blanks && blanks !== kp)) out.push(`SAY-AGREE ${key} ${role} ${size} seed ${s}: the Say frame "${txt.trim()}" (${blanks} blank${blanks === 1 ? '' : 's'}) under a Model of ${kp} answers`);
                            }
                        }
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
            if (variants && (!only || ['CROSS-GIVEAWAY', 'OPTION-ITEMS', 'BLANK-COUNT'].some((x) => only.includes(x))) && /^(hundreds_chart_fill|chart_to_120|number_chart_fill)$/.test(sk)) {
                const bands = !only || only.includes('CROSS-GIVEAWAY') ? (sk === 'hundreds_chart_fill' ? [10, 20, 30, 40, 50, 100, 120] : ['all']) : [];
                // (OPTION-ITEMS - critic blanks B3 - runs on its own under --only OPTION-ITEMS: a backtest row proves it alone)
                if (sk !== 'number_chart_fill' && (!only || only.includes('OPTION-ITEMS') || only.includes('BLANK-COUNT'))) add(await call({ keys: [key], vBand: 'tiles', seedFrom: 1, seedTo: 0 }).then((r) => r, (e) => ({ out: [`${key} tiles: not composed (${String(e && e.message || e).slice(0, 120)})`], pages: 0 })));
                for (const b of bands) add(await call({ keys: [key], vBand: b, seedFrom: 1, seedTo: 0, tilesOpt }).then((r) => r, (e) => ({ out: [`${key} band ${b}: not composed (${String(e && e.message || e).slice(0, 120)})`], pages: 0 })));
            }
        }
        const screenSeeds = Number(arg('screen-seeds', '20'));
        for (const key of keys) if (screenSeeds > 0 && (!only || only.includes('CROSS-GIVEAWAY') || only.includes('BLANK-COUNT')) && /^(hundreds_chart_fill|chart_to_120|number_chart_fill)$/.test(key.split(':')[1])) add(await call({ keys: [key], screen: screenSeeds, tilesOpt }));
        const seedList = arg('seed-list', null) ? list(arg('seed-list')).map(Number) : Array.from({ length: N }, (_, i) => i + 1);
        for (const key of keys) for (const size of sizes) for (const s of seedList) add(await call({ keys: [key], sizes: [size], seedFrom: s, seedTo: s, tilesOpt }));
        add(await call({ finalize: true }));
    } catch (e) { console.log(`${TOOL}: FAIL - error ${String(e && e.message || e).slice(0, 200)}`); await app.close(); process.exit(2); }
    await app.close();
    for (const f of res.out) console.log('  ' + f);
    const bad = res.out.filter((f) => /^(GUIDED-MODEL-ECHO|SCORE-SLOTS|TF-FALSE|EA-PATTERN|CROSS-GIVEAWAY|BLANK-COUNT|LESSON-EMPTY-PAGE|GUIDED-TRY-COUNT|OPTION-ITEMS|STRIP-NUMBERS|CHART-SQUARE|MODEL-STATE-MARKS|SAY-AGREE|LESSON-TWIN|ANSWER-VARIETY|CROSSING-IN-PLAY|STEP-COVER|SHEET-ANSWER-SET|ANSWER-REUSE|NEAR-TWIN|PRACTICE-FILL) /.test(f));
    const notComposed = res.out.filter((f) => / not composed /.test(f)).length;
    console.log(`${TOOL}: ${bad.length ? `FAIL - ${bad.length} finding(s)` : 'OK'} (${res.pages} pages, ${keys.join(', ')}, sizes ${sizes.join('/')}, ${N} seeds${notComposed ? `; ${notComposed} not composed` : ''})`);
    process.exit(bad.length ? 1 : 0);
})();
