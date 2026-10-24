// js/modules/sheet/anchors.check.cjs
// THE ANCHOR PAGE CHECK (lead pilot, anchors E1 / E2 / E3; IMPROVEMENT_PLAN 1.7: a defect becomes a
// machine check). Builds real Independent pages with step-by-step anchors (S5-S6) through
// buildSheet in Chromium, prints each as its own document (sheetDocument, the pupil page and the
// key) and holds every anchor to:
//
//   E1 type    every step number (`.mq-anchor-steps li>em`) prints at TY-11's minimum or larger
//              (the size token's minimum, tokens SIZES[...].minPt, 8 pt)
//   E2 grow    no anchor cell's content (any descendant's box) runs past its cell box (DN-10:
//              content never overflows; the cell grows to hold its steps)
//   E3 band    side pages (two columns): on every cell of a [twin | problem] row, the empty band left
//              or right of the content is under 30 % of the cell width (H13, L-DENSITY); gated on
//              the pilot's skills and (side) the SIX, reported (WARN) on the rest - see Known below
//   E4 dense   side pages (two columns): no grid with a cell whose empty vertical band is 30 % or
//              more could have held one more row (the page is at its densest layout that does not
//              overflow - E2 - or no cell is that empty): twins planned at their printed width
//   E5 top     REPORTED ONLY (WARN): CL-4b (top of the box; centred where the pupil writes above -
//              regroup boxes, a long-division bracket) is owned by the lead's kit-wide builder, so
//              this lane leaves cell vertical alignment as the kit has it. Side and sections pages:
//              a cell starts within its top pad + 3 mm, a write-above cell is centred within 2 mm.
//   E3 also runs on sections pages (critic anchors-r1 1)
//   E2 page    (critic anchors-r1 3) no cell of an anchor page runs past its page's body by
//              more than 0.5 mm (a pair taller than a page: the side layout falls back, or the
//              section prints without examples and says so); any E2 overflow over 0.5 mm FAILS
//   E6 key     (critic anchors-r1 4, S5 / L-ANCHOR) every glyph of every .mq-anchor has the same
//              computed font-weight and colour on the key as on the pupil page (a facsimile)
//   E7 wrap    (critic anchors-r1 5) no rendered line of a step list starts with "=" (Range line
//              boxes): "= 13." is never left at the start of a line
//   E9 twin    (owner ruling B) side pages: each twin has the same structure as the problem
//              beside it - a heads row (TTh/Th/H/T/O) and a boxed answer row only where the
//              pupil's problem has them
//   E10 grey   (owner ruling C, S5 / P-LC-9) side pages: every twin shows its newest marks in
//              the one grey (#949494), and every trace mark computes to that grey
//   E3 four    (owner ruling A) the six low-fill skills (SIX below) are gated on E3 at S / M / L:
//              their side pages take the four-column [twin | problem | twin | problem] layout
//   E8 off     (critic anchors-r1 2) a page whose skill prints no example (no workedSteps, or a
//              pair too tall for a page) is byte-identical to the same request with anchors 'off'
//
// Skills: every skill whose provider really implements workedSteps (sampled), plus the pilot's
// addition:add_10k_regroup, addition:add_1k_regroup and subtraction:sub_1k_regroup; S / M / L;
// anchors 'sections' and 'side'.
//
//   node js/modules/sheet/anchors.check.cjs [--max 40] [--only E1,...,E10] [--skill c:s] [--extra c:s,...]
// Prints `anchors check: OK` / `FAIL` and exits non-zero on a failure. Needs the preinstalled
// Chromium (/opt/pw-browsers, through tests/lib/ws-harness.cjs); never installs one.
const path = require('path');

process.removeAllListeners('warning');
const ROOT = path.resolve(__dirname, '..', '..', '..');
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > -1 ? process.argv[i + 1] : d; };
const MAX = Math.max(1, Number(arg('max', 40)) || 40);
const ONLY = String(arg('only', 'E1,E2,E3,E4,E5,E6,E7,E8,E9,E10')).split(',');
// Owner ruling A: the side pages of these six fill under half of a two-column row
const SIX = ['addition:add', 'addition:add_50_no_regroup', 'subtraction:sub_50_no_regroup', 'fractions:shade_fraction', 'measurement:money_count', 'placevalue:place_value_10x'];
const EXTRA = String(arg('extra', ['multiplication:mult_chart_easy'].concat(SIX).join(','))).split(',').filter(Boolean);
const ONE = arg('skill', '');
const PILOT = ['addition:add_10k_regroup', 'addition:add_1k_regroup', 'subtraction:sub_1k_regroup'];
const SIZES_ = ['S', 'M', 'L'];
const MODES = ['sections', 'side'];
// Known, reported as WARN, not gated: E3 off the pilot's and the SIX's skills (a sampled skill
//   whose row a four-column layout does not hold either, or a band narrower than the page).
// (E2 has no known list: a side pair taller than a page falls back - critic anchors-r1 3)
const OVER_MM = 0.5;       // E2: an overflow over 0.5 mm fails
const MIN_PT = 8;          // TY-11 (tokens SIZES[*].minPt)
const BAND = 0.30;         // H13

