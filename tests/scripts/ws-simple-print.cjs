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
//   FACTS    a fast-facts-only set in Pages mode prints fact rows: 9 / 6 / 5 columns at S / M / L (owner rule 2026-11-05: Auto
//            at most 9, 10 only when picked; 8 when an answer
//            is over 99; division facts across in 3)
//   NOT3     no default print is ever 3 or fewer problems a page (the reported bug)
//   FOOTER   the teacher footer names the skills in words, never a raw id (lead, 2026-11-03)
//   TARGETS  every dialog control and Quick Start Print button >= 44 x 44 at 1366 / 820 / 390 (critic r1 D7)
//   LARGER   the Larger preview pane: page 1 at once, later pages mount only when scrolled near; Esc order
//   HOVERZOOM the hover zoom is >= 80 % of the viewport height at 1366x768 and hides on leave / Esc
//   ZOOMCOVER the zoom never covers the pointer and stays on screen (1366x768, 820x1180 portrait; critic D1)
//   ZOOMGAIN  a zoom is >= 1.3x as wide as the page under the pointer, else none (critic D2); ZOOMSTALE hides on rebuild (D4)
//   SETS2     2 sets: per-set captions, a divider at each set and each set's key (D3); PANEPRINT / FOCUSRING (D7, D5)
//   SUMMARY  the summary's "n a page" / "n on page 1" is what page 1 holds (critic r1 D5, D9)
//
//   facts-print-fix (owner, 2026-11-05: "Mixed up isn't possible … printing in sections" printed 20 problems on 2 pages where
//   In sections printed 140; "there are a lack of lines and the alignment is off"), on the owner's set (+ − within 20,
//   × ÷ 1-12, Pages 1, Auto) at S / M / L, both Arrange choices:
//   MIXFACTS  a facts-only set in Pages mode, Mixed up: fact rows (never the Mixed practice fallback), the same pages,
//             problems and problems on every page as In sections, and the + − × page INTERLEAVED (at most 2 of one sign in
//             a row; In sections keeps each sign's facts together)
//   FALLBACK  whenever Mixed up falls back (the six set; a facts-only set never does, in either mode), the print is EXACTLY the In
//             sections print (pages, problems, counts, columns, page 1) and the summary says "In sections"
//   ROWRULES  every fact-rows cell is closed on all four sides by a DRAWN rule (not the ink showing through a gap between
//             white cells, which a PDF viewer or printer rasterises away or doubles), inner rules one weight
//   SIGNGAP   the operator's ink ends >= 0.3 em before the bottom number's ink; the fact's digits stay >= 1.75 mm clear of
//             the cell's edges (the 3-digit dividends "crowd the box" at 10 columns: 1.55 mm on 18fbc70c2); the ones
//             digits of each grid column share one x  (tests/lib/ws-fact-geom.cjs)
//   DIVMAX9   (owner ruling 2026-11-05: "If division is included don't make 10 columns an option, just 9") the Columns
//             control offers 1-9, never 10, for a set with division facts (+ - x only: 10); an explicit 10 prints 9 across
//             on every division page (stacked, fraction, bracket) and 10 on the + - x page, the summary saying
//             "(max 9 with division)"
//   COUNTS / PROBLEMS / FOOTER / TITLE / DIVMAX9 docs (facts-print-fix r2, critic 2026-11-05): see factsCounts below -
//             the printed signs per skill equal the dialog's counts and are balanced on a page; Problems mode prints fact
//             rows (exact count, ÷ stacked on its own page, pages >= 60 % full or shared evenly, S != L, no wide cell);
//             page k of n reads "k/n" and names its own skills; a + − × page is titled by its operations
//   node tests/scripts/ws-simple-print.cjs --facts-print   these checks only (ws-precritic runs it for the fact skills)
//   node tests/scripts/ws-simple-print.cjs --r4            the r4 checks alone (MIXBASE … ONEDIGIT, see factsR4)
//   node tests/scripts/ws-simple-print.cjs --r5            the r5 sweep alone (SHARES, BLANKMID, DIVORDER, TITLEONE, ORPHAN)
//   node tests/scripts/ws-simple-print.cjs --sweep         the r6 MEASURED sweep alone (TOTAL, SHARES, SIZENOTE, PAGESFULL ...)
//   node tests/scripts/ws-simple-print.cjs --sweep-full    the same over every count and Columns 1-10 (critic / deploy)
//   node tests/scripts/ws-simple-print.cjs              the gate (prints ws-simple-print: OK / FAIL)
//   node tests/scripts/ws-simple-print.cjs --backtest   the same measure on the old dialog's page plan (one request
//                                                        per small page, a section of 1-2 per skill): must FAIL
//   --sizes S,M  --sets six,facts                        focus
'use strict';
const { open } = require('../lib/ws-harness.cjs');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const SIZES = arg('sizes', 'M,L').split(',');
// owner 2026-11-13 (plan item 9): the print sizes are M and L, size S is dropped. The cases that ran at S run at the smallest
// size asked for: M by default, S again with an explicit `--sizes S,M,L` (the backtest rows on trees from before the rule).
const SMALL = SIZES.includes('S') ? 'S' : 'M';
const SML = SIZES.includes('S') ? ['S', 'M', 'L'] : ['M', 'L'];
const SM = SIZES.includes('S') ? ['S', 'M'] : ['M'];
// (the same three names inside page.evaluate bodies: set on every page of the run, before its scripts)
const SIZE_GLOBALS = `window.SMALL = ${JSON.stringify(SMALL)}; window.SML = ${JSON.stringify(SML)}; window.SM = ${JSON.stringify(SM)};`;
async function withSizeGlobals(pg) { await pg.evaluateOnNewDocument(SIZE_GLOBALS); await pg.evaluate(SIZE_GLOBALS); return pg; }
const sk = (c, s) => ({ categoryId: c, skillId: s });
const SETS = {
    six: [sk('addition', 'add_facts'), sk('subtraction', 'sub_facts'), sk('multiplication', 'mult_facts'), sk('division', 'div_facts'), sk('subtraction', 'missing_add_sub'), sk('division', 'missing_mult_div')],
    facts: [sk('addition', 'add_facts'), sk('subtraction', 'sub_facts'), sk('multiplication', 'mult_facts'), sk('division', 'div_facts')],
    addsub: [sk('addition', 'add_facts'), sk('subtraction', 'sub_facts')],
    missing: [sk('subtraction', 'missing_add_sub'), sk('division', 'missing_mult_div')],
};
const ONLY = arg('sets', '') ? arg('sets', '').split(',') : Object.keys(SETS);
// (facts-print-fix r3, owner rule 2026-11-05: Auto at most 9 - "Auto = 9; 10 only if the owner picks it")
const FACT_COLS = { S: 9, M: 6, L: 5 };
const { factGeomSource, factGeomVerdict } = require('../lib/ws-fact-geom.cjs');
const OWNER = [
    { categoryId: 'addition', skillId: 'add_facts', opts: { band: 20 } }, { categoryId: 'subtraction', skillId: 'sub_facts', opts: { band: 20 } },
    { categoryId: 'multiplication', skillId: 'mult_facts', opts: {} }, { categoryId: 'division', skillId: 'div_facts', opts: {} },
];

/** facts-print-fix: MIXFACTS, FALLBACK, ROWRULES, SIGNGAP (see the header). Returns {rows, fails}. */
async function factsPrint(page) {
    const rows = [], fails = [];
    for (const size of SIZES) {
        const r = await page.evaluate(async ({ list, size, src }) => {
            const m = await import('/js/modules/simple-print.js');
            const geom = new Function('return ' + src)();
            const look = async (b) => {
                const f = document.createElement('iframe');
                f.style.cssText = 'position:fixed;left:-3000px;top:0;width:900px;height:1200px;border:0';
                document.body.appendChild(f);
                await new Promise((res) => { f.onload = res; f.srcdoc = window.sheetDocument(b.pupilHtml, 'm', { paper: 'A4' }); });
                for (let i = 0; i < 40; i++) { if (f.contentDocument.documentElement.getAttribute('data-ws-fonts') === 'ready') break; await new Promise((x) => setTimeout(x, 100)); }
                const g = geom(f.contentDocument);
                const pages = [...f.contentDocument.querySelectorAll('.ws-page')].map((pg) => ({
                    cells: pg.querySelectorAll('.ws-grid > .ws-cell:not(.blankrun)').length,
                    ops: [...pg.querySelectorAll('.ws-grid.facts > .ws-cell')].map((c) => { const o = c.querySelector('.ws-fact .op'); return o ? o.textContent.trim() : (c.querySelector('[data-ws-cell]') || c).getAttribute('data-ws-cell') || '?'; }),
                    // (r4: each grid's signs - a Pages 1 page holds the + − × grid AND the ÷ section, which is its own grid)
                    grids: [...pg.querySelectorAll('.ws-grid.facts')].map((g) => [...g.querySelectorAll(':scope > .ws-cell')].map((c) => { const o = c.querySelector('.ws-fact .op'); return o ? o.textContent.trim() : (c.querySelector('[data-ws-cell]') || c).getAttribute('data-ws-cell') || '?'; })),
                }));
                f.remove();
                return { geom: g, pages };
            };
            const out = {};
            for (const arrange of ['sections', 'mixed']) {
                const o = { how: 'pages', n: 1, sets: 1, size, cols: 'auto', colsMode: 'aim', key: true, arrange, seed: 4242, title: true, paper: 'A4' };
                const b = await m.buildSets(list.map((s) => Object.assign({ amt: '' }, s)), o);
                out[arrange] = { arrangement: b.arrangement, mixedFacts: !!b.mixedFacts, fellBack: !!b.fellBack, pages: b.pages, total: b.total, line: m.summaryLine(b, o), notes: b.notes, look: await look(b) };
            }
            return out;
        }, { list: OWNER, size, src: factGeomSource });
        const tag = `owner facts @${size}`;
        const S = r.sections, M = r.mixed;
        rows.push(`${tag} In sections: ${S.line}`);
        rows.push(`${tag} Mixed up:    ${M.line}`);
        // MIXFACTS
        if (M.arrangement !== 'facts' || M.fellBack) fails.push(`${tag}: MIXFACTS Mixed up printed ${M.fellBack ? 'the fallback' : M.arrangement}, not fact rows ("${M.line}")`);
        if (M.pages !== S.pages || M.total !== S.total) fails.push(`${tag}: MIXFACTS Mixed up ${M.total} on ${M.pages} pages, In sections ${S.total} on ${S.pages}`);
        const per = (x) => x.look.pages.map((p) => p.cells).join('/');
        if (per(M) !== per(S)) fails.push(`${tag}: MIXFACTS problems a page Mixed up ${per(M)} vs In sections ${per(S)}`);
        const run = (ops) => { let best = 0, k = 0; ops.forEach((o, i) => { k = i && ops[i - 1] === o ? k + 1 : 1; best = Math.max(best, k); }); return best; };
        // (the run is read within each grid: the ÷ section after the + − × grid is its own section, PT-FRW-6)
        M.look.pages.forEach((p, i) => (p.grids || [p.ops]).forEach((ops) => {
            const kinds = new Set(ops);
            if (kinds.size > 1 && run(ops) > 2) fails.push(`${tag}: MIXFACTS Mixed up page ${i + 1} has ${run(ops)} of one sign in a row (${ops.slice(0, 20).join('')}…)`);
        }));
        if (M.look.pages[0] && new Set(M.look.pages[0].ops).size < 2) fails.push(`${tag}: MIXFACTS Mixed up page 1 holds one sign only`);
        rows.push(`${tag} Mixed up page 1 signs: ${(M.look.pages[0] || { ops: [] }).ops.join('')} (longest run ${run((M.look.pages[0] || { ops: [] }).ops)}); In sections longest run ${run((S.look.pages[0] || { ops: [] }).ops)}`);
        // ROWRULES + SIGNGAP on both prints
        for (const [nm, x] of [['In sections', S], ['Mixed up', M]]) {
            for (const v of factGeomVerdict(x.look.geom)) fails.push(`${tag} ${nm}: ${v}`);
            const g = x.look.geom.pages.filter((p) => p.grids);
            rows.push(`${tag} ${nm}: rules ${g.map((p) => (p.rules.undrawn ? `${p.rules.undrawn} undrawn` : `drawn ${p.rules.weights.join('/')}px`)).join(', ')} · sign gap ${g.map((p) => (p.sign.min === null ? '-' : p.sign.min.toFixed(2) + ' em')).join(', ')} · digits clear ${g.map((p) => (p.sign.clearMin === null ? '-' : p.sign.clearMin.toFixed(2) + ' mm')).join(', ')}`);
        }
    }
    // FOOTER (coordinator, 2026-11-05: a footer printed a raw id beside "Missing Numbers (+/−)"; the old FOOTER read only
    // the listed ids of the fact sets): every footer of the pupil AND key pages, both Arrange choices, of a sample of mixed
    // sets - the gate's sets, a skill queued under another category, a retired id, and one skill from every category -
    // names skills in words: no snake_case id at all
    const ft = await page.evaluate(async (sets) => {
        const m = await import('/js/modules/simple-print.js');
        const W = window;
        const live = (cat) => (W.SKILLS[cat] || []).filter((x) => x && x.v && !x.retired && !x.tombstone && !x.hidden);
        const cats = Object.keys(W.SKILLS).filter((c) => live(c).length);
        const one = cats.map((c, i) => { const xs = live(c); return { categoryId: c, skillId: xs[(i * 7) % xs.length].v }; });
        const samples = [['six', sets.six], ['missing', sets.missing], ['one per category A', one.filter((_, i) => i % 2 === 0).slice(0, 6)], ['one per category B', one.filter((_, i) => i % 2 === 1).slice(0, 6)],
            ['cross-category', [{ categoryId: 'subtraction', skillId: 'missing_add_sub' }, { categoryId: 'addition', skillId: (live('subtraction')[0] || {}).v || 'sub_facts' }]],
            ['retired id', [{ categoryId: 'subtraction', skillId: 'missing_add_sub' }, { categoryId: 'addition', skillId: 'number_families_add_med' }]]];
        const out = [];
        for (const [nm, list] of samples) {
            for (const arrange of ['sections', 'mixed']) {
                let b;
                try { b = await m.buildSimple(list.map((s) => Object.assign({ amt: '' }, s)), { how: 'problems', n: 12, size: 'M', cols: 'auto', key: true, arrange, seed: 4242, title: true }); } catch (e) { out.push({ nm, arrange, err: String(e && e.message || e) }); continue; }
                const foots = (String(b.pupilHtml) + String(b.keyHtml)).match(/<footer[^>]*>[\s\S]*?<\/footer>/g) || [];
                const left = foots.map((f) => ((/<span>([\s\S]*?)<\/span>/.exec(f) || [])[1] || '')).filter(Boolean);
                const ids = [...new Set(left.flatMap((t) => t.match(/\b[a-z0-9]+(?:_[a-z0-9]+)+\b/g) || []))];
                out.push({ nm, arrange, ids, first: left[0] || '' });
            }
        }
        return out;
    }, SETS);
    for (const x of ft) {
        if (x.err) { fails.push(`FOOTER ${x.nm} ${x.arrange}: build failed (${x.err})`); continue; }
        if (x.ids.length) fails.push(`FOOTER ${x.nm} ${x.arrange}: raw skill id(s) ${x.ids.join(', ')} in "${x.first}"`);
    }
    rows.push(`FOOTER ${ft.length} prints (pupil + key), ${ft.filter((x) => x.ids && !x.ids.length).length} in words only`);
    // DIVMAX9 (owner ruling 2026-11-05)
    const d9 = await page.evaluate(async (owner) => {
        const m = await import('/js/modules/simple-print.js');
        const L = (list) => list.map((s) => Object.assign({ amt: '' }, s));
        const optsMax = async (list) => {
            try { localStorage.removeItem('mq_simple_print'); } catch (e) { /* none */ }
            window.openSimplePrint(L(list), { from: 'tray' });
            for (let i = 0; i < 80; i++) { const st = m.simplePrintState(); if (st && st.built && !st.busy) break; await new Promise((r) => setTimeout(r, 200)); }
            const v = [...document.querySelectorAll('#spCols option')].map((x) => x.value).filter((x) => x !== 'auto').map(Number);
            window.closeSimplePrint();
            return Math.max(...v);
        };
        const out = { withDiv: await optsMax(owner), noDiv: await optsMax(owner.slice(0, 3)), builds: [] };
        const dv = (form) => [{ categoryId: 'division', skillId: 'div_facts', opts: form ? { divForm: form } : {} }];
        for (const [nm, list] of [['owner', owner], ['div_facts', dv('')], ['div long', dv('long')], ['div fraction', dv('fraction')], ['+ -', owner.slice(0, 2)]]) {
            for (const size of SM) {
                const o = { how: 'pages', n: 2, size, cols: 10, colsMode: 'exact', key: false, arrange: 'sections', seed: 4242, title: true, paper: 'A4' };
                const b = await m.buildSimple(L(list), o);
                out.builds.push({ nm, size, grids: b.grids || [{ div: nm !== '+ - x', cols: b.cols }], cols: b.cols, line: m.summaryLine(b, o), notes: (b.notes || []).join(' ') });
            }
        }
        return out;
    }, OWNER);
    rows.push(`DIVMAX9 dialog offers up to ${d9.withDiv} with division, ${d9.noDiv} for + - x only`);
    if (d9.withDiv !== 9) fails.push(`DIVMAX9 the dialog offers up to ${d9.withDiv} columns for a set with division facts, want 9`);
    if (d9.noDiv !== 10) fails.push(`DIVMAX9 the dialog offers up to ${d9.noDiv} columns for + - x facts, want 10`);
    for (const x of d9.builds) {
        rows.push(`DIVMAX9 ${x.nm} @${x.size} Exactly 10: ${x.line}`);
        const gs = x.grids.length ? x.grids : [{ div: x.nm !== '+ -', cols: x.cols }];
        for (const g of gs) {
            if (g.div && g.cols > 9) fails.push(`DIVMAX9 ${x.nm} @${x.size}: a division page printed ${g.cols} columns`);
            // (r6: fewer than 9 only where a form cannot keep 2 mm of white each side at 9 - the bracket alone, "12)144" at S -
            // and the dialog says so)
            if (g.div && g.cols !== 9 && !(g.cols < 9 && /so every fact fits/.test(x.notes))) fails.push(`DIVMAX9 ${x.nm} @${x.size}: a division page printed ${g.cols} columns for an asked 10, want 9 (or a note why)`);
            // (x 1-12 answers over 99 keep their own 8-column clamp, PT-FRW-5)
            if (!g.div && g.cols !== (x.nm === 'owner' ? 8 : 10)) fails.push(`DIVMAX9 ${x.nm} @${x.size}: the + - x page printed ${g.cols} columns for an asked 10, want ${x.nm === 'owner' ? 8 : 10}`);
        }
        if (x.nm !== '+ -' && !/\(max 9 with division\)/.test(x.line)) fails.push(`DIVMAX9 ${x.nm} @${x.size}: the summary does not say "(max 9 with division)": "${x.line}"`);
        if (x.nm === '+ -' && /max 9/.test(x.line)) fails.push(`DIVMAX9 + - @${x.size}: the summary says max 9: "${x.line}"`);
    }
    // FALLBACK: a Mixed up that cannot be drawn prints EXACTLY the In sections plan
    const fb = await page.evaluate(async ({ six, owner }) => {
        const m = await import('/js/modules/simple-print.js');
        const out = [];
        for (const [nm, list, how, n, size] of [['six', six, 'pages', 1, 'M'], ['six', six, 'pages', 1, SMALL], ['facts problems', owner, 'problems', 40, SMALL]]) {
            const L = list.map((s) => Object.assign({ amt: '' }, s));
            const plan = (b) => JSON.stringify({ pages: b.pages, total: b.total, counts: b.counts, cols: b.colsList || [b.cols], perPage: b.perPage, keyPages: b.keyPages });
            const o = (arrange) => ({ how, n, size, cols: 'auto', colsMode: 'aim', key: true, arrange, seed: 4242, title: true, paper: 'A4' });
            const bs = await m.buildSimple(L, o('sections'));
            const bm = await m.buildSimple(L, o('mixed'));
            out.push({ nm: `${nm} ${how} @${size}`, fellBack: !!bm.fellBack, same: plan(bs) === plan(bm), ps: plan(bs), pm: plan(bm), line: m.summaryLine(bm, o('mixed')), arrangement: bm.arrangement });
        }
        return out;
    }, { six: SETS.six, owner: OWNER });
    for (const x of fb) {
        rows.push(`FALLBACK ${x.nm}: ${x.fellBack ? 'fell back' : `Mixed up drawn (${x.arrangement})`} · ${x.line}`);
        if (x.fellBack && !x.same) fails.push(`FALLBACK ${x.nm}: the fallback is not the In sections print: ${x.pm} vs ${x.ps}`);
        if (x.fellBack && !/In sections/.test(x.line)) fails.push(`FALLBACK ${x.nm}: the summary does not say it printed in sections: "${x.line}"`);
    }
    return { rows, fails };
}

