// ws-simple-print — the ONE simple print fills the paper (owner, 2026-11-03: "before the printing worked fine, it would
// have multiple rows and columns … Here it is just showing a couple of problems … The problems should just populate
// the paper").
//
// For each set below, at sizes S / M / L, the DEFAULT simple print (js/modules/simple-print.js buildSimple: Pages 1,
// Auto columns, In sections, key on) and the owner's screenshot case (Problems 41) are built, and every pupil page is
// measured in Chrome (the printed document, sheetDocument):
//   FILL     every page of the DEFAULT print: its problem cells cover >= 60 % of its problem area (.ws-body to the
//            footer). The Problems 41 print's fill is reported (INFO), not gated: a part never splits across pages
//            and the engine caps short problems at 20 a page (DN-1), so a typed count can leave a gap (the mixed-m2
//            engine lane owns page flow)
//   DENSITY  a set of 2+ skills prints at least as many problems a page as the same skills, at the same counts,
//            printed singly (each skill on its own pages, as many as its count needs at its own full page)
//   FACTS    a fast-facts-only set in Pages mode prints fact rows: 10 / 6 / 5 columns at S / M / L (8 when an answer
//            is over 99; division facts across in 3)
//   NOT3     no default print is ever 3 or fewer problems a page (the reported bug)
//   FOOTER   the teacher footer names the skills in words, never a raw id (lead, 2026-11-03)
//   TARGETS  every dialog control and Quick Start Print button >= 44 x 44 at 1366 / 820 / 390 (critic r1 D7)
//   LARGER   the Larger preview pane: page 1 at once, later pages mount only when scrolled near; Esc order
//   HOVERZOOM the hover zoom is >= 80 % of the viewport height at 1366x768 and hides on leave / Esc
//   SUMMARY  the summary's "n a page" / "n on page 1" is what page 1 holds (critic r1 D5, D9)
//
//   node tests/scripts/ws-simple-print.cjs              the gate (prints ws-simple-print: OK / FAIL)
//   node tests/scripts/ws-simple-print.cjs --backtest   the same measure on the old dialog's page plan (one request
//                                                        per small page, a section of 1-2 per skill): must FAIL
//   --sizes S,M  --sets six,facts                        focus
'use strict';
const { open } = require('../lib/ws-harness.cjs');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const SIZES = arg('sizes', 'S,M,L').split(',');
const sk = (c, s) => ({ categoryId: c, skillId: s });
const SETS = {
    six: [sk('addition', 'add_facts'), sk('subtraction', 'sub_facts'), sk('multiplication', 'mult_facts'), sk('division', 'div_facts'), sk('subtraction', 'missing_add_sub'), sk('division', 'missing_mult_div')],
    facts: [sk('addition', 'add_facts'), sk('subtraction', 'sub_facts'), sk('multiplication', 'mult_facts'), sk('division', 'div_facts')],
    addsub: [sk('addition', 'add_facts'), sk('subtraction', 'sub_facts')],
    missing: [sk('subtraction', 'missing_add_sub'), sk('division', 'missing_mult_div')],
};
const ONLY = arg('sets', '') ? arg('sets', '').split(',') : Object.keys(SETS);
const FACT_COLS = { S: 10, M: 6, L: 5 };

