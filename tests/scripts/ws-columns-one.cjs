// tests/scripts/ws-columns-one.cjs - GATE (owner 2026-11-03: "Columns should go down to one"): an explicit Columns count
// of 1 or 2 on a fact-rows print is kept - every row of page 1 holds exactly that many facts - and no cell clips its
// drawing (scrollWidth > clientWidth). Covers the three fact-rows paths: vertical (+ - x), division forms, and division
// facts across. Before the fix the vertical path floored an explicit count at 5 and the across path ignored it
// (add_facts 1 -> 5 a row, div_facts 1 -> 3 a row).
//   node tests/scripts/ws-columns-one.cjs        prints `ws-columns-one: OK` / `FAIL`, exits 1 on a failure
'use strict';
const path = require('path');
const { open } = require(path.join(__dirname, '..', 'lib', 'ws-harness.cjs'));

const CASES = [
    ['addition', 'add_facts', 1], ['addition', 'add_facts', 2], ['multiplication', 'mult_facts', 1],
    ['division', 'div_facts', 1], ['division', 'div_facts', 2], ['subtraction', 'sub_facts', 1],
];
(async () => {
    const app = await open({ seed: 1 });
    const fails = [];
    try {
        for (const size of ['S', 'M', 'L']) for (const [categoryId, skillId, cols] of CASES) {
            const r = await app.page.evaluate(async ({ categoryId, skillId, cols, size }) => {
                const o = await window.buildSheet({ role: 'fact-rows', sections: [{ skills: [{ categoryId, skillId, opts: {} }], count: 12, columns: cols }], size, look: 'daily', seed: 5, key: false });
                const d = document.createElement('div');
                d.style.cssText = 'position:absolute;left:-9000px;top:0;width:230mm';
                d.innerHTML = o.pupilHtml;
                document.body.appendChild(d);
                try { await document.fonts.ready; } catch (e) { /* */ }
                const pg = d.querySelector('.ws-page');
                const cells = pg ? [...pg.querySelectorAll('.ws-grid > .ws-cell:not(.blankrun)')].filter((c) => c.querySelector(':scope > .ws-tab, :scope > .ws-letter') || c.textContent.trim()) : [];
                const rows = {};
                for (const c of cells) { const t = Math.round(c.getBoundingClientRect().top); rows[t] = (rows[t] || 0) + 1; }
                const clip = cells.filter((c) => c.scrollWidth > c.clientWidth + 1).length;
                d.remove();
                return { perRow: Object.values(rows), clip, n: cells.length };
            }, { categoryId, skillId, cols, size });
            const id = `${categoryId}:${skillId} Columns ${cols} at ${size}`;
            if (!r.n) { fails.push(`${id}: no fact cell measured`); continue; }
            const full = r.perRow.slice(0, -1);
            const bad = [...new Set((full.length ? full : r.perRow).filter((k) => k !== cols))];
            if (bad.length) fails.push(`${id}: rows hold ${[...new Set(r.perRow)].join(' / ')} facts (asked ${cols})`);
            if (r.clip) fails.push(`${id}: ${r.clip} cell(s) clip their drawing`);
        }
    } finally {
        await app.close();
    }
    for (const f of fails) console.log(`  FAIL ${f}`);
    console.log(`ws-columns-one: ${fails.length ? 'FAIL' : 'OK'} (${CASES.length * 3} prints; ${fails.length} failure(s))`);
    process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
