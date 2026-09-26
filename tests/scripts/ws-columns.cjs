// Column reach gate (owner ruling 2026-09-25): "almost all problem types can fit in at least two
// columns. More operational-style problems can fit into 3, and fast facts into 4 or more. Some
// problems will need to be one column - those keep one."
//
// For every registered cell template (one or two representative skills each) at sizes S / M / L,
// this builds an Independent sheet through window.buildSheet with the teacher's Columns set to the
// template's target and reads the column count the layout actually used (`fits.cols`, the line
// the print dialog shows). A template must reach its target:
//
//   fact                                   4   (fast facts; fact rows go to 5-10 on their own role)
//   stack, equation                        3   (operations)
//   everything else                        2
//
// ONE_COLUMN lists the templates allowed fewer, each with its reason. A template that reaches
// MORE than its allowlisted count is reported as stale (the allowlist only shrinks).
//
//   node tests/scripts/ws-columns.cjs                  # the gate
//   node tests/scripts/ws-columns.cjs --report-only    # print everything, exit 0
//   node tests/scripts/ws-columns.cjs --templates pv,coins --sizes S
'use strict';
const { open, listSkills } = require('../lib/ws-harness.cjs');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);

const TARGET = { fact: 4, stack: 3, equation: 3 };
const DEFAULT_TARGET = 2;

/** Templates allowed fewer columns than their target: {template: {cols, why}} (min cols, per size when an object). */
const ONE_COLUMN = {
    wordpic: { cols: 1, why: 'a K picture word problem is a full-width story with its pictures and work box (PT-WPR-1)' },
    'number-line': { cols: 1, why: 'a number line needs the full width for 1 cm ticks and labels (RP number-line minimums)' },
    'hop-line': { cols: 1, why: 'a hop line needs the full width for its arcs and tick labels' },
    timeline: { cols: 1, why: 'an elapsed-time line needs the full width for its hour ticks and hops' },
    // O6 lane AP2 round 3 (critic round 4): WORKSHEET_DESIGN_STANDARD.md section 11.2 gives the
    // ruler and the graph plot one column each, and RP-133 keeps a graph and its question in one cell.
    ruler: { cols: 1, why: 'a ruler prints at true scale only (RP-160): 6 inches is 158 mm, the whole live width (section 11.2: 1 column)' },
    'bar-graph': { cols: 1, why: 'the plot area is 80 x 60 / 90 x 70 / 100 x 80 mm (section 11.2) and its question sits beside it in the same cell (RP-133)' },
    pictograph: { cols: 1, why: 'a graph (section 11.2: 1 column): the table of up to 8 pictures a row, its key, and its question beside it in the same cell (RP-133)' },
    equation: { cols: { S: 3, M: 2, L: 2 }, why: 'at M / L an equation with two 2-digit numbers, a sign circle and a slot is wider than a 3-column cell at the size\'s digit height (DN-11: columns never shrink digits); 2 columns hold it' },
};

const SIZES = (arg('sizes', 'S,M,L')).split(',').filter(Boolean);
const ONLY = (arg('templates', '') || '').split(',').filter(Boolean);

(async () => {
    const app = await open({ seed: 7 });
    const page = app.page;
    const skills = await listSkills(page);
    // One or two representative skills per template.
    const byTpl = await page.evaluate(async (skills) => {
        const out = {};
        for (const s of skills) {
            let tpl = '';
            try {
                const q = window.generateQuestionFor({ category: s.categoryId, skill: s.skillId, seed: 11 });
                tpl = (q && q.cell && q.cell.template) || '';
            } catch (e) { tpl = ''; }
            if (!tpl || tpl === 'legacy') continue;
            (out[tpl] = out[tpl] || []);
            if (out[tpl].length < 2) out[tpl].push({ categoryId: s.categoryId, skillId: s.skillId });
        }
        return out;
    }, skills);
    const rows = [];
    const bad = [];
    const stale = [];
    for (const tpl of Object.keys(byTpl).sort()) {
        if (ONLY.length && !ONLY.includes(tpl)) continue;
        const want = TARGET[tpl] || DEFAULT_TARGET;
        const allow = ONE_COLUMN[tpl];
        for (const size of SIZES) {
            let best = 0;
            const seen = [];
            for (const sk of byTpl[tpl]) {
                const got = await page.evaluate(async ({ sk, size, want }) => {
                    try {
                        const r = await window.buildSheet({ role: 'independent', sections: [{ skills: [sk], count: 6, columns: want }], size, paper: 'A4', seed: 5, form: 'A', key: false });
                        const f = r.fits || {};
                        return { cols: Number(f.cols) || 0, note: String(f.note || '').slice(0, 120) };
                    } catch (e) { return { cols: 0, note: `error: ${String(e && e.message || e).slice(0, 100)}` }; }
                }, { sk, size, want });
                seen.push(`${sk.categoryId}:${sk.skillId}=${got.cols}`);
                best = Math.max(best, got.cols);
                if (got.cols >= want) break;
            }
            const min = allow ? (typeof allow.cols === 'object' ? allow.cols[size] : allow.cols) : want;
            const ok = best >= min;
            rows.push(`${ok ? 'ok  ' : 'FAIL'} ${tpl.padEnd(16)} ${size}  reaches ${best} (target ${want}${allow ? `, allowlisted ${min}: ${allow.why}` : ''})  [${seen.join(' ')}]`);
            if (!ok) bad.push(`${tpl} at ${size}: reaches ${best} column(s), needs ${min}`);
            if (allow && best > min) stale.push(`${tpl} at ${size}: allowlisted at ${min} but reaches ${best}`);
        }
    }
    await app.close();
    for (const r of rows) console.log(r);
    for (const s of stale) console.log(`note: stale allowlist entry - ${s}`);
    if (bad.length && !has('report-only')) {
        console.log(`ws-columns: FAIL (${bad.length})`);
        for (const b of bad) console.log(`  - ${b}`);
        process.exit(1);
    }
    console.log(`ws-columns: ${bad.length ? 'FAIL (report only)' : 'OK'} (${rows.length} template x size checks)`);
})().catch((e) => { console.error(e); console.log('ws-columns: FAIL (crashed)'); process.exit(1); });
