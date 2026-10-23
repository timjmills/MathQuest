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
//              the pilot's skills, reported (WARN) on the rest - see KNOWN below
//   E4 dense   side pages (two columns): no grid with a cell whose empty vertical band is 30 % or
//              more could have held one more row (the page is at its densest layout that does not
//              overflow - E2 - or no cell is that empty): twins planned at their printed width
//   E5 top     side pages (two columns): every twin and problem starts at the TOP of its cell,
//              within its top padding band + 6 mm (owner ruling CL-4: never centred down a cell)
//
// Skills: every skill whose provider really implements workedSteps (sampled), plus the pilot's
// addition:add_10k_regroup, addition:add_1k_regroup and subtraction:sub_1k_regroup; S / M / L;
// anchors 'sections' and 'side'.
//
//   node js/modules/sheet/anchors.check.cjs [--max 40] [--only E1,E2,E3,E4,E5] [--skill c:s]
// Prints `anchors check: OK` / `FAIL` and exits non-zero on a failure. Needs the preinstalled
// Chromium (/opt/pw-browsers, through tests/lib/ws-harness.cjs); never installs one.
const path = require('path');

process.removeAllListeners('warning');
const ROOT = path.resolve(__dirname, '..', '..', '..');
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > -1 ? process.argv[i + 1] : d; };
const MAX = Math.max(1, Number(arg('max', 40)) || 40);
const ONLY = String(arg('only', 'E1,E2,E3,E4,E5')).split(',');
const ONE = arg('skill', '');
const PILOT = ['addition:add_10k_regroup', 'addition:add_1k_regroup', 'subtraction:sub_1k_regroup'];
const SIZES_ = ['S', 'M', 'L'];
const MODES = ['sections', 'side'];
// Known, reported as WARN, not gated (each needs a layout decision beyond these fixes):
//   E3 off the pilot's skills: a pair whose twin and problem together fill under 40 % of the row
//      cannot reach H13 in two columns however the width is shared (a four-column side layout,
//      [twin | problem | twin | problem], is the open question)
//   E2 a side pair taller than a page (a chart twin above its chart problem): side cannot hold it
const KNOWN_E2_SIDE = ['multiplication:mult_chart_easy'];
const MIN_PT = 8;          // TY-11 (tokens SIZES[*].minPt)
const BAND = 0.30;         // H13