/**
 * facts-print-fix r2 (critic 2026-11-05, head c2c0fe24f): COUNTS, PROBLEMS, FOOTER-PAGES, TITLE, DIVMAX9-DOCS.
 *   COUNTS    every page of the owner's set (Pages 1, S/M/L, both arrangements, Sets 2): the signs PRINTED per skill equal
 *             the build's per-skill counts (the dialog's "prints" chips), and the skills of one page differ by at most 1
 *             (S printed + 24, − 23, × 9 while the chips said 23 for ×)
 *   PROBLEMS  Problems 50 / 130 of the owner's set, S/M/L, both arrangements: fact rows (never "each skill its own
 *             grid"), exactly the asked count and per-skill split, ÷ stacked on its own page(s) at <= 9 columns, never
 *             mixed with + − ×, every page >= 60 % of its group's full page unless the group asked for less than a page
 *             or its pages are shared evenly (within one row); S and L differ in digit size and in a page's capacity; no
 *             cell wider than its grid column
 *   FOOTER    page k of n reads "k/n" on the pupil and the key pages; each page's footer names the skills on THAT page
 *   TITLE     a + − × page is titled by its operations ("Addition, subtraction and multiplication facts"), never "Facts"
 *   DIVMAX9   WORKSHEET_DESIGN_STANDARD.md never says division facts reach 10 columns (owner ruling 2026-11-05: at most 9)
 */
async function factsCounts(page) {
    const rows = [], fails = [];
    const SIGN = { '+': 'add_facts', '−': 'sub_facts', '-': 'sub_facts', '×': 'mult_facts', 'x': 'mult_facts', '÷': 'div_facts', '/': 'div_facts' };
    const cases = [];
    for (const size of SIZES) for (const arrange of ['sections', 'mixed']) {
        cases.push({ size, arrange, how: 'pages', n: 1, sets: 1 });
        cases.push({ size, arrange, how: 'problems', n: 50, sets: 1 });
    }
    cases.push({ size: SMALL, arrange: 'mixed', how: 'pages', n: 1, sets: 2 }, { size: SMALL, arrange: 'sections', how: 'problems', n: 130, sets: 1 }, { size: 'M', arrange: 'mixed', how: 'problems', n: 130, sets: 2 });
    const res = await page.evaluate(async ({ list, cases }) => {
        const m = await import('/js/modules/simple-print.js');
        const out = [];
        for (const c of cases) {
            const o = { how: c.how, n: c.n, sets: c.sets, size: c.size, cols: 'auto', colsMode: 'aim', key: true, arrange: c.arrange, seed: 4242, title: true, paper: 'A4' };
            const L = list.map((s) => Object.assign({ amt: '' }, s));
            const b = await m.buildSets(L, o);
            const f = document.createElement('iframe');
            f.style.cssText = 'position:fixed;left:-3000px;top:0;width:900px;height:1200px;border:0';
            document.body.appendChild(f);
            await new Promise((r) => { f.onload = r; f.srcdoc = window.sheetDocument(b.doc, 'm', { paper: 'A4' }); });
            for (let i = 0; i < 40; i++) { if (f.contentDocument.documentElement.getAttribute('data-ws-fonts') === 'ready') break; await new Promise((x) => setTimeout(x, 100)); }
            const pages = [...f.contentDocument.querySelectorAll('.ws-page')].map((pg) => {
                const grid = pg.querySelector('.ws-grid');
                const cells = [...pg.querySelectorAll('.ws-grid > .ws-cell:not(.blankrun)')];
                const cols = grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length : 0;
                const colW = grid && cols ? grid.getBoundingClientRect().width / cols : 0;
                const fact = pg.querySelector('.ws-fact');
                const foot = pg.querySelector('footer.ws-foot');
                return {
                    key: /key/i.test(pg.className) || !!pg.querySelector('[data-ws-key-ans]'),
                    facts: !!pg.querySelector('.ws-grid.facts'),
                    ops: cells.map((x) => { const op = x.querySelector('.ws-fact .op'); return op ? op.textContent.trim() : '?'; }),
                    // (r3: a page may hold a + − × grid AND a ÷ grid; each grid's own signs)
                    gridOps: [...pg.querySelectorAll('.ws-grid')].map((g) => [...g.querySelectorAll(':scope > .ws-cell:not(.blankrun)')].map((x) => { const op = x.querySelector('.ws-fact .op'); return op ? op.textContent.trim() : '?'; })),
                    stacked: cells.every((x) => !!x.querySelector('.ws-fact .op')),
                    cols, wide: cells.filter((x) => colW && x.getBoundingClientRect().width > colW + 2).length,
                    pt: fact ? parseFloat(getComputedStyle(fact).fontSize) : 0,
                    title: ((pg.querySelector('.ws-title') || {}).textContent || '').trim(),
                    footLeft: foot && foot.querySelector('span') ? foot.querySelector('span').textContent.trim() : '',
                    footNo: foot && foot.querySelector('b') ? foot.querySelector('b').textContent.trim() : '',
                    setNo: ((/Set (\d+) of/.exec(foot ? foot.textContent : '') || [])[1]) || '1',
                };
            });
            f.remove();
            // each group's full page (what Pages 1 lays at this size), for the fill rule
            const full = c.how === 'problems' ? await m.buildSimple(L, Object.assign({}, o, { how: 'pages', n: 1, key: false })) : null;
            out.push({ c, line: m.summaryLine(b, o), arrangement: b.arrangement, fellBack: !!b.fellBack, total: b.total, counts: b.counts, sets: b.sets || 1,
                asked: c.how === 'problems' ? m.splitCounts(L.map((s) => m.parseAmount(s.amt)), c.n).counts : null,
                full: full ? { grids: full.grids, pageCounts: full.pageCounts } : null, pages });
        }
        return out;
    }, { list: OWNER, cases });
    const ids = OWNER.map((s) => s.skillId);
    const NAME = { add_facts: /Addition/, sub_facts: /Subtraction/, mult_facts: /Multiplication/, div_facts: /Division/ };
    for (const r of res) {
        const tag = `owner ${r.c.how} ${r.c.n} @${r.c.size} ${r.c.arrange}${r.sets > 1 ? ` sets ${r.sets}` : ''}`;
        rows.push(`${tag}: ${r.line}`);
        const pupil = r.pages.filter((p) => !p.key);
        // COUNTS: set 1's pupil pages
        const set1 = pupil.filter((p) => p.setNo === '1');
        const got = ids.map((id) => set1.reduce((t, p) => t + p.ops.filter((op) => SIGN[op] === id).length, 0));
        if (got.join() !== (r.counts || []).join()) fails.push(`${tag}: COUNTS printed ${got.join('/')} per skill, the build (the dialog chips) says ${(r.counts || []).join('/')}`);
        // (balanced within a group: the + − × skills of a page within 1; a shared page's ÷ section is its own count, r3)
        pupil.forEach((p, i) => {
            const per = ids.filter((id) => id !== 'div_facts').map((id) => p.ops.filter((op) => SIGN[op] === id).length).filter(Boolean);
            if (per.length > 1 && Math.max(...per) - Math.min(...per) > 1) fails.push(`${tag}: COUNTS page ${i + 1} is unbalanced (${per.join('/')}, want within 1)`);
        });
        // FOOTER: k/n per set on pupil and key pages; the left names that page's own skills
        for (const kind of [false, true]) {
            const bySet = {};
            r.pages.filter((p) => p.key === kind).forEach((p) => { (bySet[p.setNo] = bySet[p.setNo] || []).push(p); });
            for (const [sn, ps] of Object.entries(bySet)) ps.forEach((p, k) => {
                if (p.footNo !== `${k + 1}/${ps.length}`) fails.push(`${tag}: FOOTER ${kind ? 'key' : 'pupil'} page ${k + 1} of ${ps.length} (set ${sn}) reads "${p.footNo}"`);
                const on = ids.filter((id) => p.ops.some((op) => SIGN[op] === id));
                const miss = on.filter((id) => !NAME[id].test(p.footLeft));
                const extra = ids.filter((id) => !on.includes(id) && NAME[id].test(p.footLeft));
                if (miss.length || extra.length || /\band \d+ more\b/.test(p.footLeft)) fails.push(`${tag}: FOOTER ${kind ? 'key' : 'pupil'} page ${k + 1} footer "${p.footLeft}" does not name its own skills (${on.join(', ')})`);
            });
        }
        // TITLE
        pupil.forEach((p, i) => {
            const ops = new Set(p.ops.map((op) => SIGN[op]));
            // (all four on one page - r3's shared page - is "Mixed facts", PT-FRW-12)
            if (ops.size > 1 && !(ops.size === 4 && /^Mixed facts$/.test(p.title)) && (/^Facts$/i.test(p.title) || !['add_facts', 'sub_facts', 'mult_facts'].filter((id) => ops.has(id)).every((id) => new RegExp(NAME[id].source, 'i').test(p.title)))) fails.push(`${tag}: TITLE page ${i + 1} (${[...ops].join(' ')}) is titled "${p.title}"`);
        });
        if (r.c.how !== 'problems') continue;
        // PROBLEMS
        if (r.arrangement !== 'facts' || r.fellBack) fails.push(`${tag}: PROBLEMS a facts-only set printed ${r.fellBack ? 'the fallback' : r.arrangement}, not fact rows ("${r.line}")`);
        if (/each skill its own grid/i.test(r.line)) fails.push(`${tag}: PROBLEMS the summary says "${r.line}"`);
        if (r.total !== r.c.n) fails.push(`${tag}: PROBLEMS ${r.total} printed for ${r.c.n} asked`);
        // (r5: within one row of the even split - every group but the last prints whole rows; the total is exact above)
        if ((r.counts || []).some((x, i) => Math.abs(x - (r.asked || [])[i]) > 9)) fails.push(`${tag}: PROBLEMS per skill ${(r.counts || []).join('/')} for ${(r.asked || []).join('/')} asked (more than a row off)`);
        const s1 = set1;
        s1.forEach((p, i) => {
            if (!p.facts) fails.push(`${tag}: PROBLEMS page ${i + 1} is not a fact-rows grid`);
            if (p.wide) fails.push(`${tag}: PROBLEMS page ${i + 1} has ${p.wide} cell(s) wider than a grid column (NOORPHAN)`);
            const div = p.ops.filter((op) => SIGN[op] === 'div_facts').length;
            // (r3: ÷ is its own SECTION - its own grid - which may share the page with the + − × grid)
            if (p.gridOps.some((g) => g.some((op) => SIGN[op] === 'div_facts') && g.some((op) => SIGN[op] !== 'div_facts'))) fails.push(`${tag}: PROBLEMS page ${i + 1} mixes ÷ with other signs in one grid`);
            if (div && !p.stacked) fails.push(`${tag}: PROBLEMS page ${i + 1} prints division across, not stacked`);
        });
        // (r2's FILL - each group's pages >= 60 % of its full page - is replaced by r3's FILL in mm, factsSetPage: the ÷
        // section shares a page with the + − × rows, and no page shows more than one row of white)
    }
    // SIZE: Problems 50 at S and at L differ in digit size and capacity
    for (const arrange of ['sections', 'mixed']) {
        const at = (sz) => res.find((r) => r.c.how === 'problems' && r.c.n === 50 && r.c.size === sz && r.c.arrange === arrange && r.sets === 1);
        const S = at(SMALL), Lg = at('L');
        if (!S || !Lg) continue;
        const pt = (r) => (r.pages.find((p) => !p.key && p.pt) || {}).pt || 0;
        const cap = (r) => ((r.full && r.full.grids) || [])[0] ? r.full.grids[0].perPage : 0;
        rows.push(`SIZE Problems 50 ${arrange}: S ${pt(S).toFixed(1)} px digits, ${cap(S)} a page; L ${pt(Lg).toFixed(1)} px, ${cap(Lg)} a page`);
        if (!(pt(S) < pt(Lg)) || !(cap(S) > cap(Lg))) fails.push(`SIZE Problems 50 ${arrange}: S and L print the same (S ${pt(S)} px / ${cap(S)}, L ${pt(Lg)} px / ${cap(Lg)})`);
    }
    // DIVMAX9 docs (owner ruling 2026-11-05: at most 9 columns when division is included)
    const fs = require('fs');
    const path = require('path');
    const std = fs.readFileSync(path.join(process.env.MQ_ROOT || path.join(__dirname, '..', '..'), 'WORKSHEET_DESIGN_STANDARD.md'), 'utf8').split('\n');
    const bad = std.map((t, i) => [i + 1, t]).filter(([, t]) => /divi|÷/i.test(t) && /reach(es)? (the full )?10\b|10-column|\b(to|at) 10 columns|10 in every/i.test(t) && !/at most 9|max(imum)? 9|never 10|not 10/i.test(t));
    rows.push(`DIVMAX9 docs: ${bad.length} line(s) of WORKSHEET_DESIGN_STANDARD.md say division reaches 10 columns`);
    for (const [n, t] of bad) fails.push(`DIVMAX9 WORKSHEET_DESIGN_STANDARD.md:${n} says division reaches 10 columns: "${t.trim().slice(0, 140)}"`);
    return { rows, fails };
}

/**
 * facts-print-fix r3 (critic 2026-11-05, head 115302a69): every page of EVERY set compared with the REQUEST, white measured
 * in mm on the printed document (the r2 checks compared set 1 with the chips, so set 2 printing 10 columns, a page at
 * 24 pt beside pages at 20 pt, 35/32/31/32 for 33/33/32/32 and pages 80 % empty all passed).
 *   SETPAGE  every grid of every pupil page of every set: the summary's columns for its group (+ − × / ÷), ONE digit size
 *            per group over the whole print (all sets), per-skill totals of each set = splitCounts(request) in Problems
 *            mode (130 over 4 = 33/33/32/32 at S, M and L) and = the chips in Pages mode, the set's total = the summary's
 *            "N problems", every set on the summary's page count, and the dialog's own line (UI cases) = what prints
 *   FILL     white under the last grid of a page (footer top - grid bottom, mm) <= one of its rows on every page but the
 *            last; the last page too unless the set prints on one page; fewest pages: a set's pages <= ceil(sum over
 *            the groups of rows needed / rows a page) - all groups planned together (÷ shares a page with + − ×)
 *   AUTO9    Columns Auto never prints more than 9 across, for any fact mix (+ − alone at S included); 10 only when picked;
 *            the Columns list never offers 10 with ÷ in the set
 *   DIVMAX9  (docs) WORKSHEET_DESIGN_STANDARD.md AND design/PAGE_TYPES.md never say division reaches 10 columns
 * The UI cases drive the real dialog (scratchpad r3tools/ui.cjs): click the controls, press Print, take the document the
 * print frame received.
 */