(async () => {
    const app = await open({ seed: 7 });
    const page = app.page;
    await page.evaluate(() => window.__mqLoadDeferred());
    const fails = [];
    const rows = [];
    const F2 = (t) => fails.push('UI3 ' + t);
    for (const name of ONLY) {
        const list = SETS[name];
        for (const size of SIZES) {
            const r = await page.evaluate(async ({ list, size, backtest }) => {
                const m = await import('/js/modules/simple-print.js');
                const measure = async (doc) => {
                    const f = document.createElement('iframe');
                    f.style.cssText = 'position:fixed;left:-3000px;top:0;width:900px;height:1200px;border:0';
                    document.body.appendChild(f);
                    await new Promise((res) => { f.onload = res; f.srcdoc = window.sheetDocument(doc, 'm', { paper: 'A4' }); });
                    for (let i = 0; i < 40; i++) { if (f.contentDocument.documentElement.getAttribute('data-ws-fonts') === 'ready') break; await new Promise((x) => setTimeout(x, 100)); }
                    const pages = [...f.contentDocument.querySelectorAll('.ws-page')].map((pg) => {
                        const body = pg.querySelector('.ws-body') || pg;
                        const b = body.getBoundingClientRect();
                        const cells = [...pg.querySelectorAll('.ws-cell')];
                        let area = 0;
                        for (const c of cells) { const r = c.getBoundingClientRect(); area += r.width * r.height; }
                        // problem area: the body from its top to the page's footer (or the body's bottom)
                        const foot = pg.querySelector('.ws-foot');
                        const bottom = foot ? foot.getBoundingClientRect().top : b.bottom;
                        const top = b.top;
                        return { cells: cells.length, fill: area / Math.max(1, b.width * (bottom - top)) };
                    });
                    f.remove();
                    return pages;
                };
                const out = {};
                if (backtest) {
                    // the old dialog: Mixed practice / Sections planned 8 a page at M, each page ONE request with a section of 1-2 per skill
                    const per = 8, n = list.length;
                    const counts = list.map((_, i) => Math.floor(per / n) + (i < per % n ? 1 : 0));
                    const res = await window.buildSheet({ role: 'independent', size, look: 'auto', paper: 'A4', seed: 5, sections: list.map((s, i) => ({ skills: [s], count: counts[i] })).filter((x) => x.count > 0), key: { on: true } });
                    out.def = { pages: res.pageCount, total: (res.items || []).filter(Boolean).length, cols: 0, arrangement: 'old-dialog', counts, measured: await measure(res.pupilHtml) };
                    out.p41 = out.def;
                } else {
                    const o = { how: 'pages', n: 1, size, cols: 'auto', key: true, arrange: 'sections', seed: 4242, title: true };
                    const b = await m.buildSimple(list.map((s) => Object.assign({ amt: '' }, s)), o);
                    // FOOTER (lead, 2026-11-03): the teacher footer names the skills in words, never a raw id like add_facts
                    const foots = b.pupilHtml.match(/<footer[^>]*>[\s\S]*?<\/footer>/g) || [];
                    const ids = list.map((s) => s.skillId).filter((id) => foots.some((f) => new RegExp('\\b' + id + '\\b').test(f)));
                    out.def = { pages: b.pages, total: b.total, cols: b.cols, colsList: b.colsList, arrangement: b.arrangement, counts: b.counts, footerIds: ids, measured: await measure(b.pupilHtml) };
                    const b41 = await m.buildSimple(list.map((s) => Object.assign({ amt: '' }, s)), Object.assign({}, o, { how: 'problems', n: 41 }));
                    out.p41 = { pages: b41.pages, total: b41.total, arrangement: b41.arrangement, measured: await measure(b41.pupilHtml) };
                }
                // each skill printed singly in sections (one page)
                out.single = [];
                if (list.length > 1) for (const s of list) {
                    const b = await m.buildSimple([Object.assign({ amt: '' }, s)], { how: 'pages', n: 1, size, cols: 'auto', key: false, arrange: 'sections', seed: 4242, title: true });
                    out.single.push({ key: s.skillId, perPage: b.total / Math.max(1, b.pages), cols: b.cols, built: (out.def.counts || [])[out.single.length] || 0 });
                }
                return out;
            }, { list, size, backtest: has('backtest') });
            const tag = `${name} @${size}`;
            const fillOf = (x, exemptLast) => x.measured.map((p, i) => ((exemptLast && i === x.measured.length - 1 && x.measured.length > 1) ? null : p.fill)).filter((v) => v !== null);
            const defFills = fillOf(r.def, false);
            const minFill = Math.min(...defFills);
            const perPage = r.def.total / Math.max(1, r.def.pages);
            // the same counts printed singly: each skill on ceil(count / its full page) pages of its own
            const singlePages = r.single.reduce((t, x) => t + Math.max(1, Math.ceil((x.built || 0) / Math.max(1, x.perPage))), 0);
            const minSingle = r.single.length ? +(r.def.total / Math.max(1, singlePages)).toFixed(1) : 0;
            const p1 = (r.def.measured[0] || {}).cells || 0;
            rows.push(`${tag.padEnd(14)} ${String(r.def.arrangement).padEnd(10)} def ${r.def.total} on ${r.def.pages}p (cols ${(r.def.colsList || [r.def.cols]).join('/')}) fill ${defFills.map((f) => Math.round(f * 100) + '%').join(' ')} · 41: ${r.p41.total} on ${r.p41.pages}p fill ${r.p41.measured.map((p) => Math.round(p.fill * 100) + '%').join(' ')} (INFO) · singly ${r.single.length ? minSingle + ' a page' : '-'}`);
            if (minFill < 0.6) fails.push(`${tag}: FILL ${Math.round(minFill * 100)} % < 60 % of the problem area`);
            if (r.single.length && perPage < minSingle) fails.push(`${tag}: DENSITY ${perPage.toFixed(1)} a page < ${minSingle} a page for the same counts printed singly`);
            if ((r.def.footerIds || []).length) fails.push(`${tag}: FOOTER prints raw skill ids (${r.def.footerIds.join(', ')})`);
            if (p1 <= 3 || (r.p41.measured[0] || {}).cells <= 3) fails.push(`${tag}: NOT3 page 1 holds ${p1} problems`);
            if (!has('backtest') && (name === 'facts' || name === 'addsub')) {
                {
                    const want = FACT_COLS[size];
                    const cl = r.def.colsList && r.def.colsList.length ? r.def.colsList : [r.def.cols];
                    if (r.def.arrangement !== 'facts') fails.push(`${tag}: FACTS a fast-facts set printed as ${r.def.arrangement}, not fact rows`);
                    else if (!cl.some((c) => c === want || (c === 8 && want === 10))) fails.push(`${tag}: FACTS ${cl.join('/')} columns, want ${want}`);
                }
            }
        }
    }
    // TARGETS (critic r1 D7) and SUMMARY (critic r1 D5/D9): the dialog's controls are >= 44 x 44 at 1366 / 820 / 390,
    // every Quick Start card's Print button too, and the summary's "n a page" is the problems page 1 really holds
    if (!has('backtest')) {
        await page.evaluate((six) => { localStorage.removeItem('mq_simple_print'); window.openSimplePrint(six, { from: 'tray', more() {} }); }, SETS.addsub);
        for (let i = 0; i < 120; i++) { const ok = await page.evaluate(async () => { const m = await import('/js/modules/simple-print.js'); const st = m.simplePrintState(); return st && st.built && !st.busy; }); if (ok) break; await new Promise((r) => setTimeout(r, 250)); }
        for (const w of [1366, 820, 390]) {
            await page.setViewport({ width: w, height: w === 390 ? 844 : 900, deviceScaleFactor: 1 });
            await new Promise((r) => setTimeout(r, 300));
            const small = await page.evaluate(() => [...document.querySelectorAll('.sp-dialog button, .sp-dialog input, .sp-dialog select, .sp-dialog summary, #quickSkillsGrid .qs-print-btn')]
                .filter((el) => el.offsetParent !== null).map((el) => { const r = el.getBoundingClientRect(); return { t: (el.dataset.sp || el.id || el.className || '').toString().slice(0, 20), w: Math.round(r.width), h: Math.round(r.height) }; })
                .filter((x) => x.w < 44 || x.h < 44));
            if (small.length) fails.push(`dialog @${w}: TARGETS ${small.length} under 44 x 44 (${small.slice(0, 4).map((x) => `${x.t} ${x.w}x${x.h}`).join(', ')})`);
        }
        const st = await page.evaluate(async () => { const m = await import('/js/modules/simple-print.js'); const s = m.simplePrintState(); window.closeSimplePrint(); return s; });
        const said = /= (\d+) a page|(\d+) on page 1/.exec(st.built.line || '');
        const n = said ? Number(said[1] || said[2]) : NaN;
        if (!(n === st.built.perPage)) fails.push(`summary: SUMMARY "${st.built.line}" vs ${st.built.perPage} built on page 1`);
        // SUMMARY on Mixed up (it falls back for the six set) and a one-skill fact card (critic r2 D1, D2):
        // a "c columns x r rows = n a page" line must multiply out, and n must be page 1's problems
        const sums = await page.evaluate(async (six) => {
            const m = await import('/js/modules/simple-print.js');
            const out = [];
            for (const [list, arrange] of [[six, 'mixed'], [[{ categoryId: 'multiplication', skillId: 'mult_facts' }], 'sections']]) {
                const b = await m.buildSimple(list.map((s) => Object.assign({ amt: '' }, s)), { how: 'pages', n: 1, size: 'M', cols: 'auto', key: true, arrange, seed: 4242, title: true });
                out.push({ arrange, line: m.summaryLine(b, { key: true }), perPage: b.perPage });
            }
            return out;
        }, SETS.six);
        for (const x of sums) {
            const g = /(\d+) columns × (\d+) rows = (\d+) a page/.exec(x.line);
            const on = /(\d+) on page 1/.exec(x.line);
            if (g && (Number(g[1]) * Number(g[2]) !== Number(g[3]) || Number(g[3]) !== x.perPage)) fails.push(`summary ${x.arrange}: SUMMARY "${x.line}" does not multiply out to page 1's ${x.perPage}`);
            if (!g && !(on && Number(on[1]) === x.perPage)) fails.push(`summary ${x.arrange}: SUMMARY "${x.line}" does not say page 1's ${x.perPage}`);
        }
        const qs = await page.evaluate(() => [...document.querySelectorAll('#quickSkillsGrid .qs-print-btn')].map((el) => el.getBoundingClientRect()).filter((r) => r.width < 44 || r.height < 44).length);
        if (qs) fails.push(`quick cards: TARGETS ${qs} Print buttons under 44 x 44`);
    }
    // simple-print-2 (owner items 4–6, 2026-11-03)
    //   COLS7     a set with no fast facts never offers 7–10 across, and a non-fact part never prints 7+ across, even
    //             when Exactly 9 is asked; a set with facts offers 10
    //   EXACT     Exactly n: a part that cannot take n prints at its own max and the summary says "(max)"; Aim for n: no "(max)"
    //   QUICK     quick prints save / rename / delete / open / share (code and link) round trip; Fast facts open filled in
    //   WITHIN    every + − × ÷ skill's Highest number (its `band`): every item's largest number (the sum, the number
    //             started from, the product, the number shared) is at most the chosen value; fact sets: every item uses a
    //             ticked set; both options survive a share code (skill code with options)
    //   --backtest-options  the same COLS7 / WITHIN measures on the OLD behaviour (the asked 9 sent to every part as is; a
    //             generator that ignores Highest number, dealing at the skill's largest value): both must FAIL
    if (!has('backtest')) {
        console.error('ws-simple-print: r2 …');
        const r2 = await page.evaluate(async ({ sets, bt }) => {
            const m = await import('/js/modules/simple-print.js');
            const out = { fails: [], info: [] };
            const F = (x) => out.fails.push(x);
            const L = (l) => l.map((s) => Object.assign({ amt: '' }, s));
            if (bt) {
                for (const size of ['S', 'M']) {
                    // the old pass-through: the asked 9 sent as is to a Mixed up page of non-fact problems
                    const res = await window.buildSheet({ role: 'mixed-practice', arrangement: 'mixed', columns: 9, size, look: 'auto', paper: 'A4', seed: 5, key: { on: false }, sections: [{ skills: sets.missing, count: 24, columns: 9 }] });
                    const c = ((res.fits && res.fits.sections) || []).map((x) => x.cols).concat(res.fits && res.fits.cols ? [res.fits.cols] : []);
                    if (c.some((x) => x > 6)) F(`COLS7 (old) missing mixed @${size}: a non-fact part prints ${c.join('/')} across`);
                }
            }
            // COLS7 + EXACT on the six set (facts + missing numbers) and the missing set (no facts)
            for (const size of bt ? [] : ['S', 'M']) {
                for (const mode of ['exact', 'aim']) {
                    for (const [nm, list, arrange] of [['six', sets.six, 'sections'], ['missing', sets.missing, 'sections'], ['missing-mixed', sets.missing, 'mixed']]) {
                        const o = { how: 'pages', n: 1, size, cols: 9, colsMode: mode, key: false, arrange, seed: 4242, title: true };
                        const b = await m.buildSimple(L(list), o);
                        const line = m.summaryLine(b, o);
                        const big = (b.types || []).filter((t) => t.name !== 'Facts' && t.max > 6);
                        if (big.length || (/missing/.test(nm) && (b.colsList || []).concat([b.cols]).some((c) => c > 6))) F(`COLS7 ${nm} @${size} ${mode} 9: a non-fact part prints ${big.map((t) => t.name + ' ' + t.max).join(', ') || (b.colsList || []).join('/')} across`);
                        if (mode === 'exact' && !/\(max\)/.test(line)) F(`EXACT ${nm} @${size}: Exactly 9 capped parts but the summary does not say (max): "${line}"`);
                        if (mode === 'aim' && /\(max\)/.test(line)) F(`EXACT ${nm} @${size}: Aim for 9 says (max): "${line}"`);
                        out.info.push(`${nm} @${size} ${mode} 9: ${line}`);
                    }
                }
            }
            const optsIn = async (list) => {
                window.openSimplePrint(list, { from: 'tray' });
                for (let i = 0; i < 80; i++) { const st = m.simplePrintState(); if (st && st.built && !st.busy) break; await new Promise((r) => setTimeout(r, 200)); }
                const v = [...document.querySelectorAll('#spCols option')].map((x) => x.value).filter((x) => x !== 'auto').map(Number);
                window.closeSimplePrint();
                return Math.max(...v);
            };
            localStorage.setItem('mq_simple_print', JSON.stringify({ cols: 9, colsMode: 'exact' }));
            const noF = bt ? 6 : await optsIn(sets.missing), withF = bt ? 10 : await optsIn(sets.six);
            if (noF > 6) F(`COLS7 the missing set (no facts) offers ${noF} columns`);
            if (withF !== 10) F(`COLS7 the six set (with facts) offers up to ${withF} columns, want 10`);
            localStorage.removeItem('mq_simple_print');
            if (!bt) {
                // EXACT (critic r1 #1): Aim and Exactly must plan different pages where they should differ: 25 problems
                // asked 6 across: Exactly prints 6 (a last row of 1), Aim takes 5 (5 full rows)
                const plan = async (mode) => { const b = await m.buildSimple(L([sets.missing[0]]), { how: 'problems', n: 25, size: 'M', cols: 6, colsMode: mode, key: false, arrange: 'sections', seed: 4242, title: true }); return JSON.stringify([b.colsList, b.cols, b.rows, b.perPage, b.pages]); };
                const pe = await plan('exact'), pa = await plan('aim');
                if (pe === pa) F(`EXACT Aim for 6 and Exactly 6 plan the same page for 25 problems: ${pe}`);
                out.info.push(`EXACT 25 problems, 6 asked: exact ${pe} · aim ${pa}`);
                // DIVFACTS (owner bug, 2026-11-03: Division Facts (1-12), Pages 1, Small, Columns 5 printed "3 columns x 11 rows" at
                // every size - the across form capped at 3). ÷ facts print fact rows like the other facts: Auto gives a different
                // count at S / M / L (10 / 6 / 5, 8 with a long answer), and an explicit Columns 5 prints 5.
                {
                    const dv = [{ categoryId: 'division', skillId: 'div_facts', amt: '' }];
                    const want = { S: [10, 8], M: [6], L: [5] };
                    const per = {};
                    for (const size of ['S', 'M', 'L']) {
                        const b = await m.buildSimple(dv, { how: 'pages', n: 1, size, cols: 'auto', key: false, arrange: 'sections', seed: 4242, title: true });
                        const cl = (b.colsList && b.colsList.length ? b.colsList : [b.cols]).map(Number);
                        per[size] = b.total / Math.max(1, b.pages);
                        if (!cl.some((c) => want[size].includes(c))) F(`DIVFACTS div_facts @${size} Auto: ${cl.join('/')} columns, want ${want[size].join(' or ')}`);
                        for (const mode of ['exact', 'aim']) {
                            const b5 = await m.buildSimple(dv, { how: 'pages', n: 1, size, cols: 5, colsMode: mode, key: false, arrange: 'sections', seed: 4242, title: true });
                            const c5 = (b5.colsList && b5.colsList.length ? b5.colsList : [b5.cols]).map(Number);
                            if (!c5.includes(5)) F(`DIVFACTS div_facts @${size} Columns 5 (${mode}): printed ${c5.join('/')} columns`);
                        }
                    }
                    if (per.S === per.M || per.M === per.L) F(`DIVFACTS div_facts a page S/M/L = ${per.S}/${per.M}/${per.L}: the size changes nothing`);
                    out.info.push(`DIVFACTS div_facts a page S/M/L = ${per.S}/${per.M}/${per.L}`);
                }
                // SUMMARY (critic r1 #5): only the *_facts ids are named "Facts"
                const cb = await m.buildSimple(L([{ categoryId: 'addition', skillId: 'add_100_mixed' }, sets.missing[0]]), { how: 'pages', n: 1, size: 'M', cols: 'auto', key: false, arrange: 'sections', seed: 4242, title: true });
                if ((cb.types || []).some((t) => t.name === 'Facts')) F(`SUMMARY column addition named "Facts": ${m.summaryLine(cb, { key: false })}`);
                // FOOTER (critic r1 #4): the footer names the chosen options like the title
                for (const [sk, want, not] of [[{ categoryId: 'addition', skillId: 'add_100_mixed', opts: { band: 50 } }, /within 50\b/, /within 100\b/], [{ categoryId: 'multiplication', skillId: 'mult_facts', opts: { constant: [6, 7, 8] } }, /6–8/, /1-12/]]) {
                    const b = await m.buildSimple(L([sk]), { how: 'pages', n: 1, size: 'M', cols: 'auto', key: true, arrange: 'sections', seed: 4242, title: true });
                    const foots = (b.pupilHtml.match(/<footer[^>]*>[\s\S]*?<\/footer>/g) || []).map((f) => f.replace(/<[^>]+>/g, ' '));
                    if (!foots.length || !foots.every((f) => want.test(f) && !not.test(f))) F(`FOOTER ${sk.skillId} ${JSON.stringify(sk.opts)}: footer "${(foots[0] || '').replace(/\s+/g, ' ').trim().slice(0, 80)}" does not name the options`);
                }
                // FACTPATTERN (critic r1 #3, L10): on a tables 6–8 fact page no column or diagonal is one table all the way
                // down, and at most half the columns hold a run of 3 rows of one table (with 2–4 ticked tables some 3-runs
                // are unavoidable: the generator cannot know the page's column count, and a run-free deal for every column
                // count 5–10 and both diagonals does not exist for 3 values; a fixed cycle makes EVERY column one table)
                for (const size of ['S', 'M', 'L']) {
                    for (const seed of [4242, 77]) {
                        const set = [6, 7, 8];
                        const b = await m.buildSimple(L([{ categoryId: 'multiplication', skillId: 'mult_facts', opts: { constant: set } }]), { how: 'pages', n: 1, size, cols: 'auto', key: false, arrange: 'sections', seed, title: true });
                        const cells = (b.firstHtml.split('class="ws-cell ').slice(1)).map((h) => (h.slice(h.indexOf('>') + 1).replace(/<[^>]+>/g, ' ').match(/\d+/g) || []).map(Number).slice(1, 3)).map((ns) => ns.filter((x) => set.includes(x)));
                        const c = b.cols, rows = Math.ceil(cells.length / c);
                        const at = (r, j) => (r < rows && j >= 0 && j < c ? cells[r * c + j] : null);
                        const share = (xs) => xs.every(Boolean) && set.some((v) => xs.every((x) => x.includes(v)));
                        let runs = 0, whole = [];
                        for (let j = 0; j < c; j++) {
                            const col = Array.from({ length: rows }, (_, r) => at(r, j)).filter(Boolean);
                            if (col.length >= 3 && share(col)) whole.push(`column ${j + 1}`);
                            for (let r = 0; r + 2 < rows; r++) { if (share([at(r, j), at(r + 1, j), at(r + 2, j)])) { runs++; break; } }
                            for (const dj of [1, -1]) { const dg = Array.from({ length: rows }, (_, r) => at(r, j + dj * r)).filter(Boolean); if (dg.length >= 4 && share(dg)) whole.push(`diagonal from column ${j + 1}`); }
                        }
                        if (whole.length || runs > Math.floor(c / 2)) F(`FACTPATTERN mult_facts 6–8 @${size} seed ${seed}: ${whole.slice(0, 3).join(', ') || ''} ${runs} of ${c} columns repeat one table 3 rows`);
                    }
                }
            }
            // QUICK
            if (bt) return Object.assign(out, await within());
            localStorage.removeItem('mq_quick_prints');
            const skills = [{ categoryId: 'multiplication', skillId: 'mult_facts', opts: { constant: [6, 7, 8] }, amt: '' }, { categoryId: 'addition', skillId: 'add_20_mixed', opts: { band: 10 }, amt: '40%' }];
            const pr = { how: 'problems', n: 30, sets: 2, size: 'S', cols: 5, colsMode: 'exact', key: false, arrange: 'sections' };
            const rec = m.saveQuickPrint('Tables 6–8', skills, pr);
            const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
            if (!rec || m.quickPrints().length !== 1) F('QUICK save: not saved');
            const code = m.encodeQuickPrint(rec);
            const back = m.decodeQuickPrint(code);
            const backL = m.decodeQuickPrint('https://x.org/index.html?qp=' + code + '&z=1');
            if (!back || !same(back.skills, rec.skills) || !same(back.print, rec.print) || back.name !== rec.name) F(`QUICK code round trip: ${JSON.stringify(back)}`);
            if (!backL || !same(backL.skills, rec.skills)) F('QUICK link round trip');
            if (!m.renameQuickPrint(rec.id, 'Times 6 to 8') || m.quickPrints()[0].name !== 'Times 6 to 8') F('QUICK rename');
            const imp = m.importQuickPrint(code);
            if (!imp || m.quickPrints().length !== 1) F('QUICK import: the same setup twice is kept twice');
            m.openQuickPrint(rec.id, { from: 'tray' });
            for (let i = 0; i < 80; i++) { const st = m.simplePrintState(); if (st && st.built && !st.busy) break; await new Promise((r) => setTimeout(r, 200)); }
            const st = m.simplePrintState();
            if (!st || !same(st.list.map((x) => [x.key, x.opts, x.amt]), skills.map((x) => [`${x.categoryId}:${x.skillId}`, x.opts, x.amt])) || st.prefs.size !== 'S' || st.prefs.how !== 'problems' || st.prefs.nProblems !== 30 || st.prefs.cols !== 5 || st.prefs.colsMode !== 'exact' || st.prefs.sets !== 2 || st.prefs.key !== false) F(`QUICK open: the dialog is not filled in: ${JSON.stringify(st && { list: st.list, prefs: st.prefs })}`);
            window.closeSimplePrint();
            m.deleteQuickPrint(rec.id);
            if (m.quickPrints().length !== 0) F('QUICK delete');
            for (const ff of m.FAST_FACTS) {
                m.openQuickPrint(ff.id, { from: 'tray' });
                const s2 = m.simplePrintState();
                if (!s2 || s2.list.length !== ff.skills.length || s2.quick !== ff.id) F(`QUICK Fast facts ${ff.name} did not open`);
                for (const x of ff.skills) if (!window.generateQuestionFor({ category: x.categoryId, skill: x.skillId, seed: 3 })) F(`QUICK Fast facts ${ff.name}: ${x.skillId} deals nothing`);
                window.closeSimplePrint();
            }
            localStorage.removeItem('mq_simple_print');
            Object.assign(out, await within());
            return out;
            // WITHIN + fact sets + option share codes, over every + − × ÷ skill with the options
            async function within() {
            const nums = (q) => (String(q.text || '').replace(/<[^>]+>/g, ' ').replace(/(\d),(\d{3})/g, '$1$2').match(/\d+(\.\d+)?/g) || []).map(Number).concat(Number.isFinite(Number(q.ans)) ? [Number(q.ans)] : []);
            const W = window;
            let n = 0, skillsSeen = 0;
            for (const cat of ['addition', 'subtraction', 'multiplication', 'division']) {
                for (const sk of (W.SKILLS[cat] || [])) {
                    const id = sk && (sk.v || sk.id);
                    if (!id || sk.retired || sk.tombstone || sk.hidden) continue;
                    const s = { categoryId: cat, skillId: id };
                    const { band, sets: fs } = m.numberOptionsOf(s);
                    if (!band && !fs) continue;
                    skillsSeen++;
                    // critic r1 #2: a band shown as "Highest number N" on × / ÷ facts must admit every fact with an answer
                    // up to N: 1 × 12 = 12, so a factor of 12 must be dealt whenever N >= 12
                    if (band && (bt || band.answer) && /_facts$/.test(id) && (cat === 'multiplication' || cat === 'division')) {
                        for (const v of band.values.filter((x) => x >= 12)) {
                            let top = 0;
                            for (let i = 0; i < 120; i++) { const q = W.generateQuestionFor({ category: cat, skill: id, opts: { band: v }, seed: 500 + i }); if (!q) continue; const ns = nums(q); const f = cat === 'multiplication' ? ns.filter((x) => x !== Number(q.ans)) : ns.filter((x) => x !== Math.max(...ns)); top = Math.max(top, ...f, 0); }
                            if (top < 12) F(`WITHIN ${cat}:${id} "Highest number ${v}" never deals a 12 (1 × 12 = 12 is within ${v}): the band is not an answer bound`);
                        }
                    }
                    for (const v of band ? band.values : []) {
                        for (let i = 0; i < 12; i++) {
                            const q = W.generateQuestionFor({ category: cat, skill: id, opts: { band: bt ? Math.max(...band.values) : v }, seed: 101 + i * 7 });
                            if (!q) continue;
                            n++;
                            const top = Math.max(...nums(q));
                            if (top > v) { F(`WITHIN ${cat}:${id} Highest number ${v}: item "${String(q.text).replace(/<[^>]+>/g, ' ').slice(0, 40)}" reaches ${top}`); break; }
                        }
                        const pay = W.encodeOptionPayload ? W.encodeOptionPayload(cat, id, W.packOptions(cat, id, { band: v })) : null;
                        if (pay !== null && JSON.stringify(W.decodeOptionPayload(cat, id, '~' + pay)) !== JSON.stringify(W.packOptions(cat, id, { band: v }))) F(`WITHIN ${cat}:${id} band ${v} does not survive a share code`);
                    }
                    if (fs) {
                        const pick = fs.values.map((x) => x.v).filter((x) => x >= 6 && x <= 8);
                        const want = pick.length ? pick : fs.values.slice(0, 2).map((x) => x.v);
                        for (let i = 0; i < 16; i++) {
                            const q = W.generateQuestionFor({ category: cat, skill: id, opts: { constant: want }, seed: 31 + i * 11 });
                            if (!q) continue;
                            n++;
                            const ns = nums(q);
                            if (!ns.some((x) => want.includes(x))) { F(`WITHIN ${cat}:${id} fact sets ${want.join(',')}: item "${String(q.text).replace(/<[^>]+>/g, ' ').slice(0, 40)}" uses none`); break; }
                        }
                        const packed = W.packOptions(cat, id, { constant: want });
                        const pay = W.encodeOptionPayload(cat, id, packed);
                        if (JSON.stringify(W.decodeOptionPayload(cat, id, '~' + pay)) !== JSON.stringify(packed)) F(`WITHIN ${cat}:${id} fact sets do not survive a share code`);
                    }
                }
            }
            out.info.push(`WITHIN: ${skillsSeen} + − × ÷ skills with Highest number / fact sets, ${n} items read`);
            return { fails: out.fails, info: out.info };
            }
        }, { sets: SETS, bt: has('backtest-options') });
        rows.push(...r2.info);
        fails.push(...r2.fails);
        page.on('dialog', (d) => { fails.push('a browser dialog opened: ' + d.message()); d.dismiss().catch(() => {}); });
        console.error('ws-simple-print: MIXLAYOUT / COLS1 / SKOPTIONS …');
        const r4 = await page.evaluate(async () => {
            const FL = [], out = { info: [] }; const F = (t) => FL.push(t);
            const m = await import('/js/modules/simple-print.js');
            // MIXLAYOUT + COLS1 (owner 2026-11-03): the Mixed up layout choice shows only for Mixed up, each value
            // reaches the request, survives save / share; Columns offers 1 and 1 reaches the request
            {
                const idle = async () => { for (let i = 0; i < 100; i++) { const st = m.simplePrintState(); if (st && st.built && !st.busy) return; await new Promise((r) => setTimeout(r, 150)); } };
                const q = (sel) => document.querySelector(sel);
                const click = async (sel) => { const el = q(sel); if (!el) return false; el.click(); await new Promise((r) => setTimeout(r, 20)); await idle(); return true; };
                localStorage.removeItem('mq_simple_print');
                m.openSimplePrint([{ categoryId: 'addition', skillId: 'add_facts' }, { categoryId: 'subtraction', skillId: 'missing_add_sub' }], {});
                await idle();
                await click('[data-sp="arrange"][data-v="sections"]');
                if (q('[data-sp="mixlayout"]')) F('MIXLAYOUT the layout choice shows for In sections');
                await click('[data-sp="arrange"][data-v="mixed"]');
                const btns = [...document.querySelectorAll('[data-sp="mixlayout"]')].map((b) => b.dataset.v + ':' + b.getAttribute('aria-checked'));
                // ui3 check D1: the Layout choice shows ONLY when the engine draws the layouts (print-sheet.js MIX_LAYOUTS);
                // a choice that changes nothing on the page is not offered
                const eng = m.engineMixLayouts ? m.engineMixLayouts() : null;
                if (!eng || eng.length < 2) {
                    if (btns.length) F(`MIXLAYOUT the Layout choice shows (${btns.join(' ')}) but the engine draws no layouts (print-sheet.js has no MIX_LAYOUTS)`);
                } else {
                    if (btns.length !== eng.length) F(`MIXLAYOUT Mixed up shows ${JSON.stringify(btns)}, the engine draws ${eng.join(', ')}`);
                    const htmls = {};
                    for (const v of eng) {
                        if (!(await click(`[data-sp="mixlayout"][data-v="${v}"]`))) { F(`MIXLAYOUT no ${v} button`); continue; }
                        const mixed = m.lastSimpleRequests().filter((r) => r.arrangement === 'mixed').slice(-1)[0];
                        if (!mixed || mixed.mixLayout !== v) F(`MIXLAYOUT ${v} does not reach the request (${mixed && mixed.mixLayout})`);
                        if (!q('.sp-mixl .sp-hint') || !q('.sp-mixl .sp-hint').textContent.trim()) F(`MIXLAYOUT ${v} has no hint`);
                        htmls[v] = (q('#spFrame') && q('#spFrame').srcdoc) || '';
                    }
                    if (new Set(Object.values(htmls)).size < 2) F('MIXLAYOUT every layout prints the same page');
                }
                // the request field is carried all the same (a saved / shared value reaches the engine once it draws it)
                window.closeSimplePrint();
                m.openQuickPrint({ name: 'kept even', skills: [{ categoryId: 'addition', skillId: 'add_facts' }, { categoryId: 'subtraction', skillId: 'missing_add_sub' }], print: { how: 'pages', n: 1, arrange: 'mixed', mixLayout: 'even' } });
                await idle();
                {
                    const mixed = m.lastSimpleRequests().filter((r) => r.arrangement === 'mixed').slice(-1)[0];
                    if (!mixed || mixed.mixLayout !== 'even') F(`MIXLAYOUT a kept 'even' does not reach the request (${mixed && mixed.mixLayout})`);
                    // ui3 check D1: Mixed up asked, the engine printed sections: the dialog says why in plain words, and the
                    // summary says "In sections" only then
                    const b = m.simplePrintState().built || {};
                    const note = (q('.sp-note') || {}).textContent || '';
                    const line = String(b.line || '');
                    if (b.fellBack && !/Mixed up isn.t possible for these skills yet/.test(note)) F(`MIXLAYOUT fell back to sections without saying why ("${note.slice(0, 120)}")`);
                    if (b.fellBack && /until boxes of different sizes/.test(note)) F('MIXLAYOUT the fallback note is the engine\'s wording');
                    if (!b.fellBack && /In sections/.test(line)) F(`MIXLAYOUT Mixed up printed mixed but the summary says "${line}"`);
                    out.info.push(`MIXLAYOUT fallback: ${b.fellBack ? 'fell back' : 'mixed'} · "${note.slice(0, 80)}"`);
                }
                const st3 = m.simplePrintState();
                if (st3.prefs.mixLayout !== 'even') F('MIXLAYOUT not kept in the prefs');
                const rec3 = m.saveQuickPrint('Mixed even', [{ categoryId: 'addition', skillId: 'add_facts' }, { categoryId: 'subtraction', skillId: 'missing_add_sub' }], Object.assign({}, st3.prefs, { n: 1 }));
                const back3 = m.decodeQuickPrint(m.encodeQuickPrint(rec3));
                if (!rec3 || rec3.print.mixLayout !== 'even' || !back3 || back3.print.mixLayout !== 'even') F(`MIXLAYOUT does not survive save / share: ${JSON.stringify(back3 && back3.print)}`);
                const old = m.decodeQuickPrint(m.encodeQuickPrint({ name: 'old', skills: [{ categoryId: 'addition', skillId: 'add_facts' }], print: { arrange: 'mixed' } }));
                if (!old || old.print.mixLayout !== undefined) F('MIXLAYOUT an old code without it does not decode unchanged');
                // Columns 1
                const opt1 = q('#spCols option[value="1"]');
                if (!opt1 || !/across the page/.test(opt1.textContent)) F('COLS1 Columns has no "1 (across the page)"');
                if (opt1 && opt1.textContent.length > 22) F(`COLS1 the 1 option "${opt1.textContent}" is long enough to widen the select on a phone (ui3 check D6)`);
                if (q('#spCols option[value="7"]') && !m.simplePrintState().list.some((x) => /_facts$/.test(x.key))) F('COLS1 7+ offered without facts');
                await click('[data-sp="arrange"][data-v="sections"]');
                const sel = q('#spCols');
                const before = m.lastSimpleRequests().length;
                if (sel) { sel.value = '1'; sel.dispatchEvent(new Event('change', { bubbles: true })); await new Promise((r) => setTimeout(r, 20)); await idle(); }
                const got = m.lastSimpleRequests().slice(Math.max(0, before - 40)).filter((r) => (r.sections || []).some((s) => s.columns === 1) || r.columns === 1);
                if (!got.length) F('COLS1 Columns 1 does not reach the request');
                if (m.simplePrintState().prefs.cols !== 1) F('COLS1 not kept');
                const rec4 = m.decodeQuickPrint(m.encodeQuickPrint({ name: 'c1', skills: [{ categoryId: 'addition', skillId: 'add_facts' }], print: { cols: 1 } }));
                if (!rec4 || rec4.print.cols !== 1) F('COLS1 does not survive a share code');
                out.info.push('MIXLAYOUT / COLS1 checked');
                window.closeSimplePrint();
                // SKOPTIONS (owner 2026-11-03): div_facts → Options → How it is written: long / fraction reaches the
                // request, the preview draws it, the row says it
                for (const [form, mark] of [['long', /data-ws-ops="division"|data-ws-notation="bracket"/], ['fraction', /data-ws-notation="fraction"|ws-divfrac|ws-frac/]]) {
                    m.openSimplePrint([{ categoryId: 'division', skillId: 'div_facts' }], {});
                    await idle();
                    const ob = q('[data-sp="skoptions"][data-v="0"]');
                    if (!ob) { F('SKOPTIONS no Options button on the div_facts row'); break; }
                    const r0 = ob.getBoundingClientRect();
                    if (r0.width < 44 || r0.height < 44) F(`SKOPTIONS Options button ${Math.round(r0.width)}x${Math.round(r0.height)} < 44`);
                    ob.click();
                    await new Promise((r) => setTimeout(r, 100));
                    const sel = q('#skillOptionsPopover [aria-label="How it is written"] select');
                    if (!sel) { F('SKOPTIONS the options sheet has no "How it is written"'); window.closeSimplePrint(); break; }
                    const idx = [...sel.options].findIndex((o) => /^\s*(Long division|Fraction)/.test(o.textContent) && o.textContent.toLowerCase().startsWith(form === 'long' ? 'long' : 'fraction'));
                    sel.value = String(idx);
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                    await new Promise((r) => setTimeout(r, 50));
                    if (window.closeSkillOptionsPanel) window.closeSkillOptionsPanel();
                    await idle();
                    const last = m.lastSimpleRequests().slice(-1)[0];
                    const so = last && (last.sections || []).flatMap((x) => x.skills || []).find((x) => x.skillId === 'div_facts');
                    if (!so || !so.opts || so.opts.divForm !== form) F(`SKOPTIONS ${form}: the request carries ${JSON.stringify(so && so.opts)}`);
                    const st = m.simplePrintState();
                    const html = (q('#spFrame') && q('#spFrame').srcdoc) || '';
                    if (!mark.test(html)) F(`SKOPTIONS ${form}: the preview does not draw it`);
                    const sum = q('.sp-optsum');
                    if (!sum || !sum.textContent.trim()) F(`SKOPTIONS ${form}: the row shows no summary`);
                    else out.info.push(`SKOPTIONS ${form}: "${sum.textContent.trim()}"`);
                    void st;
                    window.closeSimplePrint();
                }
                m.deleteQuickPrint(rec3 && rec3.id);
            }
            return { fails: FL, info: out.info };
        });
        fails.push(...r4.fails); rows.push(...r4.info);
        // STUDENTBAR (owner 2026-11-03): pupil home, 3 skills selected → the bottom bar's Print lists those 3,
        // Send's link decodes to those 3 with their options, Play deals only those 3; none selected → disabled
        console.error('ws-simple-print: STUDENTBAR …');
        const r3 = await page.evaluate(async () => {
            const FL = []; const F = (t) => FL.push(t);
            const W = window;
            if (W.closeSimplePrint) W.closeSimplePrint();
            document.body.classList.remove('teacher-mode'); document.body.classList.add('student-mode');
            W.UnifiedSkills.clear ? W.UnifiedSkills.clear() : W.clearSkillQueue();
            await new Promise((r) => setTimeout(r, 50));
            const btn = (id) => document.getElementById(id);
            if (['studentSelAddBtn', 'studentSelPrintBtn', 'studentSelPlayBtn', 'studentSelSendBtn'].some((id) => !btn(id) || !btn(id).disabled)) F('STUDENTBAR buttons not disabled with nothing selected');
            if (!/Pick skills above/.test((btn('studentSelCount') || {}).textContent || '')) F('STUDENTBAR no "Pick skills above" hint with nothing selected');
            // owner 2026-11-04: no floating bar; no per-skill print button on the pupil Quick Start cards
            if (btn('studentSelBar')) F('STUDENTBAR the floating bar #studentSelBar is still on the page');
            W.renderQuickSkillsGrid && W.renderQuickSkillsGrid();
            await new Promise((r) => setTimeout(r, 200));
            if (document.querySelectorAll('#quickSkillsGrid .qs-print-btn').length) F('NOPRINT pupil Quick Start cards still carry a print button');
            const want = [['addition', 'add_facts', {}], ['subtraction', 'sub_facts', {}], ['multiplication', 'mult_facts', { constant: [6, 7] }]];
            for (const [c, k, o] of want) W.UnifiedSkills.add({ categoryId: c, skillId: k, skillLabel: k, opts: o });
            await new Promise((r) => setTimeout(r, 300));
            if (btn('studentSelPrintBtn').disabled) F('STUDENTBAR Print still disabled with 3 selected');
            for (const id of ['studentSelAddBtn', 'studentSelPlayBtn', 'studentSelSendBtn', 'studentSelPrintBtn']) { const r = btn(id).getBoundingClientRect(); if (r.width < 44 || r.height < 44) F(`STUDENTBAR ${id} ${Math.round(r.width)}x${Math.round(r.height)} < 44`); }
            const keys = want.map((x) => x[0] + ':' + x[1]).sort().join(',');
            // Print
            btn('studentSelPrintBtn').click();
            let st = null;
            for (let i = 0; i < 100; i++) { const m = await import('/js/modules/simple-print.js'); st = m.simplePrintState(); if (st) break; await new Promise((r) => setTimeout(r, 150)); }
            if (!st || st.list.map((x) => x.key).sort().join(',') !== keys) F(`STUDENTBAR Print lists ${st && st.list.map((x) => x.key)}`);
            else if (JSON.stringify((st.list.find((x) => x.key === 'multiplication:mult_facts') || {}).opts) !== JSON.stringify({ constant: [6, 7] })) F('STUDENTBAR Print drops the options');
            W.closeSimplePrint();
            // Send
            const link = W.sendStudentSelection();
            const code = decodeURIComponent((String(link).match(/[?&]c=([^&]+)/) || [])[1] || '');
            const parts = code ? W.parseSkillCodeParts(code.split('|')[0]) : [];
            if (parts.map((x) => x.categoryId + ':' + x.skillId).sort().join(',') !== keys) F(`STUDENTBAR Send link decodes to ${JSON.stringify(parts.map((x) => x.skillId))}`);
            const mp = parts.find((x) => x.skillId === 'mult_facts');
            if (!mp || !mp.opts || JSON.stringify(mp.opts.constant) !== '[6,7]') F(`STUDENTBAR Send drops the options: ${JSON.stringify(mp)}`);
            if (btn('studentSendBox').hidden || btn('studentSendLink').value !== link) F('STUDENTBAR Send link not shown');
            // Add to Quick Start: 3 cards, with their options, no duplicates on a second press
            const qsWas = JSON.stringify(W.customQuickSkills);
            W.customQuickSkills.splice(0, W.customQuickSkills.length);
            btn('studentSelAddBtn').click(); btn('studentSelAddBtn').click();
            const qk = W.customQuickSkills.map((x) => x.categoryId + ':' + x.skillId).sort().join(',');
            if (qk !== keys) F(`STUDENTBAR Add to Quick Start made ${qk}`);
            const qm = W.customQuickSkills.find((x) => x.skillId === 'mult_facts');
            if (!qm || JSON.stringify(qm.opts) !== JSON.stringify({ constant: [6, 7] })) F('STUDENTBAR Add to Quick Start drops the options');
            W.customQuickSkills.splice(0, W.customQuickSkills.length, ...JSON.parse(qsWas));
            W.saveQuickSkills && W.saveQuickSkills(); W.renderQuickSkillsGrid && W.renderQuickSkillsGrid();
            // Play
            W.playStudentSelection();
            await new Promise((r) => setTimeout(r, 400));
            const sel = (W.state.mixedModeSettings || {}).selectedSkills || {};
            const got = Object.entries(sel).flatMap(([c, l]) => l.map((k) => c + ':' + k)).sort().join(',');
            if (got !== keys || !W.state.isMixedMode) F(`STUDENTBAR Play plays ${got}`);
            W.state.isMixedMode = false;
            W.clearSkillQueue && W.clearSkillQueue();
            return FL;
        });
        fails.push(...r3);
        rows.push('STUDENTBAR checked');

        // UI3 (independent check of bf7b7656, 2026-11-03), each FAILS on that commit:
        //   ROWS    D5  each print skill row: one 44 x 44 gear "Options for <skill>", no second place for the same options
        //               (Highest number select / Tables link), the name on at most 2 lines, the row <= 110 px, at 1366 / 820
        //   COLSFIT D6  the Columns select stays inside the dialog at 390
        //   OPTKEY  D2  the Options panel takes keyboard focus on open (student view), Tab stays in it
        //   OPTESC  D3  Esc on an open Options panel closes only the panel; focus goes back to the gear
        //   TOAST   D4  with the bar shown, an "Added …" toast never covers Play / Send / Print
        //   BAR     D7  Send's link is a pop-up above the bar, <= 25 % of a 390 x 844 screen, closable with Esc
        //   FOCUS   D8  a control focused with Tab is never under the bar (scroll-padding-bottom = the bar's height)
        //   PUPIL   D9  a link sent from the pupil bar opens "Practice set: n skills", never "Your teacher has set up …";
        //               a teacher link is unchanged
        console.error('ws-simple-print: UI3 …');
        const mod = '/js/modules/simple-print.js';
        const idleJs = `(async () => { const m = await import('${mod}'); for (let i = 0; i < 120; i++) { const st = m.simplePrintState(); if (st && st.built && !st.busy) return true; await new Promise((r) => setTimeout(r, 150)); } return false; })()`;
        await page.evaluate(() => { document.body.classList.remove('teacher-mode'); document.body.classList.add('student-mode'); if (window.closeSimplePrint) window.closeSimplePrint(); if (window.state) { window.state.isPlaying = false; window.state.isMixedMode = false; } if (window.showView) window.showView('homeView'); });
        const three = [{ categoryId: 'addition', skillId: 'add_facts' }, { categoryId: 'division', skillId: 'div_facts' }, { categoryId: 'multiplication', skillId: 'mult_facts' }];
        for (const w of [1366, 820]) {
            await page.setViewport({ width: w, height: w === 1366 ? 768 : 1180, deviceScaleFactor: 1 });
            await page.evaluate((three) => { window.openSimplePrint(three, { from: 'student' }); }, three);
            await page.evaluate(idleJs);
            const rr = await page.evaluate(() => [...document.querySelectorAll('.sp-skills .sp-skill')].map((li) => {
                const nm = li.querySelector('.sp-skill-name');
                const lab = nm ? (nm.firstChild && nm.firstChild.nodeType === 3 ? nm.firstChild : nm) : null;
                let lines = 0;
                if (lab) { const rg = document.createRange(); rg.selectNodeContents(lab); lines = new Set([...rg.getClientRects()].map((r) => Math.round(r.top))).size; }
                const gears = [...li.querySelectorAll('.sp-optbtn')];
                const g = gears[0] && gears[0].getBoundingClientRect();
                return { name: nm ? nm.textContent.trim().slice(0, 30) : '?', h: Math.round(li.getBoundingClientRect().height), lines, gears: gears.length, gw: g ? Math.round(g.width) : 0, gh: g ? Math.round(g.height) : 0, label: gears[0] ? gears[0].getAttribute('aria-label') : '', dup: li.querySelectorAll('.sp-band, .sp-skopt').length };
            }));
            for (const x of rr) {
                if (x.gears !== 1) F2(`ROWS @${w} ${x.name}: ${x.gears} Options buttons`);
                else if (x.gw < 44 || x.gh < 44 || x.gw > 56) F2(`ROWS @${w} ${x.name}: Options ${x.gw}x${x.gh}, want a 44 px gear`);
                if (x.gears && !/^Options for /.test(x.label)) F2(`ROWS @${w} ${x.name}: Options is labelled "${x.label}"`);
                if (x.dup) F2(`ROWS @${w} ${x.name}: the row has a second place for the same options (Highest number / Tables)`);
                if (x.lines > 2) F2(`ROWS @${w} ${x.name}: the name wraps to ${x.lines} lines`);
                if (x.h > 110) F2(`ROWS @${w} ${x.name}: row ${x.h} px tall (> 110)`);
            }
            rows.push(`ROWS @${w}: ${rr.map((x) => `${x.name} ${x.h}px/${x.lines}l`).join(' · ')}`);
            await page.evaluate(() => window.closeSimplePrint());
        }
        // COLSFIT + OPTKEY + OPTESC at 390 and 1366 (student view)
        const two = [{ categoryId: 'division', skillId: 'div_facts' }, { categoryId: 'addition', skillId: 'add_facts' }];
        for (const [w, tv] of [[390, false], [1366, false], [1366, true]]) {
            await page.setViewport({ width: w, height: w === 390 ? 844 : 768, deviceScaleFactor: 1 });
            await page.evaluate((tv) => { document.body.classList.toggle('teacher-mode', tv); document.body.classList.toggle('student-mode', !tv); }, tv);
            await page.evaluate((two, tv) => window.openSimplePrint(two, { from: tv ? 'tray' : 'student' }), two, tv);
            await page.evaluate(idleJs);
            if (w === 390) {
                const fit = await page.evaluate(() => { const s = document.querySelector('#spCols'), d = document.querySelector('.sp-dialog'); if (!s || !d) return null; const a = s.getBoundingClientRect(), b = d.getBoundingClientRect(); return { r: Math.round(a.right), dr: Math.round(b.right), vw: window.innerWidth }; });
                if (!fit) F2('COLSFIT no Columns select');
                else if (fit.r > fit.dr || fit.r > fit.vw) F2(`COLSFIT @390 the Columns select ends at ${fit.r}, past the dialog (${fit.dr})`);
            }
            await page.focus('[data-sp="skoptions"][data-v="0"]');
            await page.keyboard.press('Enter');
            await new Promise((r) => setTimeout(r, 250));
            const k = await page.evaluate(() => { const p = document.getElementById('skillOptionsPopover'); return { open: !!p, inside: !!(p && p.contains(document.activeElement)) }; });
            if (!k.open) { F2(`OPTKEY @${w}${tv ? ' teacher' : ''} Enter on Options opens no panel`); await page.evaluate(() => window.closeSimplePrint()); continue; }
            if (!k.inside) F2(`OPTKEY @${w}${tv ? ' teacher' : ''} the Options panel opens without keyboard focus (student view)`);
            let out = 0;
            const where = [];
            for (let i = 0; i < 30; i++) { await page.keyboard.press('Tab'); const d = await page.evaluate(() => { const p = document.getElementById('skillOptionsPopover'), a = document.activeElement; return p && p.contains(a) ? '' : `${a.tagName}.${String(a.className).slice(0, 20)} "${(a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 24)}" (panel ${p ? 'open' : 'gone'})`; }); if (d) { out++; where.push(d); } }
            if (out) F2(`OPTKEY @${w}${tv ? ' teacher' : ''} Tab left the open Options panel ${out} times in 30 (${where.slice(0, 2).join('; ')})`);
            // OPTCHANGE (checker r2 N1): changing a control in the panel by keyboard keeps focus in the panel (the preview
            // redraw used to move it to the dialog's Print button, so the next Enter printed).
            const chg = await page.evaluate(async () => {
                const p = document.getElementById('skillOptionsPopover'); if (!p) return 'no panel';
                const sel = [...p.querySelectorAll('select')].find((x) => x.options.length > 1); if (!sel) return 'no select';
                sel.focus(); sel.selectedIndex = (sel.selectedIndex + 1) % sel.options.length; sel.dispatchEvent(new Event('change', { bubbles: true }));
                await new Promise((r) => setTimeout(r, 1200));
                const q = document.getElementById('skillOptionsPopover'); const a = document.activeElement;
                return q && q.contains(a) ? '' : `focus went to ${a.tagName}.${String(a.className).slice(0, 24)} "${(a.textContent || '').trim().slice(0, 16)}"`;
            });
            if (chg) F2(`OPTCHANGE @${w}${tv ? ' teacher' : ''} after changing an option: ${chg}`);
            await page.keyboard.press('Escape');
            await new Promise((r) => setTimeout(r, 150));
            const e = await page.evaluate(async (mod) => ({ pop: !!document.getElementById('skillOptionsPopover'), open: !!(await import(mod)).simplePrintState(), focus: (document.activeElement && document.activeElement.dataset && document.activeElement.dataset.sp) || (document.activeElement && document.activeElement.tagName) }), mod);
            if (e.pop) F2(`OPTESC @${w}${tv ? ' teacher' : ''} Esc leaves the Options panel open`);
            if (!e.open) F2(`OPTESC @${w}${tv ? ' teacher' : ''} one Esc closed the whole print dialog too`);
            if (e.focus !== 'skoptions') F2(`OPTESC @${w}${tv ? ' teacher' : ''} focus went to ${e.focus}, not back to Options`);
            await page.evaluate(() => window.closeSimplePrint && window.closeSimplePrint());
        }
        await page.evaluate(() => { document.body.classList.remove('teacher-mode'); document.body.classList.add('student-mode'); });
        // TOAST / BAR / FOCUS on the pupil home
        for (const w of [1366, 820, 390]) {
            await page.setViewport({ width: w, height: w === 1366 ? 768 : w === 820 ? 1180 : 844, deviceScaleFactor: 1 });
            const t = await page.evaluate(async () => {
                const W = window, out = [];
                if (W.showView) W.showView('homeView');
                W.clearSkillQueue && W.clearSkillQueue();
                await new Promise((r) => setTimeout(r, 100));
                W.UnifiedSkills.add({ categoryId: 'addition', skillId: 'add_facts', skillLabel: 'Addition Facts' });
                W.UnifiedSkills.add({ categoryId: 'division', skillId: 'div_facts', skillLabel: 'Division Facts' });
                await new Promise((r) => setTimeout(r, 300));
                window.scrollTo(0, 0);
                await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
                // PLACE: Print sits in the MAP row, beside a MAP button; Add / Play / Send right above it; all >= 44 and on screen width
                const pr = document.getElementById('studentSelPrintBtn');
                const row = document.querySelector('.start-buttons-container');
                const map = row && row.querySelector('.map-launch-btn');
                if (!row || !row.contains(pr)) out.push('PLACE Print is not in the MAP button row');
                else { const a = pr.getBoundingClientRect(), m = map.getBoundingClientRect(); if (a.bottom < m.top - 60 || a.top > m.bottom + 60) out.push('PLACE Print is not beside the MAP buttons'); }
                const acts = document.getElementById('studentSelActions');
                if (!acts || acts.compareDocumentPosition(row) !== Node.DOCUMENT_POSITION_FOLLOWING) out.push('PLACE Add / Play / Send are not right above the MAP row');
                for (const id of ['studentSelAddBtn', 'studentSelPlayBtn', 'studentSelSendBtn', 'studentSelPrintBtn']) {
                    const r = document.getElementById(id).getBoundingClientRect();
                    if (r.width < 44 || r.height < 44 || r.right > window.innerWidth + 1 || r.left < -1) out.push(`PLACE ${id} ${Math.round(r.width)}x${Math.round(r.height)} at ${Math.round(r.left)}`);
                }
                if (document.documentElement.scrollWidth > window.innerWidth + 1) out.push('PLACE the page scrolls sideways');
                // TOAST: a toast never covers the buttons once scrolled to them
                acts.scrollIntoView({ block: 'center' });
                if (W.showNotification) W.showNotification('Added Addition Facts', 'success');
                await new Promise((r) => setTimeout(r, 400));
                for (const id of ['studentSelAddBtn', 'studentSelPlayBtn', 'studentSelSendBtn']) {
                    const b = document.getElementById(id), r = b.getBoundingClientRect();
                    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
                    if (!hit || !b.contains(hit)) out.push(`TOAST ${id} is covered by ${hit ? (hit.className || hit.tagName) : 'nothing'}`);
                }
                document.querySelectorAll('.toast-notification, .mq-notify').forEach((x) => x.remove());
                const bh = Math.round(acts.getBoundingClientRect().height);
                // BAR: Send shows the link (Esc closes it)
                document.getElementById('studentSelSendBtn').click();
                await new Promise((r) => setTimeout(r, 200));
                const box = document.getElementById('studentSendBox');
                const share = 0;
                if (box.hidden) out.push('BAR Send shows no link');
                const bx = box.getBoundingClientRect();
                if (bx.right > window.innerWidth + 1) out.push('BAR the Send link runs off the screen');
                const link = document.getElementById('studentSendLink').value;
                return { out, link, bh, share: Math.round(share * 100) };
            });
            for (const x of t.out) F2(`${x} @${w}`);
            await page.keyboard.press('Escape');
            await new Promise((r) => setTimeout(r, 100));
            if (!(await page.evaluate(() => document.getElementById('studentSendBox').hidden))) F2(`BAR @${w} Esc does not close the Send link`);
            rows.push(`ACTIONS @${w}: ${t.bh}px tall, Print beside MAP`);
            if (w === 390) {
                if (!/[?&]from=pupil\b/.test(t.link)) F2(`PUPIL the pupil's Send link has no from=pupil (${t.link})`);
                // open the pupil's link here, then the same link as a teacher sends it
                const q = t.link.replace(/^[^?]*/, '');
                const p2 = await app.browser.newPage();
                await p2.goto(app.base + '/index.html' + q, { waitUntil: 'networkidle2', timeout: 60000 });
                await p2.waitForSelector('#studentLandingOverlay', { timeout: 20000 }).catch(() => {});
                const said = await p2.evaluate(() => (document.querySelector('#studentLandingOverlay .landing-modal') || {}).innerText || '');
                if (/Your teacher/i.test(said) || !/Practice set: 2 skills/.test(said)) F2(`PUPIL a pupil's link opens with "${said.split('\n').slice(0, 2).join(' / ')}"`);
                await p2.goto(app.base + '/index.html' + q.replace(/[?&]from=pupil/, ''), { waitUntil: 'networkidle2', timeout: 60000 });
                await p2.waitForSelector('#studentLandingOverlay', { timeout: 20000 }).catch(() => {});
                const said2 = await p2.evaluate(() => (document.querySelector('#studentLandingOverlay .landing-modal') || {}).innerText || '');
                if (!/Your teacher has set up/.test(said2)) F2(`PUPIL a teacher link no longer opens with its wording ("${said2.split('\n')[0]}")`);
                await p2.close();
            }
        }
        await page.evaluate(() => { window.clearSkillQueue && window.clearSkillQueue(); });
        rows.push('UI3 checked');

        // LARGER / HOVERZOOM (owner 2026-11-05): the Larger preview pane mounts pages as they scroll near; the hover zoom
        // shows a very large page beside the pointer. --shots writes design/status/sp-preview/*.png
        {
            const SH = has('shots') ? require('path').join(__dirname, '../../design/status/sp-preview') : '';
            if (SH) require('fs').mkdirSync(SH, { recursive: true });
            const L = (t) => fails.push('LARGER ' + t);
            const settle = (ms) => new Promise((r) => setTimeout(r, ms));
            for (const w of [1366, 390]) {
                const vh = w === 1366 ? 768 : 844;
                await page.setViewport({ width: w, height: vh, deviceScaleFactor: 1 });
                await page.evaluate(async () => {
                    window.closeSimplePrint && window.closeSimplePrint();
                    window.openSimplePrint([{ categoryId: 'addition', skillId: 'add_two_digit' }, { categoryId: 'subtraction', skillId: 'missing_add_sub' }], { from: 'tray' });
                    const r = document.getElementById('spRoot');
                    const pg = r.querySelector('[data-sp="how"][data-v="pages"]'); if (pg && pg.getAttribute('aria-checked') !== 'true') pg.click();
                    await new Promise((x) => setTimeout(x, 50));
                    const n = document.getElementById('spN'); n.value = '4'; n.dispatchEvent(new Event('input', { bubbles: true }));
                    const k = r.querySelector('[data-sp="key"][data-v="true"]'); if (k && k.getAttribute('aria-checked') !== 'true') k.click();
                });
                await page.waitForFunction(async () => { const m = await import('/js/modules/simple-print.js'); const s = m.simplePrintState(); return s && !s.busy && s.built && s.built.pages >= 3; }, { timeout: 30000 }).catch(() => {});
                await settle(800);
                if (SH && w === 1366) await page.screenshot({ path: SH + '/normal-1366.png' });
                const btn = await page.evaluate(() => { const b = document.querySelector('#spRoot .sp-larger'); if (!b) return null; const r = b.getBoundingClientRect(); return { w: r.width, h: r.height }; });
                if (!btn) { L(`@${w} no Larger preview control`); continue; }
                if (btn.w < 44 || btn.h < 44) L(`@${w} Larger preview ${Math.round(btn.w)}x${Math.round(btn.h)} < 44`);
                await page.click('#spRoot .sp-larger');
                await settle(600);
                const a = await page.evaluate(() => {
                    const r = document.getElementById('spRoot'), sc = r.querySelector('.sp-lg-scroll');
                    const caps = [...r.querySelectorAll('.sp-lg-page figcaption')].map((x) => x.textContent);
                    const small = r.querySelector('[data-sp="smaller"]').getBoundingClientRect();
                    const pane = r.querySelector('.sp-large').getBoundingClientRect();
                    return { slots: caps.length, frames: sc.querySelectorAll('iframe').length, cap0: caps[0] || '', div: !!r.querySelector('.sp-lg-div'), small: [small.width, small.height], over: pane.right > window.innerWidth + 1 || pane.left < -1 || document.documentElement.scrollWidth > window.innerWidth + 1 || sc.scrollWidth > sc.clientWidth + 1, focusIn: r.querySelector('.sp-large').contains(document.activeElement) };
                });
                rows.push(`LARGER @${w}: ${a.slots} pages, ${a.frames} mounted at open`);
                if (a.slots < 4) L(`@${w} only ${a.slots} pages in the pane`);
                if (!/^Page 1 of \d+/.test(a.cap0)) L(`@${w} caption "${a.cap0}"`);
                if (!a.div) L(`@${w} no answer-key divider`);
                if (a.frames < 1) L(`@${w} page 1 not shown at once`);
                if (a.frames >= a.slots) L(`@${w} every page mounted at open (${a.frames}/${a.slots}): not lazy`);
                if (a.small[0] < 44 || a.small[1] < 44) L(`@${w} Smaller ${a.small.map(Math.round).join('x')} < 44`);
                if (a.over) L(`@${w} the pane overflows sideways`);
                if (!a.focusIn) L(`@${w} focus is not in the pane`);
                await settle(700);
                await page.mouse.move(5, 5);
                if (SH) await page.screenshot({ path: SH + `/larger-${w}.png` });
                // keyboard scroll: End reaches the last page, which then mounts
                await page.keyboard.press('End');
                await settle(900);
                const b = await page.evaluate(() => { const sc = document.querySelector('#spRoot .sp-lg-scroll'); return { top: sc.scrollTop, frames: sc.querySelectorAll('iframe').length, last: !!sc.querySelector('.sp-lg-page:last-child iframe') }; });
                if (!(b.top > 0)) L(`@${w} End did not scroll the pages`);
                if (!(b.frames > a.frames) || !b.last) L(`@${w} later pages did not mount after scrolling (${a.frames} -> ${b.frames})`);
                rows.push(`LARGER @${w}: ${b.frames} mounted after scrolling to the end`);
                if (w === 1366) {
                    // HOVERZOOM on a page in the pane and on the thumbnail
                    const box = await page.evaluate(() => { const all = document.querySelectorAll('#spRoot .sp-lg-sheet'); if (!all.length) return { x: 0, y: 0, none: (document.querySelector('#spRoot .sp-large') || {}).innerHTML || 'no pane' }; const s = all[all.length - 1].getBoundingClientRect(); return { x: s.left + s.width * 0.3, y: s.top + Math.min(s.height, window.innerHeight - s.top) / 2 }; });
                    if (box.none) L('HOVERZOOM no pages in the pane after scrolling: ' + String(box.none).slice(0, 200));
                    await page.mouse.move(box.x, box.y);
                    await settle(900);
                    const z = await page.evaluate(() => { const z = document.querySelector('#spRoot .sp-zoom'); if (!z || z.hidden) return null; const r = z.getBoundingClientRect(); return { h: r.height, l: r.left, r: r.right, frame: !!z.querySelector('iframe') }; });
                    if (!z) L('HOVERZOOM no zoom on hovering a page');
                    else {
                        if (z.h < 0.8 * vh) L(`HOVERZOOM ${Math.round(z.h)} px < 80 % of ${vh}`);
                        if (!(z.l > box.x || z.r < box.x)) L(`HOVERZOOM the zoom sits under the pointer (${Math.round(z.l)}-${Math.round(z.r)} vs ${Math.round(box.x)})`);
                        rows.push(`HOVERZOOM @1366: ${Math.round(z.h)} px tall (${Math.round(z.h / vh * 100)} % of the viewport)`);
                    }
                    if (SH) await page.screenshot({ path: SH + '/hoverzoom-1366.png' });
                    await page.mouse.move(5, 5);
                    await settle(200);
                    if (await page.evaluate(() => { const z = document.querySelector('#spRoot .sp-zoom'); return z && !z.hidden; })) L('HOVERZOOM does not hide on leave');
                    // Esc order: zoom, then the pane, then the dialog
                    await page.mouse.move(box.x, box.y);
                    await settle(300);
                    await page.keyboard.press('Escape');
                    const e1 = await page.evaluate(() => { const z = document.querySelector('#spRoot .sp-zoom'); return { zoom: !!(z && !z.hidden), large: !!document.querySelector('#spRoot .sp-large') }; });
                    if (e1.zoom) L('ESC Esc does not hide the zoom');
                    if (!e1.large) L('ESC the first Esc (zoom showing) closed the pane too');
                    await page.mouse.move(5, 5);
                }
                await page.keyboard.press('Escape');
                await settle(150);
                const e2 = await page.evaluate(async () => ({ large: !!document.querySelector('#spRoot .sp-large'), open: !!(await import('/js/modules/simple-print.js')).simplePrintState(), focus: document.activeElement && document.activeElement.classList.contains('sp-larger') }));
                if (e2.large) L(`ESC @${w} Esc does not close the pane (focus ${await page.evaluate(() => { const a = document.activeElement; return a ? a.tagName + '.' + a.className : '-'; })})`);
                if (!e2.open) L(`ESC @${w} Esc in the pane closed the whole dialog`);
                if (!e2.focus) L(`ESC @${w} focus does not return to Larger preview`);
                if (w === 1366) {
                    const t = await page.evaluate(() => { const th = document.querySelector('#spRoot .sp-thumb'); if (!th) return { x: 5, y: 5 }; const s = th.getBoundingClientRect(); return { x: s.left + s.width / 2, y: s.top + s.height / 2 }; });
                    await page.mouse.move(t.x, t.y);
                    await settle(900);
                    const z = await page.evaluate(() => { const z = document.querySelector('#spRoot .sp-zoom'); return z && !z.hidden ? z.getBoundingClientRect().height : 0; });
                    if (z < 0.8 * vh) L(`HOVERZOOM the thumbnail zoom is ${Math.round(z)} px`);
                    await page.mouse.move(5, 5);
                    await settle(100);
                }
                await page.keyboard.press('Escape');
                await settle(100);
                if (await page.evaluate(async () => !!(await import('/js/modules/simple-print.js')).simplePrintState())) L(`ESC @${w} the next Esc does not close the dialog`);
            }
        }

    }
    console.log(rows.join('\n'));
    for (const f of fails) console.log('  FAIL ' + f);
    const errs = (app.errors || []).filter(Boolean);
    if (errs.length) console.log('  console errors: ' + errs.slice(0, 3).join(' | '));
    await app.close();
    const bad = fails.length > 0;
    if (has('backtest-options')) {
        const both = fails.some((f) => /COLS7/.test(f)) && fails.some((f) => /WITHIN/.test(f));
        console.log(both ? 'ws-simple-print --backtest-options: OK (the old behaviour fails COLS7 and WITHIN)' : 'ws-simple-print --backtest-options: FAIL (the gate passes the old behaviour)');
        process.exit(both ? 0 : 1);
    }
    if (has('backtest')) {
        console.log(bad ? 'ws-simple-print --backtest: OK (the old dialog plan fails the gate)' : 'ws-simple-print --backtest: FAIL (the gate passes the old dialog plan)');
        process.exit(bad ? 0 : 1);
    }
    console.log(bad ? 'ws-simple-print: FAIL' : 'ws-simple-print: OK');
    process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); console.log('ws-simple-print: FAIL'); process.exit(1); });
