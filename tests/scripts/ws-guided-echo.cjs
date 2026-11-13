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
//   node tests/scripts/ws-guided-echo.cjs --skill composing:chart_to_120 [--seeds 8] [--sizes M,L] [--only GUIDED-MODEL-ECHO]
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
    const scoreRoles = list(arg('score-roles', 'guided,independent,more-practice,test,review,error-analysis'));
    const H = require('../lib/ws-harness.cjs');
    const app = await H.open({});
    let res;
    try {
        res = await app.page.evaluate(async ({ keys, N, sizes, only, scoreTpl, scoreRoles }) => {
            const on = (id) => !only || only.includes(id);
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
            for (const key of keys) {
                const [categoryId, skillId] = key.split(':');
                for (const size of sizes) for (let s = 1; s <= N; s++) {
                    for (const role of on('SCORE-SLOTS') ? scoreRoles : ['guided']) {
                        if (role !== 'guided' && !on('SCORE-SLOTS')) continue;
                        let r;
                        try { r = await window.buildSheet({ role, sections: [{ skills: [{ categoryId, skillId }] }], size, paper: 'A4', seed: s, key: false }); } catch (e) { out.push(`${key} ${role} ${size} seed ${s}: not composed (${String(e && e.message || e).slice(0, 120)})`); continue; }
                        pages++;
                        const meta = (r.plan && r.plan.meta) || {};
                        const cells = cellsOf(r.pupilHtml);
                        if (role === 'guided' && on('GUIDED-MODEL-ECHO') && cells.length > 1) {
                            const m = picture(cells[0]);
                            cells.slice(1).forEach((c, i) => { if (picture(c) === m) out.push(`GUIDED-MODEL-ECHO ${key} guided ${size} seed ${s}: try ${i + 1} shows the Model's own picture (${m.slice(0, 80)}) - the pupil can copy the Model's answer`); });
                        }
                        if (on('SCORE-SLOTS') && Number.isFinite(Number(meta.scoreOutOf))) {
                            const scored = role === 'guided' ? cells.slice(1) : cells;
                            if (!scored.length || !scored.every((c) => scoreTpl.includes(c.getAttribute('data-ws-cell')))) continue;
                            // (Error analysis: ONE judgement a cell - the shown work's squares are Sam's, not the pupil's)
                            const want = role === 'error-analysis' ? scored.length : scored.reduce((a, c) => a + Math.max(1, c.querySelectorAll('[data-ws-slot]').length), 0);
                            if (Number(meta.scoreOutOf) !== want) out.push(`SCORE-SLOTS ${key} ${role} ${size} seed ${s}: Score /${meta.scoreOutOf} but its ${scored.length} scored cell(s) hold ${want} answer places`);
                        }
                    }
                }
            }
            return { out, pages };
        }, { keys, N, sizes, only, scoreTpl, scoreRoles });
    } catch (e) { console.log(`${TOOL}: FAIL - error ${String(e && e.message || e).slice(0, 200)}`); await app.close(); process.exit(2); }
    await app.close();
    for (const f of res.out) console.log('  ' + f);
    const bad = res.out.filter((f) => /^(GUIDED-MODEL-ECHO|SCORE-SLOTS) /.test(f));
    const notComposed = res.out.length - bad.length;
    console.log(`${TOOL}: ${bad.length ? `FAIL - ${bad.length} finding(s)` : 'OK'} (${res.pages} pages, ${keys.join(', ')}, sizes ${sizes.join('/')}, ${N} seeds${notComposed ? `; ${notComposed} not composed` : ''})`);
    process.exit(bad.length ? 1 : 0);
})();
