// js/modules/sheet/roles/pilot-patches.check.cjs
// BACKTEST for two engine patches from the pilot lane (pilot-su-c D8 and engine class (c)):
//   P1  a grouped Mixed practice page names a PRESET skill's band by the preset's own skill
//       (its items carry q.presetId; q.skillId is the host), not the fallback 'Practice'
//   P2  fact rows of 5- and 6-digit facts: no fact is wider than its cell (bounding boxes) at
//       S / M / L; the page drops columns instead of shrinking the digits
//   P3  CL-4b on fact rows (owner decision 2026-10-24 (3)): a 5-6-digit fact that regroups carries
//       data-ws-writeabove and is centred down its cell; a no-regroup or 2-digit fact does not
//       (backtest: FAIL 0/30 and 0/15 write-above on 7448778c). The write-above STACK centring is
//       ws-print-lint L-TOPSTART's job (it caught the 2.4 mm drop on add_100_regroup sections L)
//   node js/modules/sheet/roles/pilot-patches.check.cjs   ->  `pilot-patches check: OK` / `FAIL`
const path = require('path');
process.removeAllListeners('warning');
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const sk = (id) => { const [categoryId, skillId] = id.split(':'); return { categoryId, skillId, opts: {} }; };

(async () => {
    const app = await open({ seed: 12345 });
    const fails = [];
    try {
        // ---- P1
        for (const size of ['S', 'M', 'L']) {
            const req = { role: 'mixed-practice', arrangement: 'sections', size, key: true, seed: 4242,
                sections: [{ skills: [sk('addition:add_facts'), sk('multiplication:mult_2by1_column')] }] };
            const labels = await app.page.evaluate(async (req) => {
                const o = await window.buildSheet(req);
                const out = [];
                for (const pg of o.plan.pages || []) for (const s of pg.sections || []) if (s.kind === 'band') out.push(s.label);
                return out;
            }, req);
            const ok = labels.includes('Multiplying') && !labels.includes('Practice');
            console.log(`P1 ${size} band labels: ${JSON.stringify(labels)} ${ok ? 'ok' : 'FAIL'}`);
            if (!ok) fails.push(`P1 ${size}`);
        }
        // ---- P2
        for (const id of ['subtraction:sub_100k_regroup', 'subtraction:sub_1m_regroup', 'addition:add_100k_regroup']) {
            for (const size of ['S', 'M', 'L']) {
                const req = { role: 'fact-rows', size, key: true, seed: 7, sections: [{ skills: [sk(id)] }] };
                const r = await app.page.evaluate(async (req) => {
                    const o = await window.buildSheet(req);
                    const res = { over: 0, cells: 0, worst: 0, fits: o.plan && o.plan.meta && o.plan.meta.fits && o.plan.meta.fits[0] };
                    for (const html of [o.pupilHtml, o.keyHtml]) {
                        const host = document.createElement('div');
                        host.style.cssText = 'position:absolute;left:-12000px;top:0;width:230mm';
                        host.innerHTML = html;
                        document.body.appendChild(host);
                        for (const c of host.querySelectorAll('.ws-cell')) {
                            const f = c.querySelector('.ws-fact');
                            if (!f) continue;
                            res.cells++;
                            const cb = c.getBoundingClientRect();
                            let l = Infinity, rr = -Infinity;
                            for (const e of f.querySelectorAll('*')) { const b = e.getBoundingClientRect(); if (b.width) { l = Math.min(l, b.left); rr = Math.max(rr, b.right); } }
                            const fb = f.getBoundingClientRect();
                            l = Math.min(l, fb.left); rr = Math.max(rr, fb.right);
                            let t = Math.min(fb.top, ...[...f.querySelectorAll('*')].map((e) => e.getBoundingClientRect()).filter((b) => b.height).map((b) => b.top));
                            let bt = Math.max(fb.bottom, ...[...f.querySelectorAll('*')].map((e) => e.getBoundingClientRect()).filter((b) => b.height).map((b) => b.bottom));
                            const o2 = Math.max(cb.left - l, rr - cb.right, cb.top - t, bt - cb.bottom, 0);
                            if (o2 > 0.5) res.over++;
                            res.worst = Math.max(res.worst, o2 * 25.4 / 96);
                        }
                        host.remove();
                    }
                    return res;
                }, req);
                const ok = r.cells > 0 && r.over === 0;
                console.log(`P2 ${id} ${size}: ${r.cells} cells, ${r.over} overflow (worst ${r.worst.toFixed(2)} mm); ${r.fits ? `${r.fits.cols} cols x ${r.fits.rows}, ${r.fits.digitPt} pt` : ''} ${ok ? 'ok' : 'FAIL'}`);
                if (!ok) fails.push(`P2 ${id} ${size}`);
            }
        }
        // ---- P3
        const measure = async (req) => app.page.evaluate(async (req) => {
            const o = await window.buildSheet(req);
            const host = document.createElement('div');
            host.style.cssText = 'position:absolute;left:-12000px;top:0;width:230mm';
            host.innerHTML = o.pupilHtml;
            document.body.appendChild(host);
            const res = { cells: 0, wa: 0, worstOff: 0 };
            for (const c of host.querySelectorAll('.ws-cell[data-ws-cell]')) {
                const body = c.querySelector(':scope > .ws-fact, :scope > .ws-stack');
                if (!body) continue;
                res.cells++;
                if (!c.hasAttribute('data-ws-writeabove')) continue;
                res.wa++;
                const cr = c.getBoundingClientRect(), cs = getComputedStyle(c), br = body.getBoundingClientRect();
                const mid = (cr.top + parseFloat(cs.paddingTop) + cr.bottom - parseFloat(cs.paddingBottom)) / 2;
                res.worstOff = Math.max(res.worstOff, Math.abs((br.top + br.bottom) / 2 - mid) * 25.4 / 96);
            }
            host.remove();
            return res;
        }, req);
        for (const [id, want] of [['subtraction:sub_100k_regroup', 'all'], ['addition:add_100k_regroup', 'all'], ['subtraction:sub_100k_no_regroup', 'none'], ['subtraction:sub_100_regroup', 'none']]) {
            for (const size of ['S', 'L']) {
                const r = await measure({ role: 'fact-rows', size, key: true, seed: 7, sections: [{ skills: [sk(id)] }] });
                const ok = r.cells > 0 && (want === 'all' ? r.wa === r.cells && r.worstOff <= 0.5 : r.wa === 0);
                console.log(`P3 ${id} ${size}: ${r.wa}/${r.cells} write-above, worst ${r.worstOff.toFixed(2)} mm off centre (want ${want}) ${ok ? 'ok' : 'FAIL'}`);
                if (!ok) fails.push(`P3 ${id} ${size}`);
            }
        }
    } finally { await app.close(); }
    console.log(`pilot-patches check: ${fails.length ? `FAIL (${fails.join(', ')})` : 'OK'}`);
    process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
