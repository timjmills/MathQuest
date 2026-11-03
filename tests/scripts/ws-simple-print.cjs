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
                    out.def = { pages: b.pages, total: b.total, cols: b.cols, colsList: b.colsList, arrangement: b.arrangement, counts: b.counts, measured: await measure(b.pupilHtml) };
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
        const qs = await page.evaluate(() => [...document.querySelectorAll('#quickSkillsGrid .qs-print-btn')].map((el) => el.getBoundingClientRect()).filter((r) => r.width < 44 || r.height < 44).length);
        if (qs) fails.push(`quick cards: TARGETS ${qs} Print buttons under 44 x 44`);
    }
    console.log(rows.join('\n'));
    for (const f of fails) console.log('  FAIL ' + f);
    const errs = (app.errors || []).filter(Boolean);
    if (errs.length) console.log('  console errors: ' + errs.slice(0, 3).join(' | '));
    await app.close();
    const bad = fails.length > 0;
    if (has('backtest')) {
        console.log(bad ? 'ws-simple-print --backtest: OK (the old dialog plan fails the gate)' : 'ws-simple-print --backtest: FAIL (the gate passes the old dialog plan)');
        process.exit(bad ? 0 : 1);
    }
    console.log(bad ? 'ws-simple-print: FAIL' : 'ws-simple-print: OK');
    process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); console.log('ws-simple-print: FAIL'); process.exit(1); });