// Measure one printed document (run in the browser page holding it).
const MEASURE = () => {
    const mm = 96 / 25.4;
    const out = { nums: [], over: [], band: [], cells: 0, dense: [], low: [] };
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
        if (worst > 0.3) out.over.push(`${worst.toFixed(1)}mm ${what}`);
    }
    // E3: the rows of a side page - every cell of a grid that holds a side twin.
    for (const grid of document.querySelectorAll('.ws-grid')) {
        if (!grid.querySelector('.mq-anchor-sidecell')) continue;
        const cells = [...grid.querySelectorAll('.ws-cell:not(.blankrun)')];
        // the [twin | problem] rows: a grid of two columns (a one-column pair stacks the twin above)
        if (new Set(cells.map((c) => Math.round(c.getBoundingClientRect().left))).size < 2) continue;
        const gr = grid.getBoundingClientRect();
        const R = new Set(cells.map((c) => Math.round(c.getBoundingClientRect().top))).size;
        let need = 0, sparse = 0;
        for (const cell of cells) {
            const r = cell.getBoundingClientRect();
            let lo = Infinity, hi = -Infinity, top = Infinity, bot = -Infinity;
            for (const el of cell.querySelectorAll('*')) {
                if (el.closest('.ws-letter,.ws-tab,.ws-label') || (el.parentElement && el.parentElement.closest('svg'))) continue;
                const cs = getComputedStyle(el);
                if (cs.position === 'absolute') continue;
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
            need = Math.max(need, (bot - top) + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom));
            if ((top - r.top) / r.height >= 0.3 || (r.bottom - bot) / r.height >= 0.3) sparse++;
            // E5 (owner ruling CL-4): content starts at the TOP of its cell - within the top
            // padding band (+ 6 mm: a stack's empty heads row, up to 6 mm at L, sits above its first ink)
            const lowMm = (top - r.top - parseFloat(cs.paddingTop)) / mm;
            if (lowMm > 6) out.low.push(`${cell.classList.contains('mq-anchor-sidecell') ? 'twin' : 'problem'} ${lowMm.toFixed(1)}mm under its top band`);
            const L = (lo - r.left) / r.width, R = (r.right - hi) / r.width;
            out.band.push({ side: cell.classList.contains('mq-anchor-sidecell') ? 'twin' : 'problem', L: Math.round(L * 1000) / 1000, R: Math.round(R * 1000) / 1000, wMm: Math.round(r.width / mm) });
        }
        // one more row would still hold every cell: the page is not at its densest
        const cellH = gr.height / R;
        out.dense.push({ rows: R, cellMm: Math.round(cellH / mm * 10) / 10, needMm: Math.round(need / mm * 10) / 10, sparse, gridMm: gr.height / mm, need: need / mm });
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
        skills = ONE ? [ONE] : PILOT.concat(rest.filter((_, i) => i % step === 0));
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
                        return { pupil: window.sheetDocument(o.pupilHtml, 'p'), key: window.sheetDocument(o.keyHtml, 'k'), n: (o.anchors && o.anchors.examples || []).length };
                    }, req);
                } catch (e) { console.log(`ERR ${key} ${mode} ${size}: ${e.message.split('\n')[0]}`); fail++; continue; }
                if (!r.n) {
                    // (subtraction:sub_1k_regroup has no workedSteps provider: it prints no anchor)
                    if (PILOT.includes(key) && mode === 'side' && size === 'S') console.log(`NOTE ${key}: no anchor (no workedSteps) - nothing to check`);
                    continue;
                }
                for (const [part, html] of [['pupil', r.pupil], ['key', r.key]]) {
                    await doc.setContent(html, { waitUntil: 'load', timeout: 60000 });
                    await doc.evaluate(() => document.fonts && document.fonts.ready);
                    const m = await doc.evaluate(MEASURE);
                    const tag = `${key} ${mode} ${size} ${part}`;
                    if (ONLY.includes('E1')) {
                        const small = m.nums.filter((p) => p < MIN_PT - 0.01);
                        if (small.length) { fail++; console.log(`FAIL E1 ${tag}: step numbers at ${[...new Set(small.map((p) => p.toFixed(2)))].join(', ')} pt (min ${MIN_PT})`); }
                    }
                    if (ONLY.includes('E2') && m.over.length) {
                        const known = mode === 'side' && KNOWN_E2_SIDE.includes(key);
                        if (known) warn++; else fail++;
                        console.log(`${known ? 'WARN' : 'FAIL'} E2 ${tag}: ${m.over.length}/${m.cells} anchor cells overflow (${m.over.slice(0, 3).join('; ')})`);
                    }
                    if (ONLY.includes('E4') && mode === 'side') {
                        // the rows are one section's: the tallest pair on ANY of its pages decides them
                        const needAll = Math.max(0, ...m.dense.map((d) => d.need));
                        const bad = m.dense.filter((d) => d.sparse > 0 && d.gridMm / (d.rows + 1) >= needAll);
                        if (bad.length) { fail++; console.log(`FAIL E4 ${tag}: a side grid could hold one more row (${bad.map((d) => `${d.rows} rows of ${d.cellMm} mm, content needs ${d.needMm} mm (the section ${needAll.toFixed(1)} mm), ${d.sparse} cells with a vertical band >= 30%`).join('; ')})`); }
                    }
                    if (ONLY.includes('E5') && mode === 'side' && m.low.length) { fail++; console.log(`FAIL E5 ${tag}: ${m.low.length} cells start below their top band (${[...new Set(m.low)].slice(0, 3).join('; ')})`); }
                    if (ONLY.includes('E3') && mode === 'side') {
                        const bad = m.band.filter((b) => b.L >= BAND || b.R >= BAND);
                        const gated = PILOT.includes(key);
                        if (bad.length) { if (gated) fail++; else warn++; console.log(`${gated ? 'FAIL' : 'WARN'} E3 ${tag}: ${bad.length}/${m.band.length} cells with an empty band >= 30% (${bad.slice(0, 3).map((b) => `${b.side} ${b.wMm}mm L${b.L} R${b.R}`).join('; ')})`); }
                    }
                }
            }
        }
        if (app.problems.length) console.log('page problems:', JSON.stringify(app.problems.filter((p) => p.type !== 'requestfailed').slice(0, 5)));
    } finally { await app.close(); }
    console.log(`anchors check: ${fail ? `FAIL (${fail})` : 'OK'}${warn ? ` (${warn} known WARN)` : ''}`);
    process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); console.log('anchors check: FAIL'); process.exit(1); });