// Measure one printed document (run in the browser page holding it).
const MEASURE = () => {
    const mm = 96 / 25.4;
    const out = { nums: [], over: [], band: [], cells: 0, dense: [], low: [], page: [], ink: [], eq: [], twin: [], grey: [], cols4: 0 };
    for (const em of document.querySelectorAll('.mq-anchor-steps li>em')) {
        if (!em.textContent.trim()) continue;
        out.nums.push(parseFloat(getComputedStyle(em).fontSize) * 0.75);
    }
    for (const cell of document.querySelectorAll('.ws-cell.mq-anchorcell')) {
        out.cells++;
        const r = cell.getBoundingClientRect();
        let worst = 0;
        let what = '';
        for (const el of cell.querySelectorAll('*')) {
            const er = el.getBoundingClientRect();
            if (!er.width && !er.height) continue;
            if (getComputedStyle(el).position === 'absolute') continue;
            const d = Math.max(er.bottom - r.bottom, er.right - r.right, r.left - er.left) / mm;
            if (d > worst) { worst = d; what = `${el.tagName}.${String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className)}`; }
        }
        if (worst > 0.5) out.over.push(`${worst.toFixed(1)}mm ${what}`);
    }
    // E3: the rows of a side page - every cell of a grid that holds a side twin.
    for (const grid of document.querySelectorAll('.ws-grid')) {
        // SECTIONS pages (critic anchors-r1 1): every grid of a page that holds an anchor band -
        // the band and its blocks' problems - is held to E3 / E5 too
        const secPage = !!(grid.closest('.ws-page') && grid.closest('.ws-page').querySelector('.mq-anchorgrid'));
        if (!grid.querySelector('.mq-anchor-sidecell') && !secPage) continue;
        const cells = [...grid.querySelectorAll('.ws-cell:not(.blankrun)')];
        // the [twin | problem] rows: a grid of two columns (a one-column pair stacks the twin above)
        if (!secPage && new Set(cells.map((c) => Math.round(c.getBoundingClientRect().left))).size < 2) continue;
        const gr = grid.getBoundingClientRect();
        const R = new Set(cells.map((c) => Math.round(c.getBoundingClientRect().top))).size;
        let need = 0, sparse = 0;
        for (const cell of cells) {
            const r = cell.getBoundingClientRect();
            let lo = Infinity, hi = -Infinity, top = Infinity, bot = -Infinity;
            let boxBot = -Infinity;
            for (const el of cell.querySelectorAll('*')) {
                if (el.closest('.ws-letter,.ws-tab,.ws-label') || (el.parentElement && el.parentElement.closest('svg'))) continue;
                const cs = getComputedStyle(el);
                if (cs.position === 'absolute') continue;
                // (E4: the content's height runs to its lowest BOX - a twin's Say line closes its box
                // under its last ink; E2 holds that box to the cell)
                { const eb = el.getBoundingClientRect(); if (eb.height) boxBot = Math.max(boxBot, eb.bottom); }
                const leaf = !el.children.length || el.tagName.toLowerCase() === 'svg';
                if (!leaf) continue;
                const er = el.getBoundingClientRect();
                if (!er.width || !er.height) continue;
                lo = Math.min(lo, er.left); hi = Math.max(hi, er.right);
                top = Math.min(top, er.top); bot = Math.max(bot, er.bottom);
            }
            if (hi <= lo) continue;
            // E4: the height the cell's content needs (its own padding, the Model tab's clearance,
            // included) and its empty vertical bands
            const cs = getComputedStyle(cell);
            need = Math.max(need, (Math.max(bot, boxBot) - top) + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom));
            if ((top - r.top) / r.height >= 0.3 || (r.bottom - bot) / r.height >= 0.3) sparse++;
            // E5 (owner ruling CL-4b): a cell starts its content within its top pad + 3 mm, except a
            // cell whose content has the pupil write ABOVE the problem (a stack's regroup boxes, a
            // long-division bracket), which is centred down its padding box within 2 mm
            const lowMm = (top - r.top - parseFloat(cs.paddingTop)) / mm;
            const kind = cell.classList.contains('mq-anchor-sidecell') ? 'twin' : cell.classList.contains('mq-anchorcell') ? 'band' : 'problem';
            const above = cell.matches('.mqt--division') || !!cell.querySelector('[class^="rg"][data-ws-seg],[class*=" rg"][data-ws-seg]');
            // (centred: the cell's in-flow content box - an open answer zone below the rule has no ink)
            let bt = Infinity, bb = -Infinity;
            for (const ch of cell.children) {
                if (ch.matches('.ws-letter,.ws-tab,.ws-label') || getComputedStyle(ch).position === 'absolute') continue;
                const cr = ch.getBoundingClientRect();
                if (!cr.height) continue;
                bt = Math.min(bt, cr.top); bb = Math.max(bb, cr.bottom);
            }
            const offMm = bb > bt ? ((bt - r.top - parseFloat(cs.paddingTop)) - (r.bottom - parseFloat(cs.paddingBottom) - bb)) / 2 / mm : 0;
            if (above ? Math.abs(offMm) > 2 : lowMm > 3) out.low.push(above ? `${kind} (writes above) ${offMm.toFixed(1)}mm off centre` : `${kind} ${lowMm.toFixed(1)}mm under its top pad`);
            const L = (lo - r.left) / r.width, R = (r.right - hi) / r.width;
            out.band.push({ side: kind, L: Math.round(L * 1000) / 1000, R: Math.round(R * 1000) / 1000, wMm: Math.round(r.width / mm) });
        }
        // one more row would still hold every cell: the page is not at its densest
        const cellH = gr.height / R;
        if (!secPage || grid.querySelector('.mq-anchor-sidecell')) out.dense.push({ rows: R, cellMm: Math.round(cellH / mm * 10) / 10, needMm: Math.round(need / mm * 10) / 10, sparse, gridMm: gr.height / mm, need: need / mm });
    }
    // E9: a twin and the problem after it share their structure (heads row, boxed answer row)
    const sig = (c) => `heads ${c.querySelector('.head') ? 'yes' : 'no'}, answer boxes ${c.querySelector('span[class^="ab"],span[class*=" ab"]') ? 'yes' : 'no'}`;
    for (const tw of document.querySelectorAll('.ws-cell.mq-anchor-sidecell')) {
        const pr = tw.nextElementSibling;
        if (!pr || !pr.classList.contains('ws-cell') || pr.classList.contains('blankrun')) continue;
        if (sig(tw) !== sig(pr)) out.twin.push(`twin ${sig(tw)} / problem ${sig(pr)}`);
    }
    // E10: every side twin shows grey newest marks, and every trace mark is the one grey
    for (const a of document.querySelectorAll('.mq-anchor-side')) {
        let grey = 0, bad = 0;
        for (const el of a.querySelectorAll('*')) {
            if (el.children.length || !el.textContent.trim() || el.closest('.mq-anchor-steps,.mq-anchor-say')) continue;
            const c = getComputedStyle(el).color;
            if (c === 'rgb(148, 148, 148)') grey++;
            else if (el.closest('[data-ws-ink="trace"]')) bad++;
        }
        if (!grey || bad) out.grey.push(`${grey} grey glyphs, ${bad} trace glyphs not grey`);
    }
    for (const g of document.querySelectorAll('.ws-grid')) if (g.querySelector('.mq-anchor-sidecell') && getComputedStyle(g).gridTemplateColumns.trim().split(/\s+/).length === 4) out.cols4++;
    // E2 page: no cell of the page runs past its page's body (a pair taller than a page)
    for (const pg of document.querySelectorAll('.ws-page')) {
        const body = pg.querySelector('.ws-body') || pg;
        const b = body.getBoundingClientRect();
        for (const cell of pg.querySelectorAll('.ws-cell')) {
            const d = (cell.getBoundingClientRect().bottom - b.bottom) / mm;
            if (d > 0.5) { out.page.push(`${d.toFixed(1)}mm past the body`); break; }
        }
    }
    // E6: every glyph of every anchor, in order: weight and colour
    for (const el of document.querySelectorAll('.mq-anchor *')) {
        if (el.children.length || !el.textContent.trim()) continue;
        const cs = getComputedStyle(el);
        out.ink.push(`${el.textContent.trim().slice(0, 8)}|${cs.fontWeight}|${cs.color}`);
    }
    // E7: the line boxes of every step line; a line after the first may not start with "="
    for (const li of document.querySelectorAll('.mq-anchor-steps li')) {
        const span = li.querySelector('span');
        if (!span) continue;
        if (/^[\s\u00a0]*=/.test(span.textContent)) out.eq.push(span.textContent.trim().slice(0, 60));
        const walker = document.createTreeWalker(span, NodeFilter.SHOW_TEXT);
        let top = null, fresh = false;
        for (let t = walker.nextNode(); t; t = walker.nextNode()) {
            for (let i = 0; i < t.data.length; i++) {
                const rg = document.createRange();
                rg.setStart(t, i); rg.setEnd(t, i + 1);
                const rr = rg.getClientRects()[0];
                if (!rr || !rr.height) continue;
                if (top === null) top = rr.top;
                else if (rr.top > top + rr.height * 0.5) { top = rr.top; fresh = true; }
                const ch = t.data[i];
                if (fresh && /\S/.test(ch) && ch !== '\u00a0') {
                    if (ch === '=') out.eq.push(span.textContent.replace(/\u00a0/g, ' ').trim().slice(0, 60));
                    fresh = false;
                }
            }
        }
    }
    return out;
};

