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
