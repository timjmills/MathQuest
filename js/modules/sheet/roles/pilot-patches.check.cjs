// js/modules/sheet/roles/pilot-patches.check.cjs
// BACKTEST for two engine patches from the pilot lane (pilot-su-c D8 and engine class (c)):
//   P1  a grouped Mixed practice page names a PRESET skill's band by the preset's own skill
//       (its items carry q.presetId; q.skillId is the host), not the fallback 'Practice'
//   P2  fact rows of 5- and 6-digit facts: no fact is wider than its cell (bounding boxes) at
//       S / M / L; the page drops columns instead of shrinking the digits
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
    } finally { await app.close(); }
    console.log(`pilot-patches check: ${fails.length ? `FAIL (${fails.join(', ')})` : 'OK'}`);
    process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