(async () => {
    const app = await open({ seed: 12345 });
    let fail = 0;
    let warn = 0;
    try {
        let skills = await app.page.evaluate(async () => {
            const k = await import('/js/modules/sheet/index.js');
            return k.listProviders().filter((key) => { const [c, s] = key.split(':'); const p = k.getProvider(c, s); return s && p.real.includes('workedSteps'); });
        });
        // A stable sample: the pilot's skills first, then every n-th skill with workedSteps.
        const rest = skills.filter((s) => !PILOT.includes(s));
        const step = Math.max(1, Math.ceil(rest.length / MAX));
        skills = ONE ? ONE.split(',') : PILOT.concat(EXTRA.filter((s) => !PILOT.includes(s)), rest.filter((_, i) => i % step === 0 && !EXTRA.includes(_)));
        console.log(`anchors check: ${skills.length} skills x ${SIZES_.length} sizes x ${MODES.length} modes`);
        const doc = await app.browser.newPage();
        for (const key of skills) {
            const [categoryId, skillId] = key.split(':');
            for (const mode of MODES) for (const size of SIZES_) {
                const req = { role: 'independent', anchors: mode, size, look: 'daily', seed: 7, sections: [{ skills: [{ categoryId, skillId, opts: {} }], count: 6, pages: 1, columns: mode === 'side' ? 2 : 0 }] };
                let r;
                try {
                    r = await app.page.evaluate(async (req) => {
                        const o = await window.buildSheet(req);
                        const n = (o.anchors && o.anchors.examples || []).length;
                        // E8: a page with no example is the anchors-'off' page, byte for byte
                        let same = null;
                        if (!n) { const f = await window.buildSheet(Object.assign({}, req, { anchors: 'off' })); same = f.pupilHtml === o.pupilHtml && f.keyHtml === o.keyHtml; }
                        return { pupil: window.sheetDocument(o.pupilHtml, 'p'), key: window.sheetDocument(o.keyHtml, 'k'), n, same, notes: (o.notes || []).join(' ') };
                    }, req);
                } catch (e) { console.log(`ERR ${key} ${mode} ${size}: ${e.message.split('\n')[0]}`); fail++; continue; }
                if (!r.n) {
                    // (subtraction:sub_1k_regroup has no workedSteps provider: it prints no anchor)
                    if (ONLY.includes('E8') && !r.same) { fail++; console.log(`FAIL E8 ${key} ${mode} ${size}: no example, but the page differs from the anchors-off page`); }
                    else if (PILOT.includes(key) || EXTRA.includes(key)) console.log(`NOTE ${key} ${mode} ${size}: no example; page = anchors-off page (${r.notes.slice(-160)})`);
                    continue;
                }
                const inks = {};
                for (const [part, html] of [['pupil', r.pupil], ['key', r.key]]) {
                    await doc.setContent(html, { waitUntil: 'load', timeout: 60000 });
                    await doc.evaluate(() => document.fonts && document.fonts.ready);
                    const m = await doc.evaluate(MEASURE);
                    const tag = `${key} ${mode} ${size} ${part}`;
                    if (ONLY.includes('E1')) {
                        const small = m.nums.filter((p) => p < MIN_PT - 0.01);
                        if (small.length) { fail++; console.log(`FAIL E1 ${tag}: step numbers at ${[...new Set(small.map((p) => p.toFixed(2)))].join(', ')} pt (min ${MIN_PT})`); }
                    }
                    if (ONLY.includes('E2') && m.over.length) { fail++; console.log(`FAIL E2 ${tag}: ${m.over.length}/${m.cells} anchor cells overflow by more than ${OVER_MM} mm (${m.over.slice(0, 3).join('; ')})`); }
                    if (ONLY.includes('E2') && m.page.length) { fail++; console.log(`FAIL E2 ${tag}: ${m.page.length} pages with a cell past the page body (${m.page.slice(0, 3).join('; ')})`); }
                    inks[part] = m.ink;
                    if (ONLY.includes('E9') && mode === 'side' && m.twin.length) { fail++; console.log(`FAIL E9 ${tag}: ${m.twin.length} twins differ from their problem (${[...new Set(m.twin)].slice(0, 2).join('; ')})`); }
                    if (ONLY.includes('E10') && mode === 'side' && m.grey.length) { fail++; console.log(`FAIL E10 ${tag}: ${m.grey.length} twins without their grey newest marks (${[...new Set(m.grey)].slice(0, 2).join('; ')})`); }
                    if (mode === 'side' && SIX.includes(key) && part === 'pupil') console.log(`INFO ${tag}: ${m.cols4} four-column side grids`);
                    if (ONLY.includes('E7') && m.eq.length) { fail++; console.log(`FAIL E7 ${tag}: ${m.eq.length} step lines wrap before "=" (${[...new Set(m.eq)].slice(0, 2).join(' | ')})`); }
                    if (ONLY.includes('E4') && mode === 'side') {
                        // the rows are one section's: the tallest pair on ANY of its pages decides them
                        const needAll = Math.max(0, ...m.dense.map((d) => d.need));
                        const bad = m.dense.filter((d) => d.sparse > 0 && d.gridMm / (d.rows + 1) >= needAll);
                        if (bad.length) { fail++; console.log(`FAIL E4 ${tag}: a side grid could hold one more row (${bad.map((d) => `${d.rows} rows of ${d.cellMm} mm, content needs ${d.needMm} mm (the section ${needAll.toFixed(1)} mm), ${d.sparse} cells with a vertical band >= 30%`).join('; ')})`); }
                    }
                    // (E5 is reported, never gated here: CL-4b belongs to the lead's kit-wide builder)
                    if (ONLY.includes('E5') && m.low.length) { warn++; console.log(`WARN E5 ${tag}: ${m.low.length} cells break CL-4b (${[...new Set(m.low)].slice(0, 3).join('; ')})`); }
                    if (ONLY.includes('E3')) {
                        const bad = m.band.filter((b) => b.L >= BAND || b.R >= BAND);
                        const gated = PILOT.includes(key) || (mode === 'side' && SIX.includes(key));
                        if (bad.length) { if (gated) fail++; else warn++; console.log(`${gated ? 'FAIL' : 'WARN'} E3 ${tag}: ${bad.length}/${m.band.length} cells with an empty band >= 30% (${bad.slice(0, 3).map((b) => `${b.side} ${b.wMm}mm L${b.L} R${b.R}`).join('; ')})`); }
                    }
                }
                if (ONLY.includes('E6')) {
                    const a = inks.pupil || [], b = inks.key || [];
                    const diff = a.map((x, i) => (x !== b[i] ? `${x} -> ${b[i]}` : '')).filter(Boolean);
                    if (a.length !== b.length || diff.length) { fail++; console.log(`FAIL E6 ${key} ${mode} ${size}: ${diff.length || 'n'}/${a.length} anchor glyphs differ on the key (${diff.slice(0, 3).join('; ') || `${a.length} vs ${b.length} glyphs`})`); }
                }
            }
        }
        if (app.problems.length) console.log('page problems:', JSON.stringify(app.problems.filter((p) => p.type !== 'requestfailed').slice(0, 5)));
    } finally { await app.close(); }
    console.log(`anchors check: ${fail ? `FAIL (${fail})` : 'OK'}${warn ? ` (${warn} known WARN)` : ''}`);
    process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); console.log('anchors check: FAIL'); process.exit(1); });