async function factsSetPage(page) {
    const rows = [], fails = [];
    const cases = [];
    const C = (how, n, size, arrange, cols = 'auto', sets = 1, seed = 918528) => cases.push({ how, n, size, arrange, cols, sets, seed });
    for (const size of SIZES) for (const arrange of ['sections', 'mixed']) { C('pages', 1, size, arrange); C('problems', 50, size, arrange); C('problems', 130, size, arrange); }
    for (const size of [SMALL, 'L'].filter((s) => SIZES.includes(s))) for (const arrange of ['sections', 'mixed']) for (const cols of [5, 9]) { C('pages', 1, size, arrange, cols); C('problems', 50, size, arrange, cols); }
    // Sets (critic D2: set 2 printed 10 columns / 48 in 8 columns beside set 1's 8 / 54 in 9)
    C('problems', 130, SMALL, 'sections', 'auto', 2, 7); C('problems', 130, SMALL, 'mixed', 9, 2); C('pages', 1, 'L', 'mixed', 9, 3, 7);
    C('pages', 1, 'L', 'sections', 9, 3); C('problems', 50, 'M', 'mixed', 'auto', 2, 7); C('pages', 1, SMALL, 'sections', 'auto', 2); C('problems', 130, 'L', 'sections', 5, 3, 7);
    const measureSrc = `(doc) => [...doc.querySelectorAll('.ws-page')].map((pg) => {
        const mm = (px) => px * 25.4 / 96;
        const foot = pg.querySelector('footer.ws-foot');
        const grids = [...pg.querySelectorAll('.ws-grid')].map((g) => {
            const cells = [...g.querySelectorAll(':scope > .ws-cell:not(.blankrun)')];
            const fact = g.querySelector('.ws-fact');
            const c0 = cells[0] ? cells[0].getBoundingClientRect() : null;
            return { cols: getComputedStyle(g).gridTemplateColumns.split(' ').filter(Boolean).length, facts: g.classList.contains('facts'),
                ops: cells.map((x) => { const op = x.querySelector('.ws-fact .op'); return op ? op.textContent.trim() : '?'; }),
                pt: fact ? Math.round(parseFloat(getComputedStyle(fact).fontSize) * 72 / 96 * 10) / 10 : 0,
                rowMm: c0 ? mm(c0.height) : 0, bottom: g.getBoundingClientRect().bottom };
        });
        const last = grids.length ? Math.max(...grids.map((g) => g.bottom)) : 0;
        return { key: /key/i.test(pg.className) || !!pg.querySelector('[data-ws-key-ans]'), grids,
            // (white under the grid: to the footer's top, less the page's own fixed space above the footer - the body's foot to
            // the footer, 6 mm on a full Pages-mode page - so a full page reads 0)
            white: foot && grids.length ? mm(Math.min(foot.getBoundingClientRect().top, (pg.querySelector('.ws-body') || foot).getBoundingClientRect().bottom) - last) : null,
            whiteFoot: foot && grids.length ? mm(foot.getBoundingClientRect().top - last) : null,
            setNo: ((/Set (\\d+) of/.exec(foot ? foot.textContent : '') || [])[1]) || '1' };
    })`;
    const res = await page.evaluate(async ({ list, cases, measureSrc }) => {
        const m = await import('/js/modules/simple-print.js');
        const measure = new Function('return ' + measureSrc)();
        const out = [];
        for (const c of cases) {
            const o = { how: c.how, n: c.n, sets: c.sets, size: c.size, cols: c.cols, colsMode: 'aim', key: true, arrange: c.arrange, seed: c.seed, title: true, paper: 'A4' };
            const L = list.map((s) => Object.assign({ amt: '' }, s));
            const b = await m.buildSets(L, o);
            const f = document.createElement('iframe');
            f.style.cssText = 'position:fixed;left:-3000px;top:0;width:900px;height:1200px;border:0';
            document.body.appendChild(f);
            await new Promise((r) => { f.onload = r; f.srcdoc = window.sheetDocument(b.doc, 'm', { paper: 'A4' }); });
            for (let i = 0; i < 40; i++) { if (f.contentDocument.documentElement.getAttribute('data-ws-fonts') === 'ready') break; await new Promise((x) => setTimeout(x, 100)); }
            const pages = measure(f.contentDocument);
            f.remove();
            // each group's full page (Pages 1 of that group alone): rows a page, for the fewest-pages bound
            const full = {};
            for (const div of [false, true]) {
                const g = L.filter((s) => (s.skillId === 'div_facts') === div);
                if (!g.length) continue;
                const fb = await m.buildSimple(g, Object.assign({}, o, { how: 'pages', n: 1, sets: 1, key: false }));
                full[div ? 'div' : 'main'] = { cols: fb.cols, rows: fb.rows };
            }
            out.push({ c, line: m.summaryLine(b, o), pages, counts: b.counts, factPlan: b.factPlan, total: b.total, pagesSet: b.pages, sets: b.sets || 1,
                asked: c.how === 'problems' ? m.splitCounts(L.map((s) => m.parseAmount(s.amt)), c.n).counts : null, full });
        }
        return out;
    }, { list: OWNER, cases, measureSrc });
    const ids = OWNER.map((s) => s.skillId);
    const SIGN = { '+': 'add_facts', '−': 'sub_facts', '-': 'sub_facts', '×': 'mult_facts', 'x': 'mult_facts', '÷': 'div_facts', '/': 'div_facts' };
    const ptBy = { main: new Map(), div: new Map() };
    // the white a FULL page shows under its grid (the body's own foot, ~3 mm): FILL allows one row more than that
    const fullWhite = Math.max(0, Math.min(...res.filter((r) => r.c.how === 'pages').flatMap((r) => r.pages.filter((p) => !p.key && p.white !== null).map((p) => p.white))));
    rows.push(`FILL a full Pages-mode page shows ${fullWhite.toFixed(1)} mm under its grid; a page may show one row more`);
    const check = (r, tag) => {
        const sumCols = (/(\d+) columns/.exec(r.line) || [])[1];
        const divCols = (/division(?: pages| part)? (\d+) columns/.exec(r.line) || [])[1] || sumCols;
        const sumTotal = Number((/(\d+) problems?/.exec(r.line) || [])[1]);
        const sumPages = Number((/(\d+) pages?\b/.exec(r.line) || [])[1]);
        const pupil = r.pages.filter((p) => !p.key);
        const bySet = {};
        pupil.forEach((p) => { (bySet[p.setNo] = bySet[p.setNo] || []).push(p); });
        const pts = { main: new Set(), div: new Set() };
        for (const [sn, ps] of Object.entries(bySet)) {
            const per = ids.map(() => 0);
            ps.forEach((p, k) => {
                for (const g of p.grids.filter((x) => x.facts)) {
                    const div = g.ops.length && g.ops.every((op) => SIGN[op] === 'div_facts');
                    if (g.ops.some((op) => SIGN[op] === 'div_facts') && !div) fails.push(`${tag} set ${sn} page ${k + 1}: SETPAGE a grid mixes ÷ with + − ×`);
                    const want = Number(div ? divCols : sumCols);
                    if (g.cols !== want) fails.push(`${tag} set ${sn} page ${k + 1}: SETPAGE ${div ? '÷' : '+ − ×'} grid prints ${g.cols} columns, the summary says ${want} ("${r.line}")`);
                    if (g.cols > 9 && (r.c.cols === 'auto' || div)) fails.push(`${tag} set ${sn} page ${k + 1}: AUTO9 ${g.cols} columns at ${r.c.cols === 'auto' ? 'Auto' : `Columns ${r.c.cols}`}${div ? ' on ÷' : ''}`);
                    pts[div ? 'div' : 'main'].add(g.pt);
                    for (const op of g.ops) { const i = ids.indexOf(SIGN[op]); if (i >= 0) per[i]++; }
                }
                // FILL: white <= one row on every page but the set's LAST (owner 2026-11-05: "only the last page may run
                // short"; r4 FULLPAGE holds the other pages to 8 mm)
                const lastG = p.grids[p.grids.length - 1];
                const isLast = k === ps.length - 1;
                if (p.white !== null && lastG && p.white > lastG.rowMm + fullWhite + 1.5 && !isLast) fails.push(`${tag} set ${sn} page ${k + 1} of ${ps.length}: FILL ${p.white.toFixed(1)} mm of white under the grid, a row is ${lastG.rowMm.toFixed(1)} mm`);
            });
            // (r5, owner 2026-11-05 "only the last page may run short": every group but the last prints whole rows, so a
            // skill may move up to one row from the even split of the request; the printed counts are the chips exactly)
            const want = r.counts;
            if (per.join() !== (want || []).join()) fails.push(`${tag} set ${sn}: SETPAGE printed ${per.join('/')} per skill, the chips say ${(want || []).join('/')}`);
            if (r.c.how === 'problems' && r.asked) per.forEach((x, i) => { const row = Number(ids[i] === 'div_facts' ? divCols : sumCols) || 9; if (Math.abs(x - r.asked[i]) > row) fails.push(`${tag} set ${sn}: SETPAGE ${ids[i]} printed ${x}, more than a row (${row}) from the request's ${r.asked[i]}`); });
            const tot = per.reduce((t, x) => t + x, 0);
            if (tot !== sumTotal) fails.push(`${tag} set ${sn}: SETPAGE printed ${tot}, the summary says ${sumTotal} problems`);
            if (ps.length !== sumPages) fails.push(`${tag} set ${sn}: SETPAGE ${ps.length} pages, the summary says ${sumPages}`);
            // FEWEST pages (Problems mode): all groups planned together
            if (r.c.how === 'problems' && r.full.main) {
                const nMain = per.filter((_, i) => ids[i] !== 'div_facts').reduce((t, x) => t + x, 0), nDiv = per[ids.indexOf('div_facts')];
                const cm = Number(sumCols), cd = Number(divCols);
                const units = (nMain ? Math.ceil(nMain / cm) / r.full.main.rows : 0) + (nDiv && r.full.div ? Math.ceil(nDiv / cd) / r.full.div.rows : 0);
                // (+ the ÷ section's own instruction line when it shares a page: about 0.05 of a page, r5)
                const bound = Math.max(1, Math.ceil(units + (nMain && nDiv ? 0.05 : 0) - 1e-9));
                if (ps.length > bound) fails.push(`${tag} set ${sn}: FILL ${ps.length} pages where ${bound} hold the rows (${(units).toFixed(2)} pages of rows, all groups together)`);
            }
        }
        for (const k of ['main', 'div']) {
            if (pts[k].size > 1) fails.push(`${tag}: SETPAGE ${k === 'div' ? '÷' : '+ − ×'} digits change across the print: ${[...pts[k]].join(' / ')} pt`);
            const key = `${r.c.size}|${r.c.cols}`;
            for (const pt of pts[k]) { if (!ptBy[k].has(key)) ptBy[k].set(key, new Set()); ptBy[k].get(key).add(pt); }
        }
        if (r.factPlan) rows.push(`${tag}: plan ${JSON.stringify({ lay: r.factPlan.lay.map((l) => [l.cols, l.hMin, l.G]), G: r.factPlan.G, P: r.factPlan.P, s: r.factPlan.stretch, filled: r.factPlan.filled, rows: r.factPlan.rows })}`);
        rows.push(`${tag}: ${r.line} · pages ${Object.values(bySet).map((ps) => ps.map((p) => p.grids.map((g) => g.ops.length).join('+')).join(' | ')).join(' || ')} · white ${pupil.map((p) => (p.white === null ? '-' : `${p.white.toFixed(0)}(${p.whiteFoot.toFixed(0)})`)).join('/')} mm · pt ${[...pts.main].join(',')}${pts.div.size ? ` ÷ ${[...pts.div].join(',')}` : ''}`);
    };
    for (const r of res) check(r, `owner ${r.c.how} ${r.c.n} @${r.c.size} ${r.c.arrange} cols ${r.c.cols}${r.c.sets > 1 ? ` sets ${r.c.sets}` : ''} seed ${r.c.seed}`);
    // D4: one digit size per group at a size and column choice, whatever the count, mode or set
    for (const k of ['main', 'div']) for (const [key, s] of ptBy[k]) if (s.size > 1) fails.push(`SETPAGE ${k === 'div' ? '÷' : '+ − ×'} @${key}: digits differ between prints of the same size and columns: ${[...s].join(' / ')} pt`);

    // UI: the owner's path through the real dialog, Print pressed, the printed document measured
    const ui = [
        { how: 'problems', n: 50, size: SMALL, arrange: 'sections', cols: 'auto', sets: 1 },
        { how: 'problems', n: 130, size: SMALL, arrange: 'sections', cols: 'auto', sets: 2 },
        { how: 'pages', n: 1, size: 'L', arrange: 'mixed', cols: 9, sets: 3 },
    ];
    for (const c of ui) {
        const r = await page.evaluate(async ({ list, c, measureSrc }) => {
            const m = await import('/js/modules/simple-print.js');
            const measure = new Function('return ' + measureSrc)();
            const sleep = (t) => new Promise((x) => setTimeout(x, t));
            const idle = async () => { await sleep(80); for (let i = 0; i < 1200; i++) { const s = m.simplePrintState(); if (s && s.built && !s.busy) return; await sleep(150); } throw new Error('never idle'); };
            const $ = (q) => document.querySelector(q);
            try { localStorage.removeItem('mq_simple_print'); } catch (e) { /* none */ }
            try { window.closeSimplePrint(); } catch (e) { /* none */ }
            window.openSimplePrint(list, { from: 'tray' });
            await idle();
            $(`[data-sp="how"][data-v="${c.how}"]`).click(); await idle();
            const set = (q, v) => { const el = $(q); el.value = String(v); el.dispatchEvent(new Event('input', { bubbles: true })); };
            set('#spN', c.n); await idle();
            if (c.sets > 1) { set('#spSets', c.sets); await idle(); }
            $(`[data-sp="size"][data-v="${c.size}"]`).click(); await idle();
            const colOpts = [...document.querySelectorAll('#spCols option')].map((x) => x.value);
            if (c.cols !== 'auto') { const el = $('#spCols'); el.value = String(c.cols); el.dispatchEvent(new Event('change', { bubbles: true })); await idle(); }
            if (!$('.sp-more').open) { $('[data-sp="more"]').click(); await sleep(100); }
            $(`[data-sp="arrange"][data-v="${c.arrange}"]`).click(); await idle();
            const line = $('#spLine').textContent;
            const chips = [...document.querySelectorAll('.sp-got')].map((x) => +x.textContent);
            const old = document.getElementById('tvPrintFrame'); if (old) old.remove();
            const fr = document.createElement('iframe'); fr.id = 'tvPrintFrame'; fr.style.cssText = 'position:fixed;left:-3000px;top:0;width:900px;height:1200px;border:0;'; document.body.appendChild(fr);
            window.__printed = 0; fr.contentWindow.print = () => { window.__printed = 1; };
            $('[data-sp="print"]').click();
            for (let i = 0; i < 300 && !window.__printed; i++) await sleep(150);
            const doc = document.getElementById('tvPrintFrame').contentDocument;
            const pages = measure(doc);
            window.closeSimplePrint();
            return { line, chips, colOpts, pages, printed: !!window.__printed };
        }, { list: OWNER.map((s) => Object.assign({ amt: '' }, s)), c, measureSrc });
        const tag = `UI owner ${c.how} ${c.n} @${c.size} ${c.arrange} cols ${c.cols} sets ${c.sets}`;
        if (!r.printed) { fails.push(`${tag}: Print never reached the print frame`); continue; }
        if (r.colOpts.includes('10')) fails.push(`${tag}: AUTO9 the Columns list offers 10 with ÷ in the set`);
        const asked = c.how === 'problems' ? (() => { const n = OWNER.length, e = Math.floor(c.n / n); return OWNER.map((_, i) => e + (i < c.n - e * n ? 1 : 0)); })() : null;
        if (asked && r.chips.some((x, i) => Math.abs(x - asked[i]) > 9)) fails.push(`${tag}: SETPAGE the chips say ${r.chips.join('/')}, more than a row from the request's ${asked.join('/')}`);
        if (asked && r.chips.reduce((t, x) => t + x, 0) !== c.n) fails.push(`${tag}: SETPAGE the chips add to ${r.chips.reduce((t, x) => t + x, 0)}, ${c.n} asked`);
        check({ c, line: r.line, pages: r.pages, counts: r.chips, asked, full: {} }, tag);
    }

    // AUTO9: Auto never more than 9 across for any fact mix; 10 only when picked
    const a9 = await page.evaluate(async (owner) => {
        const m = await import('/js/modules/simple-print.js');
        const L = (l) => l.map((s) => Object.assign({ amt: '' }, s));
        const mixes = [['+ −', owner.slice(0, 2)], ['+', owner.slice(0, 1)], ['−', owner.slice(1, 2)], ['×', owner.slice(2, 3)], ['+ − ×', owner.slice(0, 3)], ['÷', owner.slice(3)], ['owner', owner],
            ['× 3', [{ categoryId: 'multiplication', skillId: 'mult_facts', opts: { constant: [3] } }]]];
        const out = [];
        for (const [nm, l] of mixes) for (const size of SML) for (const how of ['pages', 'problems']) {
            const o = { how, n: how === 'pages' ? 1 : 40, size, cols: 'auto', colsMode: 'aim', key: false, arrange: 'sections', seed: 4242, title: true, paper: 'A4' };
            const b = await m.buildSimple(L(l), o);
            const cols = (String(b.pupilHtml).match(/grid-template-columns:\s*repeat\((\d+)/g) || []).map((x) => Number(/(\d+)$/.exec(x)[1]));
            out.push({ nm, size, how, cols: [...new Set([...(b.grids || []).map((g) => g.cols), b.cols, ...cols])].filter(Boolean), line: m.summaryLine(b, o) });
        }
        // picked 10 on + − prints 10
        const o10 = { how: 'pages', n: 1, size: SMALL, cols: 10, colsMode: 'aim', key: false, arrange: 'sections', seed: 4242, title: true, paper: 'A4' };
        const b10 = await m.buildSimple(L(owner.slice(0, 2)), o10);
        return { out, picked10: b10.cols };
    }, OWNER);
    for (const x of a9.out) if (Math.max(...x.cols) > 9) fails.push(`AUTO9 ${x.nm} @${x.size} ${x.how}: Auto printed ${Math.max(...x.cols)} columns ("${x.line}")`);
    rows.push(`AUTO9 ${a9.out.length} Auto prints: most across ${Math.max(...a9.out.flatMap((x) => x.cols))}; + − picked 10 at S prints ${a9.picked10}`);
    if (a9.picked10 !== 10) fails.push(`AUTO9 + − with 10 picked at S printed ${a9.picked10} columns, want 10`);

    // DIVMAX9 docs: both the design standard and PAGE_TYPES
    const fs = require('fs');
    const path = require('path');
    const root = process.env.MQ_ROOT || path.join(__dirname, '..', '..');
    for (const doc of ['WORKSHEET_DESIGN_STANDARD.md', 'design/PAGE_TYPES.md']) {
        const lines = fs.readFileSync(path.join(root, doc), 'utf8').split('\n');
        // (sentence by sentence: a heading's "at most 9" does not excuse the next sentence's "reaches the full 10 columns")
        const bad = lines.flatMap((t, i) => t.split(/(?<=[.;:])\s+(?=[A-Z*(])/).map((x) => [i + 1, x])).filter(([, t]) => /divi|÷/i.test(t) && /reach(es)? (the full )?10\b|10-column|\b(to|at) 10 columns|10 in every|\b10 x \d+ \((stacked ÷|fraction|bracket)|10 x 7 = 69/i.test(t) && !/at most 9|max(imum)? 9|never 10|not 10|no longer|replaced/i.test(t));
        rows.push(`DIVMAX9 docs: ${bad.length} line(s) of ${doc} say division reaches 10 columns`);
        for (const [n, t] of bad) fails.push(`DIVMAX9 ${doc}:${n} says division reaches 10 columns: "${t.trim().slice(0, 140)}"`);
    }
    return { rows, fails };
}

/**
 * facts-print-fix r4 (critic 2026-11-05 on 7fab88a7e; owner decisions 2026-11-05). Every check measures the PRINTED document
 * (sheetDocument in a frame), and PDFIUM-RULES the PDF rasterised by pdfium:
 *   MIXBASE   a grid mixing ÷ forms (stacked ÷, fraction, bracket; + − × stacked too): in every row the problem digits sit on
 *             ONE baseline (the lowest digit line: divisor / denominator / dividend, ±1 mm), every item's ink is centred
 *             across its cell (±1.5 mm), and the row's items are centred down the cell below the number tab (±1.5 mm)
 *   SLOTPOS   every cell's answer slot is VISIBLE (a drawn rule of >= 0.75 pt along its top or bottom edge: the sum rule, the
 *             answer line, the vinculum) and sits in one place in its section: the slots under a stacked fact and a fraction
 *             end on one line (±1 mm), a bracket's quotient slot ends on the row's top digit line (±1.5 mm) - it is written
 *             over the vinculum (PT-FRW-6)
 *   FRACEQ    a fraction fact's "=" ink starts >= 0.25 em after the bar, and the fraction with its "=" is centred (±1 mm)
 *   CLEAR     a bracket or fraction fact's ink keeps >= 2 mm from its cell's border (tests/lib/ws-fact-geom.cjs)
 *   BRKTRACK  a bracket on a fact-rows grid takes its section's row geometry (data-ws-rowgeo), never the 1 em track
 *             fallback ("12)0" printed as "1 2)0" on a shared Problems page), and its divisor's digits keep < 0.45 em apart
 *             (< 0.3 em in a grid mixing forms: the stacked fact's 0.72 em tracks)
 *   PDFIUM-RULES  the PDF of a fact print rasterised by pdfium at 72 and 93 dpi: every full grid shows cols + 1 vertical and
 *             rows + 1 horizontal rules (gap-drawn rules conflate and vanish; tests/lib/ws-pdfium-rules.py); SKIPPED, and said,
 *             when pypdfium2 is not installed
 *   FOOTWRAP  no line break inside a skill's name in a footer ("Division Facts (1-" / "12)")
 *   DIVSECTIONS  ÷ Mix In sections: one section per ÷ form, each with its own instruction; Mixed up: the forms in one grid
 *   SIZEMIX   ÷ Mix, Columns Auto: at most 6 columns at M and 5 at L, and the digits grow S < M < L (the dialog too)
 *   FULLPAGE  every pupil page but a set's LAST: white under the grid <= 8 mm beyond a full page's own; no row stretched past
 *             1.3 x its minimum (PG-11); S / M / L × Auto / 5 / 9 × Problems 30 / 50 / 63 / 130 × both arrangements, the
 *             owner's Pages 1, and mult_facts alone at L
 *   ONEDIGIT  one digit size on a page (a shared page printed + − × at 20 pt beside ÷ at 24 pt)
 *   ROWSAME   a section's rows are one height (±0.3 mm) on every page of a set (PG-11; 37.27 vs 36.38 mm: the frame came
 *             out of a short grid's rows)
 * The owner's page (images/17.png: seed 926447, ÷ Mix, Columns 9, Pages 1, Small) is a required case.
 */
const R4_MEASURE = `(doc) => {
    const win = doc.defaultView;
    const mmPx = 96 / 25.4;
    const cv = doc.createElement('canvas').getContext('2d');
    const glyph = (tn) => {
        const cs = win.getComputedStyle(tn.parentElement);
        cv.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
        const mt = cv.measureText(tn.textContent);
        const rg = doc.createRange(); rg.selectNodeContents(tn);
        const b = rg.getBoundingClientRect();
        const base = b.top + mt.fontBoundingBoxAscent;
        return { l: b.left - mt.actualBoundingBoxLeft, r: b.left + mt.actualBoundingBoxRight, t: base - mt.actualBoundingBoxAscent, b: base + mt.actualBoundingBoxDescent, base, em: parseFloat(cs.fontSize), txt: tn.textContent.trim() };
    };
    const lineOf = (e) => {
        const es = win.getComputedStyle(e);
        const out = [];
        const seen = (s) => parseFloat(es['border' + s + 'Width']) >= 0.9 && es['border' + s + 'Style'] !== 'none' && !/rgba\\(0, 0, 0, 0\\)|transparent/.test(es['border' + s + 'Color']);
        const b = e.getBoundingClientRect();
        if (!b.width) return out;
        if (seen('Top')) out.push({ y: b.top, l: b.left, r: b.right });
        if (seen('Bottom')) out.push({ y: b.bottom, l: b.left, r: b.right });
        return out;
    };
    return [...doc.querySelectorAll('.ws-page')].map((pg) => {
        const pr = pg.getBoundingClientRect();
        const foot = pg.querySelector('footer.ws-foot');
        // FOOTWRAP: each name in the footer's left part on one line
        const wraps = [];
        const fl = foot && foot.querySelector('span');
        if (fl) {
            const nodes = []; const tw = doc.createTreeWalker(fl, 4); let tn; let all = '';
            while ((tn = tw.nextNode())) { nodes.push([tn, all.length]); all += tn.textContent; }
            let at = 0;
            for (const label of all.split(', ')) {
                const s = all.indexOf(label, at); at = s + label.length;
                if (s < 0 || !label.trim()) continue;
                const pos = (k) => { let n = nodes[0]; for (const x of nodes) if (x[1] <= k) n = x; return [n[0], k - n[1]]; };
                const rg = doc.createRange(); const a = pos(s), z = pos(s + label.length);
                try { rg.setStart(a[0], a[1]); rg.setEnd(z[0], Math.min(z[1], z[0].textContent.length)); } catch (e) { continue; }
                const tops = [...new Set([...rg.getClientRects()].filter((q) => q.width > 0.5).map((q) => Math.round(q.top / 3)))];
                if (tops.length > 1) wraps.push(label);
            }
        }
        const grids = [...pg.querySelectorAll('.ws-grid')].map((g) => {
            const gb = g.getBoundingClientRect();
            const cells = [...g.querySelectorAll(':scope > .ws-cell')];
            const prev = g.previousElementSibling;
            const instr = prev && /instr/.test(prev.className) ? prev.textContent.trim() : (prev && prev.querySelector && prev.querySelector('.ws-instrline') ? prev.querySelector('.ws-instrline').textContent.trim() : '');
            return {
                cols: win.getComputedStyle(g).gridTemplateColumns.split(' ').filter(Boolean).length, facts: g.classList.contains('facts'),
                box: [(gb.left - pr.left) / mmPx, (gb.top - pr.top) / mmPx, (gb.right - pr.left) / mmPx, (gb.bottom - pr.top) / mmPx],
                bottom: gb.bottom, instr, blanks: cells.filter((c) => c.classList.contains('blankrun')).length,
                cells: cells.filter((c) => !c.classList.contains('blankrun')).map((c) => {
                    const cr = c.getBoundingClientRect();
                    const tab = c.querySelector('.ws-tab');
                    const kind = c.querySelector('[data-ws-ops="division"]') ? 'bracket' : c.querySelector('[data-ws-notation="fraction"]') ? 'fraction' : c.querySelector('.ws-fact') ? 'stacked' : 'other';
                    const op = (c.querySelector('.ws-fact .op') || {}).textContent;
                    const texts = []; const tw = doc.createTreeWalker(c, 4); let tn;
                    while ((tn = tw.nextNode())) { if (!tn.textContent.trim() || tn.parentElement.closest('.ws-tab, [data-ws-slot]')) continue; texts.push(glyph(tn)); }
                    const lines = []; const slotLines = [];
                    for (const e of c.querySelectorAll('*')) {
                        if (e.closest('.ws-tab')) continue;
                        (e.closest('[data-ws-slot]') ? slotLines : lines).push(...lineOf(e));
                        if (e.tagName.toLowerCase() === 'path') { const b = e.getBoundingClientRect(); lines.push({ y: b.top, l: b.left, r: b.right, svg: 1, t: b.top, b: b.bottom }); }
                    }
                    const slots = [...c.querySelectorAll('[data-ws-slot]')].map((e) => e.getBoundingClientRect()).filter((b) => b.width);
                    const slot = slots.length ? { t: Math.min(...slots.map((b) => b.top)), b: Math.max(...slots.map((b) => b.bottom)), l: Math.min(...slots.map((b) => b.left)), r: Math.max(...slots.map((b) => b.right)) } : null;
                    if (slot) {
                        const near = (y) => Math.min(Math.abs(y - slot.t), Math.abs(y - slot.b)) <= 1.5 * mmPx;
                        slot.visible = [...lines, ...slotLines].some((ln) => !ln.svg && near(ln.y) && Math.min(ln.r, slot.r) - Math.max(ln.l, slot.l) >= 0.5 * (slot.r - slot.l));
                    }
                    const xs = [...texts.map((x) => [x.l, x.r]), ...lines.map((x) => [x.l, x.r])];
                    const ys = [...texts.map((x) => [x.t, x.b]), ...lines.filter((x) => !x.svg).map((x) => [x.y, x.y]), ...lines.filter((x) => x.svg).map((x) => [x.t, x.b])];
                    const ink = xs.length ? { l: Math.min(...xs.map((x) => x[0])), r: Math.max(...xs.map((x) => x[1])), t: Math.min(...ys.map((x) => x[0])), b: Math.max(...ys.map((x) => x[1])) } : null;
                    const digits = texts.filter((x) => /\\d/.test(x.txt));
                    const out = { kind, op, cell: { l: cr.left, r: cr.right, t: cr.top, b: cr.bottom }, tabB: tab ? tab.getBoundingClientRect().bottom : cr.top, ink, slot,
                        base: digits.length ? Math.max(...digits.map((x) => x.base)) : null, top: digits.length ? Math.min(...digits.map((x) => x.base)) : null };
                    const fe = c.querySelector('.ws-fact, .ws-ops, .ws-eq');
                    out.pt = fe ? Math.round(parseFloat(win.getComputedStyle(fe).fontSize) * 72 / 96 * 10) / 10 : 0;
                    if (kind === 'fraction') {
                        const bar = [...c.querySelectorAll('.ws-divfrac span')].find((e) => parseFloat(win.getComputedStyle(e).borderBottomWidth) >= 1.5);
                        const eqn = [...c.querySelectorAll('.o')].find((e) => e.textContent.trim() === '=');
                        if (bar && eqn && eqn.firstChild) {
                            const bb = bar.getBoundingClientRect(); const eg = glyph(eqn.firstChild);
                            out.eqGapEm = (eg.l - bb.right) / eg.em;
                            out.fracOff = ((Math.min(bb.left, eg.l) + Math.max(bb.right, eg.r)) / 2 - (cr.left + cr.right) / 2) / mmPx;
                        }
                    }
                    if (kind === 'bracket') {
                        const grp = c.querySelector('[role="group"]');
                        const ops = c.querySelector('[data-ws-ops="division"]');
                        out.rowgeo = !!(c.querySelector('[data-ws-rowgeo]'));
                        // (the vinculum: the bracket's own rule, for the quotient's writing room over it - QROOM, r5)
                        const vin = grp ? [...grp.querySelectorAll('span[aria-hidden="true"]')].find((e) => /border-top/.test(e.getAttribute('style') || '')) : null;
                        if (vin) out.vinc = vin.getBoundingClientRect().top;
                        if (grp) { const tr = win.getComputedStyle(grp).gridTemplateColumns.split(' ')[0]; out.trackEm = parseFloat(tr) / parseFloat(win.getComputedStyle(grp).fontSize); }
                        // the divisor's digits (the spans before the arc on row 2)
                        const dv = [...(grp ? grp.children : [])].filter((e) => /grid-row:\\s*2/.test(e.getAttribute('style') || '') && /^\\d$/.test(e.textContent.trim()));
                        const lab = grp ? (grp.getAttribute('aria-label') || '') : '';
                        const divisor = (/divided by (\\d+)/.exec(lab) || [])[1] || '';
                        if (divisor.length > 1 && dv.length >= 2) { const a = glyph(dv[0].firstChild), z = glyph(dv[1].firstChild); out.divGapEm = (z.l - a.r) / a.em; }
                        out.label = lab;
                        if (ops) out.pt = Math.round(parseFloat(win.getComputedStyle(ops).fontSize) * 72 / 96 * 10) / 10;
                    }
                    return out;
                }),
            };
        });
        const last = grids.length ? Math.max(...grids.map((g) => g.bottom)) : 0;
        return { key: /key/i.test(pg.className) || !!pg.querySelector('[data-ws-key-ans]'), grids, wraps,
            foot: foot ? foot.textContent.replace(/\\s+/g, ' ').trim() : '',
            white: foot && grids.length ? (Math.min(foot.getBoundingClientRect().top, (pg.querySelector('.ws-body') || foot).getBoundingClientRect().bottom) - last) / mmPx : null,
            setNo: ((/Set (\\d+) of/.exec(foot ? foot.textContent : '') || [])[1]) || '1' };
    });
}`;

async function factsR4(app) {
    const page = app.page;
    const rows = [], fails = [];
    const fsx = require('fs');
    const pathx = require('path');
    const os = require('os');
    const { spawnSync } = require('child_process');
    const DIV_MIX = OWNER.map((s) => (s.skillId === 'div_facts' ? Object.assign({}, s, { opts: { divForm: 'mix' } }) : s));
    const cases = [];
    const C = (tag, list, o, extra = {}) => cases.push(Object.assign({ tag, list, o: Object.assign({ how: 'pages', n: 1, sets: 1, size: SMALL, cols: 'auto', colsMode: 'aim', key: false, arrange: 'sections', seed: 918528, title: true, paper: 'A4' }, o) }, extra));
    // the owner's page (images/17.png) and the ÷ Mix family
    C('OWNER ÷ Mix p1 S c9 mixed', DIV_MIX, { size: SMALL, cols: 9, seed: 926447, arrange: 'mixed' }, { mix: true, pdf: true, owner: true });
    C('OWNER ÷ Mix p1 S c9 sections', DIV_MIX, { size: SMALL, cols: 9, seed: 926447 }, { mix: true, divsec: true, owner: true });
    for (const size of SIZES) {
        for (const arrange of ['mixed', 'sections']) {
            C(`÷ Mix set pages 1 @${size} ${arrange}`, DIV_MIX, { size, arrange, seed: 926447 }, { mix: true, divsec: arrange === 'sections', sizemix: true });
            C(`÷ Mix set problems 63 @${size} ${arrange}`, DIV_MIX, { size, arrange, how: 'problems', n: 63, seed: 926447 }, { mix: true, divsec: arrange === 'sections', sizemix: true });
        }
        C(`÷ Mix alone pages 1 @${size}`, [DIV_MIX[3]], { size, seed: 926447 }, { mix: true, sizemix: true });
    }
    // FULLPAGE: Problems mode over sizes, columns, counts and both arrangements; the owner's Pages 1; mult_facts alone at L
    for (const size of SIZES) for (const cols of ['auto', 5, 9]) for (const n of [30, 50, 63, 130]) for (const arrange of ['sections', 'mixed']) C(`owner problems ${n} @${size} cols ${cols} ${arrange}`, OWNER, { size, cols, how: 'problems', n, arrange });
    for (const size of SIZES) C(`owner pages 1 @${size}`, OWNER, { size }, { pdf: size === SMALL });
    C('mult_facts alone problems 30 @L', [OWNER[2]], { size: 'L', how: 'problems', n: 30 });
    C('mult_facts alone pages 1 @L', [OWNER[2]], { size: 'L' });
    const res = await page.evaluate(async ({ cases, src }) => {
        const m = await import('/js/modules/simple-print.js');
        const measure = new Function('return ' + src)();
        const out = [];
        for (const c of cases) {
            const L = c.list.map((s) => Object.assign({ amt: '' }, s));
            let b;
            try { b = await m.buildSets(L, c.o); } catch (e) { out.push({ err: String(e && e.stack || e) }); continue; }
            const html = window.sheetDocument(b.doc, 'm', { paper: 'A4' });
            const f = document.createElement('iframe');
            f.style.cssText = 'position:fixed;left:-3000px;top:0;width:900px;height:1200px;border:0';
            document.body.appendChild(f);
            await new Promise((r) => { f.onload = r; f.srcdoc = html; });
            for (let i = 0; i < 40; i++) { if (f.contentDocument.documentElement.getAttribute('data-ws-fonts') === 'ready') break; await new Promise((x) => setTimeout(x, 100)); }
            const pages = measure(f.contentDocument);
            f.remove();
            const plan = b.factPlan ? { lay: b.factPlan.lay.map((l) => ({ hMin: l.hMin, cols: l.cols })), rows: b.factPlan.rows } : null;
            out.push({ line: m.summaryLine(b, c.o), pages, plan, factPages: b.factPages || null, html: c.pdf ? html : '', notes: b.notes || [] });
        }
        return out;
    }, { cases, src: R4_MEASURE });
    const mm = (px) => px * 25.4 / 96;
    // a full Pages-mode page's own white under its grid
    const fullWhite = Math.max(0, Math.min(...res.filter((r, i) => !r.err && cases[i].o.how === 'pages').flatMap((r) => r.pages.filter((p) => !p.key && p.white !== null).map((p) => p.white))));
    rows.push(`R4 ${cases.length} prints; a full page shows ${fullWhite.toFixed(1)} mm under its grid`);
    const sizePts = {};
    const pdfJobs = [];
    res.forEach((r, ci) => {
        const c = cases[ci];
        const tag = c.tag;
        if (r.err) { fails.push(`${tag}: build failed ${r.err.slice(0, 200)}`); return; }
        const pupil = r.pages.filter((p) => !p.key);
        const fact = (g) => g.facts && g.cells.length;
        // FOOTWRAP
        for (const [k, p] of r.pages.entries()) if (p.wraps.length) fails.push(`${tag} page ${k + 1}: FOOTWRAP the footer breaks inside "${p.wraps.join('", "')}"`);
        // ONEDIGIT
        pupil.forEach((p, k) => {
            const pts = [...new Set(p.grids.filter(fact).flatMap((g) => g.cells.map((x) => x.pt)).filter(Boolean))];
            if (pts.length > 1) fails.push(`${tag} page ${k + 1}: ONEDIGIT ${pts.join(' / ')} pt on one page`);
        });
        // FULLPAGE: white on every page but a set's last; stretch <= 1.3 on every grid
        const bySet = {};
        pupil.forEach((p) => { (bySet[p.setNo] = bySet[p.setNo] || []).push(p); });
        for (const ps of Object.values(bySet)) ps.forEach((p, k) => {
            if (k < ps.length - 1 && p.white !== null && p.white > fullWhite + 8) fails.push(`${tag} page ${k + 1} of ${ps.length}: FULLPAGE ${p.white.toFixed(1)} mm of white under the grid (a full page shows ${fullWhite.toFixed(1)}; at most 8 more)`);
            // the minimum row height of each grid: the engine's own record (factPages), else the plan's layout
            const fp = r.factPages && r.factPages[k];
            const gs = p.grids.filter(fact);
            const live = r.plan && r.plan.rows[k] ? r.plan.rows[k].map((n, g) => (n ? g : -1)).filter((g) => g >= 0) : [];
            gs.forEach((g, j) => {
                const hMin = fp && fp[j] ? fp[j].hMin : r.plan && live[j] !== undefined ? r.plan.lay[live[j]].hMin : 0;
                const h = mm(g.cells[0].cell.b - g.cells[0].cell.t);
                if (hMin && h > hMin * 1.3 + 0.6) fails.push(`${tag} page ${k + 1}: FULLPAGE rows ${h.toFixed(1)} mm, ${(h / hMin).toFixed(2)} x their minimum ${hMin.toFixed(1)} mm (PG-11: at most 1.3)`);
            });
        });
        // ROWSAME (D-R4-5, PG-11 "identical from page to page"): a section's rows are one height on every page of a set
        for (const ps of Object.values(bySet)) {
            const hs = {};
            ps.forEach((p) => p.grids.filter(fact).forEach((g) => {
                const key = g.cells.some((x) => x.kind === 'bracket' || x.kind === 'fraction' || x.op === '÷') ? [...new Set(g.cells.map((x) => x.kind))].sort().join('+') : 'main';
                (hs[key] = hs[key] || []).push(mm(g.cells[0].cell.b - g.cells[0].cell.t));
            }));
            for (const [key, v] of Object.entries(hs)) if (Math.max(...v) - Math.min(...v) > 0.3) fails.push(`${tag}: ROWSAME the ${key === 'main' ? '+ − ×' : `÷ (${key})`} rows are ${v.map((x) => x.toFixed(2)).join(' / ')} mm on the pages of one set`);
        }
        if (/problems/.test(tag) && /owner|mult/.test(tag)) rows.push(`${tag}: ${r.line} · white ${pupil.map((p) => (p.white === null ? '-' : p.white.toFixed(0))).join('/')} mm · rows ${pupil.map((p) => p.grids.filter(fact).map((g) => mm(g.cells[0].cell.b - g.cells[0].cell.t).toFixed(1)).join('+')).join(' | ')}`);
        // the ÷-form checks
        if (c.mix) {
            const forms = new Set(['stacked', 'fraction', 'bracket']);
            const divGrids = [];
            pupil.forEach((p, k) => p.grids.filter(fact).forEach((g, gi) => {
                const kinds = new Set(g.cells.map((x) => x.kind));
                const isDiv = g.cells.some((x) => x.kind === 'bracket' || x.kind === 'fraction' || x.op === '÷');
                if (isDiv) divGrids.push({ g, k, kinds });
                if ([...kinds].filter((x) => forms.has(x)).length > 1) {
                    // rows: cells grouped by their top
                    const byRow = new Map();
                    g.cells.forEach((x) => { const key = Math.round(x.cell.t); if (!byRow.has(key)) byRow.set(key, []); byRow.get(key).push(x); });
                    let worstBase = 0, worstH = 0, worstV = 0, worstSlot = 0, worstBr = 0, hidden = 0;
                    for (const cs of byRow.values()) {
                        const bases = cs.map((x) => x.base).filter((v) => v !== null);
                        worstBase = Math.max(worstBase, mm(Math.max(...bases) - Math.min(...bases)));
                        for (const x of cs) if (x.ink) worstH = Math.max(worstH, Math.abs(mm((x.ink.l + x.ink.r) / 2 - (x.cell.l + x.cell.r) / 2)));
                        // the row's items (ink and slots) centred down the cell, below the number tab
                        const top = Math.min(...cs.map((x) => Math.min(x.ink ? x.ink.t : Infinity, x.slot ? x.slot.t : Infinity)));
                        const bot = Math.max(...cs.map((x) => Math.max(x.ink ? x.ink.b : -Infinity, x.slot ? x.slot.b : -Infinity)));
                        const c0 = cs[0];
                        const areaT = c0.tabB + 96 / 25.4, areaB = c0.cell.b - 2 * 96 / 25.4;
                        worstV = Math.max(worstV, Math.abs(mm((top + bot) / 2 - (areaT + areaB) / 2)));
                        // slots: under-slots end on one line; a bracket's slot ends on the row's top digit line
                        const under = cs.filter((x) => x.kind !== 'bracket' && x.slot).map((x) => x.slot.b);
                        if (under.length > 1) worstSlot = Math.max(worstSlot, mm(Math.max(...under) - Math.min(...under)));
                        const line1 = cs.filter((x) => x.kind !== 'bracket' && x.top !== null).map((x) => x.top);
                        // (the slot's foot sits on the vinculum, the top line's digits' baseline 0.2 em above it: 0.3 em or 1.5 mm)
                        for (const x of cs.filter((y) => y.kind === 'bracket' && y.slot)) if (line1.length) worstBr = Math.max(worstBr, Math.abs(mm(x.slot.b - Math.max(...line1))) - Math.max(0, 0.3 * x.pt * 25.4 / 72 - 1.5));
                        hidden += cs.filter((x) => !x.slot || !x.slot.visible).length;
                    }
                    const at = `${tag} page ${k + 1} grid ${gi + 1}`;
                    if (worstBase > 1) fails.push(`${at}: MIXBASE the digits of a row sit on baselines ${worstBase.toFixed(1)} mm apart (one baseline: ±1 mm)`);
                    if (worstH > 1.5) fails.push(`${at}: MIXBASE an item is ${worstH.toFixed(1)} mm off its cell's centre across (±1.5 mm)`);
                    if (worstV > 1.5) fails.push(`${at}: MIXBASE a row's items are ${worstV.toFixed(1)} mm off the cell's centre down (±1.5 mm)`);
                    if (worstSlot > 1) fails.push(`${at}: SLOTPOS the answer slots of a row end ${worstSlot.toFixed(1)} mm apart (±1 mm)`);
                    if (worstBr > 1.5) fails.push(`${at}: SLOTPOS a bracket's quotient slot ends ${worstBr.toFixed(1)} mm off the row's top digit line (±1.5 mm)`);
                    if (hidden) fails.push(`${at}: SLOTPOS ${hidden} cell(s) with no visible answer slot`);
                    if (c.owner || /S c9|@S/.test(tag)) rows.push(`${at}: MIXBASE baseline spread ${worstBase.toFixed(2)} mm, across ${worstH.toFixed(2)}, down ${worstV.toFixed(2)}; SLOTPOS ${worstSlot.toFixed(2)} / bracket ${worstBr.toFixed(2)} mm, hidden ${hidden}`);
                }
                for (const x of g.cells) {
                    if (x.kind === 'fraction' && x.eqGapEm !== undefined) {
                        if (x.eqGapEm < 0.25) fails.push(`${tag} page ${k + 1}: FRACEQ "=" ${x.eqGapEm.toFixed(2)} em after the bar (>= 0.25 em)`);
                        if (Math.abs(x.fracOff) > 1) fails.push(`${tag} page ${k + 1}: FRACEQ the fraction and its "=" ${x.fracOff.toFixed(1)} mm off centre (±1 mm)`);
                    }
                    if (x.kind === 'bracket' && g.cols >= 5) {
                        if (!x.rowgeo) fails.push(`${tag} page ${k + 1}: BRKTRACK "${x.label}" is not drawn on its section's row geometry (track ${x.trackEm ? x.trackEm.toFixed(3) : '?'} em)`);
                        // (in a grid mixing forms the digits keep the stacked fact's spacing: 0.3 em; else 0.45 em)
                        const mixG = new Set(g.cells.map((y) => y.kind)).size > 1;
                        if (x.divGapEm !== undefined && x.divGapEm > (mixG ? 0.3 : 0.45)) fails.push(`${tag} page ${k + 1}: BRKTRACK "${x.label}" divisor digits ${x.divGapEm.toFixed(2)} em apart (reads as two numbers)`);
                    }
                    if ((x.kind === 'bracket' || x.kind === 'fraction') && x.ink) {
                        const cl = Math.min(mm(x.ink.l - x.cell.l), mm(x.cell.r - x.ink.r));
                        if (cl < 1.95) fails.push(`${tag} page ${k + 1}: CLEAR "${x.label || x.kind}" ink ${cl.toFixed(2)} mm from its cell's border (>= 2 mm)`);
                        // r5 (D-R5-5): a bracket's ink centred across its cell (±0.5 mm), in a mixed grid and in its own section
                        const off = mm((x.ink.l + x.ink.r) / 2 - (x.cell.l + x.cell.r) / 2);
                        if (x.kind === 'bracket' && Math.abs(off) > 0.5) fails.push(`${tag} page ${k + 1}: CLEAR "${x.label}" ink ${off.toFixed(2)} mm off its cell's centre (±0.5 mm)`);
                    }
                    // QROOM (r5, D-R5-5): the quotient's writing room over the vinculum, under the number tab, is at least a
                    // written digit line at the bracket's own digit size (1.15 em, the stacked fact's answer row), and 6 mm
                    if (x.kind === 'bracket' && x.vinc !== undefined) {
                        const room = mm(x.vinc - x.tabB);
                        // (r6: the stacked answer room - a written line, at least the Size's writing height, + 2 mm)
                        // (a grid mixing forms keeps its three-line frame: the quotient line is one written line)
                        const mixQ = new Set(g.cells.map((y) => y.kind)).size > 1;
                        const want = mixQ ? Math.max(6, 1.15 * x.pt * 25.4 / 72) : Math.max(1.15 * x.pt * 25.4 / 72, { S: 6, M: 8, L: 10 }[c.o.size]) + 2;
                        if (room < want - 0.2) fails.push(`${tag} page ${k + 1}: QROOM "${x.label}" ${room.toFixed(1)} mm to write the quotient over the vinculum (>= ${want} mm)`);
                    }
                }
            }));
            // DIVSECTIONS
            if (c.divsec !== undefined && c.list.length > 1) {
                const formGrids = divGrids.filter((d) => [...d.kinds].some((x) => forms.has(x)));
                if (c.o.arrange === 'sections') {
                    const mixedG = formGrids.filter((d) => [...d.kinds].filter((x) => forms.has(x)).length > 1);
                    // (r5, owner 2026-11-05: the forms get a section each only when each has a full row and the shares hold;
                    // otherwise ONE mixed section, and the note says so)
                    const merged = (r.notes || []).some((t) => /share one section/i.test(t));
                    if (mixedG.length && !merged) fails.push(`${tag}: DIVSECTIONS In sections prints ${mixedG.length} grid(s) mixing ÷ forms (one section per form)`);
                    const perPg = {};
                    formGrids.forEach((d) => { perPg[d.k] = (perPg[d.k] || 0) + 1; });
                    if (merged && Object.values(perPg).some((v) => v > 1)) fails.push(`${tag}: DIVSECTIONS the note says the ÷ forms share one section, a page prints ${Math.max(...Object.values(perPg))} ÷ grids`);
                    const seen = new Set(formGrids.flatMap((d) => [...d.kinds]));
                    for (const f of ['stacked', 'fraction', 'bracket']) if (!seen.has(f)) fails.push(`${tag}: DIVSECTIONS no ${f} ${merged ? 'facts' : 'section'}`);
                    const noInstr = formGrids.filter((d) => !d.g.instr);
                    if (noInstr.length) fails.push(`${tag}: DIVSECTIONS ${noInstr.length} ÷ section(s) without their own instruction`);
                } else if (!formGrids.some((d) => [...d.kinds].filter((x) => forms.has(x)).length > 1)) fails.push(`${tag}: DIVSECTIONS Mixed up does not mix the ÷ forms in one grid`);
                rows.push(`${tag}: ÷ grids ${formGrids.map((d) => `[${[...d.kinds].join('+')}${d.g.instr ? ` "${d.g.instr}"` : ''}]`).join(' ')}`);
            }
            // SIZEMIX
            if (c.sizemix) {
                const dg = divGrids.map((d) => d.g);
                const cols = Math.max(0, ...dg.map((g) => g.cols));
                const pt = Math.max(0, ...dg.flatMap((g) => g.cells.map((x) => x.pt)));
                const cap = { S: 9, M: 6, L: 5 }[c.o.size];
                if (cols > cap) fails.push(`${tag}: SIZEMIX ÷ prints ${cols} columns at ${c.o.size} Auto (at most ${cap})`);
                const key = c.tag.replace(/@[SML]/, '@');
                (sizePts[key] = sizePts[key] || {})[c.o.size] = pt;
                rows.push(`${tag}: ÷ ${cols} columns at ${pt} pt · ${r.line}`);
            }
        }
        if (c.pdf) pdfJobs.push({ tag, html: r.html, pages: r.pages });
    });
    for (const [key, by] of Object.entries(sizePts)) {
        if (by.S && by.M && !(by.S < by.M)) fails.push(`${key}: SIZEMIX the ÷ digits do not grow from S to M (${by.S} / ${by.M} pt)`);
        if (by.M && by.L && !(by.M < by.L)) fails.push(`${key}: SIZEMIX the ÷ digits do not grow from M to L (${by.M} / ${by.L} pt)`);
    }
    // SIZEMIX through the real dialog: the owner's set with ÷ Mix at Medium, Print pressed
    const ui = await page.evaluate(async ({ list, src }) => {
        const m = await import('/js/modules/simple-print.js');
        const measure = new Function('return ' + src)();
        const sleep = (t) => new Promise((x) => setTimeout(x, t));
        const idle = async () => { await sleep(80); for (let i = 0; i < 1200; i++) { const s = m.simplePrintState(); if (s && s.built && !s.busy) return; await sleep(150); } throw new Error('never idle'); };
        const $ = (q) => document.querySelector(q);
        const out = {};
        for (const size of ['M', 'L']) {
            try { localStorage.removeItem('mq_simple_print'); } catch (e) { /* none */ }
            try { window.closeSimplePrint(); } catch (e) { /* none */ }
            window.openSimplePrint(list, { from: 'tray' });
            await idle();
            // every control set (the dialog keeps the last print's choices in memory): Pages 1, one set, Columns Auto
            const set = (q, v, ev = 'input') => { const el = $(q); el.value = String(v); el.dispatchEvent(new Event(ev, { bubbles: true })); };
            $('[data-sp="how"][data-v="pages"]').click(); await idle();
            set('#spN', 1); await idle();
            set('#spSets', 1); await idle();
            set('#spCols', 'auto', 'change'); await idle();
            if (!$('.sp-more').open) { $('[data-sp="more"]').click(); await sleep(100); }
            $('[data-sp="arrange"][data-v="sections"]').click(); await idle();
            $(`[data-sp="size"][data-v="${size}"]`).click(); await idle();
            const old = document.getElementById('tvPrintFrame'); if (old) old.remove();
            const fr = document.createElement('iframe'); fr.id = 'tvPrintFrame'; fr.style.cssText = 'position:fixed;left:-3000px;top:0;width:900px;height:1200px;border:0;'; document.body.appendChild(fr);
            window.__printed = 0; fr.contentWindow.print = () => { window.__printed = 1; };
            $('[data-sp="print"]').click();
            for (let i = 0; i < 300 && !window.__printed; i++) await sleep(150);
            const doc = document.getElementById('tvPrintFrame').contentDocument;
            for (let i = 0; i < 40; i++) { if (doc.documentElement.getAttribute('data-ws-fonts') === 'ready') break; await sleep(100); }
            out[size] = { printed: !!window.__printed, line: $('#spLine').textContent, pages: measure(doc) };
            window.closeSimplePrint();
        }
        return out;
    }, { list: DIV_MIX.map((s) => Object.assign({ amt: '' }, s)), src: R4_MEASURE });
    for (const [size, u] of Object.entries(ui)) {
        if (!u.printed) { fails.push(`UI ÷ Mix @${size}: Print never reached the print frame`); continue; }
        const dg = u.pages.filter((p) => !p.key).flatMap((p) => p.grids.filter((g) => g.facts && g.cells.some((x) => x.kind === 'bracket' || x.kind === 'fraction')));
        const cols = Math.max(0, ...dg.map((g) => g.cols));
        const pt = Math.max(0, ...dg.flatMap((g) => g.cells.map((x) => x.pt)));
        const cap = { M: 6, L: 5 }[size];
        rows.push(`UI ÷ Mix @${size}: ÷ ${cols} columns at ${pt} pt · ${u.line}`);
        if (!dg.length) fails.push(`UI ÷ Mix @${size}: SIZEMIX no ÷ form grid printed`);
        if (cols > cap) fails.push(`UI ÷ Mix @${size}: SIZEMIX ÷ prints ${cols} columns (at most ${cap})`);
        if (pt && pt < { M: 20, L: 24 }[size]) fails.push(`UI ÷ Mix @${size}: SIZEMIX ÷ digits ${pt} pt (the S rung at ${size})`);
    }
    // PDFIUM-RULES
    const py = pathx.join(__dirname, '..', 'lib', 'ws-pdfium-rules.py');
    const dir = fsx.mkdtempSync(pathx.join(os.tmpdir(), 'ws-pdfium-'));
    const p2 = await app.browser.newPage();
    let skipped = '';
    for (const [j, job] of pdfJobs.entries()) {
        if (skipped) break;
        await p2.setViewport({ width: 900, height: 1200 });
        await p2.goto(app.base + '/index.html', { waitUntil: 'domcontentloaded' });
        await p2.evaluate((h) => { document.open(); document.write(h); document.close(); }, job.html);
        for (let i = 0; i < 60; i++) { if (await p2.evaluate(() => document.readyState === 'complete')) break; await new Promise((x) => setTimeout(x, 100)); }
        await p2.evaluate(async () => { await document.fonts.ready; });
        const pdf = pathx.join(dir, `r4-${j}.pdf`);
        await p2.pdf({ path: pdf, preferCSSPageSize: true, printBackground: true });
        // full grids only (a short last row leaves its trailing area unruled, PG-15)
        const pages = job.pages.map((p, i) => ({ page: i, grids: p.grids.filter((g) => g.facts && g.cells.length && !g.blanks && g.cells.length % g.cols === 0).map((g) => ({ box: g.box, cols: g.cols, rows: g.cells.length / g.cols })) })).filter((p) => p.grids.length);
        const jf = pathx.join(dir, `r4-${j}.json`);
        fsx.writeFileSync(jf, JSON.stringify({ pdf, dpis: [72, 93], pages }));
        const run = spawnSync('python3', ['-I', py, jf], { encoding: 'utf8' });
        if (run.error || run.status === 3 || /"skip"/.test(run.stdout || '')) { skipped = (run.stdout || String(run.error || '')).trim().slice(0, 160); break; }
        const lines = String(run.stdout || '').split('\n').filter(Boolean).map((l) => JSON.parse(l));
        let bad = 0;
        for (const x of lines) if (x.v !== x.wantV || x.h !== x.wantH) { bad++; fails.push(`${job.tag} page ${x.page + 1} @${x.dpi} dpi: PDFIUM-RULES ${x.v} vertical / ${x.h} horizontal rules, want ${x.wantV} / ${x.wantH}`); }
        rows.push(`${job.tag}: PDFIUM-RULES ${lines.length} grid rasters, ${bad} short of rules`);
    }
    await p2.close();
    if (skipped) rows.push(`PDFIUM-RULES SKIPPED: ${skipped}`);
    return { rows, fails };
}

/**
 * facts-print-fix r5 (critic 2026-11-05 on 128455ad3, lowest 3): the planner checked over a SWEEP of counts, not a few named
 * cases (every r5 defect sat outside the r4 case list). Built path (buildSets), each print's pupil pages parsed:
 *   SHARES    Pages mode: each skill's printed count is within one row (its grid's columns) of its even share of the
 *             print, or a dialog note says why (÷ Mix In sections at Big printed 2 / 2 / 1 / 15)
 *   BLANKMID  no empty cell on any pupil page but a set's last (a ÷ section's 1-fact row and 4 empty cells on page 1)
 *   DIVORDER  ÷ never prints before + − × when the skill list puts + − × first (the "÷ first" reorder)
 *   TITLEONE  a page title names one divisor / factor / addend ("Divide by 6") only when the skill's option fixes it
 *   ORPHAN    the last page holds at least one full row, or a dialog note says why (a 1-fact last page)
 *   (FULLPLAN, which read the plan's own `filled`, is retired in r6 for the measured PAGESFULL of --sweep)
 *   COLSIZE   with Columns picked (5), the Size still sets the digits: S <= 18 pt < M < L (D-R5-6)
 * Sweep: Problems 20-150 in steps of 5 × S/M/L × Columns Auto/5/9 × both arrangements (the owner's set); Problems
 * 20-150 in steps of 10 with ÷ Mix In sections; Pages 1 and 2 × S/M/L × Auto/5/9 × both arrangements, default and ÷ Mix.
 */
async function factsR5(app) {
    const page = app.page;
    try { await page.bringToFront(); } catch (e) { /* one page */ }
    const rows = [], fails = [];
    const DIV_MIX = OWNER.map((s) => (s.skillId === 'div_facts' ? Object.assign({}, s, { opts: { divForm: 'mix' } }) : s));
    const cases = [];
    const C = (mix, o) => cases.push({ mix, o: Object.assign({ how: 'problems', n: 50, sets: 1, size: SMALL, cols: 'auto', colsMode: 'aim', key: false, arrange: 'sections', seed: 918528, title: true, paper: 'A4' }, o) });
    for (const size of SIZES) for (const cols of ['auto', 5, 9]) for (const arrange of ['sections', 'mixed']) {
        for (let n = 20; n <= 150; n += 5) C(false, { size, cols, arrange, n });
        for (const n of [1, 2]) { C(false, { size, cols, arrange, how: 'pages', n }); C(true, { size, cols, arrange, how: 'pages', n }); }
        if (arrange === 'sections') for (let n = 20; n <= 150; n += 10) C(true, { size, cols, arrange, n });
    }
    const res = await page.evaluate(async ({ cases, owner, mixList }) => {
        const m = await import('/js/modules/simple-print.js');
        const out = [];
        for (const c of cases) {
            const L = (c.mix ? mixList : owner).map((s) => Object.assign({ amt: '' }, s));
            let b;
            try { b = await m.buildSets(L, c.o); } catch (e) { out.push({ err: String(e && e.message || e) }); continue; }
            const d = new DOMParser().parseFromString(`<div>${b.pupilHtml}</div>`, 'text/html');
            const pages = [...d.querySelectorAll('.ws-page')].map((pg) => ({
                title: ((pg.querySelector('.ws-title') || {}).textContent || '').trim(),
                grids: [...pg.querySelectorAll('.ws-grid.facts')].map((g) => {
                    const cells = [...g.querySelectorAll(':scope > .ws-cell:not(.blankrun)')];
                    const cols = Number((/repeat\((\d+)/.exec(g.getAttribute('style') || '') || [])[1]) || 0;
                    const div = cells.some((x) => x.querySelector('[data-ws-ops="division"], [data-ws-notation]') || /÷/.test((x.querySelector('.ws-fact .op') || {}).textContent || ''));
                    return { n: cells.length, cols, div };
                }),
            }));
            out.push({ pages, counts: b.counts, total: b.total, notes: b.notes || [], line: m.summaryLine(b, c.o), filled: b.factPlan ? b.factPlan.filled !== false : true, rowsPlan: b.factPlan ? b.factPlan.rows : null,
                pt: Number((/--fd:(\d+(?:\.\d+)?)pt/.exec(b.pupilHtml) || [])[1]) || 0 });
        }
        return out;
    }, { cases, owner: OWNER, mixList: DIV_MIX });
    const tally = {};
    const F = (k, t) => { tally[k] = (tally[k] || 0) + 1; fails.push(t); };
    res.forEach((r, i) => {
        const c = cases[i];
        const tag = `${c.mix ? '÷ Mix set' : 'owner'} ${c.o.how} ${c.o.n} @${c.o.size} cols ${c.o.cols} ${c.o.arrange}`;
        if (r.err) { F('BUILD', `${tag}: build failed ${r.err}`); return; }
        const P = r.pages;
        const gridCols = P.flatMap((p) => p.grids).filter((g) => g.cols);
        if (!gridCols.length) return;
        // BLANKMID / DIVORDER / ORPHAN / TITLEONE
        let seenDiv = false;
        P.forEach((p, k) => {
            p.grids.forEach((g) => {
                const empty = g.cols ? Math.ceil(g.n / g.cols) * g.cols - g.n : 0;
                if (empty && k < P.length - 1) F('BLANKMID', `${tag} page ${k + 1} of ${P.length}: BLANKMID ${empty} empty cell(s) mid-print (a ${g.div ? '÷' : '+ − ×'} row of ${g.n % g.cols})`);
                if (empty && k === P.length - 1 && p.grids.indexOf(g) < p.grids.length - 1) F('BLANKMID', `${tag} page ${k + 1}: BLANKMID ${empty} empty cell(s) in a section before the page's last`);
                if (g.div) seenDiv = true;
                else if (seenDiv) F('DIVORDER', `${tag} page ${k + 1}: DIVORDER + − × prints after ÷ (the list puts + − × first)`);
            });
            if (/^(Divide by|Multiply by|Add|Subtract) \d+$/.test(p.title)) F('TITLEONE', `${tag} page ${k + 1}: TITLEONE titled "${p.title}" though no option fixes the number`);
        });
        // FULLPLAN: the planner filled every page but the last (r4 FULLPAGE measures named cases; this sweeps the counts)
        // (r6: FULLPLAN read the planner's own `filled` flag - a gate that reads the planner's numbers cannot catch the planner;
        // it is replaced by the measured PAGESFULL of the --sweep step, which measures the printed white on every page)
        const last = P[P.length - 1];
        if (P.length > 1 && last && !last.grids.some((g) => g.cols && g.n >= g.cols) && !r.notes.some((t) => /last page/i.test(t))) F('ORPHAN', `${tag}: ORPHAN the last page holds ${last.grids.map((g) => g.n).join(' + ')} problem(s), no full row and no note`);
        // SHARES (Pages mode)
        if (c.o.how === 'pages') {
            const k = r.counts.length;
            const share = r.total / k;
            const colsOf = (div) => Math.max(...P.flatMap((p) => p.grids).filter((g) => g.div === div && g.cols).map((g) => g.cols), 1);
            const bad = r.counts.map((x, j) => ({ x, j, row: colsOf(OWNER[j].skillId === 'div_facts') })).filter((y) => Math.abs(y.x - share) > y.row + 1e-9);
            if (bad.length && !r.notes.some((t) => /roughly even/i.test(t))) F('SHARES', `${tag}: SHARES printed ${r.counts.join('/')} of ${r.total} (even share ${share.toFixed(1)}; more than a row off: ${bad.map((y) => OWNER[y.j].skillId).join(', ')}) and no note says why`);
        }
    });
    // COLSIZE (D-R5-6, owner decision 4): with Columns picked the Size still sets the digits where the column fits them -
    // Pages 1 at Columns 5: S at most 18 pt, M 24, L 28, so S < M < L
    const cs = {};
    res.forEach((r, i) => { const c = cases[i]; if (!r.err && !c.mix && c.o.how === 'pages' && c.o.n === 1 && c.o.cols === 5 && c.o.arrange === 'sections') cs[c.o.size] = r.pt; });
    if (cs.S && cs.M && cs.L && !(cs.S <= 18 && cs.S < cs.M && cs.M < cs.L)) F('COLSIZE', `COLSIZE Columns 5 prints ${cs.S} / ${cs.M} / ${cs.L} pt at S / M / L (the Size must set the digits: S <= 18 < M < L)`);
    rows.push(`R5 COLSIZE Columns 5, Pages 1: ${cs.S} / ${cs.M} / ${cs.L} pt at S / M / L`);
    rows.push(`R5 sweep: ${cases.length} prints; ${Object.keys(tally).length ? Object.entries(tally).map(([k, v]) => `${k} ${v}`).join(', ') : 'no findings'}`);
    return { rows, fails };
}

/**
 * facts-print-fix r6 (critic 2026-11-05 on 1d4c97a5c, lowest 3; scratchpad r6tools/sweep.cjs): the MEASURED sweep. Every
 * defect of r6 sat outside the r5 sweep's grid (counts under 20, Columns 6-10, Pages 3-4, two-skill lists) or in white the
 * plan REPORTED (factPlan.filled) rather than measured. Each print is built (buildSets), drawn print-emulated in a frame
 * (sheetDocument), and the PRINTED page measured:
 *   TOTAL      a Problems print prints exactly the count asked (÷ Mix In sections asked 10 printed 26)
 *   SHARES     each skill within one row (its grid's columns) of its even share (owner accepted one row)
 *   SIZENOTE   digits below the Size's own pt (M 24, L 28) carry a dialog note naming the Size and the pt
 *   PAGESFULL  measured white under the grid <= 8 mm beyond a full page's own on every page but a set's last, and in Pages
 *              mode on the last page too (the dialog says "every page is full" there)
 *   BLANKMID / DIVORDER (r5) and STRETCH: no row taller than 1.3 x its section's minimum
 *   r7 (critic 2026-11-07 on 2bebf4f94): ORDER - the sections print in the teacher's list order (lists ÷ +, ÷Mix −,
 *   ÷Mix × − +, − ÷Mix +; DIVORDER no longer exempts a list that starts with ÷); COLNOTE - a section printing other columns
 *   than the ones picked carries a note, and the dialog offers an all-fact list Columns 5 and up; BRKCLEAR - a bracket's
 *   INK 2 mm from its border in its own section and in a grid mixing forms (the text boxes reported as INFO); NOTEPLAIN -
 *   no internal code in a note, at most two sentences each
 * Default (`--sweep`, inside --facts-print): ~900 prints; `--sweep-full` (critic / deploy): every count, Columns 1-10.
 */
const SW_LISTS = (() => {
    const A = OWNER[0], S = OWNER[1], M = OWNER[2], D = OWNER[3], DM = Object.assign({}, OWNER[3], { opts: { divForm: 'mix' } });
    return { owner: [A, S, M, D], ownerMix: [A, S, M, DM], addDiv: [A, D], multDiv: [M, DM], addSub: [A, S], asm: [A, S, M], divMix: [DM], mult: [M],
        // (r7 ORDER: the teacher's own order, ÷ first or between)
        divAdd: [D, A], divMixSub: [DM, S], divMixMSA: [DM, M, S, A], subDivMixAdd: [S, DM, A] };
})();
function sweepCases(full) {
    const cases = [];
    const C = (list, o) => cases.push({ list, o: Object.assign({ how: 'problems', n: 50, sets: 1, size: SMALL, cols: 'auto', colsMode: 'aim', key: false, arrange: 'sections', seed: 918528, title: true, paper: 'A4' }, o) });
    const sizes = SML;
    // ÷ Mix In sections, the small counts (D-R6-1)
    for (const size of sizes) for (const cols of ['auto', 7, 9]) for (let n = 10; n <= 60; n += full ? 1 : 4) C('ownerMix', { size, cols, n });
    // the owner's set, every count 1-150 by 5 (by 1 in full), Columns Auto / 7 / 9, both arrangements
    for (const size of sizes) for (const cols of full ? ['auto', 6, 7, 8, 9, 10] : ['auto', 7, 9]) for (const arrange of full ? ['sections', 'mixed'] : ['sections']) for (let n = 1; n <= 150; n += full ? 1 : 9) C('owner', { size, cols, n, arrange });
    // Pages 1-4, every list, Columns Auto and 1-10 (a sample of them by default)
    const pcols = full ? ['auto', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : ['auto', 6, 7, 9, 10];
    for (const list of Object.keys(SW_LISTS)) for (const size of sizes) for (const cols of pcols) for (const n of full ? [1, 2, 3, 4] : [1, 2, 3]) {
        if (!full && !['owner', 'ownerMix', 'addDiv', 'multDiv', 'mult'].includes(list)) continue;
        if (!full && (n === 3 && cols !== 'auto')) continue;
        C(list, { how: 'pages', size, cols, n });
        if (full && SW_LISTS[list].length > 1) C(list, { how: 'pages', size, cols, n, arrange: 'mixed' });
    }
    // two-skill lists in Problems mode
    for (const list of ['addDiv', 'multDiv']) for (const size of sizes) for (const cols of ['auto', 9]) for (let n = 4; n <= 130; n += full ? 3 : 9) C(list, { size, cols, n, arrange: 'mixed' });
    // Sets 2
    for (const size of sizes) { C('owner', { size, n: 63, sets: 2 }); C('ownerMix', { size, how: 'pages', n: 2, sets: 2 }); }
    // SETSKILLDIFF / SETSHAPE (r8 D-R8-1): Sets 2 and 3 over ÷-first and ÷-between lists, Problems and Pages
    for (const list of ['divMixSub', 'subDivMixAdd', 'divMixMSA', 'ownerMix']) for (const size of sizes) {
        for (const n of full ? [13, 40, 63, 97] : [40, 97]) C(list, { size, n, sets: 2 });
        C(list, { size, how: 'pages', n: list === 'divMixMSA' ? 3 : 1, sets: full ? 3 : 2 });
    }
    // ORDER (r7 D-R7-1): lists in unusual orders, both arrangements, Problems and Pages
    for (const list of ['divAdd', 'divMixSub', 'divMixMSA', 'subDivMixAdd']) for (const size of sizes) for (const arrange of ['sections', 'mixed']) {
        for (const n of full ? [5, 23, 40, 50, 97, 150] : [23, 97]) C(list, { size, n, arrange });
        for (const n of [1, 2]) C(list, { size, how: 'pages', n, arrange });
    }
    // COLNOTE (r7 D-R7-2): every picked Columns, Pages 1 and Problems 50
    for (const list of ['owner', 'ownerMix']) for (const size of sizes) for (const cols of full ? [1, 2, 3, 4, 5, 8] : [2, 5, 8]) { C(list, { size, cols, how: 'pages', n: 1 }); C(list, { size, cols, n: 50 }); }
    // (dev: SWEEP_GREP=<regex> keeps the cases whose JSON matches - a quick re-run of a failing slice)
    const g = process.env.SWEEP_GREP ? new RegExp(process.env.SWEEP_GREP) : null;
    return g ? cases.filter((c) => g.test(JSON.stringify(c))) : cases;
}
async function factsSweep(app, full) {
    const page = app.page;
    try { await page.bringToFront(); } catch (e) { /* one page */ }
    await page.emulateMediaType('print');
    const rows = [], fails = [];
    const cases = sweepCases(full);
    const out = [];
    const T0 = Date.now();
    for (let i = 0; i < cases.length; i += 120) {
        const chunk = cases.slice(i, i + 120).map((c) => Object.assign({}, c, { L: SW_LISTS[c.list] }));
        const res = await page.evaluate(async ({ chunk }) => {
            const m = await import('/js/modules/simple-print.js');
            let fr = document.getElementById('__wsSweep');
            if (!fr) { fr = document.createElement('iframe'); fr.id = '__wsSweep'; fr.style.cssText = 'position:fixed;left:0;top:0;width:794px;height:1123px;opacity:0;pointer-events:none;border:0'; document.body.appendChild(fr); }
            const mm = (px) => px * 25.4 / 96;
            const r = [];
            for (const c of chunk) {
                let b;
                try { b = await m.buildSets(c.L.map((s) => Object.assign({ amt: '' }, s)), c.o); } catch (e) { r.push({ err: String(e && e.message || e) }); continue; }
                // (b.doc: every set's pages - the key is off; b.pupilHtml is set 1's only)
                await new Promise((res) => { fr.onload = res; fr.srcdoc = window.sheetDocument(b.doc, 'x', { paper: 'A4' }); });
                const fd = fr.contentDocument;
                try { await fd.fonts.ready; } catch (e) { /* fonts */ }
                const pages = [...fd.querySelectorAll('.ws-page')].map((pg) => {
                    const foot = pg.querySelector('footer.ws-foot');
                    const grids = [...pg.querySelectorAll('.ws-grid.facts')].map((g) => {
                        const cells = [...g.querySelectorAll(':scope > .ws-cell:not(.blankrun)')];
                        const cols = fd.defaultView.getComputedStyle(g).gridTemplateColumns.split(' ').filter(Boolean).length;
                        const ops = {};
                        cells.forEach((x) => { const o = x.querySelector('.ws-fact .op'); const k = x.querySelector('[data-ws-ops="division"], [data-ws-notation]') || (o && /÷/.test(o.textContent)) ? 'div' : o ? o.textContent.trim() : '?'; ops[k] = (ops[k] || 0) + 1; });
                        // (the skills in the order their first cell prints; BRKCLEAR: each bracket's ink - text boxes, rules, the arc -
                        // to its cell's inner edges, as the critic measures it)
                        const seq = [];
                        cells.forEach((x) => { const o = x.querySelector('.ws-fact .op'); const k = x.querySelector('[data-ws-ops="division"], [data-ws-notation]') || (o && /÷/.test(o.textContent)) ? 'div' : o ? o.textContent.trim() : '?'; if (!seq.includes(k)) seq.push(k); });
                        let brk = Infinity, brkBox = Infinity;
                        const cv = fd.createElement('canvas').getContext('2d');
                        for (const x of cells) {
                            if (!x.querySelector('[data-ws-ops="division"]')) continue;
                            const cr = x.getBoundingClientRect(); const cs = fd.defaultView.getComputedStyle(x);
                            // (r8 BRKINK: the right edge is the NEXT cell's drawn rule, which is pulled one hairline over this cell
                            // - fact rows draw left + top rules, PT-FRW-11 - so the ink is measured to that rule's inner edge)
                            const nx = x.nextElementSibling;
                            const nxr = nx && nx.classList.contains('ws-cell') && Math.abs(nx.getBoundingClientRect().top - cr.top) < 2 ? nx.getBoundingClientRect().left + parseFloat(fd.defaultView.getComputedStyle(nx).borderLeftWidth) : null;
                            const L0 = cr.left + parseFloat(cs.borderLeftWidth), R0 = nxr !== null ? Math.min(cr.right - parseFloat(cs.borderRightWidth), nxr) : cr.right - parseFloat(cs.borderRightWidth);
                            const xs = [];
                            const tw = fd.createTreeWalker(x, 4); let tn;
                            const bx = [];
                            while ((tn = tw.nextNode())) {
                                if (!tn.textContent.trim() || tn.parentElement.closest('.ws-tab')) continue;
                                const rg = fd.createRange(); rg.selectNodeContents(tn);
                                const q = rg.getBoundingClientRect(); bx.push([q.left, q.right]);
                                // (the glyph's INK, canvas measureText: a "1" box carries 0.1 em of empty side bearing)
                                const ts = fd.defaultView.getComputedStyle(tn.parentElement); cv.font = `${ts.fontStyle} ${ts.fontWeight} ${ts.fontSize} ${ts.fontFamily}`;
                                const mt = cv.measureText(tn.textContent);
                                xs.push([q.left - mt.actualBoundingBoxLeft, q.left + mt.actualBoundingBoxRight]);
                            }
                            for (const e of x.querySelectorAll('*')) { if (e.closest('.ws-tab')) continue; const es = fd.defaultView.getComputedStyle(e); const q = e.getBoundingClientRect(); if (((parseFloat(es.borderTopWidth) > 0 && !/rgba\(0, 0, 0, 0\)|transparent/.test(es.borderTopColor)) || (parseFloat(es.borderBottomWidth) > 0 && !/rgba\(0, 0, 0, 0\)|transparent/.test(es.borderBottomColor))) && q.width > 2) xs.push([q.left, q.right]); if (e.tagName.toLowerCase() === 'path') xs.push([q.left, q.right]); }
                            if (xs.length) brk = Math.min(brk, mm(Math.min(...xs.map((v) => v[0])) - L0), mm(R0 - Math.max(...xs.map((v) => v[1]))));
                            const all = [...bx, ...xs];
                            if (all.length) brkBox = Math.min(brkBox, mm(Math.min(...all.map((v) => v[0])) - L0), mm(R0 - Math.max(...all.map((v) => v[1]))));
                        }
                        return { n: cells.length, cols, ops, seq, brk: Number.isFinite(brk) ? brk : null, brkBox: Number.isFinite(brkBox) ? brkBox : null, div: !!ops.div, mixed: new Set(cells.map((x) => (x.querySelector('[data-ws-ops="division"]') ? 'b' : x.querySelector('[data-ws-notation]') ? 'f' : 's'))).size > 1, rowH: cells[0] ? mm(cells[0].getBoundingClientRect().height) : 0, bottom: g.getBoundingClientRect().bottom };
                    });
                    const last = grids.length ? Math.max(...grids.map((g) => g.bottom)) : 0;
                    return { grids: grids.map(({ bottom, ...x }) => x), white: foot && grids.length ? mm(Math.min(foot.getBoundingClientRect().top, (pg.querySelector('.ws-body') || foot).getBoundingClientRect().bottom) - last) : null,
                        setNo: Number(((/Set (\d+) of/.exec(foot ? foot.textContent : '') || [])[1]) || 1) };
                });
                r.push({ pages, counts: b.counts, total: b.total, notes: b.notes || [], line: m.summaryLine(b, c.o), factPages: b.factPages || null, sets: b.sets || 1,
                    pts: [...new Set([...String(b.pupilHtml).matchAll(/--fd:(\d+(?:\.\d+)?)pt|font-size:(\d+(?:\.\d+)?)pt;height:[\d.]+mm;margin-top|<div style="--ws-digit:(\d+(?:\.\d+)?)pt">/g)].map((x) => Number(x[1] || x[2] || x[3])))] });
            }
            return r;
        }, { chunk });
        res.forEach((r, j) => out.push({ c: cases[i + j], r }));
    }
    await page.emulateMediaType(null);
    // a full page's own white under its grid: the fullest Pages-mode page of a one-skill print
    const fullWhite = Math.min(...out.filter((x) => !x.r.err && x.c.o.how === 'pages' && x.c.list === 'mult').flatMap((x) => x.r.pages.map((p) => p.white).filter((w) => w !== null)));
    const SIZEPT = { S: 16, M: 24, L: 28 };
    const KEY = { '+': 'add_facts', '−': 'sub_facts', '-': 'sub_facts', '×': 'mult_facts', x: 'mult_facts', div: 'div_facts' };
    const tally = {};
    let brkBoxMin = Infinity;
    const F = (k, t) => { tally[k] = (tally[k] || 0) + 1; if (tally[k] <= 25) fails.push(t); };
    for (const { c, r } of out) {
        const o = c.o;
        const tag = `${c.list} ${o.how} ${o.n} @${o.size} cols ${o.cols} ${o.arrange}${o.sets > 1 ? ` sets ${o.sets}` : ''}`;
        if (r.err) { F('BUILD', `${tag}: SWEEP build failed ${r.err}`); continue; }
        const sets = r.sets;
        const ids = SW_LISTS[c.list].map((s) => s.skillId);
        let off = 0;
        const perSetCnt = [], perSetShape = [];
        for (let sn = 0; sn < sets; sn++) {
            const ps = r.pages.filter((p) => p.setNo === sn + 1);
            const perSet = ps.length;
            const base = off;
            off += perSet;
            const total = ps.reduce((t, p) => t + p.grids.reduce((u, g) => u + g.n, 0), 0);
            if (o.how === 'problems' && total !== o.n) F('TOTAL', `${tag}: TOTAL printed ${total} for ${o.n} asked`);
            // (r8: each set's per-skill counts and its sections a page, for SETSKILLDIFF / SETSHAPE)
            const cs = {};
            ps.forEach((p) => p.grids.forEach((g) => Object.entries(g.ops).forEach(([op, v]) => { const k2 = KEY[op] || op; cs[k2] = (cs[k2] || 0) + v; })));
            perSetCnt.push(ids.map((id) => cs[id] || 0).join('/'));
            perSetShape.push(ps.map((p) => p.grids.length).join(','));
            // SHARES
            if (ids.length > 1) {
                const cnt = {}, colOf = {};
                ps.forEach((p) => p.grids.forEach((g) => Object.entries(g.ops).forEach(([op, v]) => { const k = KEY[op] || op; cnt[k] = (cnt[k] || 0) + v; colOf[k] = Math.max(colOf[k] || 0, g.cols); })));
                const share = total / ids.length;
                // (excused only where the dialog says the shares are only roughly even: whole rows of 5 beside rows of 2 - Columns
                // 1-2 of ÷ forms - cannot come within 2 facts)
                const rough = r.notes.some((t) => /roughly even/.test(t));
                for (const id of ids) if (!rough && Math.abs((cnt[id] || 0) - share) > (colOf[id] || 9) + 0.01) F('SHARES', `${tag}: SHARES ${id} ${cnt[id] || 0} of ${total} (share ${share.toFixed(1)}, a row ${colOf[id] || '?'})`);
            }
            // ORDER (r7 D-R7-1): In sections, the skills print in the teacher's list order (each run of + − × between ÷ its own
            // section); Mixed up, the ÷ section stands where the list puts it against the + − × grid
            {
                const KEYOP = { '+': 'add_facts', '−': 'sub_facts', '-': 'sub_facts', '×': 'mult_facts', x: 'mult_facts', div: 'div_facts' };
                const firsts = [];
                ps.forEach((p) => p.grids.forEach((g) => g.seq.forEach((op) => { const k2 = KEYOP[op] || op; if (!firsts.includes(k2)) firsts.push(k2); })));
                const want = ids.filter((id) => firsts.includes(id));
                if (o.arrange === 'mixed' && ids.length > 1) {
                    const divAt = firsts.indexOf('div_facts'), mainAt = firsts.findIndex((id) => id !== 'div_facts');
                    const listDivFirst = ids.indexOf('div_facts') >= 0 && ids.indexOf('div_facts') < ids.findIndex((id) => id !== 'div_facts');
                    if (divAt >= 0 && mainAt >= 0 && (divAt < mainAt) !== listDivFirst) F('ORDER', `${tag}: ORDER the ÷ section prints ${divAt < mainAt ? 'before' : 'after'} the + − × facts; the list puts ÷ ${listDivFirst ? 'first' : 'after them'}`);
                } else if (firsts.join() !== want.join()) F('ORDER', `${tag}: ORDER prints ${firsts.join(' > ')}, the list is ${ids.join(' > ')}`);
            }
            let seenDiv = false;
            ps.forEach((p, k) => {
                const lastOfSet = k === ps.length - 1;
                p.grids.forEach((g, gi) => {
                    const empty = g.cols ? Math.ceil(g.n / g.cols) * g.cols - g.n : 0;
                    // (a section of less than one row - a few asked - may stand short before the next section on the last page)
                    if (empty && (!lastOfSet || (gi < p.grids.length - 1 && g.n >= g.cols))) F('BLANKMID', `${tag} page ${k + 1}: BLANKMID ${empty} empty cell(s) mid-print (grid ${gi + 1}, ${g.n} in ${g.cols} columns)`);
                    // (r7: DIVORDER no longer exempts a list that starts with ÷ - ORDER below compares with the list itself)
                    if (g.div) seenDiv = true; else if (seenDiv && ids.indexOf('div_facts') > Math.max(...ids.map((id, x) => (id === 'div_facts' ? -1 : x)))) F('DIVORDER', `${tag} page ${k + 1}: DIVORDER + − × after ÷ (the list puts ÷ last)`);
                    // BRKCLEAR (r7 D-R7-3): 2 mm each side of a bracket, in its own section and in a grid mixing forms
                    // (measured on the glyph INK and the drawn arc and bar - what prints; the text BOXES, with a "1"'s empty side
                    // bearing, are tallied as INFO: 2 mm on the boxes at 9 columns would cost the owner's 0.3 mm arc whites)
                    // (r8 BRKINK: 2.0 mm, the owner's figure, not 1.95)
                    if (g.brk !== null && g.brk < Number(process.env.BRK_MIN || 2.0)) F('BRKCLEAR', `${tag} page ${k + 1}: BRKCLEAR a bracket's ink ${g.brk.toFixed(2)} mm from its cell's border (${g.mixed ? 'mixed' : 'bracket'} section, ${g.cols} columns)`);
                    if (g.brkBox !== null) brkBoxMin = Math.min(brkBoxMin, g.brkBox);
                    // COLNOTE (r7 D-R7-2): a section printing other columns than the ones picked says why
                    const pick = o.cols === 'auto' ? 0 : Number(o.cols);
                    if (pick && g.cols !== pick && !r.notes.some((t) => new RegExp(`\\b${g.cols} columns\\b`).test(t)) && !(pick > 9 && g.div && g.cols === 9 && /max 9 with division/.test(r.line || ''))) F('COLNOTE', `${tag} page ${k + 1}: COLNOTE a ${g.div ? '÷' : '+ − ×'} section prints ${g.cols} columns for ${pick} picked and no note says why (notes: "${r.notes.join(' | ').slice(0, 100)}")`);
                });
                // (excused only where the dialog says whole rows cannot fill every page - and then it does not claim they do)
                if (p.white !== null && (!lastOfSet || o.how === 'pages') && p.white > fullWhite + 8 && !r.notes.some((t) => /cannot fill every page/.test(t))) F('PAGESFULL', `${tag} page ${k + 1} of ${ps.length}: PAGESFULL ${p.white.toFixed(1)} mm of white under the grid (a full page ${fullWhite.toFixed(1)}; at most 8 more)${o.how === 'pages' ? ' - the dialog says every page is full' : ''}`);
                // STRETCH: rows against the engine's own minimum for that grid
                // (factPages are set 1's: the sets repeat set 1's plan)
                const fp = r.factPages && sn === 0 ? r.factPages[base + k] : null;
                p.grids.forEach((g, j) => { const h = fp && fp[j] && fp[j].hMin; if (h && g.rowH > h * 1.3 + 0.6) F('STRETCH', `${tag} page ${k + 1}: STRETCH rows ${g.rowH.toFixed(1)} mm, ${(g.rowH / h).toFixed(2)} x their minimum`); });
            });
        }
        // SETSKILLDIFF / SETSHAPE (r8 D-R8-1): every set prints set 1's per-skill counts and set 1's sections a page
        for (let sn = 1; sn < perSetCnt.length; sn++) {
            if (perSetCnt[sn] !== perSetCnt[0]) F('SETSKILLDIFF', `${tag}: SETSKILLDIFF set ${sn + 1} prints ${perSetCnt[sn]} per skill, set 1 ${perSetCnt[0]}`);
            if (perSetShape[sn] !== perSetShape[0]) F('SETSHAPE', `${tag}: SETSHAPE set ${sn + 1} has ${perSetShape[sn]} sections a page, set 1 ${perSetShape[0]}`);
        }
        // NOTEPLAIN (r7): a dialog note never shows an internal code ("(PT-FRW-5)") and keeps to two sentences
        for (const t of r.notes) {
            if (/\((?:PT|PG|CL|VA|TY|DN)-[A-Z0-9-]+\)|\b(?:PT|PG)-[A-Z]*-?\d/.test(t)) F('NOTEPLAIN', `${tag}: NOTEPLAIN a note shows an internal code: "${t.slice(0, 100)}"`);
            if ((t.match(/[.!?](?=\s|$)/g) || []).length > 2) F('NOTEPLAIN', `${tag}: NOTEPLAIN a note runs to ${(t.match(/[.!?](?=\s|$)/g) || []).length} sentences: "${t.slice(0, 100)}"`);
        }
        // SIZENOTE
        const pt = r.pts.length ? Math.min(...r.pts) : 0;
        if (pt && pt < SIZEPT[o.size] - 0.1) {
            const nm = { M: 'Medium', L: 'Big' }[o.size];
            if (!r.notes.some((t) => new RegExp(`${nm}\\b[^.]*\\b${pt} pt`).test(t))) F('SIZENOTE', `${tag}: SIZENOTE prints ${pt} pt at ${nm} (${SIZEPT[o.size]} pt) and no note names ${nm} and ${pt} pt (notes: "${r.notes.join(' | ').slice(0, 120)}")`);
        }
    }
    // SIZEBTN (D-R6-2): through the real dialog, Columns 9 picked at Big (the sweep's SIZENOTE covers Medium) - the size button's line says the pt that
    // prints, and the dialog's notes say the Size's digits do not fit
    const ui = await page.evaluate(async ({ list }) => {
        const m = await import('/js/modules/simple-print.js');
        const sleep = (t) => new Promise((x) => setTimeout(x, t));
        const idle = async () => { await sleep(80); for (let i = 0; i < 1200; i++) { const s = m.simplePrintState(); if (s && s.built && !s.busy) return; await sleep(100); } throw new Error('never idle'); };
        const $ = (q) => document.querySelector(q);
        const set = (q, v, ev = 'input') => { const el = $(q); el.value = String(v); el.dispatchEvent(new Event(ev, { bubbles: true })); };
        const out = {};
        for (const size of ['L']) {
            try { window.closeSimplePrint(); } catch (e) { /* none */ }
            window.openSimplePrint(list, { from: 'tray' });
            await idle();
            $('[data-sp="how"][data-v="pages"]').click(); await idle();
            set('#spN', 1); await idle(); set('#spSets', 1); await idle();
            $(`[data-sp="size"][data-v="${size}"]`).click(); await idle();
            set('#spCols', 9, 'change'); await idle();
            for (let i = 0; i < 60 && /…/.test(($(`.sp-size-${size} .sp-size-cols`) || {}).textContent || '…'); i++) await sleep(100);
            const btn = ($(`.sp-size-${size} .sp-size-cols`) || {}).textContent || '';
            const notes = [...document.querySelectorAll('.sp-note')].map((x) => x.textContent).join(' | ');
            // (what prints: the same list and the dialog's own choices, built)
            const st = m.simplePrintState();
            const pr = st.prefs;
            const bb = await m.buildSets(list, { how: pr.how, n: pr.n, sets: 1, size: pr.size, cols: pr.cols, colsMode: pr.colsMode, key: false, arrange: pr.arrange, seed: 918528, title: true, paper: 'A4' });
            const html = bb.pupilHtml || '';
            const pts = [...String(html).matchAll(/--fd:(\d+(?:\.\d+)?)pt/g)].map((x) => Number(x[1]));
            out[size] = { btn, notes, pt: pts.length ? Math.min(...pts) : 0, colOpts: [...document.querySelectorAll('#spCols option')].map((x) => x.value) };
            set('#spCols', 'auto', 'change'); await idle();
            window.closeSimplePrint();
        }
        return out;
    }, { list: SW_LISTS.owner.map((s) => Object.assign({ amt: '' }, s)) });
    for (const [size, u] of Object.entries(ui)) {
        const nm = { L: 'Big', M: 'Medium' }[size];
        rows.push(`SIZEBTN @${size} Columns 9: button "${u.btn}", prints ${u.pt} pt; notes "${u.notes.slice(0, 140)}"`);
        // (r7 D-R7-2: an all-fact list offers Columns 5 and up - fact rows floor at 5 across)
        if (u.colOpts.some((v) => /^[1-4]$/.test(v))) F('COLNOTE', `COLNOTE the dialog offers Columns ${u.colOpts.filter((v) => /^[1-4]$/.test(v)).join(', ')} for an all-fact list (fact rows print 5 to 10 across)`);
        if (!new RegExp(`\\b${u.pt} pt\\b`).test(u.btn)) F('SIZEBTN', `SIZEBTN @${size} Columns 9: the ${nm} button reads "${u.btn}" but the print is ${u.pt} pt`);
        if (u.pt < { L: 28, M: 24 }[size] && !new RegExp(`${nm}\\b[^.]*\\b${u.pt} pt`).test(u.notes)) F('SIZEBTN', `SIZEBTN @${size} Columns 9: the dialog's notes do not say ${nm} prints at ${u.pt} pt ("${u.notes.slice(0, 120)}")`);
    }
    // BRKINK (r8 D-R8-2): the printed INK of the ÷ cells, rasterised at 300 dpi (tests/lib/ws-inkclear.py), >= 2.0 mm from
    // the cell's drawn rules, at 9 columns, Small and Big - the DOM measure missed the vinculum's and the answer line's ends
    {
        const pathx = require('path'), fsx = require('fs'), os = require('os');
        const { spawnSync } = require('child_process');
        const py = pathx.join(__dirname, '..', 'lib', 'ws-inkclear.py');
        const dir = fsx.mkdtempSync(pathx.join(os.tmpdir(), 'ws-inkclear-'));
        const jobs = [['÷ Mix alone problems 63 @S cols 9', SW_LISTS.divMix, { how: 'problems', n: 63, size: SMALL, cols: 9 }], ['ownerMix pages 1 @L cols 9', SW_LISTS.ownerMix, { how: 'pages', n: 1, size: 'L', cols: 9 }]];
        const p2 = await app.browser.newPage();
        await p2.setViewport({ width: 900, height: 1200, deviceScaleFactor: 300 / 96 });
        let skipped = '';
        for (const [j, [tag, list, o0]] of jobs.entries()) {
            const html = await page.evaluate(async ({ list, o }) => {
                const m = await import('/js/modules/simple-print.js');
                const b = await m.buildSets(list.map((s) => Object.assign({ amt: '' }, s)), Object.assign({ sets: 1, colsMode: 'aim', key: false, arrange: 'sections', seed: 918528, title: true, paper: 'A4' }, o));
                return window.sheetDocument(b.pupilHtml, 'x', { paper: 'A4' });
            }, { list, o: o0 });
            await p2.goto(app.base + '/index.html', { waitUntil: 'domcontentloaded' });
            await p2.evaluate((h) => { document.open(); document.write(h); document.close(); }, html);
            for (let i = 0; i < 60; i++) { if (await p2.evaluate(() => document.readyState === 'complete')) break; await new Promise((x) => setTimeout(x, 100)); }
            await p2.evaluate(async () => { await document.fonts.ready; });
            const pages = await p2.$$('.ws-page');
            let shot = null;
            for (const pg of pages) if (await pg.evaluate((e) => !!e.querySelector('[data-ws-ops="division"]'))) { shot = pg; break; }
            if (!shot) { F('BRKINK', `${tag}: BRKINK no bracket printed`); continue; }
            const png = pathx.join(dir, `ink-${j}.png`);
            await shot.screenshot({ path: png });
            const run = spawnSync('python3', ['-I', py, png], { encoding: 'utf8' });
            if (run.error || run.status === 3) { skipped = String(run.stdout || run.error).slice(0, 120); break; }
            const r = JSON.parse(String(run.stdout).trim().split('\n').pop());
            rows.push(`SWEEP BRKINK ${tag}: printed ink ${r.min} mm from the cell rules at the closest (${r.rows.length} rows)`);
            if (r.min === null || r.min < 2.0) F('BRKINK', `${tag}: BRKINK printed ink ${r.min} mm from a cell's rule (>= 2.0 mm)`);
        }
        await p2.close();
        if (skipped) rows.push(`SWEEP BRKINK SKIPPED: ${skipped}`);
    }
    rows.push(`SWEEP BRKCLEAR info: the closest bracket text BOX to a border ${Number.isFinite(brkBoxMin) ? brkBoxMin.toFixed(2) : '-'} mm (the ink is held to 2 mm)`);
    rows.push(`SWEEP ${full ? 'full ' : ''}${out.length} prints measured in ${((Date.now() - T0) / 1000).toFixed(0)} s (a full page ${fullWhite.toFixed(1)} mm under its grid); ${Object.keys(tally).length ? Object.entries(tally).map(([k, v]) => `${k} ${v}`).join(', ') : 'no findings'}`);
    return { rows, fails };
}

(async () => {
    const app = await open({ seed: 7 });
    const page = app.page;
    await withSizeGlobals(page);
    { const np = app.browser.newPage.bind(app.browser); app.browser.newPage = async (...a) => withSizeGlobals(await np(...a)); }
    await page.evaluate(() => window.__mqLoadDeferred());
    const fails = [];
    const rows = [];
    const F2 = (t) => fails.push('UI3 ' + t);
    if (has('sweep') || has('sweep-full')) {
        // (the measured sweep alone; --sweep-full: every count and Columns 1-10, for the critic and the deploy run)
        const sw = await factsSweep(app, has('sweep-full'));
        console.log(sw.rows.join('\n'));
        for (const f of sw.fails) console.log('  FAIL ' + f);
        await app.close();
        console.log(sw.fails.length ? 'ws-simple-print: FAIL' : 'ws-simple-print: OK');
        process.exit(sw.fails.length ? 1 : 0);
    }
    if (has('r5')) {
        // (dev focus: the r5 sweep only)
        const r5 = await factsR5(app);
        console.log(r5.rows.join('\n'));
        for (const f of r5.fails) console.log('  FAIL ' + f);
        await app.close();
        console.log(r5.fails.length ? 'ws-simple-print: FAIL' : 'ws-simple-print: OK');
        process.exit(r5.fails.length ? 1 : 0);
    }
    if (has('r4')) {
        // (dev focus: the r4 checks only)
        const r4 = await factsR4(app);
        console.log(r4.rows.join('\n'));
        for (const f of r4.fails) console.log('  FAIL ' + f);
        await app.close();
        console.log(r4.fails.length ? 'ws-simple-print: FAIL' : 'ws-simple-print: OK');
        process.exit(r4.fails.length ? 1 : 0);
    }
    if (has('setpage')) {
        // (dev focus: the r3 checks only)
        const sp = await factsSetPage(page);
        console.log(sp.rows.join('\n'));
        for (const f of sp.fails) console.log('  FAIL ' + f);
        await app.close();
        console.log(sp.fails.length ? 'ws-simple-print: FAIL' : 'ws-simple-print: OK');
        process.exit(sp.fails.length ? 1 : 0);
    }
    if (!has('backtest') && !has('backtest-options')) {
        const fp = await factsPrint(page);
        rows.push(...fp.rows);
        fails.push(...fp.fails);
        const fc = await factsCounts(page);
        rows.push(...fc.rows);
        fails.push(...fc.fails);
        const sp = await factsSetPage(page);
        rows.push(...sp.rows);
        fails.push(...sp.fails);
        const r4 = await factsR4(app);
        rows.push(...r4.rows);
        fails.push(...r4.fails);
        const r5 = await factsR5(app);
        rows.push(...r5.rows);
        fails.push(...r5.fails);
        const sw = await factsSweep(app, false);
        rows.push(...sw.rows);
        fails.push(...sw.fails);
        if (has('facts-print')) {
            console.log(rows.join('\n'));
            for (const f of fails) console.log('  FAIL ' + f);
            await app.close();
            console.log(fails.length ? 'ws-simple-print: FAIL' : 'ws-simple-print: OK');
            process.exit(fails.length ? 1 : 0);
        }
    }
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
                    else if (!cl.some((c) => c === want || (c === 8 && want === 9))) fails.push(`${tag}: FACTS ${cl.join('/')} columns, want ${want}`);
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
                for (const size of SM) {
                    // the old pass-through: the asked 9 sent as is to a Mixed up page of non-fact problems
                    const res = await window.buildSheet({ role: 'mixed-practice', arrangement: 'mixed', columns: 9, size, look: 'auto', paper: 'A4', seed: 5, key: { on: false }, sections: [{ skills: sets.missing, count: 24, columns: 9 }] });
                    const c = ((res.fits && res.fits.sections) || []).map((x) => x.cols).concat(res.fits && res.fits.cols ? [res.fits.cols] : []);
                    if (c.some((x) => x > 6)) F(`COLS7 (old) missing mixed @${size}: a non-fact part prints ${c.join('/')} across`);
                }
            }
            // COLS7 + EXACT on the six set (facts + missing numbers) and the missing set (no facts)
            for (const size of bt ? [] : SM) {
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
            // (owner 2026-11-05: the six set holds div_facts, so it offers 9, DIVMAX9)
            if (withF !== (bt ? 10 : 9)) F(`COLS7 the six set (with facts and division facts) offers up to ${withF} columns, want 9`);
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
                    // (facts-print-fix 2026-11-05: Auto at S takes 9 when a dividend reaches 3 digits, 2 mm of white each side)
                    const want = { S: [10, 9, 8], M: [6], L: [5] };
                    const per = {};
                    for (const size of SML) {
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
                for (const size of SML) {
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
            const pr = { how: 'problems', n: 30, sets: 2, size: SMALL, cols: 5, colsMode: 'exact', key: false, arrange: 'sections' };
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
            if (!st || !same(st.list.map((x) => [x.key, x.opts, x.amt]), skills.map((x) => [`${x.categoryId}:${x.skillId}`, x.opts, x.amt])) || st.prefs.size !== SMALL || st.prefs.how !== 'problems' || st.prefs.nProblems !== 30 || st.prefs.cols !== 5 || st.prefs.colsMode !== 'exact' || st.prefs.sets !== 2 || st.prefs.key !== false) F(`QUICK open: the dialog is not filled in: ${JSON.stringify(st && { list: st.list, prefs: st.prefs })}`);
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
            for (const w of [1366, 820, 390]) {
                const vh = w === 1366 ? 768 : w === 820 ? 1180 : 844;
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
                // ZOOMGAIN (critic D2) / ZOOMCOVER (critic D1): over a page in the pane, a zoom shows only when it is clearly
                // larger (>= 1.3x the sheet under the pointer) and never under the pointer
                const zoomAt = () => page.evaluate(() => { const z = document.querySelector('#spRoot .sp-zoom'); if (!z || z.hidden) return null; const r = z.getBoundingClientRect(); return { h: r.height, w: r.width, l: r.left, r: r.right, t: r.top, b: r.bottom, frame: !!z.querySelector('iframe') }; });
                const hoverCheck = async (sel, tag, need) => {
                    const sh = await page.evaluate((sel) => { const all = [...document.querySelectorAll(sel)].filter((x) => { const r = x.getBoundingClientRect(); return r.bottom > 40 && r.top < window.innerHeight - 40; }); if (!all.length) return null; const r = all[all.length - 1].getBoundingClientRect(); return { l: r.left, w: r.width, y: (Math.max(r.top, 0) + Math.min(r.bottom, window.innerHeight)) / 2 }; }, sel);
                    if (!sh) { L(`${tag} @${w} nothing to hover (${sel})`); return []; }
                    const out = [];
                    for (const fx of [0.1, 0.5, 0.9]) {
                        const x = sh.l + sh.w * fx;
                        await page.mouse.move(2, 2); await settle(60);
                        await page.mouse.move(x, sh.y, { steps: 3 }); await settle(700);
                        const z = await zoomAt();
                        out.push(z);
                        if (!z) { if (need) L(`HOVERZOOM @${w} no zoom over ${tag} at x=${Math.round(x)}`); continue; }
                        if (z.l <= x && x <= z.r) L(`ZOOMCOVER @${w} the zoom (${Math.round(z.l)}-${Math.round(z.r)}) covers the pointer at x=${Math.round(x)} over ${tag}`);
                        if (z.w < 1.3 * sh.w) L(`ZOOMGAIN @${w} the zoom (${Math.round(z.w)} px) is not 1.3x the ${tag} under it (${Math.round(sh.w)} px)`);
                        if (z.l < 0 || z.r > w + 1 || z.t < 0 || z.b > vh + 1) L(`ZOOMCOVER @${w} the zoom leaves the screen`);
                        if (need && z.h < 0.6 * vh) L(`HOVERZOOM @${w} the ${tag} zoom is ${Math.round(z.h)} px (< 60 % of ${vh})`);
                    }
                    rows.push(`HOVERZOOM @${w} over ${tag}: ${out.map((z) => z ? `${Math.round(z.w)}x${Math.round(z.h)}` : 'none').join(' / ')}`);
                    return out;
                };
                if (w !== 390) {
                    await hoverCheck('#spRoot .sp-lg-sheet', 'a pane page', false);
                    if (SH && w === 1366) await page.screenshot({ path: SH + '/pane-hover-1366.png' });
                    await page.mouse.move(5, 5); await settle(150);
                }
                await page.keyboard.press('Escape');
                await settle(150);
                const e2 = await page.evaluate(async () => ({ large: !!document.querySelector('#spRoot .sp-large'), open: !!(await import('/js/modules/simple-print.js')).simplePrintState(), focus: document.activeElement && document.activeElement.classList.contains('sp-larger') }));
                if (e2.large) L(`ESC @${w} Esc does not close the pane (focus ${await page.evaluate(() => { const a = document.activeElement; return a ? a.tagName + '.' + a.className : '-'; })})`);
                if (!e2.open) L(`ESC @${w} Esc in the pane closed the whole dialog`);
                if (!e2.focus) L(`ESC @${w} focus does not return to Larger preview`);
                if (w !== 390) {
                    // the thumbnail zoom: very large at 1366, beside the pointer at 820 portrait
                    const zs = await hoverCheck('#spRoot .sp-thumb', 'the thumbnail', true);
                    if (w === 1366 && zs[1] && zs[1].h < 0.8 * vh) L(`HOVERZOOM the thumbnail zoom is ${Math.round(zs[1].h)} px (< 80 % of ${vh})`);
                    if (SH) await page.screenshot({ path: SH + `/hoverzoom-${w}.png` });
                    await page.mouse.move(5, 5); await settle(200);
                    if (await page.evaluate(() => { const z = document.querySelector('#spRoot .sp-zoom'); return z && !z.hidden; })) L('HOVERZOOM does not hide on leave');
                    // ZOOMSTALE (critic D4): a rebuild while the zoom shows hides it
                    const t = await page.evaluate(() => { const s = document.querySelector('#spRoot .sp-thumb').getBoundingClientRect(); return { x: s.left + s.width / 2, y: s.top + s.height / 2 }; });
                    await page.mouse.move(t.x, t.y, { steps: 3 }); await settle(700);
                    if (!(await zoomAt())) L(`ZOOMSTALE @${w} no zoom to test with`);
                    await page.evaluate(() => { const n = document.getElementById('spN'); n.value = '3'; n.dispatchEvent(new Event('input', { bubbles: true })); });
                    await settle(100);
                    if (await zoomAt()) L(`ZOOMSTALE @${w} the zoom still shows the old pages after a change`);
                    await page.waitForFunction(async () => { const m = await import('/js/modules/simple-print.js'); const s = m.simplePrintState(); return s && !s.busy && s.built; }, { timeout: 30000 }).catch(() => {});
                    // Esc order on the dialog: the zoom first, then the dialog
                    await page.mouse.move(2, 2); await settle(60);
                    await page.mouse.move(t.x, t.y, { steps: 3 }); await settle(700);
                    if (await zoomAt()) {
                        await page.keyboard.press('Escape');
                        const e1 = await page.evaluate(async () => ({ zoom: !!(document.querySelector('#spRoot .sp-zoom') && !document.querySelector('#spRoot .sp-zoom').hidden), open: !!(await import('/js/modules/simple-print.js')).simplePrintState() }));
                        if (e1.zoom) L('ESC Esc does not hide the zoom');
                        if (!e1.open) L('ESC the first Esc (zoom showing) closed the dialog too');
                    }
                    await page.mouse.move(5, 5);
                    await settle(100);
                }
                await page.keyboard.press('Escape');
                await settle(100)
;
                if (await page.evaluate(async () => !!(await import('/js/modules/simple-print.js')).simplePrintState())) L(`ESC @${w} the next Esc does not close the dialog`);
            }
            // SETS2 (critic D3): with 2 sets, each page's caption says its own set and whether it is that set's key; a
            // divider at each set and at each set's key. PANEPRINT (D7): Print in the pane header, and the header counts
            // pupil pages and key pages. FOCUSRING (D5): the page list's keyboard ring is the dialog's 3 px ring.
            {
                await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
                await page.evaluate(async () => {
                    window.closeSimplePrint && window.closeSimplePrint();
                    window.openSimplePrint([{ categoryId: 'addition', skillId: 'add_two_digit' }, { categoryId: 'subtraction', skillId: 'missing_add_sub' }], { from: 'tray' });
                    const r = document.getElementById('spRoot');
                    const pg = r.querySelector('[data-sp="how"][data-v="pages"]'); if (pg && pg.getAttribute('aria-checked') !== 'true') pg.click();
                    await new Promise((x) => setTimeout(x, 50));
                    const n = document.getElementById('spN'); n.value = '2'; n.dispatchEvent(new Event('input', { bubbles: true }));
                    const k = r.querySelector('[data-sp="key"][data-v="true"]'); if (k && k.getAttribute('aria-checked') !== 'true') k.click();
                    const st = document.getElementById('spSets'); st.value = '2'; st.dispatchEvent(new Event('input', { bubbles: true })); st.dispatchEvent(new Event('change', { bubbles: true }));
                });
                await page.waitForFunction(async () => { const m = await import('/js/modules/simple-print.js'); const s = m.simplePrintState(); return s && !s.busy && s.built && s.built.sets === 2; }, { timeout: 30000 }).catch(() => {});
                await settle(300);
                await page.focus('#spRoot .sp-larger');
                await page.keyboard.press('Enter');
                await settle(600);
                const q = await page.evaluate(async () => {
                    const m = await import('/js/modules/simple-print.js');
                    const st = m.simplePrintState();
                    const r = document.getElementById('spRoot'), sc = r.querySelector('.sp-lg-scroll');
                    if (!sc) return null;
                    const seq = [...sc.children].map((x) => x.classList.contains('sp-lg-div') ? `[${x.textContent.trim()}]` : (x.querySelector('figcaption') || {}).textContent || '?');
                    const pr = r.querySelector('.sp-lg-top [data-sp="print"]');
                    const pb = pr && pr.getBoundingClientRect();
                    return { sets: st.built && st.built.sets, pupil: st.built && st.built.pages, seq, meta: (r.querySelector('.sp-lg-meta') || {}).textContent || '', print: pb ? [pb.width, pb.height] : null, ring: document.activeElement === sc ? getComputedStyle(sc).outlineWidth + ' ' + getComputedStyle(sc).outlineStyle : 'focus on ' + (document.activeElement && document.activeElement.className) };
                });
                if (!q) L('SETS2 the pane did not open');
                else {
                    rows.push(`SETS2: ${q.seq.join(' | ')}`);
                    rows.push(`PANEPRINT: "${q.meta}"; FOCUSRING: ${q.ring}`);
                    if (q.sets !== 2) L(`SETS2 built ${q.sets} sets, not 2`);
                    const P = q.pupil || 0;
                    // expected: [Set 1] Set 1 · page 1..P [Set 1 answer key] Set 1 · answer key page .. [Set 2] ...
                    let cur = 0, inKey = false, nP = 0;
                    const seen = { div: 0, key: 0 };
                    for (const it of q.seq) {
                        let mm;
                        if ((mm = /^\[Set (\d+)\]$/.exec(it))) { if (Number(mm[1]) !== cur + 1) L(`SETS2 divider "${it}" out of order`); cur = Number(mm[1]); inKey = false; nP = 0; seen.div++; continue; }
                        if ((mm = /^\[Set (\d+) answer key\]$/.exec(it))) { if (Number(mm[1]) !== cur) L(`SETS2 key divider "${it}" in set ${cur}`); if (nP !== P) L(`SETS2 set ${cur} has ${nP} pupil pages before its key, not ${P}`); inKey = true; seen.key++; continue; }
                        if ((mm = /^Set (\d+) · (answer key )?page (\d+) of (\d+)$/.exec(it))) {
                            if (Number(mm[1]) !== cur) L(`SETS2 caption "${it}" sits in set ${cur}`);
                            if (!!mm[2] !== inKey) L(`SETS2 caption "${it}" ${inKey ? 'in a key part is not marked answer key' : 'marks a pupil page as the key'}`);
                            if (!inKey) { nP++; if (Number(mm[4]) !== P) L(`SETS2 caption "${it}": a set has ${P} pupil pages`); }
                            continue;
                        }
                        L(`SETS2 unexpected item "${it}"`);
                    }
                    if (seen.div !== 2 || seen.key !== 2) L(`SETS2 ${seen.div} set dividers and ${seen.key} key dividers (want 2 and 2)`);
                    if (!/^2 sets · \d+ pupil pages? \+ \d+ answer key pages?$/.test(q.meta)) L(`PANEPRINT header says "${q.meta}"`);
                    if (!q.print) L('PANEPRINT no Print button in the pane header');
                    else if (q.print[0] < 44 || q.print[1] < 44) L(`PANEPRINT Print ${q.print.map(Math.round).join('x')} < 44`);
                    if (!/^3px solid/.test(q.ring)) L(`FOCUSRING the focused page list shows "${q.ring}", not the 3 px ring`);
                }
                if (SH) await page.screenshot({ path: SH + '/larger-sets2-1366.png' });
                await page.evaluate(() => { const st = document.getElementById('spSets'); window.closeSimplePrint && window.closeSimplePrint(); return !!st; });
                // put Sets back to 1 so later runs start from the default
                await page.evaluate(async () => { window.openSimplePrint([{ categoryId: 'addition', skillId: 'add_two_digit' }], { from: 'tray' }); const st = document.getElementById('spSets'); st.value = '1'; st.dispatchEvent(new Event('input', { bubbles: true })); st.dispatchEvent(new Event('change', { bubbles: true })); await new Promise((x) => setTimeout(x, 400)); window.closeSimplePrint(); });
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
